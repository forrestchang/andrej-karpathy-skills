#!/usr/bin/env node
// poll.js — the Bound Book package poller.
//
//   node poll.js login <usps|ups|fedex>   one-time interactive sign-in
//   node poll.js poll [options]           fetch status, write a snapshot
//
// The snapshot is a file you import in the app (Packages → Import snapshot).
// Same round-trip as backup/restore: the browser app stays a double-click
// page with no server and no secrets in it.
//
// Status always comes from the official carrier APIs. The portals are used
// only to DISCOVER tracking numbers you never registered.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const P = require('../packages.js');
const carriers = require('./carriers.js');
const portals = require('./portals.js');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const DEFAULT_OUT = path.join(__dirname, 'package-snapshot.json');

const USAGE = `
Bound Book package poller

  node poll.js login <usps|ups|fedex>
      Open a browser, sign in yourself, save the session. Do this once per
      carrier (and again whenever a session expires). No password is stored.

  node poll.js poll [options]
      --list <file>     tracking list exported from the app (Packages screen)
      --numbers a,b,c   extra tracking numbers, comma separated
      --out <file>      snapshot to write (default: package-snapshot.json)
      --no-portals      skip portal discovery, use the carrier APIs only
      --headed          run portal discovery in a visible browser
      --dump            save portal page HTML + screenshot (for fixing selectors)

  node poll.js --help
`;

function parseArgs(argv) {
  const args = { command: 'poll', carrier: '', list: '', numbers: [], out: DEFAULT_OUT, portals: true, headed: false, dump: false };
  const rest = argv.slice(2);
  if (rest[0] && !rest[0].startsWith('--')) {
    args.command = rest.shift();
    if (args.command === 'login') args.carrier = rest.shift() || '';
  }
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--list') args.list = rest[++i];
    else if (a === '--numbers') args.numbers = String(rest[++i] || '').split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--out') args.out = rest[++i];
    else if (a === '--no-portals') args.portals = false;
    else if (a === '--headed') args.headed = true;
    else if (a === '--dump') args.dump = true;
    else if (a === '--help' || a === '-h') args.command = 'help';
    else throw new Error(`Unknown option: ${a}`);
  }
  return args;
}

// config.json holds carrier API client ids/secrets. Env vars win, so you can
// keep secrets out of the file entirely if you prefer.
function loadConfig() {
  let file = {};
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      file = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      throw new Error(`config.json is not valid JSON: ${e.message}`);
    }
  }
  const config = { portals: file.portals || {} };
  for (const { key } of P.CARRIERS) {
    const env = key.toUpperCase();
    config[key] = {
      clientId: process.env[`BB_${env}_CLIENT_ID`] || (file[key] && file[key].clientId) || '',
      clientSecret: process.env[`BB_${env}_CLIENT_SECRET`] || (file[key] && file[key].clientSecret) || ''
    };
  }
  return config;
}

// Registered packages come from the app's exported tracking list.
function readList(file) {
  if (!file) return [];
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = Array.isArray(data) ? data : (data.packages || []);
  return rows
    .map(r => ({
      trackingNumber: P.normalizeTracking(r.trackingNumber),
      carrier: r.carrier || P.detectCarrier(r.trackingNumber)
    }))
    .filter(r => r.trackingNumber);
}

async function runDiscovery(config, known, opts) {
  const enabled = P.CARRIERS
    .map(c => c.key)
    .filter(k => config.portals[k] !== false && portals.hasSession(k));

  const skipped = P.CARRIERS.map(c => c.key).filter(k => config.portals[k] !== false && !portals.hasSession(k));
  for (const k of skipped) {
    console.log(`  ${portals.PORTALS[k].label}: no saved session — run 'node poll.js login ${k}'`);
  }

  const discovered = new Map();
  for (const key of enabled) {
    process.stdout.write(`  ${portals.PORTALS[key].label}: `);
    const res = await portals.discover(key, opts);
    if (res.error) { console.log(res.error); continue; }

    let fresh = 0;
    for (const hit of res.found) {
      const carrier = P.detectCarrier(hit.trackingNumber);
      // Dashboards are full of order numbers and phone numbers. If it does not
      // look like a real tracking number, it is not one.
      if (!carrier) continue;
      if (known.has(hit.trackingNumber) || discovered.has(hit.trackingNumber)) continue;
      discovered.set(hit.trackingNumber, { trackingNumber: hit.trackingNumber, carrier, context: hit.context });
      fresh++;
    }
    console.log(`${res.found.length} number(s) on the page, ${fresh} new`);
  }
  return [...discovered.values()];
}

function statusOf(r) {
  const last = r.scans && r.scans.length ? r.scans[r.scans.length - 1] : null;
  return P.normalizeStatus(
    r.carrier,
    r.latestCode || (last && last.code) || '',
    r.summary || (last && last.description) || ''
  );
}

async function poll(args) {
  const config = loadConfig();
  const registered = readList(args.list).concat(
    args.numbers.map(tn => ({ trackingNumber: P.normalizeTracking(tn), carrier: P.detectCarrier(tn) }))
  );
  const known = new Set(registered.map(r => r.trackingNumber));
  console.log(`Registered packages to check: ${known.size}`);

  let discovered = [];
  if (args.portals) {
    console.log('Portal discovery:');
    discovered = await runDiscovery(config, known, { headed: args.headed, dump: args.dump });
  }

  const all = registered.concat(discovered.map(d => ({ trackingNumber: d.trackingNumber, carrier: d.carrier })));
  if (!all.length) {
    console.log('Nothing to track. Export a tracking list from the app, or pass --numbers.');
    return;
  }

  console.log(`Querying carrier APIs for ${all.length} package(s)…`);
  const results = await carriers.trackAll(all, config);

  const contexts = new Map(discovered.map(d => [d.trackingNumber, d.context]));
  const packages = [];
  let errors = 0;
  for (const r of results) {
    const wasDiscovered = contexts.has(r.trackingNumber);
    if (r.error) {
      // Report it, but never write it to the snapshot: a discovered number
      // that the carrier rejects was probably an order number the regex
      // mistook for a tracking number, and junk should not reach the registry.
      errors++;
      console.log(`  ! ${r.trackingNumber}: ${r.error}`);
      continue;
    }
    const row = {
      trackingNumber: r.trackingNumber,
      carrier: r.carrier,
      status: statusOf(r),
      scans: r.scans,
      source: wasDiscovered ? 'portal' : 'api'
    };
    if (wasDiscovered) {
      row.discovered = { description: contexts.get(r.trackingNumber) || '' };
    }
    packages.push(row);
  }

  const snapshot = {
    app: 'bound-book-tracker',
    version: 1,
    polledAt: new Date().toISOString(),
    packages
  };
  fs.writeFileSync(args.out, JSON.stringify(snapshot, null, 2));

  const delivered = packages.filter(p => p.status === P.STATUS.DELIVERED).length;
  console.log(`\nWrote ${packages.length} package(s) to ${path.relative(process.cwd(), args.out)}`);
  console.log(`  ${delivered} delivered, ${packages.length - delivered} still moving, ${errors} error(s)`);
  console.log('Import it in the app: Packages → Import snapshot.');
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (e) {
    console.error(e.message);
    console.error(USAGE);
    process.exit(1);
  }

  if (args.command === 'help') { console.log(USAGE); return; }

  if (args.command === 'login') {
    if (!portals.PORTALS[args.carrier]) {
      console.error(`Usage: node poll.js login <${Object.keys(portals.PORTALS).join('|')}>`);
      process.exit(1);
    }
    await portals.login(args.carrier);
    return;
  }

  if (args.command !== 'poll') {
    console.error(`Unknown command: ${args.command}`);
    console.error(USAGE);
    process.exit(1);
  }
  await poll(args);
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\n${err.message}`);
    process.exit(1);
  });
}

module.exports = { statusOf, parseArgs, loadConfig };

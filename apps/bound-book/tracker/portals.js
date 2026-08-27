// portals.js — discovery only. Signs in to Informed Delivery / UPS My Choice /
// FedEx Delivery Manager and pulls the TRACKING NUMBERS visible on your
// dashboard. It does not read status from these pages: status comes from the
// official APIs (carriers.js), which are stable in a way portal HTML is not.
//
// Why numbers-only: the one thing that survives a portal redesign is the shape
// of a tracking number. Scraping status out of a carrier's DOM breaks silently
// the next time they ship a new dashboard; scraping numbers degrades to "found
// none" instead, which is visible.
//
// Credentials: none are stored. `login` opens a real browser window, you sign
// in yourself (MFA, captcha, whatever the carrier asks), and only the resulting
// session cookies are saved to state/<carrier>.json — gitignored, and on your
// machine only.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const STATE_DIR = path.join(__dirname, 'state');

const PORTALS = {
  usps: {
    label: 'USPS Informed Delivery',
    loginUrl: 'https://reg.usps.com/entreg/LoginAction_input',
    dashboardUrl: 'https://informeddelivery.usps.com/box/pages/secure/DashboardAction_input.action',
    loggedOut: /reg\.usps\.com|LoginAction|\/login/i
  },
  ups: {
    label: 'UPS My Choice',
    loginUrl: 'https://www.ups.com/lasso/login',
    dashboardUrl: 'https://www.ups.com/mychoice/dashboard',
    loggedOut: /lasso\/login|\/login|signin/i
  },
  fedex: {
    label: 'FedEx Delivery Manager',
    loginUrl: 'https://www.fedex.com/secure-login/en-us/',
    dashboardUrl: 'https://www.fedex.com/fedextrack/dashboard',
    loggedOut: /secure-login|\/login|signin/i
  }
};

function statePath(carrier) {
  return path.join(STATE_DIR, `${carrier}.json`);
}

function hasSession(carrier) {
  return fs.existsSync(statePath(carrier));
}

function loadPlaywright() {
  try {
    return require('playwright');
  } catch (e) {
    throw new Error(
      'Portal discovery needs Playwright. Install it in apps/bound-book/tracker:\n' +
      '  npm install playwright && npx playwright install chromium\n' +
      'Or run with --no-portals to use the carrier APIs only.'
    );
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, a => { rl.close(); resolve(a); }));
}

// Interactive one-time sign-in. Opens a visible browser, waits for you to
// finish (including MFA), then saves the session.
async function login(carrier) {
  const portal = PORTALS[carrier];
  if (!portal) throw new Error(`Unknown portal: ${carrier}`);
  const { chromium } = loadPlaywright();

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(portal.loginUrl, { waitUntil: 'domcontentloaded' });

  console.log(`\nA browser window is open at ${portal.label}.`);
  console.log('Sign in there as you normally would — password, MFA, all of it.');
  console.log('Your password is never read by this tool; only the session cookies are saved.\n');
  await ask('Press Enter here once you are signed in and looking at your dashboard… ');

  fs.mkdirSync(STATE_DIR, { recursive: true });
  await context.storageState({ path: statePath(carrier) });
  await browser.close();
  console.log(`Saved ${portal.label} session to ${path.relative(process.cwd(), statePath(carrier))}`);
}

// Pull tracking numbers off a portal dashboard using a saved session.
async function discover(carrier, opts = {}) {
  const portal = PORTALS[carrier];
  if (!portal) throw new Error(`Unknown portal: ${carrier}`);
  if (!hasSession(carrier)) {
    return { carrier, found: [], error: `No saved session. Run: node poll.js login ${carrier}` };
  }
  const { chromium } = loadPlaywright();

  const browser = await chromium.launch({ headless: !opts.headed });
  try {
    const context = await browser.newContext({ storageState: statePath(carrier) });
    const page = await context.newPage();
    await page.goto(portal.dashboardUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

    if (portal.loggedOut.test(page.url())) {
      return { carrier, found: [], error: `Session expired. Run: node poll.js login ${carrier}` };
    }

    const found = await page.evaluate(scrapeTrackingNumbers);

    if (opts.dump) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
      const html = path.join(STATE_DIR, `${carrier}-dump.html`);
      fs.writeFileSync(html, await page.content());
      await page.screenshot({ path: path.join(STATE_DIR, `${carrier}-dump.png`), fullPage: true });
      console.log(`  dumped page to ${path.relative(process.cwd(), html)} (+ .png)`);
    }
    return { carrier, found, error: null };
  } catch (err) {
    return { carrier, found: [], error: err.message };
  } finally {
    await browser.close();
  }
}

// Runs inside the page. Self-contained by necessity — no closure over Node.
// Walks text nodes for tracking-number-shaped strings and grabs a little
// surrounding text as a human-readable description.
function scrapeTrackingNumbers() {
  const results = [];
  const seen = new Set();
  const LENGTHS = [12, 15, 20, 21, 22];

  function push(raw, node) {
    const tn = String(raw).replace(/[\s-]/g, '').toUpperCase();
    if (seen.has(tn)) return;
    seen.add(tn);
    let el = node.parentElement;
    let context = '';
    for (let i = 0; i < 4 && el; i++) {
      const t = (el.innerText || '').trim().replace(/\s+/g, ' ');
      if (t.length > context.length) context = t;
      if (context.length > 40) break;
      el = el.parentElement;
    }
    results.push({ trackingNumber: tn, context: context.slice(0, 160) });
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue || '';
    if (!/\d/.test(text)) continue;
    let m;
    const alpha = /\b1Z[0-9A-Z]{16}\b|\b[A-Z]{2}\d{9}US\b/g;
    while ((m = alpha.exec(text))) push(m[0], node);
    const digits = /\d[\d\s-]{10,24}\d/g;
    while ((m = digits.exec(text))) {
      const bare = m[0].replace(/[\s-]/g, '');
      if (LENGTHS.indexOf(bare.length) !== -1) push(bare, node);
    }
  }
  return results;
}

module.exports = { PORTALS, login, discover, hasSession, statePath };

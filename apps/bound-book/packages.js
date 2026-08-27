// packages.js — inbound package tracking. Pure, storage-agnostic logic for the
// package registry: carrier detection, status normalization, staleness checks,
// and reconciliation against the A&D ledger.
//
// Deliberately NOT part of the hash-chained event log (integrity.js): package
// data is third-party logistics information, not a regulated A&D field, and it
// does not belong in the legal system of record. The only bridge into that
// record is an ordinary `acquire` event, prefilled from a package — see
// needsLogging() and linkToEntry().
//
// Same conventions as core.js: no Date/random inside pure functions — callers
// pass ids and timestamps so behavior is deterministic and testable.
// Runs in the browser (window.Packages) and Node (require) for tests.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Packages = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CARRIERS = [
    { key: 'usps', label: 'USPS' },
    { key: 'ups', label: 'UPS' },
    { key: 'fedex', label: 'FedEx' }
  ];

  // Normalized status vocabulary. Carrier codes map onto these so the UI and
  // the staleness checks never care which carrier a package came from.
  var STATUS = {
    EXPECTED: 'expected',
    IN_TRANSIT: 'in_transit',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    EXCEPTION: 'exception',
    RETURNED: 'returned',
    UNKNOWN: 'unknown'
  };

  var STATUS_LABELS = {
    expected: 'Expected',
    in_transit: 'In transit',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    exception: 'Exception',
    returned: 'Returned',
    unknown: 'Unknown'
  };

  function isKnownCarrier(key) {
    return CARRIERS.some(function (c) { return c.key === key; });
  }

  function carrierLabel(key) {
    for (var i = 0; i < CARRIERS.length; i++) {
      if (CARRIERS[i].key === key) return CARRIERS[i].label;
    }
    return key || 'Unknown carrier';
  }

  function normalizeTracking(tn) {
    return String(tn == null ? '' : tn).replace(/\s+/g, '').toUpperCase();
  }

  // Heuristic carrier detection from the number's shape. The user can always
  // override it on the form — this only saves typing.
  function detectCarrier(tn) {
    var s = normalizeTracking(tn);
    if (!s) return '';
    if (/^1Z[0-9A-Z]{16}$/.test(s)) return 'ups';
    if (/^[A-Z]{2}\d{9}US$/.test(s)) return 'usps';
    if (/^(92|93|94|95)\d{18,20}$/.test(s)) return 'usps';
    if (/^61\d{18}$/.test(s)) return 'fedex';
    if (/^\d{12}$|^\d{15}$/.test(s)) return 'fedex';
    if (/^\d{20,22}$/.test(s)) return 'usps';
    return '';
  }

  // Carrier status codes. UPS uses single letters on status.type; FedEx uses
  // two-letter derivedCode. USPS v3 returns prose, handled by fromText().
  var CODE_MAP = {
    ups: { D: STATUS.DELIVERED, I: STATUS.IN_TRANSIT, P: STATUS.IN_TRANSIT,
           M: STATUS.EXPECTED, X: STATUS.EXCEPTION, RS: STATUS.RETURNED },
    fedex: { DL: STATUS.DELIVERED, OD: STATUS.OUT_FOR_DELIVERY, IT: STATUS.IN_TRANSIT,
             PU: STATUS.IN_TRANSIT, AR: STATUS.IN_TRANSIT, IN: STATUS.EXPECTED,
             OC: STATUS.EXPECTED, DE: STATUS.EXCEPTION, SE: STATUS.EXCEPTION,
             CA: STATUS.EXCEPTION, RS: STATUS.RETURNED }
  };

  function fromText(text) {
    var t = String(text == null ? '' : text).toLowerCase();
    if (!t) return null;
    if (t.indexOf('out for delivery') !== -1) return STATUS.OUT_FOR_DELIVERY;
    if (t.indexOf('delivered') !== -1) return STATUS.DELIVERED;
    if (t.indexOf('return') !== -1) return STATUS.RETURNED;
    if (/alert|exception|undeliverable|held|delay|attempt/.test(t)) return STATUS.EXCEPTION;
    if (/in transit|arrived|departed|accepted|picked up|in possession|on its way/.test(t)) return STATUS.IN_TRANSIT;
    if (/label|pre-shipment|order processed|billing information|shipment information/.test(t)) return STATUS.EXPECTED;
    return null;
  }

  // Prefer prose for the two states a decision hangs on (a UPS 'I' cannot tell
  // "out for delivery" from "in transit"), then the code, then prose again.
  function normalizeStatus(carrier, code, text) {
    var byText = fromText(text);
    if (byText === STATUS.OUT_FOR_DELIVERY || byText === STATUS.DELIVERED) return byText;
    var map = CODE_MAP[carrier];
    var byCode = (map && code) ? map[String(code).toUpperCase()] : null;
    if (byCode) return byCode;
    return byText || STATUS.UNKNOWN;
  }

  function isBlank(v) {
    return v === undefined || v === null || String(v).trim() === '';
  }

  function validatePackage(p) {
    p = p || {};
    var errors = [];
    if (isBlank(p.description)) {
      errors.push('Describe what you are expecting — a row with no description is not actionable.');
    }
    if (!isBlank(p.carrier) && !isKnownCarrier(p.carrier)) {
      errors.push('Carrier must be USPS, UPS, or FedEx.');
    }
    return { ok: errors.length === 0, errors: errors };
  }

  // Build a new registry row. Caller supplies id and timestamp.
  function newPackage(input, id, at) {
    var tn = normalizeTracking(input.trackingNumber);
    return {
      id: id,
      trackingNumber: tn,
      carrier: input.carrier || detectCarrier(tn),
      description: input.description || '',
      expectedBy: input.expectedBy || '',
      source: input.source || 'manual',
      status: input.status || STATUS.EXPECTED,
      lastScan: null,
      history: [],
      linkedEntryId: null,
      addedAt: at,
      updatedAt: at
    };
  }

  // --- poller snapshot merge ---

  function scanKey(s) {
    return String(s.at || '') + '|' + String(s.description || '');
  }

  function mergeScans(history, scans) {
    var seen = {};
    var out = history.slice();
    out.forEach(function (s) { seen[scanKey(s)] = true; });
    scans.forEach(function (s) {
      if (!seen[scanKey(s)]) { seen[scanKey(s)] = true; out.push(s); }
    });
    out.sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
    return out;
  }

  // Fold a poller snapshot into the registry. Rows already present are updated
  // (new scans appended, status refreshed); tracking numbers the registry has
  // never seen are ADDED — that is how portal discovery surfaces a package the
  // user never registered and no email ever mentioned.
  function mergeSnapshot(packages, snapshot, now, makeId) {
    var out = packages.map(clone);
    var idx = {};
    out.forEach(function (p, i) { if (p.trackingNumber) idx[p.trackingNumber] = i; });

    var added = 0, updated = 0;
    var rows = (snapshot && snapshot.packages) || [];
    rows.forEach(function (r) {
      var tn = normalizeTracking(r.trackingNumber);
      if (!tn) return;
      var scans = (r.scans || []).slice();
      var last = scans.length ? scans[scans.length - 1] : null;
      var status = r.status ||
        (last ? normalizeStatus(r.carrier, last.code, last.description) : STATUS.UNKNOWN);
      var found = r.discovered || {};

      if (idx[tn] === undefined) {
        var p = newPackage({
          trackingNumber: tn,
          carrier: r.carrier || detectCarrier(tn),
          description: found.description || ('Found on the ' + carrierLabel(r.carrier || detectCarrier(tn)) + ' portal'),
          expectedBy: found.expectedBy || '',
          source: r.source || 'portal'
        }, makeId(), now);
        p.history = mergeScans([], scans);
        p.lastScan = last;
        if (status !== STATUS.UNKNOWN) p.status = status;
        out.push(p);
        idx[tn] = out.length - 1;
        added++;
        return;
      }

      var cur = out[idx[tn]];
      var before = cur.status + '|' + cur.history.length;
      cur.history = mergeScans(cur.history, scans);
      if (cur.history.length) cur.lastScan = cur.history[cur.history.length - 1];
      if (status !== STATUS.UNKNOWN) cur.status = status;
      if (!cur.carrier && r.carrier) cur.carrier = r.carrier;
      if (before !== cur.status + '|' + cur.history.length) {
        cur.updatedAt = now;
        updated++;
      }
    });
    return { packages: out, added: added, updated: updated };
  }

  // The list handed to the poller: every number worth asking a carrier about.
  // Delivered and returned packages are finished, so they are left out.
  function trackingList(packages) {
    return packages
      .filter(function (p) { return p.trackingNumber && isActive(p); })
      .map(function (p) { return { trackingNumber: p.trackingNumber, carrier: p.carrier }; });
  }

  // --- staleness and reconciliation ---

  var DAY_MS = 86400000;
  var DEFAULT_STALL_DAYS = 4;

  function daysBetween(fromIso, toIso) {
    var a = new Date(fromIso).getTime();
    var b = new Date(toIso).getTime();
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.floor((b - a) / DAY_MS);
  }

  // Weekdays elapsed, for the "log it by close of the next business day"
  // reminder. Holidays are not modeled — this is a nudge, not a legal clock.
  function businessDaysBetween(fromIso, toIso) {
    var a = new Date(fromIso).getTime();
    var b = new Date(toIso).getTime();
    if (isNaN(a) || isNaN(b) || b <= a) return 0;
    var d = new Date(a); d.setUTCHours(0, 0, 0, 0);
    var end = new Date(b); end.setUTCHours(0, 0, 0, 0);
    var n = 0;
    while (d.getTime() < end.getTime()) {
      d = new Date(d.getTime() + DAY_MS);
      var wd = d.getUTCDay();
      if (wd !== 0 && wd !== 6) n++;
    }
    return n;
  }

  function isActive(p) {
    return p.status !== STATUS.DELIVERED && p.status !== STATUS.RETURNED;
  }

  // Moving, then nothing. This is the case an email-based tracker structurally
  // cannot see: no email arrives to tell you a package went quiet.
  function isStalled(p, now, stallDays) {
    if (!isActive(p)) return false;
    if (p.status !== STATUS.IN_TRANSIT && p.status !== STATUS.OUT_FOR_DELIVERY) return false;
    var at = p.lastScan && p.lastScan.at;
    if (!at) return false;
    return daysBetween(at, now) >= (stallDays || DEFAULT_STALL_DAYS);
  }

  // Past the date you said you expected it, and still not here.
  function isOverdue(p, now) {
    if (!isActive(p)) return false;
    if (!p.expectedBy) return false;
    return daysBetween(p.expectedBy, now) > 0;
  }

  // Delivered, but never written into the A&D record. For a licensee this is
  // the one that matters: a received firearm has to reach the bound book.
  function needsLogging(p) {
    return p.status === STATUS.DELIVERED && !p.linkedEntryId;
  }

  function loggingOverdue(p, now, graceBusinessDays) {
    if (!needsLogging(p)) return false;
    var at = (p.lastScan && p.lastScan.at) || p.updatedAt;
    if (!at) return false;
    var grace = graceBusinessDays === undefined ? 1 : graceBusinessDays;
    return businessDaysBetween(at, now) > grace;
  }

  // Everything the Packages screen needs to tell you what to do next.
  // `entries` is the projected A&D ledger, used to catch links pointing at
  // entries that no longer exist (e.g. after restoring an older backup).
  function reconcile(packages, entries, now, opts) {
    opts = opts || {};
    var known = {};
    (entries || []).forEach(function (e) { known[e.id] = true; });

    var out = { active: [], delivered: [], stalled: [], overdue: [], toLog: [], lateToLog: [], orphanLinks: [] };
    packages.forEach(function (p) {
      if (p.linkedEntryId && !known[p.linkedEntryId]) out.orphanLinks.push(p);
      if (isActive(p)) out.active.push(p);
      else if (p.status === STATUS.DELIVERED) out.delivered.push(p);
      if (isStalled(p, now, opts.stallDays)) out.stalled.push(p);
      if (isOverdue(p, now)) out.overdue.push(p);
      if (needsLogging(p)) {
        out.toLog.push(p);
        if (loggingOverdue(p, now, opts.graceBusinessDays)) out.lateToLog.push(p);
      }
    });
    return out;
  }

  // Tie a delivered package to the A&D entry it became.
  function linkToEntry(p, entryId, at) {
    var next = clone(p);
    next.linkedEntryId = entryId;
    next.updatedAt = at;
    return next;
  }

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  return {
    CARRIERS: CARRIERS,
    STATUS: STATUS,
    STATUS_LABELS: STATUS_LABELS,
    DEFAULT_STALL_DAYS: DEFAULT_STALL_DAYS,
    isKnownCarrier: isKnownCarrier,
    carrierLabel: carrierLabel,
    normalizeTracking: normalizeTracking,
    detectCarrier: detectCarrier,
    normalizeStatus: normalizeStatus,
    validatePackage: validatePackage,
    newPackage: newPackage,
    mergeSnapshot: mergeSnapshot,
    trackingList: trackingList,
    daysBetween: daysBetween,
    businessDaysBetween: businessDaysBetween,
    isActive: isActive,
    isStalled: isStalled,
    isOverdue: isOverdue,
    needsLogging: needsLogging,
    loggingOverdue: loggingOverdue,
    reconcile: reconcile,
    linkToEntry: linkToEntry
  };
});

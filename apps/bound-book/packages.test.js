// Run: node --test  (from apps/bound-book/)
const test = require('node:test');
const assert = require('node:assert');
const P = require('./packages.js');

let n = 0;
const ids = () => 'p' + (++n);
const NOW = '2026-08-27T12:00:00.000Z';

function pkg(over = {}) {
  const p = P.newPackage(
    Object.assign({ description: 'Glock 19 from Acme', trackingNumber: '1Z999AA10123456784' }, over),
    'p0',
    '2026-08-01T00:00:00.000Z'
  );
  return Object.assign(p, over.__patch || {});
}

test('detectCarrier recognizes each carrier format', () => {
  assert.equal(P.detectCarrier('1Z999AA10123456784'), 'ups');
  assert.equal(P.detectCarrier('9400 1000 0000 0000 0000 00'), 'usps');
  assert.equal(P.detectCarrier('LN123456789US'), 'usps');
  assert.equal(P.detectCarrier('123456789012'), 'fedex');
  assert.equal(P.detectCarrier('612345678901234567 89'), 'fedex');
  assert.equal(P.detectCarrier('nonsense'), '');
});

test('normalizeStatus prefers prose over code for out-for-delivery', () => {
  // UPS reports 'I' (in transit) even on the delivery truck; the prose is the
  // only thing that distinguishes it.
  assert.equal(P.normalizeStatus('ups', 'I', 'Out For Delivery Today'), P.STATUS.OUT_FOR_DELIVERY);
  assert.equal(P.normalizeStatus('ups', 'I', 'Arrived at Facility'), P.STATUS.IN_TRANSIT);
  assert.equal(P.normalizeStatus('ups', 'D', ''), P.STATUS.DELIVERED);
  assert.equal(P.normalizeStatus('fedex', 'OD', ''), P.STATUS.OUT_FOR_DELIVERY);
  assert.equal(P.normalizeStatus('fedex', 'DE', ''), P.STATUS.EXCEPTION);
  assert.equal(P.normalizeStatus('usps', '', 'Delivered, In/At Mailbox'), P.STATUS.DELIVERED);
  assert.equal(P.normalizeStatus('usps', '', 'Alert: Delivery Delayed'), P.STATUS.EXCEPTION);
  assert.equal(P.normalizeStatus('usps', '', ''), P.STATUS.UNKNOWN);
});

test('validatePackage requires a description', () => {
  assert.equal(P.validatePackage({ description: '' }).ok, false);
  assert.equal(P.validatePackage({ description: 'Ammo' }).ok, true);
});

test('newPackage infers the carrier and normalizes the tracking number', () => {
  const p = P.newPackage({ description: 'x', trackingNumber: ' 1z999aa1 0123456784 ' }, 'p1', NOW);
  assert.equal(p.trackingNumber, '1Z999AA10123456784');
  assert.equal(p.carrier, 'ups');
  assert.equal(p.status, P.STATUS.EXPECTED);
  assert.equal(p.linkedEntryId, null);
});

test('mergeSnapshot updates a known package and appends new scans', () => {
  const existing = [pkg()];
  const snap = {
    packages: [{
      trackingNumber: '1Z999AA10123456784',
      carrier: 'ups',
      scans: [
        { at: '2026-08-02T10:00:00Z', description: 'Origin Scan' },
        { at: '2026-08-03T10:00:00Z', description: 'Out For Delivery Today', code: 'I' }
      ]
    }]
  };
  const res = P.mergeSnapshot(existing, snap, NOW, ids);
  assert.equal(res.added, 0);
  assert.equal(res.updated, 1);
  assert.equal(res.packages[0].status, P.STATUS.OUT_FOR_DELIVERY);
  assert.equal(res.packages[0].history.length, 2);
  assert.equal(res.packages[0].lastScan.description, 'Out For Delivery Today');
});

test('mergeSnapshot is idempotent — re-importing the same snapshot adds nothing', () => {
  const snap = {
    packages: [{
      trackingNumber: '1Z999AA10123456784', carrier: 'ups',
      scans: [{ at: '2026-08-02T10:00:00Z', description: 'Origin Scan' }]
    }]
  };
  const once = P.mergeSnapshot([pkg()], snap, NOW, ids);
  const twice = P.mergeSnapshot(once.packages, snap, NOW, ids);
  assert.equal(twice.added, 0);
  assert.equal(twice.updated, 0);
  assert.equal(twice.packages[0].history.length, 1);
});

test('mergeSnapshot ADDS a package the registry never knew about (portal discovery)', () => {
  const snap = {
    packages: [{
      trackingNumber: '9400111899223197428490', carrier: 'usps', source: 'portal',
      discovered: { description: 'Package from Brownells' },
      scans: [{ at: '2026-08-26T09:00:00Z', description: 'In Transit to Next Facility' }]
    }]
  };
  const res = P.mergeSnapshot([], snap, NOW, ids);
  assert.equal(res.added, 1);
  assert.equal(res.packages[0].source, 'portal');
  assert.equal(res.packages[0].description, 'Package from Brownells');
  assert.equal(res.packages[0].status, P.STATUS.IN_TRANSIT);
});

test('mergeSnapshot ignores rows with no tracking number', () => {
  const res = P.mergeSnapshot([], { packages: [{ trackingNumber: '' }] }, NOW, ids);
  assert.equal(res.added, 0);
  assert.equal(res.packages.length, 0);
});

test('trackingList covers only active, numbered packages', () => {
  const delivered = pkg({ __patch: { status: P.STATUS.DELIVERED } });
  const noNumber = P.newPackage({ description: 'Expected, no number yet' }, 'p2', NOW);
  const active = P.newPackage({ description: 'a', trackingNumber: '123456789012' }, 'p3', NOW);
  const list = P.trackingList([delivered, noNumber, active]);
  assert.deepEqual(list, [{ trackingNumber: '123456789012', carrier: 'fedex' }]);
});

test('isStalled catches a package that went quiet mid-transit', () => {
  const moving = pkg({ __patch: {
    status: P.STATUS.IN_TRANSIT,
    lastScan: { at: '2026-08-20T10:00:00Z', description: 'Departed Facility' }
  } });
  assert.equal(P.isStalled(moving, NOW), true);          // 7 days, default threshold 4
  assert.equal(P.isStalled(moving, '2026-08-22T10:00:00Z'), false); // 2 days
  const delivered = pkg({ __patch: {
    status: P.STATUS.DELIVERED,
    lastScan: { at: '2026-08-20T10:00:00Z', description: 'Delivered' }
  } });
  assert.equal(P.isStalled(delivered, NOW), false);
});

test('isOverdue fires past expectedBy, and never once it has arrived', () => {
  assert.equal(P.isOverdue(pkg({ expectedBy: '2026-08-20' }), NOW), true);
  assert.equal(P.isOverdue(pkg({ expectedBy: '2026-09-30' }), NOW), false);
  assert.equal(P.isOverdue(pkg({ __patch: { status: P.STATUS.DELIVERED }, expectedBy: '2026-08-20' }), NOW), false);
});

test('businessDaysBetween skips weekends', () => {
  // Fri 2026-08-21 -> Mon 2026-08-24 is one business day.
  assert.equal(P.businessDaysBetween('2026-08-21T10:00:00Z', '2026-08-24T10:00:00Z'), 1);
  assert.equal(P.businessDaysBetween('2026-08-24T10:00:00Z', '2026-08-27T10:00:00Z'), 3);
  assert.equal(P.businessDaysBetween('2026-08-27T10:00:00Z', '2026-08-24T10:00:00Z'), 0);
});

test('needsLogging / loggingOverdue track the handoff into the A&D record', () => {
  const justDelivered = pkg({ __patch: {
    status: P.STATUS.DELIVERED,
    lastScan: { at: '2026-08-26T10:00:00Z', description: 'Delivered' }
  } });
  assert.equal(P.needsLogging(justDelivered), true);
  assert.equal(P.loggingOverdue(justDelivered, NOW), false);   // 1 business day, within grace

  const sittingThere = pkg({ __patch: {
    status: P.STATUS.DELIVERED,
    lastScan: { at: '2026-08-20T10:00:00Z', description: 'Delivered' }
  } });
  assert.equal(P.loggingOverdue(sittingThere, NOW), true);

  const logged = P.linkToEntry(sittingThere, 'entry-1', NOW);
  assert.equal(P.needsLogging(logged), false);
  assert.equal(P.loggingOverdue(logged, NOW), false);
  assert.equal(sittingThere.linkedEntryId, null, 'linkToEntry must not mutate its input');
});

test('reconcile buckets everything the Packages screen needs', () => {
  const packages = [
    pkg({ __patch: { id: 'a', status: P.STATUS.IN_TRANSIT, lastScan: { at: '2026-08-20T10:00:00Z', description: 'Departed' } } }),
    pkg({ __patch: { id: 'b', status: P.STATUS.DELIVERED, lastScan: { at: '2026-08-20T10:00:00Z', description: 'Delivered' } } }),
    pkg({ __patch: { id: 'c', status: P.STATUS.DELIVERED, linkedEntryId: 'gone' } }),
    P.newPackage({ description: 'late', trackingNumber: '123456789012', expectedBy: '2026-08-01' }, 'd', NOW)
  ];
  const rec = P.reconcile(packages, [{ id: 'entry-1' }], NOW);
  assert.deepEqual(rec.stalled.map(p => p.id), ['a']);
  assert.deepEqual(rec.toLog.map(p => p.id), ['b']);
  assert.deepEqual(rec.lateToLog.map(p => p.id), ['b']);
  assert.deepEqual(rec.orphanLinks.map(p => p.id), ['c']);
  assert.deepEqual(rec.overdue.map(p => p.id), ['d']);
  assert.deepEqual(rec.active.map(p => p.id), ['a', 'd']);
});

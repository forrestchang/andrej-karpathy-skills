// Run: node --test  (from apps/bound-book/)
const test = require('node:test');
const assert = require('node:assert');
const BB = require('./core.js');

const goodAcq = {
  dateReceived: '2026-07-24',
  mfrImporter: 'Acme Arms',
  model: 'M1',
  serial: 'SN123',
  type: 'Pistol',
  caliber: '9mm',
  sourceName: 'Distributor LLC',
  sourceAddress: '1 Main St'
};

test('validateAcquisition passes with all required fields', () => {
  assert.deepEqual(BB.validateAcquisition(goodAcq), { ok: true, errors: [] });
});

test('validateAcquisition flags each missing required field', () => {
  const res = BB.validateAcquisition({});
  assert.equal(res.ok, false);
  // 6 required scalar fields + 1 party error
  assert.equal(res.errors.length, 7);
});

test('source is valid via FFL number alone (no name/address)', () => {
  const acq = Object.assign({}, goodAcq, { sourceName: '', sourceAddress: '', sourceFfl: '1-23-45' });
  assert.equal(BB.validateAcquisition(acq).ok, true);
});

test('source with only a name (no address, no FFL) is invalid', () => {
  const acq = Object.assign({}, goodAcq, { sourceName: 'Bob', sourceAddress: '', sourceFfl: '' });
  const res = BB.validateAcquisition(acq);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => /Source requires/.test(e)));
});

test('validateDisposition requires buyer, form serial, eligibility', () => {
  const res = BB.validateDisposition({});
  assert.equal(res.ok, false);
  assert.ok(res.errors.length >= 4);
});

test('applyDisposition sets status and does not mutate the original', () => {
  const e = BB.newEntry(goodAcq, 'id1', '2026-07-24T00:00:00Z');
  const disposed = BB.applyDisposition(e, {
    date: '2026-07-25', buyerName: 'Jane', buyerAddress: '2 Oak',
    formSerial: 'F900', eligibilityNote: '4473 on file, box 3'
  });
  assert.equal(disposed.status, 'disposed');
  assert.equal(e.status, 'open', 'original entry unchanged');
  assert.equal(disposed.disposition.buyerName, 'Jane');
});

test('addCorrection is append-only and currentValue reflects latest', () => {
  const e = BB.newEntry(goodAcq, 'id1', '2026-07-24T00:00:00Z');
  assert.equal(BB.currentValue(e, 'acquisition.serial'), 'SN123');

  const c1 = BB.addCorrection(e, 'acquisition.serial', 'SN999', 'typo', '2026-07-24T01:00:00Z');
  // original object still shows original stored value
  assert.equal(e.acquisition.serial, 'SN123');
  assert.equal(c1.acquisition.serial, 'SN123', 'stored value never overwritten');
  assert.equal(BB.currentValue(c1, 'acquisition.serial'), 'SN999');
  assert.equal(c1.corrections.length, 1);
  assert.equal(c1.corrections[0].oldValue, 'SN123');

  const c2 = BB.addCorrection(c1, 'acquisition.serial', 'SN000', 'again', '2026-07-24T02:00:00Z');
  assert.equal(BB.currentValue(c2, 'acquisition.serial'), 'SN000');
  assert.equal(c2.corrections.length, 2);
  assert.equal(c2.corrections[1].oldValue, 'SN999', 'correction chains from prior current value');
});

test('csvEscape quotes commas, quotes, and newlines', () => {
  assert.equal(BB.csvEscape('plain'), 'plain');
  assert.equal(BB.csvEscape('a,b'), '"a,b"');
  assert.equal(BB.csvEscape('say "hi"'), '"say ""hi"""');
  assert.equal(BB.csvEscape('line1\nline2'), '"line1\nline2"');
});

test('toCSV emits header plus one row per entry with a party rendered', () => {
  const e1 = BB.newEntry(goodAcq, 'id1', '2026-07-24T00:00:00Z');
  const e2 = BB.applyDisposition(
    BB.newEntry(Object.assign({}, goodAcq, { serial: 'SN2' }), 'id2', '2026-07-24T00:00:00Z'),
    { date: '2026-07-25', buyerName: 'Jane', buyerAddress: '2 Oak', formSerial: 'F900', eligibilityNote: 'box 3' }
  );
  const csv = BB.toCSV([e1, e2]);
  const lines = csv.split('\r\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[0].startsWith('Entry ID,Status,'));
  assert.ok(lines[1].includes('Distributor LLC, 1 Main St'));
  assert.ok(lines[2].includes('Jane, 2 Oak'));
});

test('party renders FFL form when no name/address', () => {
  const acq = Object.assign({}, goodAcq, { sourceName: '', sourceAddress: '', sourceFfl: '1-23-45' });
  const e = BB.newEntry(acq, 'id1', '2026-07-24T00:00:00Z');
  assert.equal(BB.party(e, 'source'), 'FFL# 1-23-45');
});

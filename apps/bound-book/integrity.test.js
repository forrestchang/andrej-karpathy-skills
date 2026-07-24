// Run: node --test  (from apps/bound-book/)
const test = require('node:test');
const assert = require('node:assert');
const I = require('./integrity.js');

const acq = {
  entryId: 'e1', dateReceived: '2026-07-24', mfrImporter: 'Acme', model: 'M1',
  serial: 'SN123', type: 'Pistol', caliber: '9mm', sourceName: 'Dist', sourceAddress: '1 Main'
};

test('sha256 matches known NIST test vectors', () => {
  assert.equal(I.hashString(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(I.hashString('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('hashString handles unicode (UTF-8 encoded)', () => {
  // must not throw, and must be a 64-hex-char digest
  const h = I.hashString('José — café ☕');
  assert.match(h, /^[0-9a-f]{64}$/);
});

function buildLog() {
  let log = [];
  log = I.appendEvent(log, 'acquire', acq, '2026-07-24T00:00:00Z');
  log = I.appendEvent(log, 'acquire', Object.assign({}, acq, { entryId: 'e2', serial: 'SN2' }), '2026-07-24T01:00:00Z');
  log = I.appendEvent(log, 'dispose', {
    entryId: 'e1', date: '2026-07-25', buyerName: 'Jane', buyerAddress: '2 Oak',
    formSerial: 'F900', eligibilityNote: 'binder A'
  }, '2026-07-25T00:00:00Z');
  return log;
}

test('appendEvent chains seq and prevHash', () => {
  const log = buildLog();
  assert.deepEqual(log.map((e) => e.seq), [1, 2, 3]);
  assert.equal(log[0].prevHash, I.GENESIS);
  assert.equal(log[1].prevHash, log[0].hash);
  assert.equal(log[2].prevHash, log[1].hash);
});

test('verifyChain accepts an untouched log', () => {
  assert.deepEqual(I.verifyChain(buildLog()), { ok: true, count: 3 });
});

test('verifyChain detects altered content (tamper)', () => {
  const log = buildLog();
  log[0].payload.serial = 'HACKED'; // edit a recorded value in place
  const res = I.verifyChain(log);
  assert.equal(res.ok, false);
  assert.equal(res.brokenAt, 1);
  assert.match(res.reason, /Altered content/);
});

test('verifyChain detects a deleted entry (gap/broken link)', () => {
  const log = buildLog();
  log.splice(1, 1); // remove the middle event
  const res = I.verifyChain(log);
  assert.equal(res.ok, false);
  // now position 2 holds seq 3 -> sequence gap
  assert.equal(res.brokenAt, 2);
});

test('verifyChain detects reorder', () => {
  const log = buildLog();
  const tmp = log[0]; log[0] = log[1]; log[1] = tmp;
  const res = I.verifyChain(log);
  assert.equal(res.ok, false);
});

test('project folds events into ledger entries', () => {
  const entries = I.project(buildLog());
  assert.equal(entries.length, 2);
  assert.equal(entries[0].id, 'e1');
  assert.equal(entries[0].status, 'disposed');
  assert.equal(entries[0].disposition.buyerName, 'Jane');
  assert.equal(entries[1].id, 'e2');
  assert.equal(entries[1].status, 'open');
});

test('makeBackup + parseBackup round-trips a valid log', () => {
  const log = buildLog();
  const text = JSON.stringify(I.makeBackup(log, '2026-07-27T00:00:00Z'));
  const res = I.parseBackup(text);
  assert.equal(res.ok, true);
  assert.equal(res.log.length, 3);
  assert.deepEqual(I.verifyChain(res.log), { ok: true, count: 3 });
});

test('parseBackup rejects a tampered backup', () => {
  const log = buildLog();
  log[0].payload.serial = 'TAMPERED';
  const text = JSON.stringify(I.makeBackup(log, '2026-07-27T00:00:00Z'));
  const res = I.parseBackup(text);
  assert.equal(res.ok, false);
  assert.match(res.error, /integrity check/i);
});

test('parseBackup rejects non-backup and malformed JSON', () => {
  assert.equal(I.parseBackup('not json').ok, false);
  assert.equal(I.parseBackup(JSON.stringify({ app: 'something-else', log: [] })).ok, false);
  assert.equal(I.parseBackup(JSON.stringify({ app: 'bound-book' })).ok, false);
});

test('parseBackup accepts an empty but valid backup', () => {
  const text = JSON.stringify(I.makeBackup([], '2026-07-27T00:00:00Z'));
  const res = I.parseBackup(text);
  assert.equal(res.ok, true);
  assert.equal(res.log.length, 0);
});

test('project applies corrections from the log', () => {
  let log = buildLog();
  log = I.appendEvent(log, 'correct', {
    entryId: 'e1', field: 'acquisition.serial', newValue: 'SN999', reason: 'typo'
  }, '2026-07-26T00:00:00Z');
  const entries = I.project(log);
  const e1 = entries.find((e) => e.id === 'e1');
  assert.equal(e1.corrections.length, 1);
  assert.equal(e1.corrections[0].oldValue, 'SN123');
  assert.equal(e1.corrections[0].newValue, 'SN999');
  // and the chain is still valid after the correction
  assert.equal(I.verifyChain(log).ok, true);
});

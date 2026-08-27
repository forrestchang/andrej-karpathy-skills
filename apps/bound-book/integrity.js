// integrity.js — the "toward Option B" layer: an append-only, hash-chained
// event log that gives the record tamper-evidence, guaranteed no-gaps, and a
// full audit trail. State (the ledger) is a projection of this event log.
//
// This provides the TECHNICAL properties an electronic system of record needs.
// It does NOT by itself make the app your sole legal ATF record — that still
// requires ATF approval (a variance). See the PRD.
//
// Depends on BoundBook (core.js) for entry semantics. Runs in browser
// (window.Integrity) and Node (require) for tests.

(function (root, factory) {
  var core = (typeof module === 'object' && module.exports) ? require('./core.js') : root.BoundBook;
  var mod = factory(core);
  if (typeof module === 'object' && module.exports) module.exports = mod;
  else root.Integrity = mod;
})(typeof self !== 'undefined' ? self : this, function (BB) {
  'use strict';

  var GENESIS = 'GENESIS';

  // --- SHA-256 (compact, synchronous, dependency-free) ---
  // Sync + no crypto.subtle so it works from file:// by double-click and in Node.
  function sha256(ascii) {
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    var maxWord = Math.pow(2, 32);
    var result = '';
    var words = [];
    var asciiBitLength = ascii.length * 8;

    var hash = sha256.h = sha256.h || [];
    var k = sha256.k = sha256.k || [];
    var primeCounter = k.length;

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) { isComposite[i] = candidate; }
        hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) throw new Error('sha256 expects a byte string');
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;

    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = i < 16 ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0
          );
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) { hash[i] = (hash[i] + oldHash[i]) | 0; }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  // Hash any (unicode) string by first encoding to a UTF-8 byte string.
  function hashString(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return sha256(bin);
  }

  // Hash of an event's signed fields (everything except its own hash).
  function hashEvent(evt) {
    return hashString(JSON.stringify([evt.seq, evt.type, evt.payload, evt.timestamp, evt.prevHash]));
  }

  // Append a new event, chaining it to the previous one. Returns a NEW log.
  function appendEvent(log, type, payload, timestamp) {
    var prev = log.length ? log[log.length - 1] : null;
    var evt = {
      seq: prev ? prev.seq + 1 : 1,
      type: type,
      // Snapshot the payload so the log owns an immutable copy the caller can't
      // later mutate out from under the hash.
      payload: JSON.parse(JSON.stringify(payload)),
      timestamp: timestamp,
      prevHash: prev ? prev.hash : GENESIS
    };
    evt.hash = hashEvent(evt);
    return log.concat([evt]);
  }

  // Walk the chain: sequence must be 1..N with no gaps/reorders, each link must
  // point at the prior hash, and each event's content must re-hash to its stored
  // hash. Returns the first break found, or ok with a count.
  function verifyChain(log) {
    var prevHash = GENESIS;
    for (var i = 0; i < log.length; i++) {
      var e = log[i];
      if (e.seq !== i + 1) {
        return { ok: false, brokenAt: i + 1, reason: 'Sequence gap or reorder at position ' + (i + 1) + '.' };
      }
      if (e.prevHash !== prevHash) {
        return { ok: false, brokenAt: e.seq, reason: 'Broken chain link at entry #' + e.seq + ' (a prior entry was altered or removed).' };
      }
      if (hashEvent(e) !== e.hash) {
        return { ok: false, brokenAt: e.seq, reason: 'Altered content at entry #' + e.seq + '.' };
      }
      prevHash = e.hash;
    }
    return { ok: true, count: log.length };
  }

  // Fold the event log into the current ledger (array of entries). Entry shape
  // matches core.js so all existing rendering/export works unchanged.
  function project(log) {
    var byId = {};
    var order = [];
    log.forEach(function (e) {
      var id;
      if (e.type === 'acquire') {
        var entry = BB.newEntry(e.payload, e.payload.entryId, e.timestamp);
        byId[entry.id] = entry;
        order.push(entry.id);
      } else if (e.type === 'dispose') {
        id = e.payload.entryId;
        if (byId[id]) byId[id] = BB.applyDisposition(byId[id], e.payload);
      } else if (e.type === 'correct') {
        id = e.payload.entryId;
        if (byId[id]) byId[id] = BB.addCorrection(byId[id], e.payload.field, e.payload.newValue, e.payload.reason, e.timestamp);
      }
    });
    return order.map(function (id) { return byId[id]; });
  }

  // --- backup / continuity ---
  // Full-fidelity backup: the entire event log, wrapped in a small versioned
  // envelope. This is the record's continuity + surrender copy; unlike CSV it
  // preserves the hash chain so integrity can be re-verified after a restore.
  var BACKUP_APP = 'bound-book';
  var BACKUP_VERSION = 1;

  function makeBackup(log, exportedAt) {
    return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: exportedAt, log: log };
  }

  // Parse and validate a backup file's text. Returns { ok, log } on success, or
  // { ok:false, error } — including when the restored chain fails verification,
  // so a tampered/corrupt backup is never silently loaded as the legal record.
  function parseBackup(text) {
    var data;
    try { data = JSON.parse(text); }
    catch (e) { return { ok: false, error: 'Not a valid backup file (could not read JSON).' }; }
    if (!data || data.app !== BACKUP_APP || !Array.isArray(data.log)) {
      return { ok: false, error: 'This does not look like a Bound Book backup.' };
    }
    var check = verifyChain(data.log);
    if (!check.ok) {
      return { ok: false, error: 'Backup failed the integrity check and was not loaded. ' + check.reason };
    }
    return { ok: true, log: data.log };
  }

  // The seq of the last event, or 0 for an empty log. Used as the backup marker.
  function headSeq(log) {
    return log.length ? log[log.length - 1].seq : 0;
  }

  // How current the last backup is. `lastBackup` is the stored marker
  // { seq, at } from the most recent Download, or null if never backed up.
  // `pending` counts events recorded since that backup — any of them would be
  // lost if this machine were lost, so a non-zero count is a continuity risk.
  function backupStatus(log, lastBackup) {
    var head = headSeq(log);
    var backedSeq = lastBackup ? lastBackup.seq : 0;
    var pending = Math.max(0, head - backedSeq);
    return {
      pending: pending,
      upToDate: pending === 0,
      neverBackedUp: !lastBackup && head > 0,
      lastBackupAt: lastBackup ? lastBackup.at : null
    };
  }

  // Time-based backup policy. Given the last-backup marker { seq, at }, the
  // current time, and the licensee's required interval (days), report whether a
  // fresh backup is due by the calendar — the complement to the change-based
  // check in backupStatus(). Deterministic: the caller passes `nowIso`.
  var DAY_MS = 86400000;
  function backupOverdue(lastBackup, nowIso, intervalDays) {
    if (!lastBackup || !lastBackup.at || !(intervalDays > 0)) {
      return { overdue: false, ageDays: null };
    }
    var ageDays = Math.floor((new Date(nowIso).getTime() - new Date(lastBackup.at).getTime()) / DAY_MS);
    return { overdue: ageDays >= intervalDays, ageDays: ageDays };
  }

  return {
    GENESIS: GENESIS,
    sha256: sha256,
    hashString: hashString,
    hashEvent: hashEvent,
    appendEvent: appendEvent,
    verifyChain: verifyChain,
    project: project,
    makeBackup: makeBackup,
    parseBackup: parseBackup,
    headSeq: headSeq,
    backupStatus: backupStatus,
    backupOverdue: backupOverdue
  };
});

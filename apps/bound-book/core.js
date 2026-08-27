// core.js — pure, storage-agnostic logic for the Bound Book budget tier.
// Runs in the browser (attached to window.BoundBook) and under Node (require) for tests.
// No Date/random defaults inside pure functions: callers pass ids and timestamps
// so behavior is deterministic and testable.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BoundBook = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ATF-required fields per firearm (27 CFR Part 478). Labels are used by the UI
  // and the ledger export headers.
  var ACQ_FIELDS = [
    { key: 'dateReceived', label: 'Date received' },
    { key: 'mfrImporter', label: 'Manufacturer / Importer' },
    { key: 'model', label: 'Model' },
    { key: 'serial', label: 'Serial number' },
    { key: 'type', label: 'Type' },
    { key: 'caliber', label: 'Caliber / Gauge' }
  ];

  var DISP_FIELDS = [
    { key: 'date', label: 'Date of disposition' },
    { key: 'formSerial', label: '4473 / transfer reference' },
    { key: 'eligibilityNote', label: 'Eligibility documentation' }
  ];

  function isBlank(v) {
    return v === undefined || v === null || String(v).trim() === '';
  }

  // A source/buyer is valid if we have (name AND address) OR an FFL number.
  function partyValid(name, address, ffl) {
    return (!isBlank(name) && !isBlank(address)) || !isBlank(ffl);
  }

  function validateAcquisition(a) {
    a = a || {};
    var errors = [];
    ACQ_FIELDS.forEach(function (f) {
      if (isBlank(a[f.key])) errors.push(f.label + ' is required.');
    });
    if (!partyValid(a.sourceName, a.sourceAddress, a.sourceFfl)) {
      errors.push('Source requires either name + address, or an FFL number.');
    }
    return { ok: errors.length === 0, errors: errors };
  }

  function validateDisposition(d) {
    d = d || {};
    var errors = [];
    DISP_FIELDS.forEach(function (f) {
      if (isBlank(d[f.key])) errors.push(f.label + ' is required.');
    });
    if (!partyValid(d.buyerName, d.buyerAddress, d.buyerFfl)) {
      errors.push('Buyer/transferee requires either name + address, or an FFL number.');
    }
    return { ok: errors.length === 0, errors: errors };
  }

  // Build a new open entry. Caller supplies id and createdAt (ISO string).
  function newEntry(acq, id, createdAt) {
    return {
      id: id,
      createdAt: createdAt,
      status: 'open',
      acquisition: {
        dateReceived: acq.dateReceived,
        mfrImporter: acq.mfrImporter,
        model: acq.model,
        serial: acq.serial,
        type: acq.type,
        caliber: acq.caliber,
        sourceName: acq.sourceName || '',
        sourceAddress: acq.sourceAddress || '',
        sourceFfl: acq.sourceFfl || ''
      },
      disposition: null,
      corrections: []
    };
  }

  // Record a disposition against an open entry. Returns a new entry object.
  function applyDisposition(entry, disp) {
    var next = clone(entry);
    next.disposition = {
      date: disp.date,
      buyerName: disp.buyerName || '',
      buyerAddress: disp.buyerAddress || '',
      buyerFfl: disp.buyerFfl || '',
      formSerial: disp.formSerial,
      eligibilityNote: disp.eligibilityNote
    };
    next.status = 'disposed';
    return next;
  }

  // Append-only correction. Original field values are never mutated in place;
  // the "line-out, don't erase" convention is preserved by keeping the history.
  // `path` is a dotted path, e.g. 'acquisition.serial'.
  function addCorrection(entry, path, newValue, reason, at) {
    var next = clone(entry);
    next.corrections = next.corrections.concat([{
      field: path,
      oldValue: currentValue(entry, path),
      newValue: newValue,
      reason: reason,
      at: at
    }]);
    return next;
  }

  // Effective value of a field = latest correction for that path, else the
  // original stored value.
  function currentValue(entry, path) {
    var latest;
    for (var i = 0; i < entry.corrections.length; i++) {
      if (entry.corrections[i].field === path) latest = entry.corrections[i];
    }
    if (latest) return latest.newValue;
    return getPath(entry, path);
  }

  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) {
      return o == null ? undefined : o[k];
    }, obj);
  }

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  // --- CSV export (backup format) ---

  function csvEscape(v) {
    var s = v == null ? '' : String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  var CSV_COLUMNS = [
    { header: 'Entry ID', get: function (e) { return e.id; } },
    { header: 'Status', get: function (e) { return e.status; } },
    { header: 'Date received', get: function (e) { return cv(e, 'acquisition.dateReceived'); } },
    { header: 'Manufacturer/Importer', get: function (e) { return cv(e, 'acquisition.mfrImporter'); } },
    { header: 'Model', get: function (e) { return cv(e, 'acquisition.model'); } },
    { header: 'Serial', get: function (e) { return cv(e, 'acquisition.serial'); } },
    { header: 'Type', get: function (e) { return cv(e, 'acquisition.type'); } },
    { header: 'Caliber/Gauge', get: function (e) { return cv(e, 'acquisition.caliber'); } },
    { header: 'Source', get: function (e) { return party(e, 'source'); } },
    { header: 'Disposition date', get: function (e) { return e.disposition ? cv(e, 'disposition.date') : ''; } },
    { header: 'Buyer/Transferee', get: function (e) { return e.disposition ? party(e, 'buyer') : ''; } },
    { header: '4473/Transfer ref', get: function (e) { return e.disposition ? cv(e, 'disposition.formSerial') : ''; } },
    { header: 'Eligibility doc', get: function (e) { return e.disposition ? cv(e, 'disposition.eligibilityNote') : ''; } }
  ];

  function cv(e, path) {
    var v = currentValue(e, path);
    return v == null ? '' : v;
  }

  // Render a party ('source' or 'buyer') as "name, address" or "FFL# ...".
  function party(e, which) {
    var prefix = which === 'source' ? 'acquisition.source' : 'disposition.buyer';
    var name = cv(e, prefix + 'Name');
    var addr = cv(e, prefix + 'Address');
    var ffl = cv(e, prefix + 'Ffl');
    if (name || addr) return [name, addr].filter(Boolean).join(', ');
    return ffl ? 'FFL# ' + ffl : '';
  }

  function toCSV(entries) {
    var lines = [CSV_COLUMNS.map(function (c) { return csvEscape(c.header); }).join(',')];
    entries.forEach(function (e) {
      lines.push(CSV_COLUMNS.map(function (c) { return csvEscape(c.get(e)); }).join(','));
    });
    return lines.join('\r\n');
  }

  return {
    ACQ_FIELDS: ACQ_FIELDS,
    DISP_FIELDS: DISP_FIELDS,
    validateAcquisition: validateAcquisition,
    validateDisposition: validateDisposition,
    newEntry: newEntry,
    applyDisposition: applyDisposition,
    addCorrection: addCorrection,
    currentValue: currentValue,
    party: party,
    toCSV: toCSV,
    csvEscape: csvEscape,
    CSV_COLUMNS: CSV_COLUMNS
  };
});

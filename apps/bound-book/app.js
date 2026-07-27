// app.js — DOM wiring + localStorage persistence. Pure logic lives in core.js.
(function () {
  'use strict';
  var BB = window.BoundBook;
  var INT = window.Integrity;
  var LOG_KEY = 'boundbook.log.v1';
  var PROFILE_KEY = 'boundbook.profile.v1';
  var DISCLAIMER_KEY = 'boundbook.disclaimer.v1';
  var BACKUP_KEY = 'boundbook.lastbackup.v1';

  // --- persistence (append-only event log; the ledger is a projection) ---
  function loadLog() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveLog() { localStorage.setItem(LOG_KEY, JSON.stringify(log)); }
  function loadLastBackup() {
    try { return JSON.parse(localStorage.getItem(BACKUP_KEY)) || null; }
    catch (e) { return null; }
  }
  function saveLastBackup(marker) { localStorage.setItem(BACKUP_KEY, JSON.stringify(marker)); }
  function loadProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }

  var log = loadLog();
  var entries = INT.project(log);

  // Record an action as a new chained event, persist, and re-project the ledger.
  function commit(type, payload) {
    log = INT.appendEvent(log, type, payload, nowIso());
    saveLog();
    entries = INT.project(log);
  }

  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'e' + Date.now() + Math.floor(Math.random() * 1e6);
  }
  function nowIso() { return new Date().toISOString(); }
  function shortDate(iso) { return String(iso || '').replace('T', ' ').replace(/\..*/, ''); }
  function formData(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) { o[k] = String(v).trim(); });
    return o;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function showErrors(el, errors) {
    el.innerHTML = errors.length
      ? '<ul>' + errors.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>'
      : '';
  }

  // --- navigation ---
  function show(view) {
    document.querySelectorAll('.view').forEach(function (s) { s.classList.add('hidden'); });
    document.getElementById('view-' + view).classList.remove('hidden');
    document.querySelectorAll('nav button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === view);
    });
    if (view === 'dispose') renderDisposeOptions();
    if (view === 'ledger') renderLedger();
    if (view === 'export') renderPrintLedger();
    if (view === 'integrity') renderIntegrity();
  }
  document.querySelectorAll('nav button').forEach(function (b) {
    b.addEventListener('click', function () { show(b.dataset.view); });
  });

  // --- acquire ---
  document.getElementById('acquire-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var data = formData(this);
    var res = BB.validateAcquisition(data);
    showErrors(document.getElementById('acquire-errors'), res.errors);
    if (!res.ok) return;
    data.entryId = newId();
    commit('acquire', data);
    this.reset();
    showErrors(document.getElementById('acquire-errors'), []);
    show('ledger');
  });

  // --- dispose ---
  function openEntries() { return entries.filter(function (e) { return e.status === 'open'; }); }

  function renderDisposeOptions() {
    var sel = document.getElementById('dispose-select');
    var open = openEntries();
    if (!open.length) {
      sel.innerHTML = '<option value="">No open firearms</option>';
      return;
    }
    sel.innerHTML = open.map(function (e) {
      var label = BB.currentValue(e, 'acquisition.mfrImporter') + ' ' +
        BB.currentValue(e, 'acquisition.model') + ' — SN ' +
        BB.currentValue(e, 'acquisition.serial');
      return '<option value="' + esc(e.id) + '">' + esc(label) + '</option>';
    }).join('');
  }

  document.getElementById('dispose-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var id = document.getElementById('dispose-select').value;
    var errEl = document.getElementById('dispose-errors');
    if (!id) { showErrors(errEl, ['Select an open firearm first.']); return; }
    var data = formData(this);
    var res = BB.validateDisposition(data);
    showErrors(errEl, res.errors);
    if (!res.ok) return;
    data.entryId = id;
    commit('dispose', data);
    this.reset();
    show('ledger');
  });

  // --- ledger ---
  var LEDGER_COLS = [
    ['Received', 'acquisition.dateReceived'],
    ['Mfr/Importer', 'acquisition.mfrImporter'],
    ['Model', 'acquisition.model'],
    ['Serial', 'acquisition.serial'],
    ['Type', 'acquisition.type'],
    ['Caliber', 'acquisition.caliber']
  ];

  function fieldCell(e, path) {
    // Show current value; if corrected, show the original struck out beneath.
    var corr = null;
    e.corrections.forEach(function (c) { if (c.field === path) corr = c; });
    var cur = esc(BB.currentValue(e, path));
    if (!corr) return cur;
    var orig = esc(corr.oldValue);
    return cur + '<span class="corr">was <span class="struck">' + orig + '</span> — ' + esc(corr.reason) + '</span>';
  }

  function matches(e, q) {
    if (!q) return true;
    q = q.toLowerCase();
    var hay = [
      BB.currentValue(e, 'acquisition.serial'),
      BB.currentValue(e, 'acquisition.model'),
      BB.currentValue(e, 'acquisition.mfrImporter'),
      BB.party(e, 'source'),
      e.disposition ? BB.party(e, 'buyer') : ''
    ].join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function renderLedger() {
    var q = document.getElementById('ledger-search').value.trim();
    var rows = entries.filter(function (e) { return matches(e, q); });
    var el = document.getElementById('ledger-table');
    if (!rows.length) {
      el.innerHTML = '<p class="empty">No entries yet. Start with an acquisition.</p>';
      return;
    }
    var head = '<tr>' + LEDGER_COLS.map(function (c) { return '<th>' + c[0] + '</th>'; }).join('') +
      '<th>Source</th><th>Status</th><th>Disposition</th></tr>';
    var body = rows.map(function (e) {
      var cells = LEDGER_COLS.map(function (c) { return '<td>' + fieldCell(e, c[1]) + '</td>'; }).join('');
      var source = '<td>' + esc(BB.party(e, 'source')) + '</td>';
      var status = '<td class="status-' + e.status + '">' + e.status + '</td>';
      var disp = '<td>';
      if (e.disposition) {
        disp += esc(BB.currentValue(e, 'disposition.date')) + '<br>' +
          esc(BB.party(e, 'buyer')) + '<br>' +
          '4473: ' + esc(BB.currentValue(e, 'disposition.formSerial'));
      } else {
        disp += '—';
      }
      disp += '</td>';
      var action = '<td class="no-print"><button type="button" class="link-btn" data-correct="' + esc(e.id) + '">Correct</button></td>';
      return '<tr>' + cells + source + status + disp + action + '</tr>';
    }).join('');
    el.innerHTML = '<table><thead>' + head + '<th class="no-print"></th></thead><tbody>' + body + '</tbody></table>';
    el.querySelectorAll('[data-correct]').forEach(function (b) {
      b.addEventListener('click', function () { openCorrection(b.dataset.correct); });
    });
  }
  document.getElementById('ledger-search').addEventListener('input', renderLedger);

  // --- corrections (append-only) ---
  var correctingId = null;
  function correctableFields(entry) {
    var fields = BB.ACQ_FIELDS.map(function (f) {
      return { path: 'acquisition.' + f.key, label: f.label };
    });
    if (entry.disposition) {
      BB.DISP_FIELDS.forEach(function (f) {
        fields.push({ path: 'disposition.' + f.key, label: 'Disposition — ' + f.label });
      });
    }
    return fields;
  }
  function openCorrection(id) {
    correctingId = id;
    var entry = entries.find(function (e) { return e.id === id; });
    var sel = document.getElementById('correct-field');
    sel.innerHTML = correctableFields(entry).map(function (f) {
      return '<option value="' + esc(f.path) + '">' + esc(f.label) + ' (now: ' +
        esc(BB.currentValue(entry, f.path)) + ')</option>';
    }).join('');
    showErrors(document.getElementById('correct-errors'), []);
    document.getElementById('correct-form').reset();
    document.getElementById('correct-target').textContent =
      'SN ' + BB.currentValue(entry, 'acquisition.serial') + ' — the original stays on record, struck through.';
    document.getElementById('correct-modal').classList.remove('hidden');
  }
  document.getElementById('correct-cancel').addEventListener('click', function () {
    document.getElementById('correct-modal').classList.add('hidden');
  });
  document.getElementById('correct-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var data = formData(this);
    if (!data.newValue || !data.reason) {
      showErrors(document.getElementById('correct-errors'), ['Corrected value and reason are both required.']);
      return;
    }
    commit('correct', { entryId: correctingId, field: data.field, newValue: data.newValue, reason: data.reason });
    document.getElementById('correct-modal').classList.add('hidden');
    renderLedger();
  });

  // --- export ---
  function renderPrintLedger() {
    var p = loadProfile();
    var header = '<div class="ledger-header"><h2>Acquisition &amp; Disposition Record</h2>' +
      '<div class="meta">' + esc(p.name || '') +
      (p.ffl ? ' · FFL# ' + esc(p.ffl) : '') +
      (p.address ? ' · ' + esc(p.address) : '') + '</div></div>';
    var el = document.getElementById('print-ledger');
    if (!entries.length) { el.innerHTML = header + '<p class="empty">No entries yet.</p>'; return; }
    var head = '<tr><th>Received</th><th>Mfr/Importer</th><th>Model</th><th>Serial</th>' +
      '<th>Type</th><th>Caliber</th><th>Source</th><th>Disp. date</th><th>Buyer</th><th>4473</th></tr>';
    var body = entries.map(function (e) {
      return '<tr>' +
        td(BB.currentValue(e, 'acquisition.dateReceived')) +
        td(BB.currentValue(e, 'acquisition.mfrImporter')) +
        td(BB.currentValue(e, 'acquisition.model')) +
        td(BB.currentValue(e, 'acquisition.serial')) +
        td(BB.currentValue(e, 'acquisition.type')) +
        td(BB.currentValue(e, 'acquisition.caliber')) +
        td(BB.party(e, 'source')) +
        td(e.disposition ? BB.currentValue(e, 'disposition.date') : '') +
        td(e.disposition ? BB.party(e, 'buyer') : '') +
        td(e.disposition ? BB.currentValue(e, 'disposition.formSerial') : '') +
        '</tr>';
    }).join('');
    el.innerHTML = header + '<table><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }
  function td(v) { return '<td>' + esc(v) + '</td>'; }

  document.getElementById('btn-print').addEventListener('click', function () { window.print(); });
  document.getElementById('btn-csv').addEventListener('click', function () {
    var blob = new Blob([BB.toCSV(entries)], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bound-book-backup.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- integrity view ---
  function eventSummary(e) {
    if (e.type === 'acquire') return 'Acquired ' + esc(e.payload.mfrImporter) + ' ' + esc(e.payload.model) + ' — SN ' + esc(e.payload.serial);
    if (e.type === 'dispose') return 'Disposed entry (4473 ' + esc(e.payload.formSerial) + ')';
    if (e.type === 'correct') return 'Corrected ' + esc(e.payload.field) + ' → ' + esc(e.payload.newValue) + ' (' + esc(e.payload.reason) + ')';
    return esc(e.type);
  }
  function backupBanner() {
    var s = INT.backupStatus(log, lastBackup);
    // Priority 1: unsaved changes are the most urgent — data would be lost.
    if (!s.upToDate) {
      var noun = s.pending === 1 ? 'change has' : 'changes have';
      var lead = s.neverBackedUp
        ? 'No backup yet — '
        : (esc(s.pending) + ' ' + noun + ' been recorded since your last backup' + (s.lastBackupAt ? ' (' + esc(shortDate(s.lastBackupAt)) + ')' : '') + '. ');
      return '<div class="backup-warn">&#9888; ' + lead + 'Download a backup so this record survives loss of this device.</div>';
    }
    // Priority 2: fully backed up, but the calendar cadence is due (policy).
    var interval = parseInt(loadProfile().backupIntervalDays, 10) || 0;
    var due = INT.backupOverdue(lastBackup, nowIso(), interval);
    if (due.overdue) {
      return '<div class="backup-warn">&#9888; Your last backup is ' + esc(due.ageDays) + ' days old (policy: every ' + esc(interval) + ' days). Download a fresh copy and store it offsite.</div>';
    }
    var when = s.lastBackupAt ? ' (last backup ' + esc(shortDate(s.lastBackupAt)) + ')' : '';
    return '<div class="backup-ok">&#10003; All changes backed up' + when + '.</div>';
  }
  function renderIntegrity() {
    var res = INT.verifyChain(log);
    var statusEl = document.getElementById('integrity-status');
    if (!log.length) {
      statusEl.innerHTML = '<div class="chain-ok">No entries yet — nothing to verify.</div>';
      document.getElementById('integrity-log').innerHTML = '';
      return;
    }
    statusEl.innerHTML = (res.ok
      ? '<div class="chain-ok">&#10003; Chain verified — ' + res.count + ' entr' + (res.count === 1 ? 'y' : 'ies') + ', no gaps, nothing altered.</div>'
      : '<div class="chain-bad">&#10007; Integrity check FAILED. ' + esc(res.reason) + '</div>')
      + backupBanner();

    var rows = log.map(function (e) {
      var broken = !res.ok && e.seq >= res.brokenAt;
      return '<tr class="' + (broken ? 'row-bad' : '') + '">' +
        '<td>' + e.seq + '</td>' +
        '<td>' + esc((e.timestamp || '').replace('T', ' ').replace(/\..*/, '')) + '</td>' +
        '<td>' + eventSummary(e) + '</td>' +
        '<td class="mono">' + esc(String(e.hash).slice(0, 12)) + '…</td>' +
        '</tr>';
    }).join('');
    document.getElementById('integrity-log').innerHTML =
      '<table><thead><tr><th>#</th><th>When</th><th>Action</th><th>Hash</th></tr></thead><tbody>' +
      rows + '</tbody></table>';
  }

  // --- backup / restore (continuity of the legal record) ---
  var lastBackup = loadLastBackup();

  document.getElementById('btn-backup').addEventListener('click', function () {
    var at = nowIso();
    var backup = INT.makeBackup(log, at);
    var blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bound-book-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    // Mark everything currently recorded as backed up.
    lastBackup = { seq: INT.headSeq(log), at: at };
    saveLastBackup(lastBackup);
    renderIntegrity();
  });

  var restoreInput = document.getElementById('restore-input');
  restoreInput.addEventListener('change', function () {
    var file = this.files && this.files[0];
    var msg = document.getElementById('restore-msg');
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var res = INT.parseBackup(String(reader.result));
      if (!res.ok) {
        msg.innerHTML = '<div class="chain-bad">' + esc(res.error) + '</div>';
        restoreInput.value = '';
        return;
      }
      if (log.length && !window.confirm('Restore ' + res.log.length + ' entries from this backup? This replaces the current record on this device.')) {
        restoreInput.value = '';
        return;
      }
      log = res.log;
      saveLog();
      entries = INT.project(log);
      // The restored data matches a backup file that exists on disk, so it is
      // current as of this restore.
      lastBackup = { seq: INT.headSeq(log), at: nowIso() };
      saveLastBackup(lastBackup);
      restoreInput.value = '';
      msg.innerHTML = '<div class="chain-ok">Restored ' + res.log.length + ' entries. Chain verified.</div>';
      renderIntegrity();
    };
    reader.readAsText(file);
  });

  // --- profile ---
  (function initProfile() {
    var form = document.getElementById('profile-form');
    var p = loadProfile();
    ['name', 'ffl', 'address', 'backupIntervalDays'].forEach(function (k) { if (form[k]) form[k].value = p[k] || ''; });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      saveProfile(formData(this));
      document.getElementById('profile-saved').textContent = 'Saved.';
      setTimeout(function () { document.getElementById('profile-saved').textContent = ''; }, 1500);
    });
  })();

  // --- disclaimer ---
  (function initDisclaimer() {
    if (localStorage.getItem(DISCLAIMER_KEY)) return;
    var modal = document.getElementById('disclaimer');
    modal.classList.remove('hidden');
    var ack = document.getElementById('disclaimer-ack');
    var ok = document.getElementById('disclaimer-ok');
    ack.addEventListener('change', function () { ok.disabled = !ack.checked; });
    ok.addEventListener('click', function () {
      localStorage.setItem(DISCLAIMER_KEY, '1');
      modal.classList.add('hidden');
    });
  })();

  show('acquire');
})();

// carriers.js — the three official carrier tracking APIs, normalized to one
// shape. Each adapter takes tracking numbers and returns rows the browser app
// can merge (see ../packages.js mergeSnapshot).
//
// These are the AUTHORITATIVE source of status. The portal scrapers
// (portals.js) only discover tracking numbers; they never decide status.
//
// Credentials are API client id/secret from each carrier's developer portal —
// NOT your consumer account password. Nothing here logs into your account.

'use strict';

const OUT_SHAPE = { trackingNumber: '', carrier: '', status: '', scans: [], error: null };

async function fetchJson(url, options, what) {
  const res = await fetch(url, options);
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch (e) { /* non-JSON error page */ }
  if (!res.ok) {
    const detail = (body && (body.error_description || body.error || body.message)) || text.slice(0, 200);
    throw new Error(`${what} failed (HTTP ${res.status}): ${detail}`);
  }
  return body;
}

function row(trackingNumber, carrier, extra) {
  return Object.assign({}, OUT_SHAPE, { trackingNumber, carrier, scans: [] }, extra);
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// --- USPS (apis.usps.com, OAuth2 client credentials) ---

const usps = {
  key: 'usps',
  async token(creds) {
    const body = await fetchJson('https://apis.usps.com/oauth2/v3/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: creds.clientId,
        client_secret: creds.clientSecret
      })
    }, 'USPS token');
    return body.access_token;
  },
  async track(numbers, creds) {
    const token = await this.token(creds);
    const out = [];
    // USPS tracking is one number per request.
    for (const tn of numbers) {
      try {
        const body = await fetchJson(
          `https://apis.usps.com/tracking/v3/tracking/${encodeURIComponent(tn)}?expand=DETAIL`,
          { headers: { authorization: `Bearer ${token}`, accept: 'application/json' } },
          `USPS tracking ${tn}`
        );
        const events = body.trackingEvents || [];
        out.push(row(tn, 'usps', {
          status: '',
          scans: events.map(e => ({
            at: e.eventTimestamp || '',
            code: e.eventCode || '',
            description: e.eventType || e.eventName || '',
            location: [e.eventCity, e.eventState].filter(Boolean).join(', ')
          })).reverse(), // USPS returns newest first; the app wants oldest first
          summary: body.statusSummary || body.status || ''
        }));
      } catch (err) {
        out.push(row(tn, 'usps', { error: err.message }));
      }
    }
    return out;
  }
};

// --- UPS (onlinetools.ups.com, OAuth2 client credentials) ---

const ups = {
  key: 'ups',
  async token(creds) {
    const basic = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
    const body = await fetchJson('https://onlinetools.ups.com/security/v1/oauth/token', {
      method: 'POST',
      headers: {
        authorization: `Basic ${basic}`,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    }, 'UPS token');
    return body.access_token;
  },
  async track(numbers, creds) {
    const token = await this.token(creds);
    const out = [];
    for (const tn of numbers) {
      try {
        const body = await fetchJson(
          `https://onlinetools.ups.com/api/track/v1/details/${encodeURIComponent(tn)}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
              transId: `bb-${Date.now()}`,
              transactionSrc: 'bound-book',
              accept: 'application/json'
            }
          },
          `UPS tracking ${tn}`
        );
        const shipments = (body.trackResponse && body.trackResponse.shipment) || [];
        const activities = shipments
          .flatMap(s => s.package || [])
          .flatMap(p => p.activity || []);
        out.push(row(tn, 'ups', {
          scans: activities.map(a => ({
            at: upsDate(a.date, a.time),
            code: (a.status && a.status.type) || '',
            description: (a.status && a.status.description) || '',
            location: upsPlace(a.location)
          })).reverse() // UPS returns newest first
        }));
      } catch (err) {
        out.push(row(tn, 'ups', { error: err.message }));
      }
    }
    return out;
  }
};

// UPS gives local date/time as YYYYMMDD / HHMMSS with no zone. Keep it as a
// plain local-time ISO string rather than inventing a UTC offset.
function upsDate(date, time) {
  if (!date) return '';
  const d = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  if (!time) return d;
  return `${d}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`;
}

function upsPlace(location) {
  const a = (location && location.address) || {};
  return [a.city, a.stateProvince, a.countryCode].filter(Boolean).join(', ');
}

// --- FedEx (apis.fedex.com, OAuth2 client credentials) ---

const fedex = {
  key: 'fedex',
  async token(creds) {
    const body = await fetchJson('https://apis.fedex.com/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: creds.clientId,
        client_secret: creds.clientSecret
      }).toString()
    }, 'FedEx token');
    return body.access_token;
  },
  async track(numbers, creds) {
    const token = await this.token(creds);
    const out = [];
    // FedEx accepts up to 30 numbers per call.
    for (const batch of chunk(numbers, 30)) {
      try {
        const body = await fetchJson('https://apis.fedex.com/track/v1/trackingnumbers', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
            'x-locale': 'en_US'
          },
          body: JSON.stringify({
            includeDetailedScans: true,
            trackingInfo: batch.map(tn => ({ trackingNumberInfo: { trackingNumber: tn } }))
          })
        }, 'FedEx tracking');
        const results = (body.output && body.output.completeTrackResults) || [];
        for (const r of results) {
          const t = (r.trackResults && r.trackResults[0]) || {};
          if (t.error) {
            out.push(row(r.trackingNumber, 'fedex', { error: t.error.message || t.error.code }));
            continue;
          }
          const latest = t.latestStatusDetail || {};
          out.push(row(r.trackingNumber, 'fedex', {
            scans: (t.scanEvents || []).map(e => ({
              at: e.date || '',
              code: e.derivedStatusCode || e.eventType || '',
              description: e.eventDescription || '',
              location: fedexPlace(e.scanLocation)
            })).reverse(), // FedEx returns newest first
            summary: latest.statusByLocale || latest.description || '',
            latestCode: latest.derivedCode || ''
          }));
        }
      } catch (err) {
        for (const tn of batch) out.push(row(tn, 'fedex', { error: err.message }));
      }
    }
    return out;
  }
};

function fedexPlace(loc) {
  const a = loc || {};
  return [a.city, a.stateOrProvinceCode, a.countryCode].filter(Boolean).join(', ');
}

const ADAPTERS = { usps, ups, fedex };

// Track a mixed list of { trackingNumber, carrier } against whichever carriers
// are configured. Numbers whose carrier has no credentials are reported as
// errors rather than silently dropped — a missing key should be visible.
async function trackAll(items, config) {
  const byCarrier = {};
  for (const it of items) {
    const c = it.carrier || '';
    (byCarrier[c] = byCarrier[c] || []).push(it.trackingNumber);
  }
  const out = [];
  for (const [carrier, numbers] of Object.entries(byCarrier)) {
    const adapter = ADAPTERS[carrier];
    const creds = config[carrier];
    if (!adapter) {
      for (const tn of numbers) out.push(row(tn, carrier, { error: 'Unknown carrier — set it on the package.' }));
      continue;
    }
    if (!creds || !creds.clientId || !creds.clientSecret) {
      for (const tn of numbers) out.push(row(tn, carrier, { error: `No ${carrier} API credentials in config.json.` }));
      continue;
    }
    try {
      out.push(...await adapter.track(numbers, creds));
    } catch (err) {
      // Token failures throw before any package is attempted. Attribute the
      // error to every number for this carrier so one carrier's expired
      // credentials cannot wipe out the other two carriers' results.
      for (const tn of numbers) out.push(row(tn, carrier, { error: err.message }));
    }
  }
  return out;
}

module.exports = { trackAll, ADAPTERS };

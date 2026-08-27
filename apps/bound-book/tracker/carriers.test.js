// Run: node --test  (from apps/bound-book/)
//
// These pin down how each carrier's JSON is parsed. There is no way to hit the
// live APIs from a test, so the fixtures below are the documented response
// shapes — if a carrier changes theirs, this is the file that should fail.
const test = require('node:test');
const assert = require('node:assert');
const carriers = require('./carriers.js');
const { statusOf } = require('./poll.js');
const P = require('../packages.js');

const CREDS = { clientId: 'id', clientSecret: 'secret' };
const CONFIG = { usps: CREDS, ups: CREDS, fedex: CREDS, portals: {} };

const FIXTURES = {
  'apis.usps.com/oauth2': { access_token: 't' },
  'onlinetools.ups.com/security': { access_token: 't' },
  'apis.fedex.com/oauth': { access_token: 't' },

  'apis.usps.com/tracking': {
    trackingNumber: '9400111899223197428490',
    status: 'In Transit to Next Facility',
    statusSummary: 'In Transit to Next Facility, Arriving Late',
    trackingEvents: [
      { eventType: 'In Transit to Next Facility', eventTimestamp: '2026-08-26T09:12:00Z', eventCity: 'DES MOINES', eventState: 'IA', eventCode: 'NT' },
      { eventType: 'Accepted at USPS Origin Facility', eventTimestamp: '2026-08-24T15:02:00Z', eventCity: 'GRIMES', eventState: 'IA', eventCode: '03' }
    ]
  },

  'onlinetools.ups.com/api/track': {
    trackResponse: {
      shipment: [{
        package: [{
          trackingNumber: '1Z999AA10123456784',
          activity: [
            { status: { type: 'D', description: 'Delivered', code: 'KB' }, date: '20260826', time: '142300',
              location: { address: { city: 'ATLANTA', stateProvince: 'GA', countryCode: 'US' } } },
            { status: { type: 'I', description: 'Out For Delivery Today', code: 'OT' }, date: '20260826', time: '061200',
              location: { address: { city: 'ATLANTA', stateProvince: 'GA', countryCode: 'US' } } }
          ]
        }]
      }]
    }
  },

  'apis.fedex.com/track': {
    output: {
      completeTrackResults: [{
        trackingNumber: '123456789012',
        trackResults: [{
          latestStatusDetail: { code: 'OD', derivedCode: 'OD', statusByLocale: 'On FedEx vehicle for delivery' },
          scanEvents: [
            { date: '2026-08-27T06:10:00-05:00', derivedStatusCode: 'OD', eventDescription: 'On FedEx vehicle for delivery',
              scanLocation: { city: 'MEMPHIS', stateOrProvinceCode: 'TN', countryCode: 'US' } },
            { date: '2026-08-26T21:00:00-05:00', derivedStatusCode: 'AR', eventDescription: 'Arrived at FedEx location',
              scanLocation: { city: 'MEMPHIS', stateOrProvinceCode: 'TN', countryCode: 'US' } }
          ]
        }]
      }]
    }
  }
};

function stubFetch(overrides = {}) {
  global.fetch = async (url) => {
    const u = String(url);
    for (const [needle, body] of Object.entries({ ...FIXTURES, ...overrides })) {
      if (u.includes(needle)) {
        if (body instanceof Error) return { ok: false, status: 401, text: async () => JSON.stringify({ error_description: body.message }) };
        return { ok: true, status: 200, text: async () => JSON.stringify(body) };
      }
    }
    throw new Error(`unstubbed URL: ${u}`);
  };
}

test('USPS: events parse oldest-first with location, and summary drives status', async () => {
  stubFetch();
  const [r] = await carriers.trackAll([{ trackingNumber: '9400111899223197428490', carrier: 'usps' }], CONFIG);
  assert.equal(r.error, null);
  assert.equal(r.scans.length, 2);
  assert.equal(r.scans[0].description, 'Accepted at USPS Origin Facility');
  assert.equal(r.scans[1].description, 'In Transit to Next Facility');
  assert.equal(r.scans[1].location, 'DES MOINES, IA');
  assert.equal(statusOf(r), P.STATUS.IN_TRANSIT);
});

test('UPS: YYYYMMDD/HHMMSS becomes a sortable timestamp and D means delivered', async () => {
  stubFetch();
  const [r] = await carriers.trackAll([{ trackingNumber: '1Z999AA10123456784', carrier: 'ups' }], CONFIG);
  assert.equal(r.error, null);
  assert.deepEqual(r.scans.map(s => s.at), ['2026-08-26T06:12:00', '2026-08-26T14:23:00']);
  assert.equal(r.scans[1].location, 'ATLANTA, GA, US');
  assert.equal(statusOf(r), P.STATUS.DELIVERED);
});

test('FedEx: derivedCode OD is out-for-delivery, not merely in transit', async () => {
  stubFetch();
  const [r] = await carriers.trackAll([{ trackingNumber: '123456789012', carrier: 'fedex' }], CONFIG);
  assert.equal(r.error, null);
  assert.equal(r.scans.length, 2);
  assert.equal(r.scans[0].description, 'Arrived at FedEx location');
  assert.equal(statusOf(r), P.STATUS.OUT_FOR_DELIVERY);
});

test('a carrier with no credentials errors visibly instead of vanishing', async () => {
  stubFetch();
  const [r] = await carriers.trackAll(
    [{ trackingNumber: '1Z999AA10123456784', carrier: 'ups' }],
    { usps: CREDS, ups: { clientId: '', clientSecret: '' }, fedex: CREDS, portals: {} }
  );
  assert.match(r.error, /No ups API credentials/);
  assert.deepEqual(r.scans, []);
});

test('an unknown carrier errors instead of being silently dropped', async () => {
  stubFetch();
  const [r] = await carriers.trackAll([{ trackingNumber: 'WHAT123', carrier: '' }], CONFIG);
  assert.match(r.error, /Unknown carrier/);
});

test('an auth failure is reported per package, not thrown away', async () => {
  stubFetch({ 'apis.fedex.com/oauth': new Error('invalid client') });
  const rows = await carriers.trackAll([
    { trackingNumber: '123456789012', carrier: 'fedex' },
    { trackingNumber: '999999999999', carrier: 'fedex' }
  ], CONFIG);
  assert.equal(rows.length, 2);
  for (const r of rows) assert.match(r.error, /invalid client/);
});

test('poller output merges cleanly into the registry', async () => {
  stubFetch();
  const [r] = await carriers.trackAll([{ trackingNumber: '1Z999AA10123456784', carrier: 'ups' }], CONFIG);
  const snapshot = {
    packages: [{ trackingNumber: r.trackingNumber, carrier: r.carrier, status: statusOf(r), scans: r.scans, source: 'api' }]
  };
  const existing = [P.newPackage({ description: 'Glock 19', trackingNumber: '1Z999AA10123456784' }, 'p1', '2026-08-01T00:00:00Z')];
  const merged = P.mergeSnapshot(existing, snapshot, '2026-08-27T12:00:00Z', () => 'x');
  assert.equal(merged.updated, 1);
  assert.equal(merged.packages[0].status, P.STATUS.DELIVERED);
  assert.equal(P.needsLogging(merged.packages[0]), true);
});

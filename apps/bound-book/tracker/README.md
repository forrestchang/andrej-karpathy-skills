# Package poller

Fetches the real status of inbound packages and writes a snapshot the Bound
Book app imports. Runs on your machine, on demand.

## Why there is a separate program at all

The app is a double-click `index.html` with no server. It cannot call carrier
APIs itself: a `file://` page has no CORS access to them, and an API secret
pasted into a web page is a published secret. So the network half lives here,
in Node, and the two halves meet over a file — the same round-trip the app
already uses for backup/restore.

## What it can and cannot do

**No carrier offers an "everything inbound to my address" API.** This is worth
being blunt about, because it shapes the whole design:

| | What exists | What that means here |
|---|---|---|
| USPS | [Informed Delivery API](https://postalpro.usps.com/idapi) is for *mailers* running campaigns; the tracking API takes a tracking number | No resident feed |
| UPS | [Track API](https://github.com/UPS-API/api-documentation/blob/main/Tracking.yaml) — `/track/v1/details/{inquiryNumber}` | Number in, status out |
| FedEx | Track API — `POST /track/v1/trackingnumbers` | Number in, status out |

The consumer dashboards that *do* show everything coming to your address —
Informed Delivery, UPS My Choice, FedEx Delivery Manager — are web pages with
no public API. So this tool splits the job:

- **Portals discover tracking numbers.** A headless browser opens your
  dashboard and reads the tracking numbers off it. That is all it takes from
  the page.
- **The official APIs decide status.** Every number, whether you registered it
  or the portal found it, is resolved against the carrier's real API.

Scraping numbers rather than status is deliberate. A tracking number's shape
survives a portal redesign; a CSS selector for "delivery status" does not. When
a carrier ships a new dashboard, this degrades to *"found 0 numbers"* — visible
and fixable — instead of silently reporting stale status.

## Your passwords are not stored

`login` opens a **real browser window** and you sign in yourself — password,
MFA, captcha, whatever the carrier asks. Only the resulting session cookies are
written, to `state/<carrier>.json`. Nothing reads or stores your password.

`state/` and `config.json` are gitignored. `state/` holds live sessions for your
carrier accounts, so treat that directory like a password manager: it stays on
this machine.

Sessions expire. When one does, the poller says so and names the fix.

## Setup

**1. Carrier API credentials** (for status). Register a free developer app at
[developer.usps.com](https://developers.usps.com/), [developer.ups.com](https://developer.ups.com/),
and [developer.fedex.com](https://developer.fedex.com/), then:

```bash
cp config.example.json config.json   # paste each clientId / clientSecret
```

Or keep them out of the file entirely with env vars:
`BB_USPS_CLIENT_ID`, `BB_USPS_CLIENT_SECRET`, `BB_UPS_…`, `BB_FEDEX_…`.

Credentials are per-carrier and independent — configure one and the other two
simply report that they are unconfigured.

**2. Portal sessions** (for discovery, optional):

```bash
npm install playwright && npx playwright install chromium
node poll.js login usps
node poll.js login ups
node poll.js login fedex
```

Skip this entirely and pass `--no-portals`; you then track only the numbers you
register in the app.

## Daily use

```bash
# 1. In the app: Packages → Download tracking list, save it next to poll.js
# 2. Poll:
node poll.js poll --list tracking-list.json
# 3. In the app: Packages → Import snapshot… → package-snapshot.json
```

Options: `--numbers 1Z…,94…` to add numbers inline, `--no-portals` to skip
discovery, `--out <file>` to write elsewhere, `--headed` to watch the browser
work, `--dump` to save the portal's HTML and a screenshot when discovery finds
nothing and you need to see why.

Nothing here runs on a schedule. If you want it to, wrap it in `cron` — but the
import step is still manual by design, so the app never has a network listener.

## Layout

| File | Role |
|------|------|
| `poll.js` | CLI: `login`, `poll`. Orchestration and snapshot writing. |
| `carriers.js` | The three official APIs, normalized to one row shape. Authoritative for status. |
| `portals.js` | Playwright session login + tracking-number discovery. Never sets status. |
| `carriers.test.js` | Response-shape fixtures for all three carriers. Run `node --test` from `apps/bound-book/`. |

`carriers.test.js` is where a carrier's API change should surface: the fixtures
are the documented response shapes, so if one drifts, that file fails rather
than the poller quietly returning nothing.

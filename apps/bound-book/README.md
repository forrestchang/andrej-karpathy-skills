# Bound Book — budget A&D record (prototype)

A deliberately tiny, local-first tool for keeping a firearms **Acquisition &
Disposition (A&D)** record. Built for home-based, very small FFLs (Type 01 home
dealers, Type 03 C&R collectors) who want to stay compliant without a full
POS/inventory suite.

Scope and rationale live in [`../../docs/bound-book-budget-prd.md`](../../docs/bound-book-budget-prd.md).

## Run it

No install, no server, no build step. Open `index.html` in any modern browser
(double-click it, or `File → Open`). All data stays **on your machine** in the
browser's local storage — nothing is sent anywhere.

## What it does

- **Acquire** — log a firearm coming in (all ATF-required fields; source by
  name + address or FFL number).
- **Dispose** — record where an open firearm went (buyer, 4473 reference,
  eligibility documentation note).
- **Ledger** — searchable, chronological view of every entry.
- **Correct** — append-only corrections: the original value is never erased,
  it's shown struck-through with the reason and the new value (the "line-out,
  don't erase" convention).
- **Export / Print** — print or **Save as PDF** for your official record, and
  download a **CSV** as your backup.
- **Packages** — track what is inbound from USPS, UPS and FedEx, and catch the
  gap between *delivered* and *written into the bound book* (see below).
- **Integrity** — every action is stored in an append-only, **hash-chained**
  event log; the screen verifies the chain (no gaps, nothing altered) and shows
  the full audit trail. Editing or deleting anything after the fact breaks the
  chain and is flagged. Also holds **full backup / restore** (verify-on-restore).

## The record model (important)

With the **ATF variance approved**, this app is the **electronic system of
record**. The record is a tamper-evident, hash-chained, append-only log:

- There is no edit-in-place or delete — the only way to change a recorded value
  is a **logged correction**, so the record stays tamper-evident by construction
  (see the **Integrity** screen and `integrity.js`).
- Print / Save-as-PDF and CSV remain available as the human-readable
  **surrender copy**, but they are no longer the system of record — the log is.

### Back up — it's now a compliance step

Because the record lives on this machine, **your backup is the continuity copy
and the surrender copy**. Use **Integrity → Download full backup (.json)**
regularly. Restore verifies the chain on import and **refuses a tampered or
corrupt backup** rather than loading it.

The Integrity screen also tracks your last backup: it shows a warning whenever
entries have been recorded since — *"N changes have been recorded since your
last backup"* — and clears to *"All changes backed up"* once you download a
current copy. This is a local nudge only; it does not store backups for you or
replace keeping an offsite copy.

**Backup cadence (policy).** In *Licensee → Backup policy* you can set a
required backup interval in days. When your record is otherwise fully backed up
but the last backup is older than that interval, the Integrity screen reminds
you — *"Your last backup is N days old (policy: every M days)"* — to download a
fresh copy and store it offsite. Set the interval to whatever your variance
requires; `0` turns the time-based reminder off. **Moving a copy offsite is a
manual step this local-first app cannot do for you.**

> Not legal advice. Requirements summarized from 27 CFR Part 478. Confirm
> current ATF rules and any state requirements for your situation before
> relying on this.

## Inbound packages

A firearm that arrives is an acquisition waiting to be logged. This screen
tracks what is on its way and flags the gap between the two.

It is deliberately **not** an email scraper. Status comes from the carriers'
own APIs, which means it also sees the things no email would ever tell you:

- a package that **stopped scanning** four or more days ago;
- a package **past the date you expected it**;
- a package **delivered but not yet in the bound book** — escalating once more
  than one business day has passed, since an acquisition is due by the close of
  the next business day after receipt.

**Log as acquisition** carries a delivered package into the Acquire form with
the delivery date prefilled, then links the two so the reminder clears. The
firearm's details are still yours to enter — tracking cannot tell you what was
in the box.

### It is not part of the legal record

Package data lives in its own store, outside the hash-chained log. Carrier
status is third-party logistics information, not a regulated A&D field, so
putting it in the chain would pad your system of record with noise you cannot
correct or remove. Rows on this screen can be edited and deleted freely. The
only thing that ever reaches the chain is an acquisition you log yourself.

### There is no "everything coming to my address" API

Worth stating plainly, because it shapes the design. USPS, UPS and FedEx all
offer tracking APIs that take a *tracking number*. None offers a feed of
everything inbound to an address — the consumer dashboards that show that
(Informed Delivery, UPS My Choice, FedEx Delivery Manager) are web pages with
no public API.

So the poller in [`tracker/`](tracker/) does two separate things: it signs in to
those dashboards to **discover tracking numbers**, then resolves every number
against the **official API** for real status. Your carrier passwords are never
stored — you sign in yourself once per carrier in a real browser window, and
only the session is saved.

The poller is a separate Node program because this app has no server and never
gets one: a `file://` page cannot call those APIs, and an API secret in a web
page is a published secret. The two halves meet over a file, the same way
backup and restore already work:

```
Packages → Download tracking list   →   node poll.js poll --list tracking-list.json
                                    →   Packages → Import snapshot
```

Setup, credentials and options: [`tracker/README.md`](tracker/README.md).

## Layout

| File | Role |
|------|------|
| `core.js` | Pure logic: validation, entry model, append-only corrections, CSV. Storage-agnostic; runs in browser and Node. |
| `integrity.js` | Hash-chained, append-only event log: SHA-256, chain verification (no-gaps + tamper), projection to ledger entries. |
| `packages.js` | Pure logic for the inbound package registry: carrier detection, status normalization, staleness, reconciliation against the ledger. Outside the chain by design. |
| `tracker/` | Node poller: official USPS/UPS/FedEx APIs for status, portal sign-in for discovery. Has its own README. |
| `core.test.js` / `integrity.test.js` / `packages.test.js` / `tracker/carriers.test.js` | Node tests. Run: `node --test` |
| `index.html` / `app.js` / `styles.css` | UI, localStorage persistence, print stylesheet. |

## Test

```
cd apps/bound-book
node --test
```

## Not in this tier (by design)

POS/payments, integrated e-4473, multi-user roles, multi-location, barcode
hardware, accounting. See the PRD for the intended upgrade path.

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

> Not legal advice. Requirements summarized from 27 CFR Part 478. Confirm
> current ATF rules and any state requirements for your situation before
> relying on this.

## Layout

| File | Role |
|------|------|
| `core.js` | Pure logic: validation, entry model, append-only corrections, CSV. Storage-agnostic; runs in browser and Node. |
| `integrity.js` | Hash-chained, append-only event log: SHA-256, chain verification (no-gaps + tamper), projection to ledger entries. |
| `core.test.js` / `integrity.test.js` | Node tests. Run: `node --test` |
| `index.html` / `app.js` / `styles.css` | UI, localStorage persistence, print stylesheet. |

## Test

```
cd apps/bound-book
node --test
```

## Not in this tier (by design)

POS/payments, integrated e-4473, multi-user roles, multi-location, barcode
hardware, accounting. See the PRD for the intended upgrade path.

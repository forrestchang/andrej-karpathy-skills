# Product Requirements — "Bound Book" Budget Tier

**Audience:** Home-based, very small FFLs (Type 01 dealers run from home, Type 03 C&R collectors).
**One-line pitch:** The cheapest way to keep a compliant Acquisition & Disposition (A&D) record — nothing more, nothing you don't need.
**Status:** Draft for review.

> **Not legal advice.** This spec summarizes federal recordkeeping rules (27 CFR Part 478) to scope the product. Confirm current ATF requirements and any state rules with counsel or your ATF Industry Operations office before shipping. Rules change; the code must not hardcode assumptions that go stale silently.

---

## 1. Problem & Opportunity

A licensee must maintain a bound A&D record. Full firearms-retail software (POS, e-4473, inventory, labels, accounting) is overkill and overpriced for someone doing a handful of transfers a year from home. That segment wants one thing: **stay compliant, cheaply.**

A "bound book only" tier is a clean, well-bounded slice of that market. The discipline of this tier is: **strip features aggressively, never strip compliance.**

## 2. Goals / Non-Goals

**Goals**
- Record acquisitions and dispositions with every ATF-required field.
- Produce a searchable ledger and an ATF-ready export/print on demand.
- Preserve record integrity and retention.
- Be dramatically simpler and cheaper than full FFL suites.

**Non-Goals (explicitly out of the budget tier)**
- Point-of-sale / payments
- Integrated e-4473 (separate, heavier regulated workflow)
- Multi-user roles, multi-location
- Barcode/label hardware, scanners
- Accounting, tax, sales reporting
- Inventory valuation / merchandising

These become optional paid add-ons later, not part of the floor.

## 3. The Compliance Floor (non-negotiable, even at $0)

Per firearm the record must capture:

**Acquisition**
- Date received
- Manufacturer and/or importer
- Model
- Serial number
- Type (e.g., pistol, rifle, receiver)
- Caliber / gauge
- Source: name + address, or FFL number if from a licensee

**Disposition**
- Date of disposition
- Buyer/transferee name + address (or FFL number)
- 4473 form serial / transfer reference
- Eligibility documentation trail (the fact that a background check / 4473 was completed and where that paperwork lives)

**Cross-cutting integrity requirements**
- **Retention:** records must be preserved (long-horizon — treat as permanent) and be surrenderable to ATF on license discontinuance.
- **No silent mutation:** entries must not be quietly deleted or overwritten. Corrections follow the "line-out, don't erase" convention — keep the original visible and append the correction with a timestamp and reason.
- **Chronological, gap-free ordering** of entries.
- **Export on demand:** ATF-consumable output (print + PDF + CSV).

If a feature cut would violate any bullet in this section, it is not on the table for the budget tier.

## 4. The Key Decision — Legal Role of the Software (advisory)

You asked which role to pick. Here is the tradeoff and my recommendation.

### Option A — Companion / printable ledger (**recommended for the budget tier**)
The app helps you *keep* the record, but the **printed (or exported PDF) ledger is the official ATF record**. The user prints, signs where required, and stores paper.

- **Pros:** Lowest compliance risk and lowest build cost. No ATF electronic-recordkeeping variance/approval needed. Integrity burden is mostly "generate a clean, correct printout." Perfect fit for someone doing low volume from home.
- **Cons:** User still handles paper. The app is an aid, not the sole legal system.
- **Why it fits:** A budget, home-based FFL is exactly the user who is fine printing a ledger and does not want the obligations of a fully electronic system of record.

### Option B — Electronic system of record
The app **is** the legal bound book; no paper.

- **Pros:** Fully paperless, higher perceived value.
- **Cons:** ATF imposes specific conditions on electronic A&D systems (typically prior approval/variance, guaranteed no data gaps, tamper-evidence, reliable reproduction on demand, defined backup/continuity). Materially more to build, test, and stand behind legally. Overkill for the budget persona.

### Recommendation
Originally: **ship Option A** and design so upgrading to Option B is a
positioning + hardening step, not a rewrite. That path was followed — the
integrity features were built on the append-only model from the start.

**Update:** the ATF variance is now **approved**, so the product operates as
**Option B — an electronic system of record** (see the section below). The
Option A analysis is retained for history and because the print/PDF/CSV output
it describes still serves as the human-readable surrender copy.

### Option B — in effect (variance approved)

The ATF variance is **approved**, so the app now operates as the **electronic
system of record**. The requirements are met as follows:

- **Tamper-evidence** — an append-only, **hash-chained event log**
  (`integrity.js`): every action (acquire, dispose, correct) is an immutable
  event; the ledger is a *projection* of the log, never edited in place. Each
  event hashes its contents plus the previous event's hash, so any after-the-fact
  edit, deletion, or reorder breaks the chain and is detected.
- **No data gaps** — sequential numbering verified on demand (the **Integrity**
  screen).
- **Reproduction on demand** — Print / Save-as-PDF and CSV export produce the
  human-readable / surrender copy.
- **Backup & continuity** — full-fidelity JSON backup of the entire chained log,
  with **verify-on-restore**: a tampered or corrupt backup fails the integrity
  check and is refused rather than loaded. Because the build is local-first, the
  user's backup is the continuity + surrender copy; regular backup is now a
  compliance step, surfaced in the first-run notice and on the Integrity screen.

Print/PDF/CSV remain available as the human-readable surrender copies, but they
are no longer the *system of record* — the chained log is.

This gives budget users what they need today and preserves your upgrade path.

## 5. Scope — Screens (target: ~4)

1. **Acquire** — form to log an incoming firearm (all Acquisition fields).
2. **Dispose** — select an open (undisposed) firearm, log the Disposition fields.
3. **Ledger** — chronological, searchable/filterable list; shows open vs. closed entries; correction history visible.
4. **Export / Print** — generate ATF-ready PDF, printable ledger, and CSV backup.

Supporting (not full screens): simple licensee profile (name, FFL#, address for headers), and a first-run disclaimer.

## 6. Data Model (sketch)

- **Firearm/Entry** (one row = one firearm's lifecycle)
  - `id`, acquisition fields, disposition fields (nullable until disposed), `status` (open/disposed), `created_at`.
- **Correction** (append-only)
  - `entry_id`, `field`, `old_value`, `new_value`, `reason`, `corrected_at`. Never mutate the original field in place — render the line-out from these records.
- **LicenseeProfile** — header data for exports.

Integrity rules enforced at the data layer: no hard deletes of entries; edits to regulated fields go through the Correction append path.

## 7. Success Criteria

- A user can log an acquisition, later log its disposition, and produce a PDF that contains **every** required field in ATF-acceptable form.
- No regulated field can be silently deleted or overwritten; every correction is visible with timestamp + reason.
- Full ledger exports to CSV for backup and to PDF for ATF.
- Zero features from the Non-Goals list ship in this tier.

## 8. Open Questions

1. **State-level rules** — any target states with extra logging (e.g., specific record formats, additional retention)? Budget tier may need a "state notes" flag.
2. **Multi-firearm transactions** — support acquiring several firearms in one entry session, or strictly one-at-a-time to keep it simple?
3. **Backup responsibility** — is CSV/PDF export enough for v1, or do we owe an automated backup story even at the budget tier?
4. **Distribution** — desktop/local-first (data stays on the user's machine, good for a privacy-sensitive audience) vs. hosted? Local-first pairs well with Option A.
5. **Upgrade path** — confirm we're committing to the Option A→B migration path so the integrity work isn't wasted.

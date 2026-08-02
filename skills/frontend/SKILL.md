---
name: frontend
description: Create distinctive, production-grade frontend interfaces with high design quality. Use when building or restyling web components, pages, artifacts, posters, apps, landing pages, dashboards, React/HTML/CSS UI — avoids generic AI aesthetics.
license: MIT
---

# Frontend

Build distinctive, production-grade UI. Real working code. No generic "AI slop." Apply in whatever project the user points at — inspect local patterns first.

## Design thinking

Commit to a **bold** direction before coding:
- **Purpose** — who is this for, what problem does it solve?
- **Tone** — pick an extreme (brutalist, editorial, luxury, playful, industrial, organic, etc.) and commit
- **Constraints** — stack, performance, a11y
- **Differentiation** — one thing someone will remember

Intentionality > intensity. Then ship code that is functional, visually sharp, cohesive, and refined in detail.

## Aesthetics

- **Type** — distinctive display + refined body. Never default to Inter/Roboto/Arial/system UI.
- **Color** — CSS variables; dominant palette + sharp accent. Not timid equal-weight schemes.
- **Motion** — high-impact moments (load stagger, surprise hover). CSS-first; Motion lib if already in repo. 2–3 intentional motions on visually led work; respect `prefers-reduced-motion`.
- **Space** — asymmetry, overlap, density *or* generous negative space — not cookie-cutter grids.
- **Atmosphere** — depth via gradients, grain, texture, pattern — not flat fills.

**Never:** purple-on-white / purple→indigo; cream+terracotta serif cliché; broadsheet hairlines; glow stacks; pill spam; shadow soup; emoji decoration; Space Grotesk-as-default; same look every time.

Match complexity to vision: maximalism needs elaborate craft; minimalism needs restraint.

## Composition

- One idea per first viewport (not a dashboard unless it is one)
- Brand/product name is hero-level on branded surfaces
- Landing hero budget: brand · one headline · one support line · one CTA group · one full-bleed visual — nothing else
- No floating badges/stickers on hero media; no cards in heroes
- Cards only when they wrap a real interaction; default = no cards
- One job per section; real imagery over abstract decoration
- **Existing design system?** Preserve and extend — don't freestyle a redesign unless asked

## Execute

1. Read local tokens/components; prefer project stack over new UI kits
2. Working states: empty / loading / error / disabled where paths exist
3. Check desktop + narrow width; keyboard + focus + contrast + labels
4. Tight diffs; no drive-by refactors or unsolicited MUI/Chakra/shadcn dumps
5. Don't invent APIs for cosmetics

**Done when:** direction is intentional (or correctly inherited), primary flows work, layout holds narrow, no leftover experiment CSS.

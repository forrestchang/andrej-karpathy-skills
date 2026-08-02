---
name: frontend
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints. Apply this in **whatever project** they point at — inspect local patterns first.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Composition rules (landings & product chrome)

- **One composition**: The first viewport should read as one idea — not a dashboard (unless it is a dashboard).
- **Brand first**: On branded pages, the brand/product name is hero-level, not an eyebrow. No headline should overpower the brand.
- **Brand test**: If removing the nav makes the first viewport feel interchangeable with another product, branding is too weak.
- **Hero budget** (marketing/promotional): brand, one headline, one short support line, one CTA group, one dominant full-bleed image/plane. No stats strips, schedules, address blocks, or secondary promos in the first viewport.
- **Full-bleed heroes** by default on promotional surfaces — not inset media cards, side-panel heroes, or tiled collages unless the existing system requires it.
- **No hero overlays**: no floating badges, promo stickers, or info chips on hero media.
- **Cards**: default **no cards**. Cards only when they wrap a real user interaction. If removing border/shadow/radius doesn't hurt understanding, it shouldn't be a card. Never cards in the hero.
- **One job per section**: one purpose, one headline, usually one short supporting sentence.
- **Real visual anchor**: imagery should show product, place, atmosphere, or context — decorative gradients alone are not the main idea.
- **Reduce clutter**: avoid pill clusters, icon rows, boxed promo stacks, and competing text blocks.

**Exception:** Inside an existing website or design system, **preserve** established patterns, structure, and visual language. Extend; don't freestyle a redesign unless asked.

## Also avoid (common AI tells)

Beyond Inter/purple: warm cream + terracotta serif cliché; broadsheet hairline “newspaper” layouts; default dark-mode-for-everything; glow stacks; `rounded-full` pill spam; multi-layer shadow soup; emoji as decoration.

## Execution

1. Locate the target app/package from the user path or workspace; read local UI tokens/components before inventing new ones.
2. Prefer the project's stack (React/Next/Vue/etc., CSS strategy, font loading) over introducing new UI kits.
3. Ship **working** UI: states for empty, loading, error, and disabled where those paths exist.
4. **Responsive**: verify desktop and a narrow (~mobile) width; don't ship obvious overflow/collapse.
5. **Accessibility baseline**: semantic structure, keyboard reachability for controls, visible focus, usable contrast, labels on inputs; respect `prefers-reduced-motion` when adding motion.
6. **Motion budget**: at least 2–3 intentional motions on visually led work; CSS-first unless the repo already uses a motion library.
7. Keep diffs tight — no drive-by refactors or dependency dumps (MUI/Chakra/blanket shadcn) unless requested.
8. Don't invent backend/API contracts for cosmetics; wire to existing APIs or ask.

## Done bar

- Aesthetic direction is intentional and consistent (or correctly inherits the existing system).
- Primary flows work with pointer and keyboard where relevant.
- Holds up at desktop and narrow width.
- No leftover unused styles/components from exploration.

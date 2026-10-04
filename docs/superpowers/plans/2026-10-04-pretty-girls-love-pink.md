# Pretty Girls Love Pink Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive pink "coquette / bookish" Spicetify theme pack.

**Architecture:** A Spicetify theme folder (`color.ini` + `user.css` + `theme.js`) with inline SVG stickers embedded in JS/CSS. A mock `preview/index.html` loads the same CSS/JS with a fake `Spicetify` object for visual and interaction checks. A Node check script validates `color.ini` keys and SVG well-formedness.

**Tech Stack:** Spicetify theme format, vanilla CSS/JS, Node (built-in `node:test`, no dependencies).

**Spec:** `docs/superpowers/specs/2026-10-04-pretty-girls-love-pink-design.md`

## Global Constraints
- Theme name / folder: `pretty-girls-love-pink`; color scheme name `pink`.
- Palette: bg `#FFE4EC`, cream `#FFF5EE`, accent `#E8467C`, cherry `#B3122E`, cards `#FFD1DF`, text `#5A0F24`.
- Original SVG art only; do not copy the reference image.
- Zero dependencies. All motion disabled under `prefers-reduced-motion: reduce`.
- JS must no-op safely if `Spicetify` or its APIs are missing.
- Effects toggle persisted in `localStorage` key `pglp-effects`.

## Review Focus
- `Spicetify` undefined or `Spicetify.Player` not ready yet: JS retries, then no-ops without throwing.
- `localStorage` unavailable or throws: effects default to on, no crash.
- `prefers-reduced-motion`: no bursts, drift, or tilt; static look stays intact.
- Rapid play/pause spam: bursts are capped (max 30 live particles) and cleaned up.
- Window resize / tiny viewport: background stickers stay inside the viewport and never block clicks (`pointer-events: none`).

---

### Task 1: Palette and validation harness

**Files:**
- Create: `pretty-girls-love-pink/color.ini`
- Create: `tests/theme.test.js`

**Interfaces:**
- Produces: `[pink]` scheme in `color.ini` with keys `text, subtext, main, sidebar, player, card, shadow, selected-row, button, button-active, button-disabled, tab-active, notification, notification-error, misc`, all 6-digit hex without `#`.

- [ ] **Step 1: Write failing test** `color.ini defines every required key as 6-digit hex` and `palette uses spec colors (main FFE4EC, button E8467C, text 5A0F24, card FFD1DF)` in `tests/theme.test.js` using `node:test`.
- [ ] **Step 2: Run** `node --test tests/` → Expected: FAIL (file missing).
- [ ] **Step 3: Create `color.ini`** with the `[pink]` section; map spec colors to roles (sidebar `FFD1DF`, player `FFF5EE`, button-active `B3122E`).
- [ ] **Step 4: Run** `node --test tests/` → Expected: PASS.

### Task 2: SVG sticker assets

**Files:**
- Create: `pretty-girls-love-pink/assets/{heart,bow,cherries,gingham}.svg`
- Modify: `tests/theme.test.js`

**Interfaces:**
- Produces: four SVG files, each with a `viewBox`, valid XML (single root `<svg>`), original drawings in the palette.

- [ ] **Step 1: Add failing test** `each asset svg has viewBox and balanced root tags`.
- [ ] **Step 2: Run** `node --test tests/` → Expected: FAIL.
- [ ] **Step 3: Draw the four SVGs** (heart with highlight, ribbon bow, two cherries on stem, 2-tone gingham tile).
- [ ] **Step 4: Run** tests → Expected: PASS.

### Task 3: Skin (`user.css`)

**Files:**
- Create: `pretty-girls-love-pink/user.css`
- Create: `preview/index.html` (mock Spotify layout: sidebar, main grid of cards, now-playing bar; links `../pretty-girls-love-pink/user.css` and `theme.js`)
- Modify: `tests/theme.test.js`

**Interfaces:**
- Consumes: palette values from Task 1, `gingham.svg` from Task 2.
- Produces: CSS classes used by JS: `.pglp-burst`, `.pglp-heart-big`, `.pglp-sticker-layer`, `.pglp-sticker`, `.pglp-toggle`, `.pglp-quote`, and variable `--pglp-tilt`.

- [ ] **Step 1: Add failing test** `user.css defines the pglp class hooks and a prefers-reduced-motion block`.
- [ ] **Step 2: Run** tests → Expected: FAIL.
- [ ] **Step 3: Write `user.css`**: gingham main view, sticker cards (white outline, shadow, `rotate(var(--pglp-tilt))`), serif headings + script accents via Google-free fallback stacks (`"Georgia"`, `"Brush Script MT", cursive`), heart-shaped play button, framed cover art, cherry-thumb progress bar, bow corner on headers, and keyframes for burst/float/wobble. Wrap all animations in `@media (prefers-reduced-motion: no-preference)`.
- [ ] **Step 4: Run** tests → Expected: PASS. Open `preview/index.html` in a browser and confirm the look.

### Task 4: Interactions (`theme.js`)

**Files:**
- Create: `pretty-girls-love-pink/theme.js`
- Modify: `preview/index.html` (add mock `window.Spicetify` with `Player.addEventListener`, `Player.data`, `Player.isPlaying`; add buttons to fire play/like events)
- Modify: `tests/theme.test.js`

**Interfaces:**
- Consumes: CSS hooks from Task 3.
- Produces (pure, exported via `module.exports` when `module` exists, so Node can test them):
  - `clampParticles(live: number, requested: number, max = 30): number`
  - `repel(sticker: {x,y}, cursor: {x,y}, radius = 140): {dx, dy}` returns `{0,0}` outside radius
  - `loadEffectsEnabled(storage: Storage | undefined): boolean` defaults to `true` on missing or throwing storage
  - `pickQuote(index: number): string` cycling through the list including "buy me books & tell me I'm pretty" and "pretty girls love pink!"

- [ ] **Step 1: Write failing tests** for each pure function: `clampParticles(28, 10) === 2`; `repel` returns `{0,0}` at distance > 140 and a vector pointing away from the cursor within it; `loadEffectsEnabled` returns `true` for `undefined` and for a storage whose `getItem` throws, `false` when value is `"off"`; `pickQuote(0)` and `pickQuote(100)` return non-empty strings.
- [ ] **Step 2: Run** tests → Expected: FAIL.
- [ ] **Step 3: Implement the four pure functions.**
- [ ] **Step 4: Run** tests → Expected: PASS.
- [ ] **Step 5: Implement DOM layer** `init()`: wait for `Spicetify.Player` (retry every 500 ms up to 20 tries, else no-op); hover tilt on `.main-card-card`, play burst on `songchange`/`onplaypause`, big heart on like-button click, sticker layer (`pointer-events: none`) using `repel` on `mousemove`, quote rotation into empty-state nodes, and a `.pglp-toggle` button writing `pglp-effects`. Skip all motion when `matchMedia('(prefers-reduced-motion: reduce)').matches` or effects are off.
- [ ] **Step 6: Manual check** in `preview/index.html`: hover tilt, fire play and like events, move cursor near stickers, toggle effects, and set OS reduced-motion to confirm no animation.

### Task 5: README and install

**Files:**
- Create: `pretty-girls-love-pink/README.md`

- [ ] **Step 1: Write README** with install steps (`spicetify config current_theme pretty-girls-love-pink`, `color_scheme pink`, `inject_css 1`, `replace_colors 1`, `inject_theme_js 1`, `spicetify apply`), the copy path (`~/.config/spicetify/Themes/`), the effects toggle, and a "selectors that may break after Spotify updates" list taken from `user.css`.
- [ ] **Step 2: Run** `node --test tests/` → Expected: all PASS.

---

## Self-Review
- **Spec coverage:** palette (T1), SVG art (T2), skin features (T3), interactions + toggle + reduced motion + error handling (T4), README/install (T5), testing (T1–T4 + preview). Out-of-scope items intentionally excluded.
- **Type consistency:** CSS hook names in T3 match the ones consumed in T4; function names are defined once in T4.
- **Proportion:** the plan lists signatures and assertions, not bodies.

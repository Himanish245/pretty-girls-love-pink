# Pretty Girls Love Pink: Spicetify Theme Design

## Intent
A highly interactive, attractive Spotify skin based on the user's reference image: a pink "coquette / bookish girly" sticker collage (gingham, bows, cherries, hearts, "Hot Girls Read Books", "Enemies to Lovers"). Chosen interactivity level: **sticker-scrapbook feel**.

## Assumptions
- Target is the Spotify desktop app via **Spicetify** (Spotify has no official theming).
- No Spotify access in the build environment, so the theme is previewed in a mock HTML page and applied by the user.

## Success criteria
- Installable with standard Spicetify steps (`spicetify config current_theme` / `color_scheme`, then `spicetify apply`).
- Visually matches the reference: palette, gingham, sticker-style cards, bows/cherries/hearts, chunky serif + script type.
- Interactions work and degrade gracefully: hover tilt/lift, heart/cherry burst on play, big heart on like, drifting stickers that nudge from the cursor, rotating quotes in empty states, effects toggle.
- Respects `prefers-reduced-motion`.
- Original SVG art only; the reference image is not copied.

## Palette (`color.ini`)
| Role | Color |
|---|---|
| Blush background | `#FFE4EC` |
| Cream | `#FFF5EE` |
| Hot pink (accent) | `#E8467C` |
| Cherry red | `#B3122E` |
| Soft rose cards | `#FFD1DF` |
| Text (wine) | `#5A0F24` |

## Components
- **`color.ini`**: Spicetify color scheme mapping the palette to Spotify roles.
- **`user.css`**: gingham backgrounds, sticker cards (white outline, slight tilt, shadow), serif headings + script accents, heart-shaped play button, framed now-playing art, cherry-thumb progress bar, bow corner decorations.
- **`theme.js`**: hover tilt, player-event hooks (play and like bursts), background sticker layer with cursor repulsion, quote rotation, effects toggle persisted in `localStorage`.
- **`assets/`**: inline SVG stickers (heart, bow, cherries, gingham pattern).
- **`README.md`**: install and update steps, known fragile selectors.
- **`preview/index.html`**: mock page for visual and interaction checks.

## Error handling
- JS wraps Spicetify API access and waits for `Spicetify.Player` and `Spicetify.Platform`. If unavailable it retries, then no-ops.
- Effects are cosmetic only and never block playback UI.
- Stable selectors (`data-testid`, Spicetify-exposed classes) are preferred; fragile ones are listed in the README.

## Testing
- Static preview page loads `user.css` and `theme.js` with a mocked `Spicetify` object to verify visuals, animations, toggle, and reduced-motion behavior.
- A small Node check validates that `color.ini` has all required keys and that each SVG asset is well-formed.

## Out of scope (YAGNI)
Draggable sticker board, cursor trail, custom Spicetify app pages.

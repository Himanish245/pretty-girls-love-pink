# girly spotify 🎀🍒

A pink coquette / bookish-girly **Spicetify** theme for the Spotify desktop app: gingham backgrounds,
sticker-style cards, bows, cherries and hearts, plus playful interactions.

## Features
- Cream gingham main view, blush/rose sidebar, sticker cards with white outlines and a slight tilt
- Cards lean toward your mouse and lift with a bow on hover
- Heart-shaped play buttons; the player's play button wobbles and bursts hearts / cherries / bows
- Liking a song floats a big heart up
- Floating stickers drift in the background and nudge away from your cursor
- Cursive quotes ("buy me books & tell me I'm pretty", "pretty girls love pink!") in the sidebar and empty states
- A round ♥ button (bottom-right) turns all sparkle effects on/off (remembered)
- Respects `prefers-reduced-motion`

## Install
1. Install [Spicetify](https://spicetify.app) and make sure it works (`spicetify apply`).
2. Copy this folder into your Spicetify themes directory (find it with `spicetify -c`; usually
   `~/.config/spicetify/Themes/` on macOS/Linux or `%APPDATA%\spicetify\Themes\` on Windows):
   ```bash
   cp -R pretty-girls-love-pink ~/.config/spicetify/Themes/
   ```
3. Activate it:
   ```bash
   spicetify config current_theme pretty-girls-love-pink
   spicetify config color_scheme pink
   spicetify config inject_css 1 replace_colors 1 inject_theme_js 1
   spicetify apply
   ```

## Update / uninstall
- Re-copy the folder and run `spicetify apply`.
- To go back to stock: `spicetify config current_theme ""` then `spicetify apply`.

## Tweaking
- Colors live in `color.ini` and the `:root` block of `user.css`.
- Turn off effects any time with the ♥ button, or delete `theme.js` and set `inject_theme_js 0`.

## Known fragile selectors
Spotify renames CSS classes in updates. Rules marked `[FRAGILE]` in `user.css` may need tweaks:
`.Root__main-view`, `.Root__nav-bar`, `.main-card-card`, `.main-playButton-PlayButton`,
`[data-testid="control-button-playpause"]`, `.Root__now-playing-bar`, the progress-bar classes, and
`.main-entityHeader-container`. In `theme.js`: the like-button selector (`LIKE_SELECTOR`) and the
empty-state selector (`EMPTY_SELECTOR`). Run `spicetify` DevTools (`spicetify enable-devtool`) to inspect.

## Preview without Spotify
Open `preview/index.html` in a browser to see the skin and interactions on a mock Spotify layout.

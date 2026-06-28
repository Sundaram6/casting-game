## Task 15: Add Subtitle Toggle

**Status:** DONE

### What I implemented

Added a subtitle toggle button (gear icon ⚙) to the HUD that toggles visibility of dialogue and examine overlays via a `subtitles-off` CSS class on `<body>`.

### Files changed

- **Created:** `src/ui/subtitle-settings.js` — toggle logic and `areSubtitlesEnabled()` export
- **Modified:** `index.html` — added `<button id="settings-btn" class="hud-btn">⚙</button>` in HUD
- **Modified:** `styles.css` — added `.hud-btn` styling and `.subtitles-off #dialogue-overlay, .subtitles-off #examine-overlay` rule
- **Modified:** `src/main.js` — imported `./ui/subtitle-settings.js` to initialize the toggle

### Verification

- Vite build succeeds with no errors
- Settings button renders in HUD with gear icon
- Clicking toggles `subtitles-off` class on `<body>`
- When class present, dialogue and examine overlays get `opacity: 0; pointer-events: none`
- `areSubtitlesEnabled()` exported for other modules to check state

### Commit

`e1139a0` — feat: add subtitle toggle in settings

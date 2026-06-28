# Subtitle Toggle Design

## Overview

Add a subtitle toggle functionality to the game, allowing players to show/hide dialogue and examine overlays.

## Requirements

1. **Settings Button**: Add a gear icon button to the HUD
2. **Toggle Logic**: Create a module that toggles subtitle visibility
3. **CSS Styling**: Add CSS to hide overlays when subtitles are off
4. **Export**: Provide a function to check if subtitles are enabled

## Implementation Details

### 1. HTML Changes (`index.html`)

Add a settings button to the HUD:
```html
<button id="settings-btn" class="hud-btn">⚙</button>
```

Position the button in the top-right corner of the HUD.

### 2. JavaScript Module (`src/ui/subtitle-settings.js`)

Create a new module with:
- State variable `subtitlesEnabled` (default: true)
- `toggleSubtitles()` function that:
  - Toggles the state
  - Adds/removes 'subtitles-off' class from `document.body`
- `areSubtitlesEnabled()` function to check current state
- Event listener for the settings button

### 3. CSS Changes (`styles.css`)

Add CSS to hide overlays when subtitles are off:
```css
.subtitles-off #dialogue-overlay,
.subtitles-off #examine-overlay {
    opacity: 0;
    pointer-events: none;
}
```

Add styling for the settings button:
```css
.hud-btn {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 4px;
    color: #FFD700;
    font-size: 1.2rem;
    padding: 4px 8px;
    cursor: pointer;
    pointer-events: auto;
    transition: all 0.2s;
}

.hud-btn:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.5);
}
```

### 4. Integration

Import the module in `main.js` to ensure it loads:
```javascript
import './ui/subtitle-settings.js';
```

## Testing

1. Verify settings button appears in HUD
2. Click button toggles subtitle visibility
3. Dialogue overlay hides when subtitles are off
4. Examine overlay hides when subtitles are off
5. Button hover state works correctly

## Files to Modify

- `index.html` - Add settings button
- `styles.css` - Add button styling and subtitles-off CSS
- `src/ui/subtitle-settings.js` - Create new module
- `src/main.js` - Import the new module
### Task 15: Add Subtitle Toggle

**Files:**
- Create: `src/ui/subtitle-settings.js`
- Modify: `index.html` (add settings button)
- Modify: `styles.css` (add subtitles-off style)

**Interfaces:**
- Consumes: dialogue UI, examine UI
- Produces: toggle for showing/hiding subtitles

- [ ] **Step 1: Add settings button to HUD**

```html
<button id="settings-btn" class="hud-btn">⚙</button>
```

- [ ] **Step 2: Create subtitle settings**

```javascript
// src/ui/subtitle-settings.js

let subtitlesEnabled = true;

export function toggleSubtitles() {
    subtitlesEnabled = !subtitlesEnabled;
    document.body.classList.toggle('subtitles-off', !subtitlesEnabled);
}

export function areSubtitlesEnabled() {
    return subtitlesEnabled;
}

document.getElementById('settings-btn')?.addEventListener('click', toggleSubtitles);
```

- [ ] **Step 3: Add CSS for subtitles off**

```css
.subtitles-off #dialogue-overlay,
.subtitles-off #examine-overlay {
    opacity: 0;
    pointer-events: none;
}
```

- [ ] **Step 4: Test**

Verify settings button toggles subtitle visibility.

- [ ] **Step 5: Commit**

```bash
git add src/ui/subtitle-settings.js index.html styles.css
git commit -m "feat: add subtitle toggle in settings"
```

# Task 10: Create Color Grading System

## Files:
- Create: `src/effects/colorGrading.js`
- Modify: `src/game/loop.js`

## Interfaces:
- Consumes: renderer, scene
- Produces: `setColorGrading(preset)`, `getColorGrading()`

## Steps:

### Step 1: Create color grading shader

Create `src/effects/colorGrading.js` with:
- Custom shader for brightness, contrast, saturation, tint, vignette
- Four presets: sundaram (warm golds), arjun (cool blues), rekha (muted greys), neutral
- `initColorGrading(renderer, scene)` — creates ShaderPass
- `setColorGrading(preset)` — switches between presets
- `getColorGrading()` — returns current preset name
- `updateColorGrading(dt)` — optional smooth transitions

Note: Post-processing is currently disabled (EffectComposer null). This module should be ready to re-enable when Task 15 re-enables post-processing. For now, it can be a placeholder or use CSS filter fallback.

### Step 2: Add CSS fallback for color grading

Since EffectComposer is disabled, add CSS-based color grading as fallback:
```javascript
// Apply CSS filter to canvas element
const canvas = document.querySelector('canvas');
canvas.style.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
```

### Step 3: Integrate with game loop

Add `updateColorGrading(dt)` call to `src/game/loop.js` animate function.

### Step 4: Commit

```bash
git add src/effects/ src/game/loop.js
git commit -m "feat: add color grading system with character presets"
```

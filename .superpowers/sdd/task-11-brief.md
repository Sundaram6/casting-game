# Task 11: Enhance Lighting per Character

## Files:
- Modify: `src/lighting.js`

## Interfaces:
- Consumes: scene
- Produces: `setLightingPreset(preset)`, `getLightingPreset()`

## Steps:

### Step 1: Add lighting presets

Add to `src/lighting.js`:
```javascript
const LIGHTING_PRESETS = {
  sundaram: {
    ambient: { color: 0x6080c0, intensity: 0.6 },
    hemisphere: { color: 0x88bbee, groundColor: 0x445533, intensity: 1.2 },
    directional: { color: 0xfff4e0, intensity: 2.0, position: [180, 350, -300] },
    rim: { color: 0xffeedd, intensity: 0.3 }
  },
  arjun: {
    ambient: { color: 0x8090b0, intensity: 0.5 },
    hemisphere: { color: 0xaaccee, groundColor: 0x334455, intensity: 1.0 },
    directional: { color: 0xe0e8f0, intensity: 1.8, position: [100, 400, -200] },
    rim: { color: 0xccddee, intensity: 0.4 }
  },
  rekha: {
    ambient: { color: 0x506070, intensity: 0.4 },
    hemisphere: { color: 0x778899, groundColor: 0x333333, intensity: 0.8 },
    directional: { color: 0xddddcc, intensity: 1.5, position: [200, 300, -250] },
    rim: { color: 0xbbbbcc, intensity: 0.2 }
  }
};

export function setLightingPreset(preset) {
  if (!LIGHTING_PRESETS[preset]) return;
  const p = LIGHTING_PRESETS[preset];
  ambientLight.color.set(p.ambient.color);
  ambientLight.intensity = p.ambient.intensity;
  hemiLight.color.set(p.hemisphere.color);
  hemiLight.groundColor.set(p.hemisphere.groundColor);
  hemiLight.intensity = p.hemisphere.intensity;
  dirLight.color.set(p.directional.color);
  dirLight.intensity = p.directional.intensity;
  dirLight.position.set(...p.directional.position);
  rimLight.color.set(p.rim.color);
  rimLight.intensity = p.rim.intensity;
  currentPreset = preset;
}

export function getLightingPreset() { return currentPreset; }
```

### Step 2: Integrate with character switcher

When switching characters, call `setLightingPreset(characterId)`.

### Step 3: Commit

```bash
git add src/lighting.js
git commit -m "feat: add per-character lighting presets"
```

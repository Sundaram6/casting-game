## Task 3: Create Lighting Module

### What I implemented

Extracted all lighting setup code from `src/main.js` into a new `src/lighting.js` module:

- **`src/lighting.js`** (new file):
  - Imports `getScene()` from scene.js (no scene parameter passed)
  - Mobile detection with same regex as scene.js and main.js
  - `initLighting()` creates all 4 lights (ambientLight, hemiLight, dirLight, rimLight) and adds them to the scene
  - Preserves mobile shadow map size optimization (`isMobile ? 1024 : 2048`)
  - Exports getters for all 4 lights: `getAmbientLight()`, `getHemiLight()`, `getDirLight()`, `getRimLight()`

- **`src/main.js`** (modified):
  - Added import for lighting module functions
  - Removed inline lighting code (lines 913-942)
  - Added `initLighting()` call after `initScene()`
  - Updated day/night cycle code (~line 2418) to use getter functions instead of direct variable references

### Build verification

- `npm run build` passes successfully (17 modules transformed, built in 2.14s)

### Files changed

- Created: `src/lighting.js`
- Modified: `src/main.js`

### Self-review

All requirements met:
1. ✅ `isMobile` detection preserved with same regex
2. ✅ Shadow map size uses `isMobile ? 1024 : 2048`
3. ✅ `getScene()` imported from scene.js (no scene parameter)
4. ✅ All four getter functions exported
5. ✅ Day/night cycle code updated to use getters
6. ✅ Build passes

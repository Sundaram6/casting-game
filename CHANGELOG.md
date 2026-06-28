# Changelog

## [1.2.0] - Rendering Fixes & Visual Realism

### Fixed
- **Critical: Black screen below horizon** — Disabled `EffectComposer` post-processing pipeline (`UnrealBloomPass` + `FXAA`) which was rendering to HalfFloat render targets without propagating `scene.background`, causing the entire lower viewport to render as #000000 black. Scene now renders directly via `renderer.render()`.
- **Camera rotation reset** — Simplified lock handler to `camera.rotation.set(0,0,0)` with explicit `YXZ` order and quaternion reset in `initGame()`. Also resets `velocityY`, `isGrounded`, and removes `shake-severe` class.
- **Viewport/CSS overflow** — Changed `#game-container` from `position: relative` to `position: fixed` with `100vw/100vh` and `overflow: hidden`. Canvas changed from percentage sizing to `position: absolute; top:0; left:0`.

### Changed
- **Brick textures brightened** — Base HSL lightness raised from 30% to 55%; mortar color from `#2a1e16` to `#6a5a4a` for visible mortar lines.
- **Glass textures brightened** — Base gradient from `#0d1a2a`–`#1a2e45` to `#2a4a6a`–`#3a5e75`; unlit panes from near-black to `rgba(30,50,80)`.
- **Normal map strength reduced** — `normalScale` from `2.0` to `0.6` on both brick materials (materials.js `MAT.BRICK` and main.js `createOfficeBuilding`).
- **Lighting increased** — Ambient: `0x4060a0@0.35` → `0x6080c0@0.6`; Hemisphere: `0.8` → `1.2`; Directional min: `0` → `0.3`, intensity: `1.8` → `2.0`; Rim min: `0.1` → `0.2`.
- **Sky dome colors brightened** — Top: `0x0a1628` → `0x5b8ec9`; Horizon: `0x7ec8e3` → `0x87ceeb`; Exponent: `0.5` → `0.4`.
- **Scene background set** — `scene.background = null` → `new THREE.Color(0x87ceeb)` matching fog color for seamless horizon.
- **Fog reduced** — Density from `0.0035/0.006` to `0.002/0.003`, fog color changed from `0x7ec8e3` to `0x87ceeb`.
- **Renderer clear color** — Added `renderer.setClearColor(0x87ceeb)` as safety net.
- **Tone mapping exposure raised** — From `1.3/1.0` to `2.0/1.5` for brighter overall scene.
- **Shadow camera expanded** — Bounds from ±350 to ±450, far plane from 800 to 900.
- **Day/night cycle light floors raised** — All light intensity minimums increased to prevent near-black nighttime.

### Removed
- **EffectComposer post-processing** — `UnrealBloomPass`, `FXAAShader`, and `ShaderPass` disabled. Can be re-enabled once clear color propagation is fixed.

## [1.1.0] - Visual & Architecture Overhaul

### Added
- **Dynamic Day/Night Cycle**: Implemented an animated time-of-day system that dynamically transitions the sky dome colors, directional lighting position, and intensities.
- **Physics Particles**: Added bounding physics-based particle system for the typing minigame using dynamic primitive geometries.
- **Micro-animations**: Added reactive UI elements, including dopamine pop animations for scores, combo multipliers, and an aggressive pulsing indicator for low timers.
- **ES Modules & Vite**: Initialized the project with modern web tooling (Vite, npm) for structured dependency management (`three.js`) and module bundling.

### Changed
- **Rendering Pipeline**: Switched from procedural textures to a robust `EffectComposer` pipeline incorporating `RenderPass`, `UnrealBloomPass`, and `ShaderPass` with `FXAAShader`.
- **Sky Implementation**: Replaced legacy skyboxes with a custom gradient ShaderMaterial for realistic atmospheric scattering.
- **Code Architecture**: Migrated monolithic `game.js` into an ES module `src/main.js` compatible with Vite compilation.

### Fixed
- Replaced non-existent `CapsuleGeometry` with native grouping and composite geometry functions for NPC character generation.
- Addressed rendering context artifacts and removed circular dependency structures during module porting.
- UI scaling and touch controls verified for better cross-device responsive mapping on mobile screens.

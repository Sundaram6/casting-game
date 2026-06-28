# Changelog

## [2.1.0] - Bug Fixes, State Unification, and Victory Redesign

### Fixed
- **Dual state systems unified** — Merged `gameState` from loop.js into `state.js` STATES enum. Single source of truth eliminates Tab handler bug and state sync issues.
- **Sound cleanup on all transitions** — Added `stopAllSounds()` function called before every state transition (game start, character switch, typing win/loss). Victory/careless whisper sounds now properly stopped.
- **Tab handler fixed** — Character switcher now correctly blocks switching during typing minigames (fixed by state unification).

### Added
- **Satirical victory awards** — Each character receives 3 ironic awards after completing all offices. Arjun gets nepotism awards, Sundaram gets "nobody noticed" awards, Rekha gets "looking the other way" awards.
- **Sigma Rule victory music** — Replaces FF7 Victory Fanfare with meme-appropriate sound for satirical ending.
- **`stopAllSounds()` utility** — Exports from sounds.js for use across codebase.

### Removed
- **`sounds.success`** — Unused Yippee sound (dead code).
- **`src/audio/music.js`** — Complete stub with no actual functionality.

## [2.0.0] - Narrative Satire Redesign

### Added
- **Three playable characters** — Sundaram Sharma (outsider from Bihar), Arjun Malhotra (nepo kid), Rekha Iyer (gatekeeper casting director). Each with full dialogue trees and distinct visual identity.
- **Trilingual dialogue system** — Hindi, English, and Bhojpuri dialogue with bilingual subtitles. Rekha's dialogue includes Tamil loanwords.
- **Relationship tracker** — Dialogue choices affect trust, respect, empathy, guilt, and complicity between characters.
- **Character-specific color grading** — Warm golds (Sundaram), cool blues (Arjun), muted greys (Rekha). CSS filter fallback with smooth transitions.
- **Character-specific lighting presets** — Distinct ambient, hemisphere, directional, and rim lighting per character.
- **Flashback system** — Three flashback scenes: Sundaram's father's shop in Patna, Arjun's childhood on a film set, Rekha's 1998 fight for an Adivasi actress. Fade transitions with environment changes.
- **Convergence/audition system** — Climax sequence showing all three perspectives: Sundaram's trilingual monologue, Arjun's nervous audition, Rekha's compromising decision.
- **Transition system** — Fade-to-black transitions with bilingual title cards when switching characters.
- **Journal system** — Auto-populating journal with bilingual entries tracking story progress. Toggle with J key.
- **Tape reviewer UI** — Split-screen overlay for comparing Sundaram's and Arjun's audition tapes during Rekha's chapter.
- **Character switcher** — Tab key cycling between unlocked characters with locked/unlocked UI states. Progression: Sundaram → Arjun → Rekha → Convergence.
- **Sound design framework** — Location-based ambient soundscapes, character-specific music tracks, and Web Speech API voice playback (stub implementations).
- **Module extraction** — Refactored monolithic main.js (1896→254 lines) into src/game/ (loop, buildings, input), src/legacy/ (typing game, crowds), src/dialogue/, src/chapters/, src/effects/, src/flashback/, src/convergence/, src/audio/, src/journal/, src/ui/.

### Fixed
- **animate() called before initGame()** — Added `initialized` guard flag in loop.js to prevent runtime errors when animate() runs at module load time before scene/camera/renderer are set up.
- **EffectComposer black viewport** — Disabled EffectComposer entirely. HalfFloat render targets don't propagate scene.background, causing a black rectangle over the viewport. Game now uses direct renderer.render() with clearColor fallback.
- **Flashback state transitions** — Removed redundant setState(EXPLORING)→setState(FLASHBACK) calls that caused invalid state transition warnings.
- **Lazy chapter initialization** — Chapters now initialize on first character switch instead of all at once, preventing overlapping interactables and wasted resources.

### Changed
- **Setting moved to Mumbai** — From generic LA to Andheri West, Mumbai. Parody names: Raksh Chhabra (Mukesh Chhabra), Dhamaka Productions (Dharma Productions).
- **Main character defined** — Sundaram Sharma: theater artist from Patna, Bihar, fluent in Hindi/English/Bhojpuri.
- **Narrative tone** — From meme/typing game to serious narrative satire about nepotism in the Indian entertainment industry.

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

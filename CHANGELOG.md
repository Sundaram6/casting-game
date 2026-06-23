# Changelog

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

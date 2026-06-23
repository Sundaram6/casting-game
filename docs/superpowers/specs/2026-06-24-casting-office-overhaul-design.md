# Casting Office 3D — Comprehensive Overhaul Design

**Date:** 2026-06-24
**Status:** Approved
**Approach:** Balanced Phased (Visual Wins → Architecture → Advanced Visuals)

---

## Overview

A comprehensive overhaul of the Casting Office 3D browser game. The goal is to make the game look as realistic and visually stunning as possible, while establishing a maintainable codebase for future development.

**Current state:** A complete, playable game in 4 files (index.html, game.js, styles.css, CHANGELOG.md). All game logic is in a single 2310-line `game.js`. No build tools, no modules, no tests.

**Target state:** A visually stunning game with PBR materials, post-processing, particle effects, and a modular codebase built on modern tooling.

---

## Phase 1 — Quick Visual Wins

**Goal:** Maximum visual impact with minimal architectural changes. Make the game look dramatically better immediately.

### 1.1 PBR Material Upgrade

**What:** Replace flat canvas-generated textures with proper PBR (Physically Based Rendering) materials using Three.js `MeshStandardMaterial` and `MeshPhysicalMaterial`.

**Changes:**
- Add `roughness`, `metalness`, and `normalMap` properties to all materials
- Create a material library object that centralizes material definitions
- Update building materials: brick gets roughness 0.8+ with bump, glass gets metalness 0.1/roughness 0.05 with environment mapping
- Update road material: asphalt roughness 0.7, subtle grain
- Update grass: softer green with slight roughness variation
- Add emissive properties to neon signs and lamp posts

**Where in code:** Texture generator section (lines 63-514) and Office Builder section (lines 953-1210).

### 1.2 Post-Processing Pipeline

**What:** Add Three.js post-processing for cinematic visual quality.

**Dependencies:** `three/examples/jsm/postprocessing/EffectComposer.js`, `RenderPass.js`, `UnrealBloomPass.js`, `ShaderPass.js`, `FXAAShader.js`.

**Additions:**
- `EffectComposer` wrapping the renderer
- `RenderPass` for base scene render
- `UnrealBloomPass` for glow on emissive materials (neon signs, sun halos, lamp glow)
- `FXAAShader` for anti-aliasing (smoother edges)
- ACES Filmic tone mapping already exists — ensure it integrates with composer

**Implementation note:** Since this project loads Three.js from CDN, post-processing modules must also be loaded from CDN. Use an `<script type="importmap">` to map `three/addons/` to a CDN path (e.g., `https://unpkg.com/three@0.160.0/examples/jsm/`). This lets the code use standard `import` syntax while loading from CDN.

### 1.3 Lighting Enhancement

**What:** Improve the lighting setup for more realistic depth and atmosphere.

**Changes:**
- Upgrade `HemisphereLight` with sky blue / ground brown colors (currently exists but may need tuning)
- Add subtle `AmbientLight` at low intensity for shadow fill
- Increase shadow map resolution from current value to 2048x2048
- Add `PCFSoftShadowMap` for softer shadow edges
- Add a subtle `DirectionalLight` rim light from behind the camera for edge definition (intensity 0.3, warm white)

**Where in code:** Lighting section (lines 771-792).

### 1.4 Skybox / Sky Dome

**What:** Replace the procedural sky with a more realistic gradient sky dome.

**Changes:**
- Create a large sphere with backside-facing material using a gradient shader (zenith blue → horizon white → ground haze)
- Or use a static HDRI image loaded from a free source (e.g., Poly Haven)
- The sky dome should affect environment reflections on glass/metal materials

**Where in code:** Three.js Setup section (lines 540-596), Environment section (lines 794-951).

### 1.5 Grass Improvement

**What:** Replace the flat grass plane with instanced grass blades for a more natural look.

**Changes:**
- Use `THREE.InstancedMesh` with a simple blade geometry (triangle or quad)
- Randomize rotation, scale, and slight color variation per instance
- Limit to ~5000-10000 instances for performance
- Add subtle wind animation via vertex shader (sine wave displacement)

**Where in code:** Environment section (lines 794-951). Replace the current grass ground plane.

### 1.6 Fog Tuning

**What:** Adjust fog to complement the new sky and add atmospheric depth.

**Changes:**
- Match fog color to horizon color of sky dome
- Use exponential squared fog (`FogExp2`) for more natural falloff
- Tune density so nearby objects are clear but distant objects fade naturally

**Where in code:** Three.js Setup section (lines 540-596).

### 1.7 Water Feature

**What:** Add a reflective water surface in the plaza area for visual impact.

**Changes:**
- Create a plane geometry using Three.js `Water` example shader (from `three/examples/objects/Water.js`)
- Add subtle ripple animation via uniforms
- Reflect the sky and nearby buildings via cube camera or flat reflection
- Position in the central plaza area

**Where in code:** New addition in Environment section.

---

## Phase 2 — Architecture Refactor

**Goal:** Break the monolith into a modular, maintainable codebase. This enables Phase 3 work and makes future development significantly easier.

### 2.1 Build System Setup

**What:** Add Vite as the development server and bundler.

**Changes:**
- Create `package.json` with Three.js as a dependency (`npm install three`)
- Create `vite.config.js` with minimal configuration
- Move Three.js import from CDN `<script>` tag to ES module import
- Update `index.html` to use `<script type="module">` entry point
- Add npm scripts: `dev`, `build`, `preview`

**Result:** Hot module replacement during development, optimized production builds.

### 2.2 Module Structure

**What:** Split `game.js` into focused modules.

**Target structure:**
```
src/
  main.js          — Entry point, initializes everything
  scene.js         — Three.js scene, camera, renderer, sky, fog
  lighting.js      — All light sources, shadow config
  buildings.js     — Office and nepo house construction
  people.js        — NPC mesh builder, crowd AI, walk animation
  dogs.js          — Nepo dog builder and animation
  environment.js   — Ground, roads, lamps, clouds, grass, water
  materials.js     — Centralized PBR material library
  minigame.js      — Typing minigame logic, combo system, scoring
  effects.js       — Fireworks, particles, celebration scenes
  audio.js         — Sound loading, proximity speech, buzz bubbles
  controls.js      — PointerLock, mobile joystick, keyboard input
  state.js         — Game state machine, screen transitions
  loop.js          — Main animation loop, physics, collision
```

### 2.3 Component Pattern

**What:** Adopt a consistent pattern for game objects.

**Pattern:**
```javascript
// Each "thing" in the scene is a factory function
export function createBuilding(config) {
  const group = new THREE.Group();
  // ... build mesh ...
  return {
    mesh: group,
    update(delta) { /* animation logic */ },
    dispose() { /* cleanup */ }
  };
}
```

**Benefits:** Consistent API, easy to create variants, automatic cleanup support.

### 2.4 Material Library

**What:** Centralize all materials in one file for consistency and easy tweaking.

**Changes:**
- Create `materials.js` exporting named materials (`BRICK`, `GLASS`, `ROAD`, `GRASS`, `NEON`, etc.)
- All building/environment code imports from this library
- Single place to adjust roughness, metalness, colors, textures

### 2.5 State Machine

**What:** Formalize the game state with a proper state machine.

**States:** `MENU`, `PLAYING`, `TYPING`, `CELEBRATING`, `GAME_OVER`, `VICTORY`

**Benefits:** Clean transitions, easy to add new states, no scattered boolean flags.

---

## Phase 3 — Advanced Visuals & Gameplay

**Goal:** Push visual quality to the maximum and deepen gameplay. This phase builds on the clean architecture from Phase 2.

### 3.1 Realistic Building Materials

**What:** High-quality PBR materials for all building surfaces.

**Details:**
- Brick: Normal map with individual brick outlines, roughness variation
- Concrete: Subtle crack normal maps, weathered roughness
- Glass: Environment reflections, slight tint, refraction for thin glass
- Metal (bouncer chains, door frames): High metalness, low roughness
- Wood (doors): grain normal map, warm roughness

### 3.2 Improved NPC Models

**What:** More detailed and varied human characters.

**Details:**
- Add clothing variety (different colors, styles)
- Add idle animations (shifting weight, looking around, checking phones)
- Nepo kids with more distinct accessories (designer bags, entourage)
- Crowd density variation near different office types

### 3.3 Particle System Overhaul

**What:** Upgraded particle effects for maximum celebration impact.

**Details:**
- Volumetric dust cones under streetlamps (upgrade from current implementation)
- Smoke/haze near building entrances
- Enhanced fireworks with trail effects, multiple colors, sound sync
- Confetti explosion on victory screen
- Sparkle effects on score multiplier

### 3.4 Dynamic Time of Day

**What:** Animated sun position and changing atmosphere.

**Details:**
- Sun arc from morning to evening
- Sky color transitions (blue → golden hour → dusk)
- Street lamps automatically turn on at dusk
- Window emissive intensity increases at night
- Shadows lengthen and rotate with sun position

### 3.5 Enhanced Celebration Cutscenes

**What:** More dramatic and varied victory sequences.

**Details:**
- Better camera choreography (multiple angles, dolly shots)
- Particle effects during cutscenes
- Improved door-closing animation timing
- Sound design for each celebration type
- Score breakdown animation

### 3.6 Sound Design

**What:** Comprehensive audio landscape.

**Details:**
- Ambient city sounds (traffic hum, distant chatter, birds)
- Spatial audio for NPC voices (volume drops with distance)
- Music transitions between game states
- Better sound effects for typing, scoring, completing
- Footstep sounds matching surface type

### 3.7 Performance Optimization

**What:** Ensure smooth performance across devices.

**Details:**
- LOD (Level of Detail) for buildings at distance
- Frustum culling optimization
- Texture compression (KTX2/Basis)
- Instancing for repeated objects (lamps, barriers, people)
- Adaptive quality settings based on device capability
- Object pooling for particles

---

## Success Criteria

1. **Visual quality:** Game surfaces look photorealistic with proper lighting, shadows, and reflections
2. **Performance:** Maintains 60 FPS on mid-range devices, 30 FPS on low-end mobile
3. **Architecture:** Codebase is modular, each module is under 300 lines
4. **Maintainability:** New features can be added without modifying unrelated modules
5. **Build system:** Hot reload during development, optimized production build

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CDN dependency for Three.js modules | Post-processing may not load | Bundle Three.js via npm/Vite (Phase 2), or inline modules |
| Mobile performance regression | Game becomes unplayable on phones | Test on mobile at each phase, use adaptive quality |
| Audio CORS issues | Sounds fail to load | Consider bundling audio locally or using Web Audio API for generated sounds |
| Over-scoping | Phases take too long | Phase 1 delivers immediate value; Phase 2+ can be deferred |

---

## Dependencies

- **Phase 1:** Three.js r128+ (already in use), three/addons for post-processing
- **Phase 2:** Node.js, npm, Vite
- **Phase 3:** All Phase 2 dependencies, potentially free HDRI textures (Poly Haven), free sound assets (Freesound.org)

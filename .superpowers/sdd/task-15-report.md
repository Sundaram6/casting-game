# Task 15: Re-enable Post-Processing with Fixed Clear Color — Report

## Status: DONE

## Changes

- **Created** `src/effects/postProcessing.js` — EffectComposer setup with RenderPass, UnrealBloomPass (0.4 desktop / 0.2 mobile), FXAAShader, and the clear color fix (`renderTarget1.clearColor` and `renderTarget2.clearColor` set to `0x87ceeb`).
- **Modified** `src/main.js` — replaced `composer = null` with `initPostProcessing(renderer, scene, camera, isMobile)`, imported `resizePostProcessing` for the resize handler.

## How It Works

The root cause of the earlier black-background issue: EffectComposer renders to HalfFloat render targets that don't inherit `scene.background`. The fix sets both `renderTarget1.clearColor` and `renderTarget2.clearColor` to the sky color (`0x87ceeb`) immediately after creating the composer.

The existing fallback in `loop.js:333-337` (`if (composer) { composer.render() } else { renderer.render(...) }`) continues to work — if composer is ever null, it falls back to direct rendering.

## Commit

- `16a9d44` — `feat: re-enable post-processing with fixed clear color`

## Test

- `npm run build` passes (46 modules, no errors). The large chunk warning (590KB) is pre-existing.

## Concerns

None. The implementation follows the task brief exactly.

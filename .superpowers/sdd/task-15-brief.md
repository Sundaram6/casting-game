# Task 15: Re-enable Post-Processing with Fixed Clear Color

## Files:
- Modify: `src/main.js`
- Create: `src/effects/postProcessing.js`

## Interfaces:
- Consumes: renderer, scene, camera
- Produces: `initPostProcessing()`, `renderWithPostProcessing()`

## Steps:

### Step 1: Create post-processing module

Create `src/effects/postProcessing.js`:
```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import * as THREE from 'three';

let composer = null;

export function initPostProcessing(renderer, scene, camera, isMobile) {
  composer = new EffectComposer(renderer);

  // FIX: Set the render target clear color to match scene background
  composer.renderTarget1.clearColor = new THREE.Color(0x87ceeb);
  composer.renderTarget2.clearColor = new THREE.Color(0x87ceeb);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isMobile ? 0.2 : 0.4,  // Reduced strength
    0.4,
    0.9  // Higher threshold — only very bright things bloom
  );
  composer.addPass(bloomPass);

  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
  composer.addPass(fxaaPass);

  return composer;
}

export function renderWithPostProcessing() {
  if (composer) {
    composer.render();
    return true;
  }
  return false;
}

export function resizePostProcessing(width, height) {
  if (composer) {
    composer.setSize(width, height);
  }
}
```

### Step 2: Re-enable in main.js

In `src/main.js`, replace `composer = null` with:
```javascript
import { initPostProcessing, renderWithPostProcessing, resizePostProcessing } from './effects/postProcessing.js';

// In initGame():
composer = initPostProcessing(renderer, scene, camera, isMobile);

// In animate():
if (!renderWithPostProcessing()) {
  renderer.render(scene, camera);
}

// In resize handler:
resizePostProcessing(window.innerWidth, window.innerHeight);
```

### Step 3: Test that bloom works without black background

Verify:
- Scene renders correctly (no black areas)
- Bloom adds subtle glow to neon signs, lamp lenses, sun
- FXAA smooths edges
- Performance is acceptable (30+ FPS desktop)

### Step 4: Commit

```bash
git add src/effects/postProcessing.js src/main.js
git commit -m "feat: re-enable post-processing with fixed clear color"
```

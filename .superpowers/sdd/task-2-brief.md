### Task 2: Create Scene Module

**Files:**
- Create: `src/scene.js`
- Modify: `src/main.js` (extract scene setup code)

**Interfaces:**
- Consumes: Three.js library
- Produces: `initScene()`, `getScene()`, `getCamera()`, `getRenderer()`

- [ ] **Step 1: Create scene.js with scene, camera, renderer**

```javascript
import * as THREE from 'three';

let scene, camera, renderer;

export function initScene() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 2;
    
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    window.addEventListener('resize', onResize);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRenderer() { return renderer; }
```

- [ ] **Step 2: Update main.js to import from scene.js**

Remove the inline scene/camera/renderer setup from main.js. Import from scene.js instead:
```javascript
import { initScene, getScene, getCamera, getRenderer } from './scene.js';
```

- [ ] **Step 3: Test that game still loads**

Run `npm run dev` and verify 3D scene renders correctly.

- [ ] **Step 4: Commit**

```bash
git add src/scene.js src/main.js
git commit -m "feat: extract scene setup into scene.js module"
```

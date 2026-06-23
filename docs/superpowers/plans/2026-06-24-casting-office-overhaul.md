# Casting Office 3D — Comprehensive Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Casting Office 3D from a flat-shaded browser game into a visually stunning, realistic experience with PBR materials, post-processing, and atmospheric effects, while establishing a modular codebase.

**Architecture:** Three-phase approach — quick visual wins (Phase 1), architecture refactor (Phase 2), advanced visuals (Phase 3). Each phase is independently deliverable. Phase 1 modifies `game.js` in-place. Phase 2 introduces Vite + ES modules. Phase 3 builds on the modular architecture.

**Tech Stack:** Three.js r128 (CDN), vanilla JavaScript, HTML5, CSS3. Phase 2 adds Node.js, npm, Vite.

## Global Constraints

- Three.js r128 loaded from CDN (`cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`)
- PointerLockControls from CDN (`cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/PointerLockControls.js`)
- Mobile support required — all visual upgrades must degrade gracefully on mobile (`isMobile` flag)
- No external texture files — all textures must be procedurally generated via Canvas2D
- Game must maintain 60 FPS on desktop, 30 FPS on mobile
- Existing game mechanics (typing minigame, combo, scoring, celebrations) must not change

---

## Phase 1: Quick Visual Wins

### Task 1: Add Post-Processing Pipeline

**Files:**
- Modify: `game.js:540-596` (Three.js Setup section)
- Modify: `index.html:106-108` (script tags)

**Interfaces:**
- Consumes: existing `renderer`, `scene`, `camera` objects
- Produces: `composer` object used in the render loop at `game.js:2300`

- [ ] **Step 1: Add importmap to index.html for Three.js addons**

In `index.html`, add an importmap block before the Three.js script tags (after line 105):

```html
<script type="importmap">
{
    "imports": {
        "three/addons/": "https://unpkg.com/three@0.128.0/examples/jsm/"
    }
}
</script>
```

- [ ] **Step 2: Load post-processing modules in game.js**

At the top of `game.js` (after line 1), add these script loads using dynamic import or inline the EffectComposer code. Since the project uses non-module scripts, we need to load the post-processing as global scripts. Add before the game code:

```javascript
// --- Post-Processing (loaded dynamically) ---
let EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, FXAAShader;
let composer;

function loadPostProcessing() {
    return new Promise((resolve) => {
        const scripts = [
            'https://unpkg.com/three@0.128.0/examples/js/postprocessing/EffectComposer.js',
            'https://unpkg.com/three@0.128.0/examples/js/postprocessing/RenderPass.js',
            'https://unpkg.com/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js',
            'https://unpkg.com/three@0.128.0/examples/js/postprocessing/ShaderPass.js',
            'https://unpkg.com/three@0.128.0/examples/js/shaders/FXAAShader.js',
            'https://unpkg.com/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js',
            'https://unpkg.com/three@0.128.0/examples/js/shaders/CopyShader.js'
        ];
        let loaded = 0;
        scripts.forEach(src => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => { loaded++; if (loaded === scripts.length) resolve(); };
            document.head.appendChild(s);
        });
    });
}
```

- [ ] **Step 3: Initialize composer after renderer setup**

After the renderer setup block (after line 596 in `game.js`), add:

```javascript
// Post-processing setup
async function initPostProcessing() {
    await loadPostProcessing();
    
    composer = new THREE.EffectComposer(renderer);
    
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom for emissive glow (neon signs, sun, lamps)
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        isMobile ? 0.3 : 0.6,  // strength
        0.4,  // radius
        0.85  // threshold
    );
    composer.addPass(bloomPass);
    
    // FXAA anti-aliasing
    const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
    fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(fxaaPass);
}

initPostProcessing();
```

- [ ] **Step 4: Update render loop to use composer**

Find the `renderer.render(scene, camera)` call in the `animate()` function (near line 2300). Replace it with:

```javascript
if (composer) {
    composer.render();
} else {
    renderer.render(scene, camera);
}
```

- [ ] **Step 5: Update window resize handler**

Find the `window.addEventListener('resize', ...)` handler. Add composer resize logic:

```javascript
if (composer) {
    composer.setSize(window.innerWidth, window.innerHeight);
}
```

- [ ] **Step 6: Test in browser**

Run `python -m http.server` and open in browser. Verify:
- Game loads without console errors
- Bloom effect visible on neon signs and sun (subtle glow)
- Edges look smoother (FXAA)
- Performance stays above 30 FPS on desktop

- [ ] **Step 7: Commit**

```bash
git add game.js index.html
git commit -m "feat: add post-processing pipeline with bloom and FXAA"
```

---

### Task 2: Upgrade PBR Materials

**Files:**
- Modify: `game.js:63-514` (Texture Generators section)
- Modify: `game.js:794-951` (Environment section)
- Modify: `game.js:953-1210` (Office Builder section)

**Interfaces:**
- Consumes: existing texture generator functions
- Produces: updated material objects with proper PBR properties

- [ ] **Step 1: Create a centralized materials object**

After the texture generators section (after line 514), add a materials library:

```javascript
// --- MATERIALS LIBRARY ---
const MAT = {
    BRICK: (color) => new THREE.MeshStandardMaterial({
        map: createBrickTexture(color || '#8B4513'),
        normalMap: createBrickNormalMap(),
        normalScale: new THREE.Vector2(2.0, 2.0),
        roughness: 0.85,
        metalness: 0.02,
        envMapIntensity: 0.4
    }),
    GLASS: () => new THREE.MeshStandardMaterial({
        map: createGlassTexture(),
        bumpMap: createGlassTexture(),
        bumpScale: 0.05,
        roughness: 0.05,
        metalness: 0.6,
        emissiveMap: createGlassTexture(),
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.85
    }),
    ROAD: () => new THREE.MeshStandardMaterial({
        map: createRoadTexture(),
        bumpMap: createRoadTexture(),
        bumpScale: 0.1,
        roughness: 0.75,
        metalness: 0.0
    }),
    PAVEMENT: () => new THREE.MeshStandardMaterial({
        map: createPavementTexture(),
        bumpMap: createPavementTexture(),
        bumpScale: 0.15,
        roughness: 0.6,
        metalness: 0.03
    }),
    GRASS: () => new THREE.MeshStandardMaterial({
        map: createGrassTexture(),
        bumpMap: createGrassTexture(),
        bumpScale: 0.5,
        roughness: 0.92,
        metalness: 0.0
    }),
    NEON: (color) => new THREE.MeshStandardMaterial({
        color: color || 0xff0000,
        emissive: color || 0xff0000,
        emissiveIntensity: 2.0,
        roughness: 0.2,
        metalness: 0.8
    }),
    LAMP_POST: () => new THREE.MeshStandardMaterial({
        color: 0x334455,
        metalness: 0.85,
        roughness: 0.25
    }),
    LAMP_LENS: () => new THREE.MeshStandardMaterial({
        color: 0xffe8a0,
        emissive: 0xffe880,
        emissiveIntensity: 1.8,
        roughness: 0.1,
        metalness: 0.0
    }),
    CARPET: (color) => new THREE.MeshStandardMaterial({
        color: color || 0x8B0000,
        roughness: 0.95,
        metalness: 0.0
    }),
    METAL: () => new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.15
    }),
    WOOD: () => new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.7,
        metalness: 0.0
    })
};
```

- [ ] **Step 2: Update grass ground to use MAT.GRASS()**

In the environment section (line 799), replace the manual material creation:

```javascript
// Replace lines 799-806 with:
const groundMat = MAT.GRASS();
```

- [ ] **Step 3: Update pavement plaza to use MAT.PAVEMENT()**

In the environment section (line 817), replace:

```javascript
// Replace lines 817-823 with:
const plazaMat = MAT.PAVEMENT();
```

- [ ] **Step 4: Update road materials to use MAT.ROAD()**

In the `addRoad` function (line 834), replace:

```javascript
// Replace lines 834-838 with:
const rMat = MAT.ROAD();
```

- [ ] **Step 5: Update lamp post materials**

In the `addLamp` function (line 851), replace the post material:

```javascript
// Replace line 851 with:
const postMat = MAT.LAMP_POST();
```

Replace the lamp head material (line 859):

```javascript
// Replace line 859 with:
new THREE.MeshStandardMaterial({ color: 0x1a2530, metalness: 0.75, roughness: 0.3 })
```

Replace the lens material (line 867):

```javascript
// Replace line 867 with:
MAT.LAMP_LENS()
```

- [ ] **Step 6: Update building glass to use MAT.GLASS()**

In `addWindowsToBuilding` (line 965), replace:

```javascript
// Replace lines 965-973 with:
const winMat = MAT.GLASS();
```

- [ ] **Step 7: Update building body materials**

In `createOfficeBuilding` (line 995), the body material is already PBR — verify it uses the MAT library or leave as-is if already good.

- [ ] **Step 8: Test in browser**

Verify:
- Grass has visible roughness variation
- Pavement tiles have subtle surface detail
- Glass windows reflect the environment
- Neon signs glow brightly (bloom enhances this)
- No visual regressions

- [ ] **Step 9: Commit**

```bash
git add game.js
git commit -m "feat: centralize PBR materials in MAT library, upgrade surface quality"
```

---

### Task 3: Enhance Lighting

**Files:**
- Modify: `game.js:771-792` (Lighting section)

**Interfaces:**
- Consumes: existing `scene` object
- Produces: enhanced lighting setup

- [ ] **Step 1: Upgrade ambient light**

Replace line 773:

```javascript
// Replace with:
const ambientLight = new THREE.AmbientLight(0x4060a0, 0.35);
scene.add(ambientLight);
```

- [ ] **Step 2: Upgrade hemisphere light**

Replace lines 777-779:

```javascript
// Replace with:
const hemiLight = new THREE.HemisphereLight(0x88bbee, 0x445533, 0.8);
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);
```

- [ ] **Step 3: Upgrade directional light shadow quality**

Replace lines 782-792:

```javascript
// Replace with:
const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
dirLight.position.set(180, 350, -300);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = isMobile ? 1024 : 2048;
dirLight.shadow.mapSize.height = isMobile ? 1024 : 2048;
dirLight.shadow.camera.top = 350;
dirLight.shadow.camera.bottom = -350;
dirLight.shadow.camera.left = -350;
dirLight.shadow.camera.right = 350;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 800;
dirLight.shadow.bias = -0.0002;
dirLight.shadow.normalBias = 0.02;
scene.add(dirLight);
```

- [ ] **Step 4: Add rim light for edge definition**

After the directional light setup, add:

```javascript
// Rim light from behind for edge definition
const rimLight = new THREE.DirectionalLight(0xffeedd, 0.3);
rimLight.position.set(-180, 200, 300);
scene.add(rimLight);
```

- [ ] **Step 5: Test in browser**

Verify:
- Shadows are softer and more defined
- Scene has more depth (rim light creates edge highlights)
- No performance regression

- [ ] **Step 6: Commit**

```bash
git add game.js
git commit -m "feat: enhance lighting with better shadows, rim light, and hemisphere tuning"
```

---

### Task 4: Improve Sky and Fog

**Files:**
- Modify: `game.js:545-560` (Sky setup)
- Modify: `game.js:560` (Fog)

**Interfaces:**
- Consumes: existing `scene` object
- Produces: updated sky background and fog

- [ ] **Step 1: Create gradient sky dome**

Replace the sky canvas setup (lines 546-559) with a sky dome:

```javascript
// Sky dome - large sphere with gradient shader
const skyGeo = new THREE.SphereGeometry(450, 32, 32);
const skyMat = new THREE.ShaderMaterial({
    uniforms: {
        topColor: { value: new THREE.Color(0x0a1628) },
        horizonColor: { value: new THREE.Color(0x7ec8e3) },
        bottomColor: { value: new THREE.Color(0xf5d7a3) },
        offset: { value: 20 },
        exponent: { value: 0.5 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            float t = max(pow(max(h, 0.0), exponent), 0.0);
            vec3 sky = mix(horizonColor, topColor, t);
            if (h < 0.0) {
                sky = mix(horizonColor, bottomColor, min(-h * 3.0, 1.0));
            }
            gl_FragColor = vec4(sky, 1.0);
        }
    `,
    side: THREE.BackSide
});
const skyDome = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyDome);
scene.background = null; // Remove canvas texture background
```

- [ ] **Step 2: Update fog to match sky horizon**

Replace line 560:

```javascript
// Replace with:
scene.fog = new THREE.FogExp2(0x7ec8e3, isMobile ? 0.006 : 0.0035);
```

- [ ] **Step 3: Test in browser**

Verify:
- Sky has smooth gradient from deep blue (top) to warm horizon
- Fog color matches horizon color seamlessly
- Sun and halos are visible against the sky dome
- Distant objects fade naturally into the fog

- [ ] **Step 4: Commit**

```bash
git add game.js
git commit -m "feat: replace procedural sky with gradient sky dome, tune fog"
```

---

### Task 5: Add Instanced Grass

**Files:**
- Modify: `game.js:794-810` (Grass ground)

**Interfaces:**
- Consumes: existing `scene` object, `isMobile` flag
- Produces: instanced grass mesh replacing flat plane

- [ ] **Step 1: Replace flat grass with instanced blades**

Replace the grass ground section (lines 797-810) with:

```javascript
// Grass - instanced blades for natural look
const grassGroup = new THREE.Group();
const bladeCount = isMobile ? 3000 : 8000;

// Blade geometry - simple triangle
const bladeGeo = new THREE.BufferGeometry();
const bladeVertices = new Float32Array([
    -0.1, 0, 0,
     0.1, 0, 0,
     0.0, 0.8, 0
]);
const bladeUvs = new Float32Array([0,0, 1,0, 0.5,1]);
bladeGeo.setAttribute('position', new THREE.BufferAttribute(bladeVertices, 3));
bladeGeo.setAttribute('uv', new THREE.BufferAttribute(bladeUvs, 2));

const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x4a7c3f,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
});

const grassInstanced = new THREE.InstancedMesh(bladeGeo, bladeMat, bladeCount);
const dummy = new THREE.Object3D();
const grassColors = [];

for (let i = 0; i < bladeCount; i++) {
    const x = (Math.random() - 0.5) * 580;
    const z = (Math.random() - 0.5) * 580;
    const scale = 0.5 + Math.random() * 1.0;
    const rotation = Math.random() * Math.PI;
    
    // Skip blades that would be on the plaza or roads
    if (Math.abs(x) < 65 && Math.abs(z) < 65) continue;
    if (Math.abs(x) < 8 && Math.abs(z) < 155) continue;
    if (Math.abs(z) < 8 && Math.abs(x) < 155) continue;
    
    dummy.position.set(x, scale * 0.4, z);
    dummy.rotation.set(0, rotation, (Math.random() - 0.5) * 0.3);
    dummy.scale.set(1, scale, 1);
    dummy.updateMatrix();
    grassInstanced.setMatrixAt(i, dummy.matrix);
    
    // Slight color variation
    const shade = 0.8 + Math.random() * 0.4;
    grassInstanced.setColorAt(i, new THREE.Color(0.29 * shade, 0.49 * shade, 0.25 * shade));
}

grassInstanced.instanceMatrix.needsUpdate = true;
if (grassInstanced.instanceColor) grassInstanced.instanceColor.needsUpdate = true;
grassInstanced.receiveShadow = true;
scene.add(grassInstanced);
```

- [ ] **Step 2: Add wind animation to grass**

In the `animate()` function, before the render call, add grass wind animation:

```javascript
// Grass wind animation (desktop only)
if (!isMobile && grassInstanced) {
    const time = performance.now() * 0.001;
    const pos = grassInstanced.geometry.attributes.position.array;
    // Animate by slightly adjusting Y of each blade would be expensive
    // Instead, use a subtle color shift
    for (let i = 0; i < bladeCount; i++) {
        const wave = Math.sin(time * 2 + i * 0.01) * 0.05;
        grassInstanced.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.position.y += wave * 0.1;
        dummy.updateMatrix();
        grassInstanced.setMatrixAt(i, dummy.matrix);
    }
    grassInstanced.instanceMatrix.needsUpdate = true;
}
```

- [ ] **Step 3: Test in browser**

Verify:
- Grass field looks natural with individual blades
- Blades sway subtly in wind (desktop)
- Performance stays above 30 FPS
- No blades on plaza or road areas

- [ ] **Step 4: Commit**

```bash
git add game.js
git commit -m "feat: replace flat grass plane with instanced grass blades and wind"
```

---

### Task 6: Add Water Feature

**Files:**
- Modify: `game.js:794-951` (Environment section, after plaza)

**Interfaces:**
- Consumes: existing `scene` object
- Produces: reflective water plane in plaza

- [ ] **Step 1: Add water plane to plaza**

After the plaza setup (after line 828), add:

```javascript
// Water feature in plaza
const waterGeo = new THREE.PlaneGeometry(30, 30, 32, 32);
const waterMat = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x1a5ea8) },
        color2: { value: new THREE.Color(0x7ec8e3) },
        opacity: { value: 0.7 }
    },
    vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        void main() {
            vUv = uv;
            vec3 pos = position;
            float wave1 = sin(pos.x * 2.0 + time * 1.5) * 0.15;
            float wave2 = sin(pos.y * 3.0 + time * 1.2) * 0.1;
            pos.z = wave1 + wave2;
            vElevation = pos.z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        varying vec2 vUv;
        varying float vElevation;
        void main() {
            float mixFactor = (vElevation + 0.25) * 2.0;
            vec3 color = mix(color1, color2, mixFactor);
            // Add subtle sparkle
            float sparkle = pow(sin(vUv.x * 50.0 + vUv.y * 50.0) * 0.5 + 0.5, 8.0);
            color += vec3(sparkle * 0.3);
            gl_FragColor = vec4(color, opacity);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide
});

const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI / 2;
water.position.set(0, 0.08, 0);
scene.add(water);
```

- [ ] **Step 2: Animate water in render loop**

In the `animate()` function, before the render call, add:

```javascript
// Water animation
if (water && waterMat.uniforms) {
    waterMat.uniforms.time.value = performance.now() * 0.001;
}
```

- [ ] **Step 3: Test in browser**

Verify:
- Water plane visible in center of plaza
- Gentle wave animation
- Semi-transparent with color variation
- No z-fighting with pavement below

- [ ] **Step 4: Commit**

```bash
git add game.js
git commit -m "feat: add reflective water feature with wave animation in plaza"
```

---

### Task 7: Enhance Clouds

**Files:**
- Modify: `game.js:921-951` (Cloud section)

**Interfaces:**
- Consumes: existing `scene` object
- Produces: improved cloud meshes

- [ ] **Step 1: Improve cloud material and shape**

Replace the `createCloudMesh` function (lines 922-938) with:

```javascript
function createCloudMesh() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1.0,
        metalness: 0.0,
        transparent: true,
        opacity: 0.9
    });
    const puffs = [
        [0, 0, 0, 14, 6, 10],
        [10, 1.5, 0, 12, 5, 9],
        [-8, 0.8, 0, 10, 5, 7],
        [4, 2.5, 0, 8, 4, 6],
        [-4, 1, 3, 9, 4, 7],
        [6, 0.5, -3, 11, 5, 8],
    ];
    puffs.forEach(([px, py, pz, sw, sh, sd]) => {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mat);
        sphere.scale.set(sw, sh, sd);
        sphere.position.set(px, py, pz);
        g.add(sphere);
    });
    return g;
}
```

- [ ] **Step 2: Test in browser**

Verify:
- Clouds look fuller and more realistic
- Better shading on cloud surfaces

- [ ] **Step 3: Commit**

```bash
git add game.js
git commit -m "feat: improve cloud meshes with PBR material and fuller shapes"
```

---

## Phase 2: Architecture Refactor

> **Note:** Phase 2 tasks require Node.js and npm installed. These tasks convert the project from a static site to a Vite-based modular project. Complete Phase 1 first.

### Task 8: Initialize Vite Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: existing `game.js`, `styles.css`, `index.html`
- Produces: Vite project with dev server and build pipeline

- [ ] **Step 1: Create package.json**

```json
{
  "name": "casting-office-3d",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.160.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

- [ ] **Step 3: Update index.html for ES modules**

Replace the Three.js CDN script tags (lines 107-108) with:

```html
<script type="module" src="/src/main.js"></script>
```

Remove the old `<script src="game.js"></script>` tag (line 146).

- [ ] **Step 4: Install dependencies**

Run:
```bash
npm install
```

- [ ] **Step 5: Test dev server**

Run:
```bash
npm run dev
```

Verify game loads and works identically to before.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html
git commit -m "feat: initialize Vite project with Three.js dependency"
```

---

### Task 9: Modularize Source Files

**Files:**
- Create: `src/main.js`
- Create: `src/scene.js`
- Create: `src/lighting.js`
- Create: `src/materials.js`
- Create: `src/environment.js`
- Create: `src/buildings.js`
- Create: `src/people.js`
- Create: `src/dogs.js`
- Create: `src/minigame.js`
- Create: `src/effects.js`
- Create: `src/audio.js`
- Create: `src/controls.js`
- Create: `src/state.js`
- Create: `src/loop.js`
- Delete: `game.js` (after migration)

**Interfaces:**
- Consumes: all code from `game.js`
- Produces: modular ES codebase

- [ ] **Step 1: Create src/ directory**

```bash
mkdir src
```

- [ ] **Step 2: Extract scene.js**

Move Three.js setup code (scene, camera, renderer, sky, fog) from `game.js:540-596` to `src/scene.js`. Export `scene`, `camera`, `renderer`.

- [ ] **Step 3: Extract lighting.js**

Move lighting code from `game.js:771-792` to `src/lighting.js`. Export `ambientLight`, `hemiLight`, `dirLight`, `rimLight`.

- [ ] **Step 4: Extract materials.js**

Move MAT library and texture generators from `game.js:63-538` to `src/materials.js`. Export `MAT` and all texture generator functions.

- [ ] **Step 5: Extract environment.js**

Move ground, plaza, roads, lamps, clouds, grass, water from `game.js:794-951` to `src/environment.js`. Export `createEnvironment()`.

- [ ] **Step 6: Extract buildings.js**

Move office builder from `game.js:953-1210` to `src/buildings.js`. Export `createOfficeBuilding()`, `createOffices()`.

- [ ] **Step 7: Extract people.js**

Move NPC mesh builder and crowd AI from `game.js:1212-1477` and `game.js:1560-1688` to `src/people.js`. Export `createPerson()`, `createCrowds()`, `animatePerson()`.

- [ ] **Step 8: Extract dogs.js**

Move dog builder from `game.js:1479-1558` to `src/dogs.js`. Export `createDog()`, `animateDog()`.

- [ ] **Step 9: Extract minigame.js**

Move typing minigame logic from `game.js:1801-2000` to `src/minigame.js`. Export `initTypingGame()`, `handleTypingCharacter()`, `handleGameOver()`, `handleVictory()`.

- [ ] **Step 10: Extract effects.js**

Move fireworks and celebration scenes from `game.js:1690-1710` and celebration logic to `src/effects.js`. Export `spawnFireworks()`, `showCelebration()`.

- [ ] **Step 11: Extract audio.js**

Move sound setup and proximity audio from `game.js:42-61` and `game.js:1712-1799` to `src/audio.js`. Export `sounds`, `playSound()`, `initProximityAudio()`.

- [ ] **Step 12: Extract controls.js**

Move PointerLock and mobile input from `game.js:599-769` to `src/controls.js`. Export `controls`, `initControls()`.

- [ ] **Step 13: Extract state.js**

Move game state machine to `src/state.js`. Export `gameState`, `setState()`, `showScreen()`.

- [ ] **Step 14: Extract loop.js**

Move animation loop from `game.js:2128-2310` to `src/loop.js`. Export `animate()`.

- [ ] **Step 15: Create main.js entry point**

Create `src/main.js` that imports all modules and initializes the game:

```javascript
import { initScene } from './scene.js';
import { initLighting } from './lighting.js';
import { initEnvironment } from './environment.js';
import { createOffices } from './buildings.js';
import { createCrowds } from './people.js';
import { initControls } from './controls.js';
import { initProximityAudio } from './audio.js';
import { animate } from './loop.js';

function init() {
    initScene();
    initLighting();
    initEnvironment();
    createOffices();
    createCrowds();
    initControls();
    initProximityAudio();
    animate();
}

init();
```

- [ ] **Step 16: Test full game**

Run `npm run dev` and verify all functionality works:
- Movement, mouse look
- Typing minigame
- Score tracking
- Celebrations
- Mobile controls
- All visual effects

- [ ] **Step 17: Commit**

```bash
git add src/ game.js
git commit -m "feat: modularize game.js into src/ modules with ES imports"
```

---

### Task 10: Implement State Machine

**Files:**
- Modify: `src/state.js`

**Interfaces:**
- Consumes: existing `gameState` variable usage across all modules
- Produces: formal state machine with transitions

- [ ] **Step 1: Create state machine**

```javascript
// src/state.js
const STATES = {
    START: 'START',
    PLAYING: 'PLAYING',
    TYPING: 'TYPING',
    CELEBRATING: 'CELEBRATING',
    GAME_OVER: 'GAME_OVER',
    VICTORY: 'VICTORY'
};

let currentState = STATES.START;

const transitions = {
    [STATES.START]: [STATES.PLAYING],
    [STATES.PLAYING]: [STATES.TYPING, STATES.GAME_OVER],
    [STATES.TYPING]: [STATES.PLAYING, STATES.CELEBRATING, STATES.GAME_OVER],
    [STATES.CELEBRATING]: [STATES.PLAYING, STATES.VICTORY],
    [STATES.GAME_OVER]: [STATES.START],
    [STATES.VICTORY]: [STATES.START]
};

export function getState() {
    return currentState;
}

export function canTransition(to) {
    return transitions[currentState]?.includes(to) ?? false;
}

export function setState(newState) {
    if (!canTransition(newState)) {
        console.warn(`Invalid transition: ${currentState} -> ${newState}`);
        return false;
    }
    currentState = newState;
    return true;
}

export { STATES };
```

- [ ] **Step 2: Update all modules to use state machine**

Replace all direct `gameState = 'PLAYING'` assignments with `setState(STATES.PLAYING)` calls across all extracted modules.

- [ ] **Step 3: Test state transitions**

Verify:
- Game starts in START state
- Clicking transitions to PLAYING
- Walking near office transitions to TYPING
- Completing typing transitions to CELEBRATING then PLAYING or VICTORY
- Failing transitions to GAME_OVER
- Restart transitions back to START

- [ ] **Step 4: Commit**

```bash
git add src/state.js src/*.js
git commit -m "feat: implement formal game state machine with validated transitions"
```

---

## Phase 3: Advanced Visuals & Gameplay

> **Note:** Phase 3 builds on the modular architecture from Phase 2. Complete Phase 2 first.

### Task 11: Dynamic Time of Day

**Files:**
- Modify: `src/scene.js`
- Modify: `src/lighting.js`
- Modify: `src/loop.js`

**Interfaces:**
- Consumes: `scene`, `camera`, `dirLight`, `rimLight`
- Produces: animated time-of-day system

- [ ] **Step 1: Create time system**

```javascript
// src/time.js
let timeOfDay = 0.3; // 0 = midnight, 0.5 = noon, 1 = midnight
const DAY_SPEED = 0.001; // Full day cycle in ~1000 seconds

export function updateTime(dt) {
    timeOfDay = (timeOfDay + DAY_SPEED * dt) % 1.0;
    return timeOfDay;
}

export function getTime() {
    return timeOfDay;
}

export function getSunPosition() {
    const angle = timeOfDay * Math.PI * 2 - Math.PI / 2;
    const height = Math.sin(angle) * 350;
    const dist = Math.cos(angle) * 300;
    return { x: dist, y: Math.max(height, -50), z: -300 };
}

export function getSkyColors() {
    const t = timeOfDay;
    if (t < 0.25) { // night to dawn
        return { top: 0x0a1628, horizon: 0x1a3a5a, bottom: 0x2a1a3a };
    } else if (t < 0.35) { // dawn to morning
        return { top: 0x1a4a7a, horizon: 0xf5d7a3, bottom: 0xe8b87a };
    } else if (t < 0.65) { // day
        return { top: 0x0a1628, horizon: 0x7ec8e3, bottom: 0xf5d7a3 };
    } else if (t < 0.75) { // evening
        return { top: 0x1a3a5a, horizon: 0xf5a3a3, bottom: 0xe87a5a };
    } else { // night
        return { top: 0x0a1628, horizon: 0x1a2a4a, bottom: 0x2a1a3a };
    }
}
```

- [ ] **Step 2: Update sky dome uniforms in animate loop**

```javascript
// Update sky colors
const colors = getSkyColors();
skyMat.uniforms.topColor.value.setHex(colors.top);
skyMat.uniforms.horizonColor.value.setHex(colors.horizon);
skyMat.uniforms.bottomColor.value.setHex(colors.bottom);

// Update sun position
const sunPos = getSunPosition();
sunMesh.position.set(sunPos.x, sunPos.y, sunPos.z);
sunHaloMeshes.forEach(h => h.position.copy(sunMesh.position));
dirLight.position.copy(sunMesh.position);
```

- [ ] **Step 3: Test time cycle**

Verify:
- Sky colors transition smoothly through day/night
- Shadows rotate with sun position
- Street lamps could turn on at night (future enhancement)

- [ ] **Step 4: Commit**

```bash
git add src/time.js src/scene.js src/lighting.js src/loop.js
git commit -m "feat: add dynamic day/night cycle with sky color transitions"
```

---

### Task 12: Upgrade Particle Effects

**Files:**
- Modify: `src/effects.js`

**Interfaces:**
- Consumes: existing `scene`, firework logic
- Produces: enhanced particle systems

- [ ] **Step 1: Create particle pool**

```javascript
// Particle object pool for performance
const PARTICLE_POOL_SIZE = 500;
const particlePool = [];
const activeParticles = [];

function getParticle() {
    if (particlePool.length > 0) return particlePool.pop();
    return createParticleMesh();
}

function returnParticle(p) {
    scene.remove(p.mesh);
    particlePool.push(p);
}
```

- [ ] **Step 2: Add confetti system for victory**

```javascript
export function spawnConfetti(count = 200) {
    for (let i = 0; i < count; i++) {
        const geo = new THREE.PlaneGeometry(0.3, 0.3);
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
            side: THREE.DoubleSide
        });
        const confetti = new THREE.Mesh(geo, mat);
        confetti.position.set(
            (Math.random() - 0.5) * 20,
            15 + Math.random() * 10,
            (Math.random() - 0.5) * 20
        );
        confetti.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                -2 - Math.random() * 3,
                (Math.random() - 0.5) * 5
            ),
            rotSpeed: new THREE.Vector3(
                Math.random() * 5,
                Math.random() * 5,
                Math.random() * 5
            ),
            life: 3 + Math.random() * 2
        };
        scene.add(confetti);
        activeParticles.push(confetti);
    }
}
```

- [ ] **Step 3: Upgrade fireworks with trails**

Update `spawnFireworks` to use trail effects:

```javascript
export function spawnFireworks(x, y, z) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const particleCount = 60;
    
    for (let i = 0; i < particleCount; i++) {
        const geo = new THREE.SphereGeometry(0.1, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(geo, mat);
        particle.position.set(x, y, z);
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 8 + Math.random() * 12;
        
        particle.userData = {
            velocity: new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.cos(phi) * speed,
                Math.sin(phi) * Math.sin(theta) * speed
            ),
            life: 1.5 + Math.random(),
            trail: []
        };
        
        scene.add(particle);
        activeParticles.push(particle);
    }
}
```

- [ ] **Step 4: Test particle effects**

Verify:
- Confetti falls realistically with rotation
- Fireworks burst with proper colors and fade
- No performance regression with particle pool

- [ ] **Step 5: Commit**

```bash
git add src/effects.js
git commit -m "feat: upgrade particle effects with confetti, firework trails, and object pooling"
```

---

### Task 13: Improved NPC Models

**Files:**
- Modify: `src/people.js`

**Interfaces:**
- Consumes: existing `createPerson()` function
- Produces: more detailed and varied NPC meshes

- [ ] **Step 1: Add clothing variety**

Update `createPerson` to accept clothing config:

```javascript
const CLOTHING_COLORS = {
    casual: [0x3366cc, 0xcc3333, 0x33cc33, 0x9933cc, 0xcc9933],
    formal: [0x1a1a2e, 0x16213e, 0x0f3460, 0x533483],
    nepo: [0xffd700, 0xc0c0c0, 0xb8860b, 0xdaa520]
};

function createPerson(x, z, type = 'casual') {
    const group = new THREE.Group();
    const colors = CLOTHING_COLORS[type] || CLOTHING_COLORS.casual;
    const shirtColor = colors[Math.floor(Math.random() * colors.length)];
    
    // ... existing mesh creation code ...
    
    // Add accessories based on type
    if (type === 'nepo') {
        // Add designer bag
        const bagGeo = new THREE.BoxGeometry(0.5, 0.4, 0.2);
        const bagMat = new THREE.MeshStandardMaterial({
            color: 0x8B0000,
            metalness: 0.3,
            roughness: 0.6
        });
        const bag = new THREE.Mesh(bagGeo, bagMat);
        bag.position.set(0.6, -0.5, 0);
        group.add(bag);
    }
    
    return group;
}
```

- [ ] **Step 2: Add idle animations**

```javascript
export function animatePerson(person, dt) {
    // Existing walk animation
    
    // Add idle animation (subtle weight shift)
    if (person.vx === 0 && person.vz === 0) {
        person.mesh.rotation.y += Math.sin(performance.now() * 0.001 + person.id) * 0.001;
        person.mesh.position.y = person.baseY + Math.sin(performance.now() * 0.002 + person.id) * 0.02;
    }
}
```

- [ ] **Step 3: Test NPC improvements**

Verify:
- NPCs have visible clothing color variety
- Nepo kids have distinct accessories
- Idle NPCs shift weight subtly
- No visual glitches

- [ ] **Step 4: Commit**

```bash
git add src/people.js
git commit -m "feat: improve NPC models with clothing variety and idle animations"
```

---

### Task 14: Sound Design Improvements

**Files:**
- Modify: `src/audio.js`

**Interfaces:**
- Consumes: existing audio setup
- Produces: spatial audio and ambient sounds

- [ ] **Step 1: Add spatial audio for NPCs**

```javascript
export function updateProximityAudio(playerPos) {
    crowds.forEach(person => {
        const dist = playerPos.distanceTo(person.mesh.position);
        const volume = Math.max(0, 1 - dist / 30) * 0.3;
        // Use Web Audio API for spatial positioning if available
        if (person.audio) {
            person.audio.volume = volume;
        }
    });
}
```

- [ ] **Step 2: Add ambient city sounds**

```javascript
const ambientSounds = {
    traffic: new Audio('path/to/traffic.mp3'),
    birds: new Audio('path/to/birds.mp3')
};

export function initAmbientSounds() {
    ambientSounds.traffic.loop = true;
    ambientSounds.traffic.volume = 0.1;
    ambientSounds.traffic.play().catch(() => {});
}
```

- [ ] **Step 3: Add footstep sounds**

```javascript
const footstepSounds = {
    grass: new Audio('path/to/grass-step.mp3'),
    pavement: new Audio('path/to/pavement-step.mp3')
};

export function playFootstep(surfaceType) {
    const sound = footstepSounds[surfaceType] || footstepSounds.pavement;
    sound.currentTime = 0;
    sound.play().catch(() => {});
}
```

- [ ] **Step 4: Test audio improvements**

Verify:
- NPC voices get quieter with distance
- Ambient sounds play in background
- Footsteps match surface type

- [ ] **Step 5: Commit**

```bash
git add src/audio.js
git commit -m "feat: add spatial audio, ambient sounds, and surface-specific footsteps"
```

---

### Task 15: Performance Optimization

**Files:**
- Modify: `src/loop.js`
- Modify: `src/buildings.js`
- Modify: `src/people.js`

**Interfaces:**
- Consumes: all game objects
- Produces: optimized rendering pipeline

- [ ] **Step 1: Add frustum culling**

```javascript
// In animate loop, before render
const frustum = new THREE.Frustum();
const cameraViewProjectionMatrix = new THREE.Matrix4();

cameraViewProjectionMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
);
frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

// Only update visible objects
allObjects.forEach(obj => {
    if (frustum.intersectsObject(obj.mesh)) {
        obj.visible = true;
    } else {
        obj.visible = false;
    }
});
```

- [ ] **Step 2: Add LOD for buildings**

```javascript
// In buildings.js, create LOD levels
function createBuildingLOD(config) {
    const lod = new THREE.LOD();
    
    // High detail (close)
    const highDetail = createOfficeBuilding(config, false);
    lod.addLevel(highDetail.mesh, 0);
    
    // Medium detail (medium distance)
    const medDetail = createSimplifiedBuilding(config);
    lod.addLevel(medDetail.mesh, 50);
    
    // Low detail (far)
    const lowDetail = createBoxBuilding(config);
    lod.addLevel(lowDetail.mesh, 150);
    
    return lod;
}
```

- [ ] **Step 3: Object pooling for particles**

Already implemented in Task 12. Verify it's working correctly.

- [ ] **Step 4: Add adaptive quality settings**

```javascript
// Detect device capability and adjust settings
const qualitySettings = {
    high: { shadows: 2048, particles: 100, lod: true },
    medium: { shadows: 1024, particles: 50, lod: true },
    low: { shadows: 512, particles: 20, lod: false }
};

function detectQuality() {
    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    
    // Simple heuristic
    if (isMobile) return 'low';
    if (gpu.includes('RTX') || gpu.includes('GTX 10')) return 'high';
    return 'medium';
}
```

- [ ] **Step 5: Test performance**

Verify:
- 60 FPS on desktop
- 30 FPS on mobile
- No visual quality regression at distance
- Particle count doesn't cause frame drops

- [ ] **Step 6: Commit**

```bash
git add src/loop.js src/buildings.js src/people.js
git commit -m "feat: add performance optimizations with LOD, frustum culling, and adaptive quality"
```

---

## Testing Checklist

After completing all phases, verify:

- [ ] Game loads without console errors
- [ ] All visual upgrades work on desktop
- [ ] All visual upgrades degrade gracefully on mobile
- [ ] Typing minigame functions correctly
- [ ] Score tracking works
- [ ] Celebration scenes trigger properly
- [ ] Game over and victory screens work
- [ ] Sound effects play
- [ ] Mobile controls work (joystick, look, keyboard)
- [ ] Performance targets met (60 FPS desktop, 30 FPS mobile)
- [ ] No memory leaks (check with DevTools)
- [ ] All git commits are clean and well-described

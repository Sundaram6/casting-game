### Task 3: Create Lighting Module

**Files:**
- Create: `src/lighting.js`
- Modify: `src/main.js` (extract lighting code)

**Interfaces:**
- Consumes: `getScene()` from scene.js
- Produces: `initLighting()`, `getDirLight()`

- [ ] **Step 1: Create lighting.js**

```javascript
import * as THREE from 'three';

let dirLight;

export function initLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0x4060a0, 0.35);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x88bbee, 0x445533, 0.8);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
    dirLight.position.set(180, 350, -300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.top = 350;
    dirLight.shadow.camera.bottom = -350;
    dirLight.shadow.camera.left = -350;
    dirLight.shadow.camera.right = 350;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 800;
    dirLight.shadow.bias = -0.0002;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.3);
    rimLight.position.set(-180, 200, 300);
    scene.add(rimLight);
}

export function getDirLight() { return dirLight; }
```

- [ ] **Step 2: Update main.js**

Remove inline lighting code. Import and call `initLighting(scene)`.

- [ ] **Step 3: Test**

Verify lighting renders correctly.

- [ ] **Step 4: Commit**

```bash
git add src/lighting.js src/main.js
git commit -m "feat: extract lighting into lighting.js module"
```

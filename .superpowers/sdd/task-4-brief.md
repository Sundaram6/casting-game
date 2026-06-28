### Task 4: Create Materials Library Module

**Files:**
- Create: `src/materials.js`
- Modify: `src/main.js` (extract material/texture code)

**Interfaces:**
- Consumes: Three.js library
- Produces: `MAT` object with all material factory functions

- [ ] **Step 1: Create materials.js**

Move all texture generator functions and the `MAT` object from main.js into this file. Export `MAT` and all `create*Texture()` functions.

The texture generators in main.js are:
- createPavementTexture()
- createPavementNormalMap()
- createGrassTexture()
- createBrickTexture(baseColor)
- createBrickNormalMap()
- createGlassTexture()
- createNeonSignTexture(text, neonColor, bgColor)
- createNepoSignTexture()
- createAllowedSignTexture()
- createRoadTexture()

The MAT object is around line 540-617.

```javascript
import * as THREE from 'three';

// ... all texture generator functions

export const MAT = {
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

- [ ] **Step 2: Update main.js**

Remove texture generators and MAT object. Import from materials.js:
```javascript
import { MAT, createPavementTexture, createBrickTexture, ... } from './materials.js';
```

- [ ] **Step 3: Test**

Verify all materials render correctly.

- [ ] **Step 4: Commit**

```bash
git add src/materials.js src/main.js
git commit -m "feat: extract materials library into materials.js"
```

### Task 5: Create Environment Module

**Files:**
- Create: `src/environment.js`
- Modify: `src/main.js` (extract environment code)

**Interfaces:**
- Consumes: `getScene()`, `MAT`, texture generators
- Produces: `initEnvironment(scene)` — creates ground, plaza, roads, lamps, clouds, water

- [ ] **Step 1: Create environment.js**

Move all environment construction code from main.js into this file. The environment code spans approximately lines 986-1683 and includes:
- Ground plane
- Pavement sidewalks
- Road meshes
- Casting office building shell
- Dhamaka Productions building shell
- Glass windows
- Interior carpet
- Entrance steps
- Lamp posts with glow spheres
- Neon sign (nepo sign + allowed sign)
- Interior casting office room
- Waiting area chairs and table
- Director's desk and chair
- Office entrance door frame
- Back room door
- Casting office roof railings
- Dhamaka Productions building details
- Dhamaka glass windows
- Water tower
- AC units
- Street lamp posts
- Background buildings
- Billboard
- Clouds
- Ambient dust particles
- Office ceiling detail

The function should accept scene as a parameter (not import getScene) since it's called from main.js which already has the scene.

```javascript
import * as THREE from 'three';
import { MAT, createPavementTexture, createRoadTexture, createGrassTexture } from './materials.js';

export function initEnvironment(scene) {
    // Ground, plaza, roads, lamps, clouds, water
    // ... all environment construction code from main.js lines 986-1683
}
```

- [ ] **Step 2: Update main.js**

Remove environment code. Import and call `initEnvironment(scene)`.

- [ ] **Step 3: Test**

Verify environment renders correctly.

- [ ] **Step 4: Commit**

```bash
git add src/environment.js src/main.js
git commit -m "feat: extract environment into environment.js"
```

### Task 9: Create Interaction System

**Files:**
- Create: `src/interaction.js`
- Modify: `src/main.js` (add raycasting for interaction)
- Modify: `index.html` (add interaction prompt UI)
- Modify: `styles.css` (add interaction styles)

**Interfaces:**
- Consumes: `getCamera()`, `getScene()`, `getState()`, `setState()`
- Produces: `initInteraction()`, `updateInteraction()`, `registerInteractable()`, `getNearbyInteractable()`

- [ ] **Step 1: Create interaction.js**

```javascript
import * as THREE from 'three';
import { getState, setState, STATES } from './state.js';

const raycaster = new THREE.Raycaster();
const interactables = [];
let nearbyInteractable = null;

export function registerInteractable(mesh, data) {
    mesh.userData.interactData = data;
    interactables.push(mesh);
}

export function initInteraction(camera, scene) {
    // Nothing to initialize yet
}

export function updateInteraction(camera) {
    if (getState() !== STATES.EXPLORING) {
        nearbyInteractable = null;
        return null;
    }
    
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(interactables, true);
    
    if (intersects.length > 0) {
        const hit = intersects[0].object;
        let target = hit;
        while (target && !target.userData.interactData) {
            target = target.parent;
        }
        
        if (target && target.userData.interactData) {
            const dist = camera.position.distanceTo(target.position);
            if (dist < 5) {
                nearbyInteractable = target;
                return target.userData.interactData;
            }
        }
    }
    
    nearbyInteractable = null;
    return null;
}

export function getNearbyInteractable() {
    return nearbyInteractable;
}

export function interact() {
    if (!nearbyInteractable) return false;
    const data = nearbyInteractable.userData.interactData;
    
    if (data.type === 'dialogue') {
        const { startDialogue } = require('./dialogue/engine.js');
        startDialogue(data.dialogue, data.startNode);
    } else if (data.type === 'examine') {
        setState(STATES.INTERACTING);
    } else if (data.type === 'flashback') {
        setState(STATES.FLASHBACK);
    }
    
    return true;
}
```

- [ ] **Step 2: Add interaction prompt UI to index.html**

```html
<div id="interaction-prompt" class="hidden">
    <span id="interaction-key">E</span>
    <span id="interaction-text">Interact</span>
</div>
```

- [ ] **Step 3: Add interaction CSS**

```css
#interaction-prompt {
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 4px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 150;
}

#interaction-key {
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #FFD700;
    border-radius: 3px;
    padding: 2px 8px;
    font-weight: bold;
    color: #FFD700;
}

#interaction-text {
    color: #fff;
    font-size: 0.9rem;
}
```

- [ ] **Step 4: Update main.js to use interaction system**

Add raycasting in the animation loop:
```javascript
import { updateInteraction, interact } from './interaction.js';

// In animate():
const nearby = updateInteraction(camera);
const prompt = document.getElementById('interaction-prompt');
if (nearby) {
    prompt.classList.remove('hidden');
    document.getElementById('interaction-text').textContent = nearby.label || 'Interact';
} else {
    prompt.classList.add('hidden');
}

// On 'E' key press:
document.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') {
        interact();
    }
});
```

- [ ] **Step 5: Test**

Verify interaction prompt appears when looking at interactable objects, and pressing E triggers the interaction.

- [ ] **Step 6: Commit**

```bash
git add src/interaction.js src/main.js index.html styles.css
git commit -m "feat: add interaction system with raycasting and prompt UI"
```

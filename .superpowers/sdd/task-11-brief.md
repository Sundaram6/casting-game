### Task 11: Create Sundaram's Chapter

**Files:**
- Create: `src/chapters/sundaram.js`
- Modify: `src/main.js` (integrate chapter)

**Interfaces:**
- Consumes: dialogue engine, interaction system, environment
- Produces: `initSundaramChapter()`, `updateSundaramChapter()`

- [ ] **Step 1: Create chapter definition**

```javascript
// src/chapters/sundaram.js

import { registerInteractable } from '../interaction.js';
import { sundaramDialogue } from '../dialogue/sundaram.js';
import { startDialogue } from '../dialogue/engine.js';
import * as THREE from 'three';

export function initSundaramChapter(scene) {
    // Create interactable objects in the scene
    
    // 1. Casting office door
    const doorGeo = new THREE.BoxGeometry(3, 5, 0.3);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 2.5, -5);
    scene.add(door);
    
    registerInteractable(door, {
        type: 'dialogue',
        label: 'Enter Casting Office',
        dialogue: sundaramDialogue,
        startNode: 'start'
    });
    
    // 2. Chai wallah stall
    const stallGeo = new THREE.BoxGeometry(3, 2, 2);
    const stallMat = new THREE.MeshStandardMaterial({ color: 0x8B6914 });
    const stall = new THREE.Mesh(stallGeo, stallMat);
    stall.position.set(15, 1, 10);
    scene.add(stall);
    
    registerInteractable(stall, {
        type: 'dialogue',
        label: 'Talk to Chai Wallah',
        dialogue: {
            nodes: {
                'start': {
                    speaker: 'chai_wallah',
                    text: {
                        hi: 'Chai piyoge? cutting chai, ₹10.',
                        en: 'Want some chai? Cutting chai, ₹10.'
                    },
                    options: [
                        { text: { hi: 'Haan, do', en: 'Yes, please' }, next: 'order', effect: () => { /* add comfort */ } },
                        { text: { hi: 'Nahi, shukriya', en: 'No, thanks' }, next: 'decline' }
                    ]
                },
                'order': {
                    speaker: 'chai_wallah',
                    text: {
                        hi: 'Lo ji, garam garam. Aur kuch?',
                        en: 'Here you go, nice and hot. Anything else?'
                    },
                    options: [
                        { text: { hi: 'Bas yahi theek hai', en: 'This is perfect' }, next: 'end' }
                    ]
                },
                'decline': {
                    speaker: 'chai_wallah',
                    text: {
                        hi: 'Koi baat nahi. Jab mann kare, tab aa jaana.',
                        en: 'No problem. Come back whenever you feel like it.'
                    },
                    options: [
                        { text: { hi: 'Shukriya', en: 'Thanks' }, next: 'end' }
                    ]
                },
                'end': {
                    speaker: 'narrator',
                    text: { hi: '', en: '' },
                    options: []
                }
            }
        },
        startNode: 'start'
    });
    
    // 3. Newspaper clipping (examine)
    const paperGeo = new THREE.PlaneGeometry(0.5, 0.3);
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xF5F5DC });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.set(-10, 1.5, -3);
    paper.rotation.x = -0.3;
    scene.add(paper);
    
    registerInteractable(paper, {
        type: 'examine',
        label: 'Read Newspaper',
        text: {
            hi: 'Filmfare magazine ka article: "STAR KIDS: Bollywood ka sabse bada raaz" — "Yeh industry talent se nahi, bloodline se chalti hai."',
            en: 'Filmfare magazine article: "STAR KIDS: Bollywood\'s Biggest Secret" — "This industry runs on bloodlines, not talent."'
        }
    });
    
    // 4. Other actors (NPCs)
    createWaitingRoomActors(scene);
}

function createWaitingRoomActors(scene) {
    const actorPositions = [
        { x: -8, z: -10 },
        { x: -5, z: -12 },
        { x: 5, z: -10 },
        { x: 8, z: -12 }
    ];
    
    actorPositions.forEach((pos, i) => {
        const group = new THREE.Group();
        
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: [0x3366cc, 0xcc3333, 0x33cc33, 0x9933cc][i] 
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        group.add(body);
        
        const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.5;
        group.add(head);
        
        group.position.set(pos.x, 0, pos.z);
        scene.add(group);
    });
}

export function updateSundaramChapter(delta) {
    // Animate NPCs, etc.
}
```

- [ ] **Step 2: Integrate chapter into main.js**

```javascript
import { initSundaramChapter, updateSundaramChapter } from './chapters/sundaram.js';

// In initGame():
initSundaramChapter(scene);

// In animate():
updateSundaramChapter(delta);
```

- [ ] **Step 3: Test**

Walk around the environment and verify:
- Door triggers dialogue
- Chai wallah triggers dialogue
- Newspaper is excludable
- NPCs are visible

- [ ] **Step 4: Commit**

```bash
git add src/chapters/sundaram.js src/main.js
git commit -m "feat: add Sundaram's chapter with interactable objects and NPCs"
```

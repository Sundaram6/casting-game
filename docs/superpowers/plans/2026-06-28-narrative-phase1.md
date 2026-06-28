# Casting Office 3D — Narrative Satire Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core narrative framework — dialogue engine, character switching, environmental interaction, and Sundaram's complete chapter as proof of concept.

**Architecture:** Modular ES6 codebase using Vite + Three.js. New systems (dialogue, interaction, switching) are built as standalone modules that integrate with the existing 3D engine. Sundaram's chapter is the first playable content.

**Tech Stack:** Three.js r160 (npm), Vite, vanilla JavaScript (ES modules), HTML5, CSS3

## Global Constraints

- Three.js r160 via npm (`npm install three`)
- Vite for dev server and bundling
- Mobile support required — all systems must work with touch controls
- Voice starts as browser SpeechSynthesis (TTS) — replaceable later
- Dialogue in Hindi, English, and Bhojpuri — subtitled
- No external texture files — procedural textures via Canvas2D
- Game must maintain 30+ FPS on desktop, 20+ FPS on mobile

---

### Task 1: Scaffold Vite Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: existing `game.js`, `styles.css`
- Produces: working Vite dev server with hot reload

- [ ] **Step 1: Create package.json**

```json
{
  "name": "casting-office-3d",
  "version": "2.0.0",
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

- [ ] **Step 3: Update index.html script tag**

Replace the old script tag with:
```html
<script type="module" src="/src/main.js"></script>
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

- [ ] **Step 5: Test dev server**

```bash
npm run dev
```

Verify game loads in browser at `http://localhost:5173`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html
git commit -m "feat: scaffold Vite project with Three.js dependency"
```

---

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

---

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

---

### Task 4: Create Materials Library Module

**Files:**
- Create: `src/materials.js`
- Modify: `src/main.js` (extract material/texture code)

**Interfaces:**
- Consumes: Three.js library
- Produces: `MAT` object with all material factory functions

- [ ] **Step 1: Create materials.js**

Move all texture generator functions and the `MAT` object from main.js into this file. Export `MAT` and all `create*Texture()` functions.

```javascript
import * as THREE from 'three';

// ... all texture generator functions (createPavementTexture, createBrickTexture, etc.)

export const MAT = {
    BRICK: (color) => new THREE.MeshStandardMaterial({ ... }),
    GLASS: () => new THREE.MeshStandardMaterial({ ... }),
    ROAD: () => new THREE.MeshStandardMaterial({ ... }),
    PAVEMENT: () => new THREE.MeshStandardMaterial({ ... }),
    GRASS: () => new THREE.MeshStandardMaterial({ ... }),
    NEON: (color) => new THREE.MeshStandardMaterial({ ... }),
    LAMP_POST: () => new THREE.MeshStandardMaterial({ ... }),
    LAMP_LENS: () => new THREE.MeshStandardMaterial({ ... }),
    CARPET: (color) => new THREE.MeshStandardMaterial({ ... }),
    METAL: () => new THREE.MeshStandardMaterial({ ... }),
    WOOD: () => new THREE.MeshStandardMaterial({ ... })
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

---

### Task 5: Create Environment Module

**Files:**
- Create: `src/environment.js`
- Modify: `src/main.js` (extract environment code)

**Interfaces:**
- Consumes: `getScene()`, `MAT`, texture generators
- Produces: `initEnvironment(scene)` — creates ground, plaza, roads, lamps, clouds, water

- [ ] **Step 1: Create environment.js**

Move all environment construction code (ground, plaza, roads, lamps, clouds, water) from main.js into this file.

```javascript
import * as THREE from 'three';
import { MAT, createPavementTexture, createRoadTexture, createGrassTexture } from './materials.js';

export function initEnvironment(scene) {
    // Ground, plaza, roads, lamps, clouds, water
    // ... all environment construction code
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

---

### Task 6: Create State Machine

**Files:**
- Create: `src/state.js`

**Interfaces:**
- Consumes: none
- Produces: `getState()`, `setState()`, `canTransition()`, `STATES`

- [ ] **Step 1: Create state.js**

```javascript
const STATES = {
    START: 'START',
    EXPLORING: 'EXPLORING',
    DIALOGUE: 'DIALOGUE',
    INTERACTING: 'INTERACTING',
    FLASHBACK: 'FLASHBACK',
    TRANSITIONING: 'TRANSITIONING',
    CHAPTER_END: 'CHAPTER_END'
};

let currentState = STATES.START;
let currentCharacter = 'sundaram';

const transitions = {
    [STATES.START]: [STATES.EXPLORING],
    [STATES.EXPLORING]: [STATES.DIALOGUE, STATES.INTERACTING, STATES.FLASHBACK, STATES.TRANSITIONING],
    [STATES.DIALOGUE]: [STATES.EXPLORING],
    [STATES.INTERACTING]: [STATES.EXPLORING],
    [STATES.FLASHBACK]: [STATES.EXPLORING],
    [STATES.TRANSITIONING]: [STATES.EXPLORING, STATES.CHAPTER_END],
    [STATES.CHAPTER_END]: [STATES.START]
};

export function getState() { return currentState; }

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

export function getCharacter() { return currentCharacter; }
export function setCharacter(char) { currentCharacter = char; }

export { STATES };
```

- [ ] **Step 2: Test**

Import state.js in main.js and verify state transitions work.

- [ ] **Step 3: Commit**

```bash
git add src/state.js
git commit -m "feat: add game state machine"
```

---

### Task 7: Create Dialogue Engine

**Files:**
- Create: `src/dialogue/engine.js`
- Create: `src/dialogue/sundaram.js`

**Interfaces:**
- Consumes: `getState()`, `setState()` from state.js
- Produces: `startDialogue(id)`, `selectOption(index)`, `getCurrentNode()`, `isDialogueActive()`

- [ ] **Step 1: Create dialogue engine**

```javascript
import { getState, setState, STATES } from '../state.js';

let currentDialogue = null;
let currentNodeId = null;

export function startDialogue(dialogueData, startNodeId) {
    if (getState() !== STATES.EXPLORING) return false;
    currentDialogue = dialogueData;
    currentNodeId = startNodeId;
    setState(STATES.DIALOGUE);
    return true;
}

export function getCurrentNode() {
    if (!currentDialogue || !currentNodeId) return null;
    return currentDialogue.nodes[currentNodeId];
}

export function selectOption(optionIndex) {
    const node = getCurrentNode();
    if (!node || !node.options || !node.options[optionIndex]) return false;
    
    const option = node.options[optionIndex];
    
    // Execute side effects
    if (option.effect) option.effect();
    
    // Move to next node
    if (option.next) {
        currentNodeId = option.next;
        return true;
    }
    
    // End dialogue
    endDialogue();
    return false;
}

export function endDialogue() {
    currentDialogue = null;
    currentNodeId = null;
    setState(STATES.EXPLORING);
}

export function isDialogueActive() {
    return getState() === STATES.DIALOGUE && currentDialogue !== null;
}
```

- [ ] **Step 2: Create Sundaram's dialogue data**

```javascript
// src/dialogue/sundaram.js

export const sundaramDialogue = {
    nodes: {
        'start': {
            speaker: 'sundaram',
            text: {
                hi: 'Yeh kya hai? Itna bada office...',
                en: 'What is this? Such a big office...',
                bhojpuri: 'E ka ho? Itna bada baisan...'
            },
            options: [
                { text: { hi: 'Andar chalo', en: 'Let\'s go inside' }, next: 'enter_office' },
                { text: { hi: 'Pehle bahar dekho', en: 'Look around first' }, next: 'look_around' }
            ]
        },
        'enter_office': {
            speaker: 'sundaram',
            text: {
                hi: 'Yahan sab log waiting mein baithe hain...',
                en: 'Everyone is sitting in the waiting room...'
            },
            options: [
                { text: { hi: 'Waiting room mein jao', en: 'Go to the waiting room' }, next: 'waiting_room' }
            ]
        },
        'look_around': {
            speaker: 'sundaram',
            text: {
                hi: 'Bahar ek chai wallah hai. Mumbai mein har jagah chai milti hai.',
                en: 'There\'s a chai wallah outside. You get tea everywhere in Mumbai.'
            },
            options: [
                { text: { hi: 'Chai piyo', en: 'Have some chai' }, next: 'chai', effect: () => { /* add comfort */ } },
                { text: { hi: 'Seedha andar jao', en: 'Go straight inside' }, next: 'enter_office' }
            ]
        },
        'chai': {
            speaker: 'sundaram',
            text: {
                hi: 'Ek cutting chai. ₹10. Mumbai ki sabse sasti khushi.',
                en: 'A cutting chai. ₹10. Mumbai\'s cheapest happiness.'
            },
            options: [
                { text: { hi: 'Ab andar chalo', en: 'Now let\'s go inside' }, next: 'enter_office' }
            ]
        },
        'waiting_room': {
            speaker: 'sundaram',
            text: {
                hi: 'Kitne log hain yahan... sabke haath mein scripts hain. Mere paas toh bas ek creased headshot hai.',
                en: 'So many people here... everyone has scripts. I only have a creased headshot.'
            },
            options: [
                { text: { hi: 'Kisi se baat karo', en: 'Talk to someone' }, next: 'talk_actor' },
                { text: { hi: 'Bas baith jao', en: 'Just sit down' }, next: 'sit_and_wait' }
            ]
        },
        'talk_actor': {
            speaker: 'sundaram',
            text: {
                hi: 'Excuse me, yeh casting kab start hogi?',
                en: 'Excuse me, when will the casting start?'
            },
            options: [
                { text: { hi: '"Mujhe bhi nahi pata"', en: '"I don\'t know either"' }, next: 'actor_response' }
            ]
        },
        'actor_response': {
            speaker: 'npc_actor',
            text: {
                hi: 'Arre bhai, yeh Raksh Chhabra ka office hai. Yahan kuch fixed nahi hota. Kabhi 2 ghanta, kabhi 2 minute.',
                en: 'Brother, this is Raksh Chhabra\'s office. Nothing is fixed here. Sometimes 2 hours, sometimes 2 minutes.'
            },
            options: [
                { text: { hi: 'Samajh gaya', en: 'I understand' }, next: 'sit_and_wait' }
            ]
        },
        'sit_and_wait': {
            speaker: 'sundaram',
            text: {
                hi: 'Theek hai. Intezaar karte hain. Bihar mein bhi toh itna intezaar karna padta tha.',
                en: 'Okay. Let\'s wait. Had to wait this much in Bihar too.'
            },
            options: [
                { text: { hi: 'Aage badho', en: 'Move forward' }, next: 'audition_call' }
            ]
        },
        'audition_call': {
            speaker: 'assistant',
            text: {
                hi: 'Sundaram Sharma ji? Rekha ma'am aapko bula rahi hain.',
                en: 'Sundaram Sharma ji? Rekha ma\'am is calling you.'
            },
            options: [
                { text: { hi: 'Main aa raha hoon', en: 'I\'m coming' }, next: 'to_audition', effect: () => { /* trigger audition scene */ } }
            ]
        },
        'to_audition': {
            speaker: 'sundaram',
            text: {
                hi: 'Yeh woh moment hai. Jiske liye Patna se aaya hoon.',
                en: 'This is the moment. The one I came from Patna for.'
            },
            options: [
                { text: { hi: 'Audition do', en: 'Do the audition' }, next: 'audition_scene' }
            ]
        },
        'audition_scene': {
            speaker: 'narrator',
            text: {
                hi: 'Sundaram ne apna sab kuch diya. Teen bhashaon mein ek monologue. Room mein khamoshi thi.',
                en: 'Sundaram gave everything. A monologue in three languages. The room was silent.'
            },
            options: [
                { text: { hi: '... (silence)', en: '... (silence)' }, next: 'audition_end' }
            ]
        },
        'audition_end': {
            speaker: 'rekha',
            text: {
                hi: 'Bahut achha tha, Sundaram ji. Hum aapko batayenge.',
                en: 'Very good, Sundaram ji. We\'ll let you know.'
            },
            options: [
                { text: { hi: 'Shukriya, Rekha ma\'am', en: 'Thank you, Rekha ma\'am' }, next: 'chapter_end', effect: () => { /* trigger chapter end */ } }
            ]
        }
    }
};
```

- [ ] **Step 3: Test dialogue flow**

Import and test the dialogue engine in main.js. Verify:
- `startDialogue(sundaramDialogue, 'start')` works
- `getCurrentNode()` returns correct nodes
- `selectOption(0)` advances dialogue
- State transitions work correctly

- [ ] **Step 4: Commit**

```bash
git add src/dialogue/
git commit -m "feat: add dialogue engine with Sundaram's dialogue trees"
```

---

### Task 8: Create Dialogue UI

**Files:**
- Create: `src/ui/dialogue-ui.js`
- Modify: `index.html` (add dialogue UI elements)
- Modify: `styles.css` (add dialogue styles)

**Interfaces:**
- Consumes: `getCurrentNode()`, `selectOption()` from dialogue engine
- Produces: visual dialogue display, option selection

- [ ] **Step 1: Add dialogue UI elements to index.html**

```html
<!-- Dialogue UI -->
<div id="dialogue-overlay" class="hidden">
    <div id="dialogue-box">
        <div id="dialogue-speaker"></div>
        <div id="dialogue-text"></div>
        <div id="dialogue-options"></div>
    </div>
</div>
```

- [ ] **Step 2: Add dialogue CSS**

```css
#dialogue-overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    z-index: 200;
    pointer-events: none;
}

#dialogue-box {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    padding: 20px;
    pointer-events: all;
}

#dialogue-speaker {
    font-size: 0.9rem;
    color: #FFD700;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

#dialogue-text {
    font-size: 1.1rem;
    color: #fff;
    line-height: 1.6;
    margin-bottom: 16px;
}

#dialogue-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.dialogue-option {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 12px 16px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-size: 1rem;
}

.dialogue-option:hover {
    background: rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
    color: #fff;
}

.dialogue-option .lang {
    font-size: 0.8rem;
    color: #888;
    margin-left: 8px;
}
```

- [ ] **Step 3: Create dialogue-ui.js**

```javascript
import { getCurrentNode, selectOption, isDialogueActive } from '../dialogue/engine.js';

const overlay = document.getElementById('dialogue-overlay');
const speakerEl = document.getElementById('dialogue-speaker');
const textEl = document.getElementById('dialogue-text');
const optionsEl = document.getElementById('dialogue-options');

export function updateDialogueUI() {
    if (!isDialogueActive()) {
        overlay.classList.add('hidden');
        return;
    }
    
    overlay.classList.remove('hidden');
    const node = getCurrentNode();
    if (!node) return;
    
    // Speaker name
    const speakerNames = {
        sundaram: 'Sundaram Sharma',
        rekha: 'Rekha Iyer',
        npc_actor: 'Actor',
        assistant: 'Casting Assistant',
        narrator: ''
    };
    speakerEl.textContent = speakerNames[node.speaker] || node.speaker;
    
    // Text (show all languages)
    const text = node.text;
    textEl.innerHTML = '';
    if (text.hi) {
        textEl.innerHTML += `<div class="text-hi">${text.hi}</div>`;
    }
    if (text.en) {
        textEl.innerHTML += `<div class="text-en">${text.en}</div>`;
    }
    if (text.bhojpuri) {
        textEl.innerHTML += `<div class="text-bhojpuri">${text.bhojpuri}</div>`;
    }
    
    // Options
    optionsEl.innerHTML = '';
    if (node.options) {
        node.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'dialogue-option';
            btn.innerHTML = `${option.text.en || option.text.hi}`;
            btn.addEventListener('click', () => {
                selectOption(index);
                updateDialogueUI();
            });
            optionsEl.appendChild(btn);
        });
    }
}

// Keyboard shortcuts for options (1, 2, 3)
document.addEventListener('keydown', (e) => {
    if (!isDialogueActive()) return;
    const node = getCurrentNode();
    if (!node || !node.options) return;
    
    const num = parseInt(e.key);
    if (num >= 1 && num <= node.options.length) {
        selectOption(num - 1);
        updateDialogueUI();
    }
});
```

- [ ] **Step 4: Test**

Verify dialogue UI appears when dialogue starts, options are clickable, and text displays correctly.

- [ ] **Step 5: Commit**

```bash
git add src/ui/dialogue-ui.js index.html styles.css
git commit -m "feat: add dialogue UI with trilingual text display"
```

---

### Task 9: Create Interaction System

**Files:**
- Create: `src/interaction.js`
- Modify: `src/main.js` (add raycasting for interaction)

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
        // Walk up to find interactable parent
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
        // Show examination UI
        setState(STATES.INTERACTING);
        // ... display examination text
    } else if (data.type === 'flashback') {
        setState(STATES.FLASHBACK);
        // ... trigger flashback
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

---

### Task 10: Create Character Switcher

**Files:**
- Create: `src/characters.js`
- Create: `src/ui/switcher-ui.js`

**Interfaces:**
- Consumes: `getCharacter()`, `setCharacter()` from state.js
- Produces: `initCharacters()`, `switchCharacter()`, `getCharacterConfig()`

- [ ] **Step 1: Create characters.js**

```javascript
import { getCharacter, setCharacter, setState, STATES } from './state.js';

const characters = {
    sundaram: {
        name: 'Sundaram Sharma',
        nameHi: 'सुंदरम शर्मा',
        role: 'The Outsider',
        color: '#D4A574',
        accent: '#C4956A',
        position: { x: 0, y: 2, z: 10 },
        lookAt: { x: 0, y: 2, z: 0 }
    },
    arjun: {
        name: 'Arjun Malhotra',
        nameHi: 'अर्जुन मल्होत्रा',
        role: 'The Nepo Kid',
        color: '#4A90D9',
        accent: '#3A7BC8',
        position: { x: 20, y: 2, z: 0 },
        lookAt: { x: 0, y: 2, z: 0 }
    },
    rekha: {
        name: 'Rekha Iyer',
        nameHi: 'रेखा अय्यर',
        role: 'The Gatekeeper',
        color: '#8B7355',
        accent: '#7A6248',
        position: { x: -20, y: 2, z: 0 },
        lookAt: { x: 0, y: 2, z: 0 }
    }
};

export function getCharacterConfig(charId) {
    return characters[charId] || characters.sundaram;
}

export function switchCharacter(charId) {
    if (!characters[charId]) return false;
    
    // Save current position
    const current = getCharacterConfig(getCharacter());
    
    setCharacter(charId);
    const newChar = characters[charId];
    
    // Show transition UI
    showTransition(newChar);
    
    return true;
}

function showTransition(char) {
    // This will be handled by the switcher UI
    const event = new CustomEvent('characterSwitch', { detail: char });
    window.dispatchEvent(event);
}

export function getAllCharacters() {
    return Object.keys(characters).map(id => ({ id, ...characters[id] }));
}
```

- [ ] **Step 2: Create switcher UI**

```javascript
// src/ui/switcher-ui.js

import { switchCharacter, getCharacterConfig, getAllCharacters } from '../characters.js';
import { getCharacter } from '../state.js';

const switcherEl = document.getElementById('character-switcher');

export function initSwitcherUI() {
    // Currently only Sundaram is playable in Phase 1
    // Show placeholder for other characters
}

window.addEventListener('characterSwitch', (e) => {
    const char = e.detail;
    
    // Fade to black
    const overlay = document.getElementById('transition-overlay');
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    
    // Show character name
    const nameEl = document.getElementById('transition-name');
    nameEl.innerHTML = `${char.name}<br><span class="transition-hi">${char.nameHi}</span>`;
    
    // After delay, fade in
    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }, 2000);
});
```

- [ ] **Step 3: Add transition UI to index.html**

```html
<div id="transition-overlay" class="hidden">
    <div id="transition-name"></div>
</div>
```

- [ ] **Step 4: Add transition CSS**

```css
#transition-overlay {
    position: fixed;
    inset: 0;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
}

#transition-name {
    text-align: center;
    color: #FFD700;
    font-size: 2.5rem;
    font-weight: 300;
    letter-spacing: 4px;
}

.transition-hi {
    font-size: 1.5rem;
    color: #ccc;
    margin-top: 8px;
}
```

- [ ] **Step 5: Test**

Verify character switching shows transition overlay with name.

- [ ] **Step 6: Commit**

```bash
git add src/characters.js src/ui/switcher-ui.js index.html styles.css
git commit -m "feat: add character switcher with transition UI"
```

---

### Task 11: Create Sundaram's Chapter

**Files:**
- Create: `src/chapters/sundaram.js`

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
    // Simple NPC meshes
    const actorPositions = [
        { x: -8, z: -10 },
        { x: -5, z: -12 },
        { x: 5, z: -10 },
        { x: 8, z: -12 }
    ];
    
    actorPositions.forEach((pos, i) => {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: [0x3366cc, 0xcc3333, 0x33cc33, 0x9933cc][i] 
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        group.add(body);
        
        // Head
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

---

### Task 12: Add Basic Ambient Sound

**Files:**
- Create: `src/audio/ambient.js`
- Modify: `index.html` (add audio elements)

**Interfaces:**
- Consumes: `getCharacter()` from state.js
- Produces: `initAmbientSound()`, `updateAmbientSound()`

- [ ] **Step 1: Create ambient sound system**

```javascript
// src/audio/ambient.js

const ambientSounds = {
    office: {
        ac: createOscillator('sine', 120, 0.02),    // AC hum
        phone: createOscillator('square', 440, 0.01), // distant phone
        chatter: createOscillator('sawtooth', 200, 0.005) // muffled voices
    },
    street: {
        traffic: createOscillator('sawtooth', 80, 0.03),  // traffic hum
        auto: createOscillator('square', 150, 0.02),       // auto-rickshaw
        birds: createOscillator('sine', 2000, 0.01)        // birds
    },
    pg: {
        fan: createOscillator('sine', 60, 0.03),          // ceiling fan
        cricket: createOscillator('square', 1000, 0.005)  // cricket on TV
    }
};

function createOscillator(type, freq, vol) {
    // Returns a simple oscillator-based sound
    // In production, replace with actual audio files
    return { type, freq, vol, playing: false };
}

let currentAmbient = null;

export function initAmbientSound() {
    // Create audio context on user interaction
}

export function updateAmbientSound(location) {
    if (currentAmbient === location) return;
    currentAmbient = location;
    
    // Crossfade between ambient sets
    // ... implementation
}

export function startAmbientForCharacter(charId) {
    const ambients = {
        sundaram: 'street',
        arjun: 'office',
        rekha: 'office'
    };
    updateAmbientSound(ambients[charId] || 'street');
}
```

- [ ] **Step 2: Add audio context initialization**

The audio context must be created after user interaction (browser policy). Add to main.js:

```javascript
let audioContext = null;

function initAudio() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// On first click/tap:
document.addEventListener('click', () => initAudio(), { once: true });
document.addEventListener('touchstart', () => initAudio(), { once: true });
```

- [ ] **Step 3: Test**

Verify ambient sounds play when game starts (after first click).

- [ ] **Step 4: Commit**

```bash
git add src/audio/ambient.js src/main.js
git commit -m "feat: add basic ambient sound system"
```

---

### Task 13: Add Examine UI

**Files:**
- Create: `src/ui/examine-ui.js`
- Modify: `index.html` (add examine UI elements)
- Modify: `styles.css` (add examine styles)

**Interfaces:**
- Consumes: interaction system
- Produces: visual display for examined objects

- [ ] **Step 1: Add examine UI to index.html**

```html
<div id="examine-overlay" class="hidden">
    <div id="examine-box">
        <div id="examine-text"></div>
        <div id="examine-hint">Press E to close</div>
    </div>
</div>
```

- [ ] **Step 2: Add examine CSS**

```css
#examine-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 250;
}

#examine-box {
    max-width: 600px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    padding: 30px;
}

#examine-text {
    color: #fff;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 16px;
}

#examine-hint {
    color: #888;
    font-size: 0.8rem;
    text-align: right;
}
```

- [ ] **Step 3: Create examine-ui.js**

```javascript
import { getState, setState, STATES } from '../state.js';

const overlay = document.getElementById('examine-overlay');
const textEl = document.getElementById('examine-text');

export function showExamine(text) {
    if (getState() !== STATES.EXPLORING) return;
    
    setState(STATES.INTERACTING);
    overlay.classList.remove('hidden');
    
    // Show all languages
    let html = '';
    if (text.hi) html += `<div class="examine-hi">${text.hi}</div>`;
    if (text.en) html += `<div class="examine-en">${text.en}</div>`;
    textEl.innerHTML = html;
}

export function hideExamine() {
    overlay.classList.add('hidden');
    setState(STATES.EXPLORING);
}

document.addEventListener('keydown', (e) => {
    if ((e.key === 'e' || e.key === 'E') && getState() === STATES.INTERACTING) {
        hideExamine();
    }
});
```

- [ ] **Step 4: Test**

Verify examining objects shows text overlay, and pressing E closes it.

- [ ] **Step 5: Commit**

```bash
git add src/ui/examine-ui.js index.html styles.css
git commit -m "feat: add examine UI for object inspection"
```

---

### Task 14: Add Hindi Font Support

**Files:**
- Modify: `index.html` (add Google Fonts link)
- Modify: `styles.css` (add Hindi font styles)

**Interfaces:**
- Consumes: none
- Produces: Hindi text renders correctly in dialogue UI

- [ ] **Step 1: Add Noto Sans Devanagari font**

In `index.html`, add to `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add Hindi font styles**

In `styles.css`:
```css
.text-hi, .text-bhojpuri, .transition-hi {
    font-family: 'Noto Sans Devanagari', sans-serif;
}

.text-en {
    font-family: 'Outfit', sans-serif;
    color: #aaa;
    font-size: 0.9em;
    margin-top: 4px;
}

.text-bhojpuri {
    color: #D4A574;
    font-style: italic;
}
```

- [ ] **Step 3: Test**

Verify Hindi text renders correctly in dialogue.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add Hindi font support for trilingual dialogue"
```

---

### Task 15: Add Subtitle Toggle

**Files:**
- Create: `src/ui/subtitle-settings.js`
- Modify: `index.html` (add settings button)

**Interfaces:**
- Consumes: dialogue UI, examine UI
- Produces: toggle for showing/hiding subtitles

- [ ] **Step 1: Add settings button to HUD**

```html
<button id="settings-btn" class="hud-btn">⚙</button>
```

- [ ] **Step 2: Create subtitle settings**

```javascript
// src/ui/subtitle-settings.js

let subtitlesEnabled = true;

export function toggleSubtitles() {
    subtitlesEnabled = !subtitlesEnabled;
    document.body.classList.toggle('subtitles-off', !subtitlesEnabled);
}

export function areSubtitlesEnabled() {
    return subtitlesEnabled;
}

document.getElementById('settings-btn')?.addEventListener('click', toggleSubtitles);
```

- [ ] **Step 3: Add CSS for subtitles off**

```css
.subtitles-off #dialogue-overlay,
.subtitles-off #examine-overlay {
    opacity: 0;
    pointer-events: none;
}
```

- [ ] **Step 4: Test**

Verify settings button toggles subtitle visibility.

- [ ] **Step 5: Commit**

```bash
git add src/ui/subtitle-settings.js index.html styles.css
git commit -m "feat: add subtitle toggle in settings"
```

---

## Summary

This plan creates the core narrative framework for Phase 1:

| Task | Deliverable |
|------|-------------|
| 1 | Vite project scaffold |
| 2 | Scene module |
| 3 | Lighting module |
| 4 | Materials library |
| 5 | Environment module |
| 6 | State machine |
| 7 | Dialogue engine + Sundaram's dialogue |
| 8 | Dialogue UI |
| 9 | Interaction system |
| 10 | Character switcher |
| 11 | Sundaram's chapter |
| 12 | Ambient sound |
| 13 | Examine UI |
| 14 | Hindi font support |
| 15 | Subtitle toggle |

After completing all tasks, you'll have a playable chapter where Sundaram explores the casting office, talks to NPCs, examines objects, and experiences the audition scene — all in Hindi, English, and Bhojpuri.

# Casting Office 3D — Narrative Satire Phases 2-4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the three-character narrative game — Arjun's chapter, Rekha's chapter, the convergence audition scene, flashbacks, visual polish, and sound design.

**Architecture:** Build on the existing Phase 1 modular ES6 codebase (Vite + Three.js). Each character gets their own dialogue tree, chapter module, and visual/audio identity. The convergence system orchestrates the shared audition scene from three perspectives. A flashback system triggers memory vignettes. Color grading shifts per character.

**Tech Stack:** Three.js r160 (npm), Vite, vanilla JavaScript (ES modules), HTML5, CSS3, browser SpeechSynthesis (TTS)

## Global Constraints

- Three.js r160 via npm (`npm install three`)
- Vite for dev server and bundling
- Mobile support required — all systems must work with touch controls
- Voice starts as browser SpeechSynthesis (TTS) — replaceable later
- Dialogue in Hindi, English, Bhojpuri, and Tamil — subtitled
- No external texture files — procedural textures via Canvas2D
- Game must maintain 30+ FPS on desktop, 20+ FPS on mobile
- No fail state — story continues regardless of choices

---

## Pre-Requisite: Architecture Cleanup

The current `src/main.js` is 72.7KB (1915 lines) mixing old typing game code with new narrative systems. This MUST be cleaned up before adding new chapters.

### Task 1: Extract Old Typing Game into Standalone Module

**Files:**
- Create: `src/legacy/typing-game.js`
- Create: `src/legacy/typing-ui.js`
- Create: `src/legacy/crowds.js`
- Modify: `src/main.js` (remove extracted code, import from legacy/)

**Interfaces:**
- Consumes: `scene`, `camera`, `controls`, `offices` from main.js
- Produces: `initTypingGame()`, `startTypingMinigame()`, `updateTyping()`, `handleGameOver()`, `createCrowds()`, `updateCrowds()`

- [ ] **Step 1: Create `src/legacy/` directory**

```bash
mkdir -p src/legacy
```

- [ ] **Step 2: Extract typing minigame logic**

Move the following from `src/main.js` into `src/legacy/typing-game.js`:
- `TARGET_WORD`, `typeIndex`, `currentTimer`, `maxTimer`, `currentOffice`, `combo`, `lastTypeTime`
- `startTypingMinigame()` function
- `updateTypingUI()` function
- `handleTypingCharacter()` function (search for it in main.js)
- `handleGameOver()` function
- `showCelebrationScene()` function
- `handleVictory()` function (search for it)
- All typing-related keyboard event listeners

Export: `initTypingGame(config)`, `startTypingMinigame(office, camera)`, `updateTyping(dt)`, `handleGameOver()`

- [ ] **Step 3: Extract crowd/NPC system**

Move from `src/main.js` into `src/legacy/crowds.js`:
- `createPersonMesh()` function
- `animatePerson()` function
- `createDogMesh()` function
- `animateDog()` function
- `createCrowds()` function
- Crowd update logic from the animate loop
- `nepoCrowds`, `nepoDogs`, `crowds` arrays and their update logic

Export: `initCrowds(scene, offices)`, `updateCrowds(dt)`, `getCrowds()`, `getNepoCrowds()`, `getNepoDogs()`

- [ ] **Step 4: Extract typing UI**

Move from `src/main.js` into `src/legacy/typing-ui.js`:
- `updateTypingUI()` function
- `screens.typing` references
- `typedTextEl`, `untypedTextEl`, `timerBar`, `timerText` references
- `startTypingMinigame()` screen change logic

Export: `initTypingUI()`, `showTypingScreen(office)`, `hideTypingScreen()`, `updateTypingDisplay(typed, untyped, pct, time)`

- [ ] **Step 5: Refactor main.js to use legacy modules**

In `src/main.js`, replace extracted code with imports:
```javascript
import { initTypingGame, startTypingMinigame as legacyStartTyping, updateTyping } from './legacy/typing-game.js';
import { initCrowds, updateCrowds } from './legacy/crowds.js';
import { initTypingUI, showTypingScreen, hideTypingScreen } from './legacy/typing-ui.js';
```

Remove all extracted functions and variables from main.js. Keep the import references. Verify the game still works.

- [ ] **Step 6: Test and commit**

Run the dev server. Verify:
- Old typing minigame still works (walk up to office, type "nepo kid")
- Crowds still animate
- Score/combos still function
- No console errors

```bash
git add src/legacy/ src/main.js
git commit -m "refactor: extract old typing game and crowds into legacy/ modules"
```

---

### Task 2: Extract Game Loop Sections from main.js

**Files:**
- Create: `src/game/loop.js`
- Create: `src/game/buildings.js`
- Create: `src/game/input.js`
- Modify: `src/main.js` (slim down to initialization + imports)

**Interfaces:**
- Consumes: `scene`, `camera`, `renderer`, `controls`, `composer` from scene.js/main.js
- Produces: `initGameLoop()`, `animate()`, `createOffices()`, `initInput()`

- [ ] **Step 1: Extract building creation into `src/game/buildings.js`**

Move from `src/main.js`:
- `NORMAL_STUDIOS` config array
- `NEPO_HOUSES` config array
- `createOfficeBuilding()` function
- `addWindowsToBuilding()` function
- `createOffices()` function
- `offices` array

Export: `createOffices(scene)`, `getOffices()`, `NORMAL_STUDIOS`, `NEPO_HOUSES`

- [ ] **Step 2: Extract input handling into `src/game/input.js`**

Move from `src/main.js`:
- `moveForward`, `moveBackward`, `moveLeft`, `moveRight`, `isSprinting` variables
- All `keydown`/`keyup` event listeners for WASD/arrows/sprint
- Mobile joystick logic
- Mobile action buttons (sprint, jump)

Export: `initInput()`, `getInputState()` (returns {moveForward, moveBackward, moveLeft, moveRight, isSprinting})

- [ ] **Step 3: Extract game loop into `src/game/loop.js`**

Move from `src/main.js`:
- The `animate()` function body (day/night cycle, physics, crowd updates, grass animation, water animation, dust systems, dialogue UI update, interaction update)
- `prevTime`, `velocity`, `velocityY`, `isGrounded`, `headBobTimer` variables

Export: `initGameLoop(state)`, `animate()`, `getGameState()`

- [ ] **Step 4: Slim down main.js to entry point**

`src/main.js` should now only contain:
- Imports from all modules
- `initScene()`, `initLighting()` calls
- Sky dome creation
- Sun/halo creation
- `initPostProcessing()` call (currently null, placeholder)
- Controls setup
- Event listener registration (start screen, restart, etc.)
- `initGame()` function (simplified — calls module inits)
- `animate()` call at bottom

Target: main.js should be under 300 lines.

- [ ] **Step 5: Test and commit**

Verify everything still works. Run full game cycle: start → walk to office → type → complete → next office.

```bash
git add src/game/ src/main.js
git commit -m "refactor: extract game loop, buildings, and input into game/ modules"
```

---

## Phase 2: Arjun's Chapter + Relationship System

### Task 3: Create Arjun's Character Definition

**Files:**
- Create: `src/dialogue/arjun.js`
- Modify: `src/characters.js`

**Interfaces:**
- Consumes: dialogue engine API from `src/dialogue/engine.js`
- Produces: `ARJUN_DIALOGUE` object, character config in `characters.js`

- [ ] **Step 1: Add Arjun to characters.js**

Add to `src/characters.js`:
```javascript
export const CHARACTERS = {
  sundaram: { name: 'Sundaram Sharma', color: '#d4a017', role: 'outsider' },
  arjun: { name: 'Arjun Malhotra', color: '#4a90d9', role: 'nepo kid' },
  rekha: { name: 'Rekha Iyer', color: '#8b5e3c', role: 'gatekeeper' }
};
```

- [ ] **Step 2: Create Arjun's dialogue tree**

Create `src/dialogue/arjun.js` with dialogue nodes for:
- **Morning scene:** Wake up in Bandra apartment. Phone call from father's assistant: "Vikram ji says the Raksh Chhabra meeting is confirmed."
- **Auto ride:** Conversation with driver about his father. Driver recognizes the name.
- **Casting office arrival:** Greetings from people who know his father. "Arjun bhai! Your father is a legend."
- **Waiting room encounter with Sundaram:** Awkward attempt to connect. Uses half-remembered Bhojpuri phrases.
- **Audition:** Performed but nervous. Raksh's response: "You have the look. Your father's instincts are always right."
- **Dinner with father:** The confrontation. Vikram's line: "Tere baap ne mehnat ki hai taaki tereko mehnat na karni pade."

Format: Export `ARJUN_DIALOGUE` as a nested object with node IDs, text (Hindi + English), choices, and next-node references.

```javascript
export const ARJUN_DIALOGUE = {
  morning_awakening: {
    speaker: 'arjun',
    text: { en: 'Another day in paradise.', hi: 'आज का दिन भी अच्छा है।' },
    next: 'morning_phone'
  },
  morning_phone: {
    speaker: 'assistant',
    text: { en: 'Arjun bhai, Vikram ji says the Raksh Chhabra meeting is confirmed.', hi: 'अर्जुन भाई, विक्रम जी बोल रहे हैं रक्ष छाबड़ा की मीटिंग फाइनल हो गई।' },
    choices: [
      { text: { en: 'Already? I haven\'t even prepared.', hi: 'अभी से? मैंने तैयारी भी नहीं की।' }, next: 'morning_unprepared' },
      { text: { en: 'Tell Dad I\'ll be there.', hi: 'पापा को बोल दो मैं आ रहा हूँ।' }, next: 'morning_compliant' },
      { text: { en: '...Okay.', hi: '...ठीक है।' }, next: 'morning_resigned' }
    ]
  },
  // ... (full dialogue tree with 40+ nodes covering Arjun's complete chapter)
};
```

- [ ] **Step 3: Write dialogue content for all scenes**

Arjun's chapter needs dialogue for these scenes:
1. Morning in Bandra apartment (3-4 nodes)
2. Phone call with father's assistant (3-4 nodes)
3. Auto ride to casting office (4-5 nodes, conversation with driver)
4. Arrival at casting office (3-4 nodes, greetings)
5. Waiting room — encounter with Sundaram (6-8 nodes, the key emotional scene)
6. Audition room (4-5 nodes)
7. Post-audition call from father (3-4 nodes)
8. Dinner confrontation with father (6-8 nodes, climax)

Total: ~35-45 dialogue nodes

- [ ] **Step 4: Commit**

```bash
git add src/dialogue/arjun.js src/characters.js
git commit -m "feat: add Arjun's dialogue trees and character definition"
```

---

### Task 4: Create Arjun's Chapter Module

**Files:**
- Create: `src/chapters/arjun.js`
- Modify: `src/state.js`

**Interfaces:**
- Consumes: `ARJUN_DIALOGUE` from `src/dialogue/arjun.js`, scene, camera
- Produces: `initArjunChapter(scene)`, `updateArjunChapter(dt)`

- [ ] **Step 1: Add Arjun states to state.js**

Add to `src/state.js`:
```javascript
export const STATES = {
  // Existing
  EXPLORING: 'exploring',
  DIALOGUE: 'dialogue',
  // New
  ARJUN_MORNING: 'arjun_morning',
  ARJUN_ARRIVAL: 'arjun_arrival',
  ARJUN_WAITING: 'arjun_waiting',
  ARJUN_AUDITION: 'arjun_audition',
  ARJUN_DINNER: 'arjun_dinner',
  REKHA_OFFICE: 'rekha_office',
  REKHA_FLASHBACK: 'rekha_flashback',
  CONVERGENCE: 'convergence'
};
```

- [ ] **Step 2: Create arjun.js chapter module**

Create `src/chapters/arjun.js`:
```javascript
import { ARJUN_DIALOGUE } from '../dialogue/arjun.js';
import { startDialogue } from '../dialogue/engine.js';

let arjunScene = null;
let arjunState = 'morning'; // morning → arrival → waiting → audition → dinner

export function initArjunChapter(scene) {
  arjunScene = scene;
  arjunState = 'morning';
  // Position camera at Arjun's apartment (high-rise view)
  // Set up environmental triggers for this chapter
}

export function updateArjunChapter(dt) {
  // Check environmental triggers
  // Advance state based on player progress
  // Handle transitions between scenes
}

export function triggerArjunDialogue(nodeId) {
  if (ARJUN_DIALOGUE[nodeId]) {
    startDialogue(ARJUN_DIALOGUE[nodeId]);
  }
}

export function getArjunState() { return arjunState; }
```

- [ ] **Step 3: Create Arjun's environment variations**

Arjun's chapter needs different environment states:
- **Morning:** Camera at high-rise position (y=50), looking down at Mumbai skyline
- **Arrival:** Camera at casting office entrance, luxury car visible
- **Waiting room:** Same as Sundaram but from Arjun's perspective — he's comfortable, not anxious
- **Audition:** Inside audition room, professional lighting
- **Dinner:** Bandra restaurant setting (new environment or retextured office)

Add environment preset functions to `src/environment.js`:
```javascript
export function setEnvironmentPreset(preset) {
  // 'sundaram_normal' - default warm lighting
  // 'arjun_luxury' - cool whites, steel blues
  // 'rekha_office' - muted greys, fluorescent
  // 'arjun_dinner' - warm restaurant lighting
}
```

- [ ] **Step 4: Commit**

```bash
git add src/chapters/arjun.js src/state.js src/environment.js
git commit -m "feat: add Arjun's chapter module with environment presets"
```

---

### Task 5: Create Relationship Tracker

**Files:**
- Create: `src/relationship.js`
- Modify: `src/ui/switcher-ui.js`

**Interfaces:**
- Consumes: dialogue choices from engine.js
- Produces: `updateRelationship(character, delta)`, `getRelationship(character)`, `getRelationshipSummary()`

- [ ] **Step 1: Create relationship tracker**

Create `src/relationship.js`:
```javascript
const relationships = {
  sundaram: { trust: 50, respect: 50, empathy: 50 },
  arjun: { trust: 50, respect: 50, guilt: 50 },
  rekha: { trust: 50, respect: 50, complicity: 50 }
};

export function updateRelationship(character, key, delta) {
  if (relationships[character] && relationships[character][key] !== undefined) {
    relationships[character][key] = Math.max(0, Math.min(100, relationships[character][key] + delta));
  }
}

export function getRelationship(character) {
  return relationships[character] ? { ...relationships[character] } : null;
}

export function getRelationshipSummary() {
  return JSON.parse(JSON.stringify(relationships));
}
```

- [ ] **Step 2: Integrate with dialogue engine**

Modify `src/dialogue/engine.js` to accept optional `onChoice` callback that can call `updateRelationship()`:
```javascript
export function startDialogue(node, onChoice) {
  // When a choice is made, call onChoice(choiceData) if provided
  // Dialogue nodes can include relationship effects:
  // choices: [
  //   { text: {...}, next: '...', effects: { arjun: { guilt: +10 } } }
  // ]
}
```

- [ ] **Step 3: Add relationship effects to Arjun's dialogue**

In `src/dialogue/arjun.js`, add `effects` to key choices:
- Choosing honesty with Sundaram → +empathy, +trust
- Choosing to use connections → +guilt, -respect
- Confronting father → varies based on dialogue path

- [ ] **Step 4: Commit**

```bash
git add src/relationship.js src/dialogue/engine.js src/dialogue/arjun.js
git commit -m "feat: add relationship tracker with dialogue integration"
```

---

### Task 6: Implement Arjun's Key Scenes

**Files:**
- Modify: `src/chapters/arjun.js`
- Modify: `src/dialogue/arjun.js`

**Interfaces:**
- Consumes: relationship tracker, dialogue engine, environment presets
- Produces: Complete playable Arjun chapter

- [ ] **Step 1: Implement the waiting room encounter**

The most important scene in Arjun's chapter — Arjun meets Sundaram in the waiting room.

Create environmental trigger: when Arjun's camera is within 5 units of Sundaram's NPC position, trigger dialogue node `arjun_waiting_sundaram`.

Dialogue beats:
1. Arjun notices Sundaram's creased headshot
2. Awkward attempt to connect using Bhojpuri
3. Sundaram's monologue about his journey
4. Arjun's internal conflict (shown through choice options)
5. The casting assistant calls Arjun's name — he goes in immediately

- [ ] **Step 2: Implement the audition scene**

Arjun performs his monologue. This is NOT a minigame — it's a narrative sequence:
1. Camera moves to audition room
2. Arjun speaks (dialogue with speech synthesis)
3. Raksh's response plays
4. Player sees the outcome

- [ ] **Step 3: Implement the dinner confrontation**

The climax of Arjun's chapter. A dialogue-heavy scene with his father:
1. Restaurant environment (retextured office or new location)
2. Vikram Malhotra's character appears (NPC or dialogue-only)
3. Key line: "Tere baap ne mehnat ki hai taaki tereko mehnat na karni pade."
4. Player choices determine Arjun's emotional arc
5. Ends with Arjun's realization

- [ ] **Step 4: Test full Arjun chapter**

Play through Arjun's complete chapter:
- Morning scene → auto ride → arrival → waiting room → audition → dinner
- Verify all dialogue plays correctly
- Verify relationship effects apply
- Verify environment presets shift correctly

- [ ] **Step 5: Commit**

```bash
git add src/chapters/arjun.js src/dialogue/arjun.js
git commit -m "feat: implement Arjun's complete chapter (morning to dinner)"
```

---

## Phase 3: Rekha's Chapter + Visual Polish

### Task 7: Create Rekha's Dialogue Trees

**Files:**
- Create: `src/dialogue/rekha.js`

**Interfaces:**
- Consumes: dialogue engine API
- Produces: `REKHA_DIALOGUE` object

- [ ] **Step 1: Write Rekha's dialogue content**

Rekha's chapter dialogue for these scenes:
1. **Morning routine** (3-4 nodes): Filter coffee, scripts, phone buzzing
2. **Reviewing tapes** (4-5 nodes): Watching Sundaram's and Arjun's audition tapes side by side
3. **Phone call with Vikram** (5-6 nodes): The compromising conversation — she pushes back, then relents
4. **Flashback trigger** (2-3 nodes): The Adivasi actress from 1998
5. **Meeting Sundaram** (4-5 nodes): After his audition, she sees his potential and his disappointment
6. **Ending** (3-4 nodes): Glass of wine, the photo, the weight of 30 years

Language: Hindi + English + occasional Tamil words (she's half-Tamil, half-Marathi)

- [ ] **Step 2: Create REKHA_DIALOGUE export**

```javascript
export const REKHA_DIALOGUE = {
  morning_routine: {
    speaker: 'rekha',
    text: { en: ' filter coffee. Scripts. The same morning for 30 years.', hi: 'फ़िल्टर कॉफ़ी। स्क्रिप्ट्स। 30 साल से वही सुबह।' },
    next: 'morning_scripts'
  },
  // ... (full dialogue tree with 30+ nodes)
};
```

- [ ] **Step 3: Commit**

```bash
git add src/dialogue/rekha.js
git commit -m "feat: add Rekha's dialogue trees"
```

---

### Task 8: Create Rekha's Chapter Module

**Files:**
- Create: `src/chapters/rekha.js`

**Interfaces:**
- Consumes: `REKHA_DIALOGUE`, scene, camera, environment presets
- Produces: `initRekhaChapter(scene)`, `updateRekhaChapter(dt)`

- [ ] **Step 1: Create Rekha's chapter module**

```javascript
import { REKHA_DIALOGUE } from '../dialogue/rekha.js';
import { startDialogue } from '../dialogue/engine.js';

let rekhaScene = null;
let rekhaState = 'morning'; // morning → reviewing → phone_call → flashback → meeting → ending

export function initRekhaChapter(scene) {
  rekhaScene = scene;
  rekhaState = 'morning';
  // Position camera at Rekha's desk/office
  // Set up "reviewing tapes" UI overlay
}

export function updateRekhaChapter(dt) {
  // Check triggers
  // Handle flashback transitions
  // Manage the "watching tapes" state
}

export function triggerRekhaDialogue(nodeId) {
  if (REKHA_DIALOGUE[nodeId]) {
    startDialogue(REKHA_DIALOGUE[nodeId]);
  }
}

export function getRekhaState() { return rekhaState; }
```

- [ ] **Step 2: Create "reviewing tapes" overlay**

When Rekha is reviewing audition tapes, show a split-screen overlay:
- Left: Sundaram's tape (text description + dialogue snippet)
- Right: Arjun's tape (text description + dialogue snippet)
- Player can toggle between them
- This is the key narrative moment — seeing both performances side by side

Create `src/ui/tape-reviewer.js`:
```javascript
export function showTapeReview(sundaramTape, arjunTape) { ... }
export function hideTapeReview() { ... }
export function getCurrentTape() { ... }
```

- [ ] **Step 3: Commit**

```bash
git add src/chapters/rekha.js src/ui/tape-reviewer.js
git commit -m "feat: add Rekha's chapter module with tape reviewer UI"
```

---

### Task 9: Create Flashback System

**Files:**
- Create: `src/flashback/system.js`
- Create: `src/flashback/scenes.js`

**Interfaces:**
- Consumes: scene, camera, state machine
- Produces: `triggerFlashback(type)`, `updateFlashback(dt)`, `isFlashbackActive()`

- [ ] **Step 1: Create flashback system core**

Create `src/flashback/system.js`:
```javascript
let flashbackActive = false;
let flashbackType = null;
let flashbackTimer = 0;
let flashbackDuration = 0;

export function triggerFlashback(type, duration = 5) {
  flashbackActive = true;
  flashbackType = type;
  flashbackTimer = 0;
  flashbackDuration = duration;
  // Fade to black
  // Switch camera/environment to flashback state
}

export function updateFlashback(dt) {
  if (!flashbackActive) return;
  flashbackTimer += dt;
  if (flashbackTimer >= flashbackDuration) {
    endFlashback();
  }
}

function endFlashback() {
  flashbackActive = false;
  flashbackType = null;
  // Fade back to present
  // Restore camera/environment
}

export function isFlashbackActive() { return flashbackActive; }
export function getFlashbackType() { return flashbackType; }
```

- [ ] **Step 2: Create flashback scene definitions**

Create `src/flashback/scenes.js`:
```javascript
export const FLASHBACK_SCENES = {
  sundaram_patna: {
    location: 'patna',
    description: 'Sundaram\'s father\'s small shop in Patna',
    dialogue: [
      { speaker: 'mother', text: { hi: 'beta, Mumbai jaake bada ban', en: 'Son, go to Mumbai and become someone big' } }
    ],
    environment: { lighting: 'warm_golden', fog: 'none' },
    duration: 6
  },
  arjun_childhood: {
    location: 'film_set',
    description: 'Arjun as a child on a film set',
    dialogue: [
      { speaker: 'father', text: { hi: 'Arjun ko role do. Woh talented hai.', en: 'Give Arjun the role. He\'s talented.' } }
    ],
    environment: { lighting: 'studio_warm', fog: 'light' },
    duration: 5
  },
  rekha_1998: {
    location: 'casting_office_1998',
    description: 'Rekha fighting for an unknown Adivasi actress',
    dialogue: [
      { speaker: 'rekha', text: { hi: 'yeh ladki bahut talented hai', en: 'This girl is very talented' } },
      { speaker: 'producer', text: { hi: 'hum kisi anjaan ko launch nahi kar sakte', en: 'We can\'t launch an unknown' } }
    ],
    environment: { lighting: 'fluorescent', fog: 'none' },
    duration: 8
  }
};
```

- [ ] **Step 3: Implement flashback triggers in chapters**

Add flashback triggers to each chapter:
- **Sundaram:** Triggered when he sees a chai stall (reminds him of home)
- **Arjun:** Triggered when he sees family photos in the casting office
- **Rekha:** Triggered when she sees Sundaram's audition tape (reminds her of 1998)

In each chapter module, add:
```javascript
// In sundaram.js
if (nearChaiStall && !flashbackTriggered.sundaram_patna) {
  triggerFlashback('sundaram_patna');
  flashbackTriggered.sundaram_patna = true;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/flashback/ src/chapters/sundaram.js src/chapters/arjun.js src/chapters/rekha.js
git commit -m "feat: add flashback system with scene definitions and triggers"
```

---

### Task 10: Create Color Grading System

**Files:**
- Create: `src/effects/colorGrading.js`
- Modify: `src/scene.js`

**Interfaces:**
- Consumes: renderer, scene
- Produces: `setColorGrading(preset)`, `getColorGrading()`

- [ ] **Step 1: Create color grading shader**

Create `src/effects/colorGrading.js`:
```javascript
import * as THREE from 'three';

const colorGradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    brightness: { value: 0.0 },
    contrast: { value: 1.0 },
    saturation: { value: 1.0 },
    tint: { value: new THREE.Color(1, 1, 1) },
    vignette: { value: 0.3 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    uniform vec3 tint;
    uniform float vignette;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      // Brightness
      color.rgb += brightness;
      // Contrast
      color.rgb = (color.rgb - 0.5) * contrast + 0.5;
      // Saturation
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(vec3(gray), color.rgb, saturation);
      // Tint
      color.rgb *= tint;
      // Vignette
      vec2 center = vUv - 0.5;
      float dist = length(center);
      color.rgb *= 1.0 - dist * vignette;
      gl_FragColor = color;
    }
  `
};

const PRESETS = {
  sundaram: { brightness: 0.05, contrast: 1.1, saturation: 1.2, tint: [1.1, 1.0, 0.8], vignette: 0.2 },
  arjun: { brightness: 0.0, contrast: 1.05, saturation: 0.9, tint: [0.9, 0.95, 1.1], vignette: 0.3 },
  rekha: { brightness: -0.05, contrast: 0.95, saturation: 0.8, tint: [1.0, 0.98, 0.95], vignette: 0.4 },
  neutral: { brightness: 0.0, contrast: 1.0, saturation: 1.0, tint: [1, 1, 1], vignette: 0.0 }
};

let currentPreset = 'neutral';

export function initColorGrading(renderer, scene) {
  // Create ShaderPass for color grading
  // Add to post-processing pipeline (currently disabled — will re-enable when ready)
}

export function setColorGrading(preset) {
  if (PRESETS[preset]) {
    currentPreset = preset;
    // Update shader uniforms
  }
}

export function getColorGrading() { return currentPreset; }
```

- [ ] **Step 2: Integrate with chapter transitions**

When switching characters, update the color grading:
```javascript
// In switcher-ui.js or state.js
import { setColorGrading } from '../effects/colorGrading.js';

export function switchCharacter(characterId) {
  setColorGrading(characterId); // 'sundaram', 'arjun', or 'rekha'
  // ... rest of switch logic
}
```

- [ ] **Step 3: Commit**

```bash
git add src/effects/colorGrading.js src/ui/switcher-ui.js
git commit -m "feat: add per-character color grading system"
```

---

### Task 11: Enhance Lighting per Character

**Files:**
- Modify: `src/lighting.js`

**Interfaces:**
- Consumes: scene
- Produces: `setLightingPreset(preset)`, `getLightingPreset()`

- [ ] **Step 1: Add lighting presets**

Add to `src/lighting.js`:
```javascript
const LIGHTING_PRESETS = {
  sundaram: {
    ambient: { color: 0x6080c0, intensity: 0.6 },
    hemisphere: { color: 0x88bbee, groundColor: 0x445533, intensity: 1.2 },
    directional: { color: 0xfff4e0, intensity: 2.0, position: [180, 350, -300] },
    rim: { color: 0xffeedd, intensity: 0.3 }
  },
  arjun: {
    ambient: { color: 0x8090b0, intensity: 0.5 },
    hemisphere: { color: 0xaaccee, groundColor: 0x334455, intensity: 1.0 },
    directional: { color: 0xe0e8f0, intensity: 1.8, position: [100, 400, -200] },
    rim: { color: 0xccddee, intensity: 0.4 }
  },
  rekha: {
    ambient: { color: 0x506070, intensity: 0.4 },
    hemisphere: { color: 0x778899, groundColor: 0x333333, intensity: 0.8 },
    directional: { color: 0xddddcc, intensity: 1.5, position: [200, 300, -250] },
    rim: { color: 0xbbbbcc, intensity: 0.2 }
  }
};

export function setLightingPreset(preset) {
  if (!LIGHTING_PRESETS[preset]) return;
  const p = LIGHTING_PRESETS[preset];
  ambientLight.color.set(p.ambient.color);
  ambientLight.intensity = p.ambient.intensity;
  hemiLight.color.set(p.hemisphere.color);
  hemiLight.groundColor.set(p.hemisphere.groundColor);
  hemiLight.intensity = p.hemisphere.intensity;
  dirLight.color.set(p.directional.color);
  dirLight.intensity = p.directional.intensity;
  dirLight.position.set(...p.directional.position);
  rimLight.color.set(p.rim.color);
  rimLight.intensity = p.rim.intensity;
}
```

- [ ] **Step 2: Integrate with character switching**

Call `setLightingPreset()` when switching characters, alongside color grading.

- [ ] **Step 3: Commit**

```bash
git add src/lighting.js src/ui/switcher-ui.js
git commit -m "feat: add per-character lighting presets"
```

---

## Phase 4: Convergence + Polish

### Task 12: Build the Convergence/Audition System

**Files:**
- Create: `src/convergence/system.js`
- Create: `src/convergence/audition.js`

**Interfaces:**
- Consumes: all three chapter modules, dialogue engine
- Produces: `initConvergence()`, `playAuditionPerspective(character)`, `getConvergenceState()`

- [ ] **Step 1: Create convergence orchestrator**

Create `src/convergence/system.js`:
```javascript
let convergenceState = 'inactive'; // inactive → sundaram_audition → arjun_audition → rekha_decision → ending
let perspectivesPlayed = [];

export function initConvergence() {
  convergenceState = 'sundaram_audition';
  perspectivesPlayed = [];
}

export function advanceConvergence() {
  switch (convergenceState) {
    case 'sundaram_audition':
      convergenceState = 'arjun_audition';
      break;
    case 'arjun_audition':
      convergenceState = 'rekha_decision';
      break;
    case 'rekha_decision':
      convergenceState = 'ending';
      break;
    case 'ending':
      convergenceState = 'complete';
      break;
  }
}

export function getConvergenceState() { return convergenceState; }
export function isComplete() { return convergenceState === 'complete'; }
```

- [ ] **Step 2: Create the audition scene**

Create `src/convergence/audition.js`:
```javascript
import { startDialogue } from '../dialogue/engine.js';

const AUDITION_DIALOGUE = {
  sundaram_performs: {
    speaker: 'sundaram',
    text: {
      hi: 'मैं सुंदरम हूँ, पटना से। मैंने 8 साल थिएटर किया है...',
      en: 'I am Sundaram, from Patna. I have done theater for 8 years...'
    },
    // Monologue that uses Hindi, English, and Bhojpuri
    // The player watches — no input needed
    next: 'sundaram_response'
  },
  sundaram_response: {
    speaker: 'casting_assistant',
    text: { en: 'Very good, Sundaram ji. We\'ll let you know.', hi: 'बहुत अच्छा, सुंदरम जी। हम बता देंगे।' },
    next: null // End of Sundaram's audition
  },
  arjun_performs: {
    speaker: 'arjun',
    text: {
      hi: 'मैं अर्जुन हूँ... मेरे पापा ने कहा था...',
      en: 'I am Arjun... my father said...'
    },
    next: 'arjun_response'
  },
  arjun_response: {
    speaker: 'raksh',
    text: { en: 'You have the look, Arjun ji. Your father\'s instincts are always right.', hi: 'आपकी बनावट अच्छी है, अर्जुन जी। आपके पापा की समझ हमेशा सही होती है।' },
    next: null
  },
  rekha_decision: {
    speaker: 'rekha',
    text: {
      hi: '...विक्रम जी, अर्जुन कन्फर्म है।',
      en: '...Vikram ji, Arjun is confirmed.'
    },
    // She makes the call she always makes
    next: 'rekha_aftermath'
  },
  rekha_aftermath: {
    speaker: 'rekha',
    text: {
      hi: 'उस लड़के का टेप देखो... वो बिहार वाला... कितना अच्छा था...',
      en: 'Look at that boy\'s tape... the one from Bihar... how good he was...'
    },
    // She stares at Sundaram's tape. Closes laptop.
    next: null
  }
};

export function playAuditionPerspective(character) {
  switch (character) {
    case 'sundaram':
      startDialogue(AUDITION_DIALOGUE.sundaram_performs);
      break;
    case 'arjun':
      startDialogue(AUDITION_DIALOGUE.arjun_performs);
      break;
    case 'rekha':
      startDialogue(AUDITION_DIALOGUE.rekha_decision);
      break;
  }
}
```

- [ ] **Step 3: Implement the ending sequence**

After all three perspectives are played:
1. Fade to black
2. Show text cards:
   - "सुंदरम ने अगली ट्रेन पकड़ी और पटना वापस चला गया।" / "Sundaram took the next train back to Patna."
   - "अर्जुन ने फिल्म साइन की। इंस्टाग्राम पर 50K नए फॉलोअर्स मिले।" / "Arjun signed the film. Gained 50K new Instagram followers."
   - "रेखा ने अगली सुबह अपना इस्तीफ़ा पत्र लिखा। फिर उसे फाड़ दिया।" / "Rekha wrote her resignation letter the next morning. Then she tore it up."
3. Credits roll with a single piano note

- [ ] **Step 4: Commit**

```bash
git add src/convergence/
git commit -m "feat: add convergence system with audition scenes and endings"
```

---

### Task 13: Create Transition System

**Files:**
- Create: `src/effects/transitions.js`
- Modify: `src/ui/switcher-ui.js`

**Interfaces:**
- Consumes: renderer, scene
- Produces: `fadeToBlack(callback)`, `fadeFromBlack()`, `showTitleCard(text, callback)`

- [ ] **Step 1: Create transition effects**

Create `src/effects/transitions.js`:
```javascript
let overlay = null;

export function initTransitions(container) {
  overlay = document.createElement('div');
  overlay.id = 'transition-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: black; opacity: 0; pointer-events: none; z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    transition: opacity 0.8s ease;
  `;
  container.appendChild(overlay);
}

export function fadeToBlack(callback) {
  overlay.style.opacity = '1';
  setTimeout(() => {
    if (callback) callback();
  }, 800);
}

export function fadeFromBlack(callback) {
  overlay.style.opacity = '0';
  setTimeout(() => {
    if (callback) callback();
  }, 800);
}

export function showTitleCard(hindi, english, callback) {
  overlay.innerHTML = `
    <div style="text-align: center; color: white; font-family: 'Outfit', sans-serif;">
      <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${hindi}</div>
      <div style="font-size: 1.2rem; opacity: 0.7;">${english}</div>
    </div>
  `;
  overlay.style.opacity = '1';
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (callback) callback();
    }, 800);
  }, 3000);
}
```

- [ ] **Step 2: Integrate with character switching**

When switching characters, use transitions:
```javascript
// In switcher-ui.js
import { fadeToBlack, fadeFromBlack, showTitleCard } from '../effects/transitions.js';

export function switchCharacter(newCharacter) {
  fadeToBlack(() => {
    // Switch chapter, environment, lighting, color grading
    showTitleCard(
      getCharacterTitle(newCharacter).hindi,
      getCharacterTitle(newCharacter).english,
      () => {
        fadeFromBlack();
      }
    );
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/effects/transitions.js src/ui/switcher-ui.js
git commit -m "feat: add scene transition system with title cards"
```

---

### Task 14: Create Journal System

**Files:**
- Create: `src/journal/system.js`
- Create: `src/journal/entries.js`
- Create: `src/ui/journal-ui.js`

**Interfaces:**
- Consumes: dialogue engine events, relationship tracker
- Produces: `addJournalEntry(entry)`, `getJournalEntries()`, `showJournal()`, `hideJournal()`

- [ ] **Step 1: Create journal data**

Create `src/journal/entries.js`:
```javascript
export const JOURNAL_ENTRIES = {
  sundaram_arrival: {
    character: 'sundaram',
    title: { en: 'Arrival in Mumbai', hi: 'मुंबई में आगमन' },
    content: { en: 'Arrived at Dadar station after 16 hours. The city is everything and nothing like I imagined.', hi: '16 घंटे बाद दादर स्टेशन पहुँचा। शहर वैसा ही है जैसा सोचा था... और बिल्कुल नहीं।' },
    trigger: 'sundaram_arrives_mumbai'
  },
  arjun_phone_call: {
    character: 'arjun',
    title: { en: 'The Call', hi: 'वो फ़ोन कॉल' },
    content: { en: 'Dad\'s assistant called. The part is already mine. I haven\'t even auditioned yet.', hi: 'पापा के असिस्टेंट का कॉल आया। रोल पहले से मेरा है। ऑडिशन भी नहीं दिया।' },
    trigger: 'arjun_receives_call'
  },
  rekha_watches_tapes: {
    character: 'rekha',
    title: { en: 'Two Tapes', hi: 'दो टेप' },
    content: { en: 'Sundaram\'s tape: raw, brilliant. Arjun\'s tape: competent, safe. Same ending every time.', hi: 'सुंदरम का टेप: कच्चा, शानदार। अर्जुन का टेप: ठीक-ठाक, सुरक्षित। हर बार वही अंत।' },
    trigger: 'rekha_reviews_tapes'
  }
  // ... more entries
};

export function getEntryForTrigger(triggerId) {
  return Object.values(JOURNAL_ENTRIES).find(e => e.trigger === triggerId);
}
```

- [ ] **Step 2: Create journal system**

Create `src/journal/system.js`:
```javascript
let entries = [];

export function addJournalEntry(entry) {
  if (!entries.find(e => e.trigger === entry.trigger)) {
    entries.push({ ...entry, timestamp: Date.now() });
  }
}

export function getJournalEntries() {
  return [...entries].sort((a, b) => b.timestamp - a.timestamp);
}

export function getEntriesByCharacter(character) {
  return entries.filter(e => e.character === character);
}

export function hasEntry(triggerId) {
  return entries.some(e => e.trigger === triggerId);
}
```

- [ ] **Step 3: Create journal UI**

Create `src/ui/journal-ui.js`:
```javascript
let journalVisible = false;
let journalElement = null;

export function initJournalUI(container) {
  journalElement = document.createElement('div');
  journalElement.id = 'journal-overlay';
  journalElement.className = 'hidden';
  journalElement.innerHTML = `
    <div class="journal-header">
      <h2>Journal</h2>
      <button id="journal-close">✕</button>
    </div>
    <div class="journal-entries"></div>
  `;
  container.appendChild(journalElement);

  document.getElementById('journal-close').addEventListener('click', hideJournal);
}

export function showJournal() {
  journalVisible = true;
  journalElement.classList.remove('hidden');
  updateJournalDisplay();
}

export function hideJournal() {
  journalVisible = false;
  journalElement.classList.add('hidden');
}

function updateJournalDisplay() {
  const entries = getJournalEntries();
  const container = journalElement.querySelector('.journal-entries');
  container.innerHTML = entries.map(entry => `
    <div class="journal-entry">
      <div class="journal-entry-title">${entry.title.en}</div>
      <div class="journal-entry-content">${entry.content.en}</div>
    </div>
  `).join('');
}
```

- [ ] **Step 4: Add journal keybinding**

Add J key to toggle journal (or a button on mobile).

- [ ] **Step 5: Commit**

```bash
git add src/journal/ src/ui/journal-ui.js
git commit -m "feat: add journal system with auto-populating entries"
```

---

### Task 15: Re-enable Post-Processing with Fixed Clear Color

**Files:**
- Modify: `src/main.js`
- Create: `src/effects/postProcessing.js`

**Interfaces:**
- Consumes: renderer, scene, camera
- Produces: `initPostProcessing()`, `renderWithPostProcessing()`

- [ ] **Step 1: Create post-processing module**

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

- [ ] **Step 2: Re-enable in main.js**

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

- [ ] **Step 3: Test that bloom works without black background**

Verify:
- Scene renders correctly (no black areas)
- Bloom adds subtle glow to neon signs, lamp lenses, sun
- FXAA smooths edges
- Performance is acceptable (30+ FPS desktop)

- [ ] **Step 4: Commit**

```bash
git add src/effects/postProcessing.js src/main.js
git commit -m "feat: re-enable EffectComposer with fixed clear color for bloom + FXAA"
```

---

### Task 16: Add Sound Design Enhancements

**Files:**
- Modify: `src/audio/ambient.js`
- Create: `src/audio/music.js`
- Create: `src/audio/voice.js`

**Interfaces:**
- Consumes: scene, character state, chapter state
- Produces: `playAmbient(location)`, `playMusic(track)`, `speakLine(text, lang)`

- [ ] **Step 1: Enhance ambient system**

Expand `src/audio/ambient.js` with location-based soundscapes:
```javascript
const SOUNDSCAPES = {
  casting_office: { files: ['ac_hum.mp3', 'distant_phones.mp3', 'chai_pour.mp3'], volume: 0.3 },
  waiting_room: { files: ['muffled_talk.mp3', 'fan_whir.mp3', 'footsteps.mp3'], volume: 0.25 },
  audition_room: { files: ['silence.mp3', 'ticking_clock.mp3'], volume: 0.15 },
  mumbai_street: { files: ['auto_horn.mp3', 'bollywood_music_distant.mp3', 'construction.mp3'], volume: 0.4 },
  pg_room: { files: ['ceiling_fan.mp3', 'neighbor_tv.mp3', 'traffic_outside.mp3'], volume: 0.3 },
  bandra_apartment: { files: ['city_hum_glass.mp3', 'sleek_door.mp3'], volume: 0.2 },
  restaurant: { files: ['ambient_chatter.mp3', 'clinking_glasses.mp3'], volume: 0.25 }
};

export function playAmbient(location) {
  stopAllAmbient();
  const soundscape = SOUNDSCAPES[location];
  if (!soundscape) return;
  // Crossfade in the new soundscape
}
```

- [ ] **Step 2: Create music system**

Create `src/audio/music.js`:
```javascript
const MUSIC_TRACKS = {
  sundaram_hopeful: { file: 'harmonium_melody.mp3', volume: 0.3 },
  arjun_cool: { file: 'minimal_piano.mp3', volume: 0.2 },
  rekha_melancholy: { file: 'music_box_90s.mp3', volume: 0.25 },
  ending: { file: 'single_piano_note.mp3', volume: 0.4 }
};

let currentTrack = null;

export function playMusic(trackName) {
  if (currentTrack) currentTrack.pause();
  const track = MUSIC_TRACKS[trackName];
  if (!track) return;
  currentTrack = new Audio(track.file);
  currentTrack.volume = track.volume;
  currentTrack.loop = true;
  currentTrack.play().catch(() => {});
}

export function stopMusic() {
  if (currentTrack) {
    currentTrack.pause();
    currentTrack = null;
  }
}
```

- [ ] **Step 3: Create voice playback system**

Create `src/audio/voice.js`:
```javascript
export function speakLine(text, lang = 'hi') {
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-IN' : lang === 'ta' ? 'ta-IN' : 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  return new Promise(resolve => {
    utterance.onend = resolve;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
}
```

- [ ] **Step 4: Integrate with dialogue engine**

Modify `src/dialogue/engine.js` to call `speakLine()` when dialogue plays:
```javascript
import { speakLine, stopSpeaking } from '../audio/voice.js';

export function startDialogue(node, onChoice) {
  stopSpeaking();
  if (node.text) {
    const lang = node.speaker === 'sundaram' ? 'hi' : 'en';
    speakLine(node.text[lang === 'hi' ? 'hi' : 'en'], lang);
  }
  // ... rest of dialogue logic
}
```

- [ ] **Step 5: Commit**

```bash
git add src/audio/
git commit -m "feat: add enhanced sound design — ambient, music, and voice systems"
```

---

### Task 17: Final Integration and Polish

**Files:**
- Modify: `src/main.js`
- Modify: `src/ui/switcher-ui.js`
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: all modules
- Produces: complete playable game

- [ ] **Step 1: Wire up character switching flow**

The full flow should be:
1. Player starts as Sundaram
2. After Sundaram's chapter ends, unlock Arjun via Tab switcher
3. After Arjun's chapter ends, unlock Rekha
4. After Rekha's chapter ends, trigger convergence
5. Convergence plays audition from all 3 perspectives
6. Endings play

Modify `src/ui/switcher-ui.js` to manage unlock progression.

- [ ] **Step 2: Add CSS for new UI elements**

Add to `styles.css`:
```css
/* Journal overlay */
#journal-overlay { ... }
.journal-header { ... }
.journal-entries { ... }
.journal-entry { ... }

/* Tape reviewer */
#tape-reviewer { ... }
.tape-left { ... }
.tape-right { ... }

/* Title cards */
#transition-overlay { ... }

/* Character switcher enhancements */
.switcher-locked { opacity: 0.4; pointer-events: none; }
.switcher-unlocked { opacity: 1; }
```

- [ ] **Step 3: Update index.html with new UI elements**

Add to `index.html`:
```html
<div id="journal-overlay" class="hidden">...</div>
<div id="tape-reviewer" class="hidden">...</div>
<div id="transition-overlay"></div>
```

- [ ] **Step 4: Final integration test**

Play through the complete game:
1. Sundaram's chapter → explore, dialogue, audition
2. Switch to Arjun → morning, arrival, waiting room, audition, dinner
3. Switch to Rekha → morning, tapes, phone call, flashback, meeting
4. Convergence → all three audition perspectives
5. Endings → text cards, credits

Verify:
- All dialogue plays correctly
- All transitions work
- Color grading shifts per character
- Lighting changes per character
- Journal populates
- Flashbacks trigger correctly
- Sound design works (ambient, music, voice)
- No console errors
- 30+ FPS on desktop

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete narrative integration — all three chapters, convergence, and polish"
```

---

## Summary: Task Dependencies

```
Task 1 (Extract typing) ──┐
Task 2 (Extract game loop) ─┤
                            ├─→ Task 3 (Arjun dialogue) ─→ Task 4 (Arjun chapter) ─→ Task 6 (Arjun scenes)
                            │                                                        │
                            ├─→ Task 7 (Rekha dialogue) ─→ Task 8 (Rekha chapter) ──┤
                            │                                                        │
                            ├─→ Task 5 (Relationship) ──────────────────────────────┤
                            │                                                        │
                            ├─→ Task 9 (Flashback system) ─────────────────────────┤
                            │                                                        │
                            ├─→ Task 10 (Color grading) ───────────────────────────┤
                            │                                                        │
                            ├─→ Task 11 (Lighting presets) ────────────────────────┤
                            │                                                        │
                            ├─→ Task 13 (Transitions) ─────────────────────────────┤
                            │                                                        │
                            ├─→ Task 14 (Journal) ─────────────────────────────────┤
                            │                                                        │
                            ├─→ Task 15 (Post-processing) ─────────────────────────┤
                            │                                                        │
                            ├─→ Task 16 (Sound design) ────────────────────────────┤
                            │                                                        │
                            └─→ Task 12 (Convergence) ←────────────────────────────┘
                                                                     │
                                                             Task 17 (Final integration)
```

**Estimated effort:** 15-20 tasks across 3-4 implementation sessions
**Critical path:** Tasks 1-2 → Task 3 → Task 4 → Task 6 → Task 12 → Task 17

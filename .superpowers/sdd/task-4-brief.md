# Task 4: Create Arjun's Chapter Module

## Files:
- Create: `src/chapters/arjun.js`
- Modify: `src/state.js`
- Modify: `src/environment.js`

## Interfaces:
- Consumes: `ARJUN_DIALOGUE` from `src/dialogue/arjun.js`, scene, camera
- Produces: `initArjunChapter(scene)`, `updateArjunChapter(dt)`

## Steps:

### Step 1: Add Arjun states to state.js

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

### Step 2: Create arjun.js chapter module

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

### Step 3: Create Arjun's environment variations

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

### Step 4: Commit

```bash
git add src/chapters/arjun.js src/state.js src/environment.js
git commit -m "feat: add Arjun's chapter module with environment presets"
```

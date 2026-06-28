# Task 8: Create Rekha's Chapter Module

## Files:
- Create: `src/chapters/rekha.js`
- Create: `src/ui/tape-reviewer.js`

## Interfaces:
- Consumes: `REKHA_DIALOGUE`, scene, camera, environment presets
- Produces: `initRekhaChapter(scene)`, `updateRekhaChapter(dt)`

## Steps:

### Step 1: Create Rekha's chapter module

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

### Step 2: Create "reviewing tapes" overlay

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

### Step 3: Commit

```bash
git add src/chapters/rekha.js src/ui/tape-reviewer.js
git commit -m "feat: add Rekha's chapter module with tape reviewer UI"
```

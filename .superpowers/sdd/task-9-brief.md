# Task 9: Create Flashback System

## Files:
- Create: `src/flashback/system.js`
- Create: `src/flashback/scenes.js`

## Interfaces:
- Consumes: scene, camera, state machine
- Produces: `triggerFlashback(type)`, `updateFlashback(dt)`, `isFlashbackActive()`

## Steps:

### Step 1: Create flashback system core

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

### Step 2: Create flashback scene definitions

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

### Step 3: Implement flashback triggers in chapters

Add flashback triggers to each chapter:
- **Sundaram:** Triggered when he sees a chai stall (reminds him of home)
- **Arjun:** Triggered when he sees family photos in the casting office
- **Rekha:** Triggered when she sees Sundaram's audition tape (reminds her of 1998)

### Step 4: Commit

```bash
git add src/flashback/
git commit -m "feat: add flashback system with three character flashbacks"
```

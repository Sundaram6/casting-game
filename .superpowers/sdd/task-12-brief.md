### Task 12: Add Basic Ambient Sound

**Files:**
- Create: `src/audio/ambient.js`
- Modify: `src/main.js` (add audio initialization)

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

- [ ] **Step 2: Add audio context initialization to main.js**

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

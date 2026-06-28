# Bug Fixes, State Unification, and Victory Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the dual state systems, add full sound cleanup, redesign victory with satirical awards, and remove dead code.

**Architecture:** Merge `gameState` from loop.js into state.js STATES enum. Add `stopAllSounds()` function. Replace victory screen with character-specific satirical awards.

**Tech Stack:** Three.js, vanilla JS ES modules, Web Audio API, Web Speech API

## Global Constraints
- ES modules (import/export)
- No external dependencies beyond Three.js
- Must work on desktop and mobile
- All dialogue bilingual (Hindi + English)
- Build with Vite (`npm run build` must pass)

---

### Task 1: Extend state.js with new game states

**Files:**
- Modify: `src/state.js`

**Interfaces:**
- Consumes: nothing
- Produces: Updated STATES enum with TYPING, CELEBRATING, VICTORY, GAME_OVER; updated transitions map

- [ ] **Step 1: Add new states to STATES enum**

Replace the entire `src/state.js` with:

```javascript
const STATES = {
    START: 'START',
    EXPLORING: 'EXPLORING',
    DIALOGUE: 'DIALOGUE',
    INTERACTING: 'INTERACTING',
    FLASHBACK: 'FLASHBACK',
    TRANSITIONING: 'TRANSITIONING',
    CHAPTER_END: 'CHAPTER_END',
    ARJUN_MORNING: 'ARJUN_MORNING',
    ARJUN_ARRIVAL: 'ARJUN_ARRIVAL',
    ARJUN_WAITING: 'ARJUN_WAITING',
    ARJUN_AUDITION: 'ARJUN_AUDITION',
    ARJUN_DINNER: 'ARJUN_DINNER',
    REKHA_OFFICE: 'REKHA_OFFICE',
    REKHA_FLASHBACK: 'REKHA_FLASHBACK',
    CONVERGENCE: 'CONVERGENCE',
    TYPING: 'TYPING',
    CELEBRATING: 'CELEBRATING',
    VICTORY: 'VICTORY',
    GAME_OVER: 'GAME_OVER',
};

let currentState = STATES.START;
let currentCharacter = 'sundaram';

const transitions = {
    [STATES.START]: [STATES.EXPLORING],
    [STATES.EXPLORING]: [STATES.DIALOGUE, STATES.INTERACTING, STATES.FLASHBACK, STATES.TRANSITIONING, STATES.TYPING],
    [STATES.DIALOGUE]: [STATES.EXPLORING],
    [STATES.INTERACTING]: [STATES.EXPLORING],
    [STATES.FLASHBACK]: [STATES.EXPLORING],
    [STATES.TRANSITIONING]: [STATES.EXPLORING, STATES.CHAPTER_END],
    [STATES.CHAPTER_END]: [STATES.START],
    [STATES.TYPING]: [STATES.CELEBRATING, STATES.GAME_OVER, STATES.EXPLORING],
    [STATES.CELEBRATING]: [STATES.EXPLORING, STATES.VICTORY],
    [STATES.VICTORY]: [STATES.START],
    [STATES.GAME_OVER]: [STATES.START],
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

- [ ] **Step 2: Verify syntax**

Run: `node -c src/state.js`
Expected: no output (success)

- [ ] **Step 3: Commit**

```bash
git add src/state.js
git commit -m "feat: add TYPING, CELEBRATING, VICTORY, GAME_OVER states to state.js"
```

---

### Task 2: Update sounds.js — add stopAllSounds, add sigma, remove success

**Files:**
- Modify: `src/game/sounds.js`

**Interfaces:**
- Consumes: nothing
- Produces: `stopAllSounds()`, `sounds.sigma`, updated `sounds` object

- [ ] **Step 1: Replace entire sounds.js**

Replace the entire `src/game/sounds.js` with:

```javascript
const sounds = {
    fail: new Audio('https://www.myinstants.com/media/sounds/emotional-damage-meme.mp3'),
    sensual: new Audio('https://www.myinstants.com/media/sounds/careless-whisper-1.mp3'),
    sigma: new Audio('https://www.myinstants.com/media/sounds/sigma-rule-meme-song.mp3'),
    victorious: new Audio('https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3'),
    type: new Audio('https://www.myinstants.com/media/sounds/minecraft_click.mp3'),
    bgm: new Audio('https://www.myinstants.com/media/sounds/wii-shop-channel-music.mp3'),
    chatter: new Audio('https://www.myinstants.com/media/sounds/crowd-talking-1.mp3')
};

sounds.bgm.loop = true;
sounds.bgm.volume = 0.2;
sounds.chatter.loop = true;
sounds.chatter.volume = 0.4;
sounds.sensual.volume = 0.85;
sounds.victorious.volume = 0.75;
sounds.sigma.volume = 0.8;

function playSound(snd) {
    snd.currentTime = 0;
    snd.play().catch(e => console.log("Audio play blocked"));
}

function stopAllSounds() {
    Object.values(sounds).forEach(s => {
        if (s && typeof s.pause === 'function') {
            s.pause();
            s.currentTime = 0;
        }
    });
}

export { sounds, playSound, stopAllSounds };
```

- [ ] **Step 2: Verify syntax**

Run: `node -c src/game/sounds.js`
Expected: no output (success)

- [ ] **Step 3: Commit**

```bash
git add src/game/sounds.js
git commit -m "feat: add stopAllSounds(), add sigma sound, remove unused success sound"
```

---

### Task 3: Update loop.js — remove gameState, use state.js

**Files:**
- Modify: `src/game/loop.js`

**Interfaces:**
- Consumes: STATES, getState, setState from state.js
- Produces: Updated loop.js with no gameState variable

- [ ] **Step 1: Add state.js import**

In `src/game/loop.js`, add at the top (after existing imports):

```javascript
import { getState, setState, STATES } from '../state.js';
```

- [ ] **Step 2: Remove gameState variable and getGameState/setGameState**

In `src/game/loop.js`, find and remove these lines:

```javascript
let gameState = 'START';
```

And remove these functions:

```javascript
function getGameState() {
    return gameState;
}

function setGameState(state) {
    gameState = state;
}
```

- [ ] **Step 3: Update exports**

In `src/game/loop.js`, replace the export block with:

```javascript
export {
    initGameLoop,
    animate,
    getScore,
    addScore,
    getOfficesCompleted,
    incrementOfficesCompleted,
    getTotalOffices,
    spawnFireworks,
    spawnPhysicsParticle
};
```

- [ ] **Step 4: Replace all gameState references with getState()/setState()**

In `src/game/loop.js`, make these replacements:

1. Line 178: `if (gameState === 'PLAYING' && controls.isLocked)` → `if (getState() === STATES.PLAYING && controls.isLocked)` — BUT WAIT, `PLAYING` is not in STATES. It should be `STATES.EXPLORING`. So: `if (getState() === STATES.EXPLORING && controls.isLocked)`

2. Line 238: `} else if (gameState === 'TYPING') {` → `} else if (getState() === STATES.TYPING) {`

3. Line 243: `if (gameState === 'PLAYING' || gameState === 'TYPING') {` → `if (getState() === STATES.EXPLORING || getState() === STATES.TYPING) {`

4. Line 308: `if (gameState === 'PLAYING') {` → `if (getState() === STATES.EXPLORING) {`

- [ ] **Step 5: Verify syntax**

Run: `node -c src/game/loop.js`
Expected: no output (success)

- [ ] **Step 6: Commit**

```bash
git add src/game/loop.js
git commit -m "refactor: remove gameState from loop.js, use unified state.js"
```

---

### Task 4: Update typing-game.js — use state.js, add stopAllSounds, add victory awards

**Files:**
- Modify: `src/legacy/typing-game.js`

**Interfaces:**
- Consumes: getState, setState, STATES from state.js; stopAllSounds from sounds.js
- Produces: Updated typing-game.js with unified state and victory awards

- [ ] **Step 1: Add imports**

In `src/legacy/typing-game.js`, add at the top (after `import * as THREE from 'three';`):

```javascript
import { getState, setState, STATES } from '../state.js';
import { stopAllSounds } from '../game/sounds.js';
```

- [ ] **Step 2: Add victory awards data**

After the `winPhrases` array, add:

```javascript
const VICTORY_AWARDS = {
    sundaram: [
        "Best Background Actor — Nobody Noticed",
        "Most Authentic Audition — Not That It Mattered",
        "Longest Train Ride Home — Bihar to Mumbai and Back"
    ],
    arjun: [
        "Best Actor — Filmfare Awards",
        "Rising Star — Stardust Awards",
        "Instagram Influencer of the Year"
    ],
    rekha: [
        "Lifetime Achievement in Looking the Other Way",
        "Best Supporting Character in a Broken System",
        "30 Years of Silence — Award Pending"
    ]
};
```

- [ ] **Step 3: Add showVictoryAwards function**

After the `VICTORY_AWARDS` constant, add:

```javascript
function showVictoryAwards(character) {
    const awards = VICTORY_AWARDS[character] || VICTORY_AWARDS.sundaram;
    let delay = 0;

    cfg.sounds.bgm.pause();
    cfg.sounds.sigma.currentTime = 0;
    cfg.sounds.sigma.play().catch(() => {});

    awards.forEach((award, i) => {
        setTimeout(() => {
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
                overlay.innerHTML = `
                    <div style="text-align: center; color: #FFD700; font-family: 'Outfit', sans-serif; text-shadow: 0 0 20px rgba(255,215,0,0.5);">
                        <div style="font-size: 1rem; opacity: 0.7; margin-bottom: 0.5rem;">${i + 1} of ${awards.length}</div>
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${award}</div>
                        <div style="font-size: 0.9rem; opacity: 0.5; margin-top: 1rem;">🏆</div>
                    </div>
                `;
                overlay.style.opacity = '1';
                overlay.style.pointerEvents = 'auto';
            }
        }, delay);

        delay += 3000;

        setTimeout(() => {
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
        }, delay);

        delay += 800;
    });

    setTimeout(() => {
        cfg.sounds.sigma.pause();
        cfg.sounds.bgm.play().catch(() => {});
        document.getElementById('vic-score').innerText = cfg.getScore();
        cfg.controls.unlock();
        cfg.changeScreen('victory-screen');
    }, delay);
}
```

- [ ] **Step 4: Update startTypingMinigame to use state.js**

In `src/legacy/typing-game.js`, find line 63:
```javascript
cfg.setGameState('TYPING');
```
Replace with:
```javascript
setState(STATES.TYPING);
```

- [ ] **Step 5: Update handleTypingCharacter to use state.js**

In `src/legacy/typing-game.js`, find line 97:
```javascript
if (cfg.getGameState() !== 'TYPING') return;
```
Replace with:
```javascript
if (getState() !== STATES.TYPING) return;
```

- [ ] **Step 6: Update showCelebrationScene to use state.js**

In `src/legacy/typing-game.js`, find line 135:
```javascript
cfg.setGameState('CELEBRATING');
```
Replace with:
```javascript
setState(STATES.CELEBRATING);
```

- [ ] **Step 7: Update winMinigame to use state.js and add stopAllSounds**

In `src/legacy/typing-game.js`, update the `winMinigame` function:

```javascript
function winMinigame() {
    stopAllSounds();
    const chosen = winPhrases[Math.floor(Math.random() * winPhrases.length)];

    currentOffice.completed = true;
    currentOffice.isWinning = true;

    cfg.spawnFireworks(currentOffice.group.position.x, currentOffice.group.position.y + 10, currentOffice.group.position.z);

    cfg.addScore(Math.floor(100 * combo));
    cfg.incrementOfficesCompleted();
    cfg.updateHUD();

    showCelebrationScene(chosen, () => {
        if (cfg.getOfficesCompleted() >= cfg.getTotalOffices()) {
            setState(STATES.VICTORY);
            showVictoryAwards(getCharacter());
        } else {
            setState(STATES.EXPLORING);
            cfg.changeScreen(null);
        }
    });
}
```

- [ ] **Step 8: Update handleGameOver to use state.js and add stopAllSounds**

In `src/legacy/typing-game.js`, update the `handleGameOver` function:

```javascript
export function handleGameOver() {
    stopAllSounds();
    setState(STATES.GAME_OVER);
    cfg.playSound(cfg.sounds.fail);
    document.getElementById('go-score').innerText = cfg.getScore();
    cfg.controls.unlock();
    cfg.changeScreen('game-over-screen');
    document.getElementById('game-over-screen').classList.add('flashing');

    const body = document.body;
    body.classList.remove('shake-severe');
    void body.offsetWidth;
    body.classList.add('shake-severe');
}
```

- [ ] **Step 9: Verify syntax**

Run: `node -c src/legacy/typing-game.js`
Expected: no output (success)

- [ ] **Step 10: Commit**

```bash
git add src/legacy/typing-game.js
git commit -m "feat: use unified state, add stopAllSounds, add satirical victory awards"
```

---

### Task 5: Update main.js — use state.js, add stopAllSounds

**Files:**
- Modify: `src/main.js`

**Interfaces:**
- Consumes: getState, setState, STATES from state.js; stopAllSounds from sounds.js
- Produces: Updated main.js with unified state

- [ ] **Step 1: Update imports**

In `src/main.js`, find the imports section and add/update:

```javascript
import { getState, setState, STATES } from './state.js';
import { stopAllSounds } from './game/sounds.js';
```

Remove the import of `setGameState` from the game/loop.js import line (it no longer exists).

- [ ] **Step 2: Update initGame()**

In `src/main.js`, find the `initGame()` function. Make these changes:

1. Add `stopAllSounds()` as the first line inside `initGame()`:
```javascript
function initGame() {
    stopAllSounds();
    // ... rest of existing code
```

2. Find `setGameState('PLAYING')` (around line 199) and replace with:
```javascript
setState(STATES.EXPLORING);
```

3. Find `setState(STATES.EXPLORING)` (around line 200) — this is now redundant since we just set it above. Remove it.

4. Find `setGameState('START')` (around line 172) and replace with:
```javascript
setState(STATES.START);
```

- [ ] **Step 3: Remove getGameState/setGameState from loop.js import**

In `src/main.js`, find the import from `./game/loop.js` and remove `getGameState` and `setGameState` from the import list (they no longer exist in loop.js).

- [ ] **Step 4: Verify syntax**

Run: `node -c src/main.js`
Expected: no output (success)

- [ ] **Step 5: Commit**

```bash
git add src/main.js
git commit -m "feat: use unified state.js and stopAllSounds in main.js"
```

---

### Task 6: Update switcher-ui.js — add stopAllSounds

**Files:**
- Modify: `src/ui/switcher-ui.js`

**Interfaces:**
- Consumes: stopAllSounds from sounds.js
- Produces: Updated switchToCharacter with sound cleanup

- [ ] **Step 1: Add import**

In `src/ui/switcher-ui.js`, add at the top:

```javascript
import { stopAllSounds } from '../game/sounds.js';
```

- [ ] **Step 2: Add stopAllSounds to switchToCharacter**

In `src/ui/switcher-ui.js`, find the `switchToCharacter` function. Add `stopAllSounds()` as the first line inside the `fadeToBlack` callback:

```javascript
function switchToCharacter(charId) {
    if (switchingInProgress) return;
    if (!isCharacterUnlocked(charId)) return;
    if (charId === getCharacter()) return;
    if (getCharacter() === 'rekha' && getConvergenceState() !== 'inactive') return;

    switchingInProgress = true;
    const titles = getCharacterTitle(charId);

    fadeToBlack(() => {
        stopAllSounds();
        setCharacter(charId);
        // ... rest of existing code
```

- [ ] **Step 3: Verify syntax**

Run: `node -c src/ui/switcher-ui.js`
Expected: no output (success)

- [ ] **Step 4: Commit**

```bash
git add src/ui/switcher-ui.js
git commit -m "feat: add stopAllSounds to character switcher"
```

---

### Task 7: Update proximity-audio.js — use state.js

**Files:**
- Modify: `src/game/proximity-audio.js`

**Interfaces:**
- Consumes: getState, STATES from state.js
- Produces: Updated proximity-audio.js with unified state

- [ ] **Step 1: Add import**

In `src/game/proximity-audio.js`, add at the top:

```javascript
import { getState, STATES } from '../state.js';
```

- [ ] **Step 2: Replace getGameState() calls**

In `src/game/proximity-audio.js`, find all occurrences of `getGameState()` and replace with `getState()`. Also find string comparisons like `=== 'PLAYING'` and replace with `=== STATES.EXPLORING`, and `=== 'CELEBRATING'` with `=== STATES.CELEBRATING`.

The exact line numbers depend on the current file, but the pattern is:
- `getGameState() === 'PLAYING'` → `getState() === STATES.EXPLORING`
- `getGameState() === 'CELEBRATING'` → `getState() === STATES.CELEBRATING`

- [ ] **Step 3: Remove getGameState import if it was imported from loop.js**

If proximity-audio.js imports `getGameState` from `./loop.js`, remove that import.

- [ ] **Step 4: Verify syntax**

Run: `node -c src/game/proximity-audio.js`
Expected: no output (success)

- [ ] **Step 5: Commit**

```bash
git add src/game/proximity-audio.js
git commit -m "feat: use unified state.js in proximity-audio"
```

---

### Task 8: Delete music.js stub and update CHANGELOG

**Files:**
- Delete: `src/audio/music.js`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: nothing
- Produces: Clean codebase, updated changelog

- [ ] **Step 1: Check for imports of music.js**

Run: `grep -r "music.js" src/`
If any files import from `./audio/music.js`, remove those imports.

- [ ] **Step 2: Delete music.js**

Run: `rm src/audio/music.js`

- [ ] **Step 3: Update CHANGELOG.md**

Add a new entry at the top of `CHANGELOG.md`:

```markdown
## [2.1.0] - Bug Fixes, State Unification, and Victory Redesign

### Fixed
- **Dual state systems unified** — Merged `gameState` from loop.js into `state.js` STATES enum. Single source of truth eliminates Tab handler bug and state sync issues.
- **Sound cleanup on all transitions** — Added `stopAllSounds()` function called before every state transition (game start, character switch, typing win/loss). Victory/careless whisper sounds now properly stopped.
- **Tab handler fixed** — Character switcher now correctly blocks switching during typing minigames (fixed by state unification).

### Added
- **Satirical victory awards** — Each character receives 3 ironic awards after completing all offices. Arjun gets nepotism awards, Sundaram gets "nobody noticed" awards, Rekha gets "looking the other way" awards.
- **Sigma Rule victory music** — Replaces FF7 Victory Fanfare with meme-appropriate sound for satirical ending.
- **`stopAllSounds()` utility** — Exports from sounds.js for use across codebase.

### Removed
- **`sounds.success`** — Unused Yippee sound (dead code).
- **`src/audio/music.js`** — Complete stub with no actual functionality.
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove dead code, update changelog to v2.1.0"
```

---

### Task 9: Integration test and final verification

**Files:**
- None (testing only)

**Interfaces:**
- Consumes: all previous tasks
- Produces: Verified working game

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Open: http://localhost:5173

- [ ] **Step 2: Test state transitions**

Walk to an office → verify typing minigame starts (state = TYPING)
Type correctly → verify celebration plays → verify sounds stop → verify BGM resumes
Verify state returns to EXPLORING after celebration

- [ ] **Step 3: Test game over**

Walk to an office → let timer run out → verify fail sound plays → verify state returns to EXPLORING

- [ ] **Step 4: Test victory awards**

Complete all 15 offices → verify 3 satirical awards display sequentially with Sigma Rule music → verify victory screen shows with score

- [ ] **Step 5: Test Tab handler**

During typing minigame → press Tab → verify character switch is blocked

- [ ] **Step 6: Test sound cleanup on restart**

Complete a typing minigame → restart game → verify all sounds stop before new sounds start

- [ ] **Step 7: Test character switch sounds**

Switch character → verify all sounds stop during transition

- [ ] **Step 8: Final build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 9: Push to GitHub**

```bash
git push
```

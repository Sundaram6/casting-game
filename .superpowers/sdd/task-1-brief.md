# Task 1: Extract Old Typing Game into Standalone Module

## Files:
- Create: `src/legacy/typing-game.js`
- Create: `src/legacy/typing-ui.js`
- Create: `src/legacy/crowds.js`
- Modify: `src/main.js` (remove extracted code, import from legacy/)

## Interfaces:
- Consumes: `scene`, `camera`, `controls`, `offices` from main.js
- Produces: `initTypingGame()`, `startTypingMinigame()`, `updateTyping()`, `handleGameOver()`, `createCrowds()`, `updateCrowds()`

## Steps:

### Step 1: Create `src/legacy/` directory

```bash
mkdir -p src/legacy
```

### Step 2: Extract typing minigame logic

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

### Step 3: Extract crowd/NPC system

Move from `src/main.js` into `src/legacy/crowds.js`:
- `createPersonMesh()` function
- `animatePerson()` function
- `createDogMesh()` function
- `animateDog()` function
- `createCrowds()` function
- Crowd update logic from the animate loop
- `nepoCrowds`, `nepoDogs`, `crowds` arrays and their update logic

Export: `initCrowds(scene, offices)`, `updateCrowds(dt)`, `getCrowds()`, `getNepoCrowds()`, `getNepoDogs()`

### Step 4: Extract typing UI

Move from `src/main.js` into `src/legacy/typing-ui.js`:
- `updateTypingUI()` function
- `screens.typing` references
- `typedTextEl`, `untypedTextEl`, `timerBar`, `timerText` references
- `startTypingMinigame()` screen change logic

Export: `initTypingUI()`, `showTypingScreen(office)`, `hideTypingScreen()`, `updateTypingDisplay(typed, untyped, pct, time)`

### Step 5: Refactor main.js to use legacy modules

In `src/main.js`, replace extracted code with imports:
```javascript
import { initTypingGame, startTypingMinigame as legacyStartTyping, updateTyping } from './legacy/typing-game.js';
import { initCrowds, updateCrowds } from './legacy/crowds.js';
import { initTypingUI, showTypingScreen, hideTypingScreen } from './legacy/typing-ui.js';
```

Remove all extracted functions and variables from main.js. Keep the import references. Verify the game still works.

### Step 6: Test and commit

Run the dev server. Verify:
- Old typing minigame still works (walk up to office, type "nepo kid")
- Crowds still animate
- Score/combos still function
- No console errors

```bash
git add src/legacy/ src/main.js
git commit -m "refactor: extract old typing game and crowds into legacy/ modules"
```

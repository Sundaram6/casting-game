# Task 2: Extract Game Loop Sections from main.js

## Files:
- Create: `src/game/loop.js`
- Create: `src/game/buildings.js`
- Create: `src/game/input.js`
- Modify: `src/main.js` (slim down to initialization + imports)

## Interfaces:
- Consumes: `scene`, `camera`, `renderer`, `controls`, `composer` from scene.js/main.js
- Produces: `initGameLoop()`, `animate()`, `createOffices()`, `initInput()`

## Steps:

### Step 1: Extract building creation into `src/game/buildings.js`

Move from `src/main.js`:
- `NORMAL_STUDIOS` config array
- `NEPO_HOUSES` config array
- `createOfficeBuilding()` function
- `addWindowsToBuilding()` function
- `createOffices()` function
- `offices` array

Export: `createOffices(scene)`, `getOffices()`, `NORMAL_STUDIOS`, `NEPO_HOUSES`

### Step 2: Extract input handling into `src/game/input.js`

Move from `src/main.js`:
- `moveForward`, `moveBackward`, `moveLeft`, `moveRight`, `isSprinting` variables
- All `keydown`/`keyup` event listeners for WASD/arrows/sprint
- Mobile joystick logic
- Mobile action buttons (sprint, jump)

Export: `initInput()`, `getInputState()` (returns {moveForward, moveBackward, moveLeft, moveRight, isSprinting})

### Step 3: Extract game loop into `src/game/loop.js`

Move from `src/main.js`:
- The `animate()` function body (day/night cycle, physics, crowd updates, grass animation, water animation, dust systems, dialogue UI update, interaction update)
- `prevTime`, `velocity`, `velocityY`, `isGrounded`, `headBobTimer` variables

Export: `initGameLoop(state)`, `animate()`, `getGameState()`

### Step 4: Slim down main.js to entry point

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

### Step 5: Test and commit

Run the dev server. Verify:
- Old typing minigame still works (walk up to office, type "nepo kid")
- Crowds still animate
- Score/combos still function
- No console errors

```bash
git add src/game/ src/main.js
git commit -m "refactor: extract game loop, buildings, and input into game/ modules"
```

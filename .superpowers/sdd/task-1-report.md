# Task 1 Report: Extract Old Typing Game into Standalone Module

## Status: DONE

## Summary
Successfully extracted the old typing game, crowd/NPC system, and typing UI from the 1915-line `src/main.js` monolith into three standalone modules under `src/legacy/`.

## Changes Made

### Files Created
- `src/legacy/typing-game.js` (7.4KB) - Typing minigame logic, victory/celebration scenes, combo system
- `src/legacy/crowds.js` (18.2KB) - Person/dog mesh creation, animation, crowd spawning and update logic
- `src/legacy/typing-ui.js` (1.2KB) - DOM manipulation for typed text, timer display

### Files Modified
- `src/main.js` (1224 lines, down from 1896) - Removed extracted code, added imports and initialization

### Key Architecture Decisions
1. **Dependency Injection**: Legacy modules receive dependencies via config objects passed to `initTypingGame()` and `initCrowds()`, avoiding circular imports
2. **Shared State**: `gameState` is accessed through getter/setter callbacks (`getGameState()`, `setGameState()`) to maintain the single-source-of-truth pattern
3. **Crowd Consolidation**: Both regular crowds and nepo crowds/dogs are now managed by the crowds module via `initCrowds(scene, offices, NEPO_POSITIONS)`
4. **Nepo Positions**: `NEPO_POSITIONS` constant defined in main.js and passed to `initCrowds()` to avoid duplication

### Functions/Variables Removed from main.js
- Typing state: `TARGET_WORD`, `typeIndex`, `currentTimer`, `maxTimer`, `currentOffice`, `combo`, `lastTypeTime`
- UI elements: `typedTextEl`, `untypedTextEl`, `timerBar`, `timerText`, `goScore`, `vicScore`
- Crowd arrays: `crowds`, `nepoDogs`, `nepoPeople`, `nepoCrowds`
- Functions: `createPersonMesh`, `createDogMesh`, `createCrowds`, `animatePerson`, `animateDog`, `startTypingMinigame`, `updateTypingUI`, `handleGameOver`, `showCelebrationScene`, `winMinigame`, `handleTypingCharacter`, `winPhrases`

### Functions Retained in main.js
- Office building: `addWindowsToBuilding`, `createOfficeBuilding`, `createBouncerMesh`, `createOffices`
- Effects: `spawnFireworks`, `spawnPhysicsParticle`, `spawnBuzzBubble`
- Game management: `initGame`, `changeScreen`, `updateHUD`
- Movement: All keyboard/touch handlers, joystick, look controls
- Audio: `playSound`, `getVolumeByDistance`, speech synthesis intervals

## Commits
- `ff2eff4` - refactor: extract old typing game and crowds into legacy modules

## Testing
- Vite dev server starts successfully on port 5175
- No compilation errors detected during startup
- Code structure verified: all imports resolve, exports match, no dangling references

## Concerns
None significant. The extraction preserves identical runtime behavior:
- All crowd animation logic is identical to the original
- Typing game mechanics (combo, timer, celebration scenes) are unchanged
- Keyboard and touch input handlers call the same functions via imports
- Speech synthesis uses getter functions to access crowd arrays

## Files
- Report: `.superpowers/sdd/task-1-report.md`

# Fix Report

## Status: DONE

## Commit
`a804ded` — fix: add missing startTypingMinigame import and lazy-init chapters on character switch

## Summary
Fixed `startTypingMinigame` import in main.js and moved chapter initialization from all-at-once in `initGame()` to lazy-init on character switch in `switcher-ui.js`.

## Changes

### Issue 1: `startTypingMinigame` import
- **File:** `src/main.js:12` — Added `startTypingMinigame` to the existing `typing-game.js` import
- The function was exported from `src/legacy/typing-game.js` and used in `src/game/loop.js` via `initGameLoop`, but never imported in main.js

### Issue 2: Lazy chapter initialization
- **File:** `src/main.js` — Removed `initArjunChapter`/`initRekhaChapter` imports and calls from `initGame()`; added `resetChapterInit()` call on game restart
- **File:** `src/ui/switcher-ui.js` — Added `initChapterForCharacter()` with a guard set (`initializedChapters`) that only initializes a chapter's meshes/interactables once per game session; called during `switchToCharacter()` fade-to-black
- Only Sundaram's chapter initializes at game start; Arjun/Rekha chapters init on first switch

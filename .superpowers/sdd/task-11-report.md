### Task 11: Create Sundaram's Chapter

**Status:** DONE

**What I implemented:**
- Created `src/chapters/sundaram.js` with:
  - Casting office door (triggers `sundaramDialogue` on interaction)
  - Chai wallah stall (inline dialogue tree for ordering chai)
  - Newspaper clipping (examine interaction with bilingual text)
  - 4 waiting room actor NPCs (simple cylinder+sphere body meshes)
- Updated `src/main.js`:
  - Added import for `initSundaramChapter` and `updateSundaramChapter`
  - Called `initSundaramChapter(scene)` in `initGame()`
  - Called `updateSundaramChapter(dt)` in `animate()` loop

**Build verification:** `npm run build` passes successfully with 27 modules transformed.

**Files changed:**
- `src/chapters/sundaram.js` (created)
- `src/main.js` (modified: import + 2 function calls)

**Self-review findings:**
- Removed unused `startDialogue` import from `sundaram.js` (was in brief but not needed since `registerInteractable` handles dialogue internally)
- All interactables follow existing patterns from `interaction.js` (dialogue type calls `startDialogue`, examine type calls `setState`)
- Build produces clean output, no errors

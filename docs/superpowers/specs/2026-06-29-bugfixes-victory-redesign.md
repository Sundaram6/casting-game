# Bug Fixes, State Unification, and Victory Redesign

**Date:** 2026-06-29
**Status:** Approved
**Scope:** Bug fixes + feature enhancements

## Problem Statement

The game has several interconnected issues:

1. **Dual state systems** — `gameState` in loop.js and `STATES` in state.js operate independently, causing bugs like the Tab handler allowing character switching during typing minigames.
2. **Sound cleanup missing** — Victory/careless whisper sounds not explicitly stopped. No cleanup on game restart. Sounds bleed across state transitions.
3. **Victory screen lacks thematic punch** — "YOU GOT ALL THE ROLES! Nepotism wins again!" doesn't deliver the satirical ending the game deserves.
4. **Dead code** — `sounds.success` (Yippee) unused, `src/audio/music.js` is a complete stub.

## Design

### 1. State Unification

Merge `gameState` from loop.js into the `STATES` enum in state.js.

**New STATES enum:**
```javascript
const STATES = {
  // Existing
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
  // New — merged from loop.js gameState
  TYPING: 'TYPING',
  CELEBRATING: 'CELEBRATING',
  VICTORY: 'VICTORY',
  GAME_OVER: 'GAME_OVER',
};
```

**Updated transitions map:**
```javascript
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
```

**Changes:**
- Remove `gameState` variable, `getGameState()`, `setGameState()` from loop.js
- Export `getGameState` as alias for `getState` from state.js (temporary backward compatibility — remove once all callers are updated in this same change)
- Update typing-game.js to use `getState()`/`setState()` instead of `cfg.getGameState()`/`cfg.setGameState()`
- Update main.js `initGame()` to use `setState(STATES.EXPLORING)` instead of `setGameState('PLAYING')`
- Update proximity-audio.js to check `getState()` instead of `getGameState()`
- Tab handler in switcher-ui.js already checks `getState()` — automatically fixed

### 2. Sound Cleanup

**Add `stopAllSounds()` to sounds.js:**
```javascript
function stopAllSounds() {
  Object.values(sounds).forEach(s => {
    if (s && typeof s.pause === 'function') {
      s.pause();
      s.currentTime = 0;
    }
  });
}
```

**Call sites:**
- `initGame()` in main.js — before starting BGM/chatter
- `switchToCharacter()` in switcher-ui.js — before fade transition
- `handleGameOver()` in typing-game.js — before playing fail sound
- `winMinigame()` in typing-game.js — before playing celebration sound

**Victory music:** Replace `sounds.victorious` (FF7 Victory Fanfare) with Sigma Rule meme sound. Add as `sounds.sigma` in sounds.js. Source: placeholder URL — use a royalty-free version or record a short clip. If unavailable, fall back to the existing `sounds.victorious` temporarily.

**Remove:**
- `sounds.success` (unused Yippee sound)
- `src/audio/music.js` (dead stub, no actual functionality)

### 3. Victory Redesign — Satirical Awards

When all offices are completed (VICTORY state), show character-specific satirical awards:

**Arjun (nepo kid):**
- "Best Actor — Filmfare Awards" (his father is on the committee)
- "Rising Star — Stardust Awards" (paid for the nomination)
- "Instagram Influencer of the Year" (50K followers from the film)

**Sundaram (outsider):**
- "Best Background Actor — Nobody Noticed"
- "Most Authentic Audition — Not That It Mattered"
- "Longest Train Ride Home — Bihar to Mumbai and Back"

**Rekha (gatekeeper):**
- "Lifetime Achievement in Looking the Other Way"
- "Best Supporting Character in a Broken System"
- "30 Years of Silence — Award Pending"

**Implementation:**
- New `showVictoryAwards(character)` function in typing-game.js
- Uses existing `showTitleCard()` from transitions.js for each award
- Awards shown sequentially with 3-second display time each
- Sigma Rule meme music plays during awards sequence
- After all awards shown, display final victory screen with score

### 4. Cleanup

- Remove `sounds.success` from sounds.js
- Delete `src/audio/music.js`
- Remove any imports of music.js from other files
- Update CHANGELOG.md with v2.1.0 entry

## Files Changed

| File | Change |
|------|--------|
| `src/state.js` | Add TYPING, CELEBRATING, VICTORY, GAME_OVER to STATES; update transitions |
| `src/game/loop.js` | Remove gameState variable, getGameState(), setGameState(); use state.js |
| `src/legacy/typing-game.js` | Use state.js instead of cfg.getGameState/setGameState; add stopAllSounds calls |
| `src/main.js` | Use state.js in initGame(); add stopAllSounds() call |
| `src/ui/switcher-ui.js` | Add stopAllSounds() call in switchToCharacter() |
| `src/game/proximity-audio.js` | Use state.js instead of getGameState() |
| `src/game/sounds.js` | Add stopAllSounds(); add sounds.sigma; remove sounds.success |
| `src/audio/music.js` | DELETE |
| `CHANGELOG.md` | Add v2.1.0 entry |

## Testing

1. Start game → walk to office → type correctly → verify celebration plays, then stops, BGM resumes
2. Start game → walk to office → let timer run out → verify fail sound plays, state returns to EXPLORING
3. Complete all offices → verify satirical awards display sequentially with Sigma Rule music
4. Press Tab during typing → verify character switch is blocked
5. Restart game → verify all sounds stop before new sounds start
6. Switch character → verify all sounds stop during transition

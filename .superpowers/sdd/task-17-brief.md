# Task 17: Final Integration and Polish

## Files:
- Modify: `src/main.js`
- Modify: `src/ui/switcher-ui.js`
- Modify: `index.html`
- Modify: `styles.css`

## Interfaces:
- Consumes: all modules
- Produces: complete playable game

## Steps:

### Step 1: Wire up character switching flow

The full flow should be:
1. Player starts as Sundaram
2. After Sundaram's chapter ends, unlock Arjun via Tab switcher
3. After Arjun's chapter ends, unlock Rekha
4. After Rekha's chapter ends, trigger convergence
5. Convergence plays audition from all 3 perspectives
6. Endings play

Modify `src/ui/switcher-ui.js` to manage unlock progression.

### Step 2: Add CSS for new UI elements

Add to `styles.css`:
- Journal overlay styles
- Tape reviewer styles
- Title card styles
- Character switcher enhancements (locked/unlocked states)

### Step 3: Update index.html with new UI elements

Add missing HTML elements:
- `#journal-overlay`
- `#tape-reviewer`
- `#transition-overlay`

### Step 4: Final integration test

Verify the complete game flow works:
- Sundaram's chapter → explore, dialogue, audition
- Switch to Arjun → morning, arrival, waiting room, audition, dinner
- Switch to Rekha → morning, tapes, phone call, flashback, meeting
- Convergence → all three audition perspectives
- Endings → text cards, credits

Verify:
- All dialogue plays correctly
- All transitions work
- Color grading shifts per character
- Lighting changes per character
- Journal populates
- Flashbacks trigger correctly
- Sound design works (ambient, music, voice)
- No console errors
- 30+ FPS on desktop

### Step 5: Commit

```bash
git add -A
git commit -m "feat: complete narrative integration — all three chapters, convergence, and polish"
```

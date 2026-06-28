# Task 14: Create Journal System

## Files:
- Create: `src/journal/system.js`
- Create: `src/journal/entries.js`
- Create: `src/ui/journal-ui.js`

## Interfaces:
- Consumes: dialogue engine events, relationship tracker
- Produces: `addJournalEntry(entry)`, `getJournalEntries()`, `showJournal()`, `hideJournal()`

## Steps:

### Step 1: Create journal data

Create `src/journal/entries.js` with bilingual entries for key story moments:
- Sundaram's arrival in Mumbai
- Arjun's phone call (role already his)
- Rekha watching the two tapes
- More entries for each major story beat

### Step 2: Create journal system

Create `src/journal/system.js`:
- `addJournalEntry(entry)` — adds entry (deduplicates by trigger)
- `getJournalEntries()` — returns all entries sorted by timestamp
- `getEntriesByCharacter(character)` — filters by character
- `hasEntry(triggerId)` — checks if entry exists

### Step 3: Create journal UI

Create `src/ui/journal-ui.js`:
- Overlay with header and close button
- List of journal entries with title and content
- Toggle with J key (or button on mobile)

### Step 4: Add CSS for journal overlay

Add journal overlay styles to `styles.css`.

### Step 5: Commit

```bash
git add src/journal/ src/ui/journal-ui.js styles.css
git commit -m "feat: add journal system with auto-populating entries"
```

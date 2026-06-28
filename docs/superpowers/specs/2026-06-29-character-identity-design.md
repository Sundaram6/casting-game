# Character Identity & Relationship Visibility — Design Spec

## Problem

The game has rich character identity defined in code but barely surfaces it to players:

- `characters.js` defines `role: 'The Outsider'`, `'The Nepo Kid'`, `'The Gatekeeper'` — never shown in any UI
- Title cards show only names during character switch
- Sundaram's own chapter never mentions he's from Bihar
- Journal has no biographical entries — only plot events
- HUD has no character indicator — player has no persistent anchor
- Flashback scenes are coded but never triggered
- Dialogue speaker name map is incomplete (Arjun falls through to raw string)
- Relationship tracking is invisible to the player

## Approach

Fix gaps in existing systems rather than building new ones. Use the existing journal, dialogue, switcher, and title card infrastructure. Activate the existing flashback system.

## Changes

### 1. Dialogue Fixes

Add 2-3 dialogue nodes to `src/dialogue/sundaram.js` where Sundaram reveals his background naturally:

- **Node `look_around`** — Inner monologue: *"The auto ride from Dadar was 16 hours. Patna to Mumbai... same dream, different city."*
- **Node `waiting_room`** — When another actor asks: *"Bihari hoon. Patna. Theater karta tha wahan."* (I'm from Bihar. Patna. I used to do theater there.)
- **Node `chai_wallah`** — Connection to home: *"Bihari lagte ho?"* (Are you from Bihar?)

These lines are short, natural, and reveal identity through dialogue rather than exposition.

### 2. Title Card Enhancement

Add `role` parameter to `showTitleCard()` in `src/effects/transitions.js`. Display role label below the name:

```
सुंदरम शर्मा
Sundaram Sharma
The Outsider
```

**Implementation:** Pass `getCharacterConfig(charId).role` from `switcher-ui.js` when calling `showTitleCard()`. Add CSS for the role label (smaller, italic, muted color).

### 3. Character Switcher Enhancement

Add role label to switcher buttons in `src/ui/switcher-ui.js`:

```
[ Sundaram ]
[ The Outsider ]
```

**Implementation:** Add `<span class="switcher-role">` element to each button. Style with smaller font, muted color. Use existing `getCharacterConfig(charId).role` data.

### 4. HUD Character Indicator

Add character name and role to the HUD in `index.html`:

```
Sundaram Sharma
The Outsider
```

Position: Top-left corner. Shows current character name (English) and role label. Updates on character switch.

**Implementation:** Add `<div id="hud-character">` to `index.html`. Update from `switcher-ui.js` on character switch. Style with semi-transparent background, small font.

### 5. Journal Character Profiles

Add biographical journal entries to `src/journal/entries.js` that unlock on first character switch:

**Sundaram profile:**
```
Title: "Sundaram Sharma — The Outsider"
Content: "Theater artist from Patna, Bihar. Fluent in Hindi, English, and Bhojpuri.
Came to Mumbai with dreams and a train ticket. No contacts, no surname that opens doors.
Just talent and hunger."
```

**Arjun profile:**
```
Title: "Arjun Malhotra — The Nepo Kid"
Content: "Son of Vikram Malhotra, one of Bollywood's biggest producers.
Grew up on film sets. Everyone knows his father's name — not his.
The industry calls it privilege. He calls it pressure."
```

**Rekha profile:**
```
Title: "Rekha Iyer — The Gatekeeper"
Content: "Thirty years in casting. She's seen a thousand hopefuls walk through that door.
Some she fought for. Some she let go. The question is which ones she remembers."
```

**Implementation:** Add entries with trigger `'character_profile_' + charId`. Trigger from `switcher-ui.js` on first character switch.

### 6. Relationship Tracking in Journal

Add a "Relationships" section to the journal UI (`src/ui/journal-ui.js`) showing visual relationship bars:

```
RELATIONSHIPS

Sundaram Sharma
  Trust: ████░░░░░░ 40%
  Respect: ██████░░░░ 60%

Arjun Malhotra
  Guilt: ███░░░░░░░ 30%
  Empathy: █████░░░░░ 50%

Rekha Iyer
  Complicity: ███████░░░ 70%
  Trust: ████░░░░░░ 40%
```

**Implementation:** Add `getRelationshipData()` export to `src/relationship.js`. Add a "Relationships" tab/section to the journal UI. Show bars with labels. Update when relationships change.

### 7. Flashback Activation

Activate existing flashback scenes at key story moments, skippable:

| Character | Flashback | Trigger |
|-----------|-----------|---------|
| Sundaram | Patna shop — mother's encouragement | When he first enters the casting office |
| Arjun | Childhood on film set — getting a role because of dad | When casting staff greets him as "Vikram's son" |
| Rekha | 1998 — fighting for Geeta, being shut down | When she reviews Sundaram's tape |

**Behavior:** Show a title card "FLASHBACK" → play the scene → fade back to present. Player can skip with Escape or click. Each flashback adds a journal entry.

**Implementation:** Call `triggerFlashback()` from dialogue nodes at the trigger points. Add skip handler. Add journal entries for each flashback.

### 8. Dialogue Speaker Names Fix

Complete the speaker name map in `src/ui/dialogue-ui.js`:

```js
const speakerNames = {
  'Sundaram': 'Sundaram Sharma',
  'Arjun': 'Arjun Malhotra',
  'Rekha': 'Rekha Iyer',
  'Vikram': 'Vikram Malhotra',
  'Auto Driver': 'Auto Driver',
  'Office Staff': 'Office Staff',
  'Another Staff': 'Office Staff',
  'Actor': 'Fellow Actor',
  'Chai Wallah': 'Chai Wallah'
};
```

## Files Changed

| File | Change |
|------|--------|
| `src/dialogue/sundaram.js` | Add 2-3 Bihar-revealing dialogue nodes |
| `src/effects/transitions.js` | Add `role` parameter to `showTitleCard()` |
| `src/ui/switcher-ui.js` | Add role labels to buttons, trigger journal profiles |
| `index.html` | Add HUD character indicator div |
| `src/journal/entries.js` | Add biographical entries + flashback entries |
| `src/ui/journal-ui.js` | Add relationship tracking section |
| `src/relationship.js` | Add `getRelationshipData()` export |
| `src/flashback/system.js` | Add skip handler (Escape/click) |
| `src/dialogue/sundaram.js` | Call `triggerFlashback()` on entering office |
| `src/dialogue/arjun.js` | Call `triggerFlashback()` on staff greeting |
| `src/dialogue/rekha.js` | Call `triggerFlashback()` on tape review |
| `src/ui/dialogue-ui.js` | Complete speaker name map |
| `styles.css` | Add styles for role labels, HUD indicator, relationship bars |

## Out of Scope

- No new UI overlay or character encyclopedia screen
- No changes to the 3D environment or lighting
- No changes to the dialogue engine itself
- No new data models — using existing `relationship.js` and `characters.js`

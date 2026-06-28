# Task 5 Report: Create Relationship Tracker

## Status: DONE

## Files Created/Modified:
- **Created:** `src/relationship.js` - Relationship tracking system
- **Modified:** `src/dialogue/engine.js` - Added onChoice callback support
- **Modified:** `src/dialogue/arjun.js` - Added effects to 10 key choices

## Implementation Details:

### 1. Relationship Tracker (`src/relationship.js`)
- Tracks trust, respect, empathy, guilt, and complicity for sundaram, arjun, and rekha
- Initial values set to 50 for all attributes
- `updateRelationship(character, key, delta)` - Updates relationship values
- `getRelationship(character)` - Returns a copy of character's relationship
- `getRelationshipSummary()` - Returns all relationships
- Values clamped between 0-100

### 2. Dialogue Engine Integration (`src/dialogue/engine.js`)
- Added optional `onChoice` callback parameter to `startDialogue()`
- Modified `selectOption()` to handle `effects` property on choices
- Calls `onChoice(effects)` when a choice with effects is selected
- Clears callback on dialogue end

### 3. Arjun's Dialogue Effects (`src/dialogue/arjun.js`)
Added effects to 10 key choices:
1. `waiting_enter` - Talking to Sundaram (+empathy, +trust) vs sitting quietly (-empathy)
2. `auto_driver_knows_father` - Admitting identity (+guilt, -respect) vs downplaying (-guilt, +respect)
3. `sundaram_reaction` - Responding to Sundaram (+trust, +empathy)
4. `sundaram_hope` - Acknowledging Sundaram's hope (+empathy, +guilt)
5. `sundaram_advice` - Taking Sundaram's advice (+trust, +respect)
6. `morning_compliant` - Being compliant (+guilt, -respect)
7. `morning_resigned` - Being resigned (+guilt)
8. `dinner_father_anger` - Standing up to father (-guilt, +respect)
9. `dinner_father_final` - Conceding to father (+guilt, -respect)
10. `audition_perform` - Performing audition (+respect)
11. `dinner_end` - Reflecting on dinner (+guilt)

## Verification:
- All files pass `node -c` syntax check
- Existing dialogue functionality preserved
- Effects are optional (existing choices without effects still work)

## Commit:
- SHA: 6bac3df
- Message: feat: add relationship tracker with dialogue integration

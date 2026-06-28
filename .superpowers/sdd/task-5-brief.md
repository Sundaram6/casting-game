# Task 5: Create Relationship Tracker

## Files:
- Create: `src/relationship.js`
- Modify: `src/dialogue/engine.js`
- Modify: `src/dialogue/arjun.js`

## Interfaces:
- Consumes: dialogue choices from engine.js
- Produces: `updateRelationship(character, delta)`, `getRelationship(character)`, `getRelationshipSummary()`

## Steps:

### Step 1: Create relationship tracker

Create `src/relationship.js`:
```javascript
const relationships = {
  sundaram: { trust: 50, respect: 50, empathy: 50 },
  arjun: { trust: 50, respect: 50, guilt: 50 },
  rekha: { trust: 50, respect: 50, complicity: 50 }
};

export function updateRelationship(character, key, delta) {
  if (relationships[character] && relationships[character][key] !== undefined) {
    relationships[character][key] = Math.max(0, Math.min(100, relationships[character][key] + delta));
  }
}

export function getRelationship(character) {
  return relationships[character] ? { ...relationships[character] } : null;
}

export function getRelationshipSummary() {
  return JSON.parse(JSON.stringify(relationships));
}
```

### Step 2: Integrate with dialogue engine

Modify `src/dialogue/engine.js` to accept optional `onChoice` callback that can call `updateRelationship()`:
```javascript
export function startDialogue(node, onChoice) {
  // When a choice is made, call onChoice(choiceData) if provided
  // Dialogue nodes can include relationship effects:
  // choices: [
  //   { text: {...}, next: '...', effects: { arjun: { guilt: +10 } } }
  // ]
}
```

### Step 3: Add relationship effects to Arjun's dialogue

In `src/dialogue/arjun.js`, add `effects` to key choices:
- Choosing honesty with Sundaram → +empathy, +trust
- Choosing to use connections → +guilt, -respect
- Confronting father → varies based on dialogue path

### Step 4: Commit

```bash
git add src/relationship.js src/dialogue/engine.js src/dialogue/arjun.js
git commit -m "feat: add relationship tracker with dialogue integration"
```

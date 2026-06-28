# Task 3: Create Arjun's Character Definition

## Files:
- Create: `src/dialogue/arjun.js`
- Modify: `src/characters.js`

## Interfaces:
- Consumes: dialogue engine API from `src/dialogue/engine.js`
- Produces: `ARJUN_DIALOGUE` object, character config in `characters.js`

## Steps:

### Step 1: Add Arjun to characters.js

Add to `src/characters.js`:
```javascript
export const CHARACTERS = {
  sundaram: { name: 'Sundaram Sharma', color: '#d4a017', role: 'outsider' },
  arjun: { name: 'Arjun Malhotra', color: '#4a90d9', role: 'nepo kid' },
  rekha: { name: 'Rekha Iyer', color: '#8b5e3c', role: 'gatekeeper' }
};
```

### Step 2: Create Arjun's dialogue tree

Create `src/dialogue/arjun.js` with dialogue nodes for:
- **Morning scene:** Wake up in Bandra apartment. Phone call from father's assistant: "Vikram ji says the Raksh Chhabra meeting is confirmed."
- **Auto ride:** Conversation with driver about his father. Driver recognizes the name.
- **Casting office arrival:** Greetings from people who know his father. "Arjun bhai! Your father is a legend."
- **Waiting room encounter with Sundaram:** Awkward attempt to connect. Uses half-remembered Bhojpuri phrases.
- **Audition:** Performed but nervous. Raksh's response: "You have the look. Your father's instincts are always right."
- **Dinner with father:** The confrontation. Vikram's line: "Tere baap ne mehnat ki hai taaki tereko mehnat na karni pade."

Format: Export `ARJUN_DIALOGUE` as a nested object with node IDs, text (Hindi + English), choices, and next-node references.

```javascript
export const ARJUN_DIALOGUE = {
  morning_awakening: {
    speaker: 'arjun',
    text: { en: 'Another day in paradise.', hi: 'आज का दिन भी अच्छा है।' },
    next: 'morning_phone'
  },
  morning_phone: {
    speaker: 'assistant',
    text: { en: 'Arjun bhai, Vikram ji says the Raksh Chhabra meeting is confirmed.', hi: 'अर्जुन भाई, विक्रम जी बोल रहे हैं रक्ष छाबड़ा की मीटिंग फाइनल हो गई।' },
    choices: [
      { text: { en: 'Already? I haven\'t even prepared.', hi: 'अभी से? मैंने तैयारी भी नहीं की।' }, next: 'morning_unprepared' },
      { text: { en: 'Tell Dad I\'ll be there.', hi: 'पापा को बोल दो मैं आ रहा हूँ।' }, next: 'morning_compliant' },
      { text: { en: '...Okay.', hi: '...ठीक है।' }, next: 'morning_resigned' }
    ]
  },
  // ... (full dialogue tree with 40+ nodes covering Arjun's complete chapter)
};
```

### Step 3: Write dialogue content for all scenes

Arjun's chapter needs dialogue for these scenes:
1. Morning in Bandra apartment (3-4 nodes)
2. Phone call with father's assistant (3-4 nodes)
3. Auto ride to casting office (4-5 nodes, conversation with driver)
4. Arrival at casting office (3-4 nodes, greetings)
5. Waiting room — encounter with Sundaram (6-8 nodes, the key emotional scene)
6. Audition room (4-5 nodes)
7. Post-audition call from father (3-4 nodes)
8. Dinner confrontation with father (6-8 nodes, climax)

Total: ~35-45 dialogue nodes

### Step 4: Commit

```bash
git add src/dialogue/arjun.js src/characters.js
git commit -m "feat: add Arjun's dialogue trees and character definition"
```

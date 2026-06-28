### Task 7: Create Dialogue Engine

**Files:**
- Create: `src/dialogue/engine.js`
- Create: `src/dialogue/sundaram.js`

**Interfaces:**
- Consumes: `getState()`, `setState()` from state.js
- Produces: `startDialogue(id)`, `selectOption(index)`, `getCurrentNode()`, `isDialogueActive()`

- [ ] **Step 1: Create dialogue engine**

```javascript
import { getState, setState, STATES } from '../state.js';

let currentDialogue = null;
let currentNodeId = null;

export function startDialogue(dialogueData, startNodeId) {
    if (getState() !== STATES.EXPLORING) return false;
    currentDialogue = dialogueData;
    currentNodeId = startNodeId;
    setState(STATES.DIALOGUE);
    return true;
}

export function getCurrentNode() {
    if (!currentDialogue || !currentNodeId) return null;
    return currentDialogue.nodes[currentNodeId];
}

export function selectOption(optionIndex) {
    const node = getCurrentNode();
    if (!node || !node.options || !node.options[optionIndex]) return false;
    
    const option = node.options[optionIndex];
    
    // Execute side effects
    if (option.effect) option.effect();
    
    // Move to next node
    if (option.next) {
        currentNodeId = option.next;
        return true;
    }
    
    // End dialogue
    endDialogue();
    return false;
}

export function endDialogue() {
    currentDialogue = null;
    currentNodeId = null;
    setState(STATES.EXPLORING);
}

export function isDialogueActive() {
    return getState() === STATES.DIALOGUE && currentDialogue !== null;
}
```

- [ ] **Step 2: Create Sundaram's dialogue data**

Full dialogue tree for Sundaram's chapter with trilingual text (Hindi, English, Bhojpuri). Nodes:
- start: First impression of the office
- enter_office: Going inside
- look_around: Exploring outside first
- chai: Getting tea from chai wallah
- waiting_room: Sitting in the waiting room
- talk_actor: Talking to another actor
- actor_response: Actor's response about Raksh Chhabra
- sit_and_wait: Waiting
- audition_call: Being called for audition
- to_audition: Walking to audition room
- audition_scene: The audition itself
- audition_end: Rekha's response

- [ ] **Step 3: Test dialogue flow**

Import and test the dialogue engine in main.js. Verify:
- `startDialogue(sundaramDialogue, 'start')` works
- `getCurrentNode()` returns correct nodes
- `selectOption(0)` advances dialogue
- State transitions work correctly

- [ ] **Step 4: Commit**

```bash
git add src/dialogue/
git commit -m "feat: add dialogue engine with Sundaram's dialogue trees"
```

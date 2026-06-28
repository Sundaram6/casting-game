# Task 12: Build Convergence/Audition System

## Files:
- Create: `src/convergence/system.js`
- Create: `src/convergence/audition.js`

## Interfaces:
- Consumes: all three chapter modules, dialogue engine
- Produces: `initConvergence()`, `playAuditionPerspective(character)`, `getConvergenceState()`

## Steps:

### Step 1: Create convergence orchestrator

Create `src/convergence/system.js`:
```javascript
let convergenceState = 'inactive'; // inactive → sundaram_audition → arjun_audition → rekha_decision → ending
let perspectivesPlayed = [];

export function initConvergence() {
  convergenceState = 'sundaram_audition';
  perspectivesPlayed = [];
}

export function advanceConvergence() {
  switch (convergenceState) {
    case 'sundaram_audition':
      convergenceState = 'arjun_audition';
      break;
    case 'arjun_audition':
      convergenceState = 'rekha_decision';
      break;
    case 'rekha_decision':
      convergenceState = 'ending';
      break;
    case 'ending':
      convergenceState = 'complete';
      break;
  }
}

export function getConvergenceState() { return convergenceState; }
export function isComplete() { return convergenceState === 'complete'; }
```

### Step 2: Create audition scene

Create `src/convergence/audition.js`:
- AUDITION_DIALOGUE with nodes for each character's audition
- Sundaram performs (Hindi + English + Bhojpuri monologue)
- Arjun performs (nervous, leaning on father's name)
- Rekha makes the call (Arjun confirmed, Sundaram rejected)
- Player watches — no input needed

### Step 3: Commit

```bash
git add src/convergence/
git commit -m "feat: add convergence/audition system with three perspectives"
```

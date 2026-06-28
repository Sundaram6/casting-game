# Task 13: Create Transition System

## Files:
- Create: `src/effects/transitions.js`
- Modify: `src/ui/switcher-ui.js`

## Interfaces:
- Consumes: renderer, scene
- Produces: `fadeToBlack(callback)`, `fadeFromBlack()`, `showTitleCard(text, callback)`

## Steps:

### Step 1: Create transition effects

Create `src/effects/transitions.js`:
```javascript
let overlay = null;

export function initTransitions(container) {
  overlay = document.createElement('div');
  overlay.id = 'transition-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: black; opacity: 0; pointer-events: none; z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    transition: opacity 0.8s ease;
  `;
  container.appendChild(overlay);
}

export function fadeToBlack(callback) {
  overlay.style.opacity = '1';
  setTimeout(() => {
    if (callback) callback();
  }, 800);
}

export function fadeFromBlack(callback) {
  overlay.style.opacity = '0';
  setTimeout(() => {
    if (callback) callback();
  }, 800);
}

export function showTitleCard(hindi, english, callback) {
  overlay.innerHTML = `
    <div style="text-align: center; color: white; font-family: 'Outfit', sans-serif;">
      <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${hindi}</div>
      <div style="font-size: 1.2rem; opacity: 0.7;">${english}</div>
    </div>
  `;
  overlay.style.opacity = '1';
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (callback) callback();
    }, 800);
  }, 3000);
}
```

### Step 2: Integrate with character switching

When switching characters, use transitions:
```javascript
// In switcher-ui.js
import { fadeToBlack, fadeFromBlack, showTitleCard } from '../effects/transitions.js';

export function switchCharacter(newCharacter) {
  fadeToBlack(() => {
    // Switch chapter, environment, lighting, color grading
    showTitleCard(
      getCharacterTitle(newCharacter).hindi,
      getCharacterTitle(newCharacter).english,
      () => {
        fadeFromBlack();
      }
    );
  });
}
```

### Step 3: Commit

```bash
git add src/effects/transitions.js src/ui/switcher-ui.js
git commit -m "feat: add transition system with fade and title cards"
```

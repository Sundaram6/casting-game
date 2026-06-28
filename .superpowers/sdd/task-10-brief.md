### Task 10: Create Character Switcher

**Files:**
- Create: `src/characters.js`
- Create: `src/ui/switcher-ui.js`
- Modify: `index.html` (add transition overlay)
- Modify: `styles.css` (add transition styles)

**Interfaces:**
- Consumes: `getCharacter()`, `setCharacter()` from state.js
- Produces: `initCharacters()`, `switchCharacter()`, `getCharacterConfig()`

- [ ] **Step 1: Create characters.js**

```javascript
import { getCharacter, setCharacter, setState, STATES } from './state.js';

const characters = {
    sundaram: {
        name: 'Sundaram Sharma',
        nameHi: 'सुंदरम शर्मा',
        role: 'The Outsider',
        color: '#D4A574',
        accent: '#C4956A',
        position: { x: 0, y: 2, z: 10 },
        lookAt: { x: 0, y: 2, z: 0 }
    },
    arjun: {
        name: 'Arjun Malhotra',
        nameHi: 'अर्जुन मल्होत्रा',
        role: 'The Nepo Kid',
        color: '#4A90D9',
        accent: '#3A7BC8',
        position: { x: 20, y: 2, z: 0 },
        lookAt: { x: 0, y: 2, z: 0 }
    },
    rekha: {
        name: 'Rekha Iyer',
        nameHi: 'रेखा अय्यर',
        role: 'The Gatekeeper',
        color: '#8B7355',
        accent: '#7A6248',
        position: { x: -20, y: 2, z: 0 },
        lookAt: { x: 0, y: 2, z: 0 }
    }
};

export function getCharacterConfig(charId) {
    return characters[charId] || characters.sundaram;
}

export function switchCharacter(charId) {
    if (!characters[charId]) return false;
    
    const current = getCharacterConfig(getCharacter());
    setCharacter(charId);
    const newChar = characters[charId];
    
    showTransition(newChar);
    return true;
}

function showTransition(char) {
    const event = new CustomEvent('characterSwitch', { detail: char });
    window.dispatchEvent(event);
}

export function getAllCharacters() {
    return Object.keys(characters).map(id => ({ id, ...characters[id] }));
}
```

- [ ] **Step 2: Create switcher UI**

```javascript
// src/ui/switcher-ui.js

import { switchCharacter, getCharacterConfig, getAllCharacters } from '../characters.js';
import { getCharacter } from '../state.js';

const switcherEl = document.getElementById('character-switcher');

export function initSwitcherUI() {
    // Currently only Sundaram is playable in Phase 1
    // Show placeholder for other characters
}

window.addEventListener('characterSwitch', (e) => {
    const char = e.detail;
    
    const overlay = document.getElementById('transition-overlay');
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    
    const nameEl = document.getElementById('transition-name');
    nameEl.innerHTML = `${char.name}<br><span class="transition-hi">${char.nameHi}</span>`;
    
    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }, 2000);
});
```

- [ ] **Step 3: Add transition UI to index.html**

```html
<div id="transition-overlay" class="hidden">
    <div id="transition-name"></div>
</div>
```

- [ ] **Step 4: Add transition CSS**

```css
#transition-overlay {
    position: fixed;
    inset: 0;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
}

#transition-name {
    text-align: center;
    color: #FFD700;
    font-size: 2.5rem;
    font-weight: 300;
    letter-spacing: 4px;
}

.transition-hi {
    font-size: 1.5rem;
    color: #ccc;
    margin-top: 8px;
}
```

- [ ] **Step 5: Test**

Verify character switching shows transition overlay with name.

- [ ] **Step 6: Commit**

```bash
git add src/characters.js src/ui/switcher-ui.js index.html styles.css
git commit -m "feat: add character switcher with transition overlay"
```

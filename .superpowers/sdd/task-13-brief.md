### Task 13: Add Examine UI

**Files:**
- Create: `src/ui/examine-ui.js`
- Modify: `index.html` (add examine UI elements)
- Modify: `styles.css` (add examine styles)

**Interfaces:**
- Consumes: interaction system
- Produces: visual display for examined objects

- [ ] **Step 1: Add examine UI to index.html**

```html
<div id="examine-overlay" class="hidden">
    <div id="examine-box">
        <div id="examine-text"></div>
        <div id="examine-hint">Press E to close</div>
    </div>
</div>
```

- [ ] **Step 2: Add examine CSS**

```css
#examine-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 250;
}

#examine-box {
    max-width: 600px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    padding: 30px;
}

#examine-text {
    color: #fff;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 16px;
}

#examine-hint {
    color: #888;
    font-size: 0.8rem;
    text-align: right;
}
```

- [ ] **Step 3: Create examine-ui.js**

```javascript
import { getState, setState, STATES } from '../state.js';

const overlay = document.getElementById('examine-overlay');
const textEl = document.getElementById('examine-text');

export function showExamine(text) {
    if (getState() !== STATES.EXPLORING) return;
    
    setState(STATES.INTERACTING);
    overlay.classList.remove('hidden');
    
    let html = '';
    if (text.hi) html += `<div class="examine-hi">${text.hi}</div>`;
    if (text.en) html += `<div class="examine-en">${text.en}</div>`;
    textEl.innerHTML = html;
}

export function hideExamine() {
    overlay.classList.add('hidden');
    setState(STATES.EXPLORING);
}

document.addEventListener('keydown', (e) => {
    if ((e.key === 'e' || e.key === 'E') && getState() === STATES.INTERACTING) {
        hideExamine();
    }
});
```

- [ ] **Step 4: Test**

Verify examining objects shows text overlay, and pressing E closes it.

- [ ] **Step 5: Commit**

```bash
git add src/ui/examine-ui.js index.html styles.css
git commit -m "feat: add examine UI for object inspection"
```

### Task 8: Create Dialogue UI

**Files:**
- Create: `src/ui/dialogue-ui.js`
- Modify: `index.html` (add dialogue UI elements)
- Modify: `styles.css` (add dialogue styles)

**Interfaces:**
- Consumes: `getCurrentNode()`, `selectOption()` from dialogue engine
- Produces: visual dialogue display, option selection

- [ ] **Step 1: Add dialogue UI elements to index.html**

Add inside the body, after the existing UI elements:

```html
<!-- Dialogue UI -->
<div id="dialogue-overlay" class="hidden">
    <div id="dialogue-box">
        <div id="dialogue-speaker"></div>
        <div id="dialogue-text"></div>
        <div id="dialogue-options"></div>
    </div>
</div>
```

- [ ] **Step 2: Add dialogue CSS to styles.css**

```css
#dialogue-overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    z-index: 200;
    pointer-events: none;
}

#dialogue-box {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    padding: 20px;
    pointer-events: all;
}

#dialogue-speaker {
    font-size: 0.9rem;
    color: #FFD700;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

#dialogue-text {
    font-size: 1.1rem;
    color: #fff;
    line-height: 1.6;
    margin-bottom: 16px;
}

#dialogue-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.dialogue-option {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 12px 16px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-size: 1rem;
}

.dialogue-option:hover {
    background: rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
    color: #fff;
}

.dialogue-option .lang {
    font-size: 0.8rem;
    color: #888;
    margin-left: 8px;
}
```

- [ ] **Step 3: Create dialogue-ui.js**

```javascript
import { getCurrentNode, selectOption, isDialogueActive } from '../dialogue/engine.js';

const overlay = document.getElementById('dialogue-overlay');
const speakerEl = document.getElementById('dialogue-speaker');
const textEl = document.getElementById('dialogue-text');
const optionsEl = document.getElementById('dialogue-options');

export function updateDialogueUI() {
    if (!isDialogueActive()) {
        overlay.classList.add('hidden');
        return;
    }
    
    overlay.classList.remove('hidden');
    const node = getCurrentNode();
    if (!node) return;
    
    // Speaker name
    const speakerNames = {
        'Sundaram': 'Sundaram Sharma',
        'Rekha': 'Rekha Iyer',
        'Actor': 'Fellow Actor',
        'Assistant': 'Casting Assistant',
        'Narrator': ''
    };
    speakerEl.textContent = speakerNames[node.speaker] || node.speaker;
    
    // Text (show all languages)
    const text = node.text;
    textEl.innerHTML = '';
    if (text.hi) {
        textEl.innerHTML += `<div class="text-hi">${text.hi}</div>`;
    }
    if (text.en) {
        textEl.innerHTML += `<div class="text-en">${text.en}</div>`;
    }
    if (text.bhojpuri) {
        textEl.innerHTML += `<div class="text-bhojpuri">${text.bhojpuri}</div>`;
    }
    
    // Options
    optionsEl.innerHTML = '';
    if (node.options) {
        node.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'dialogue-option';
            btn.innerHTML = `${option.text.en || option.text.hi}`;
            btn.addEventListener('click', () => {
                selectOption(index);
                updateDialogueUI();
            });
            optionsEl.appendChild(btn);
        });
    }
}

// Keyboard shortcuts for options (1, 2, 3)
document.addEventListener('keydown', (e) => {
    if (!isDialogueActive()) return;
    const node = getCurrentNode();
    if (!node || !node.options) return;
    
    const num = parseInt(e.key);
    if (num >= 1 && num <= node.options.length) {
        selectOption(num - 1);
        updateDialogueUI();
    }
});
```

- [ ] **Step 4: Test**

Verify dialogue UI appears when dialogue starts, options are clickable, and text displays correctly.

- [ ] **Step 5: Commit**

```bash
git add src/ui/dialogue-ui.js index.html styles.css
git commit -m "feat: add dialogue UI with trilingual text display"
```

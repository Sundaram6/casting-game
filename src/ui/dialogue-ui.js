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
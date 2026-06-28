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

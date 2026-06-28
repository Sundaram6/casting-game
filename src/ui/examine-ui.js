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
    if (text.ta) html += `<div class="examine-ta">${text.ta}</div>`;
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

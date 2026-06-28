let typedTextEl = null;
let untypedTextEl = null;
let timerBar = null;
let timerText = null;

export function initTypingUI() {
    typedTextEl = document.getElementById('typed-text');
    untypedTextEl = document.getElementById('untyped-text');
    timerBar = document.getElementById('timer-bar');
    timerText = document.getElementById('timer-text');
}

export function showTypingScreen() {
    // Screen transition handled by changeScreen in main.js
}

export function hideTypingScreen() {
    // Screen transition handled by changeScreen in main.js
}

export function updateTypingDisplay(typed, untyped, pct, time) {
    if (typedTextEl) typedTextEl.innerHTML = typed;
    if (untypedTextEl) untypedTextEl.innerText = untyped;
    if (timerBar) {
        timerBar.style.width = pct + '%';
        timerBar.style.background = pct < 30 ? '#ff4757' : pct < 60 ? '#ffa502' : 'linear-gradient(90deg, #ff4757, #ffa502, #2ed573)';
    }
    if (timerText) {
        timerText.innerText = time.toFixed(1) + 's';
        if (time <= 3.0) {
            timerText.classList.add('timer-warning');
        } else {
            timerText.classList.remove('timer-warning');
        }
    }
}

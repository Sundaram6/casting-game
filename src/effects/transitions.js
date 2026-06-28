// src/effects/transitions.js

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
  overlay.style.pointerEvents = 'all';
  setTimeout(() => {
    if (callback) callback();
  }, 800);
}

export function fadeFromBlack(callback) {
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
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
  overlay.style.pointerEvents = 'all';
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      overlay.innerHTML = '';
      if (callback) callback();
    }, 800);
  }, 3000);
}

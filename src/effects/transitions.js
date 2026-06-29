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

export function showTitleCard(hindi, english, callback, role) {
  if (!overlay) return;
  
  let roleHtml = '';
  if (role) {
    roleHtml = `<div style="font-family: 'Outfit', sans-serif; font-size: 0.9rem; color: rgba(255,255,255,0.5); font-style: italic; margin-top: 0.5rem; letter-spacing: 1px;">${role}</div>`;
  }
  
  overlay.innerHTML = `
    <div style="text-align: center;">
      <div style="font-family: 'Noto Sans Devanagari', sans-serif; font-size: 2.5rem; color: white; text-shadow: 0 0 20px rgba(0,0,0,0.8);">${hindi}</div>
      <div style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,0.7); letter-spacing: 2px; margin-top: 0.3rem;">${english}</div>
      ${roleHtml}
    </div>
  `;
  
  overlay.style.transition = 'opacity 0.8s ease';
  overlay.style.opacity = '1';
  
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (callback) callback();
    }, 800);
  }, 3000);
}

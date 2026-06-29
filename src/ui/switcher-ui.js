// src/ui/switcher-ui.js

import { getCharacterConfig, getAllCharacters } from '../characters.js';
import { getCharacter, getState, setCharacter, STATES } from '../state.js';
import { stopAllSounds } from '../game/sounds.js';
import { fadeToBlack, fadeFromBlack, showTitleCard } from '../effects/transitions.js';
import { initConvergence, getConvergenceState } from '../convergence/system.js';
import { addJournalByTrigger } from '../journal/system.js';
import { updateRelationship } from '../relationship.js';
import { setColorGrading } from '../effects/colorGrading.js';
import { startAmbientForCharacter } from '../audio/ambient.js';
import { setEnvironmentPreset } from '../environment.js';
import { initSundaramChapter } from '../chapters/sundaram.js';
import { initArjunChapter } from '../chapters/arjun.js';
import { initRekhaChapter } from '../chapters/rekha.js';
import { getScene, getCamera } from '../scene.js';

const switcherEl = document.getElementById('character-switcher');

const CHARACTER_TITLES = {
  sundaram: { hindi: 'सुंदरम शर्मा', english: 'Sundaram Sharma' },
  arjun: { hindi: 'अर्जुन मल्होत्रा', english: 'Arjun Malhotra' },
  rekha: { hindi: 'रेखा अय्यर', english: 'Rekha Iyer' },
};

const CHARACTER_ORDER = ['sundaram', 'arjun', 'rekha'];

let unlockedCharacters = new Set(['sundaram']);
let currentCharacter = 'sundaram';
let switchingInProgress = false;
const initializedChapters = new Set();

export function resetChapterInit() {
  initializedChapters.clear();
}

function initChapterForCharacter(charId) {
  if (initializedChapters.has(charId)) return;
  const scene = getScene();
  const camera = getCamera();
  switch (charId) {
    case 'sundaram':
      initSundaramChapter(scene);
      break;
    case 'arjun':
      initArjunChapter(scene, camera);
      break;
    case 'rekha':
      initRekhaChapter(scene, camera);
      break;
  }
  initializedChapters.add(charId);
}

function getCharacterTitle(characterId) {
  return CHARACTER_TITLES[characterId] || { hindi: characterId, english: characterId };
}

function isCharacterUnlocked(charId) {
  return unlockedCharacters.has(charId);
}

function unlockCharacter(charId) {
  if (!unlockedCharacters.has(charId)) {
    unlockedCharacters.add(charId);
    updateSwitcherDisplay();
  }
}

function updateSwitcherDisplay() {
  if (!switcherEl) return;

  const current = getCharacter();
  const buttons = switcherEl.querySelectorAll('.switcher-btn');

  buttons.forEach(btn => {
    const charId = btn.dataset.character;
    const unlocked = isCharacterUnlocked(charId);
    const isActive = charId === current;

    btn.classList.toggle('locked', !unlocked);
    btn.classList.toggle('active', isActive);

    const lockIcon = btn.querySelector('.switcher-lock');
    if (lockIcon) {
      lockIcon.textContent = unlocked ? '' : '🔒';
    }
  });
}

function updateHudCharacter(charId) {
    const nameEl = document.getElementById('hud-char-name');
    const roleEl = document.getElementById('hud-char-role');
    if (!nameEl || !roleEl) return;
    const config = getCharacterConfig(charId);
    nameEl.textContent = config.name;
    roleEl.textContent = config.role;
}

function switchToCharacter(charId) {
  if (switchingInProgress) return;
  if (!isCharacterUnlocked(charId)) return;
  if (charId === getCharacter()) return;
  if (getCharacter() === 'rekha' && getConvergenceState() !== 'inactive') return;

  switchingInProgress = true;
  const titles = getCharacterTitle(charId);

  fadeToBlack(() => {
    stopAllSounds();
    setCharacter(charId);
    initChapterForCharacter(charId);
    setColorGrading(charId);
    startAmbientForCharacter(charId);

    const envPresets = {
      sundaram: 'sundaram_normal',
      arjun: 'arjun_luxury',
      rekha: 'rekha_office'
    };
    if (envPresets[charId]) {
      setEnvironmentPreset(envPresets[charId]);
    }

    const charConfig = getCharacterConfig(charId);
    showTitleCard(titles.hindi, titles.english, () => {
      fadeFromBlack(() => {
        switchingInProgress = false;
        currentCharacter = charId;
        updateSwitcherDisplay();
        updateHudCharacter(charId);
      });
    }, charConfig.role);
  });
}

function createSwitcherUI() {
  if (!switcherEl) return;

  switcherEl.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'switcher-container';

  CHARACTER_ORDER.forEach(charId => {
    const titles = getCharacterTitle(charId);
    const btn = document.createElement('button');
    btn.className = 'switcher-btn';
    btn.dataset.character = charId;
    btn.title = titles.english;

    const lockEl = document.createElement('span');
    lockEl.className = 'switcher-lock';

    const nameEl = document.createElement('span');
    nameEl.className = 'switcher-name';
    nameEl.textContent = titles.english.split(' ')[0];

    const nameHiEl = document.createElement('span');
    nameHiEl.className = 'switcher-name-hi';
    nameHiEl.textContent = titles.hindi;

    const roleEl = document.createElement('span');
    roleEl.className = 'switcher-role';
    const charConfig = getCharacterConfig(charId);
    roleEl.textContent = charConfig.role;

    btn.appendChild(lockEl);
    btn.appendChild(nameEl);
    btn.appendChild(nameHiEl);
    btn.appendChild(roleEl);

    btn.addEventListener('click', () => {
      switchToCharacter(charId);
    });

    container.appendChild(btn);
  });

  switcherEl.appendChild(container);
  updateSwitcherDisplay();
}

export function initSwitcherUI() {
  createSwitcherUI();
  currentCharacter = getCharacter();
  updateSwitcherDisplay();
  updateHudCharacter(currentCharacter);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const state = getState();
      if (state !== STATES.EXPLORING) return;
      if (isDialogueActive()) return;
      if (switchingInProgress) return;

      e.preventDefault();
      const chars = CHARACTER_ORDER.filter(c => isCharacterUnlocked(c));
      const idx = chars.indexOf(currentCharacter);
      const nextIdx = (idx + 1) % chars.length;
      switchToCharacter(chars[nextIdx]);
    }
  });
}

export function unlockArjun() {
  unlockCharacter('arjun');
}

export function unlockRekha() {
  unlockCharacter('rekha');
}

export function triggerConvergence() {
  unlockCharacter('sundaram');
  unlockCharacter('arjun');
  unlockCharacter('rekha');
  initConvergence();
}

export function isDialogueActive() {
  const state = getState();
  return state === STATES.DIALOGUE;
}

window.addEventListener('chapterComplete', (e) => {
  const { chapter } = e.detail;

  switch (chapter) {
    case 'sundaram':
      unlockArjun();
      addJournalByTrigger('sundaram_first_audition');
      updateRelationship('sundaram', 'empathy', 5);
      break;
    case 'arjun':
      unlockRekha();
      addJournalByTrigger('arjun_self_doubt');
      updateRelationship('arjun', 'guilt', 5);
      break;
    case 'rekha':
      triggerConvergence();
      addJournalByTrigger('rekha_final_choice');
      updateRelationship('rekha', 'complicity', 5);
      break;
  }
});

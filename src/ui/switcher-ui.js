// src/ui/switcher-ui.js

import { switchCharacter, getCharacterConfig, getAllCharacters } from '../characters.js';
import { getCharacter } from '../state.js';
import { fadeToBlack, fadeFromBlack, showTitleCard } from '../effects/transitions.js';

const switcherEl = document.getElementById('character-switcher');

const CHARACTER_TITLES = {
  sundaram: { hindi: 'सुंदरम शर्मा', english: 'Sundaram Sharma' },
  arjun: { hindi: 'अर्जुन मल्होत्रा', english: 'Arjun Malhotra' },
  rekha: { hindi: 'रेखा अय्यर', english: 'Rekha Iyer' },
};

function getCharacterTitle(characterId) {
  return CHARACTER_TITLES[characterId] || { hindi: characterId, english: characterId };
}

export function initSwitcherUI() {
  // Currently only Sundaram is playable in Phase 1
}

window.addEventListener('characterSwitch', (e) => {
  const char = e.detail;
  const titles = getCharacterTitle(char.id);

  fadeToBlack(() => {
    showTitleCard(titles.hindi, titles.english, () => {
      fadeFromBlack();
    });
  });
});

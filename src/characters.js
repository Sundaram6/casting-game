import { getCharacter, setCharacter } from './state.js';

const characters = {
    sundaram: {
        name: 'Sundaram Sharma',
        nameHi: 'सुंदरम शर्मा',
        role: 'The Outsider',
        color: '#D4A574',
        accent: '#C4956A',
        position: { x: 0, y: 2, z: 10 },
        lookAt: { x: 0, y: 2, z: 0 }
    },
    arjun: {
        name: 'Arjun Malhotra',
        nameHi: 'अर्जुन मल्होत्रा',
        role: 'The Nepo Kid',
        color: '#4A90D9',
        accent: '#3A7BC8',
        position: { x: 20, y: 2, z: 0 },
        lookAt: { x: 0, y: 2, z: 0 }
    },
    rekha: {
        name: 'Rekha Iyer',
        nameHi: 'रेखा अय्यर',
        role: 'The Gatekeeper',
        color: '#8B7355',
        accent: '#7A6248',
        position: { x: -20, y: 2, z: 0 },
        lookAt: { x: 0, y: 2, z: 0 }
    }
};

export function getCharacterConfig(charId) {
    return characters[charId] || characters.sundaram;
}

export function switchCharacter(charId) {
    if (!characters[charId]) return false;
    
    const current = getCharacterConfig(getCharacter());
    setCharacter(charId);
    const newChar = characters[charId];
    
    showTransition(newChar);
    return true;
}

function showTransition(char) {
    const event = new CustomEvent('characterSwitch', { detail: char });
    window.dispatchEvent(event);
}

export function getAllCharacters() {
    return Object.keys(characters).map(id => ({ id, ...characters[id] }));
}

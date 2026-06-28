import { getState, setState, STATES } from '../state.js';
import { speakLine, stopSpeaking } from '../audio/voice.js';

function speakNode(node) {
    if (!node || !node.text) return;
    // Choose language: en > hi > bhojpuri > tamil
    const langOrder = ['en', 'hi', 'bhojpuri', 'tamil'];
    let selectedLang = 'en';
    for (const lang of langOrder) {
        if (node.text[lang]) {
            selectedLang = lang;
            break;
        }
    }
    speakLine(node.text[selectedLang], selectedLang);
}

let currentDialogue = null;
let currentNodeId = null;
let onChoiceCallback = null;

export function startDialogue(dialogueData, startNodeId, onChoice) {
    const state = getState();
    if (state !== STATES.EXPLORING && state !== STATES.FLASHBACK) return false;
    currentDialogue = dialogueData;
    currentNodeId = startNodeId;
    onChoiceCallback = onChoice || null;
    setState(STATES.DIALOGUE);
    speakNode(currentDialogue.nodes[currentNodeId]);
    return true;
}

export function getCurrentNode() {
    if (!currentDialogue || !currentNodeId) return null;
    return currentDialogue.nodes[currentNodeId];
}

export function selectOption(optionIndex) {
    const node = getCurrentNode();
    if (!node || !node.options || !node.options[optionIndex]) return false;

    const option = node.options[optionIndex];

    if (option.effect) option.effect();

    if (option.effects && onChoiceCallback) {
        onChoiceCallback(option.effects);
    }

    if (option.next) {
        currentNodeId = option.next;
        speakNode(getCurrentNode());
        return true;
    }

    endDialogue();
    return false;
}

export function endDialogue() {
    stopSpeaking();
    currentDialogue = null;
    currentNodeId = null;
    onChoiceCallback = null;
    setState(STATES.EXPLORING);
}

export function isDialogueActive() {
    return getState() === STATES.DIALOGUE && currentDialogue !== null;
}

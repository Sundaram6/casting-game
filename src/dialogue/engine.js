import { getState, setState, STATES } from '../state.js';

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
        return true;
    }

    endDialogue();
    return false;
}

export function endDialogue() {
    currentDialogue = null;
    currentNodeId = null;
    onChoiceCallback = null;
    setState(STATES.EXPLORING);
}

export function isDialogueActive() {
    return getState() === STATES.DIALOGUE && currentDialogue !== null;
}

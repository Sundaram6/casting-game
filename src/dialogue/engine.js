import { getState, setState, STATES } from '../state.js';

let currentDialogue = null;
let currentNodeId = null;

export function startDialogue(dialogueData, startNodeId) {
    if (getState() !== STATES.EXPLORING) return false;
    currentDialogue = dialogueData;
    currentNodeId = startNodeId;
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
    setState(STATES.EXPLORING);
}

export function isDialogueActive() {
    return getState() === STATES.DIALOGUE && currentDialogue !== null;
}

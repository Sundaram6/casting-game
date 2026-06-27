const STATES = {
    START: 'START',
    EXPLORING: 'EXPLORING',
    DIALOGUE: 'DIALOGUE',
    INTERACTING: 'INTERACTING',
    FLASHBACK: 'FLASHBACK',
    TRANSITIONING: 'TRANSITIONING',
    CHAPTER_END: 'CHAPTER_END'
};

let currentState = STATES.START;
let currentCharacter = 'sundaram';

const transitions = {
    [STATES.START]: [STATES.EXPLORING],
    [STATES.EXPLORING]: [STATES.DIALOGUE, STATES.INTERACTING, STATES.FLASHBACK, STATES.TRANSITIONING],
    [STATES.DIALOGUE]: [STATES.EXPLORING],
    [STATES.INTERACTING]: [STATES.EXPLORING],
    [STATES.FLASHBACK]: [STATES.EXPLORING],
    [STATES.TRANSITIONING]: [STATES.EXPLORING, STATES.CHAPTER_END],
    [STATES.CHAPTER_END]: [STATES.START]
};

export function getState() { return currentState; }

export function canTransition(to) {
    return transitions[currentState]?.includes(to) ?? false;
}

export function setState(newState) {
    if (!canTransition(newState)) {
        console.warn(`Invalid transition: ${currentState} -> ${newState}`);
        return false;
    }
    currentState = newState;
    return true;
}

export function getCharacter() { return currentCharacter; }
export function setCharacter(char) { currentCharacter = char; }

export { STATES };

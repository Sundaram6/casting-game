import { startDialogue } from '../dialogue/engine.js';
import { AUDITION_DIALOGUE } from './audition.js';
import { getState, STATES } from '../state.js';

let convergenceState = 'inactive'; // inactive → sundaram_audition → arjun_audition → rekha_decision → ending → complete
let perspectivesPlayed = [];

export function initConvergence() {
    convergenceState = 'sundaram_audition';
    perspectivesPlayed = [];
}

export function advanceConvergence() {
    switch (convergenceState) {
        case 'sundaram_audition':
            convergenceState = 'arjun_audition';
            break;
        case 'arjun_audition':
            convergenceState = 'rekha_decision';
            break;
        case 'rekha_decision':
            convergenceState = 'ending';
            break;
        case 'ending':
            convergenceState = 'complete';
            break;
    }
}

export function getConvergenceState() { return convergenceState; }
export function isComplete() { return convergenceState === 'complete'; }

export function playAuditionPerspective(character) {
    if (getState() !== STATES.EXPLORING && getState() !== STATES.CONVERGENCE) {
        return false;
    }
    
    let startNode;
    switch (character) {
        case 'sundaram':
            startNode = 'sundaram_start';
            break;
        case 'arjun':
            startNode = 'arjun_start';
            break;
        case 'rekha':
            startNode = 'rekha_decision_start';
            break;
        case 'ending':
            startNode = 'ending_start';
            break;
        default:
            return false;
    }
    
    // Start dialogue with onChoice callback to handle advancement
    const started = startDialogue(AUDITION_DIALOGUE, startNode, (effects) => {
        if (effects && effects.includes('advance')) {
            advanceConvergence();
        }
    });
    
    if (started) {
        perspectivesPlayed.push(character);
    }
    return started;
}
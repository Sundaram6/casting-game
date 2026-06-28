import { getCharacter } from '../state.js';

let audioCtx = null;
let currentLocation = null;
let activeOscillators = [];

const ambientConfigs = {
    office: [
        { type: 'sine', freq: 120, vol: 0.02 },     // AC hum
        { type: 'square', freq: 440, vol: 0.01 },    // distant phone
        { type: 'sawtooth', freq: 200, vol: 0.005 }  // muffled voices
    ],
    street: [
        { type: 'sawtooth', freq: 80, vol: 0.03 },   // traffic hum
        { type: 'square', freq: 150, vol: 0.02 },     // auto-rickshaw
        { type: 'sine', freq: 2000, vol: 0.01 }       // birds
    ],
    pg: [
        { type: 'sine', freq: 60, vol: 0.03 },        // ceiling fan
        { type: 'square', freq: 1000, vol: 0.005 }    // cricket on TV
    ],
    casting_office: [
        { type: 'sine', freq: 120, vol: 0.02 },       // AC hum
        { type: 'square', freq: 440, vol: 0.01 },     // distant phone
        { type: 'sawtooth', freq: 200, vol: 0.005 }   // chai pour
    ],
    waiting_room: [
        { type: 'sine', freq: 80, vol: 0.01 },        // fan whir
        { type: 'square', freq: 300, vol: 0.005 },    // muffled talk
        { type: 'triangle', freq: 150, vol: 0.003 }   // footsteps
    ],
    audition_room: [
        { type: 'square', freq: 1000, vol: 0.001 }    // ticking clock
    ],
    mumbai_street: [
        { type: 'sawtooth', freq: 80, vol: 0.03 },    // traffic hum
        { type: 'square', freq: 150, vol: 0.02 },     // auto horn
        { type: 'sine', freq: 2000, vol: 0.01 },      // bollywood music distant
        { type: 'triangle', freq: 60, vol: 0.02 }     // construction low rumble
    ],
    pg_room: [
        { type: 'sine', freq: 60, vol: 0.03 },        // ceiling fan
        { type: 'square', freq: 1000, vol: 0.005 },   // neighbor TV
        { type: 'sawtooth', freq: 100, vol: 0.01 }    // traffic outside
    ],
    bandra_apartment: [
        { type: 'sine', freq: 150, vol: 0.005 },      // city hum glass
        { type: 'triangle', freq: 300, vol: 0.002 }   // sleek door
    ],
    restaurant: [
        { type: 'square', freq: 400, vol: 0.01 },     // ambient chatter
        { type: 'sine', freq: 800, vol: 0.005 }       // clinking glasses
    ]
};

function createOscillator(type, freq, vol) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    return { osc, gain, targetVol: vol };
}

function stopAllOscillators() {
    activeOscillators.forEach(({ osc, gain }) => {
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        setTimeout(() => {
            try { osc.stop(); } catch (e) {}
        }, 600);
    });
    activeOscillators = [];
}

function startAmbient(location) {
    if (!audioCtx || !ambientConfigs[location]) return;
    stopAllOscillators();

    const config = ambientConfigs[location];
    config.forEach(({ type, freq, vol }) => {
        const { osc, gain, targetVol } = createOscillator(type, freq, vol);
        osc.start();
        gain.gain.linearRampToValueAtTime(targetVol, audioCtx.currentTime + 1.0);
        activeOscillators.push({ osc, gain });
    });
}

export function initAmbientSound() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

export function updateAmbientSound(location) {
    if (!audioCtx) return;
    if (currentLocation === location) return;
    currentLocation = location;
    startAmbient(location);
}

export function playAmbient(location) {
    updateAmbientSound(location);
}

export function startAmbientForCharacter(charId) {
    const ambients = {
        sundaram: 'street',
        arjun: 'office',
        rekha: 'office'
    };
    updateAmbientSound(ambients[charId] || 'street');
}

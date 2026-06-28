import { getCrowds, getNepoCrowds } from '../legacy/crowds.js';
import { getOffices } from './buildings.js';
import { getState, STATES } from '../state.js';

const actorPhrases = [
    "I am an actor", "My height is six foot", "I can cry on cue",
    "Do you have a role for me?", "I have done theatre for five years",
    "I am very passionate", "Sir, one chance please", "I can do villain also",
    "My profile is updated", "I brought my portfolio"
];
const officePhrases = ["Fit", "Not fit"];
const nepoPhrases = ["Papa called them", "VIP entry bhai", "Straight to the director", "No audition needed"];

let camera = null;
let buzzLayer = null;

function initProximityAudio(options) {
    camera = options.camera;
    buzzLayer = options.buzzLayer;
}

function spawnBuzzBubble(text, nearCenter = false) {
    if (!buzzLayer || (getState() !== STATES.EXPLORING && getState() !== STATES.CELEBRATING)) return;
    const bubble = document.createElement('div');
    bubble.className = 'buzz-bubble';
    bubble.innerText = text;
    const left = nearCenter ? 35 + Math.random() * 30 : 8 + Math.random() * 78;
    const top = 24 + Math.random() * 54;
    bubble.style.left = left + 'vw';
    bubble.style.top = top + 'vh';
    bubble.style.animationDuration = (2.5 + Math.random() * 1.6).toFixed(2) + 's';
    bubble.style.transform = `rotate(${(Math.random() - 0.5) * 8}deg)`;
    buzzLayer.appendChild(bubble);
    setTimeout(() => bubble.remove(), 4300);
}

function getVolumeByDistance(pos, maxDist = 40) {
    const dist = camera.position.distanceTo(pos);
    if (dist > maxDist) return 0;
    return Math.max(0.01, 1 - (dist / maxDist));
}

function initProximityAudioIntervals() {
    setInterval(() => {
        if (getState() !== STATES.EXPLORING || !window.speechSynthesis) return;
        if (window.speechSynthesis.pending) return;

        const crowdArr = getCrowds();
        const nepoArr = getNepoCrowds();
        const roll = Math.random();
        if (roll > 0.6 && crowdArr.length > 0) {
            let nearest = crowdArr[0];
            let minDist = camera.position.distanceTo(nearest.mesh.position);
            for (let c of crowdArr) {
                let d = camera.position.distanceTo(c.mesh.position);
                if (d < minDist) { minDist = d; nearest = c; }
            }
            let vol = getVolumeByDistance(nearest.mesh.position, 40);
            if (vol > 0.05) {
                const phrase = actorPhrases[Math.floor(Math.random() * actorPhrases.length)];
                spawnBuzzBubble(phrase, minDist < 18);
                const u = new SpeechSynthesisUtterance(phrase);
                u.volume = vol; u.pitch = 0.5 + Math.random(); u.rate = 0.8 + Math.random() * 0.5;
                window.speechSynthesis.speak(u);
            }
        } else if (roll > 0.3 && nepoArr.length > 0) {
            let nearest = nepoArr[0];
            let minDist = camera.position.distanceTo(nearest.mesh.position);
            for (let n of nepoArr) {
                let d = camera.position.distanceTo(n.mesh.position);
                if (d < minDist) { minDist = d; nearest = n; }
            }
            let vol = getVolumeByDistance(nearest.mesh.position, 35);
            if (vol > 0.05) {
                const phrase = nepoPhrases[Math.floor(Math.random() * nepoPhrases.length)];
                spawnBuzzBubble(phrase, minDist < 18);
                const u = new SpeechSynthesisUtterance(phrase);
                u.volume = vol; u.pitch = 1.2 + Math.random() * 0.5; u.rate = 1.0 + Math.random() * 0.3;
                window.speechSynthesis.speak(u);
            }
        } else if (getOffices().length > 0) {
            let nearest = getOffices()[0];
            let minDist = camera.position.distanceTo(nearest.group.position);
            for (let o of getOffices()) {
                let d = camera.position.distanceTo(o.group.position);
                if (d < minDist) { minDist = d; nearest = o; }
            }
            let vol = getVolumeByDistance(nearest.group.position, 50);
            if (vol > 0.05) {
                const u = new SpeechSynthesisUtterance(officePhrases[Math.floor(Math.random() * officePhrases.length)]);
                u.volume = vol; u.pitch = 0.3 + Math.random() * 0.4; u.rate = 0.7 + Math.random() * 0.2;
                window.speechSynthesis.speak(u);
            }
        }
    }, 350);

    setInterval(() => {
        if (getState() !== STATES.EXPLORING) return;
        const phrasePool = Math.random() > 0.78 ? nepoPhrases : actorPhrases;
        spawnBuzzBubble(phrasePool[Math.floor(Math.random() * phrasePool.length)], Math.random() > 0.65);
    }, 900);
}

export { initProximityAudio, spawnBuzzBubble, initProximityAudioIntervals };
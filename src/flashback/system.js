import { setEnvironmentPreset } from '../environment.js';
import { startDialogue, endDialogue } from '../dialogue/engine.js';
import { setState, getState, STATES } from '../state.js';
import { FLASHBACK_SCENES } from './scenes.js';

let flashbackActive = false;
let flashbackType = null;
let flashbackTimer = 0;
let flashbackDuration = 0;
let phase = 'idle'; // idle, fading_in, playing, fading_out
let savedPreset = null;
let onFlashbackComplete = null;

const overlay = () => document.getElementById('flashback-overlay');

export function triggerFlashback(sceneKey, duration) {
  const scene = FLASHBACK_SCENES[sceneKey];
  if (!scene) return;
  flashbackActive = true;
  flashbackType = sceneKey;
  flashbackTimer = 0;
  flashbackDuration = duration || scene.duration || 5;
  phase = 'fading_in';
  // Save current environment preset (caller should set this before triggering)
  savedPreset = 'sundaram_normal';
  setState(STATES.FLASHBACK);
  const el = overlay();
  if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
}

export function updateFlashback(dt) {
  if (!flashbackActive) return;
  flashbackTimer += dt;
  if (phase === 'fading_in' && flashbackTimer > 0.8) {
    phase = 'playing';
    const scene = FLASHBACK_SCENES[flashbackType];
    if (scene) {
      setEnvironmentPreset(scene.environment);
      if (scene.dialogue) {
        // Temporarily set state to EXPLORING to allow dialogue
        const prevState = getState();
        setState(STATES.EXPLORING);
        startDialogue(scene.dialogue, 'start', () => {
          // Dialogue ended, but flashback may still be playing
        });
        // Restore FLASHBACK state
        setState(STATES.FLASHBACK);
      }
    }
  }
  if (phase === 'playing' && flashbackTimer >= flashbackDuration) {
    phase = 'fading_out';
    const el = overlay();
    if (el) el.style.opacity = '0';
  }
  if (phase === 'fading_out' && flashbackTimer >= flashbackDuration + 0.8) {
    endFlashback();
  }
}

function endFlashback() {
  flashbackActive = false;
  flashbackType = null;
  phase = 'idle';
  const el = overlay();
  if (el) el.style.pointerEvents = 'none';
  setEnvironmentPreset(savedPreset || 'sundaram_normal');
  setState(STATES.EXPLORING);
  if (onFlashbackComplete) onFlashbackComplete();
  onFlashbackComplete = null;
}

export function isFlashbackActive() { return flashbackActive; }
export function getFlashbackType() { return flashbackType; }
export function setOnFlashbackComplete(cb) { onFlashbackComplete = cb; }
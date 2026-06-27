import * as THREE from 'three';
import { getState, setState, STATES } from './state.js';
import { startDialogue } from './dialogue/engine.js';

const raycaster = new THREE.Raycaster();
const interactables = [];
let nearbyInteractable = null;

export function registerInteractable(mesh, data) {
    mesh.userData.interactData = data;
    interactables.push(mesh);
}

export function initInteraction(camera, scene) {
    // Nothing to initialize yet
}

export function updateInteraction(camera) {
    if (getState() !== STATES.EXPLORING) {
        nearbyInteractable = null;
        return null;
    }
    
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(interactables, true);
    
    if (intersects.length > 0) {
        const hit = intersects[0].object;
        let target = hit;
        while (target && !target.userData.interactData) {
            target = target.parent;
        }
        
        if (target && target.userData.interactData) {
            const dist = camera.position.distanceTo(target.position);
            if (dist < 5) {
                nearbyInteractable = target;
                return target.userData.interactData;
            }
        }
    }
    
    nearbyInteractable = null;
    return null;
}

export function getNearbyInteractable() {
    return nearbyInteractable;
}

export function interact() {
    if (!nearbyInteractable) return false;
    const data = nearbyInteractable.userData.interactData;
    
    if (data.type === 'dialogue') {
        startDialogue(data.dialogue, data.startNode);
    } else if (data.type === 'examine') {
        setState(STATES.INTERACTING);
    } else if (data.type === 'flashback') {
        setState(STATES.FLASHBACK);
    }
    
    return true;
}

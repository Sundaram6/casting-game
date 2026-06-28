import { registerInteractable } from '../interaction.js';
import { REKHA_DIALOGUE } from '../dialogue/rekha.js';
import { setEnvironmentPreset } from '../environment.js';
import { startDialogue } from '../dialogue/engine.js';
import { showTapeReview, hideTapeReview } from '../ui/tape-reviewer.js';
import * as THREE from 'three';

let rekhaScene = null;
let rekhaState = 'morning';
let camera = null;

export function initRekhaChapter(scene, cameraRef) {
    rekhaScene = scene;
    rekhaState = 'morning';
    camera = cameraRef;

    setEnvironmentPreset('rekha_office');

    // 1. Rekha's office desk
    const deskGeo = new THREE.BoxGeometry(4, 0.3, 2);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, metalness: 0.2, roughness: 0.8 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 1, -8);
    scene.add(desk);

    // 2. Monitor for tape review
    const monitorGeo = new THREE.BoxGeometry(2.5, 1.5, 0.2);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.7, roughness: 0.3 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, 2, -8.5);
    scene.add(monitor);

    registerInteractable(monitor, {
        type: 'dialogue',
        label: 'Review Audition Tapes',
        dialogue: REKHA_DIALOGUE,
        startNode: 'office_arrival',
        onInteract: () => {
            setRekhaState('reviewing');
            showTapeReview();
        }
    });

    // 3. Photo frame (Geeta)
    const frameGeo = new THREE.PlaneGeometry(0.6, 0.4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(3, 1.5, -8.5);
    frame.rotation.y = -0.2;
    scene.add(frame);

    registerInteractable(frame, {
        type: 'examine',
        label: 'Look at Photo',
        text: {
            hi: '1998 की तस्वीर। गीता और मैं। उस दिन उसने कहा था — मैडम, आप मेरी हीरोइन हो।',
            en: 'Photo from 1998. Geeta and me. That day she said — madam, you\'re my heroine.'
        }
    });

    // 4. Wine glass
    const glassGeo = new THREE.CylinderGeometry(0.15, 0.1, 0.4, 8);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x722f37, transparent: true, opacity: 0.6 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(-2, 1.2, -8);
    scene.add(glass);

    registerInteractable(glass, {
        type: 'examine',
        label: 'Pour Wine',
        text: {
            hi: 'वाइन का गिलास। तीस साल का हिसाब लेने के लिए।',
            en: 'A glass of wine. To take stock of thirty years.'
        }
    });

    // 5. Script pile on desk
    const scriptsGeo = new THREE.BoxGeometry(0.8, 0.4, 0.6);
    const scriptsMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const scripts = new THREE.Mesh(scriptsGeo, scriptsMat);
    scripts.position.set(1.5, 1.2, -8);
    scripts.rotation.y = 0.3;
    scene.add(scripts);

    registerInteractable(scripts, {
        type: 'dialogue',
        label: 'Read Scripts',
        dialogue: REKHA_DIALOGUE,
        startNode: 'morning_scripts'
    });

    // 6. Phone on desk
    const phoneGeo = new THREE.BoxGeometry(0.3, 0.1, 0.5);
    const phoneMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
    const phone = new THREE.Mesh(phoneGeo, phoneMat);
    phone.position.set(-1.5, 1.1, -8);
    scene.add(phone);

    registerInteractable(phone, {
        type: 'dialogue',
        label: 'Check Phone',
        dialogue: REKHA_DIALOGUE,
        startNode: 'morning_phone_check'
    });

    createRekhaNPCs(scene);
}

function createRekhaNPCs(scene) {
    const npcPositions = [
        { x: 5, z: -5, color: 0x4a4a4a },
        { x: -5, z: -3, color: 0x2c3e50 }
    ];

    npcPositions.forEach((pos, i) => {
        const group = new THREE.Group();

        const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: pos.color,
            metalness: 0.3,
            roughness: 0.6
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.7;
        group.add(body);

        const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.7;
        group.add(head);

        group.position.set(pos.x, 0, pos.z);
        scene.add(group);
    });
}

export function updateRekhaChapter(delta) {
    handleSceneTransitions();
}

function handleSceneTransitions() {
    switch (rekhaState) {
        case 'morning':
            break;
        case 'reviewing':
            handleReviewingState();
            break;
        case 'phone_call':
            handlePhoneCallState();
            break;
        case 'flashback':
            handleFlashbackState();
            break;
        case 'meeting':
            handleMeetingState();
            break;
        case 'ending':
            handleEndingState();
            break;
    }
}

function handleReviewingState() {
    if (camera) {
        const targetPosition = new THREE.Vector3(0, 2, -6);
        camera.position.lerp(targetPosition, 0.02);
    }
}

function handlePhoneCallState() {
    if (camera) {
        const targetPosition = new THREE.Vector3(-1, 1.5, -7);
        camera.position.lerp(targetPosition, 0.02);
    }
}

function handleFlashbackState() {
    // Dim the scene for flashback effect
    if (rekhaScene && rekhaScene.fog) {
        rekhaScene.fog.near = 1;
        rekhaScene.fog.far = 15;
    }
}

function handleMeetingState() {
    if (camera) {
        const targetPosition = new THREE.Vector3(2, 1.5, -6);
        camera.position.lerp(targetPosition, 0.02);
    }
}

function handleEndingState() {
    if (camera) {
        const targetPosition = new THREE.Vector3(-2, 1.5, -7);
        camera.position.lerp(targetPosition, 0.02);
    }
}

export function triggerRekhaDialogue(nodeId) {
    if (REKHA_DIALOGUE.nodes[nodeId]) {
        return REKHA_DIALOGUE.nodes[nodeId];
    }
    return null;
}

export function setRekhaState(newState) {
    rekhaState = newState;

    switch (newState) {
        case 'morning':
            setEnvironmentPreset('rekha_office');
            break;
        case 'reviewing':
            break;
        case 'phone_call':
            break;
        case 'flashback':
            break;
        case 'meeting':
            break;
        case 'ending':
            hideTapeReview();
            break;
    }
}

export function getRekhaState() { return rekhaState; }

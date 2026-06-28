import { registerInteractable } from '../interaction.js';
import { arjunDialogue } from '../dialogue/arjun.js';
import { setEnvironmentPreset } from '../environment.js';
import { startDialogue } from '../dialogue/engine.js';
import * as THREE from 'three';

let arjunScene = null;
let arjunState = 'morning';
let sundaramNPC = null;
let camera = null;

export function initArjunChapter(scene, cameraRef) {
    arjunScene = scene;
    arjunState = 'morning';
    camera = cameraRef;

    // Set initial environment preset
    setEnvironmentPreset('arjun_luxury');

    // 1. Arjun's apartment door (luxury high-rise)
    const doorGeo = new THREE.BoxGeometry(4, 6, 0.3);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.6, roughness: 0.3 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(20, 3, -10);
    scene.add(door);

    registerInteractable(door, {
        type: 'dialogue',
        label: 'Enter Arjun\'s Apartment',
        dialogue: arjunDialogue,
        startNode: 'morning_start'
    });

    // 2. Luxury car (exterior)
    const carGeo = new THREE.BoxGeometry(5, 2, 2.5);
    const carMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.8, roughness: 0.2 });
    const car = new THREE.Mesh(carGeo, carMat);
    car.position.set(-15, 1, 15);
    scene.add(car);

    registerInteractable(car, {
        type: 'dialogue',
        label: 'Check the Car',
        dialogue: {
            nodes: {
                'start': {
                    speaker: 'Arjun',
                    text: {
                        hi: 'पापा की गाड़ी है... मेरे नाम पर कुछ भी नहीं।',
                        en: 'Dad\'s car... nothing\'s in my name.'
                    },
                    options: [
                        { text: { hi: 'अंदर बैठो', en: 'Get inside' }, next: 'inside' },
                        { text: { hi: 'वापस जाओ', en: 'Go back' }, next: 'end' }
                    ]
                },
                'inside': {
                    speaker: 'Arjun',
                    text: {
                        hi: 'AC चल रहा है... लेकिन अंदर से ठंडा मैं हूँ।',
                        en: 'The AC is running... but I\'m the one who\'s cold inside.'
                    },
                    options: [
                        { text: { hi: 'बाहर निकलो', en: 'Get out' }, next: 'end' }
                    ]
                },
                'end': {
                    speaker: 'narrator',
                    text: { hi: '', en: '' },
                    options: []
                }
            }
        },
        startNode: 'start'
    });

    // 3. Newspaper clipping about nepotism
    const paperGeo = new THREE.PlaneGeometry(0.6, 0.4);
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.set(25, 1.5, -5);
    paper.rotation.x = -0.3;
    scene.add(paper);

    registerInteractable(paper, {
        type: 'examine',
        label: 'Read Newspaper',
        text: {
            hi: 'Times of India: "NEPOTISM KI BAAT MAT KARO" — "Yeh industry hai, koi NGO nahi."',
            en: 'Times of India: "DON\'T TALK ABOUT NEPOTISM" — "This is an industry, not an NGO."'
        }
    });

    // 4. Casting office entrance NPC
    createArjunNPCs(scene);

    // 5. Create Sundaram NPC for waiting room encounter
    createSundaramNPC(scene);
}

function createArjunNPCs(scene) {
    const npcPositions = [
        { x: 30, z: -8, color: 0x4a4a4a },
        { x: 35, z: -12, color: 0x2c3e50 }
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

function createSundaramNPC(scene) {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x6b8e23, // Olive green kurta
        metalness: 0.2,
        roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.7;
    group.add(head);

    // Headshot (creased)
    const headshotGeo = new THREE.PlaneGeometry(0.3, 0.4);
    const headshotMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const headshot = new THREE.Mesh(headshotGeo, headshotMat);
    headshot.position.set(0.3, 1.2, 0);
    headshot.rotation.z = 0.1; // Slightly creased
    group.add(headshot);

    group.position.set(40, 0, -15); // Waiting room position
    group.userData.isSundaram = true;
    scene.add(group);

    sundaramNPC = group;
    return group;
}

export function updateArjunChapter(delta) {
    // Animate NPCs, handle state transitions
    
    // Check for waiting room encounter (Sundaram proximity)
    if (arjunState === 'waiting' && sundaramNPC && camera) {
        const distance = camera.position.distanceTo(sundaramNPC.position);
        if (distance < 5) {
            // Trigger waiting room dialogue
            triggerWaitingRoomEncounter();
        }
    }
    
    // Handle scene transitions based on state
    handleSceneTransitions();
}

function triggerWaitingRoomEncounter() {
    if (arjunState !== 'waiting') return;
    
    // Set state to prevent multiple triggers
    arjunState = 'waiting_encounter';
    
    // Trigger the waiting room dialogue
    const waitingDialogue = {
        nodes: {
            'waiting_enter': arjunDialogue.nodes.waiting_enter,
            'sundaram_meet': arjunDialogue.nodes.sundaram_meet,
            'sundaram_silence': arjunDialogue.nodes.sundaram_silence,
            'sundaram_intro': arjunDialogue.nodes.sundaram_intro,
            'sundaram_asks_father': arjunDialogue.nodes.sundaram_asks_father,
            'sundaram_reaction': arjunDialogue.nodes.sundaram_reaction,
            'sundaram_bhojpuri': arjunDialogue.nodes.sundaram_bhojpuri,
            'sundaram_story': arjunDialogue.nodes.sundaram_story,
            'sundaram_hope': arjunDialogue.nodes.sundaram_hope,
            'sundaram_bhojpuri_attempt': arjunDialogue.nodes.sundaram_bhojpuri_attempt,
            'sundaram_bhojpuri_response': arjunDialogue.nodes.sundaram_bhojpuri_response,
            'sundaram_advice': arjunDialogue.nodes.sundaram_advice,
            'audition_call': arjunDialogue.nodes.audition_call
        }
    };
    
    // Start dialogue from waiting_enter
    startDialogue(waitingDialogue, 'waiting_enter');
}

function handleSceneTransitions() {
    // Handle different scene states
    switch (arjunState) {
        case 'morning':
            // Morning scene - apartment
            break;
        case 'auto':
            // Auto ride scene
            break;
        case 'arrival':
            // Arrival at casting office
            break;
        case 'waiting':
            // Waiting room - check for Sundaram proximity
            break;
        case 'audition':
            // Audition scene - narrative sequence
            handleAuditionScene();
            break;
        case 'dinner':
            // Dinner confrontation
            handleDinnerScene();
            break;
    }
}

function handleAuditionScene() {
    // Camera movement for audition scene
    if (camera) {
        // Smooth camera movement to audition room
        const targetPosition = new THREE.Vector3(45, 2, -15);
        camera.position.lerp(targetPosition, 0.02);
    }
}

function handleDinnerScene() {
    // Switch to dinner environment preset
    setEnvironmentPreset('arjun_dinner');
    
    // Camera movement for dinner scene
    if (camera) {
        const targetPosition = new THREE.Vector3(50, 2, -20);
        camera.position.lerp(targetPosition, 0.02);
    }
}

export function triggerArjunDialogue(nodeId) {
    if (arjunDialogue.nodes[nodeId]) {
        // Trigger dialogue from engine
        return arjunDialogue.nodes[nodeId];
    }
    return null;
}

export function setArjunSceneState(newState) {
    arjunState = newState;
    
    // Handle environment preset changes based on state
    switch (newState) {
        case 'morning':
            setEnvironmentPreset('arjun_luxury');
            break;
        case 'waiting':
            // Keep current environment
            break;
        case 'audition':
            // Audition room environment
            break;
        case 'dinner':
            setEnvironmentPreset('arjun_dinner');
            break;
    }
}

export function getArjunSceneState() {
    return arjunState;
}

export function getArjunState() { return arjunState; }
export function setArjunState(state) { arjunState = state; }
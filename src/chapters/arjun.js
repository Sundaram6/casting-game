import { registerInteractable } from '../interaction.js';
import { arjunDialogue } from '../dialogue/arjun.js';
import * as THREE from 'three';

let arjunScene = null;
let arjunState = 'morning';

export function initArjunChapter(scene) {
    arjunScene = scene;
    arjunState = 'morning';

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

export function updateArjunChapter(delta) {
    // Animate NPCs, handle state transitions
}

export function triggerArjunDialogue(nodeId) {
    if (arjunDialogue.nodes[nodeId]) {
        // Trigger dialogue from engine
        return arjunDialogue.nodes[nodeId];
    }
    return null;
}

export function getArjunState() { return arjunState; }
export function setArjunState(state) { arjunState = state; }
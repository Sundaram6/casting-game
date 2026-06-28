import * as THREE from 'three';
import {
    MAT,
    createBrickTexture,
    createBrickNormalMap,
    createGlassTexture,
    createNeonSignTexture,
    createNepoSignTexture,
    createAllowedSignTexture
} from '../materials.js';
import { getScene } from '../scene.js';

// ─── STUDIO CONFIGS ──────────────────────────────────────────────────────────

const NORMAL_STUDIOS = [
    { name: "Casting Bay", color: '#5b8dd9' },
    { name: "Anti Casting", color: '#7b5ea7' },
    { name: "MCC", color: '#4a9e7f' },
    { name: "Netflex", color: '#d94f3d' },
    { name: "Warner Bros", color: '#3d7ab5' },
    { name: "A25", color: '#e8873d' },
    { name: "Pear TV", color: '#6cb86c' },
    { name: "Paramount", color: '#2c6e9e' },
    { name: "Excel Ent", color: '#9e6b2c' },
    { name: "Phantom", color: '#6b2c9e' },
];

// Nepo-only production houses — gold-tinted, larger, with nepo signs
const NEPO_HOUSES = [
    { name: "Dharma Prod.", color: '#c8a400', neonColor: '#FFD700' },
    { name: "YRF Studios", color: '#b8860b', neonColor: '#FFC300' },
    { name: "Johar Ent.", color: '#d4a017', neonColor: '#FFB700' },
    { name: "Star Child Inc", color: '#b5651d', neonColor: '#FF8C00' },
    { name: "Papa's Studio", color: '#8B6914', neonColor: '#FFAA00' },
];

const NEPO_POSITIONS = [
    [80, 60], [-80, 60], [0, 120], [80, -80], [-80, -80]
];

let offices = [];

function addWindowsToBuilding(mesh, bw, bh, bd) {
    const glassTex = createGlassTexture();
    const winMat = MAT.GLASS();
    const winGeo = new THREE.BoxGeometry(bw * 0.85, bh * 0.85, 0.2);
    [-1, 1].forEach(side => {
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(0, 0, side * (bd / 2 + 0.11));
        win.rotation.y = side === -1 ? Math.PI : 0;
        mesh.add(win);
    });
}

function createBouncerMesh() {
    const g = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x4a2e0a, roughness: 0.6 });
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111100, metalness: 0.6, roughness: 0.2 });

    // Head (Sphere)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), skinMat);
    head.position.y = 5.0;
    head.castShadow = true;
    g.add(head);
    
    // Shades
    const shades = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.2), glassMat);
    shades.position.set(0, 5.1, 0.65);
    g.add(shades);
    
    // Torso (Big Cylinder)
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 2.8, 12), suitMat);
    torso.position.y = 3.0;
    torso.castShadow = true;
    g.add(torso);
    
    // Arms
    const armGeo = new THREE.CylinderGeometry(0.4, 0.3, 2.6, 8);
    armGeo.translate(0, -1.0, 0);
    [[-1.8, 4.0], [1.8, 4.0]].forEach(([px, py]) => {
        const arm = new THREE.Mesh(armGeo, suitMat);
        arm.position.set(px, py, 0);
        arm.castShadow = true;
        g.add(arm);
    });
    
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.5, 0.4, 2.8, 8);
    legGeo.translate(0, -1.4, 0);
    [[-0.7, 1.6], [0.7, 1.6]].forEach(([px, py]) => {
        const leg = new THREE.Mesh(legGeo, suitMat);
        leg.position.set(px, py, 0);
        leg.castShadow = true;
        g.add(leg);
    });
    
    g.userData = { isStatic: true };
    return g;
}

function createOfficeBuilding(config, isNepo = false) {
    const group = new THREE.Group();

    const bw = isNepo ? 14 : 10;
    const bh = isNepo ? 18 : 12;
    const bd = isNepo ? 14 : 10;

    // Main body — high quality PBR brick
    const bodyGeo = new THREE.BoxGeometry(bw, bh, bd);
    const brickTex = createBrickTexture(isNepo ? '#8B6914' : config.color);
    const brickNorm = createBrickNormalMap();
    const bodyMat = new THREE.MeshStandardMaterial({
        map: brickTex,
        normalMap: brickNorm,
        normalScale: new THREE.Vector2(0.6, 0.6),
        roughness: 0.8,
        metalness: 0.04,
        envMapIntensity: 0.5
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Glass facade overlays
    addWindowsToBuilding(body, bw - 1, bh - 1, bd);

    // Roof parapet
    const parapetMat = new THREE.MeshStandardMaterial({
        color: isNepo ? 0x8B6914 : 0x2c3e50,
        roughness: 0.8,
        metalness: 0.1
    });
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(bw + 1, 1.2, bd + 1), parapetMat);
    parapet.position.y = bh / 2 + 0.6;
    parapet.castShadow = true;
    group.add(parapet);

    // Ground floor ledge
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.6, 0.6, bd + 0.6), parapetMat);
    ledge.position.y = -bh / 2 + 3;
    ledge.castShadow = true;
    group.add(ledge);

    // Front door frame
    const doorFrameGeo = new THREE.BoxGeometry(3.5, 4.5, bd + 0.8);
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: isNepo ? 0xFFD700 : 0x111111, metalness: 0.6, roughness: 0.4 });
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
    doorFrame.position.set(0, -bh / 2 + 2.25, 0);
    group.add(doorFrame);

    if (isNepo) {
        // Gold dome on top for nepo houses
        const domeGeo = new THREE.SphereGeometry(4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9, roughness: 0.1 });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = bh / 2 + 1;
        dome.castShadow = true;
        group.add(dome);

        // Nepo sign — big, centred
        const nepoSignGeo = new THREE.PlaneGeometry(12, 4.5);
        const nepoSignMat = new THREE.MeshBasicMaterial({ map: createNepoSignTexture(), transparent: true });
        const nepoSign = new THREE.Mesh(nepoSignGeo, nepoSignMat);
        nepoSign.position.set(0, bh / 2 - 2, bd / 2 + 0.15);
        group.add(nepoSign);

        const gateSignGeo = new THREE.PlaneGeometry(5.2, 5.2);
        const gateSignMat = new THREE.MeshBasicMaterial({ map: createAllowedSignTexture(), transparent: true });
        const gateSign = new THREE.Mesh(gateSignGeo, gateSignMat);
        gateSign.position.set(-5.8, -bh / 2 + 3.5, bd / 2 + 4.2);
        gateSign.rotation.y = -0.12;
        group.add(gateSign);

        const gatePost = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 3.6, 8),
            new THREE.MeshStandardMaterial({ color: 0x1b1b1b, metalness: 0.6, roughness: 0.3 })
        );
        gatePost.position.set(-5.8, -bh / 2 + 1.2, bd / 2 + 4.1);
        gatePost.castShadow = true;
        group.add(gatePost);

        // (Gold halo removed for performance - dome emissive handles it)

        // Velvet rope posts (left & right of door)
        [-4, 4].forEach(px => {
            const postG = new THREE.CylinderGeometry(0.15, 0.15, 3, 8);
            const postM = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9, roughness: 0.1 });
            const post = new THREE.Mesh(postG, postM);
            post.position.set(px, -bh / 2 + 1.5, bd / 2 + 1);
            group.add(post);
        });
        // Velvet rope
        const ropePoints = [];
        for (let t = 0; t <= 1; t += 0.05) {
            const x = -4 + t * 8;
            const y = -bh / 2 + 3 + Math.sin(t * Math.PI) * -0.3;
            ropePoints.push(new THREE.Vector3(x, y, bd / 2 + 1));
        }
        const ropeCurve = new THREE.CatmullRomCurve3(ropePoints);
        const ropeGeo = new THREE.TubeGeometry(ropeCurve, 20, 0.08, 6, false);
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.5 });
        const rope = new THREE.Mesh(ropeGeo, ropeMat);
        group.add(rope);

    } else {
        // Normal cone roof
        const roofGeo = new THREE.ConeGeometry(bw * 0.75, 4, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = bh / 2 + 2.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);
    }

    // Door
    const doorGeo = new THREE.BoxGeometry(isNepo ? 5 : 3.5, isNepo ? 7 : 5.5, 0.4);
    const doorMat = new THREE.MeshStandardMaterial({
        color: isNepo ? 0xFFD700 : 0x8e44ad,
        emissive: isNepo ? 0x554400 : 0x2c003e,
        metalness: isNepo ? 0.7 : 0.1,
        roughness: isNepo ? 0.2 : 0.8
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, -bh / 2 + (isNepo ? 3.5 : 2.75), bd / 2 + 0.21);
    group.add(door);

    // Red carpet
    const carpetGeo = new THREE.PlaneGeometry(isNepo ? 6 : 4, isNepo ? 20 : 15);
    const carpetMat = new THREE.MeshStandardMaterial({ color: isNepo ? 0xFFD700 : 0xc0392b, roughness: 0.8 });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, -bh / 2 + 0.1, bd / 2 + (isNepo ? 11 : 9));
    carpet.receiveShadow = true;
    group.add(carpet);

    // (Entry light removed for performance - door emissive handles it)

    const propDark = new THREE.MeshStandardMaterial({ color: 0x111820, roughness: 0.65, metalness: 0.25 });
    const propMetal = new THREE.MeshStandardMaterial({ color: 0x889099, roughness: 0.3, metalness: 0.7 });
    const propGold = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.85 });
    const barrierMat = new THREE.MeshStandardMaterial({ color: isNepo ? 0xffd700 : 0xd9d9d9, roughness: 0.45, metalness: 0.4 });

    [-1, 1].forEach(side => {
        const barrier = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.22, 0.22), barrierMat);
        barrier.position.set(side * 5.2, -bh / 2 + 1.15, bd / 2 + 8.4);
        barrier.rotation.y = side * 0.26;
        barrier.castShadow = true;
        group.add(barrier);

        for (let j = 0; j < 2; j++) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 8), barrierMat);
            post.position.set(side * (3.2 + j * 3), -bh / 2 + 0.72, bd / 2 + 7.9 + j * 0.75);
            post.castShadow = true;
            group.add(post);
        }
    });

    if (isNepo) {
        [-1, 1].forEach(side => {
            const tripod = new THREE.Group();
            const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8), propMetal);
            stand.position.y = 1.2;
            tripod.add(stand);
            [-0.45, 0, 0.45].forEach((rx, i) => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 6), propMetal);
                leg.position.set(rx, 0.35, i === 1 ? 0.45 : -0.3);
                leg.rotation.z = rx * 0.8;
                leg.rotation.x = i === 1 ? 0.45 : -0.35;
                tripod.add(leg);
            });
            const cameraBody = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 0.5), propDark);
            cameraBody.position.y = 2.55;
            tripod.add(cameraBody);
            const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.45, 16), propDark);
            lens.position.set(0, 2.55, -0.42);
            lens.rotation.x = Math.PI / 2;
            tripod.add(lens);
            // (Flash light removed for performance)
            tripod.position.set(side * 8.2, -bh / 2 + 0.1, bd / 2 + 9.8);
            tripod.rotation.y = side * -0.7;
            group.add(tripod);
        });

        const star = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 8, 5), propGold);
        star.position.set(0, -bh / 2 + 0.18, bd / 2 + 14.3);
        star.rotation.x = -Math.PI / 2;
        star.castShadow = true;
        group.add(star);
    } else {
        const noticeBoard = new THREE.Mesh(
            new THREE.BoxGeometry(3.4, 2.2, 0.16),
            new THREE.MeshStandardMaterial({ color: 0x213547, roughness: 0.7 })
        );
        noticeBoard.position.set(4.8, -bh / 2 + 2.1, bd / 2 + 3.4);
        noticeBoard.rotation.y = -0.28;
        noticeBoard.castShadow = true;
        group.add(noticeBoard);
        const paper = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 1.45, 0.03),
            new THREE.MeshBasicMaterial({ color: 0xf6f1df })
        );
        paper.position.set(4.8, -bh / 2 + 2.1, bd / 2 + 3.5);
        paper.rotation.y = -0.28;
        group.add(paper);
    }

    // Studio name sign
    const signGeo = new THREE.PlaneGeometry(isNepo ? 16 : 12, isNepo ? 4 : 3);
    const signMat = new THREE.MeshBasicMaterial({
        map: createNeonSignTexture(config.name, isNepo ? '#FFD700' : (config.neonColor || '#ff0055'))
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    // Position sign high up on the building so it doesn't clip
    sign.position.set(0, isNepo ? bh / 2 + 5 : bh / 2 + 3, bd / 2 + 0.3);
    group.add(sign);

    // Bouncer for nepo houses
    if (isNepo) {
        const bouncer = createBouncerMesh();
        bouncer.position.set(6, -bh / 2 + 1, bd / 2 + 2);
        group.add(bouncer);
    }

    return { group, bh };
}

function createOffices(totalOffices) {
    const scene = getScene();
    offices.forEach(o => scene.remove(o.group));
    offices = [];

    // Normal offices
    for (let i = 0; i < totalOffices; i++) {
        const config = NORMAL_STUDIOS[i % NORMAL_STUDIOS.length];
        const { group, bh } = createOfficeBuilding(config, false);

        let x, z;
        do {
            x = (Math.random() - 0.5) * 280;
            z = (Math.random() - 0.5) * 280;
        } while (Math.abs(x) < 30 && Math.abs(z) < 30);

        group.position.set(x, bh / 2, z);
        group.rotation.y = Math.random() * Math.PI * 2;
        scene.add(group);

        offices.push({
            group,
            mesh: group, // legacy ref
            completed: false,
            timeLimit: Math.max(2.5, 7 - (i * 0.4)),
            isNepo: false
        });
    }

    // Nepo-only production houses — placed more prominently
    NEPO_HOUSES.forEach((config, i) => {
        const [nx, nz] = NEPO_POSITIONS[i] || [100 + i * 30, 100];
        const { group, bh } = createOfficeBuilding(config, true);
        group.position.set(nx, bh / 2, nz);
        group.rotation.y = Math.atan2(-nx, -nz); // face towards centre
        scene.add(group);
    });
}

function getOffices() {
    return offices;
}

export { createOffices, getOffices, NORMAL_STUDIOS, NEPO_HOUSES, NEPO_POSITIONS };
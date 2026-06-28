import * as THREE from 'three';

const skinPalette = [0xf0c7a1, 0xd9a16e, 0xb97a52, 0x8f563b, 0x5c3528, 0x3b241c];
const hairPalette = [0x14100d, 0x2a1b13, 0x4a2c18, 0x6a4a2f, 0xb48a54, 0xeeeeee];
const actorClothes = [0x1f6f8b, 0xe76f51, 0x2a9d8f, 0xf4a261, 0x6d597a, 0x355070, 0x7f5539, 0x3a5a40];
const nepoClothes = [0xffd166, 0xf72585, 0x7209b7, 0x0d1b2a, 0xffffff, 0x06d6a0];
const mutedPants = [0x20242b, 0x2f3e46, 0x4a4e69, 0x3d405b, 0x22223b, 0x5c677d];

let crowds = [];
let nepoDogs = [];
let nepoCrowds = [];
let scene = null;

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function createCapsuleLikeGeometry(radius, length, radialSegments = 14) {
    if (THREE.CylinderGeometry) {
        return new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8);
    }
    return new THREE.CylinderGeometry(radius, radius, length + radius * 2, radialSegments);
}

function addRoundedCapsule(group, radius, length, material, position, rotation = [0, 0, 0], name = '') {
    const geo = createCapsuleLikeGeometry(radius, length, 14);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (name) mesh.name = name;
    group.add(mesh);
    return mesh;
}

export function createPersonMesh(isNepo = false) {
    const person = new THREE.Group();

    const bodyScale = 0.88 + Math.random() * 0.26;
    const heightScale = 0.9 + Math.random() * 0.22;
    person.scale.set(bodyScale, heightScale, bodyScale);

    const skinMat = new THREE.MeshStandardMaterial({ color: pick(skinPalette), roughness: 0.58 });
    const hairMat = new THREE.MeshStandardMaterial({ color: pick(hairPalette), roughness: 0.86 });
    const shirtMat = new THREE.MeshStandardMaterial({
        color: pick(isNepo ? nepoClothes : actorClothes),
        roughness: isNepo ? 0.35 : 0.66,
        metalness: isNepo ? 0.18 : 0.02
    });
    const jacketMat = new THREE.MeshStandardMaterial({
        color: isNepo ? pick([0xffffff, 0xffd700, 0x111111, 0x581845]) : pick([0x222831, 0x3c4048, 0x6b705c, 0x264653]),
        roughness: 0.72,
        metalness: isNepo ? 0.08 : 0.02
    });
    const pantsMat = new THREE.MeshStandardMaterial({
        color: isNepo ? pick([0xf8f3d4, 0x111111, 0x2b2d42, 0xffd166]) : pick(mutedPants),
        roughness: 0.82
    });
    const shoeMat = new THREE.MeshStandardMaterial({ color: pick([0x0d0d0d, 0xffffff, 0x5a3e2b, 0x222222]), roughness: 0.62 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x101014, roughness: 0.5, metalness: isNepo ? 0.35 : 0.05 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const bagMat = new THREE.MeshStandardMaterial({ color: pick([0x5c4033, 0x111111, 0x8d5524, 0xb5651d]), roughness: 0.75 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.18 });

    const torsoY = 2.35;
    const headY = 4.25;

    const torso = addRoundedCapsule(person, 0.58, 1.35, shirtMat, [0, torsoY, 0], [0, 0, 0], 'torso');
    torso.scale.set(1.05, 1.08, 0.68);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.76, 18, 12), shirtMat);
    chest.position.set(0, 3.02, 0);
    chest.scale.set(1.0, 0.42, 0.58);
    chest.castShadow = true;
    person.add(chest);

    const hips = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 10), pantsMat);
    hips.position.set(0, 1.62, 0);
    hips.scale.set(1.0, 0.36, 0.58);
    hips.castShadow = true;
    person.add(hips);

    const shoulderBar = new THREE.Mesh(createCapsuleLikeGeometry(0.16, 1.25, 12), jacketMat);
    shoulderBar.position.set(0, 3.2, 0);
    shoulderBar.rotation.z = Math.PI / 2;
    shoulderBar.castShadow = true;
    person.add(shoulderBar);

    if (Math.random() > (isNepo ? 0.15 : 0.45)) {
        const jacket = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.45, 0.08), jacketMat);
        jacket.position.set(0, 2.42, 0.43);
        jacket.castShadow = true;
        person.add(jacket);
    }

    const neck = addRoundedCapsule(person, 0.18, 0.18, skinMat, [0, 3.56, 0]);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 18), skinMat);
    head.position.y = headY;
    head.scale.set(0.88 + Math.random() * 0.2, 1.08, 0.92);
    head.castShadow = true;
    person.add(head);

    const hairStyle = Math.floor(Math.random() * 4);
    const hairGeo = new THREE.SphereGeometry(0.54, 18, 12, 0, Math.PI * 2, 0, Math.PI / (hairStyle === 0 ? 1.75 : 1.35));
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, headY + (hairStyle === 3 ? 0.02 : 0.08), -0.02);
    hair.scale.set(1.04, hairStyle === 2 ? 0.72 : 0.9, 1.02);
    hair.castShadow = true;
    person.add(hair);
    if (hairStyle === 1 || hairStyle === 3) {
        const bun = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), hairMat);
        bun.position.set(0, headY + 0.02, -0.52);
        bun.castShadow = true;
        person.add(bun);
    }

    const eyeGeo = new THREE.SphereGeometry(0.045, 8, 6);
    [-0.16, 0.16].forEach(x => {
        const eye = new THREE.Mesh(eyeGeo, darkMat);
        eye.position.set(x, headY + 0.08, 0.48);
        person.add(eye);
    });
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 8), skinMat);
    nose.position.set(0, headY - 0.04, 0.52);
    nose.rotation.x = Math.PI / 2;
    person.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.025), darkMat);
    mouth.position.set(0, headY - 0.22, 0.5);
    person.add(mouth);

    if (isNepo) {
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.26, 8), goldMat);
        crown.position.y = 4.98;
        crown.castShadow = true;
        person.add(crown);
        const shades = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.18, 0.08), darkMat);
        shades.position.set(0, 4.3, 0.55);
        person.add(shades);
        const chain = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 8, 20), goldMat);
        chain.position.set(0, 3.55, 0.16);
        chain.rotation.x = Math.PI / 2.25;
        person.add(chain);
    }

    const upperArmGeo = createCapsuleLikeGeometry(0.13, 0.72, 10);
    upperArmGeo.translate(0, -0.45, 0);
    const foreArmGeo = createCapsuleLikeGeometry(0.11, 0.62, 10);
    foreArmGeo.translate(0, -0.4, 0);

    const armL = new THREE.Group();
    armL.position.set(-0.9, 3.4, 0);
    const armLTop = new THREE.Mesh(upperArmGeo, shirtMat);
    armLTop.castShadow = true;
    armL.add(armLTop);
    const foreL = new THREE.Mesh(foreArmGeo, skinMat);
    foreL.position.set(0, -0.84, 0.03);
    foreL.rotation.x = 0.08;
    foreL.castShadow = true;
    armL.add(foreL);
    person.add(armL);
    
    const armR = new THREE.Group();
    armR.position.set(0.9, 3.4, 0);
    const armRTop = new THREE.Mesh(upperArmGeo, shirtMat);
    armRTop.castShadow = true;
    armR.add(armRTop);
    const foreR = new THREE.Mesh(foreArmGeo, skinMat);
    foreR.position.set(0, -0.84, 0.03);
    foreR.rotation.x = -0.08;
    foreR.castShadow = true;
    armR.add(foreR);
    person.add(armR);

    const legGeo = createCapsuleLikeGeometry(0.18, 1.18, 10);
    legGeo.translate(0, -0.75, 0);
    
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.28, 1.42, 0);
    legL.castShadow = true;
    person.add(legL);
    
    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.set(0.28, 1.42, 0);
    legR.castShadow = true;
    person.add(legR);

    const shoeGeo = new THREE.BoxGeometry(0.34, 0.18, 0.7);
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
    shoeL.position.set(0, -1.46, 0.16);
    legL.add(shoeL);
    const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
    shoeR.position.set(0, -1.46, 0.16);
    legR.add(shoeR);

    if (!isNepo && Math.random() > 0.35) {
        const portfolio = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.72, 0.08), bagMat);
        portfolio.position.set(-1.18, 2.35, 0.12);
        portfolio.rotation.z = 0.08;
        portfolio.castShadow = true;
        person.add(portfolio);
    }
    if (Math.random() > 0.58) {
        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.035), darkMat);
        phone.position.set(0.98, 2.45, 0.28);
        phone.rotation.set(-0.45, 0.1, -0.18);
        person.add(phone);
    }
    if (!isNepo && Math.random() > 0.72) {
        const auditionTag = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.02), whiteMat);
        auditionTag.position.set(0.28, 2.82, 0.46);
        person.add(auditionTag);
    }

    person.userData = {
        legL, legR, armL, armR, head, chest,
        walkTime: Math.random() * 100,
        idleOffset: Math.random() * Math.PI * 2,
        isNepo
    };

    return person;
}

export function createDogMesh() {
    const dog = new THREE.Group();

    const furColor = new THREE.Color().setHSL(0.08 + Math.random() * 0.1, 0.5, 0.4 + Math.random() * 0.3);
    const furMat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.9 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.5, roughness: 0.2 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.9), furMat);
    body.position.y = 0.9;
    body.castShadow = true;
    dog.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.9), furMat);
    head.position.set(0.9, 1.4, 0);
    head.castShadow = true;
    dog.add(head);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.6), furMat);
    snout.position.set(1.3, 1.2, 0);
    dog.add(snout);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.15), blackMat);
    nose.position.set(1.55, 1.3, 0);
    dog.add(nose);

    [-0.35, 0.35].forEach(ez => {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.2), furMat);
        ear.position.set(0.7, 1.75, ez);
        ear.rotation.z = ez > 0 ? 0.3 : -0.3;
        dog.add(ear);
    });

    const shades = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 0.12), blackMat);
    shades.position.set(1.1, 1.45, 0.48);
    dog.add(shades);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 6, 12), goldMat);
    collar.position.set(0.55, 1.3, 0);
    collar.rotation.y = Math.PI / 2;
    dog.add(collar);

    const legPositions = [
        [0.5, 0.9, 0.4],
        [0.5, 0.9, -0.4],
        [-0.5, 0.9, 0.4],
        [-0.5, 0.9, -0.4],
    ];
    const dogLegs = [];
    legPositions.forEach(([lx, ly, lz], i) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), furMat);
        leg.position.set(lx, ly - 0.7, lz);
        leg.castShadow = true;
        dog.add(leg);
        dogLegs.push(leg);
    });

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 0.25), furMat);
    tail.position.set(-0.95, 1.2, 0);
    tail.rotation.z = -0.5;
    dog.add(tail);

    dog.userData = {
        legs: dogLegs,
        tail: tail,
        walkTime: Math.random() * 100
    };

    return dog;
}

export function animatePerson(c, dt) {
    const speed = Math.sqrt(c.vx * c.vx + c.vz * c.vz);
    const ud = c.mesh.userData;
    ud.walkTime += dt * Math.max(speed, 0.25) * 2;
    const wt = ud.walkTime;
    
    const stride = Math.min(0.9, 0.22 + speed * 0.08);
    if (ud.legL) ud.legL.rotation.x = Math.sin(wt) * stride;
    if (ud.legR) ud.legR.rotation.x = Math.sin(wt + Math.PI) * stride;
    if (ud.armL) ud.armL.rotation.x = Math.sin(wt + Math.PI) * stride * 0.78;
    if (ud.armR) ud.armR.rotation.x = Math.sin(wt) * stride * 0.78;
    if (ud.head) {
        ud.head.rotation.y = Math.sin(wt * 0.35 + ud.idleOffset) * 0.16;
        ud.head.rotation.x = Math.sin(wt * 0.5 + ud.idleOffset) * 0.04;
    }
    if (ud.chest) ud.chest.position.y = 3.02 + Math.sin(wt * 2) * 0.025;
    
    if (speed > 0.05) {
        c.mesh.rotation.y = Math.atan2(c.vx, c.vz);
    } else {
        c.mesh.rotation.y += Math.sin(wt * 0.6 + ud.idleOffset) * dt * 0.3;
    }
}

export function animateDog(d, dt) {
    const dx = d.targetX - d.mesh.position.x;
    const dz = d.targetZ - d.mesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 5) {
        const speed = 3 + Math.sin(d.mesh.userData.walkTime * 3) * 0.5;
        d.vx = (dx / dist) * speed;
        d.vz = (dz / dist) * speed;
    } else {
        d.vx = Math.sin(d.mesh.userData.walkTime) * 1.5;
        d.vz = Math.cos(d.mesh.userData.walkTime * 0.7) * 1.5;
    }

    d.mesh.position.x += d.vx * dt;
    d.mesh.position.z += d.vz * dt;
    d.mesh.rotation.y = Math.atan2(d.vx, d.vz);

    const ud = d.mesh.userData;
    ud.walkTime += dt * 6;
    const wt = ud.walkTime;
    if (ud.legs) {
        ud.legs.forEach((leg, i) => {
            leg.position.y = (i % 2 === 0 ? 0.2 : -0.2) + Math.sin(wt + i * Math.PI / 2) * 0.15;
        });
    }
    if (ud.tail) ud.tail.rotation.z = -0.5 + Math.sin(wt * 8) * 0.4;
}

export function initCrowds(sceneRef, offices, nepoPositions) {
    scene = sceneRef;

    crowds.forEach(c => scene.remove(c.mesh));
    crowds = [];
    nepoCrowds.forEach(n => scene.remove(n.mesh));
    nepoCrowds = [];
    nepoDogs.forEach(d => scene.remove(d.mesh));
    nepoDogs = [];

    const spawnCrowdMember = (x, z, vx, vz, mood = 'wander') => {
        const mesh = createPersonMesh(false);
        mesh.position.set(x, 1, z);
        scene.add(mesh);
        crowds.push({
            mesh,
            vx,
            vz,
            mood,
            baseX: x,
            baseZ: z,
            changeTimer: Math.random() * 2
        });
    };

    offices.slice(0, 10).forEach((office, officeIndex) => {
        const base = office.group.position;
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), office.group.rotation.y);
        const side = new THREE.Vector3(forward.z, 0, -forward.x);
        for (let i = 0; i < 5; i++) {
            const offset = 9 + i * 2.1 + Math.random() * 0.6;
            const lane = (i % 2 === 0 ? -0.7 : 0.7) + (Math.random() - 0.5) * 0.4;
            const x = base.x + forward.x * offset + side.x * lane;
            const z = base.z + forward.z * offset + side.z * lane;
            spawnCrowdMember(x, z, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 'queue');
        }
        if (officeIndex % 2 === 0) {
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 14 + Math.random() * 8;
                spawnCrowdMember(base.x + Math.cos(angle) * dist, base.z + Math.sin(angle) * dist, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 'cluster');
            }
        }
    });

    for (let i = 0; i < 45; i++) {
        spawnCrowdMember(
            (Math.random() - 0.5) * 240,
            (Math.random() - 0.5) * 240,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            'wander'
        );
    }

    if (nepoPositions) {
        nepoPositions.forEach(([nx, nz]) => {
            for (let k = 0; k < 4; k++) {
                const kid = createPersonMesh(true);
                const angle = Math.random() * Math.PI * 2;
                kid.position.set(nx + Math.cos(angle) * (15 + Math.random() * 10), 1, nz + Math.sin(angle) * (15 + Math.random() * 10));
                scene.add(kid);
                nepoCrowds.push({
                    mesh: kid,
                    targetX: nx,
                    targetZ: nz,
                    vx: 0, vz: 0,
                    walkTime: Math.random() * 100,
                    isNepo: true
                });
            }

            for (let d = 0; d < 3; d++) {
                const dog = createDogMesh();
                const angle = Math.random() * Math.PI * 2;
                dog.position.set(nx + Math.cos(angle) * 8 + Math.random() * 6, 0.5, nz + Math.sin(angle) * 8 + Math.random() * 6);
                scene.add(dog);
                nepoDogs.push({
                    mesh: dog,
                    targetX: nx,
                    targetZ: nz,
                    vx: 0, vz: 0,
                    walkTime: Math.random() * 100
                });
            }
        });
    }
}

export function updateCrowds(dt) {
    crowds.forEach(c => {
        c.changeTimer -= dt;
        if (c.changeTimer <= 0) {
            const drift = c.mood === 'queue' ? 0.9 : c.mood === 'cluster' ? 2.4 : 7;
            c.vx = (Math.random() - 0.5) * drift;
            c.vz = (Math.random() - 0.5) * drift;
            c.changeTimer = c.mood === 'queue' ? 1.5 + Math.random() * 2.5 : 1 + Math.random() * 2;
        }
        c.mesh.position.x += c.vx * dt;
        c.mesh.position.z += c.vz * dt;
        if (c.mood === 'queue' || c.mood === 'cluster') {
            c.mesh.position.x += (c.baseX - c.mesh.position.x) * dt * (c.mood === 'queue' ? 1.8 : 0.7);
            c.mesh.position.z += (c.baseZ - c.mesh.position.z) * dt * (c.mood === 'queue' ? 1.8 : 0.7);
        }
        if (c.mesh.position.x > 240 || c.mesh.position.x < -240) c.vx *= -1;
        if (c.mesh.position.z > 240 || c.mesh.position.z < -240) c.vz *= -1;
        animatePerson(c, dt);
    });

    nepoCrowds.forEach(n => {
        const dx = n.targetX - n.mesh.position.x;
        const dz = n.targetZ - n.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 8) {
            const spd = 5;
            n.vx = (dx / dist) * spd;
            n.vz = (dz / dist) * spd;
        } else {
            n.mesh.position.x = n.targetX + (Math.random() - 0.5) * 40;
            n.mesh.position.z = n.targetZ + (Math.random() - 0.5) * 40;
            n.vx = 0; n.vz = 0;
        }
        n.mesh.position.x += n.vx * dt;
        n.mesh.position.z += n.vz * dt;
        animatePerson(n, dt);
    });

    nepoDogs.forEach(d => animateDog(d, dt));
}

export function getCrowds() { return crowds; }
export function getNepoCrowds() { return nepoCrowds; }
export function getNepoDogs() { return nepoDogs; }

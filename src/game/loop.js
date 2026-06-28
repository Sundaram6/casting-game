import * as THREE from 'three';
import { initLighting, getAmbientLight, getHemiLight, getDirLight, getRimLight, updateLighting, isLightingPresetActive } from '../lighting.js';
import { updateDialogueUI } from '../ui/dialogue-ui.js';
import { updateInteraction } from '../interaction.js';
import { initSundaramChapter, updateSundaramChapter } from '../chapters/sundaram.js';
import { initCrowds, updateCrowds, getCrowds, getNepoCrowds } from '../legacy/crowds.js';
import { updateTyping } from '../legacy/typing-game.js';
import { getInputState, setInputState } from './input.js';
import { getOffices } from './buildings.js';
import { updateFlashback } from '../flashback/system.js';
import { updateColorGrading } from '../effects/colorGrading.js';
import { getState, setState, STATES } from '../state.js';

// --- DAY/NIGHT CONSTANTS ---
const dayTop = new THREE.Color(0x3a66a8);
const dayHorizon = new THREE.Color(0x7ec8e3);
const dayBottom = new THREE.Color(0xf5d7a3);

const nightTop = new THREE.Color(0x020510);
const nightHorizon = new THREE.Color(0x051020);
const nightBottom = new THREE.Color(0x0a1525);
let dayTime = Math.PI / 2; // start at day

let score = 0;
let totalOffices = 15;
let officesCompleted = 0;

let particles = [];
const physicsParticles = [];
const particleGeos = [
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.TetrahedronGeometry(0.2),
    new THREE.OctahedronGeometry(0.2)
];
const particleMats = [
    new THREE.MeshStandardMaterial({ color: 0xff3366, emissive: 0x330011 }),
    new THREE.MeshStandardMaterial({ color: 0x33ff66, emissive: 0x003311 }),
    new THREE.MeshStandardMaterial({ color: 0x3366ff, emissive: 0x001133 }),
    new THREE.MeshStandardMaterial({ color: 0xffff33, emissive: 0x333300 })
];

let scene, camera, renderer, controls, composer;
let skyMat;
let cloudObjects, water, waterMat, grassInstanced, bladeCount, dummy;
let isMobile = false;
let startTypingMinigame = null;
let initialized = false;

function initGameLoop(options) {
    scene = options.scene;
    camera = options.camera;
    renderer = options.renderer;
    controls = options.controls;
    composer = options.composer;
    skyMat = options.skyMat;
    cloudObjects = options.cloudObjects;
    water = options.water;
    waterMat = options.waterMat;
    grassInstanced = options.grassInstanced;
    bladeCount = options.bladeCount;
    dummy = options.dummy;
    isMobile = options.isMobile;
    startTypingMinigame = options.startTypingMinigame;
    initialized = true;
}

function spawnFireworks(x, y, z) {
    const pGeo = new THREE.BufferGeometry();
    const pCount = 200;
    const pos = new Float32Array(pCount * 3);
    const vels = [];
    for(let i=0; i<pCount; i++) {
        pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;
        vels.push({
            x: (Math.random()-0.5)*30,
            y: Math.random()*30,
            z: (Math.random()-0.5)*30
        });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffd700, size: 0.8, transparent: true });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);
    particles.push({ mesh: points, vels: vels, life: 1.5 });
}

function spawnPhysicsParticle(x, y, z) {
    const geo = particleGeos[Math.floor(Math.random() * particleGeos.length)];
    const mat = particleMats[Math.floor(Math.random() * particleMats.length)];
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    
    physicsParticles.push({
        mesh,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 10 + 5,
        vz: (Math.random() - 0.5) * 10,
        life: 2.0
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (!initialized) return;

    const time = performance.now();
    const inputState = getInputState();
    const dt = Math.min((time - inputState.prevTime) / 1000, 0.05);
    inputState.prevTime = time;

    // Update physics particles
    for (let i = physicsParticles.length - 1; i >= 0; i--) {
        const p = physicsParticles[i];
        p.vy -= 25 * dt; // gravity
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        
        p.mesh.rotation.x += p.vx * dt;
        p.mesh.rotation.y += p.vy * dt;
        
        // Bounce
        if (p.mesh.position.y < 0.2) {
            p.mesh.position.y = 0.2;
            p.vy *= -0.6;
            p.vx *= 0.8;
            p.vz *= 0.8;
        }
        
        p.life -= dt;
        if (p.life <= 0) {
            scene.remove(p.mesh);
            physicsParticles.splice(i, 1);
        } else {
            p.mesh.scale.setScalar(p.life / 2.0);
        }
    }

    // --- DAY/NIGHT CYCLE ---
    dayTime += dt * 0.1; // speed of day/night
    const blend = (Math.sin(dayTime) + 1.0) / 2.0; // 0 to 1
    
    // Update Sky
    if (skyMat) {
        skyMat.uniforms.topColor.value.copy(nightTop).lerp(dayTop, blend);
        skyMat.uniforms.horizonColor.value.copy(nightHorizon).lerp(dayHorizon, blend);
        skyMat.uniforms.bottomColor.value.copy(nightBottom).lerp(dayBottom, blend);
    }
    
    // Update character-specific lighting presets
    updateLighting(time);

    // Update Lights (only if no lighting preset is active)
    if (!isLightingPresetActive()) {
        const _dirLight = getDirLight();
        const _ambientLight = getAmbientLight();
        const _hemiLight = getHemiLight();
        const _rimLight = getRimLight();
        if (_dirLight) {
            _dirLight.position.set(Math.cos(dayTime) * 300, Math.max(0, Math.sin(dayTime)) * 350 + 50, Math.sin(dayTime) * 300);
            _dirLight.intensity = Math.max(0.3, Math.sin(dayTime)) * 2.0;
        }
        if (_ambientLight) {
            _ambientLight.intensity = Math.max(0.3, blend * 0.5);
        }
        if (_hemiLight) {
            _hemiLight.intensity = Math.max(0.3, blend * 0.8);
        }
        if (_rimLight) {
            _rimLight.intensity = Math.max(0.2, blend * 0.7);
        }
    }

    // Drift clouds
    cloudObjects.forEach(c => {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > 300) c.position.x = -300;
    });

    if (getState() === STATES.EXPLORING && controls.isLocked) {
        inputState.velocity.x -= inputState.velocity.x * 10.0 * dt;
        inputState.velocity.z -= inputState.velocity.z * 10.0 * dt;
        
        if (isMobile) {
            inputState.direction.x = inputState.analogJoystick.x;
            inputState.direction.z = -inputState.analogJoystick.y;
        } else {
            inputState.direction.z = Number(inputState.moveForward) - Number(inputState.moveBackward);
            inputState.direction.x = Number(inputState.moveRight) - Number(inputState.moveLeft);
            inputState.direction.normalize();
        }

        const speed = inputState.isSprinting ? 800.0 : 400.0;
        camera.fov += ((inputState.isSprinting ? 90 : 75) - camera.fov) * 5 * dt;
        camera.updateProjectionMatrix();

        if (isMobile) {
            inputState.velocity.z -= inputState.direction.z * speed * dt;
            inputState.velocity.x -= inputState.direction.x * speed * dt;
        } else {
            if (inputState.moveForward || inputState.moveBackward) inputState.velocity.z -= inputState.direction.z * speed * dt;
            if (inputState.moveLeft || inputState.moveRight) inputState.velocity.x -= inputState.direction.x * speed * dt;
        }

        controls.moveRight(-inputState.velocity.x * dt);
        controls.moveForward(-inputState.velocity.z * dt);

        inputState.velocityY -= 40 * dt; // gravity
        camera.position.y += inputState.velocityY * dt;
        if (camera.position.y < 2) {
            camera.position.y = 2;
            inputState.velocityY = 0;
            inputState.isGrounded = true;
        }

        // Head bobbing
        let speedFactor = Math.sqrt(inputState.velocity.x*inputState.velocity.x + inputState.velocity.z*inputState.velocity.z);
        if (speedFactor > 2 && inputState.isGrounded) {
            inputState.headBobTimer += dt * (inputState.isSprinting ? 15 : 10);
            camera.position.y = 2 + Math.sin(inputState.headBobTimer) * 0.2;
        } else if (inputState.isGrounded) {
            camera.position.y += (2 - camera.position.y) * 10 * dt;
        }

        camera.position.x = Math.max(-280, Math.min(280, camera.position.x));
        camera.position.z = Math.max(-280, Math.min(280, camera.position.z));

        const offices = getOffices();
        for (let office of offices) {
            if (!office.completed) {
                const dist = camera.position.distanceTo(office.group.position);
                if (dist < 14) {
                    startTypingMinigame(office);
                    inputState.velocity.set(0, 0, 0);
                    inputState.moveForward = inputState.moveBackward = inputState.moveLeft = inputState.moveRight = false;
                    break;
                }
            }
        }
    } else if (getState() === STATES.TYPING) {
        updateTyping(dt);
    }

    // Crowds
    if (getState() === STATES.EXPLORING || getState() === STATES.TYPING) {
        updateCrowds(dt);
    }
    
    // Update fireworks
    for(let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.life -= dt;
        if(p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
            continue;
        }
        const positions = p.mesh.geometry.attributes.position.array;
        for(let j=0; j<p.vels.length; j++) {
            p.vels[j].y -= 30 * dt; // gravity
            positions[j*3] += p.vels[j].x * dt;
            positions[j*3+1] += p.vels[j].y * dt;
            positions[j*3+2] += p.vels[j].z * dt;
        }
        p.mesh.geometry.attributes.position.needsUpdate = true;
        p.mesh.material.opacity = p.life;
    }

    // Smooth color changes & Bouncer dance
    const officesList = getOffices();
    officesList.forEach(o => {
        if (o.isWinning) {
            o.group.traverse(child => {
                if (child.isMesh && child.material && child.material.color) {
                    child.material.color.lerp(new THREE.Color(0x2ed573), dt * 3);
                }
            });
            o.group.children.forEach(c => {
                if (c.userData.isStatic) { 
                    c.position.x += (8 - c.position.x) * dt * 2; 
                    c.rotation.y += dt * 5; 
                }
            });
        }
    });

    if (window.dustSystems) {
        const t = performance.now() * 0.002;
        window.dustSystems.forEach(sys => sys.userData.update(t));
    }

    // Water animation
    if (typeof water !== 'undefined' && water && waterMat.uniforms) {
        waterMat.uniforms.time.value = performance.now() * 0.001;
    }

    // Update dialogue UI
    updateDialogueUI();

    // Update flashback system
    updateFlashback(dt);

    // Update color grading transitions
    updateColorGrading(dt);

    // Update Sundaram chapter
    updateSundaramChapter(dt);

    // Update interaction system
    if (getState() === STATES.EXPLORING) {
        const nearby = updateInteraction(camera);
        const prompt = document.getElementById('interaction-prompt');
        if (nearby) {
            prompt.classList.remove('hidden');
            document.getElementById('interaction-text').textContent = nearby.label || 'Interact';
        } else {
            prompt.classList.add('hidden');
        }
    }

    // Grass wind animation (desktop only)
    if (!isMobile && typeof grassInstanced !== 'undefined' && grassInstanced) {
        const time = performance.now() * 0.001;
        for (let i = 0; i < bladeCount; i++) {
            const wave = Math.sin(time * 2 + i * 0.01) * 0.05;
            grassInstanced.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
            dummy.position.y += wave * 0.1;
            dummy.updateMatrix();
            grassInstanced.setMatrixAt(i, dummy.matrix);
        }
        grassInstanced.instanceMatrix.needsUpdate = true;
    }

    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
    
    setInputState(inputState);
}

function getScore() {
    return score;
}

function addScore(amount) {
    score += amount;
}

function getOfficesCompleted() {
    return officesCompleted;
}

function incrementOfficesCompleted() {
    officesCompleted++;
}

function getTotalOffices() {
    return totalOffices;
}

export {
    initGameLoop,
    animate,
    getScore,
    addScore,
    getOfficesCompleted,
    incrementOfficesCompleted,
    getTotalOffices,
    spawnFireworks,
    spawnPhysicsParticle
};
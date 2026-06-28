import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { initScene, getScene, getCamera, getRenderer } from './scene.js';
import { initLighting, getAmbientLight, getHemiLight, getDirLight, getRimLight } from './lighting.js';
import {
    MAT,
    createBrickTexture,
    createBrickNormalMap,
    createGlassTexture,
    createNeonSignTexture,
    createNepoSignTexture,
    createAllowedSignTexture
} from './materials.js';
import { initEnvironment } from './environment.js';
import { initSundaramChapter, updateSundaramChapter } from './chapters/sundaram.js';
import { updateDialogueUI } from './ui/dialogue-ui.js';
import { updateInteraction, interact } from './interaction.js';
import { setState, STATES, getCharacter } from './state.js';
import { initAmbientSound, startAmbientForCharacter } from './audio/ambient.js';
import './ui/switcher-ui.js';
import './ui/subtitle-settings.js';
import { initTypingGame, startTypingMinigame, updateTyping, handleTypingCharacter } from './legacy/typing-game.js';
import { initCrowds, updateCrowds, getCrowds, getNepoCrowds } from './legacy/crowds.js';
import { initTypingUI, updateTypingDisplay } from './legacy/typing-ui.js';

// --- Post-Processing (loaded dynamically) ---

let composer;


// --- UI Elements ---
const screens = {
    start: document.getElementById('start-screen'),
    typing: document.getElementById('typing-screen'),
    gameOver: document.getElementById('game-over-screen'),
    victory: document.getElementById('victory-screen'),
    celebration: document.getElementById('celebration-screen')
};

const crosshair = document.getElementById('crosshair');
const hud = document.getElementById('hud');
const buzzLayer = document.getElementById('buzz-layer');
const hudScore = document.getElementById('hud-score');
const hudOffices = document.getElementById('hud-offices');


// --- Game State ---

// --- DAY/NIGHT CONSTANTS ---
const dayTop = new THREE.Color(0x3a66a8);
const dayHorizon = new THREE.Color(0x7ec8e3);
const dayBottom = new THREE.Color(0xf5d7a3);

const nightTop = new THREE.Color(0x020510);
const nightHorizon = new THREE.Color(0x051020);
const nightBottom = new THREE.Color(0x0a1525);
let dayTime = Math.PI / 2; // start at day

let gameState = 'START';
let score = 0;
let totalOffices = 15;
let officesCompleted = 0;

// --- Device Detection (must be at top, used throughout) ---
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;

let particles = [];

// --- Meme Sounds ---
const sounds = {
    fail: new Audio('https://www.myinstants.com/media/sounds/emotional-damage-meme.mp3'),
    success: new Audio('https://www.myinstants.com/media/sounds/yippee-tbh.mp3'),
    sensual: new Audio('https://www.myinstants.com/media/sounds/careless-whisper-1.mp3'),
    victorious: new Audio('https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3'),
    type: new Audio('https://www.myinstants.com/media/sounds/minecraft_click.mp3'),
    bgm: new Audio('https://www.myinstants.com/media/sounds/wii-shop-channel-music.mp3'),
    chatter: new Audio('https://www.myinstants.com/media/sounds/crowd-talking-1.mp3')
};
sounds.bgm.loop = true;
sounds.bgm.volume = 0.2;
sounds.chatter.loop = true;
sounds.chatter.volume = 0.4;
sounds.sensual.volume = 0.85;
sounds.victorious.volume = 0.75;

function initAudio() {
    initAmbientSound();
}

document.addEventListener('click', () => initAudio(), { once: true });
document.addEventListener('touchstart', () => initAudio(), { once: true });

function playSound(snd) {
    snd.currentTime = 0;
    snd.play().catch(e => console.log("Audio play blocked"));
}

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

// ─── THREE.JS SETUP ──────────────────────────────────────────────────────────

initScene();
initLighting();
const scene = getScene();
const camera = getCamera();
const renderer = getRenderer();

// Sky dome - large sphere with gradient shader
const skyGeo = new THREE.SphereGeometry(450, 32, 32);
const skyMat = new THREE.ShaderMaterial({
    uniforms: {
        topColor: { value: new THREE.Color(0x5b8ec9) },
        horizonColor: { value: new THREE.Color(0x87ceeb) },
        bottomColor: { value: new THREE.Color(0xf5d7a3) },
        offset: { value: 20 },
        exponent: { value: 0.4 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            float t = max(pow(max(h, 0.0), exponent), 0.0);
            vec3 sky = mix(horizonColor, topColor, t);
            if (h < 0.0) {
                sky = mix(horizonColor, bottomColor, min(-h * 3.0, 1.0));
            }
            gl_FragColor = vec4(sky, 1.0);
        }
    `,
    side: THREE.BackSide
});
const skyDome = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyDome);
scene.background = new THREE.Color(0x87ceeb); // Match fog color for seamless background
scene.fog = new THREE.FogExp2(0x87ceeb, isMobile ? 0.003 : 0.002);

// Sun sphere (decorative)
const sunGeo = new THREE.SphereGeometry(12, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff5c0 });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.set(180, 350, -300);
scene.add(sunMesh);

// Sun glow halos (Additive blending for bloom effect)
for(let i=1; i<=3; i++) {
    const haloGeo = new THREE.SphereGeometry(12 + i * 15, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({ 
        color: 0xffaa00, 
        transparent: true, 
        opacity: 0.15 / i,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.copy(sunMesh.position);
    scene.add(haloMesh);
}

// Post-processing disabled — was causing black background below horizon.
// scene.background + renderer handles the sky correctly.
// To re-enable, fix EffectComposer clear color to match scene.background.
composer = null;


// ─── CONTROLS ────────────────────────────────────────────────────────────────

const controls = new PointerLockControls(camera, document.body);

if (isMobile) {
    document.querySelector('#start-screen .instructions').innerHTML = `
        <p><strong>Mobile Controls:</strong></p>
        <p>Left Side: Joystick to Move</p>
        <p>Right Side: Drag to Look</p>
        <p>Tap the screen to start</p>
        <br>
        <p>Walk up to casting offices and type</p>
        <p><strong>"nepo kid"</strong></p>
        <p>before the timer runs out!</p>
    `;
    document.querySelector('#start-screen .click-to-start').innerText = "(Tap anywhere to play)";
}

function lockOrShowMobileControls() {
    if (isMobile) {
        document.getElementById('mobile-controls').classList.remove('hidden');
        document.getElementById('mobile-controls').classList.add('active');
        controls.isLocked = true;
    } else {
        controls.lock();
    }
}

screens.start.addEventListener('click', () => {
    if (gameState === 'START' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
        initGame();
        lockOrShowMobileControls();
    }
});
controls.addEventListener('unlock', () => {
    if (gameState === 'PLAYING') crosshair.style.display = 'none';
});
controls.addEventListener('lock', () => {
    camera.rotation.set(0, 0, 0);
    crosshair.style.display = 'block';
});
document.getElementById('restart-btn').addEventListener('click', () => { initGame(); lockOrShowMobileControls(); });
document.getElementById('play-again-btn').addEventListener('click', () => { initGame(); lockOrShowMobileControls(); });

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isSprinting = false;
let isGrounded = true;
let velocityY = 0;
let headBobTimer = 0;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

// Virtual Keyboard Logic
document.querySelectorAll('.kb-key').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState !== 'TYPING') return;
        let char = btn.innerText;
        if (char === 'SPACE') char = ' ';
        handleTypingCharacter(char);
    });
});

// Mobile Action Buttons
const sprintBtn = document.getElementById('mobile-sprint-btn');
const jumpBtn = document.getElementById('mobile-jump-btn');
if (sprintBtn) {
    sprintBtn.addEventListener('touchstart', (e) => { e.preventDefault(); isSprinting = true; sprintBtn.classList.add('active'); });
    sprintBtn.addEventListener('touchend', (e) => { e.preventDefault(); isSprinting = false; sprintBtn.classList.remove('active'); });
}
if (jumpBtn) {
    jumpBtn.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        jumpBtn.classList.add('active');
        if (isGrounded) { velocityY = 15; isGrounded = false; }
    });
    jumpBtn.addEventListener('touchend', (e) => { e.preventDefault(); jumpBtn.classList.remove('active'); });
}

let touchJoystickId = null;
let touchJoystickOrigin = {x: 0, y: 0};
let analogJoystick = {x: 0, y: 0};

const joyZone = document.getElementById('mobile-joystick-zone');
const joyBase = document.getElementById('mobile-joystick-base');
const joyStick = document.getElementById('mobile-joystick-stick');

joyZone.addEventListener('touchstart', e => {
    e.preventDefault();
    if (touchJoystickId !== null || gameState !== 'PLAYING') return;
    const touch = e.changedTouches[0];
    touchJoystickId = touch.identifier;
    
    const rect = joyBase.getBoundingClientRect();
    touchJoystickOrigin = { 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height / 2 
    };
    
    const dx = touch.clientX - touchJoystickOrigin.x;
    const dy = touch.clientY - touchJoystickOrigin.y;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 50);
    const angle = Math.atan2(dy, dx);
    joyStick.style.transform = `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px))`;
    analogJoystick.x = (Math.cos(angle)*dist) / 50;
    analogJoystick.y = (Math.sin(angle)*dist) / 50;
}, { passive: false });
joyZone.addEventListener('touchmove', e => {
    e.preventDefault();
    if (gameState !== 'PLAYING') return;
    for (let i=0; i<e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchJoystickId) {
            const dx = touch.clientX - touchJoystickOrigin.x;
            const dy = touch.clientY - touchJoystickOrigin.y;
            const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 50);
            const angle = Math.atan2(dy, dx);
            joyStick.style.transform = `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px))`;
            
            analogJoystick.x = (Math.cos(angle)*dist) / 50;
            analogJoystick.y = (Math.sin(angle)*dist) / 50;
        }
    }
}, { passive: false });
joyZone.addEventListener('touchend', e => {
    e.preventDefault();
    for (let i=0; i<e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchJoystickId) {
            touchJoystickId = null;
            joyStick.style.transform = 'translate(-50%, -50%)';
            analogJoystick.x = 0;
            analogJoystick.y = 0;
        }
    }
}, { passive: false });

let touchLookId = null;
let touchLookLast = {x: 0, y: 0};
const lookZone = document.getElementById('mobile-look-zone');

lookZone.addEventListener('touchstart', e => {
    e.preventDefault();
    if (touchLookId !== null || gameState !== 'PLAYING') return;
    const touch = e.changedTouches[0];
    touchLookId = touch.identifier;
    touchLookLast = { x: touch.clientX, y: touch.clientY };
}, { passive: false });
lookZone.addEventListener('touchmove', e => {
    e.preventDefault();
    if (gameState !== 'PLAYING') return;
    for (let i=0; i<e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchLookId) {
            const dx = touch.clientX - touchLookLast.x;
            const dy = touch.clientY - touchLookLast.y;
            touchLookLast = { x: touch.clientX, y: touch.clientY };
            
            const euler = new THREE.Euler(0, 0, 0, 'YXZ');
            euler.setFromQuaternion(camera.quaternion);
            euler.y -= dx * 0.005;
            euler.x -= dy * 0.005;
            euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.x));
            camera.quaternion.setFromEuler(euler);
        }
    }
}, { passive: false });
lookZone.addEventListener('touchend', e => {
    e.preventDefault();
    for (let i=0; i<e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchLookId) {
            touchLookId = null;
        }
    }
});

// ─── ENVIRONMENT ─────────────────────────────────────────────────────────────
const env = initEnvironment(scene, isMobile);
const { cloudObjects, water, waterMat, grassInstanced, bladeCount, dummy } = env;

// ─── OBJECTS ─────────────────────────────────────────────────────────────────

let offices = [];

// ─── OFFICE BUILDER ──────────────────────────────────────────────────────────

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

// ─── PEOPLE ──────────────────────────────────────────────────────────────────

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

// ─── SCENE POPULATION ────────────────────────────────────────────────────────

function createOffices() {
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

// ─── EFFECTS & FIREWORKS ────────────────────────────────────────────────────────

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

// ─── PROXIMITY AUDIO ─────────────────────────────────────────────────────────

const actorPhrases = [
    "I am an actor", "My height is six foot", "I can cry on cue",
    "Do you have a role for me?", "I have done theatre for five years",
    "I am very passionate", "Sir, one chance please", "I can do villain also",
    "My profile is updated", "I brought my portfolio"
];
const officePhrases = ["Fit", "Not fit"];
const nepoPhrases = ["Papa called them", "VIP entry bhai", "Straight to the director", "No audition needed"];

function spawnBuzzBubble(text, nearCenter = false) {
    if (!buzzLayer || (gameState !== 'PLAYING' && gameState !== 'CELEBRATING')) return;
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

setInterval(() => {
    if (gameState !== 'PLAYING' || !window.speechSynthesis) return;
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
    } else if (offices.length > 0) {
        let nearest = offices[0];
        let minDist = camera.position.distanceTo(nearest.group.position);
        for (let o of offices) {
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
    if (gameState !== 'PLAYING') return;
    const phrasePool = Math.random() > 0.78 ? nepoPhrases : actorPhrases;
    spawnBuzzBubble(phrasePool[Math.floor(Math.random() * phrasePool.length)], Math.random() > 0.65);
}, 900);

// ─── GAME LOGIC ──────────────────────────────────────────────────────────────

function initGame() {
    score = 0;
    officesCompleted = 0;
    if (buzzLayer) buzzLayer.innerHTML = '';
    document.body.classList.remove('shake-severe');
    updateHUD();
    initTypingUI();
    initTypingGame({
        setGameState: (s) => { gameState = s; },
        getGameState: () => gameState,
        addScore: (amount) => { score += amount; },
        incrementOfficesCompleted: () => { officesCompleted++; },
        getScore: () => score,
        getOfficesCompleted: () => officesCompleted,
        getTotalOffices: () => totalOffices,
        camera,
        controls,
        sounds,
        playSound,
        spawnPhysicsParticle,
        spawnFireworks,
        spawnBuzzBubble,
        updateHUD,
        updateTypingDisplay,
        changeScreen,
        isMobile
    });
    createOffices();
    initCrowds(scene, offices, NEPO_POSITIONS);
    initSundaramChapter(scene);
    camera.position.set(0, 2, 0);
    camera.rotation.set(0, 0, 0);
    camera.quaternion.set(0, 0, 0, 1);
    camera.rotation.order = 'YXZ';
    velocity.set(0, 0, 0);
    velocityY = 0;
    isGrounded = true;
    screens.gameOver.classList.remove('flashing');
    gameState = 'PLAYING';
    setState(STATES.EXPLORING);
    changeScreen(null);
    sounds.bgm.play().catch(() => {});
    sounds.chatter.play().catch(() => {});
    startAmbientForCharacter(getCharacter());
}

function changeScreen(screenId) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    
    if (isMobile) {
        const kb = document.getElementById('mobile-keyboard');
        const controls = document.getElementById('mobile-controls');
        if (screenId === 'typing-screen') {
            if (kb) kb.classList.remove('hidden');
            if (controls) controls.classList.add('hidden');
        } else {
            if (kb) kb.classList.add('hidden');
            if (controls && gameState === 'PLAYING') controls.classList.remove('hidden');
        }
    }

    if (screenId) {
        const s = document.getElementById(screenId);
        if (s) {
            s.classList.remove('hidden');
            void s.offsetWidth;
            s.classList.add('active');
        }
        hud.style.display = screenId === 'typing-screen' ? 'flex' : 'none';
        crosshair.style.display = 'none';
    } else {
        hud.style.display = 'flex';
        crosshair.style.display = 'block';
    }
}

function updateHUD() {
    hudScore.innerText = score;
    hudScore.classList.remove('score-pop');
    void hudScore.offsetWidth;
    hudScore.classList.add('score-pop');
    hudOffices.innerText = totalOffices - officesCompleted;
}

// ─── INPUT ───────────────────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
    if (gameState === 'PLAYING') {
        switch (e.code) {
            case 'ArrowUp': case 'KeyW': moveForward = true; break;
            case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
            case 'ArrowDown': case 'KeyS': moveBackward = true; break;
            case 'ArrowRight': case 'KeyD': moveRight = true; break;
            case 'ShiftLeft': case 'ShiftRight': isSprinting = true; break;
            case 'Space':
                if (isGrounded) { velocityY = 15; isGrounded = false; }
                break;
            case 'KeyE':
                interact();
                break;
        }
    } else if (gameState === 'TYPING') {
        if (e.key === ' ') e.preventDefault();
        handleTypingCharacter(e.key);
    }
});
document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'ArrowUp': case 'KeyW': moveForward = false; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
        case 'ArrowDown': case 'KeyS': moveBackward = false; break;
        case 'ArrowRight': case 'KeyD': moveRight = false; break;
        case 'ShiftLeft': case 'ShiftRight': isSprinting = false; break;
    }
});

// ─── ANIMATION HELPERS ───────────────────────────────────────────────────────


// --- PHYSICS PARTICLES ---
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

// ─── GAME LOOP ───────────────────────────────────────────────────────────────

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const dt = Math.min((time - prevTime) / 1000, 0.05);
    prevTime = time;

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
    
    // Update Lights
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

    // Drift clouds
    cloudObjects.forEach(c => {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > 300) c.position.x = -300;
    });

    if (gameState === 'PLAYING' && controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * dt;
        velocity.z -= velocity.z * 10.0 * dt;
        
        if (isMobile) {
            direction.x = analogJoystick.x;
            direction.z = -analogJoystick.y;
        } else {
            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize();
        }

        const speed = isSprinting ? 800.0 : 400.0;
        camera.fov += ((isSprinting ? 90 : 75) - camera.fov) * 5 * dt;
        camera.updateProjectionMatrix();

        if (isMobile) {
            velocity.z -= direction.z * speed * dt;
            velocity.x -= direction.x * speed * dt;
        } else {
            if (moveForward || moveBackward) velocity.z -= direction.z * speed * dt;
            if (moveLeft || moveRight) velocity.x -= direction.x * speed * dt;
        }

        controls.moveRight(-velocity.x * dt);
        controls.moveForward(-velocity.z * dt);

        velocityY -= 40 * dt; // gravity
        camera.position.y += velocityY * dt;
        if (camera.position.y < 2) {
            camera.position.y = 2;
            velocityY = 0;
            isGrounded = true;
        }

        // Head bobbing
        let speedFactor = Math.sqrt(velocity.x*velocity.x + velocity.z*velocity.z);
        if (speedFactor > 2 && isGrounded) {
            headBobTimer += dt * (isSprinting ? 15 : 10);
            camera.position.y = 2 + Math.sin(headBobTimer) * 0.2;
        } else if (isGrounded) {
            camera.position.y += (2 - camera.position.y) * 10 * dt;
        }

        camera.position.x = Math.max(-280, Math.min(280, camera.position.x));
        camera.position.z = Math.max(-280, Math.min(280, camera.position.z));

        for (let office of offices) {
            if (!office.completed) {
                const dist = camera.position.distanceTo(office.group.position);
                if (dist < 14) {
                    startTypingMinigame(office);
                    velocity.set(0, 0, 0);
                    moveForward = moveBackward = moveLeft = moveRight = false;
                    break;
                }
            }
        }
    } else if (gameState === 'TYPING') {
        updateTyping(dt);
    }

    // Crowds
    if (gameState === 'PLAYING' || gameState === 'TYPING') {
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
    offices.forEach(o => {
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

    // Update Sundaram chapter
    updateSundaramChapter(dt);

    // Update interaction system
    if (gameState === 'PLAYING') {
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
}

window.addEventListener('resize', () => {
    if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
    }
});

animate();

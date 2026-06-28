import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { initScene, getScene, getCamera, getRenderer } from './scene.js';
import { initLighting } from './lighting.js';
import { initEnvironment } from './environment.js';
import { initSundaramChapter } from './chapters/sundaram.js';
import { setState, STATES, getCharacter, setCharacter } from './state.js';
import { initAmbientSound, startAmbientForCharacter } from './audio/ambient.js';
import './ui/switcher-ui.js';
import './ui/subtitle-settings.js';
import { initTransitions } from './effects/transitions.js';
import { initTypingGame, startTypingMinigame } from './legacy/typing-game.js';
import { initCrowds } from './legacy/crowds.js';
import { initTypingUI, updateTypingDisplay } from './legacy/typing-ui.js';
import { initJournalUI } from './ui/journal-ui.js';
import { initSwitcherUI, resetChapterInit } from './ui/switcher-ui.js';
import { createOffices, getOffices, NEPO_POSITIONS } from './game/buildings.js';
import { initInput, getInputState, setInputState } from './game/input.js';
import { initGameLoop, animate, getGameState, setGameState, getScore, addScore, getOfficesCompleted, incrementOfficesCompleted, getTotalOffices, spawnFireworks, spawnPhysicsParticle } from './game/loop.js';
import { sounds, playSound } from './game/sounds.js';
import { initProximityAudio, spawnBuzzBubble, initProximityAudioIntervals } from './game/proximity-audio.js';
import { initPostProcessing, resizePostProcessing } from './effects/postProcessing.js';

// --- Post-Processing ---
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

// --- Device Detection ---
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;

// --- Audio Setup ---
function initAudio() { initAmbientSound(); }
document.addEventListener('click', () => initAudio(), { once: true });
document.addEventListener('touchstart', () => initAudio(), { once: true });

// ─── THREE.JS SETUP ──────────────────────────────────────────────────────────
initScene();
initLighting();
const scene = getScene();
const camera = getCamera();
const renderer = getRenderer();
initTransitions(document.body);

// Sky dome
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
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x87ceeb, isMobile ? 0.003 : 0.002);

// Sun
const sunGeo = new THREE.SphereGeometry(12, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff5c0 });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.set(180, 350, -300);
scene.add(sunMesh);

// Sun halos
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

composer = initPostProcessing(renderer, scene, camera, isMobile);

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
    if (getGameState() === 'START' || getGameState() === 'GAME_OVER' || getGameState() === 'VICTORY') {
        initGame();
        lockOrShowMobileControls();
    }
});
controls.addEventListener('unlock', () => {
    if (getGameState() === 'PLAYING') crosshair.style.display = 'none';
});
controls.addEventListener('lock', () => {
    camera.rotation.set(0, 0, 0);
    crosshair.style.display = 'block';
});
document.getElementById('restart-btn').addEventListener('click', () => { initGame(); lockOrShowMobileControls(); });
document.getElementById('play-again-btn').addEventListener('click', () => { initGame(); lockOrShowMobileControls(); });

// ─── ENVIRONMENT ─────────────────────────────────────────────────────────────
const env = initEnvironment(scene, isMobile);
const { cloudObjects, water, waterMat, grassInstanced, bladeCount, dummy } = env;

// ─── GAME LOGIC ──────────────────────────────────────────────────────────────
function initGame() {
    setGameState('START');
    if (buzzLayer) buzzLayer.innerHTML = '';
    document.body.classList.remove('shake-severe');
    updateHUD();
    initTypingUI();
    initJournalUI();
    initSwitcherUI();
    initTypingGame({
        setGameState, getGameState, addScore, incrementOfficesCompleted,
        getScore, getOfficesCompleted, getTotalOffices,
        camera, controls, sounds, playSound, spawnPhysicsParticle,
        spawnFireworks, spawnBuzzBubble, updateHUD, updateTypingDisplay, changeScreen, isMobile
    });
    createOffices(15);
    initCrowds(scene, getOffices(), NEPO_POSITIONS);
    resetChapterInit();
    initSundaramChapter(scene);
    camera.position.set(0, 2, 0);
    camera.rotation.set(0, 0, 0);
    camera.quaternion.set(0, 0, 0, 1);
    camera.rotation.order = 'YXZ';
    const inputState = getInputState();
    inputState.velocity.set(0, 0, 0);
    inputState.velocityY = 0;
    inputState.isGrounded = true;
    setInputState(inputState);
    screens.gameOver.classList.remove('flashing');
    setGameState('PLAYING');
    setState(STATES.EXPLORING);
    changeScreen(null);
    sounds.bgm.play().catch(() => {});
    sounds.chatter.play().catch(() => {});
    startAmbientForCharacter(getCharacter());
    initGameLoop({
        scene, camera, renderer, controls, composer, skyMat,
        cloudObjects, water, waterMat, grassInstanced, bladeCount, dummy,
        isMobile, startTypingMinigame
    });
    initInput({ gameStateGetter: getGameState, isMobile, camera });
    initProximityAudio({ camera, buzzLayer });
    initProximityAudioIntervals();
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
            if (controls && getGameState() === 'PLAYING') controls.classList.remove('hidden');
        }
    }
    if (screenId) {
        const s = document.getElementById(screenId);
        if (s) { s.classList.remove('hidden'); void s.offsetWidth; s.classList.add('active'); }
        hud.style.display = screenId === 'typing-screen' ? 'flex' : 'none';
        crosshair.style.display = 'none';
    } else {
        hud.style.display = 'flex';
        crosshair.style.display = 'block';
    }
}

function updateHUD() {
    hudScore.innerText = getScore();
    hudScore.classList.remove('score-pop');
    void hudScore.offsetWidth;
    hudScore.classList.add('score-pop');
    hudOffices.innerText = getTotalOffices() - getOfficesCompleted();
}

window.addEventListener('resize', () => {
    if (composer) resizePostProcessing(window.innerWidth, window.innerHeight);
});

animate();
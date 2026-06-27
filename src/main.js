import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { initScene, getScene, getCamera, getRenderer } from './scene.js';
import { initLighting, getAmbientLight, getHemiLight, getDirLight, getRimLight } from './lighting.js';

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
const typedTextEl = document.getElementById('typed-text');
const untypedTextEl = document.getElementById('untyped-text');
const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');
const goScore = document.getElementById('go-score');
const vicScore = document.getElementById('vic-score');

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

const TARGET_WORD = "nepo kid";
let typeIndex = 0;
let currentTimer = 0;
let maxTimer = 0;
let currentOffice = null;
let combo = 1.0;
let lastTypeTime = 0;
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

function playSound(snd) {
    snd.currentTime = 0;
    snd.play().catch(e => console.log("Audio play blocked"));
}

// ─── TEXTURE GENERATORS ───────────────────────────────────────────────────────

function createPavementTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    // Base warm concrete gradient
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
    grad.addColorStop(0, '#c4b8a6');
    grad.addColorStop(1, '#a8998a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    // Tile grid
    const tileW = 64, tileH = 44;
    ctx.strokeStyle = '#7a6e62';
    ctx.lineWidth = 3;
    for (let row = 0; row * tileH < 512; row++) {
        for (let col = 0; col * tileW < 512; col++) {
            const ox = row % 2 === 0 ? 0 : tileW / 2;
            const b = 0.9 + Math.random() * 0.15;
            ctx.fillStyle = `rgba(${Math.floor(195*b)},${Math.floor(182*b)},${Math.floor(165*b)},1)`;
            ctx.fillRect(col * tileW + ox + 2, row * tileH + 2, tileW - 4, tileH - 4);
            ctx.strokeRect(col * tileW + ox, row * tileH, tileW, tileH);
        }
    }
    // Grime dots
    for (let i = 0; i < 800; i++) {
        ctx.fillStyle = `rgba(60,50,40,${Math.random() * 0.12})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 5 + 1, Math.random() * 5 + 1);
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(18, 18);
    return tex;
}

function createPavementNormalMap() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#8080ff'; // flat normal
    ctx.fillRect(0, 0, 512, 512);
    const tileW = 40, tileH = 28;
    for (let row = 0; row * tileH < 512; row++) {
        for (let col = 0; col * tileW < 512; col++) {
            const ox = row % 2 === 0 ? 0 : tileW / 2;
            ctx.fillStyle = '#6060ff'; // mortar recessed
            ctx.fillRect(col * tileW + ox, row * tileH, tileW, tileH);
            ctx.fillStyle = '#8888ff'; // tile raised
            ctx.fillRect(col * tileW + ox + 2, row * tileH + 2, tileW - 4, tileH - 4);
        }
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(15, 15);
    return tex;
}

function createGrassTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    // Multi-tone base
    const gg = ctx.createLinearGradient(0, 0, 512, 512);
    gg.addColorStop(0, '#2a5e28');
    gg.addColorStop(0.5, '#337a30');
    gg.addColorStop(1, '#1f4d1e');
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, 512, 512);
    // Grass blade clusters (optimised count)
    for (let i = 0; i < 2500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const h = 5 + Math.random() * 10;
        const tone = Math.random();
        ctx.strokeStyle = tone > 0.6 ? '#4a9e46' : (tone > 0.3 ? '#2d7a2a' : '#1a5218');
        ctx.lineWidth = Math.random() * 1.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random()-0.5)*5, y - h);
        ctx.stroke();
    }
    // A few dirt patches
    for (let i = 0; i < 8; i++) {
        const rx = Math.random() * 512, ry = Math.random() * 512;
        const rg = ctx.createRadialGradient(rx, ry, 0, rx, ry, 25);
        rg.addColorStop(0, 'rgba(110,80,50,0.35)');
        rg.addColorStop(1, 'rgba(110,80,50,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(rx-30, ry-30, 60, 60);
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(45, 45);
    return tex;
}

function createBrickTexture(baseColor = '#c0634a') {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);
    const bw = 64, bh = 30;
    for (let row = 0; row * bh < 512; row++) {
        for (let col = 0; col * bw < 512; col++) {
            const ox = row % 2 === 0 ? 0 : bw / 2;
            const shade = 0.78 + Math.random() * 0.36;
            const hue = 10 + Math.random() * 15;
            const sat = 45 + Math.random() * 25;
            ctx.fillStyle = `hsl(${hue}, ${sat}%, ${Math.floor(30 * shade)}%)`;
            ctx.fillRect(col * bw + ox + 3, row * bh + 3, bw - 6, bh - 6);
        }
    }
    // Mortar
    ctx.strokeStyle = '#2a1e16';
    ctx.lineWidth = 4;
    for (let row = 0; row * bh < 512; row++) {
        for (let col = 0; col * bw < 512; col++) {
            const ox = row % 2 === 0 ? 0 : bw / 2;
            ctx.strokeRect(col * bw + ox, row * bh, bw, bh);
        }
    }
    // Weathering streaks
    for (let i = 0; i < 10; i++) {
        const sx = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + (Math.random()-0.5)*20, 512);
        ctx.strokeStyle = `rgba(0,0,0,${Math.random()*0.07})`;
        ctx.lineWidth = Math.random() * 4;
        ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    return tex;
}

function createBrickNormalMap() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 512, 512);
    const bw = 45, bh = 20;
    for (let row = 0; row * bh < 512; row++) {
        for (let col = 0; col * bw < 512; col++) {
            const ox = row % 2 === 0 ? 0 : bw / 2;
            ctx.fillStyle = '#9898ff'; // brick face slightly raised
            ctx.fillRect(col * bw + ox + 2, row * bh + 2, bw - 4, bh - 4);
            ctx.fillStyle = '#6060d8'; // mortar recessed
            ctx.fillRect(col * bw + ox, row * bh, bw, 2);
            ctx.fillRect(col * bw + ox, row * bh, 2, bh);
        }
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    return tex;
}

function createGlassTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    // Tinted glass base
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#0d1a2a');
    grad.addColorStop(1, '#1a2e45');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    const cols = 5, rows = 8;
    const pw = 512 / cols, ph = 512 / rows;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const lit = Math.random() > 0.25;
            const warmCool = Math.random() > 0.5;
            const rx = c * pw + 8, ry = r * ph + 8, rw = pw - 16, rh = ph - 16;
            if (lit) {
                const wg = ctx.createLinearGradient(rx, ry, rx, ry + rh);
                if (warmCool) {
                    wg.addColorStop(0, `rgba(255,${210 + Math.random()*40},${100 + Math.random()*80},0.85)`);
                    wg.addColorStop(1, `rgba(255,${180 + Math.random()*40},60,0.6)`);
                } else {
                    wg.addColorStop(0, `rgba(180,220,${255},0.7)`);
                    wg.addColorStop(1, `rgba(120,180,255,0.5)`);
                }
                ctx.fillStyle = wg;
            } else {
                ctx.fillStyle = 'rgba(10,25,50,0.9)';
            }
            ctx.fillRect(rx, ry, rw, rh);
            // Glass sheen highlight
            ctx.fillStyle = 'rgba(220,240,255,0.12)';
            ctx.fillRect(rx, ry, rw * 0.3, rh);
            // Reflection streak
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(rx + rw * 0.1, ry, 3, rh);
        }
    }
    return new THREE.CanvasTexture(cvs);
}

function createNeonSignTexture(text, neonColor = '#ff0055', bgColor = '#0a0010') {
    const cvs = document.createElement('canvas');
    cvs.width = 1024; cvs.height = 256;
    const ctx = cvs.getContext('2d');
    
    // Parody Logos for specific production houses
    if (text === 'Dharma Prod.') {
        ctx.fillStyle = '#0a1a3a'; // Deep blue
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 110px "Times New Roman", serif';
        ctx.fillText('DHARMA', 512, 110);
        ctx.font = 'italic 40px "Times New Roman", serif';
        ctx.fillText('PRODUCTIONS', 512, 180);
        ctx.font = '50px Arial';
        ctx.fillText('★', 512, 35);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'YRF Studios') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#cc0000'; // Red stroke
        ctx.fillRect(300, 60, 424, 136);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'italic bold 110px Arial';
        ctx.fillText('Y R F', 512, 135);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Netflex') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#E50914'; // Netflix Red
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 140px "Impact", sans-serif';
        ctx.fillText('NETFLEX', 512, 128);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Warner Bros') {
        ctx.fillStyle = '#008ae6';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 90px "Times New Roman", serif';
        ctx.fillText('WARNER BROS.', 512, 128);
        // Add a shield outline
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, 1004, 236);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Excel Ent') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#cc0000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 150px Arial';
        ctx.fillText('E', 220, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = '50px Arial';
        ctx.fillText('EXCEL', 340, 90);
        ctx.fillText('ENTERTAINMENT', 340, 160);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'A25') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 160px sans-serif';
        ctx.fillText('A25', 512, 128);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Pear TV') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 100px sans-serif';
        ctx.fillText('🍐 tv+', 512, 128);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Paramount') {
        ctx.fillStyle = '#003366';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 80px "Times New Roman", serif';
        ctx.fillText('Paramount', 512, 140);
        ctx.font = '50px Arial';
        ctx.fillText('🏔️', 512, 60);
        return new THREE.CanvasTexture(cvs);
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1024, 256);

    // Neon glow effect — layered shadows
    ctx.save();
    ctx.shadowColor = neonColor;
    for (let i = 0; i < 4; i++) {
        ctx.shadowBlur = 15 + i * 20;
        ctx.fillStyle = neonColor;
        ctx.font = `bold ${i === 0 ? 100 : 96}px 'Arial Black', Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 512, 128);
    }
    ctx.restore();

    // Neon border tube
    ctx.strokeStyle = neonColor;
    ctx.lineWidth = 10;
    ctx.shadowColor = neonColor;
    ctx.shadowBlur = 30;
    ctx.strokeRect(16, 16, 992, 224);

    return new THREE.CanvasTexture(cvs);
}

function createNepoSignTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 768; cvs.height = 300;
    const ctx = cvs.getContext('2d');

    // Deep velvet background
    ctx.fillStyle = '#1a0008';
    ctx.fillRect(0, 0, 768, 300);

    // Gold border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 10;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 18;
    ctx.strokeRect(8, 8, 752, 284);
    ctx.shadowBlur = 0;

    // Crown emoji at top
    ctx.font = 'bold 48px Arial Black, Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a0008';
    ctx.fillRect(40, 36, 688, 48);
    ctx.fillStyle = '#FFD700';
    ctx.fillText('VIP BLOODLINE ENTRY', 384, 68);
    ctx.fillText('👑', 256, 52);

    // Main text — gold neon
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 30px Arial Black, Arial';
    ctx.fillText('NEPO KIDS ONLY', 256, 100);
    ctx.shadowBlur = 0;

    // Sub text — red
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('🚫 NO TALENT ALLOWED', 256, 140);
    ctx.shadowBlur = 0;

    // Dogs line
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '18px Arial';
    ctx.fillText('(nepo dogs welcome)', 256, 175);

    ctx.fillStyle = '#1a0008';
    ctx.fillRect(28, 28, 712, 244);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.strokeRect(34, 34, 700, 232);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 46px Arial Black, Arial';
    ctx.fillText('ONLY STAR KIDS', 384, 92);
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 32px Arial Black, Arial';
    ctx.fillText('AND THEIR DOGS ALLOWED', 384, 154);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f8f3d4';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('No audition. No queue. No problem.', 384, 218);

    return new THREE.CanvasTexture(cvs);
}

function createAllowedSignTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#071014';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(18, 18, 476, 476);
    ctx.fillStyle = '#13080d';
    ctx.fillRect(34, 34, 444, 444);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 44px Arial Black, Arial';
    ctx.fillText('ENTRY', 256, 96);
    ctx.fillText('RESTRICTED', 256, 148);
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 31px Arial Black, Arial';
    ctx.fillText('STAR KIDS ONLY', 256, 236);
    ctx.fillText('+ THEIR DOGS', 256, 286);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial';
    ctx.fillText('regular actors wait outside', 256, 362);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(180, 420, 22, 0, Math.PI * 2);
    ctx.arc(326, 420, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(180, 410, 146, 20);
    return new THREE.CanvasTexture(cvs);
}

function createRoadTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 256; cvs.height = 256;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, 256, 256);
    // dashed centre line
    ctx.strokeStyle = '#FFEE00';
    ctx.lineWidth = 6;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(128, 0); ctx.lineTo(128, 256);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 8);
    return tex;
}

// --- MATERIALS LIBRARY ---
const MAT = {
    BRICK: (color) => new THREE.MeshStandardMaterial({
        map: createBrickTexture(color || '#8B4513'),
        normalMap: createBrickNormalMap(),
        normalScale: new THREE.Vector2(2.0, 2.0),
        roughness: 0.85,
        metalness: 0.02,
        envMapIntensity: 0.4
    }),
    GLASS: () => new THREE.MeshStandardMaterial({
        map: createGlassTexture(),
        bumpMap: createGlassTexture(),
        bumpScale: 0.05,
        roughness: 0.05,
        metalness: 0.6,
        emissiveMap: createGlassTexture(),
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.85
    }),
    ROAD: () => new THREE.MeshStandardMaterial({
        map: createRoadTexture(),
        bumpMap: createRoadTexture(),
        bumpScale: 0.1,
        roughness: 0.75,
        metalness: 0.0
    }),
    PAVEMENT: () => new THREE.MeshStandardMaterial({
        map: createPavementTexture(),
        bumpMap: createPavementTexture(),
        bumpScale: 0.15,
        roughness: 0.6,
        metalness: 0.03
    }),
    GRASS: () => new THREE.MeshStandardMaterial({
        map: createGrassTexture(),
        bumpMap: createGrassTexture(),
        bumpScale: 0.5,
        roughness: 0.92,
        metalness: 0.0
    }),
    NEON: (color) => new THREE.MeshStandardMaterial({
        color: color || 0xff0000,
        emissive: color || 0xff0000,
        emissiveIntensity: 2.0,
        roughness: 0.2,
        metalness: 0.8
    }),
    LAMP_POST: () => new THREE.MeshStandardMaterial({
        color: 0x334455,
        metalness: 0.85,
        roughness: 0.25
    }),
    LAMP_LENS: () => new THREE.MeshStandardMaterial({
        color: 0xffe8a0,
        emissive: 0xffe880,
        emissiveIntensity: 1.8,
        roughness: 0.1,
        metalness: 0.0
    }),
    CARPET: (color) => new THREE.MeshStandardMaterial({
        color: color || 0x8B0000,
        roughness: 0.95,
        metalness: 0.0
    }),
    METAL: () => new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.15
    }),
    WOOD: () => new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.7,
        metalness: 0.0
    })
};

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
        topColor: { value: new THREE.Color(0x0a1628) },
        horizonColor: { value: new THREE.Color(0x7ec8e3) },
        bottomColor: { value: new THREE.Color(0xf5d7a3) },
        offset: { value: 20 },
        exponent: { value: 0.5 }
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
scene.background = null; // Remove canvas texture background
scene.fog = new THREE.FogExp2(0x7ec8e3, isMobile ? 0.006 : 0.0035);

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

// Post-processing setup
function initPostProcessing() {
    composer = new EffectComposer(renderer);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom for emissive glow (neon signs, sun, lamps)
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        isMobile ? 0.3 : 0.6,  // strength
        0.4,  // radius
        0.85  // threshold
    );
    composer.addPass(bloomPass);
    
    // FXAA anti-aliasing
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(fxaaPass);
}

initPostProcessing();


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

// Grass - instanced blades for natural look
const grassGroup = new THREE.Group();
const bladeCount = isMobile ? 3000 : 8000;

// Blade geometry - simple triangle
const bladeGeo = new THREE.BufferGeometry();
const bladeVertices = new Float32Array([
    -0.1, 0, 0,
     0.1, 0, 0,
     0.0, 0.8, 0
]);
const bladeUvs = new Float32Array([0,0, 1,0, 0.5,1]);
bladeGeo.setAttribute('position', new THREE.BufferAttribute(bladeVertices, 3));
bladeGeo.setAttribute('uv', new THREE.BufferAttribute(bladeUvs, 2));

const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x4a7c3f,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
});

const grassInstanced = new THREE.InstancedMesh(bladeGeo, bladeMat, bladeCount);
const dummy = new THREE.Object3D();
const grassColors = [];

for (let i = 0; i < bladeCount; i++) {
    const x = (Math.random() - 0.5) * 580;
    const z = (Math.random() - 0.5) * 580;
    const scale = 0.5 + Math.random() * 1.0;
    const rotation = Math.random() * Math.PI;
    
    // Skip blades that would be on the plaza or roads
    if (Math.abs(x) < 65 && Math.abs(z) < 65) continue;
    if (Math.abs(x) < 8 && Math.abs(z) < 155) continue;
    if (Math.abs(z) < 8 && Math.abs(x) < 155) continue;
    
    dummy.position.set(x, scale * 0.4, z);
    dummy.rotation.set(0, rotation, (Math.random() - 0.5) * 0.3);
    dummy.scale.set(1, scale, 1);
    dummy.updateMatrix();
    grassInstanced.setMatrixAt(i, dummy.matrix);
    
    // Slight color variation
    const shade = 0.8 + Math.random() * 0.4;
    grassInstanced.setColorAt(i, new THREE.Color(0.29 * shade, 0.49 * shade, 0.25 * shade));
}

grassInstanced.instanceMatrix.needsUpdate = true;
if (grassInstanced.instanceColor) grassInstanced.instanceColor.needsUpdate = true;
grassInstanced.receiveShadow = true;
scene.add(grassInstanced);

// Central pavement plaza
const paveTex = createPavementTexture();
const paveNorm = createPavementNormalMap();
const plazaGeo = new THREE.PlaneGeometry(120, 120);
// Pavement bump (cheaper than normal map)
const plazaMat = MAT.PAVEMENT();
const plaza = new THREE.Mesh(plazaGeo, plazaMat);
plaza.rotation.x = -Math.PI / 2;
plaza.position.y = 0.02;
plaza.receiveShadow = true;
scene.add(plaza);

// Water feature in plaza
const waterGeo = new THREE.PlaneGeometry(30, 30, 32, 32);
const waterMat = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x1a5ea8) },
        color2: { value: new THREE.Color(0x7ec8e3) },
        opacity: { value: 0.7 }
    },
    vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        void main() {
            vUv = uv;
            vec3 pos = position;
            float wave1 = sin(pos.x * 2.0 + time * 1.5) * 0.15;
            float wave2 = sin(pos.y * 3.0 + time * 1.2) * 0.1;
            pos.z = wave1 + wave2;
            vElevation = pos.z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        varying vec2 vUv;
        varying float vElevation;
        void main() {
            float mixFactor = (vElevation + 0.25) * 2.0;
            vec3 color = mix(color1, color2, mixFactor);
            // Add subtle sparkle
            float sparkle = pow(sin(vUv.x * 50.0 + vUv.y * 50.0) * 0.5 + 0.5, 8.0);
            color += vec3(sparkle * 0.3);
            gl_FragColor = vec4(color, opacity);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide
});

const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI / 2;
water.position.set(0, 0.08, 0);
scene.add(water);

// Roads radiating out from centre
function addRoad(x, z, w, h) {
    const roadTex = createRoadTexture();
    const rGeo = new THREE.PlaneGeometry(w, h);
    const rMat = MAT.ROAD();
    const r = new THREE.Mesh(rGeo, rMat);
    r.rotation.x = -Math.PI / 2;
    r.position.set(x, 0.01, z);
    r.receiveShadow = true;
    scene.add(r);
}
addRoad(0, 0, 12, 300);   // N-S road
addRoad(0, 0, 300, 12);   // E-W road

// Street lamps — emissive glow only, NO point lights
function addLamp(x, z) {
    const postMat = MAT.LAMP_POST();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 9, 6), postMat);
    post.position.set(x, 4.5, z);
    post.castShadow = true;
    scene.add(post);

    const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x1a2530, metalness: 0.75, roughness: 0.3 })
    );
    lampHead.position.set(x + 1, 9.0, z);
    scene.add(lampHead);

    // Emissive lens — looks like it glows, costs nothing
    const lens = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.3, 0.7),
        MAT.LAMP_LENS()
    );
    lens.position.set(x + 1, 8.7, z);
    scene.add(lens);

    // Volumetric dust cone (Particle System)
    if (!isMobile) {
        const dustGeo = new THREE.BufferGeometry();
        const dustCount = 40;
        const positions = new Float32Array(dustCount * 3);
        for(let i = 0; i < dustCount; i++) {
            positions[i*3] = (Math.random() - 0.5) * 4;
            positions[i*3+1] = Math.random() * -8; // downwards
            positions[i*3+2] = (Math.random() - 0.5) * 4;
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const dustMat = new THREE.PointsMaterial({
            color: 0xffe8a0,
            size: 0.15,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const dust = new THREE.Points(dustGeo, dustMat);
        dust.position.set(x + 1, 8.7, z);
        
        // Custom animation function stored in userData
        dust.userData = {
            update: (time) => {
                const pos = dust.geometry.attributes.position.array;
                for(let i=0; i<dustCount; i++) {
                    pos[i*3+1] -= 0.02; // fall
                    pos[i*3] += Math.sin(time + i) * 0.01; // sway
                    if (pos[i*3+1] < -8) {
                        pos[i*3+1] = 0;
                    }
                }
                dust.geometry.attributes.position.needsUpdate = true;
            }
        };
        scene.add(dust);
        if (!window.dustSystems) window.dustSystems = [];
        window.dustSystems.push(dust);
    }
}

for (let i = -120; i <= 120; i += 40) {
    addLamp(8, i);
    addLamp(-8, i);
    addLamp(i, 8);
    addLamp(i, -8);
}

// Clouds — fluffy PBR clouds
function createCloudMesh() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true,
        transparent: true, 
        opacity: 0.9 
    });
    const puffs = [
        [0, 0, 0, 16, 8, 12],
        [10, 2, 2, 14, 6, 10],
        [-10, 1, -2, 12, 6, 9],
        [4, 4, 3, 10, 6, 8],
        [-5, -2, 5, 8, 5, 8],
    ];
    puffs.forEach(([px, py, pz, sw, sh, sd]) => {
        // Icosahedron geometry gives nice low-poly look with flatShading
        const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat);
        sphere.scale.set(sw, sh, sd);
        sphere.position.set(px, py, pz);
        sphere.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        g.add(sphere);
    });
    return g;
}
const cloudObjects = [];
const numClouds = isMobile ? 12 : 25;
for (let i = 0; i < numClouds; i++) {
    const cloud = createCloudMesh();
    cloud.position.set(
        (Math.random() - 0.5) * 800,
        120 + Math.random() * 80,
        (Math.random() - 0.5) * 800
    );
    cloud.rotation.y = Math.random() * Math.PI;
    const scale = 0.5 + Math.random() * 1.5;
    cloud.scale.set(scale, scale, scale);
    cloud.userData.speed = 0.2 + Math.random() * 0.8;
    scene.add(cloud);
    cloudObjects.push(cloud);
}

// ─── OBJECTS ─────────────────────────────────────────────────────────────────

let offices = [];
let crowds = [];
let nepoDogs = [];
let nepoPeople = [];
let nepoCrowds = []; // nepo kids walking into nepo houses

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
        normalScale: new THREE.Vector2(2.0, 2.0),
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

const skinPalette = [0xf0c7a1, 0xd9a16e, 0xb97a52, 0x8f563b, 0x5c3528, 0x3b241c];
const hairPalette = [0x14100d, 0x2a1b13, 0x4a2c18, 0x6a4a2f, 0xb48a54, 0xeeeeee];
const actorClothes = [0x1f6f8b, 0xe76f51, 0x2a9d8f, 0xf4a261, 0x6d597a, 0x355070, 0x7f5539, 0x3a5a40];
const nepoClothes = [0xffd166, 0xf72585, 0x7209b7, 0x0d1b2a, 0xffffff, 0x06d6a0];
const mutedPants = [0x20242b, 0x2f3e46, 0x4a4e69, 0x3d405b, 0x22223b, 0x5c677d];

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

function createPersonMesh(isNepo = false) {
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

function createDogMesh() {
    const dog = new THREE.Group();

    const furColor = new THREE.Color().setHSL(0.08 + Math.random() * 0.1, 0.5, 0.4 + Math.random() * 0.3);
    const furMat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.9 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.5, roughness: 0.2 });

    // Body — stubby, low-slung
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.9), furMat);
    body.position.y = 0.9;
    body.castShadow = true;
    dog.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.9), furMat);
    head.position.set(0.9, 1.4, 0);
    head.castShadow = true;
    dog.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.6), furMat);
    snout.position.set(1.3, 1.2, 0);
    dog.add(snout);

    // Nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.15), blackMat);
    nose.position.set(1.55, 1.3, 0);
    dog.add(nose);

    // Ears — floppy
    [-0.35, 0.35].forEach(ez => {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.2), furMat);
        ear.position.set(0.7, 1.75, ez);
        ear.rotation.z = ez > 0 ? 0.3 : -0.3;
        dog.add(ear);
    });

    // Tiny sunglasses (nepo dog flex)
    const shades = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 0.12), blackMat);
    shades.position.set(1.1, 1.45, 0.48);
    dog.add(shades);

    // Gold collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 6, 12), goldMat);
    collar.position.set(0.55, 1.3, 0);
    collar.rotation.y = Math.PI / 2;
    dog.add(collar);

    // Legs — 4 stumpy ones
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

    // Tail
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 0.25), furMat);
    tail.position.set(-0.95, 1.2, 0);
    tail.rotation.z = -0.5;
    dog.add(tail);
    dog.userData.tail = tail;

    dog.userData = {
        legs: dogLegs,
        tail: tail,
        walkTime: Math.random() * 100
    };

    return dog;
}

// ─── SCENE POPULATION ────────────────────────────────────────────────────────

function createOffices() {
    offices.forEach(o => scene.remove(o.group));
    offices = [];
    nepoDogs.forEach(d => scene.remove(d.mesh));
    nepoDogs = [];

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
    nepoCrowds.forEach(n => scene.remove(n.mesh));
    nepoCrowds = [];

    const nepoPositions = [
        [80, 60], [-80, 60], [0, 120], [80, -80], [-80, -80]
    ];

    NEPO_HOUSES.forEach((config, i) => {
        const [nx, nz] = nepoPositions[i] || [100 + i * 30, 100];
        const { group, bh } = createOfficeBuilding(config, true);
        group.position.set(nx, bh / 2, nz);
        group.rotation.y = Math.atan2(-nx, -nz); // face towards centre
        scene.add(group);

        // Spawn nepo kids walking in
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

        // Nepo dogs!
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

function createCrowds() {
    crowds.forEach(c => scene.remove(c.mesh));
    crowds = [];

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

    const roll = Math.random();
    if (roll > 0.6 && crowds.length > 0) {
        let nearest = crowds[0];
        let minDist = camera.position.distanceTo(nearest.mesh.position);
        for (let c of crowds) {
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
    } else if (roll > 0.3 && nepoCrowds.length > 0) {
        let nearest = nepoCrowds[0];
        let minDist = camera.position.distanceTo(nearest.mesh.position);
        for (let n of nepoCrowds) {
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
    updateHUD();
    createOffices();
    createCrowds();
    camera.position.set(0, 2, 0);
    velocity.set(0, 0, 0);
    screens.gameOver.classList.remove('flashing');
    gameState = 'PLAYING';
    changeScreen(null);
    sounds.bgm.play().catch(() => {});
    sounds.chatter.play().catch(() => {});
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

function startTypingMinigame(office) {
    gameState = 'TYPING';
    currentOffice = office;
    typeIndex = 0;
    maxTimer = office.timeLimit;
    currentTimer = maxTimer;
    combo = 1.0;
    lastTypeTime = performance.now();
    const ct = document.getElementById('combo-text');
    if(ct) ct.innerText = 'x1.0';
    updateTypingUI();

        const front = new THREE.Vector3(0, 0, -2).applyQuaternion(camera.quaternion);
        const spawnPos = camera.position.clone().add(front);
        spawnPhysicsParticle(spawnPos.x, spawnPos.y - 0.5, spawnPos.z);

    changeScreen('typing-screen');
    if (isMobile) {
        document.getElementById('mobile-keyboard').classList.remove('hidden');
        document.getElementById('mobile-controls').classList.add('hidden'); // hide joystick
    }
}

function updateTypingUI() {
    typedTextEl.innerHTML = TARGET_WORD.substring(0, typeIndex).split('').map(c => `<span class="letter-pop">${c}</span>`).join('');
    untypedTextEl.innerText = TARGET_WORD.substring(typeIndex);
    let pct = (currentTimer / maxTimer) * 100;
    timerBar.style.width = pct + '%';
    timerText.innerText = currentTimer.toFixed(1) + 's';
    if (currentTimer <= 3.0) {
        timerText.classList.add('timer-warning');
    } else {
        timerText.classList.remove('timer-warning');
    }
    timerBar.style.background = pct < 30 ? '#ff4757' : pct < 60 ? '#ffa502' : 'linear-gradient(90deg, #ff4757, #ffa502, #2ed573)';
}

function handleGameOver() {
    gameState = 'GAME_OVER';
    playSound(sounds.fail);
    goScore.innerText = score;
    controls.unlock();
    changeScreen('game-over-screen');
    screens.gameOver.classList.add('flashing');
    
    // Massive Screen Shake
    const body = document.body;
    body.classList.remove('shake-severe');
    void body.offsetWidth;
    body.classList.add('shake-severe');
}

const winPhrases = [
    {
        type: "producer",
        text: "The producer called. Private meeting inside.",
        subtitle: "The door shuts. The saxophone understands the assignment.",
        sound: "sensual"
    },
    {
        type: "vanity",
        text: "Sir, your vanity van is ready!",
        subtitle: "Coffee, umbrella, script, and four people saying sir at once.",
        sound: "victorious"
    },
    {
        type: "script",
        text: "Sir, the bound script has arrived!",
        subtitle: "Everyone circles you like the industry has found its prince.",
        sound: "victorious"
    }
];

function showCelebrationScene(chosen, afterScene) {
    gameState = 'CELEBRATING';
    const title = document.getElementById('celebration-title');
    const subtitle = document.getElementById('celebration-subtitle');
    const producerScene = document.getElementById('producer-scene');
    const entourageScene = document.getElementById('entourage-scene');
    const sirChorus = document.getElementById('sir-chorus');

    if (title) title.innerText = chosen.text;
    if (subtitle) subtitle.innerText = chosen.subtitle;
    [producerScene, entourageScene].forEach(sceneEl => {
        if (sceneEl) sceneEl.classList.add('hidden');
    });
    if (sirChorus) sirChorus.style.display = chosen.type === 'producer' ? 'none' : 'block';

    if (chosen.type === 'producer' && producerScene) producerScene.classList.remove('hidden');
    if (chosen.type !== 'producer' && entourageScene) entourageScene.classList.remove('hidden');

    sounds.bgm.pause();
    sounds.chatter.volume = chosen.type === 'producer' ? 0.08 : 0.25;
    if (chosen.type === 'producer') {
        sounds.sensual.currentTime = 0;
        sounds.sensual.play().catch(() => {});
    } else {
        playSound(sounds.victorious);
        ["Sir!", "Coffee, sir!", "Script, sir!", "Umbrella, sir!"].forEach((line, i) => {
            setTimeout(() => {
                spawnBuzzBubble(line, true);
                if (window.speechSynthesis) {
                    const u = new SpeechSynthesisUtterance(line);
                    u.volume = 0.9; u.pitch = 0.9 + Math.random() * 0.4; u.rate = 0.9 + Math.random() * 0.2;
                    window.speechSynthesis.speak(u);
                }
            }, i * 650);
        });
    }

    changeScreen('celebration-screen');
    setTimeout(() => {
        sounds.sensual.pause();
        sounds.chatter.volume = 0.4;
        sounds.bgm.play().catch(() => {});
        afterScene();
        
        if (chosen.type === 'producer') {
            setTimeout(() => {
                spawnBuzzBubble("My ass hurts.", false);
                if (window.speechSynthesis) {
                    const u = new SpeechSynthesisUtterance("My ass hurts.");
                    u.pitch = 0.9;
                    window.speechSynthesis.speak(u);
                }
            }, 500); // Slight delay after scene transition
        }
    }, chosen.type === 'producer' ? 9200 : 7600);
}

function winMinigame() {
    const chosen = winPhrases[Math.floor(Math.random() * winPhrases.length)];
    
    currentOffice.completed = true;
    currentOffice.isWinning = true;

    spawnFireworks(currentOffice.group.position.x, currentOffice.group.position.y + 10, currentOffice.group.position.z);
    
    score += Math.floor(100 * combo);
    officesCompleted++;
    updateHUD();

    showCelebrationScene(chosen, () => {
        if (officesCompleted >= totalOffices) {
            gameState = 'VICTORY';
            vicScore.innerText = score;
            controls.unlock();
            changeScreen('victory-screen');
        } else {
            gameState = 'PLAYING';
            changeScreen(null);
        }
    });
}

// ─── INPUT ───────────────────────────────────────────────────────────────────

function handleTypingCharacter(key) {
    if (gameState !== 'TYPING') return;
    let targetChar = TARGET_WORD[typeIndex];
    if (key.toLowerCase() === targetChar.toLowerCase()) {
        typeIndex++;
        
        // Combo System
        const now = performance.now();
        if (now - lastTypeTime < 400) {
            combo += 0.1;
            const ct = document.getElementById('combo-text');
            if(ct) {
                ct.innerText = 'x' + combo.toFixed(1);
                ct.classList.remove('combo-pop');
                void ct.offsetWidth;
                ct.classList.add('combo-pop');
            }
        } else {
            combo = 1.0;
            const ct = document.getElementById('combo-text');
            if(ct) ct.innerText = 'x1.0';
        }
        lastTypeTime = now;
        
        sounds.type.playbackRate = Math.min(2.0, 1.0 + (combo - 1) * 0.1);
        playSound(sounds.type);
        
        // Screen Shake
        const gc = document.getElementById('game-container');
        if(gc) {
            gc.classList.remove('shake');
            void gc.offsetWidth;
            gc.classList.add('shake');
        }
        
        updateTypingUI();
        if (typeIndex >= TARGET_WORD.length) winMinigame();
    }
}

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

function animatePerson(c, dt) {
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

function animateDog(d, dt) {
    const dx = d.targetX - d.mesh.position.x;
    const dz = d.targetZ - d.mesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 5) {
        const speed = 3 + Math.sin(d.mesh.userData.walkTime * 3) * 0.5; // waddle speed
        d.vx = (dx / dist) * speed;
        d.vz = (dz / dist) * speed;
    } else {
        // Arrived — mill around
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
    // Wag tail
    if (ud.tail) ud.tail.rotation.z = -0.5 + Math.sin(wt * 8) * 0.4;
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
        _dirLight.intensity = Math.max(0, Math.sin(dayTime)) * 1.8;
    }
    if (_ambientLight) {
        _ambientLight.intensity = Math.max(0.1, blend * 0.35);
    }
    if (_hemiLight) {
        _hemiLight.intensity = Math.max(0.1, blend * 0.5);
    }
    if (_rimLight) {
        _rimLight.intensity = Math.max(0.1, blend * 0.6);
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
        currentTimer -= dt;
        if (currentTimer <= 0) {
            currentTimer = 0;
            updateTypingUI();
            handleGameOver();
        } else {
            updateTypingUI();
        }
    }

    // Normal crowd
    if (gameState === 'PLAYING' || gameState === 'TYPING') {
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

        // Nepo kids walk toward their production house
        nepoCrowds.forEach(n => {
            const dx = n.targetX - n.mesh.position.x;
            const dz = n.targetZ - n.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 8) {
                const spd = 5;
                n.vx = (dx / dist) * spd;
                n.vz = (dz / dist) * spd;
            } else {
                // Loop back out and re-enter (nepo kids never stop)
                n.mesh.position.x = n.targetX + (Math.random() - 0.5) * 40;
                n.mesh.position.z = n.targetZ + (Math.random() - 0.5) * 40;
                n.vx = 0; n.vz = 0;
            }
            n.mesh.position.x += n.vx * dt;
            n.mesh.position.z += n.vz * dt;
            animatePerson(n, dt);
        });

        // Nepo dogs waddle in
        nepoDogs.forEach(d => animateDog(d, dt));
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

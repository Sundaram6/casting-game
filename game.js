// --- UI Elements ---
const screens = {
    start: document.getElementById('start-screen'),
    typing: document.getElementById('typing-screen'),
    gameOver: document.getElementById('game-over-screen'),
    victory: document.getElementById('victory-screen')
};

const crosshair = document.getElementById('crosshair');
const hud = document.getElementById('hud');
const hudScore = document.getElementById('hud-score');
const hudOffices = document.getElementById('hud-offices');
const typedTextEl = document.getElementById('typed-text');
const untypedTextEl = document.getElementById('untyped-text');
const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');
const goScore = document.getElementById('go-score');
const vicScore = document.getElementById('vic-score');

// --- Game State ---
let gameState = 'START';
let score = 0;
let totalOffices = 15;
let officesCompleted = 0;

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

function playSound(snd) {
    snd.currentTime = 0;
    snd.play().catch(e => console.log("Audio play blocked"));
}

// ─── TEXTURE GENERATORS ───────────────────────────────────────────────────────

function createPavementTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#b0a898';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#887e72';
    ctx.lineWidth = 3;
    const tileW = 64, tileH = 48;
    for (let row = 0; row * tileH < 512; row++) {
        for (let col = 0; col * tileW < 512; col++) {
            const ox = row % 2 === 0 ? 0 : tileW / 2;
            ctx.strokeRect(col * tileW + ox, row * tileH, tileW, tileH);
        }
    }
    // subtle grime dots
    for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = `rgba(80,70,60,${Math.random() * 0.2})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    return tex;
}

function createGrassTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#2d6a30';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#367c39' : '#245426';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 12);
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(50, 50);
    return tex;
}

function createBrickTexture(baseColor = '#c0634a') {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    const bc = new THREE.Color(baseColor);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);
    const bw = 64, bh = 32;
    ctx.strokeStyle = '#33211a';
    ctx.lineWidth = 4;
    for (let row = 0; row * bh < 512; row++) {
        for (let col = 0; col * bw < 512; col++) {
            const ox = row % 2 === 0 ? 0 : bw / 2;
            // slight shade variation
            const shade = 0.85 + Math.random() * 0.25;
            ctx.fillStyle = `hsl(${15 + Math.random() * 10}, ${50 + Math.random() * 20}%, ${35 * shade}%)`;
            ctx.fillRect(col * bw + ox + 2, row * bh + 2, bw - 4, bh - 4);
            ctx.strokeRect(col * bw + ox, row * bh, bw, bh);
        }
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 4);
    return tex;
}

function createGlassTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 256; cvs.height = 256;
    const ctx = cvs.getContext('2d');
    // deep blue-grey base
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(0, 0, 256, 256);
    // window grid
    const cols = 4, rows = 6;
    const pw = 256 / cols, ph = 256 / rows;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const lit = Math.random() > 0.3;
            ctx.fillStyle = lit
                ? `rgba(255,${200 + Math.random() * 55},${80 + Math.random() * 80},0.9)`
                : 'rgba(20,40,80,0.8)';
            ctx.fillRect(c * pw + 6, r * ph + 6, pw - 12, ph - 12);
            // glass sheen
            ctx.fillStyle = 'rgba(200,230,255,0.07)';
            ctx.fillRect(c * pw + 6, r * ph + 6, pw / 3, ph - 12);
        }
    }
    return new THREE.CanvasTexture(cvs);
}

function createNeonSignTexture(text, neonColor = '#ff0055', bgColor = '#0a0010') {
    const cvs = document.createElement('canvas');
    cvs.width = 1024; cvs.height = 256;
    const ctx = cvs.getContext('2d');
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
    cvs.width = 512; cvs.height = 200;
    const ctx = cvs.getContext('2d');

    // Deep velvet background
    ctx.fillStyle = '#1a0008';
    ctx.fillRect(0, 0, 512, 200);

    // Gold border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.strokeRect(6, 6, 500, 188);
    ctx.shadowBlur = 0;

    // Crown emoji at top
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
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

const container = document.getElementById('game-container');
const scene = new THREE.Scene();

// High noon sky gradient
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 2; skyCanvas.height = 512;
const skyCtx = skyCanvas.getContext('2d');
const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
skyGrad.addColorStop(0, '#1a5ea8'); // Deep blue top
skyGrad.addColorStop(0.5, '#4b98db');
skyGrad.addColorStop(1, '#a8d5e8'); // Hazy horizon
skyCtx.fillStyle = skyGrad;
skyCtx.fillRect(0, 0, 2, 512);
scene.background = new THREE.CanvasTexture(skyCanvas);
scene.fog = new THREE.FogExp2(0xa8d5e8, 0.008);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

// ─── CONTROLS ────────────────────────────────────────────────────────────────

const controls = new THREE.PointerLockControls(camera, document.body);

screens.start.addEventListener('click', () => {
    if (gameState === 'START' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
        initGame();
        controls.lock();
    }
});
controls.addEventListener('unlock', () => {
    if (gameState === 'PLAYING') crosshair.style.display = 'none';
});
document.getElementById('restart-btn').addEventListener('click', () => { initGame(); controls.lock(); });
document.getElementById('play-again-btn').addEventListener('click', () => { initGame(); controls.lock(); });

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isSprinting = false;
let isGrounded = true;
let velocityY = 0;
let headBobTimer = 0;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

// ─── LIGHTING ────────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Hemisphere light for realistic GI scattering
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);

// Direct high-noon sun
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(20, 200, 40); // Top down angle
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 4096; // Sharper shadows
dirLight.shadow.mapSize.height = 4096;
dirLight.shadow.camera.top = 250;
dirLight.shadow.camera.bottom = -250;
dirLight.shadow.camera.left = -250;
dirLight.shadow.camera.right = 250;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

// ─── ENVIRONMENT ─────────────────────────────────────────────────────────────

// Outer grass
const groundGeo = new THREE.PlaneGeometry(600, 600);
const groundMat = new THREE.MeshStandardMaterial({ map: createGrassTexture(), roughness: 0.9 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Central pavement plaza
const plazaGeo = new THREE.PlaneGeometry(120, 120);
const plazaMat = new THREE.MeshStandardMaterial({ map: createPavementTexture(), roughness: 0.6, metalness: 0.05 });
const plaza = new THREE.Mesh(plazaGeo, plazaMat);
plaza.rotation.x = -Math.PI / 2;
plaza.position.y = 0.02;
plaza.receiveShadow = true;
scene.add(plaza);

// Roads radiating out from centre
function addRoad(x, z, w, h) {
    const rGeo = new THREE.PlaneGeometry(w, h);
    const rMat = new THREE.MeshStandardMaterial({ map: createRoadTexture(), roughness: 0.7 });
    const r = new THREE.Mesh(rGeo, rMat);
    r.rotation.x = -Math.PI / 2;
    r.position.set(x, 0.01, z);
    r.receiveShadow = true;
    scene.add(r);
}
addRoad(0, 0, 12, 300);   // N-S road
addRoad(0, 0, 300, 12);   // E-W road

// Street lamps
function addLamp(x, z) {
    const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 8, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(x, 4, z);
    post.castShadow = true;
    scene.add(post);

    const headGeo = new THREE.BoxGeometry(2, 0.5, 0.8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.7 });
    const lampHead = new THREE.Mesh(headGeo, headMat);
    lampHead.position.set(x + 1, 8.3, z);
    scene.add(lampHead);

    const light = new THREE.PointLight(0xffe8a0, 1.5, 25);
    light.position.set(x + 1, 8, z);
    scene.add(light);
}
for (let i = -120; i <= 120; i += 30) {
    addLamp(8, i);
    addLamp(-8, i);
    addLamp(i, 8);
    addLamp(i, -8);
}

// Clouds (simple flat planes with alpha)
function createCloudMesh() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 1 });
    const puffs = [
        [0, 0, 0, 12, 5, 8],
        [8, 1, 0, 10, 4, 7],
        [-7, 0.5, 0, 8, 4, 6],
        [3, 2, 0, 7, 4, 5],
    ];
    puffs.forEach(([px, py, pz, sw, sh, sd]) => {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mat);
        sphere.scale.set(sw, sh, sd);
        sphere.position.set(px, py, pz);
        g.add(sphere);
    });
    return g;
}
const cloudObjects = [];
for (let i = 0; i < 12; i++) {
    const cloud = createCloudMesh();
    cloud.position.set(
        (Math.random() - 0.5) * 400,
        60 + Math.random() * 40,
        (Math.random() - 0.5) * 400
    );
    cloud.rotation.y = Math.random() * Math.PI;
    cloud.userData.speed = 0.5 + Math.random() * 1.5;
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
    const winMat = new THREE.MeshStandardMaterial({
        map: createGlassTexture(),
        roughness: 0.1,
        metalness: 0.5,
        emissive: new THREE.Color(0x112233),
        emissiveIntensity: 0.3
    });
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

    // Main body — brick texture
    const bodyGeo = new THREE.BoxGeometry(bw, bh, bd);
    const bodyMat = new THREE.MeshStandardMaterial({
        map: createBrickTexture(isNepo ? '#8B6914' : config.color),
        roughness: 0.85,
        metalness: 0.05
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Glass facade overlays
    addWindowsToBuilding(body, bw - 1, bh - 1, bd);

    // Roof parapet
    const parapetGeo = new THREE.BoxGeometry(bw + 1, 1, bd + 1);
    const parapetMat = new THREE.MeshStandardMaterial({ color: isNepo ? 0x8B6914 : 0x34495e, roughness: 0.9 });
    const parapet = new THREE.Mesh(parapetGeo, parapetMat);
    parapet.position.y = bh / 2 + 0.5;
    parapet.castShadow = true;
    group.add(parapet);

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

        // Gold light halo above
        const haloLight = new THREE.PointLight(0xFFD700, 2.5, 40);
        haloLight.position.y = bh / 2 + 6;
        group.add(haloLight);

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

    // Entry neon light
    const entryLight = new THREE.PointLight(isNepo ? 0xFFD700 : 0xfffa65, isNepo ? 2 : 1, isNepo ? 45 : 30);
    entryLight.position.set(0, -bh / 2 + 5, bd / 2 + 5);
    group.add(entryLight);

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

function createPersonMesh(isNepo = false) {
    const person = new THREE.Group();

    const skinHue = 0.06 + Math.random() * 0.08;
    const skinColor = new THREE.Color().setHSL(skinHue, 0.4, 0.3 + Math.random() * 0.5);
    const shirtColor = isNepo
        ? new THREE.Color().setHSL(0.13, 0.9, 0.55)
        : new THREE.Color().setHSL(Math.random(), 0.8, 0.5);
    const pantsColor = isNepo
        ? new THREE.Color(0.9, 0.8, 0.1)
        : new THREE.Color().setHSL(Math.random(), 0.8, 0.3);

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6, metalness: isNepo ? 0.3 : 0 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });

    // Head (Sphere)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), skinMat);
    head.position.y = 4.2;
    head.castShadow = true;
    person.add(head);

    // Hair (Hemisphere)
    const hairGeo = new THREE.SphereGeometry(0.62, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 4.2;
    person.add(hair);

    if (isNepo) {
        // Crown
        const crownGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.4, 6);
        const crownMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9, roughness: 0.1 });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.y = 5.0;
        person.add(crown);
        // Shades
        const shadesMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.8, roughness: 0.1 });
        const shades = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.15), shadesMat);
        shades.position.set(0, 4.3, 0.55);
        person.add(shades);
    }

    // Torso (Cylinder, tapered)
    const torsoGeo = new THREE.CylinderGeometry(0.7, 0.6, 2.2, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 2.5;
    torso.castShadow = true;
    person.add(torso);

    // Limbs
    const armGeo = new THREE.CylinderGeometry(0.2, 0.15, 2.0, 8);
    armGeo.translate(0, -0.8, 0); // Pivot at shoulder
    
    const armL = new THREE.Mesh(armGeo, skinMat);
    armL.position.set(-0.9, 3.4, 0);
    armL.castShadow = true;
    person.add(armL);
    
    const armR = new THREE.Mesh(armGeo, skinMat);
    armR.position.set(0.9, 3.4, 0);
    armR.castShadow = true;
    person.add(armR);

    const legGeo = new THREE.CylinderGeometry(0.25, 0.2, 2.2, 8);
    legGeo.translate(0, -1.0, 0); // Pivot at hip
    
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.35, 1.4, 0);
    legL.castShadow = true;
    person.add(legL);
    
    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.set(0.35, 1.4, 0);
    legR.castShadow = true;
    person.add(legR);

    // Feet
    const shoeGeo = new THREE.BoxGeometry(0.3, 0.2, 0.6);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
    shoeL.position.set(0, -2.1, 0.1);
    legL.add(shoeL);
    const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
    shoeR.position.set(0, -2.1, 0.1);
    legR.add(shoeR);

    person.userData = {
        legL, legR, armL, armR,
        walkTime: Math.random() * 100,
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

    for (let i = 0; i < 50; i++) {
        const mesh = createPersonMesh(false);
        mesh.position.set((Math.random() - 0.5) * 200, 1, (Math.random() - 0.5) * 200);
        scene.add(mesh);
        crowds.push({
            mesh,
            vx: (Math.random() - 0.5) * 8,
            vz: (Math.random() - 0.5) * 8,
            changeTimer: Math.random() * 2
        });
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
    "I am very passionate"
];
const officePhrases = ["Fit", "Not fit"];
const nepoPhrases = ["Papa called them", "VIP entry bhai", "Straight to the director", "No audition needed"];

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
            const u = new SpeechSynthesisUtterance(actorPhrases[Math.floor(Math.random() * actorPhrases.length)]);
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
            const u = new SpeechSynthesisUtterance(nepoPhrases[Math.floor(Math.random() * nepoPhrases.length)]);
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

// ─── GAME LOGIC ──────────────────────────────────────────────────────────────

function initGame() {
    score = 0;
    officesCompleted = 0;
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
    if (screenId) {
        const s = document.getElementById(screenId);
        s.classList.remove('hidden');
        void s.offsetWidth;
        s.classList.add('active');
        hud.style.display = screenId === 'typing-screen' ? 'flex' : 'none';
    } else {
        hud.style.display = 'flex';
        crosshair.style.display = 'block';
    }
}

function updateHUD() {
    hudScore.innerText = score;
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
    changeScreen('typing-screen');
}

function updateTypingUI() {
    typedTextEl.innerHTML = TARGET_WORD.substring(0, typeIndex).split('').map(c => `<span class="letter-pop">${c}</span>`).join('');
    untypedTextEl.innerText = TARGET_WORD.substring(typeIndex);
    let pct = (currentTimer / maxTimer) * 100;
    timerBar.style.width = pct + '%';
    timerText.innerText = currentTimer.toFixed(1) + 's';
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
    { text: "The producer has called you at his home for dinner at midnight!", sound: "sensual" },
    { text: "Sir your vanity van is ready!", sound: "victorious" }
];

function winMinigame() {
    const chosen = winPhrases[Math.floor(Math.random() * winPhrases.length)];
    playSound(sounds[chosen.sound]); // Play dynamic sound
    
    currentOffice.completed = true;
    currentOffice.isWinning = true;
    
    // Show win message
    const wm = document.getElementById('win-message-overlay');
    const wmt = document.getElementById('win-message-text');
    if(wm && wmt) {
        wmt.innerText = chosen.text;
        wm.classList.remove('hidden');
        wm.style.display = 'block';
        
        // Remove pop animation to restart it
        wmt.classList.remove('letter-pop');
        void wmt.offsetWidth;
        wmt.classList.add('letter-pop');
        
        setTimeout(() => {
            wm.style.display = 'none';
        }, 3000);
    }
    
    spawnFireworks(currentOffice.group.position.x, currentOffice.group.position.y + 10, currentOffice.group.position.z);
    
    score += Math.floor(100 * combo);
    officesCompleted++;
    updateHUD();
    if (officesCompleted >= totalOffices) {
        gameState = 'VICTORY';
        vicScore.innerText = score;
        controls.unlock();
        changeScreen('victory-screen');
    } else {
        gameState = 'PLAYING';
        changeScreen(null);
    }
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
        }
    } else if (gameState === 'TYPING') {
        if (e.key === ' ') e.preventDefault();
        let targetChar = TARGET_WORD[typeIndex];
        if (e.key.toLowerCase() === targetChar.toLowerCase()) {
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

function animatePerson(c, dt) {
    const speed = Math.sqrt(c.vx * c.vx + c.vz * c.vz);
    const ud = c.mesh.userData;
    ud.walkTime += dt * speed * 2;
    const wt = ud.walkTime;
    
    // Rotate instead of translate for swinging limbs
    if (ud.legL) ud.legL.rotation.x = Math.sin(wt) * 0.8;
    if (ud.legR) ud.legR.rotation.x = Math.sin(wt + Math.PI) * 0.8;
    if (ud.armL) ud.armL.rotation.x = Math.sin(wt + Math.PI) * 0.8;
    if (ud.armR) ud.armR.rotation.x = Math.sin(wt) * 0.8;
    
    c.mesh.rotation.y = Math.atan2(c.vx, c.vz);
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

    // Drift clouds
    cloudObjects.forEach(c => {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > 300) c.position.x = -300;
    });

    if (gameState === 'PLAYING' && controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * dt;
        velocity.z -= velocity.z * 10.0 * dt;
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        const speed = isSprinting ? 800.0 : 400.0;
        camera.fov += ((isSprinting ? 90 : 75) - camera.fov) * 5 * dt;
        camera.updateProjectionMatrix();

        if (moveForward || moveBackward) velocity.z -= direction.z * speed * dt;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * dt;

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
                c.vx = (Math.random() - 0.5) * 10;
                c.vz = (Math.random() - 0.5) * 10;
                c.changeTimer = 1 + Math.random() * 2;
            }
            c.mesh.position.x += c.vx * dt;
            c.mesh.position.z += c.vz * dt;
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

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

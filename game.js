// 3D Casting Office Game - game.js (V3 Graphics & Audio)

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
let totalOffices = 15; // Increased offices
let officesCompleted = 0;

// Typing State
const TARGET_WORD = "nepo kid";
let typeIndex = 0;
let currentTimer = 0;
let maxTimer = 0;
let currentOffice = null;

// --- Meme Sounds ---
const sounds = {
    fail: new Audio('https://www.myinstants.com/media/sounds/emotional-damage-meme.mp3'),
    success: new Audio('https://www.myinstants.com/media/sounds/yippee-tbh.mp3'),
    type: new Audio('https://www.myinstants.com/media/sounds/minecraft_click.mp3'),
    bgm: new Audio('https://www.myinstants.com/media/sounds/wii-shop-channel-music.mp3'),
    chatter: new Audio('https://www.myinstants.com/media/sounds/crowd-talking-1.mp3') // Background crowd buzzing
};
sounds.bgm.loop = true;
sounds.bgm.volume = 0.2;
sounds.chatter.loop = true;
sounds.chatter.volume = 0.4;

function playSound(snd) {
    snd.currentTime = 0;
    snd.play().catch(e => console.log("Audio play blocked"));
}

// --- Texture Generators (Procedural Graphics) ---
function createGrassTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#2d6a30';
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<5000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#367c39' : '#245426';
        ctx.fillRect(Math.random()*512, Math.random()*512, 4, 12);
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(50, 50);
    return tex;
}

function createSignTexture(text) {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 128;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#f1c40f'; // Gold text
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
    
    // Add neon border
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 118);

    return new THREE.CanvasTexture(cvs);
}

// Studio Names
const STUDIO_NAMES = [
    "Casting Bay", "Anti Casting", "MCC", "Netflex", 
    "Warner Bros", "Dharma", "YRF", "A25", 
    "Pear TV", "Paramount", "Excel Ent", "Phantom"
];

// --- Three.js Setup ---
const container = document.getElementById('game-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); 
scene.fog = new THREE.FogExp2(0x87CEEB, 0.015); // Drastically improved atmosphere

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 2; 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
container.appendChild(renderer.domElement);

// --- Controls ---
const controls = new THREE.PointerLockControls(camera, document.body);

screens.start.addEventListener('click', () => {
    if (gameState === 'START' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
        initGame();
        controls.lock();
    }
});

controls.addEventListener('unlock', () => {
    if (gameState === 'PLAYING') {
        crosshair.style.display = 'none';
    }
});

document.getElementById('restart-btn').addEventListener('click', () => {
    initGame();
    controls.lock();
});

document.getElementById('play-again-btn').addEventListener('click', () => {
    initGame();
    controls.lock();
});

// Movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

// --- Environment ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048; // Higher res shadows
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.top = 150;
dirLight.shadow.camera.bottom = -150;
dirLight.shadow.camera.left = -150;
dirLight.shadow.camera.right = 150;
scene.add(dirLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(500, 500);
const groundMat = new THREE.MeshStandardMaterial({ 
    map: createGrassTexture(),
    roughness: 0.8
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Objects Arrays
let offices = [];
let crowds = [];

// Generators
function createOffices() {
    offices.forEach(o => scene.remove(o.mesh));
    offices = [];

    const officeGeo = new THREE.BoxGeometry(10, 12, 10);
    const roofGeo = new THREE.ConeGeometry(8, 4, 4);
    
    for (let i = 0; i < totalOffices; i++) {
        // Main Building
        const buildingMat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.5, 0.8),
            roughness: 0.9 
        });
        const mesh = new THREE.Mesh(officeGeo, buildingMat);
        
        // Random position
        let x, z;
        do {
            x = (Math.random() - 0.5) * 300;
            z = (Math.random() - 0.5) * 300;
        } while (Math.abs(x) < 20 && Math.abs(z) < 20);

        mesh.position.set(x, 6, z);
        mesh.rotation.y = Math.random() * Math.PI * 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        // Roof
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x34495e });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 8;
        roof.rotation.y = Math.PI/4; // align cone
        roof.castShadow = true;
        mesh.add(roof);

        // Door
        const doorGeo = new THREE.BoxGeometry(4, 6, 0.4);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x8e44ad, emissive: 0x2c003e });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, -3, 5.1);
        mesh.add(door);

        // Red Carpet (Entry)
        const carpetGeo = new THREE.PlaneGeometry(4, 15);
        const carpetMat = new THREE.MeshStandardMaterial({ color: 0xc0392b });
        const carpet = new THREE.Mesh(carpetGeo, carpetMat);
        carpet.rotation.x = -Math.PI / 2;
        carpet.position.set(0, -5.9, 12);
        carpet.receiveShadow = true;
        mesh.add(carpet);

        // Entry Light
        const entryLight = new THREE.PointLight(0xfffa65, 1, 30);
        entryLight.position.set(0, 1, 7);
        mesh.add(entryLight);

        // Studio Sign (Dynamic Texture)
        const studioName = STUDIO_NAMES[Math.floor(Math.random() * STUDIO_NAMES.length)];
        const signGeo = new THREE.PlaneGeometry(8, 2);
        const signMat = new THREE.MeshBasicMaterial({ map: createSignTexture(studioName) });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 3, 5.1);
        mesh.add(sign);

        offices.push({
            mesh: mesh,
            completed: false,
            timeLimit: Math.max(2.5, 7 - (i * 0.4)) 
        });
    }
}

function createPersonMesh() {
    const person = new THREE.Group();
    
    // Random Clothing Colors
    const skinColor = new THREE.Color().setHSL(0.1, 0.4, 0.3 + Math.random()*0.5);
    const shirtColor = new THREE.Color().setHSL(Math.random(), 0.8, 0.5);
    const pantsColor = new THREE.Color().setHSL(Math.random(), 0.8, 0.3);

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.9 });
    
    // Head
    const headGeo = new THREE.BoxGeometry(1, 1, 1);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 3.5;
    head.castShadow = true;
    person.add(head);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.5, 2, 0.8);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 2;
    torso.castShadow = true;
    person.add(torso);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.5, 2, 0.5);
    const armL = new THREE.Mesh(armGeo, skinMat);
    armL.position.set(-1.1, 2, 0);
    armL.castShadow = true;
    person.add(armL);

    const armR = new THREE.Mesh(armGeo, skinMat);
    armR.position.set(1.1, 2, 0);
    armR.castShadow = true;
    person.add(armR);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.6, 2, 0.6);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.4, 0, 0);
    legL.castShadow = true;
    person.add(legL);

    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.set(0.4, 0, 0);
    legR.castShadow = true;
    person.add(legR);

    person.userData = {
        legL: legL, legR: legR, armL: armL, armR: armR,
        walkTime: Math.random() * 100
    };

    return person;
}

function createCrowds() {
    crowds.forEach(c => scene.remove(c.mesh));
    crowds = [];

    for (let i = 0; i < 50; i++) {
        const mesh = createPersonMesh();
        mesh.position.set((Math.random() - 0.5) * 200, 1, (Math.random() - 0.5) * 200);
        scene.add(mesh);

        crowds.push({
            mesh: mesh,
            vx: (Math.random() - 0.5) * 8,
            vz: (Math.random() - 0.5) * 8,
            changeTimer: Math.random() * 2
        });
    }
}

// --- Proximity Audio (Simulated Spatial) ---
const actorPhrases = [
    "I am an actor",
    "My height is six foot",
    "Fit",
    "Not fit",
    "I can cry on cue",
    "Do you have a role for me?"
];

const officePhrases = [
    "Fit",
    "Not fit"
];

function getVolumeByDistance(pos, maxDist = 40) {
    const dist = camera.position.distanceTo(pos);
    if (dist > maxDist) return 0;
    // Inverse scaling (1 at 0 dist, 0 at maxDist)
    return Math.max(0.01, 1 - (dist / maxDist));
}

// Audio Loop (Fast interval to create a queue/buzz of actors)
setInterval(() => {
    if (gameState !== 'PLAYING' || !window.speechSynthesis) return;
    
    // We allow queuing up to 3 utterances to create a "buzzing" feeling without completely crashing
    if (window.speechSynthesis.pending && window.speechSynthesis.getVoices().length > 0) return; 
    
    // 60% chance to play Crowd voice or Office voice
    if (Math.random() > 0.4 && crowds.length > 0) {
        let nearest = crowds[0];
        let minDist = camera.position.distanceTo(nearest.mesh.position);
        for(let c of crowds) {
            let d = camera.position.distanceTo(c.mesh.position);
            if(d < minDist) { minDist = d; nearest = c; }
        }
        
        let vol = getVolumeByDistance(nearest.mesh.position, 40);
        if (vol > 0.05) {
            const utterance = new SpeechSynthesisUtterance(actorPhrases[Math.floor(Math.random() * actorPhrases.length)]);
            utterance.volume = vol;
            utterance.pitch = 0.5 + Math.random() * 1.0; // Highly varied pitch for different actors
            utterance.rate = 0.8 + Math.random() * 0.5; // Highly varied speed
            window.speechSynthesis.speak(utterance);
        }
    } else if (offices.length > 0) {
        let nearest = offices[0];
        let minDist = camera.position.distanceTo(nearest.mesh.position);
        for(let o of offices) {
            let d = camera.position.distanceTo(o.mesh.position);
            if(d < minDist) { minDist = d; nearest = o; }
        }
        
        let vol = getVolumeByDistance(nearest.mesh.position, 50);
        if (vol > 0.05) {
            const utterance = new SpeechSynthesisUtterance(officePhrases[Math.floor(Math.random() * officePhrases.length)]);
            utterance.volume = vol;
            utterance.pitch = 0.3 + Math.random() * 0.4; // Deep, booming voices for directors
            utterance.rate = 0.7 + Math.random() * 0.2;
            window.speechSynthesis.speak(utterance);
        }
    }
}, 300);


// --- Game Logic ---

function initGame() {
    score = 0;
    officesCompleted = 0;
    updateHUD();
    createOffices();
    createCrowds();
    camera.position.set(0, 2, 0);
    velocity.set(0,0,0);
    screens.gameOver.classList.remove('flashing');
    gameState = 'PLAYING';
    changeScreen(null);
    sounds.bgm.play().catch(e=>console.log("BGM blocked:", e));
    sounds.chatter.play().catch(e=>console.log("Chatter blocked:", e));
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
        
        if (screenId === 'typing-screen') {
            hud.style.display = 'flex';
        } else {
            hud.style.display = 'none';
        }
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
    
    updateTypingUI();
    changeScreen('typing-screen');
}

function updateTypingUI() {
    typedTextEl.innerText = TARGET_WORD.substring(0, typeIndex);
    untypedTextEl.innerText = TARGET_WORD.substring(typeIndex);
    
    let pct = (currentTimer / maxTimer) * 100;
    timerBar.style.width = pct + '%';
    timerText.innerText = currentTimer.toFixed(1) + 's';
    
    if (pct < 30) {
        timerBar.style.background = '#ff4757';
    } else if (pct < 60) {
        timerBar.style.background = '#ffa502';
    } else {
        timerBar.style.background = 'linear-gradient(90deg, #ff4757, #ffa502, #2ed573)';
    }
}

function handleGameOver() {
    gameState = 'GAME_OVER';
    playSound(sounds.fail);
    goScore.innerText = score;
    controls.unlock();
    changeScreen('game-over-screen');
    screens.gameOver.classList.add('flashing');
}

function winMinigame() {
    playSound(sounds.success);
    currentOffice.completed = true;
    currentOffice.mesh.children[0].material.color.setHex(0x2ed573); // Turn building green
    score += 100;
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

// --- Input Handling ---
document.addEventListener('keydown', (e) => {
    if (gameState === 'PLAYING') {
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW': moveForward = true; break;
            case 'ArrowLeft':
            case 'KeyA': moveLeft = true; break;
            case 'ArrowDown':
            case 'KeyS': moveBackward = true; break;
            case 'ArrowRight':
            case 'KeyD': moveRight = true; break;
        }
    } else if (gameState === 'TYPING') {
        if (e.key === ' ') e.preventDefault();
        
        let targetChar = TARGET_WORD[typeIndex];
        if (e.key.toLowerCase() === targetChar.toLowerCase()) {
            typeIndex++;
            playSound(sounds.type);
            updateTypingUI();
            if (typeIndex >= TARGET_WORD.length) {
                winMinigame();
            }
        }
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'ArrowUp':
        case 'KeyW': moveForward = false; break;
        case 'ArrowLeft':
        case 'KeyA': moveLeft = false; break;
        case 'ArrowDown':
        case 'KeyS': moveBackward = false; break;
        case 'ArrowRight':
        case 'KeyD': moveRight = false; break;
    }
});

// --- Game Loop ---
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const dt = (time - prevTime) / 1000;
    prevTime = time;

    if (gameState === 'PLAYING' && controls.isLocked) {
        // Physics/movement
        velocity.x -= velocity.x * 10.0 * dt;
        velocity.z -= velocity.z * 10.0 * dt;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        const speed = 400.0;
        if (moveForward || moveBackward) velocity.z -= direction.z * speed * dt;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * dt;

        controls.moveRight(-velocity.x * dt);
        controls.moveForward(-velocity.z * dt);

        // Keep player in bounds
        if (camera.position.x > 240) camera.position.x = 240;
        if (camera.position.x < -240) camera.position.x = -240;
        if (camera.position.z > 240) camera.position.z = 240;
        if (camera.position.z < -240) camera.position.z = -240;

        // Check distance to offices
        for (let office of offices) {
            if (!office.completed) {
                const dist = camera.position.distanceTo(office.mesh.position);
                if (dist < 12) { // Increased interaction radius due to larger building sizes
                    startTypingMinigame(office);
                    velocity.set(0,0,0);
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

    // Animate crowds
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

            // Face direction of movement
            c.mesh.rotation.y = Math.atan2(c.vx, c.vz);

            // Walk animation
            let speed = Math.sqrt(c.vx*c.vx + c.vz*c.vz);
            c.mesh.userData.walkTime += dt * speed * 2;
            let wt = c.mesh.userData.walkTime;

            c.mesh.userData.legL.position.z = Math.sin(wt) * 0.5;
            c.mesh.userData.legR.position.z = Math.sin(wt + Math.PI) * 0.5;
            c.mesh.userData.armL.position.z = Math.sin(wt + Math.PI) * 0.5;
            c.mesh.userData.armR.position.z = Math.sin(wt) * 0.5;

            // Keep crowds in bounds
            if (c.mesh.position.x > 240 || c.mesh.position.x < -240) c.vx *= -1;
            if (c.mesh.position.z > 240 || c.mesh.position.z < -240) c.vz *= -1;
        });
    }

    renderer.render(scene, camera);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loop
animate();

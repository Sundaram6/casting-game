import * as THREE from 'three';
import { getState, setState, STATES, getCharacter } from '../state.js';
import { stopAllSounds } from '../game/sounds.js';

const TARGET_WORD = "nepo kid";
let typeIndex = 0;
let currentTimer = 0;
let maxTimer = 0;
let currentOffice = null;
let combo = 1.0;
let lastTypeTime = 0;

let cfg = {};

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

const VICTORY_AWARDS = {
    sundaram: [
        "Best Background Actor — Nobody Noticed",
        "Most Authentic Audition — Not That It Mattered",
        "Longest Train Ride Home — Bihar to Mumbai and Back"
    ],
    arjun: [
        "Best Actor — Filmfare Awards",
        "Rising Star — Stardust Awards",
        "Instagram Influencer of the Year"
    ],
    rekha: [
        "Lifetime Achievement in Looking the Other Way",
        "Best Supporting Character in a Broken System",
        "30 Years of Silence — Award Pending"
    ]
};

function showVictoryAwards(character) {
    const awards = VICTORY_AWARDS[character] || VICTORY_AWARDS.sundaram;
    let delay = 0;

    cfg.sounds.bgm.pause();
    cfg.sounds.sigma.currentTime = 0;
    cfg.sounds.sigma.play().catch(() => {});

    awards.forEach((award, i) => {
        setTimeout(() => {
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
                overlay.innerHTML = `
                    <div style="text-align: center; color: #FFD700; font-family: 'Outfit', sans-serif; text-shadow: 0 0 20px rgba(255,215,0,0.5);">
                        <div style="font-size: 1rem; opacity: 0.7; margin-bottom: 0.5rem;">${i + 1} of ${awards.length}</div>
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${award}</div>
                        <div style="font-size: 0.9rem; opacity: 0.5; margin-top: 1rem;">🏆</div>
                    </div>
                `;
                overlay.style.opacity = '1';
                overlay.style.pointerEvents = 'auto';
            }
        }, delay);

        delay += 3000;

        setTimeout(() => {
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
        }, delay);

        delay += 800;
    });

    setTimeout(() => {
        cfg.sounds.sigma.pause();
        cfg.sounds.bgm.play().catch(() => {});
        document.getElementById('vic-score').innerText = cfg.getScore();
        cfg.controls.unlock();
        cfg.changeScreen('victory-screen');
    }, delay);
}

export function initTypingGame(config) {
    cfg = config;
    typeIndex = 0;
    currentTimer = 0;
    maxTimer = 0;
    currentOffice = null;
    combo = 1.0;
    lastTypeTime = 0;
}

function getTypedText() {
    return TARGET_WORD.substring(0, typeIndex).split('').map(c => `<span class="letter-pop">${c}</span>`).join('');
}

function getUntypedText() {
    return TARGET_WORD.substring(typeIndex);
}

function getTimerPct() {
    return maxTimer > 0 ? (currentTimer / maxTimer) * 100 : 0;
}

function updateDisplay() {
    if (cfg.updateTypingDisplay) {
        cfg.updateTypingDisplay(getTypedText(), getUntypedText(), getTimerPct(), currentTimer);
    }
}

export function startTypingMinigame(office) {
    setState(STATES.TYPING);
    currentOffice = office;
    typeIndex = 0;
    maxTimer = office.timeLimit;
    currentTimer = maxTimer;
    combo = 1.0;
    lastTypeTime = performance.now();
    const ct = document.getElementById('combo-text');
    if (ct) ct.innerText = 'x1.0';
    updateDisplay();

    const front = new THREE.Vector3(0, 0, -2).applyQuaternion(cfg.camera.quaternion);
    const spawnPos = cfg.camera.position.clone().add(front);
    cfg.spawnPhysicsParticle(spawnPos.x, spawnPos.y - 0.5, spawnPos.z);

    cfg.changeScreen('typing-screen');
    if (cfg.isMobile) {
        document.getElementById('mobile-keyboard').classList.remove('hidden');
        document.getElementById('mobile-controls').classList.add('hidden');
    }
}

export function updateTyping(dt) {
    currentTimer -= dt;
    if (currentTimer <= 0) {
        currentTimer = 0;
        updateDisplay();
        handleGameOver();
    } else {
        updateDisplay();
    }
}

export function handleTypingCharacter(key) {
    if (getState() !== STATES.TYPING) return;
    let targetChar = TARGET_WORD[typeIndex];
    if (key.toLowerCase() === targetChar.toLowerCase()) {
        typeIndex++;
        
        const now = performance.now();
        if (now - lastTypeTime < 400) {
            combo += 0.1;
            const ct = document.getElementById('combo-text');
            if (ct) {
                ct.innerText = 'x' + combo.toFixed(1);
                ct.classList.remove('combo-pop');
                void ct.offsetWidth;
                ct.classList.add('combo-pop');
            }
        } else {
            combo = 1.0;
            const ct = document.getElementById('combo-text');
            if (ct) ct.innerText = 'x1.0';
        }
        lastTypeTime = now;
        
        cfg.sounds.type.playbackRate = Math.min(2.0, 1.0 + (combo - 1) * 0.1);
        cfg.playSound(cfg.sounds.type);
        
        const gc = document.getElementById('game-container');
        if (gc) {
            gc.classList.remove('shake');
            void gc.offsetWidth;
            gc.classList.add('shake');
        }
        
        updateDisplay();
        if (typeIndex >= TARGET_WORD.length) winMinigame();
    }
}

function showCelebrationScene(chosen, afterScene) {
    setState(STATES.CELEBRATING);
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

    cfg.sounds.bgm.pause();
    cfg.sounds.chatter.volume = chosen.type === 'producer' ? 0.08 : 0.25;
    if (chosen.type === 'producer') {
        cfg.sounds.sensual.currentTime = 0;
        cfg.sounds.sensual.play().catch(() => {});
    } else {
        cfg.playSound(cfg.sounds.victorious);
        ["Sir!", "Coffee, sir!", "Script, sir!", "Umbrella, sir!"].forEach((line, i) => {
            setTimeout(() => {
                cfg.spawnBuzzBubble(line, true);
                if (window.speechSynthesis) {
                    const u = new SpeechSynthesisUtterance(line);
                    u.volume = 0.9; u.pitch = 0.9 + Math.random() * 0.4; u.rate = 0.9 + Math.random() * 0.2;
                    window.speechSynthesis.speak(u);
                }
            }, i * 650);
        });
    }

    cfg.changeScreen('celebration-screen');
    setTimeout(() => {
        cfg.sounds.sensual.pause();
        cfg.sounds.chatter.volume = 0.4;
        cfg.sounds.bgm.play().catch(() => {});
        afterScene();
        
        if (chosen.type === 'producer') {
            setTimeout(() => {
                cfg.spawnBuzzBubble("My ass hurts.", false);
                if (window.speechSynthesis) {
                    const u = new SpeechSynthesisUtterance("My ass hurts.");
                    u.pitch = 0.9;
                    window.speechSynthesis.speak(u);
                }
            }, 500);
        }
    }, chosen.type === 'producer' ? 9200 : 7600);
}

function winMinigame() {
    stopAllSounds();
    const chosen = winPhrases[Math.floor(Math.random() * winPhrases.length)];

    currentOffice.completed = true;
    currentOffice.isWinning = true;

    cfg.spawnFireworks(currentOffice.group.position.x, currentOffice.group.position.y + 10, currentOffice.group.position.z);

    cfg.addScore(Math.floor(100 * combo));
    cfg.incrementOfficesCompleted();
    cfg.updateHUD();

    showCelebrationScene(chosen, () => {
        if (cfg.getOfficesCompleted() >= cfg.getTotalOffices()) {
            setState(STATES.VICTORY);
            showVictoryAwards(getCharacter());
        } else {
            setState(STATES.EXPLORING);
            cfg.changeScreen(null);
        }
    });
}

export function handleGameOver() {
    stopAllSounds();
    setState(STATES.GAME_OVER);
    cfg.playSound(cfg.sounds.fail);
    document.getElementById('go-score').innerText = cfg.getScore();
    cfg.controls.unlock();
    cfg.changeScreen('game-over-screen');
    document.getElementById('game-over-screen').classList.add('flashing');

    const body = document.body;
    body.classList.remove('shake-severe');
    void body.offsetWidth;
    body.classList.add('shake-severe');
}

import * as THREE from 'three';
import { handleTypingCharacter } from '../legacy/typing-game.js';
import { interact } from '../interaction.js';
import { STATES } from '../state.js';

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isSprinting = false;
let isGrounded = true;
let velocityY = 0;
let headBobTimer = 0;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

let touchJoystickId = null;
let touchJoystickOrigin = {x: 0, y: 0};
let analogJoystick = {x: 0, y: 0};

let gameStateGetter = null;
let isMobile = false;
let camera = null;

function initInput(options) {
    gameStateGetter = options.gameStateGetter;
    isMobile = options.isMobile;
    camera = options.camera;
    
    const gameState = gameStateGetter();
    
    // Virtual Keyboard Logic
    document.querySelectorAll('.kb-key').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameStateGetter() !== 'TYPING') return;
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

    const joyZone = document.getElementById('mobile-joystick-zone');
    const joyBase = document.getElementById('mobile-joystick-base');
    const joyStick = document.getElementById('mobile-joystick-stick');

    joyZone.addEventListener('touchstart', e => {
        e.preventDefault();
        if (touchJoystickId !== null || gameStateGetter() !== STATES.EXPLORING) return;
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
        if (gameStateGetter() !== STATES.EXPLORING) return;
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
        if (touchLookId !== null || gameStateGetter() !== STATES.EXPLORING) return;
        const touch = e.changedTouches[0];
        touchLookId = touch.identifier;
        touchLookLast = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });
    lookZone.addEventListener('touchmove', e => {
        e.preventDefault();
        if (gameStateGetter() !== STATES.EXPLORING) return;
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

    document.addEventListener('keydown', (e) => {
        if (gameStateGetter() === STATES.EXPLORING) {
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
        } else if (gameStateGetter() === 'TYPING') {
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
}

function getInputState() {
    return {
        moveForward,
        moveBackward,
        moveLeft,
        moveRight,
        isSprinting,
        isGrounded,
        velocityY,
        headBobTimer,
        velocity,
        direction,
        prevTime,
        analogJoystick
    };
}

function setInputState(state) {
    if (state.moveForward !== undefined) moveForward = state.moveForward;
    if (state.moveBackward !== undefined) moveBackward = state.moveBackward;
    if (state.moveLeft !== undefined) moveLeft = state.moveLeft;
    if (state.moveRight !== undefined) moveRight = state.moveRight;
    if (state.isSprinting !== undefined) isSprinting = state.isSprinting;
    if (state.isGrounded !== undefined) isGrounded = state.isGrounded;
    if (state.velocityY !== undefined) velocityY = state.velocityY;
    if (state.headBobTimer !== undefined) headBobTimer = state.headBobTimer;
    if (state.velocity !== undefined) velocity.copy(state.velocity);
    if (state.direction !== undefined) direction.copy(state.direction);
    if (state.prevTime !== undefined) prevTime = state.prevTime;
}

export { initInput, getInputState, setInputState };
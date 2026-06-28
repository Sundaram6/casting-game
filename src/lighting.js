import * as THREE from 'three';
import { getScene } from './scene.js';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;

let ambientLight;
let hemiLight;
let dirLight;
let rimLight;

export function initLighting() {
    const scene = getScene();

    ambientLight = new THREE.AmbientLight(0x6080c0, 0.6);
    scene.add(ambientLight);

    hemiLight = new THREE.HemisphereLight(0x88bbee, 0x445533, 1.2);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
    dirLight.position.set(180, 350, -300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = isMobile ? 1024 : 2048;
    dirLight.shadow.mapSize.height = isMobile ? 1024 : 2048;
    dirLight.shadow.camera.top = 450;
    dirLight.shadow.camera.bottom = -450;
    dirLight.shadow.camera.left = -450;
    dirLight.shadow.camera.right = 450;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 900;
    dirLight.shadow.bias = -0.0002;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    rimLight = new THREE.DirectionalLight(0xffeedd, 0.3);
    rimLight.position.set(-180, 200, 300);
    scene.add(rimLight);
}

export function getAmbientLight() { return ambientLight; }
export function getHemiLight() { return hemiLight; }
export function getDirLight() { return dirLight; }
export function getRimLight() { return rimLight; }

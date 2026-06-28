import * as THREE from 'three';
import { getScene } from './scene.js';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || navigator.maxTouchPoints > 0;

let ambientLight;
let hemiLight;
let dirLight;
let rimLight;

const LIGHTING_PRESETS = {
  sundaram: {
    ambient: { color: 0x6080c0, intensity: 0.6 },
    hemisphere: { color: 0x88bbee, groundColor: 0x445533, intensity: 1.2 },
    directional: { color: 0xfff4e0, intensity: 1.8, position: [180, 350, -300] },
    rim: { color: 0xffeedd, intensity: 0.3 }
  },
  arjun: {
    ambient: { color: 0x8090b0, intensity: 0.5 },
    hemisphere: { color: 0xaaccee, groundColor: 0x334455, intensity: 1.0 },
    directional: { color: 0xe0e8f0, intensity: 1.8, position: [100, 400, -200] },
    rim: { color: 0xccddee, intensity: 0.4 }
  },
  rekha: {
    ambient: { color: 0x506070, intensity: 0.4 },
    hemisphere: { color: 0x778899, groundColor: 0x333333, intensity: 0.8 },
    directional: { color: 0xddddcc, intensity: 1.5, position: [200, 300, -250] },
    rim: { color: 0xbbbbcc, intensity: 0.2 }
  }
};

let currentPreset = 'sundaram';
let sourceValues = null; // stores the values we're transitioning from
let targetPreset = null;
let transitionProgress = 1; // 0 = at source, 1 = at target
let transitionDuration = 1.0; // seconds
let transitionStartTime = 0;
let lightingPresetActive = false;

function clonePreset(preset) {
  return {
    ambient: { ...preset.ambient },
    hemisphere: { ...preset.hemisphere },
    directional: { ...preset.directional, position: [...preset.directional.position] },
    rim: { ...preset.rim }
  };
}

function applyPresetValues(preset) {
  ambientLight.color.set(preset.ambient.color);
  ambientLight.intensity = preset.ambient.intensity;
  hemiLight.color.set(preset.hemisphere.color);
  hemiLight.groundColor.set(preset.hemisphere.groundColor);
  hemiLight.intensity = preset.hemisphere.intensity;
  dirLight.color.set(preset.directional.color);
  dirLight.intensity = preset.directional.intensity;
  dirLight.position.set(...preset.directional.position);
  rimLight.color.set(preset.rim.color);
  rimLight.intensity = preset.rim.intensity;
}

function lerpValues(source, target, t) {
  const result = clonePreset(source);
  result.ambient.color = new THREE.Color(source.ambient.color).lerp(new THREE.Color(target.ambient.color), t);
  result.ambient.intensity = source.ambient.intensity + (target.ambient.intensity - source.ambient.intensity) * t;
  result.hemisphere.color = new THREE.Color(source.hemisphere.color).lerp(new THREE.Color(target.hemisphere.color), t);
  result.hemisphere.groundColor = new THREE.Color(source.hemisphere.groundColor).lerp(new THREE.Color(target.hemisphere.groundColor), t);
  result.hemisphere.intensity = source.hemisphere.intensity + (target.hemisphere.intensity - source.hemisphere.intensity) * t;
  result.directional.color = new THREE.Color(source.directional.color).lerp(new THREE.Color(target.directional.color), t);
  result.directional.intensity = source.directional.intensity + (target.directional.intensity - source.directional.intensity) * t;
  result.directional.position = source.directional.position.map((v, i) => v + (target.directional.position[i] - v) * t);
  result.rim.color = new THREE.Color(source.rim.color).lerp(new THREE.Color(target.rim.color), t);
  result.rim.intensity = source.rim.intensity + (target.rim.intensity - source.rim.intensity) * t;
  return result;
}

export function setLightingPreset(preset) {
  if (!LIGHTING_PRESETS[preset]) return;
  if (preset === currentPreset && transitionProgress >= 1) return;
  
  // If already transitioning, use current interpolated values as source
  if (transitionProgress < 1 && sourceValues) {
    const interpolated = lerpValues(sourceValues, LIGHTING_PRESETS[targetPreset], transitionProgress);
    sourceValues = interpolated;
  } else {
    sourceValues = clonePreset(LIGHTING_PRESETS[currentPreset]);
  }
  
  targetPreset = preset;
  transitionProgress = 0;
  transitionStartTime = performance.now();
  lightingPresetActive = true;
}

export function getLightingPreset() { return currentPreset; }

export function updateLighting(time) {
  if (!lightingPresetActive || transitionProgress >= 1) return;
  
  const elapsed = (time - transitionStartTime) / 1000;
  transitionProgress = Math.min(elapsed / transitionDuration, 1);
  
  const target = LIGHTING_PRESETS[targetPreset];
  const interpolated = lerpValues(sourceValues, target, transitionProgress);
  applyPresetValues(interpolated);
  
  if (transitionProgress >= 1) {
    currentPreset = targetPreset;
    targetPreset = null;
    sourceValues = null;
    lightingPresetActive = false;
  }
}

export function isLightingPresetActive() { return lightingPresetActive; }

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

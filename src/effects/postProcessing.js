import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import * as THREE from 'three';

let composer = null;

export function initPostProcessing(renderer, scene, camera, isMobile) {
  composer = new EffectComposer(renderer);

  // FIX: Set the render target clear color to match scene background
  composer.renderTarget1.clearColor = new THREE.Color(0x87ceeb);
  composer.renderTarget2.clearColor = new THREE.Color(0x87ceeb);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isMobile ? 0.2 : 0.4,
    0.4,
    0.9
  );
  composer.addPass(bloomPass);

  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
  composer.addPass(fxaaPass);

  return composer;
}

export function renderWithPostProcessing() {
  if (composer) {
    composer.render();
    return true;
  }
  return false;
}

export function resizePostProcessing(width, height) {
  if (composer) {
    composer.setSize(width, height);
  }
}

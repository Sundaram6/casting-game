import * as THREE from 'three';

// --- Color Grading Presets ---
// Each preset defines: brightness, contrast, saturate, sepia (CSS filter values)
// and tint for shader fallback (hue-rotate value in degrees)

const PRESETS = {
    neutral: {
        brightness: 1.0,
        contrast: 1.0,
        saturate: 1.0,
        sepia: 0.0,
        hueRotate: 0,
        // Shader uniforms
        uniforms: {
            brightness: 1.0,
            contrast: 1.0,
            saturation: 1.0,
            tintR: 1.0,
            tintG: 1.0,
            tintB: 1.0,
            vignette: 0.0
        }
    },
    sundaram: {
        brightness: 1.1,
        contrast: 1.05,
        saturate: 1.3,
        sepia: 0.1,
        hueRotate: 15,
        uniforms: {
            brightness: 1.1,
            contrast: 1.05,
            saturation: 1.3,
            tintR: 1.1,
            tintG: 0.95,
            tintB: 0.8,
            vignette: 0.1
        }
    },
    arjun: {
        brightness: 0.95,
        contrast: 1.05,
        saturate: 0.85,
        sepia: 0.0,
        hueRotate: 200,
        uniforms: {
            brightness: 0.95,
            contrast: 1.05,
            saturation: 0.85,
            tintR: 0.85,
            tintG: 0.95,
            tintB: 1.15,
            vignette: 0.15
        }
    },
    rekha: {
        brightness: 0.85,
        contrast: 0.95,
        saturate: 0.5,
        sepia: 0.05,
        hueRotate: 0,
        uniforms: {
            brightness: 0.85,
            contrast: 0.95,
            saturation: 0.5,
            tintR: 0.95,
            tintG: 0.95,
            tintB: 1.0,
            vignette: 0.2
        }
    }
};

// --- State ---
let currentPreset = 'neutral';
let targetPreset = 'neutral';
let transitionProgress = 1.0; // 1.0 = fully at target
let transitionSpeed = 1.0; // transitions per second
let fromValues = { ...PRESETS.neutral };
let toValues = { ...PRESETS.neutral };
let canvasEl = null;

// --- Shader Code (for Task 15 EffectComposer re-enablement) ---

const COLOR_GRADING_VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const COLOR_GRADING_FRAGMENT_SHADER = `
    uniform sampler2D tDiffuse;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    uniform vec3 tint;
    uniform float vignette;
    varying vec2 vUv;

    vec3 adjustBrightness(vec3 color, float b) {
        return color * b;
    }

    vec3 adjustContrast(vec3 color, float c) {
        return (color - 0.5) * c + 0.5;
    }

    vec3 adjustSaturation(vec3 color, float s) {
        float grey = dot(color, vec3(0.2126, 0.7152, 0.0722));
        return mix(vec3(grey), color, s);
    }

    vec3 applyVignette(vec3 color, vec2 uv, float v) {
        float dist = distance(uv, vec2(0.5));
        float vig = smoothstep(0.8, 0.4, dist * (1.0 + v));
        return mix(color * (1.0 - v * 0.3), color, vig);
    }

    void main() {
        vec4 texColor = texture2D(tDiffuse, vUv);
        vec3 color = texColor.rgb;

        color = adjustBrightness(color, brightness);
        color = adjustContrast(color, contrast);
        color = adjustSaturation(color, saturation);
        color *= tint;
        color = applyVignette(color, vUv, vignette);

        gl_FragColor = vec4(color, texColor.a);
    }
`;

// --- CSS Filter Helpers ---

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpPreset(from, to, t) {
    return {
        brightness: lerp(from.brightness, to.brightness, t),
        contrast: lerp(from.contrast, to.contrast, t),
        saturate: lerp(from.saturate, to.saturate, t),
        sepia: lerp(from.sepia, to.sepia, t),
        hueRotate: lerp(from.hueRotate, to.hueRotate, t)
    };
}

function buildCSSFilter(values) {
    return [
        `brightness(${values.brightness})`,
        `contrast(${values.contrast})`,
        `saturate(${values.saturate})`,
        values.sepia > 0.001 ? `sepia(${values.sepia})` : '',
        values.hueRotate > 0.5 ? `hue-rotate(${values.hueRotate}deg)` : ''
    ].filter(Boolean).join(' ');
}

function applyCSSFilter(filterString) {
    if (!canvasEl) {
        canvasEl = document.querySelector('canvas');
    }
    if (canvasEl) {
        canvasEl.style.filter = filterString;
    }
}

// --- Public API ---

function initColorGrading(renderer, scene) {
    canvasEl = document.querySelector('canvas');
    currentPreset = 'neutral';
    targetPreset = 'neutral';
    transitionProgress = 1.0;
    fromValues = { ...PRESETS.neutral };
    toValues = { ...PRESETS.neutral };
    applyCSSFilter(buildCSSFilter(PRESETS.neutral));
}

function setColorGrading(preset) {
    if (!PRESETS[preset]) {
        console.warn(`Color grading: unknown preset "${preset}", falling back to neutral`);
        preset = 'neutral';
    }
    if (preset === targetPreset && transitionProgress >= 1.0) return;

    // Store current interpolated state as starting point
    const current = lerpPreset(fromValues, toValues, Math.min(transitionProgress, 1.0));
    fromValues = current;
    toValues = { ...PRESETS[preset] };
    targetPreset = preset;
    currentPreset = preset;
    transitionProgress = 0.0;
}

function getColorGrading() {
    return currentPreset;
}

function updateColorGrading(dt) {
    if (transitionProgress >= 1.0) return;

    transitionProgress += dt * transitionSpeed;
    if (transitionProgress >= 1.0) {
        transitionProgress = 1.0;
    }

    const t = transitionProgress;
    const eased = t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease in-out quad

    const values = lerpPreset(fromValues, toValues, eased);
    applyCSSFilter(buildCSSFilter(values));
}

// --- Shader Material (for when EffectComposer is re-enabled) ---

function createColorGradingShader() {
    return new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { value: null },
            brightness: { value: 1.0 },
            contrast: { value: 1.0 },
            saturation: { value: 1.0 },
            tint: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
            vignette: { value: 0.0 }
        },
        vertexShader: COLOR_GRADING_VERTEX_SHADER,
        fragmentShader: COLOR_GRADING_FRAGMENT_SHADER
    });
}

function getShaderUniforms(preset) {
    const p = PRESETS[preset] || PRESETS.neutral;
    return { ...p.uniforms };
}

export {
    initColorGrading,
    setColorGrading,
    getColorGrading,
    updateColorGrading,
    createColorGradingShader,
    getShaderUniforms,
    PRESETS
};

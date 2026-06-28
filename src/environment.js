import * as THREE from 'three';
import { MAT, createPavementTexture, createPavementNormalMap, createRoadTexture } from './materials.js';

export function initEnvironment(scene, isMobile) {
    // Grass - instanced blades for natural look
    const grassGroup = new THREE.Group();
    const bladeCount = isMobile ? 3000 : 8000;

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

    for (let i = 0; i < bladeCount; i++) {
        const x = (Math.random() - 0.5) * 580;
        const z = (Math.random() - 0.5) * 580;
        const scale = 0.5 + Math.random() * 1.0;
        const rotation = Math.random() * Math.PI;
        
        if (Math.abs(x) < 65 && Math.abs(z) < 65) continue;
        if (Math.abs(x) < 8 && Math.abs(z) < 155) continue;
        if (Math.abs(z) < 8 && Math.abs(x) < 155) continue;
        
        dummy.position.set(x, scale * 0.4, z);
        dummy.rotation.set(0, rotation, (Math.random() - 0.5) * 0.3);
        dummy.scale.set(1, scale, 1);
        dummy.updateMatrix();
        grassInstanced.setMatrixAt(i, dummy.matrix);
        
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
    addRoad(0, 0, 12, 300);
    addRoad(0, 0, 300, 12);

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

        const lens = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.3, 0.7),
            MAT.LAMP_LENS()
        );
        lens.position.set(x + 1, 8.7, z);
        scene.add(lens);

        if (!isMobile) {
            const dustGeo = new THREE.BufferGeometry();
            const dustCount = 40;
            const positions = new Float32Array(dustCount * 3);
            for(let i = 0; i < dustCount; i++) {
                positions[i*3] = (Math.random() - 0.5) * 4;
                positions[i*3+1] = Math.random() * -8;
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
            
            dust.userData = {
                update: (time) => {
                    const pos = dust.geometry.attributes.position.array;
                    for(let i=0; i<dustCount; i++) {
                        pos[i*3+1] -= 0.02;
                        pos[i*3] += Math.sin(time + i) * 0.01;
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

    return { cloudObjects, water, waterMat, grassInstanced, bladeCount, dummy };
}

// Environment presets for different chapters/scenes
const environmentPresets = {
    sundaram_normal: {
        ambientColor: 0x6080c0,
        ambientIntensity: 0.6,
        hemiSkyColor: 0x88bbee,
        hemiGroundColor: 0x445533,
        hemiIntensity: 1.2,
        dirColor: 0xfff4e0,
        dirIntensity: 1.8,
        rimColor: 0xffeedd,
        rimIntensity: 0.3
    },
    arjun_luxury: {
        ambientColor: 0xc0d0e0,
        ambientIntensity: 0.8,
        hemiSkyColor: 0xddeeff,
        hemiGroundColor: 0x667788,
        hemiIntensity: 1.4,
        dirColor: 0xe0f0ff,
        dirIntensity: 2.0,
        rimColor: 0xb0c0d0,
        rimIntensity: 0.4
    },
    rekha_office: {
        ambientColor: 0x808080,
        ambientIntensity: 0.5,
        hemiSkyColor: 0x999999,
        hemiGroundColor: 0x555555,
        hemiIntensity: 1.0,
        dirColor: 0xffffee,
        dirIntensity: 1.5,
        rimColor: 0xcccccc,
        rimIntensity: 0.2
    },
    arjun_dinner: {
        ambientColor: 0x806040,
        ambientIntensity: 0.7,
        hemiSkyColor: 0xaa8866,
        hemiGroundColor: 0x554433,
        hemiIntensity: 1.1,
        dirColor: 0xffddaa,
        dirIntensity: 1.6,
        rimColor: 0xccaa88,
        rimIntensity: 0.35
    },
    sundaram_patna: {
        ambientColor: 0xd4a574,
        ambientIntensity: 0.8,
        hemiSkyColor: 0xffd699,
        hemiGroundColor: 0x8b6914,
        hemiIntensity: 1.3,
        dirColor: 0xffe0b2,
        dirIntensity: 1.9,
        rimColor: 0xffcc80,
        rimIntensity: 0.35
    },
    arjun_childhood: {
        ambientColor: 0xffe0b2,
        ambientIntensity: 0.7,
        hemiSkyColor: 0xffcc80,
        hemiGroundColor: 0x795548,
        hemiIntensity: 1.2,
        dirColor: 0xffab40,
        dirIntensity: 1.7,
        rimColor: 0xff8a65,
        rimIntensity: 0.3
    },
    rekha_1998: {
        ambientColor: 0xe0e0e0,
        ambientIntensity: 0.6,
        hemiSkyColor: 0xf5f5f5,
        hemiGroundColor: 0x9e9e9e,
        hemiIntensity: 1.1,
        dirColor: 0xffffff,
        dirIntensity: 1.6,
        rimColor: 0xbdbdbd,
        rimIntensity: 0.25
    }
};

export function setEnvironmentPreset(presetName) {
    const preset = environmentPresets[presetName];
    if (!preset) {
        console.warn(`Unknown environment preset: ${presetName}`);
        return false;
    }

    // Import lighting getters dynamically to avoid circular dependencies
    import('./lighting.js').then(({ getAmbientLight, getHemiLight, getDirLight, getRimLight }) => {
        const ambient = getAmbientLight();
        const hemi = getHemiLight();
        const dir = getDirLight();
        const rim = getRimLight();

        if (ambient) {
            ambient.color.setHex(preset.ambientColor);
            ambient.intensity = preset.ambientIntensity;
        }
        if (hemi) {
            hemi.color.setHex(preset.hemiSkyColor);
            hemi.groundColor.setHex(preset.hemiGroundColor);
            hemi.intensity = preset.hemiIntensity;
        }
        if (dir) {
            dir.color.setHex(preset.dirColor);
            dir.intensity = preset.dirIntensity;
        }
        if (rim) {
            rim.color.setHex(preset.rimColor);
            rim.intensity = preset.rimIntensity;
        }
    });

    return true;
}

export function getEnvironmentPresets() {
    return Object.keys(environmentPresets);
}

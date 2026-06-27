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

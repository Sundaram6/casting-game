import * as THREE from 'three';

// ─── TEXTURE GENERATORS ───────────────────────────────────────────────────────

function createPavementTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    // Base warm concrete gradient
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
    grad.addColorStop(0, '#c4b8a6');
    grad.addColorStop(1, '#a8998a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    // Tile grid
    const tileW = 64, tileH = 44;
    ctx.strokeStyle = '#7a6e62';
    ctx.lineWidth = 3;
    for (let row = 0; row * tileH < 512; row++) {
        for (let col = 0; col * tileW < 512; col++) {
            const ox = row % 2 === 0 ? 0 : tileW / 2;
            const b = 0.9 + Math.random() * 0.15;
            ctx.fillStyle = `rgba(${Math.floor(195*b)},${Math.floor(182*b)},${Math.floor(165*b)},1)`;
            ctx.fillRect(col * tileW + ox + 2, row * tileH + 2, tileW - 4, tileH - 4);
            ctx.strokeRect(col * tileW + ox, row * tileH, tileW, tileH);
        }
    }
    // Grime dots
    for (let i = 0; i < 800; i++) {
        ctx.fillStyle = `rgba(60,50,40,${Math.random() * 0.12})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 5 + 1, Math.random() * 5 + 1);
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(18, 18);
    return tex;
}

function createPavementNormalMap() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#8080ff'; // flat normal
    ctx.fillRect(0, 0, 512, 512);
    const tileW = 40, tileH = 28;
    for (let row = 0; row * tileH < 512; row++) {
        for (let col = 0; col * tileW < 512; col++) {
            const ox = row % 2 === 0 ? 0 : tileW / 2;
            ctx.fillStyle = '#6060ff'; // mortar recessed
            ctx.fillRect(col * tileW + ox, row * tileH, tileW, tileH);
            ctx.fillStyle = '#8888ff'; // tile raised
            ctx.fillRect(col * tileW + ox + 2, row * tileH + 2, tileW - 4, tileH - 4);
        }
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(15, 15);
    return tex;
}

function createGrassTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    // Multi-tone base
    const gg = ctx.createLinearGradient(0, 0, 512, 512);
    gg.addColorStop(0, '#2a5e28');
    gg.addColorStop(0.5, '#337a30');
    gg.addColorStop(1, '#1f4d1e');
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, 512, 512);
    // Grass blade clusters (optimised count)
    for (let i = 0; i < 2500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const h = 5 + Math.random() * 10;
        const tone = Math.random();
        ctx.strokeStyle = tone > 0.6 ? '#4a9e46' : (tone > 0.3 ? '#2d7a2a' : '#1a5218');
        ctx.lineWidth = Math.random() * 1.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random()-0.5)*5, y - h);
        ctx.stroke();
    }
    // A few dirt patches
    for (let i = 0; i < 8; i++) {
        const rx = Math.random() * 512, ry = Math.random() * 512;
        const rg = ctx.createRadialGradient(rx, ry, 0, rx, ry, 25);
        rg.addColorStop(0, 'rgba(110,80,50,0.35)');
        rg.addColorStop(1, 'rgba(110,80,50,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(rx-30, ry-30, 60, 60);
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(45, 45);
    return tex;
}

function createBrickTexture(baseColor = '#c0634a') {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);
    const bw = 64, bh = 30;
    for (let row = 0; row * bh < 512; row++) {
        for (let col = 0; col * bw < 512; col++) {
            const ox = row % 2 === 0 ? 0 : bw / 2;
            const shade = 0.78 + Math.random() * 0.36;
            const hue = 10 + Math.random() * 15;
            const sat = 45 + Math.random() * 25;
            ctx.fillStyle = `hsl(${hue}, ${sat}%, ${Math.floor(30 * shade)}%)`;
            ctx.fillRect(col * bw + ox + 3, row * bh + 3, bw - 6, bh - 6);
        }
    }
    // Mortar
    ctx.strokeStyle = '#2a1e16';
    ctx.lineWidth = 4;
    for (let row = 0; row * bh < 512; row++) {
        for (let col = 0; col * bw < 512; col++) {
            const ox = row % 2 === 0 ? 0 : bw / 2;
            ctx.strokeRect(col * bw + ox, row * bh, bw, bh);
        }
    }
    // Weathering streaks
    for (let i = 0; i < 10; i++) {
        const sx = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + (Math.random()-0.5)*20, 512);
        ctx.strokeStyle = `rgba(0,0,0,${Math.random()*0.07})`;
        ctx.lineWidth = Math.random() * 4;
        ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    return tex;
}

function createBrickNormalMap() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 512, 512);
    const bw = 45, bh = 20;
    for (let row = 0; row * bh < 512; row++) {
        for (let col = 0; col * bw < 512; col++) {
            const ox = row % 2 === 0 ? 0 : bw / 2;
            ctx.fillStyle = '#9898ff'; // brick face slightly raised
            ctx.fillRect(col * bw + ox + 2, row * bh + 2, bw - 4, bh - 4);
            ctx.fillStyle = '#6060d8'; // mortar recessed
            ctx.fillRect(col * bw + ox, row * bh, bw, 2);
            ctx.fillRect(col * bw + ox, row * bh, 2, bh);
        }
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    return tex;
}

function createGlassTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    // Tinted glass base
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#0d1a2a');
    grad.addColorStop(1, '#1a2e45');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    const cols = 5, rows = 8;
    const pw = 512 / cols, ph = 512 / rows;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const lit = Math.random() > 0.25;
            const warmCool = Math.random() > 0.5;
            const rx = c * pw + 8, ry = r * ph + 8, rw = pw - 16, rh = ph - 16;
            if (lit) {
                const wg = ctx.createLinearGradient(rx, ry, rx, ry + rh);
                if (warmCool) {
                    wg.addColorStop(0, `rgba(255,${210 + Math.random()*40},${100 + Math.random()*80},0.85)`);
                    wg.addColorStop(1, `rgba(255,${180 + Math.random()*40},60,0.6)`);
                } else {
                    wg.addColorStop(0, `rgba(180,220,${255},0.7)`);
                    wg.addColorStop(1, `rgba(120,180,255,0.5)`);
                }
                ctx.fillStyle = wg;
            } else {
                ctx.fillStyle = 'rgba(10,25,50,0.9)';
            }
            ctx.fillRect(rx, ry, rw, rh);
            // Glass sheen highlight
            ctx.fillStyle = 'rgba(220,240,255,0.12)';
            ctx.fillRect(rx, ry, rw * 0.3, rh);
            // Reflection streak
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(rx + rw * 0.1, ry, 3, rh);
        }
    }
    return new THREE.CanvasTexture(cvs);
}

function createNeonSignTexture(text, neonColor = '#ff0055', bgColor = '#0a0010') {
    const cvs = document.createElement('canvas');
    cvs.width = 1024; cvs.height = 256;
    const ctx = cvs.getContext('2d');
    
    // Parody Logos for specific production houses
    if (text === 'Dharma Prod.') {
        ctx.fillStyle = '#0a1a3a'; // Deep blue
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 110px "Times New Roman", serif';
        ctx.fillText('DHARMA', 512, 110);
        ctx.font = 'italic 40px "Times New Roman", serif';
        ctx.fillText('PRODUCTIONS', 512, 180);
        ctx.font = '50px Arial';
        ctx.fillText('\u2605', 512, 35);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'YRF Studios') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#cc0000'; // Red stroke
        ctx.fillRect(300, 60, 424, 136);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'italic bold 110px Arial';
        ctx.fillText('Y R F', 512, 135);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Netflex') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#E50914'; // Netflix Red
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 140px "Impact", sans-serif';
        ctx.fillText('NETFLEX', 512, 128);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Warner Bros') {
        ctx.fillStyle = '#008ae6';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 90px "Times New Roman", serif';
        ctx.fillText('WARNER BROS.', 512, 128);
        // Add a shield outline
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, 1004, 236);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Excel Ent') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#cc0000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 150px Arial';
        ctx.fillText('E', 220, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = '50px Arial';
        ctx.fillText('EXCEL', 340, 90);
        ctx.fillText('ENTERTAINMENT', 340, 160);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'A25') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 160px sans-serif';
        ctx.fillText('A25', 512, 128);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Pear TV') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 100px sans-serif';
        ctx.fillText('\uD83C\uDF50 tv+', 512, 128);
        return new THREE.CanvasTexture(cvs);
    } else if (text === 'Paramount') {
        ctx.fillStyle = '#003366';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 80px "Times New Roman", serif';
        ctx.fillText('Paramount', 512, 140);
        ctx.font = '50px Arial';
        ctx.fillText('\uD83C\uDFD4\uFE0F', 512, 60);
        return new THREE.CanvasTexture(cvs);
    }

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
    cvs.width = 768; cvs.height = 300;
    const ctx = cvs.getContext('2d');

    // Deep velvet background
    ctx.fillStyle = '#1a0008';
    ctx.fillRect(0, 0, 768, 300);

    // Gold border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 10;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 18;
    ctx.strokeRect(8, 8, 752, 284);
    ctx.shadowBlur = 0;

    // Crown emoji at top
    ctx.font = 'bold 48px Arial Black, Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a0008';
    ctx.fillRect(40, 36, 688, 48);
    ctx.fillStyle = '#FFD700';
    ctx.fillText('VIP BLOODLINE ENTRY', 384, 68);
    ctx.fillText('\uD83D\uDC51', 256, 52);

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
    ctx.fillText('\uD83D\uDEAB NO TALENT ALLOWED', 256, 140);
    ctx.shadowBlur = 0;

    // Dogs line
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '18px Arial';
    ctx.fillText('(nepo dogs welcome)', 256, 175);

    ctx.fillStyle = '#1a0008';
    ctx.fillRect(28, 28, 712, 244);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.strokeRect(34, 34, 700, 232);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 46px Arial Black, Arial';
    ctx.fillText('ONLY STAR KIDS', 384, 92);
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 32px Arial Black, Arial';
    ctx.fillText('AND THEIR DOGS ALLOWED', 384, 154);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f8f3d4';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('No audition. No queue. No problem.', 384, 218);

    return new THREE.CanvasTexture(cvs);
}

function createAllowedSignTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#071014';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(18, 18, 476, 476);
    ctx.fillStyle = '#13080d';
    ctx.fillRect(34, 34, 444, 444);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 44px Arial Black, Arial';
    ctx.fillText('ENTRY', 256, 96);
    ctx.fillText('RESTRICTED', 256, 148);
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 31px Arial Black, Arial';
    ctx.fillText('STAR KIDS ONLY', 256, 236);
    ctx.fillText('+ THEIR DOGS', 256, 286);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial';
    ctx.fillText('regular actors wait outside', 256, 362);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(180, 420, 22, 0, Math.PI * 2);
    ctx.arc(326, 420, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(180, 410, 146, 20);
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

// --- MATERIALS LIBRARY ---
export const MAT = {
    BRICK: (color) => new THREE.MeshStandardMaterial({
        map: createBrickTexture(color || '#8B4513'),
        normalMap: createBrickNormalMap(),
        normalScale: new THREE.Vector2(2.0, 2.0),
        roughness: 0.85,
        metalness: 0.02,
        envMapIntensity: 0.4
    }),
    GLASS: () => new THREE.MeshStandardMaterial({
        map: createGlassTexture(),
        bumpMap: createGlassTexture(),
        bumpScale: 0.05,
        roughness: 0.05,
        metalness: 0.6,
        emissiveMap: createGlassTexture(),
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.85
    }),
    ROAD: () => new THREE.MeshStandardMaterial({
        map: createRoadTexture(),
        bumpMap: createRoadTexture(),
        bumpScale: 0.1,
        roughness: 0.75,
        metalness: 0.0
    }),
    PAVEMENT: () => new THREE.MeshStandardMaterial({
        map: createPavementTexture(),
        bumpMap: createPavementTexture(),
        bumpScale: 0.15,
        roughness: 0.6,
        metalness: 0.03
    }),
    GRASS: () => new THREE.MeshStandardMaterial({
        map: createGrassTexture(),
        bumpMap: createGrassTexture(),
        bumpScale: 0.5,
        roughness: 0.92,
        metalness: 0.0
    }),
    NEON: (color) => new THREE.MeshStandardMaterial({
        color: color || 0xff0000,
        emissive: color || 0xff0000,
        emissiveIntensity: 2.0,
        roughness: 0.2,
        metalness: 0.8
    }),
    LAMP_POST: () => new THREE.MeshStandardMaterial({
        color: 0x334455,
        metalness: 0.85,
        roughness: 0.25
    }),
    LAMP_LENS: () => new THREE.MeshStandardMaterial({
        color: 0xffe8a0,
        emissive: 0xffe880,
        emissiveIntensity: 1.8,
        roughness: 0.1,
        metalness: 0.0
    }),
    CARPET: (color) => new THREE.MeshStandardMaterial({
        color: color || 0x8B0000,
        roughness: 0.95,
        metalness: 0.0
    }),
    METAL: () => new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.15
    }),
    WOOD: () => new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.7,
        metalness: 0.0
    })
};

export {
    createPavementTexture,
    createPavementNormalMap,
    createGrassTexture,
    createBrickTexture,
    createBrickNormalMap,
    createGlassTexture,
    createNeonSignTexture,
    createNepoSignTexture,
    createAllowedSignTexture,
    createRoadTexture
};

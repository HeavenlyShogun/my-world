import * as THREE from 'three';

/**
 * Procedural Canvas Texture Generators for Serene Forest Aesthetic
 * Zero external files / 404 dependencies!
 */

export function createParticleDiscTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(167, 243, 208, 0.9)'); // Soft emerald-mint corona
  gradient.addColorStop(0.6, 'rgba(52, 211, 153, 0.35)');
  gradient.addColorStop(1, 'rgba(6, 78, 59, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createFireflyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Warm golden-green firefly glow
  const grad = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
  grad.addColorStop(0, 'rgba(254, 240, 138, 1)'); // Warm gold core
  grad.addColorStop(0.3, 'rgba(134, 239, 172, 0.85)'); // Emerald corona
  grad.addColorStop(0.7, 'rgba(34, 197, 94, 0.3)');
  grad.addColorStop(1, 'rgba(20, 83, 45, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createPortalVortexTexture(themeColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep forest twilight backdrop
  ctx.fillStyle = '#03130e';
  ctx.fillRect(0, 0, 512, 512);

  const cx = 256;
  const cy = 256;

  // Background deep organic radial gradient
  const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 250);
  radGrad.addColorStop(0, '#ffffff');
  radGrad.addColorStop(0.18, themeColor);
  radGrad.addColorStop(0.65, '#06291e');
  radGrad.addColorStop(1, '#020d09');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Spiral fairy-tree / spirit vortex arms
  ctx.save();
  ctx.translate(cx, cy);

  for (let arm = 0; arm < 4; arm++) {
    const baseAngle = (arm * Math.PI) / 2;
    ctx.beginPath();
    for (let r = 12; r < 240; r += 2) {
      const theta = baseAngle + r * 0.042;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      if (r === 12) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.45;
    ctx.stroke();

    // Inner bright fairy strand
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.stroke();
  }

  // Ancient concentric druidic leaf rings
  for (let ring = 45; ring < 240; ring += 40) {
    ctx.beginPath();
    ctx.arc(0, 0, ring, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.28)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createForestRuneTileTexture(themeColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Weathered mossy forest slate stone
  ctx.fillStyle = '#0f2019';
  ctx.fillRect(0, 0, 256, 256);

  // Moss and damp soil spots
  ctx.fillStyle = '#143828';
  ctx.beginPath();
  ctx.arc(60, 50, 35, 0, Math.PI * 2);
  ctx.arc(200, 180, 45, 0, Math.PI * 2);
  ctx.arc(180, 60, 25, 0, Math.PI * 2);
  ctx.fill();

  // Stone border bevel
  ctx.strokeStyle = '#1d4834';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 244, 244);

  // Glowing Ancient Botanical / Druidic Rune
  ctx.strokeStyle = themeColor;
  ctx.shadowColor = themeColor;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  // Stylized ancient leaf / tree branch motif
  ctx.moveTo(128, 35);
  ctx.quadraticCurveTo(200, 90, 180, 170);
  ctx.quadraticCurveTo(128, 220, 128, 220);
  ctx.quadraticCurveTo(76, 170, 56, 90);
  ctx.quadraticCurveTo(128, 35, 128, 35);
  ctx.stroke();

  // Leaf spine & veins
  ctx.beginPath();
  ctx.moveTo(128, 45);
  ctx.lineTo(128, 210);
  ctx.moveTo(128, 90);
  ctx.lineTo(165, 75);
  ctx.moveTo(128, 125);
  ctx.lineTo(170, 115);
  ctx.moveTo(128, 160);
  ctx.lineTo(155, 155);
  ctx.moveTo(128, 90);
  ctx.lineTo(90, 75);
  ctx.moveTo(128, 125);
  ctx.lineTo(85, 115);
  ctx.moveTo(128, 160);
  ctx.lineTo(100, 155);
  ctx.stroke();

  // Central glowing seed crystal
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(128, 125, 6, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createForestFloorDaisTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep damp forest clearing base
  ctx.fillStyle = '#0a1d16';
  ctx.fillRect(0, 0, 512, 512);

  // Soft moss blotches
  ctx.fillStyle = '#103022';
  for (let i = 0; i < 16; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    const rad = 30 + Math.random() * 60;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = 256;
  const cy = 256;

  // Concentric Ancient Druid Rings
  for (let r = 35; r <= 240; r += 32) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = r % 64 === 0 ? 'rgba(52, 211, 153, 0.55)' : 'rgba(167, 243, 208, 0.2)';
    ctx.lineWidth = r % 64 === 0 ? 3 : 1.2;
    ctx.stroke();
  }

  // 12 Ancient Foliage Radial Petal Lines
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 35, cy + Math.sin(angle) * 35);
    ctx.lineTo(cx + Math.cos(angle) * 236, cy + Math.sin(angle) * 236);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Outer border leaf notches
  for (let i = 0; i < 48; i++) {
    const angle = (i * Math.PI) / 24;
    const r1 = 236;
    const r2 = 248;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.strokeStyle = 'rgba(110, 231, 183, 0.5)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createForestTerrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark forest loam earth
  ctx.fillStyle = '#061611';
  ctx.fillRect(0, 0, 512, 512);

  // Patches of rich moss & undergrowth
  const mossColors = ['#0c2a1e', '#133928', '#0e2319', '#194934'];
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 25 + Math.random() * 55;
    ctx.fillStyle = mossColors[i % mossColors.length];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small forest pebbles & foliage specks
  ctx.fillStyle = '#22543d';
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export function createForestMegalithTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Weathered ancient forest granite
  ctx.fillStyle = '#0a1a15';
  ctx.fillRect(0, 0, 256, 512);

  // Moss gradation from ground
  const mossGrad = ctx.createLinearGradient(0, 512, 0, 200);
  mossGrad.addColorStop(0, 'rgba(16, 60, 40, 0.8)');
  mossGrad.addColorStop(0.6, 'rgba(16, 60, 40, 0.3)');
  mossGrad.addColorStop(1, 'rgba(16, 60, 40, 0)');
  ctx.fillStyle = mossGrad;
  ctx.fillRect(0, 0, 256, 512);

  // Ancient carved ivy and tree branch veins
  ctx.strokeStyle = '#34d399';
  ctx.fillStyle = '#6ee7b7';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 10;

  // Header World-Tree Sigil
  ctx.beginPath();
  ctx.arc(128, 55, 20, 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(128, 55, 7, 0, Math.PI * 2);
  ctx.fill();

  // Vertical tree trunk spine with sprouting leaf branches
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(128, 85);
  ctx.lineTo(128, 480);
  ctx.stroke();

  // Curving branch engravings
  const branches = [120, 160, 210, 260, 320, 380, 430];
  branches.forEach((y, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(128 + dir * 35, y - 10, 128 + dir * 65, y - 5);
    ctx.stroke();

    // Sprouting leaf at end
    ctx.beginPath();
    ctx.arc(128 + dir * 65, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTreeBarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c241e';
  ctx.fillRect(0, 0, 128, 256);

  // Vertical bark ridges
  ctx.strokeStyle = '#121814';
  ctx.lineWidth = 3;
  for (let x = 8; x < 128; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x + (Math.random() - 0.5) * 4, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, 256);
    ctx.stroke();
  }

  // Moss touches
  ctx.fillStyle = 'rgba(16, 68, 44, 0.4)';
  ctx.fillRect(0, 160, 128, 96);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

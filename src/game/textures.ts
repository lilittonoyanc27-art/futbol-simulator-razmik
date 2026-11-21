import * as THREE from 'three';
import { BOX_DEPTH, BOX_HALF, CENTER_R, FIELD_L, FIELD_W, GOAL_HALF, PENALTY_DIST, SMALL_BOX_DEPTH, SMALL_BOX_HALF } from './constants';

const cache = new Map<string, THREE.Texture>();
function cached(key: string, make: () => THREE.Texture) {
  let t = cache.get(key);
  if (!t) {
    t = make();
    cache.set(key, t);
  }
  return t;
}

export const MARGIN = 4;

export function fieldTexture(a: string, b: string) {
  return cached('field' + a + b, () => {
    const W = FIELD_L + MARGIN * 2,
      H = FIELD_W + MARGIN * 2;
    const s = 24; // píxeles por metro
    const c = document.createElement('canvas');
    c.width = W * s;
    c.height = H * s;
    const g = c.getContext('2d')!;
    const stripes = 14;
    for (let i = 0; i < stripes; i++) {
      g.fillStyle = i % 2 ? a : b;
      g.fillRect((i * c.width) / stripes, 0, c.width / stripes + 1, c.height);
    }
    // ruido de césped
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * 0.05})`;
      g.fillRect(Math.random() * c.width, Math.random() * c.height, 3, 3);
    }
    const X = (x: number) => (x + W / 2) * s;
    const Y = (z: number) => (z + H / 2) * s;
    g.strokeStyle = 'rgba(255,255,255,0.92)';
    g.lineWidth = 0.12 * s;
    const hl = FIELD_L / 2,
      hw = FIELD_W / 2;
    g.strokeRect(X(-hl), Y(-hw), FIELD_L * s, FIELD_W * s);
    g.beginPath();
    g.moveTo(X(0), Y(-hw));
    g.lineTo(X(0), Y(hw));
    g.stroke();
    g.beginPath();
    g.arc(X(0), Y(0), CENTER_R * s, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = 'white';
    const dot = (x: number, z: number) => {
      g.beginPath();
      g.arc(X(x), Y(z), 0.22 * s, 0, Math.PI * 2);
      g.fill();
    };
    dot(0, 0);
    for (const sd of [1, -1]) {
      const gx = sd * hl;
      g.strokeRect(Math.min(X(gx), X(gx - sd * BOX_DEPTH)), Y(-BOX_HALF), BOX_DEPTH * s, BOX_HALF * 2 * s);
      g.strokeRect(Math.min(X(gx), X(gx - sd * SMALL_BOX_DEPTH)), Y(-SMALL_BOX_HALF), SMALL_BOX_DEPTH * s, SMALL_BOX_HALF * 2 * s);
      dot(gx - sd * PENALTY_DIST, 0);
      g.beginPath();
      const a0 = sd === 1 ? Math.PI - 0.93 : -0.93;
      g.arc(X(gx - sd * PENALTY_DIST), Y(0), 4 * s, a0, a0 + 1.86);
      g.stroke();
      // línea de gol (más gruesa entre postes)
      g.lineWidth = 0.2 * s;
      g.beginPath();
      g.moveTo(X(gx), Y(-GOAL_HALF));
      g.lineTo(X(gx), Y(GOAL_HALF));
      g.stroke();
      g.lineWidth = 0.12 * s;
      for (const sz of [1, -1]) {
        g.beginPath();
        g.arc(X(gx), Y(sz * hw), 1 * s, 0, Math.PI * 2);
        g.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  });
}

export function numberTexture(num: number, color: string, name?: string) {
  return cached(`num${num}${color}${name}`, () => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if (name) {
      g.font = 'bold 22px Arial';
      g.fillText(name.toUpperCase(), 64, 20);
    }
    g.font = '900 78px Arial Black, Arial';
    g.lineWidth = 6;
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.strokeText(String(num), 64, name ? 76 : 68);
    g.fillText(String(num), 64, name ? 76 : 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

export function ballTexture() {
  return cached('ball', () => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = '#fafafa';
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#ff7a00';
    g.fillRect(0, 118, 512, 20);
    g.fillStyle = '#111';
    const pent = (x: number, y: number, r: number) => {
      g.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      g.fill();
    };
    for (let i = 0; i < 6; i++) {
      pent(i * 86 + 20, 60, 22);
      pent(i * 86 + 63, 196, 22);
    }
    pent(256, 6, 30);
    pent(256, 250, 30);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

export function boardTexture(text: string, bg: string, fg: string) {
  return cached('board' + text + bg, () => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 64;
    const g = c.getContext('2d')!;
    g.fillStyle = bg;
    g.fillRect(0, 0, 1024, 64);
    g.fillStyle = fg;
    g.font = '900 36px Arial Black, Arial';
    g.textBaseline = 'middle';
    g.textAlign = 'center';
    g.fillText(text, 512, 34);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    return t;
  });
}

export function netTexture() {
  return cached('net', () => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const g = c.getContext('2d')!;
    g.strokeStyle = 'rgba(255,255,255,0.9)';
    g.lineWidth = 3;
    for (let i = 0; i <= 128; i += 16) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, 128);
      g.stroke();
      g.beginPath();
      g.moveTo(0, i);
      g.lineTo(128, i);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

export function labelTexture(text: string, bg = '#ff7a00', fg = '#fff') {
  return cached('label' + text + bg, () => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 96;
    const g = c.getContext('2d')!;
    g.fillStyle = bg;
    const r = 26;
    g.beginPath();
    g.roundRect(4, 4, 248, 72, r);
    g.fill();
    g.beginPath();
    g.moveTo(112, 74);
    g.lineTo(128, 94);
    g.lineTo(144, 74);
    g.fill();
    g.fillStyle = fg;
    g.font = 'bold 34px Arial';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 128, 42);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

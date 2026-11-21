// Efectos de sonido generados con Web Audio (sin archivos externos).
let ctx: AudioContext | null = null;
let crowdGain: GainNode | null = null;
let sfxOn = true;

function ac() {
  if (!ctx) {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSfx(v: boolean) {
  sfxOn = v;
  if (!v) stopCrowd();
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

export function kick(power = 0.6) {
  const c = ac();
  if (!c || !sfxOn) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(160 + power * 60, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(0.35 + power * 0.4, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.18);
}

export function whistle(long = false) {
  const c = ac();
  if (!c || !sfxOn) return;
  const t = c.currentTime;
  const dur = long ? 1.1 : 0.45;
  const o = c.createOscillator();
  const lfo = c.createOscillator();
  const lg = c.createGain();
  const g = c.createGain();
  o.type = 'square';
  o.frequency.value = 2300;
  lfo.frequency.value = 28;
  lg.gain.value = 140;
  lfo.connect(lg).connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.08, t + 0.03);
  g.gain.setValueAtTime(0.08, t + dur - 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  lfo.start(t);
  o.stop(t + dur);
  lfo.stop(t + dur);
}

export function cheer(intensity = 1) {
  const c = ac();
  if (!c || !sfxOn) return;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 3);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 900;
  bp.Q.value = 0.6;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35 * intensity, t + 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t);
}

export function ding(good = true) {
  const c = ac();
  if (!c || !sfxOn) return;
  const t = c.currentTime;
  const notes = good ? [660, 880, 1320] : [300, 220];
  notes.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = good ? 'triangle' : 'sawtooth';
    o.frequency.value = f;
    const s = t + i * 0.09;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(good ? 0.18 : 0.08, s + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.25);
    o.connect(g).connect(c.destination);
    o.start(s);
    o.stop(s + 0.3);
  });
}

export function click() {
  const c = ac();
  if (!c || !sfxOn) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.value = 900;
  g.gain.setValueAtTime(0.06, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.06);
}

let crowdSrc: AudioBufferSourceNode | null = null;
export function startCrowd() {
  const c = ac();
  if (!c || !sfxOn || crowdSrc) return;
  crowdSrc = c.createBufferSource();
  crowdSrc.buffer = noiseBuffer(c, 4);
  crowdSrc.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 600;
  crowdGain = c.createGain();
  crowdGain.gain.value = 0.045;
  crowdSrc.connect(lp).connect(crowdGain).connect(c.destination);
  crowdSrc.start();
}
export function stopCrowd() {
  try {
    crowdSrc?.stop();
  } catch {
    /* nada */
  }
  crowdSrc = null;
}

// Síntesis y reconocimiento de voz en español con comprobación de compatibilidad.

let voices: SpeechSynthesisVoice[] = [];
let lastText = '';
let rate = 0.92;
let enabled = true;

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  voices = window.speechSynthesis.getVoices();
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export const ttsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function pickVoice(): SpeechSynthesisVoice | undefined {
  if (!voices.length) loadVoices();
  const es = voices.filter((v) => v.lang.toLowerCase().startsWith('es'));
  // Preferimos voces de España, luego cualquier variante de español.
  const prefer = ['es-es', 'es_es'];
  return (
    es.find((v) => prefer.includes(v.lang.toLowerCase()) && /google|natural|neural|premium|enhanced/i.test(v.name)) ||
    es.find((v) => prefer.includes(v.lang.toLowerCase())) ||
    es.find((v) => /google|natural|neural/i.test(v.name)) ||
    es[0]
  );
}

export function setSpeechRate(r: number) {
  rate = r;
}
export function setVoiceEnabled(v: boolean) {
  enabled = v;
  if (!v && ttsSupported()) window.speechSynthesis.cancel();
}

export type SpeakOpts = { rate?: number; pitch?: number; interrupt?: boolean; force?: boolean };

export function speak(text: string, opts: SpeakOpts = {}): Promise<void> {
  lastText = text;
  if (!ttsSupported() || (!enabled && !opts.force)) return Promise.resolve();
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (opts.interrupt !== false) synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[«»]/g, ''));
    u.lang = 'es-ES';
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = opts.rate ?? rate;
    u.pitch = opts.pitch ?? 1;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onend = finish;
    u.onerror = finish;
    // Seguridad: algunos navegadores no disparan onend.
    setTimeout(finish, 1200 + text.length * 110);
    synth.speak(u);
  });
}

export function repeatLast(opts: SpeakOpts = {}) {
  if (lastText) return speak(lastText, { ...opts, force: true });
  return Promise.resolve();
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

// ---------- Reconocimiento de voz ----------

type RecCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function getRec(): RecCtor | null {
  const w = window as any;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as RecCtor | null;
}

export const recognitionSupported = () => typeof window !== 'undefined' && !!getRec();

export type RecResult = { ok: true; transcripts: string[] } | { ok: false; error: string };

export function listenOnce(timeoutMs = 7000): Promise<RecResult> {
  const Ctor = getRec();
  if (!Ctor) return Promise.resolve({ ok: false, error: 'unsupported' });
  stopSpeaking();
  return new Promise((resolve) => {
    let finished = false;
    const rec = new Ctor();
    rec.lang = 'es-ES';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    const end = (r: RecResult) => {
      if (finished) return;
      finished = true;
      try {
        rec.abort();
      } catch {
        /* nada */
      }
      resolve(r);
    };
    rec.onresult = (e: any) => {
      const res = e.results[0];
      const list: string[] = [];
      for (let i = 0; i < res.length; i++) list.push(res[i].transcript);
      end({ ok: true, transcripts: list });
    };
    rec.onerror = (e: any) => end({ ok: false, error: e?.error || 'error' });
    rec.onend = () => end({ ok: false, error: 'no-speech' });
    setTimeout(() => end({ ok: false, error: 'timeout' }), timeoutMs);
    try {
      rec.start();
    } catch {
      end({ ok: false, error: 'start-failed' });
    }
  });
}

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zñ0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lev(a: string, b: string) {
  const m = a.length,
    n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

/** Similitud 0..1 entre lo que dijo el niño y la frase objetivo. */
export function similarity(said: string, target: string) {
  const a = normalize(said),
    b = normalize(target);
  if (!a || !b) return 0;
  const charSim = 1 - lev(a, b) / Math.max(a.length, b.length);
  const wa = new Set(a.split(' '));
  const wb = b.split(' ');
  const wordSim = wb.filter((w) => wa.has(w)).length / wb.length;
  return Math.max(charSim, wordSim * 0.95);
}

export function bestMatch(transcripts: string[], options: string[]) {
  let best = { index: -1, score: 0 };
  for (const t of transcripts)
    options.forEach((o, i) => {
      const s = similarity(t, o);
      if (s > best.score) best = { index: i, score: s };
    });
  return best;
}

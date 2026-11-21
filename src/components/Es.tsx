import React, { useRef, useState } from 'react';
import { create } from 'zustand';
import { Phrase, UI } from '../i18n/ui';
import { glossWords } from '../i18n/glossary';
import { speak, repeatLast, listenOnce, recognitionSupported, similarity } from '../audio/speech';
import { useGame } from '../store';
import { click, ding } from '../audio/sfx';

// ---------- Ventana emergente de traducción (una sola en toda la app) ----------
type Pop = { phrase: Phrase | null; x: number; y: number; open: (p: Phrase, el: HTMLElement | null) => void; close: () => void };
export const usePop = create<Pop>((set) => ({
  phrase: null,
  x: 0,
  y: 0,
  open: (phrase, el) => {
    const r = el?.getBoundingClientRect();
    set({ phrase, x: r ? r.left + r.width / 2 : window.innerWidth / 2, y: r ? r.bottom : window.innerHeight / 3 });
    const g = useGame.getState();
    g.stat('translations');
    g.learnPhrase(phrase.es, 1);
  },
  close: () => set({ phrase: null }),
}));

export function TranslationPopover() {
  const { phrase, x, y, close } = usePop();
  if (!phrase) return null;
  const words = glossWords(phrase.es).filter((w) => w.hy);
  const left = Math.max(12, Math.min(window.innerWidth - 332, x - 160));
  const top = Math.min(window.innerHeight - 220, y + 8);
  return (
    <div className="pop-backdrop" onPointerDown={close}>
      <div className="pop" style={{ left, top }} onPointerDown={(e) => e.stopPropagation()}>
        <div className="pop-es">{phrase.es}</div>
        <div className="pop-hy" lang="hy">
          🇦🇲 {phrase.hy}
        </div>
        {words.length > 1 && (
          <div className="pop-words">
            {words.map((w, i) => (
              <span key={i} className="chip" title={w.hy} onClick={() => speak(w.word.replace(/[¡!¿?.,]/g, ''), { force: true })}>
                <b>{w.word.replace(/[¡!¿?.,;:]/g, '')}</b> <span lang="hy">{w.hy}</span>
              </span>
            ))}
          </div>
        )}
        <div className="pop-actions">
          <button className="mini" onClick={() => speak(phrase.es, { force: true })}>
            🔊 {UI.listen.es}
          </button>
          <button className="mini" onClick={close}>
            ✖ {UI.close.es}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Texto en español interactivo ----------
type EsProps = { t: Phrase; as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'b' | 'small'; className?: string; style?: React.CSSProperties; speakOnClick?: boolean };
export function Es({ t, as = 'span', className = '', style, speakOnClick }: EsProps) {
  const open = usePop((s) => s.open);
  const ref = useRef<HTMLElement>(null);
  const Tag = as as any;
  return (
    <Tag
      ref={ref}
      className={`es ${className}`}
      style={style}
      lang="es"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        open(t, ref.current);
        if (speakOnClick) speak(t.es);
      }}
    >
      {t.es}
    </Tag>
  );
}

// ---------- Botón con etiqueta española: en modo traducción o con pulsación larga muestra el armenio ----------
type BtnProps = {
  label: Phrase;
  icon?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  sub?: Phrase;
};
export function Btn({ label, icon, onClick, className = '', disabled, children, style, sub }: BtnProps) {
  const translateMode = useGame((s) => s.translateMode);
  const open = usePop((s) => s.open);
  const ref = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | null>(null);
  const longPressed = useRef(false);
  return (
    <button
      ref={ref}
      className={`btn ${className} ${translateMode ? 'tmode' : ''}`}
      disabled={disabled}
      style={style}
      lang="es"
      onContextMenu={(e) => {
        e.preventDefault();
        open(label, ref.current);
      }}
      onPointerDown={() => {
        longPressed.current = false;
        timer.current = window.setTimeout(() => {
          longPressed.current = true;
          open(label, ref.current);
        }, 550);
      }}
      onPointerUp={() => timer.current && clearTimeout(timer.current)}
      onPointerLeave={() => timer.current && clearTimeout(timer.current)}
      onClick={(e) => {
        e.stopPropagation();
        if (longPressed.current) return;
        if (translateMode) {
          open(label, ref.current);
          return;
        }
        click();
        onClick?.();
      }}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-label">{label.es}</span>
      {sub && <span className="btn-sub">{sub.es}</span>}
      {children}
    </button>
  );
}

// ---------- Tarjeta de frase con Escuchar / Traducir / Repetir / Hablar ----------
type CardProps = { t: Phrase; speaker?: string; autoSpeak?: boolean; compact?: boolean; onSpoken?: (ok: boolean) => void; className?: string };
export function PhraseCard({ t, speaker, autoSpeak, compact, onSpoken, className = '' }: CardProps) {
  const open = usePop((s) => s.open);
  const ref = useRef<HTMLDivElement>(null);
  const [showHy, setShowHy] = useState(false);
  const [rec, setRec] = useState<'idle' | 'listening' | 'ok' | 'almost' | 'nomic'>('idle');
  const [heard, setHeard] = useState('');
  const g = useGame();

  React.useEffect(() => {
    setShowHy(false);
    setRec('idle');
    setHeard('');
    if (autoSpeak) speak(t.es);
  }, [t.es]);

  const doSpeak = async () => {
    g.stat('speakAttempts');
    if (!recognitionSupported()) {
      setRec('nomic');
      return;
    }
    setRec('listening');
    const r = await listenOnce();
    if (!r.ok) {
      setRec(r.error === 'not-allowed' || r.error === 'service-not-allowed' || r.error === 'unsupported' ? 'nomic' : 'almost');
      return;
    }
    const best = Math.max(...r.transcripts.map((x) => similarity(x, t.es)));
    setHeard(r.transcripts[0]);
    if (best >= 0.62) {
      setRec('ok');
      ding(true);
      g.stat('speakSuccess');
      g.learnPhrase(t.es, 2);
      g.addXP(10);
      onSpoken?.(true);
    } else {
      setRec('almost');
      ding(false);
      onSpoken?.(false);
    }
  };

  return (
    <div ref={ref} className={`phrase-card ${compact ? 'compact' : ''} ${className}`}>
      {speaker && <div className="speaker">{speaker}</div>}
      <div className="phrase-es es" lang="es" onClick={() => open(t, ref.current)}>
        {t.es}
      </div>
      {showHy && (
        <div className="phrase-hy" lang="hy">
          🇦🇲 {t.hy}
        </div>
      )}
      <div className="phrase-actions">
        <button className="mini" onClick={() => { speak(t.es, { force: true }); g.learnPhrase(t.es, 1); }}>
          🔊 <span>{UI.listen.es}</span>
        </button>
        <button
          className="mini"
          onClick={() => {
            setShowHy((v) => !v);
            if (!showHy) g.stat('translations');
          }}
        >
          🇦🇲 <span>{UI.translate.es}</span>
        </button>
        <button className="mini" onClick={() => repeatLast({ rate: 0.75 })}>
          🔁 <span>{UI.repeat.es}</span>
        </button>
        <button className={`mini ${rec === 'listening' ? 'pulse' : ''}`} onClick={doSpeak}>
          🎤 <span>{UI.speak.es}</span>
        </button>
      </div>
      {rec === 'listening' && <div className="rec-msg">🎙️ {UI.listeningNow.es}</div>}
      {rec === 'ok' && (
        <div className="rec-msg ok">
          ✅ {UI.great.es} <small>«{heard}»</small>
        </div>
      )}
      {rec === 'almost' && (
        <div className="rec-msg warn">
          🙂 <Es t={UI.almost} /> {heard && <small>«{heard}»</small>}
        </div>
      )}
      {rec === 'nomic' && (
        <div className="rec-msg warn">
          <Es t={UI.noMic} />
          <div>
            <button
              className="mini"
              onClick={() => {
                setRec('ok');
                g.learnPhrase(t.es, 1);
                g.addXP(4);
                onSpoken?.(true);
              }}
            >
              ✅ {UI.iSaidIt.es}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast-icon">{t.icon}</span>
          <div>
            <Es t={t.text} as="div" className="toast-title" />
            {t.sub && <div className="toast-sub">{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

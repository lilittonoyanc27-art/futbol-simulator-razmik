import { useEffect, useRef, useState } from 'react';
import { InputState } from './input';
import { useGame } from '../store';
import { usePop } from '../components/Es';
import { UI, Phrase } from '../i18n/ui';

type Props = { input: InputState; hasBall: () => boolean; setPiece?: () => boolean };

export function TouchControls({ input, hasBall, setPiece }: Props) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false });
  const pid = useRef<number | null>(null);
  const [ball, setBall] = useState(false);
  const translateMode = useGame((s) => s.translateMode);
  const open = usePop((s) => s.open);

  useEffect(() => {
    const t = setInterval(() => setBall(hasBall() || !!setPiece?.()), 150);
    return () => clearInterval(t);
  }, [hasBall, setPiece]);

  const move = (cx: number, cy: number) => {
    const r = base.current!.getBoundingClientRect();
    const ox = r.left + r.width / 2,
      oy = r.top + r.height / 2;
    let dx = cx - ox,
      dy = cy - oy;
    const max = r.width / 2;
    const d = Math.hypot(dx, dy);
    if (d > max) {
      dx = (dx / d) * max;
      dy = (dy / d) * max;
    }
    setKnob({ x: dx, y: dy, active: true });
    input.x = dx / max;
    input.y = -dy / max;
  };

  const btn = (label: Phrase, icon: string, cls: string, down: () => void, up?: () => void) => (
    <button
      className={`tbtn ${cls}`}
      onPointerDown={(e) => {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        if (translateMode) {
          open(label, e.currentTarget);
          return;
        }
        down();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        up?.();
      }}
      onPointerCancel={() => up?.()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="tbtn-icon">{icon}</span>
      <span className="tbtn-label">{label.es}</span>
    </button>
  );

  return (
    <div className="touch">
      <div
        ref={base}
        className="joy"
        onPointerDown={(e) => {
          pid.current = e.pointerId;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          move(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => pid.current === e.pointerId && move(e.clientX, e.clientY)}
        onPointerUp={() => {
          pid.current = null;
          setKnob({ x: 0, y: 0, active: false });
          input.x = 0;
          input.y = 0;
        }}
        onPointerCancel={() => {
          pid.current = null;
          setKnob({ x: 0, y: 0, active: false });
          input.x = 0;
          input.y = 0;
        }}
      >
        <div className="joy-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
      <div className="tbtns">
        {btn(UI.shoot, '⚽', 'shoot', () => (input.shootHeld = true), () => (input.shootHeld = false))}
        {btn(ball ? UI.pass : UI.tackle, ball ? '➡️' : '🦵', 'pass', () => (input.pass = true))}
        {btn(UI.sprint, '⚡', 'sprint', () => (input.sprint = true), () => (input.sprint = false))}
        {btn(UI.jump, '⤴️', 'jump', () => (input.jump = true))}
      </div>
    </div>
  );
}

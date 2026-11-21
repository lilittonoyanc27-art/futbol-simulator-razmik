import { useRef, useState } from 'react';
import { GameView } from '../game/GameView';
import { Engine, GameEvent, Player } from '../game/engine';
import { Btn, Es } from '../components/Es';
import { CALL } from '../data/callouts';
import { useGame, getStadium } from '../store';
import { UI, Phrase, p } from '../i18n/ui';
import { speak } from '../audio/speech';
import { ding, whistle, cheer } from '../audio/sfx';
import { STADIUMS, levelFromXP } from '../data/progression';
import { HALF_L, HALF_W } from '../game/constants';

export type MatchSettings = { minutes: number; difficulty: number; stadium: string; rival?: Phrase };
export type MatchResult = { us: number; them: number; bonuses: number; razmikGoals: number };

type Callout = { id: number; who: string; phrase: Phrase; t: number; key?: boolean };
type Objective = {
  kind: 'passTo' | 'keep' | 'passRight' | 'mark' | 'shoot' | 'zoneRight' | 'zoneLeft';
  until: number;
  target?: Player;
  start: number;
  big?: boolean;
};

export function MatchSetup({ onStart, onBack }: { onStart: (s: MatchSettings) => void; onBack: () => void }) {
  const g = useGame();
  const lvl = levelFromXP(g.xp);
  const [minutes, setMinutes] = useState(4);
  const [diff, setDiff] = useState(0.35);
  return (
    <div className="screen">
      <div className="screen-head">
        <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onBack} />
        <Es t={UI.match} as="h1" />
      </div>
      <div className="card">
        <Es t={UI.duration} as="h3" />
        <div className="row">
          {[3, 4, 6].map((m) => (
            <Btn key={m} label={p(`${m} minutos`, `${m} րոպե`)} className={minutes === m ? 'active' : 'ghost'} onClick={() => setMinutes(m)} />
          ))}
        </div>
        <Es t={UI.difficulty} as="h3" />
        <div className="row">
          {[
            [UI.easy, 0.15],
            [UI.medium, 0.45],
            [UI.hard, 0.8],
          ].map(([l, v]) => (
            <Btn key={String(v)} label={l as Phrase} className={diff === v ? 'active' : 'ghost'} onClick={() => setDiff(v as number)} />
          ))}
        </div>
        <Es t={UI.stadium} as="h3" />
        <div className="row wrap">
          {STADIUMS.map((s) => (
            <Btn
              key={s.id}
              label={s.name}
              icon={s.unlockLevel > lvl ? '🔒' : '🏟️'}
              disabled={s.unlockLevel > lvl}
              className={g.stadium === s.id ? 'active' : 'ghost'}
              onClick={() => g.setStadium(s.id)}
            />
          ))}
        </div>
        <Btn label={UI.start2} icon="⚽" className="big" onClick={() => onStart({ minutes, difficulty: diff, stadium: g.stadium })} />
      </div>
    </div>
  );
}

let cid = 1;

export function Match({ settings, onExit, onComplete }: { settings: MatchSettings; onExit: () => void; onComplete?: (r: MatchResult) => void }) {
  const g = useGame();
  const [callouts, setCallouts] = useState<Callout[]>([]);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [keyMsg, setKeyMsg] = useState<Phrase | null>(null);
  const d = useRef({
    lastSpeak: 0,
    lastCall: {} as Record<string, number>,
    obj: null as Objective | null,
    bonuses: 0,
    razmikGoals: 0,
    keyMoments: [0.18, 0.45, 0.72] as number[],
    keyIdx: 0,
    ended: false,
    lastMin: false,
    ownerSince: 0,
    passes: 0,
    shots: 0,
  });
  const duration = settings.minutes * 60;
  const cefr = g.cefr;

  const push = (who: string, phrase: Phrase, opts: { speak?: boolean; key?: boolean } = {}) => {
    const c: Callout = { id: cid++, who, phrase, t: performance.now(), key: opts.key };
    setCallouts((cs) => [...cs.slice(-2), c]);
    setTimeout(() => setCallouts((cs) => cs.filter((x) => x.id !== c.id)), opts.key ? 9000 : 4500);
    const now = performance.now();
    if (opts.speak !== false && (now - d.current.lastSpeak > 1800 || opts.key)) {
      d.current.lastSpeak = now;
      speak(phrase.es, { rate: cefr === 'A1' ? 0.85 : undefined });
    }
    g.learnPhrase(phrase.es, 1);
  };
  const can = (key: string, cooldown: number) => {
    const now = performance.now();
    if (now - (d.current.lastCall[key] || 0) < cooldown * 1000) return false;
    d.current.lastCall[key] = now;
    return true;
  };
  const bonus = (big = false) => {
    d.current.bonuses++;
    g.stat('understood');
    g.addXP(big ? 40 : 15);
    ding(true);
    push('👨‍🏫', big ? CALL.wellUnderstood : CALL.goodPass, { speak: big });
    g.toast({ icon: '🧠', text: UI.bonus, sub: big ? '+40 XP' : '+15 XP' });
  };
  const setObj = (o: Omit<Objective, 'start'>, e: Engine) => {
    d.current.obj = { ...o, start: e.clock };
  };

  const onEvent = (ev: GameEvent, e: Engine) => {
    const h = e.human;
    const o = d.current.obj;
    switch (ev.type) {
      case 'kickoff':
        if (e.clock < 1) push('👨‍🏫', CALL.kickoff);
        break;
      case 'goal':
        if (ev.team === 0) {
          if (ev.scorer === h) {
            d.current.razmikGoals++;
            g.stat('goals');
            g.addXP(30);
            push('🎙️', Math.random() < 0.5 ? CALL.golazo : CALL.goal);
          } else push('🎙️', CALL.teamGoal);
        } else push('👨‍🏫', CALL.conceded);
        break;
      case 'passComplete':
        if (ev.from === h) {
          g.stat('passes');
          d.current.passes++;
          if (o && o.kind === 'passTo' && ev.to === o.target) {
            bonus(o.big);
            d.current.obj = null;
          } else if (o && o.kind === 'passRight' && ev.to.pos.z > h.pos.z + 2) {
            bonus();
            d.current.obj = null;
          } else if (can('thanks', 12) && Math.random() < 0.4) push(ev.to.name, CALL.thanks);
        }
        break;
      case 'shot':
        if (ev.by === h) {
          g.stat('shots');
          d.current.shots++;
          if (o && o.kind === 'shoot') {
            bonus();
            d.current.obj = null;
          }
        }
        break;
      case 'save':
        if (ev.shooter === h && can('save', 6)) push('🎙️', CALL.save);
        break;
      case 'miss':
        if (ev.shooter === h && can('miss', 6)) push('🎙️', CALL.close);
        break;
      case 'lost':
        if (ev.player === h) {
          if (o && o.kind === 'keep') d.current.obj = null;
          if (can('lost', 10)) push('👨‍🏫', CALL.dontLose);
        }
        break;
      case 'gain':
        if (ev.player === h && ev.prev && ev.prev.team === 1 && can('steal', 10)) push('👨‍🏫', CALL.steal);
        if (ev.player === h) d.current.ownerSince = e.clock;
        break;
      case 'foul':
        push('🧑‍🦱', CALL.foul);
        setTimeout(() => push('👨‍🏫', ev.inBox ? CALL.penaltyCall : CALL.freeKickCall, { key: true }), 1300);
        break;
    }
  };

  const onFrame = (_dt: number, e: Engine) => {
    if (d.current.ended) return;
    const h = e.human;
    const b = e.ball();
    const t = e.clock;
    // final del partido
    if (t >= duration && e.freeze <= 0 && !e.setPiece) {
      d.current.ended = true;
      e.paused = true;
      whistle(true);
      const [us, them] = e.score;
      if (us > them) cheer(1.4);
      push('👨‍🏫', us > them ? CALL.win : us === them ? CALL.draw : CALL.lose);
      g.recordMatch(us, them);
      if (d.current.razmikGoals >= 3) g.unlock('hatTrick');
      setResult({ us, them, bonuses: d.current.bonuses, razmikGoals: d.current.razmikGoals });
      return;
    }
    if (!d.current.lastMin && t > duration * 0.85) {
      d.current.lastMin = true;
      push('👨‍🏫', CALL.lastMinutes);
    }
    if (e.freeze > 0 || e.setPiece) return;
    // caducidad / cumplimiento de objetivos continuos
    const o = d.current.obj;
    if (o) {
      if (t > o.until) {
        d.current.obj = null;
        if (o.kind === 'keep' && e.owner === h) bonus();
      } else if (o.kind === 'mark') {
        const carrier = e.owner && e.owner.team === 1 ? e.owner : o.target;
        if (carrier && Math.hypot(carrier.pos.x - h.pos.x, carrier.pos.z - h.pos.z) < 3) {
          bonus();
          d.current.obj = null;
        }
      } else if (o.kind === 'zoneRight' && h.pos.z > HALF_W - 7) {
        bonus(true);
        d.current.obj = null;
      } else if (o.kind === 'zoneLeft' && h.pos.z < -HALF_W + 7) {
        bonus(true);
        d.current.obj = null;
      }
      return;
    }
    // Momentos clave: el entrenador da una orden concreta
    const km = d.current.keyMoments[d.current.keyIdx];
    if (km !== undefined && t > duration * km) {
      d.current.keyIdx++;
      const mates = e.players.filter((pl) => pl.team === 0 && !pl.human && pl.role !== 'GK');
      if (e.owner === h || Math.random() < 0.5) {
        const m = mates[(Math.random() * mates.length) | 0];
        const ph = CALL.passTo(m.number, m.name);
        setKeyMsg(ph);
        setTimeout(() => setKeyMsg(null), 9000);
        push('👨‍🏫', ph, { key: true });
        setObj({ kind: 'passTo', target: m, until: t + 12, big: true }, e);
      } else {
        const right = h.pos.z < 0;
        const ph = right ? CALL.goRight : CALL.goLeft;
        setKeyMsg(ph);
        setTimeout(() => setKeyMsg(null), 8000);
        push('👨‍🏫', ph, { key: true });
        setObj({ kind: right ? 'zoneRight' : 'zoneLeft', until: t + 10, big: true }, e);
      }
      return;
    }
    // Situaciones de juego que generan órdenes naturales
    if (e.owner === h) {
      const held = t - d.current.ownerSince;
      const gx = HALF_L;
      const distGoal = Math.hypot(gx - h.pos.x, h.pos.z);
      if (distGoal < 17 && can('shoot', 9)) {
        push('👨‍🏫', CALL.shoot);
        setObj({ kind: 'shoot', until: t + 3.5 }, e);
        return;
      }
      // rival por detrás
      const f = e.facing(h);
      const behind = e.players.find((pl) => {
        if (pl.team !== 1 || pl.role === 'GK') return false;
        const dx = pl.pos.x - h.pos.x,
          dz = pl.pos.z - h.pos.z;
        const dd = Math.hypot(dx, dz);
        return dd < 3.2 && (dx * f.x + dz * f.z) / dd < -0.3;
      });
      if (behind && can('careful', 14)) {
        push('🧑', CALL.careful);
        setObj({ kind: 'keep', until: t + 2.5 }, e);
        return;
      }
      if (held > 0.8) {
        const mates = e.players.filter((pl) => pl.team === 0 && !pl.human && pl.role !== 'GK');
        const free = mates.find(
          (m) => m.pos.x > h.pos.x - 2 && e.players.every((pl) => pl.team === 0 || Math.hypot(pl.pos.x - m.pos.x, pl.pos.z - m.pos.z) > 5),
        );
        if (free && can('free', 11)) {
          push(free.name, Math.random() < 0.5 ? CALL.free : CALL.passMe);
          free.highlight = cefr === 'A1' || cefr === 'A2' ? 5 : 0;
          setObj({ kind: 'passTo', target: free, until: t + 6 }, e);
          return;
        }
        const runner = mates.find((m) => m.pos.z > h.pos.z + 5 && m.pos.x > h.pos.x);
        if (runner && can('right', 16)) {
          push(runner.name, CALL.right);
          setObj({ kind: 'passRight', until: t + 6 }, e);
          return;
        }
      }
    } else if (e.owner && e.owner.team === 1 && e.owner.pos.x < 0 && b.x < 0) {
      if (can('mark', 15)) {
        push('👨‍🏫', Math.random() < 0.5 ? CALL.mark : CALL.defend);
        setObj({ kind: 'mark', target: e.owner, until: t + 6 }, e);
      }
    }
  };

  const labels = () => {
    const out: Record<number, string | null> = {};
    const o = d.current.obj;
    if (o?.target && o.kind === 'passTo' && !o.big && (cefr === 'A1' || cefr === 'A2')) out[o.target.id] = `${o.target.name} ${o.target.number}`;
    return out;
  };

  return (
    <GameView
      config={{ mode: 'match', difficulty: settings.difficulty }}
      stadiumId={settings.stadium}
      onEvent={onEvent}
      onFrame={onFrame}
      onExit={onExit}
      labels={labels}
      clockLabel={(e) => `${Math.min(90, Math.floor((e.clock / duration) * 90))}'`}
      hud={() => (
        <>
          <div className="callouts">
            {callouts.map((c) => (
              <div key={c.id} className={`callout ${c.key ? 'key' : ''}`}>
                <span className="who">{c.who}</span> <Es t={c.phrase} speakOnClick />
              </div>
            ))}
          </div>
          {keyMsg && (
            <div className="key-moment">
              ⭐ <Es t={UI.keyMoment} />
            </div>
          )}
        </>
      )}
      overlay={
        result ? (
          <div className="modal-bg">
            <div className="modal">
              <div className="big-emoji">{result.us > result.them ? '🏆' : result.us === result.them ? '🤝' : '💪'}</div>
              <Es t={UI.finalWhistle} as="h2" />
              <Es t={result.us > result.them ? UI.win : result.us === result.them ? UI.draw : UI.lose} as="h3" />
              <div className="final-score">
                {result.us} - {result.them}
              </div>
              <div className="stat-list">
                <div>
                  <Es t={UI.goalsScored} />: <b>{result.razmikGoals}</b>
                </div>
                <div>
                  <Es t={UI.passesDone} />: <b>{d.current.passes}</b>
                </div>
                <div>
                  <Es t={UI.shotsDone} />: <b>{d.current.shots}</b>
                </div>
                <div>
                  <Es t={UI.understood} />: <b>{result.bonuses}</b>
                </div>
              </div>
              <div className="row">
                <Btn
                  label={UI.next}
                  icon="➡️"
                  onClick={() => {
                    onComplete?.(result);
                    onExit();
                  }}
                />
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );
}

export const defaultStadium = (id: string) => getStadium(id);

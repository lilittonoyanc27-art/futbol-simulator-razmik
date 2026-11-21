import { useMemo, useRef, useState } from 'react';
import { GameView } from '../game/GameView';
import { Engine, GameEvent } from '../game/engine';
import { Btn, Es, PhraseCard } from '../components/Es';
import { COACH_INTRO, PRAISE, TRAINING, Task, WRONG, ZONES, Check, ZoneId, outsideBox } from '../data/training';
import { Cefr, useGame } from '../store';
import { UI, p } from '../i18n/ui';
import { speak } from '../audio/speech';
import { ding } from '../audio/sfx';
import { Zone } from '../game/GameScene';

const LEVELS: Cefr[] = ['A1', 'A2', 'B1', 'B2'];
const LEVEL_DESC: Record<Cefr, ReturnType<typeof p>> = {
  A1: p('Órdenes cortas: corre, pasa, dispara', 'Կարճ հրահանգներ․ վազի՛ր, փոխանցի՛ր, հարվածի՛ր'),
  A2: p('Lugares del campo y números', 'Դաշտի վայրեր և համարներ'),
  B1: p('Dos acciones seguidas: primero… después…', 'Երկու գործողություն իրար հետևից․ սկզբում… հետո…'),
  B2: p('Condiciones y frases largas', 'Պայմաններ և երկար նախադասություններ'),
};

export function TrainingSelect({ onPick, onBack }: { onPick: (c: Cefr) => void; onBack: () => void }) {
  const done = useGame((s) => s.trainingDone);
  return (
    <div className="screen">
      <div className="screen-head">
        <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onBack} />
        <Es t={UI.training} as="h1" />
      </div>
      <PhraseCard t={COACH_INTRO} speaker="👨‍🏫 Entrenador" autoSpeak />
      <Es t={UI.chooseLevel} as="h2" />
      <div className="grid4">
        {LEVELS.map((c) => (
          <div key={c} className="card level-card" onClick={() => onPick(c)}>
            <div className={`cefr cefr-${c}`}>{c}</div>
            <Es t={LEVEL_DESC[c]} as="p" />
            <div className="bar">
              <div style={{ width: `${((done[c] || 0) / TRAINING[c].length) * 100}%` }} />
            </div>
            <small>
              {done[c] || 0} / {TRAINING[c].length}
            </small>
            <Btn label={UI.play} icon="▶️" onClick={() => onPick(c)} />
          </div>
        ))}
      </div>
    </div>
  );
}

type Props = { cefr: Cefr; onExit: () => void; onComplete?: (ok: boolean) => void; tasks?: Task[] };

export function Training({ cefr, onExit, onComplete, tasks: customTasks }: Props) {
  const tasks = customTasks || TRAINING[cefr];
  const [idx, setIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [praise, setPraise] = useState<ReturnType<typeof p> | null>(null);
  const [warn, setWarn] = useState<ReturnType<typeof p> | null>(null);
  const [finished, setFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const g = useGame();
  const eng = useRef<Engine | null>(null);
  const talkingUntil = useRef(0);
  const st = useRef({ sprint: 0, taskTime: 0, warnT: 0, completing: false, shotX: 0 });
  const task = tasks[Math.min(idx, tasks.length - 1)];
  const step: Check | undefined = task?.steps[stepIdx];
  const cur = useRef({ idx: 0, step: 0 });
  const curTask = () => tasks[cur.current.idx];
  const curStep = (): Check | undefined => curTask()?.steps[cur.current.step];
  const setStep = (n: number) => {
    cur.current.step = n;
    setStepIdx(n);
  };

  const say = (t: string) => {
    talkingUntil.current = performance.now() + 900 + t.length * 70;
    speak(t);
  };

  const startTask = (i: number) => {
    setIdx(i);
    cur.current.idx = i;
    setStep(0);
    setShowHint(false);
    st.current.sprint = 0;
    st.current.taskTime = 0;
    st.current.completing = false;
    const t = tasks[i];
    if (eng.current) {
      eng.current.aiEnabled = true;
      // si el balón está lejos, lo acercamos a Razmik
      const e = eng.current;
      const b = e.ball();
      if (Math.hypot(b.x - e.human.pos.x, b.z - e.human.pos.z) > 12 && e.owner?.team !== 0) e.placeBall(e.human.pos.x + 1.5, e.human.pos.z);
    }
    setTimeout(() => say(t.say.es), 400);
  };

  const advance = () => {
    const task = curTask();
    const idx = cur.current.idx;
    if (!task || st.current.completing) return;
    if (cur.current.step + 1 < task.steps.length) {
      setStep(cur.current.step + 1);
      ding(true);
      return;
    }
    st.current.completing = true;
    const pr = PRAISE[(Math.random() * PRAISE.length) | 0];
    setPraise(pr);
    say(pr.es);
    ding(true);
    g.addXP(15);
    g.learnPhrase(task.say.es, 2);
    g.stat('understood');
    g.setTraining(cefr, idx + 1);
    g.unlock('firstTraining');
    setTimeout(() => {
      setPraise(null);
      if (idx + 1 >= tasks.length) {
        setFinished(true);
        if (cefr === 'A1' && !customTasks) g.unlock('allTrainingA1');
        if (cefr === 'B2' && !customTasks) g.unlock('allTrainingB2');
        g.addXP(60);
        say(UI.levelComplete.es);
      } else startTask(idx + 1);
    }, 2000);
  };

  const warnOnce = (w: ReturnType<typeof p>) => {
    if (performance.now() - st.current.warnT < 3500) return;
    st.current.warnT = performance.now();
    setWarn(w);
    ding(false);
    say(w.es);
    setTimeout(() => setWarn(null), 3000);
  };

  // gestionar el paso "di la frase": el compañero espera con el balón
  const prepareSay = (e: Engine, mate: number) => {
    const m = e.playerByNumber(0, mate);
    if (!m) return;
    e.aiEnabled = false;
    const b = e.ball();
    const near = Math.hypot(b.x - m.pos.x, b.z - m.pos.z) < 3;
    if (e.owner !== m && e.pendingPass?.to !== m && !near) {
      e.placeBall(m.pos.x + 0.6, m.pos.z);
    }
  };

  const onEvent = (ev: GameEvent, e: Engine) => {
    const step = curStep();
    if (!step || finished || st.current.completing) return;
    const h = e.human;
    switch (step.k) {
      case 'touch':
        if (ev.type === 'gain' && ev.player === h) advance();
        break;
      case 'pass':
        if (ev.type === 'passComplete' && ev.from === h) {
          if (!step.to || ev.to.number === step.to) advance();
          else warnOnce(WRONG.pass);
        }
        break;
      case 'receive':
        if (ev.type === 'passComplete' && ev.to === h && (!step.from || ev.from.number === step.from)) advance();
        break;
      case 'shoot':
        if (ev.type === 'shot' && ev.by === h) {
          if (step.minPower && ev.power < step.minPower) warnOnce(WRONG.weak);
          else if (step.outsideBox && !outsideBox(e.ball().x)) warnOnce(WRONG.inside);
          else advance();
        }
        break;
      case 'goal':
        if (ev.type === 'goal' && ev.team === 0) advance();
        break;
      case 'jump':
        if (ev.type === 'jump') advance();
        break;
    }
  };

  const onFrame = (dt: number, e: Engine) => {
    const step = curStep();
    const task = curTask();
    if (!step || finished || st.current.completing || e.freeze > 0) return;
    st.current.taskTime += dt;
    if (st.current.taskTime > 18 && !showHint) setShowHint(true);
    const h = e.human;
    if (step.k === 'sprint') {
      if (h.sprinting) st.current.sprint += dt;
      if (st.current.sprint >= step.secs) advance();
    }
    if (step.k === 'zone') {
      const z = ZONES[step.zone];
      const inside = Math.hypot(h.pos.x - z.x, h.pos.z - z.z) < z.r;
      if (inside && (!step.withBall || e.owner === h)) advance();
      else if (task.zones) {
        for (const zid of task.zones) {
          if (zid === step.zone) continue;
          const o = ZONES[zid];
          if (Math.hypot(h.pos.x - o.x, h.pos.z - o.z) < o.r) warnOnce(WRONG.zone);
        }
      }
    }
    if (step.k === 'say' && e.aiEnabled) prepareSay(e, step.mate);
  };

  const zones: Zone[] = useMemo(() => {
    const ids: ZoneId[] = task?.zones || [];
    return ids.map((id) => ({
      ...ZONES[id],
      color: showHint && step?.k === 'zone' && step.zone === id ? '#22c55e' : '#ffd23f',
    }));
  }, [task, showHint, step]);

  const labels = () => {
    const e = eng.current;
    const out: Record<number, string | null> = {};
    if (!e) return out;
    for (const pl of e.players) {
      if (pl.human || pl.team !== 0) continue;
      const target = step && ((step.k === 'pass' && step.to === pl.number) || (step.k === 'receive' && step.from === pl.number) || (step.k === 'say' && step.mate === pl.number));
      // A1: siempre nombre y número; otros niveles: solo con pista
      if (cefr === 'A1' || (showHint && target)) out[pl.id] = `${pl.name} ${pl.number}`;
      else out[pl.id] = null;
    }
    return out;
  };

  return (
    <GameView
      config={{ mode: 'training', difficulty: 0.3, trainingDefenders: cefr === 'B2' ? 1 : 0 }}
      onReady={({ engine }) => {
        eng.current = engine;
        startTask(0);
      }}
      onEvent={onEvent}
      onFrame={onFrame}
      onExit={onExit}
      zones={zones}
      coach={{ talking: () => performance.now() < talkingUntil.current }}
      labels={labels}
      showScore={false}
      hud={() => (
        <div className="coach-panel">
          <div className="coach-head">
            <span className={`cefr cefr-${cefr}`}>{cefr}</span>
            <Es t={UI.task} /> {Math.min(idx + 1, tasks.length)} / {tasks.length}
            <span className="steps">
              {task?.steps.map((_, i) => (
                <i key={i} className={i < stepIdx ? 'done' : i === stepIdx ? 'cur' : ''} />
              ))}
            </span>
          </div>
          {task && <PhraseCard t={task.say} speaker="👨‍🏫 Entrenador" compact />}
          {step?.k === 'say' && !finished && (
            <div className="say-box">
              <Es t={UI.sayIt} as="div" className="say-title" />
              <PhraseCard
                t={step.phrase}
                compact
                onSpoken={(ok) => {
                  if (ok && eng.current) {
                    eng.current.aiEnabled = true;
                    const m = eng.current.playerByNumber(0, step.mate);
                    if (m && eng.current.owner === m) eng.current.pass(m, eng.current.human);
                    setStep(cur.current.step + 1);
                  }
                }}
              />
            </div>
          )}
          {showHint && (
            <div className="hint">
              💡 <Es t={UI.tipTranslate} />
            </div>
          )}
          {praise && (
            <div className="praise">
              <Es t={praise} />
            </div>
          )}
          {warn && (
            <div className="warn">
              <Es t={warn} />
            </div>
          )}
        </div>
      )}
      overlay={
        finished ? (
          <div className="modal-bg">
            <div className="modal">
              <div className="big-emoji">🏆</div>
              <Es t={UI.levelComplete} as="h2" />
              <p>+{tasks.length * 15 + 60} XP</p>
              <Btn
                label={UI.next}
                icon="➡️"
                onClick={() => {
                  onComplete?.(true);
                  onExit();
                }}
              />
            </div>
          </div>
        ) : null
      }
    />
  );
}

import { useRef, useState } from 'react';
import { GameView } from '../game/GameView';
import { Engine, GameEvent } from '../game/engine';
import { Btn, Es, PhraseCard } from '../components/Es';
import { useGame } from '../store';
import { UI, p, Phrase } from '../i18n/ui';
import { speak } from '../audio/speech';
import { ding } from '../audio/sfx';
import { HALF_L } from '../game/constants';

type Dir = { side: -1 | 0 | 1; high: boolean | null; say: Phrase };
const DIRS: Dir[] = [
  { side: 1, high: null, say: p('¡Dispara a la derecha!', 'Հարվածի՛ր աջ։') },
  { side: -1, high: null, say: p('¡Dispara a la izquierda!', 'Հարվածի՛ր ձախ։') },
  { side: 0, high: true, say: p('¡Tira por arriba, al centro!', 'Խփի՛ր վերևով՝ կենտրոն։') },
  { side: 1, high: false, say: p('Dispara abajo, a la derecha del portero.', 'Հարվածի՛ր ներքևով՝ դարպասապահից աջ։') },
  { side: -1, high: true, say: p('Apunta arriba, a la izquierda.', 'Նշա՛ն բռնիր վերև՝ ձախ։') },
  { side: -1, high: false, say: p('Tira raso, por la izquierda.', 'Խփի՛ր գետնով՝ ձախ կողմով։') },
  { side: 1, high: true, say: p('Busca la escuadra derecha.', 'Փնտրի՛ր աջ վերին անկյունը։') },
];
const GOOD = p('¡Gol! ¡Y además has entendido la orden! Puntos dobles.', 'Գոլ։ Եվ դու նաև հասկացար հրահանգը։ Կրկնակի միավորներ։');
const GOAL_ONLY = p('¡Gol! Pero no has tirado donde te dije.', 'Գոլ։ Բայց դու չխփեցիր այնտեղ, որտեղ ասացի։');
const NO = p('¡No ha entrado! El siguiente.', 'Չմտավ։ Հաջորդը։');

type Props = { kind: 'penalties' | 'freekicks'; shots?: number; need?: number; difficulty?: number; onExit: () => void; onComplete?: (goals: number, ok: boolean) => void };

export function SetPieces({ kind, shots = 5, need = 3, difficulty = 0.4, onExit, onComplete }: Props) {
  const g = useGame();
  const [n, setN] = useState(0);
  const [goals, setGoals] = useState(0);
  const [dir, setDir] = useState<Dir>(DIRS[0]);
  const [msg, setMsg] = useState<Phrase | null>(null);
  const [done, setDone] = useState(false);
  const eng = useRef<Engine | null>(null);
  const r = useRef({ n: 0, goals: 0, dir: DIRS[0], shotSide: 0, shotHigh: false, points: 0, streak: 0 });

  const next = (e: Engine) => {
    if (r.current.n >= shots) {
      setDone(true);
      const ok = r.current.goals >= need;
      g.addXP(r.current.points);
      g.setBest(kind, r.current.goals);
      onComplete?.(r.current.goals, ok);
      return;
    }
    const d = DIRS[(Math.random() * DIRS.length) | 0];
    r.current.dir = d;
    setDir(d);
    e.startSetPiece(kind === 'penalties' ? 'penalty' : 'freekick');
    setTimeout(() => speak(d.say.es), 500);
  };

  const onEvent = (ev: GameEvent, e: Engine) => {
    if (ev.type === 'shot' && e.setPiece) {
      const sp = e.setPiece;
      const z = sp.ball.z + Math.tan(sp.aimYaw) * (HALF_L - sp.ball.x);
      r.current.shotSide = z > 0.9 ? 1 : z < -0.9 ? -1 : 0;
      r.current.shotHigh = sp.lift > 0.5;
    }
    if (ev.type === 'setPieceResult') {
      r.current.n++;
      setN(r.current.n);
      const d = r.current.dir;
      const sideOk = d.side === r.current.shotSide;
      const highOk = d.high === null || d.high === r.current.shotHigh;
      if (ev.goal) {
        r.current.goals++;
        setGoals(r.current.goals);
        g.stat('goals');
        const understood = sideOk && highOk;
        r.current.points += understood ? 30 : 12;
        if (understood) {
          g.stat('understood');
          g.learnPhrase(d.say.es, 2);
        }
        if (kind === 'penalties') {
          r.current.streak++;
          g.setStat('penaltyStreak', Math.max(g.stats.penaltyStreak, r.current.streak));
          if (r.current.streak >= 5) g.unlock('penaltyKing');
        }
        setMsg(understood ? GOOD : GOAL_ONLY);
        speak(understood ? GOOD.es : GOAL_ONLY.es);
        ding(true);
      } else {
        r.current.streak = 0;
        setMsg(NO);
        speak(NO.es);
        ding(false);
      }
      setTimeout(() => setMsg(null), 2400);
    }
  };

  return (
    <GameView
      config={{ mode: kind, difficulty }}
      onReady={({ engine }) => {
        eng.current = engine;
        engine.onSetPieceDone = () => next(engine);
        next(engine);
      }}
      onEvent={onEvent}
      onExit={onExit}
      showScore={false}
      hud={() => (
        <div className="coach-panel">
          <div className="coach-head">
            <Es t={kind === 'penalties' ? UI.penaltiesTitle : UI.freeKicksTitle} />
            <span className="pill">
              ⚽ {goals} / {Math.min(n + 1, shots)} — <Es t={UI.need} />: {need}
            </span>
          </div>
          <PhraseCard t={dir.say} speaker="👨‍🏫 Entrenador" compact />
          {msg && (
            <div className="praise">
              <Es t={msg} />
            </div>
          )}
        </div>
      )}
      overlay={
        done ? (
          <div className="modal-bg">
            <div className="modal">
              <div className="big-emoji">{goals >= need ? '🥅' : '💪'}</div>
              <Es t={goals >= need ? UI.completed : UI.failed} as="h2" />
              <p>
                <Es t={UI.goals} />: {goals} / {shots}
              </p>
              <p>+{r.current.points} XP</p>
              <Btn label={UI.next} icon="➡️" onClick={onExit} />
            </div>
          </div>
        ) : null
      }
    />
  );
}

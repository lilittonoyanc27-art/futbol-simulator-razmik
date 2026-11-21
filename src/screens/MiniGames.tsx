import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Btn, Es, PhraseCard } from '../components/Es';
import { UI, p, Phrase } from '../i18n/ui';
import { useGame } from '../store';
import { speak } from '../audio/speech';
import { ding, cheer } from '../audio/sfx';
import { MINIGAMES, GameId, LISTEN_ITEMS, ORDER_SENTENCES, QUICK, DIALOG, SITUATIONS, FIND_OBJECTS } from '../data/minigames';
import { WORDS, pictureWords } from '../data/vocab';
import { fieldTexture, ballTexture, MARGIN } from '../game/textures';
import { FIELD_L, FIELD_W } from '../game/constants';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export function MiniGameList({ onPick, onBack }: { onPick: (g: GameId) => void; onBack: () => void }) {
  const bests = useGame((s) => s.bests);
  return (
    <div className="screen">
      <div className="screen-head">
        <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onBack} />
        <Es t={UI.minigames} as="h1" />
      </div>
      <div className="grid4">
        {MINIGAMES.map((m) => (
          <div key={m.id} className="card mg-card" onClick={() => onPick(m.id)}>
            <div className="conv-icon">{m.icon}</div>
            <Es t={m.name} as="h3" />
            <Es t={m.desc} as="p" className="muted" />
            <Btn label={UI.play} icon="▶️" className="small" onClick={() => onPick(m.id)} />
            {bests[m.id] ? (
              <small>
                <Es t={UI.best} />: {bests[m.id]}
              </small>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Shell({ title, onExit, children, score }: { title: Phrase; onExit: () => void; children: React.ReactNode; score?: number }) {
  return (
    <div className="screen mg">
      <div className="screen-head">
        <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onExit} />
        <Es t={title} as="h1" />
        {score !== undefined && (
          <span className="pill">
            ⭐ <Es t={UI.score} />: {score}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Finish({ id, score, max, onExit, onAgain }: { id: string; score: number; max: number; onExit: () => void; onAgain: () => void }) {
  const g = useGame();
  useEffect(() => {
    g.setBest(id, score);
    g.addXP(score * 5);
    if (score >= max * 0.7) cheer(0.8);
  }, []);
  return (
    <div className="card center">
      <div className="big-emoji">{score >= max * 0.7 ? '🏆' : '👍'}</div>
      <Es t={UI.results} as="h2" />
      <div className="final-score">
        {score} / {max}
      </div>
      <p>+{score * 5} XP</p>
      <div className="row">
        <Btn label={UI.restart} icon="🔁" onClick={onAgain} />
        <Btn label={UI.back} icon="⬅️" className="ghost" onClick={onExit} />
      </div>
    </div>
  );
}

// ---------- 1. Memory ----------
function Memory({ onExit }: { onExit: () => void }) {
  const cefr = useGame((s) => s.cefr);
  const [seed, setSeed] = useState(0);
  const words = useMemo(() => shuffle(pictureWords().filter((w) => (cefr === 'A1' ? w.cefr === 'A1' : true))).slice(0, 6), [seed]);
  const cards = useMemo(() => shuffle(words.flatMap((w) => [{ k: w.id + 'e', id: w.id, face: w.emoji, word: false }, { k: w.id + 'w', id: w.id, face: w.es, word: true }])), [words]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const g = useGame();
  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || found.includes(cards[i].id)) return;
    const c = cards[i];
    if (c.word) speak(c.face);
    const o = [...open, i];
    setOpen(o);
    if (o.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = o.map((x) => cards[x]);
      if (a.id === b.id) {
        ding(true);
        setTimeout(() => {
          setFound((f) => [...f, a.id]);
          setOpen([]);
          g.learnPhrase(WORDS.find((w) => w.id === a.id)!.es, 1);
        }, 500);
      } else setTimeout(() => setOpen([]), 1000);
    }
  };
  const done = found.length === words.length;
  useEffect(() => {
    if (done) g.unlock('memoryMaster');
  }, [done]);
  const score = Math.max(1, 12 - Math.max(0, moves - 6));
  return (
    <Shell title={MINIGAMES[0].name} onExit={onExit}>
      {done ? (
        <Finish id="memory" score={score} max={12} onExit={onExit} onAgain={() => { setSeed((s) => s + 1); setFound([]); setMoves(0); }} />
      ) : (
        <div className="memory">
          {cards.map((c, i) => {
            const shown = open.includes(i) || found.includes(c.id);
            return (
              <button key={c.k} className={`mcard ${shown ? 'shown' : ''} ${found.includes(c.id) ? 'found' : ''}`} onClick={() => flip(i)}>
                {shown ? <span className={c.word ? 'mword' : 'memoji'}>{c.face}</span> : '⚽'}
              </button>
            );
          })}
        </div>
      )}
      <div className="chips">
        {found.map((id) => {
          const w = WORDS.find((x) => x.id === id)!;
          return <Es key={id} t={{ es: w.es, hy: w.hy }} className="chip" />;
        })}
      </div>
    </Shell>
  );
}

// ---------- 2. Escuchar al entrenador ----------
function Listen({ onExit }: { onExit: () => void }) {
  const g = useGame();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => shuffle(LISTEN_ITEMS).slice(0, 8), [seed]);
  const [answered, setAnswered] = useState<number | null>(null);
  const item = rounds[round];
  const options = useMemo(() => (item ? shuffle([item, ...shuffle(LISTEN_ITEMS.filter((x) => x !== item)).slice(0, 3)]) : []), [item]);
  useEffect(() => {
    if (item) setTimeout(() => speak(item.say.es), 300);
  }, [item]);
  if (!item) return <Shell title={MINIGAMES[1].name} onExit={onExit}><Finish id="listen" score={score} max={8} onExit={onExit} onAgain={() => { setSeed((s) => s + 1); setRound(0); setScore(0); }} /></Shell>;
  const pick = (i: number) => {
    if (answered !== null) return;
    setAnswered(i);
    const ok = options[i] === item;
    g.stat('listenTotal');
    if (ok) {
      setScore((s) => s + 1);
      g.stat('listenCorrect');
      g.learnPhrase(item.say.es, 2);
      ding(true);
    } else ding(false);
    setTimeout(() => {
      setAnswered(null);
      setRound((r) => r + 1);
    }, 2200);
  };
  return (
    <Shell title={MINIGAMES[1].name} onExit={onExit} score={score}>
      <div className="card center">
        <div className="pill">{round + 1} / 8</div>
        <button className="btn big" onClick={() => speak(item.say.es, { force: true })}>
          🔊 {UI.listen.es}
        </button>
        <button className="btn ghost" onClick={() => speak(item.say.es, { force: true, rate: 0.65 })}>
          🐢 {UI.repeat.es}
        </button>
        <div className="icon-grid">
          {options.map((o, i) => (
            <button key={i} className={`icon-opt ${answered !== null ? (o === item ? 'ok' : answered === i ? 'bad' : '') : ''}`} onClick={() => pick(i)}>
              {o.icon}
            </button>
          ))}
        </div>
        {answered !== null && <PhraseCard t={item.say} compact />}
      </div>
    </Shell>
  );
}

// ---------- 3. Ordena la frase ----------
function Order({ onExit }: { onExit: () => void }) {
  const g = useGame();
  const [seed, setSeed] = useState(0);
  const list = useMemo(() => shuffle(ORDER_SENTENCES).slice(0, 6), [seed]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const s = list[i];
  const tiles = useMemo(() => (s ? shuffle(s.es.split(' ').map((w, k) => ({ w, k }))) : []), [s]);
  const [built, setBuilt] = useState<number[]>([]);
  const [state, setState] = useState<'play' | 'ok' | 'bad'>('play');
  if (!s) return <Shell title={MINIGAMES[2].name} onExit={onExit}><Finish id="order" score={score} max={6} onExit={onExit} onAgain={() => { setSeed((x) => x + 1); setI(0); setScore(0); }} /></Shell>;
  const words = s.es.split(' ');
  const check = () => {
    const sentence = built.map((k) => tiles.find((t) => t.k === k)!.w).join(' ');
    if (sentence === s.es) {
      setState('ok');
      setScore((x) => x + 1);
      speak(s.es);
      ding(true);
      g.learnPhrase(s.es, 2);
    } else {
      setState('bad');
      ding(false);
    }
  };
  return (
    <Shell title={MINIGAMES[2].name} onExit={onExit} score={score}>
      <div className="card center">
        <div className="pill">{i + 1} / 6</div>
        <div className="hy-hint" lang="hy">🇦🇲 {s.hy}</div>
        <div className="built">
          {built.map((k) => (
            <button key={k} className="tile-w on" onClick={() => state === 'play' && setBuilt(built.filter((x) => x !== k))}>
              {tiles.find((t) => t.k === k)!.w}
            </button>
          ))}
          {built.length === 0 && <span className="muted">…</span>}
        </div>
        <div className="pool">
          {tiles.map((t) =>
            built.includes(t.k) ? null : (
              <button key={t.k} className="tile-w" onClick={() => { setBuilt([...built, t.k]); speak(t.w); }}>
                {t.w}
              </button>
            ),
          )}
        </div>
        {state === 'play' && built.length === words.length && <Btn label={p('Comprobar', 'Ստուգել')} icon="✅" onClick={check} />}
        {state === 'ok' && (
          <>
            <div className="praise"><Es t={UI.correct} /></div>
            <Btn label={UI.next} icon="➡️" onClick={() => { setI(i + 1); setBuilt([]); setState('play'); }} />
          </>
        )}
        {state === 'bad' && (
          <>
            <div className="warn"><Es t={UI.wrong} /></div>
            <Btn label={UI.tryAgain} icon="🔁" onClick={() => { setBuilt([]); setState('play'); }} />
          </>
        )}
      </div>
    </Shell>
  );
}

// ---------- 4. Preguntas rápidas ----------
function Quick({ onExit }: { onExit: () => void }) {
  const [seed, setSeed] = useState(0);
  const qs = useMemo(() => shuffle(QUICK).slice(0, 10), [seed]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(10);
  const [fb, setFb] = useState<boolean | null>(null);
  const g = useGame();
  const q = qs[i];
  useEffect(() => {
    if (!q) return;
    setTime(10);
    speak(q.q.es);
    const t = setInterval(() => setTime((x) => x - 0.1), 100);
    return () => clearInterval(t);
  }, [i, seed]);
  useEffect(() => {
    if (q && time <= 0 && fb === null) answer(null);
  }, [time]);
  const answer = (a: boolean | null) => {
    if (fb !== null) return;
    const ok = a === q.a;
    setFb(ok);
    if (ok) {
      setScore((s) => s + 1);
      ding(true);
      g.learnPhrase(q.q.es, 1);
    } else ding(false);
    setTimeout(() => {
      setFb(null);
      setI((x) => x + 1);
    }, 1300);
  };
  if (!q) return <Shell title={MINIGAMES[3].name} onExit={onExit}><Finish id="quick" score={score} max={10} onExit={onExit} onAgain={() => { setSeed((x) => x + 1); setI(0); setScore(0); }} /></Shell>;
  return (
    <Shell title={MINIGAMES[3].name} onExit={onExit} score={score}>
      <div className="card center">
        <div className="timer"><div style={{ width: `${Math.max(0, time) * 10}%` }} /></div>
        <div className="pill">{i + 1} / 10</div>
        <PhraseCard t={q.q} compact />
        <div className="row">
          <Btn label={p('Verdadero', 'Ճիշտ է')} icon="✅" className="green" onClick={() => answer(true)} />
          <Btn label={p('Falso', 'Սխալ է')} icon="❌" className="orange" onClick={() => answer(false)} />
        </div>
        {fb !== null && <div className={fb ? 'praise' : 'warn'}><Es t={fb ? UI.correct : UI.wrong} /></div>}
      </div>
    </Shell>
  );
}

// ---------- 5. Elige la réplica ----------
function Dialog({ onExit }: { onExit: () => void }) {
  const [seed, setSeed] = useState(0);
  const items = useMemo(() => shuffle(DIALOG).slice(0, 8), [seed]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState<number | null>(null);
  const g = useGame();
  const it = items[i];
  useEffect(() => {
    if (it) speak(it.q.es);
  }, [it]);
  if (!it) return <Shell title={MINIGAMES[4].name} onExit={onExit}><Finish id="dialog" score={score} max={8} onExit={onExit} onAgain={() => { setSeed((x) => x + 1); setI(0); setScore(0); }} /></Shell>;
  const pick = (k: number) => {
    if (fb !== null) return;
    setFb(k);
    if (k === it.answer) {
      setScore((s) => s + 1);
      ding(true);
      speak(it.options[k].es);
      g.learnPhrase(it.options[k].es, 2);
    } else ding(false);
    setTimeout(() => {
      setFb(null);
      setI((x) => x + 1);
    }, 1800);
  };
  return (
    <Shell title={MINIGAMES[4].name} onExit={onExit} score={score}>
      <div className="card chat">
        <div className="bubble npc">🧑 <Es t={it.q} /></div>
        {it.options.map((o, k) => (
          <button key={k} className={`bubble me opt ${fb !== null ? (k === it.answer ? 'ok' : fb === k ? 'bad' : '') : ''}`} onClick={() => pick(k)}>
            {o.es}
          </button>
        ))}
        {fb !== null && (
          <div className="chips">
            {it.options.map((o, k) => <Es key={k} t={o} className="chip" />)}
          </div>
        )}
      </div>
    </Shell>
  );
}

// ---------- 6. ¿Qué harías? ----------
function Situations({ onExit }: { onExit: () => void }) {
  const [seed, setSeed] = useState(0);
  const items = useMemo(() => shuffle(SITUATIONS), [seed]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const it = items[i];
  const opts = useMemo(() => (it ? shuffle(it.options) : []), [it]);
  useEffect(() => {
    if (it) speak(it.s.es);
  }, [it]);
  if (!it) return <Shell title={MINIGAMES[5].name} onExit={onExit}><Finish id="situations" score={score} max={items.length} onExit={onExit} onAgain={() => { setSeed((x) => x + 1); setI(0); setScore(0); }} /></Shell>;
  return (
    <Shell title={MINIGAMES[5].name} onExit={onExit} score={score}>
      <div className="card">
        <div className="situation">🤔</div>
        <PhraseCard t={it.s} compact />
        <div className="choices">
          {opts.map((o, k) => (
            <button
              key={k}
              className={`choice ${chosen !== null ? (o.ok ? 'ok' : chosen === k ? 'bad' : '') : ''}`}
              onClick={() => {
                if (chosen !== null) return;
                setChosen(k);
                speak(o.why.es);
                if (o.ok) {
                  setScore((s) => s + 1);
                  ding(true);
                } else ding(false);
              }}
            >
              {o.t.es}
            </button>
          ))}
        </div>
        {chosen !== null && (
          <>
            <div className={opts[chosen].ok ? 'praise' : 'warn'}><Es t={opts[chosen].why} /></div>
            <Btn label={UI.next} icon="➡️" onClick={() => { setChosen(null); setI(i + 1); }} />
          </>
        )}
      </div>
    </Shell>
  );
}

// ---------- 7. Carrera de comprensión ----------
function Race({ onExit }: { onExit: () => void }) {
  const g = useGame();
  const [me, setMe] = useState(0);
  const [cpu, setCpu] = useState(0);
  const [q, setQ] = useState(() => newQ());
  const [over, setOver] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  function newQ() {
    const pool = shuffle(pictureWords()).slice(0, 4);
    return { target: pool[0], options: shuffle(pool) };
  }
  useEffect(() => {
    speak(q.target.es);
  }, [q]);
  useEffect(() => {
    if (over !== null) return;
    const t = setInterval(() => setCpu((c) => Math.min(100, c + 1.1 + Math.random() * 0.8)), 220);
    return () => clearInterval(t);
  }, [over]);
  useEffect(() => {
    if (over === null && cpu >= 100) setOver(false);
  }, [cpu]);
  const pick = (id: string) => {
    if (over !== null) return;
    if (id === q.target.id) {
      ding(true);
      setScore((s) => s + 1);
      g.stat('listenCorrect');
      g.learnPhrase(q.target.es, 1);
      const n = me + 12.5;
      setMe(n);
      if (n >= 100) {
        setOver(true);
        cheer(1);
        return;
      }
    } else {
      ding(false);
      setMe((m) => Math.max(0, m - 5));
    }
    g.stat('listenTotal');
    setQ(newQ());
  };
  return (
    <Shell title={MINIGAMES[6].name} onExit={onExit} score={score}>
      <div className="card">
        <div className="track">
          <div className="lane"><span className="runner" style={{ left: `${me}%` }}>🏃‍♂️<b>7</b></span></div>
          <div className="lane cpu"><span className="runner" style={{ left: `${cpu}%` }}>🏃</span></div>
          <div className="finish-line">🏁</div>
        </div>
        {over === null ? (
          <div className="center">
            <button className="btn" onClick={() => speak(q.target.es, { force: true })}>🔊 {UI.listen.es}</button>
            <div className="icon-grid">
              {q.options.map((o) => (
                <button key={o.id} className="icon-opt" onClick={() => pick(o.id)}>
                  {o.emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="center">
            <div className="big-emoji">{over ? '🥇' : '🥈'}</div>
            <Es t={over ? UI.win : UI.lose} as="h2" />
            <Finish id="race" score={score} max={8} onExit={onExit} onAgain={() => { setMe(0); setCpu(0); setScore(0); setOver(null); setQ(newQ()); }} />
          </div>
        )}
      </div>
    </Shell>
  );
}

// ---------- 8. Busca en el campo (3D) ----------
function FindObj({ id, pos, onHit }: { id: string; pos: [number, number, number]; onHit: (id: string) => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useFrame(() => {
    if (ref.current) ref.current.scale.setScalar(hover ? 1.15 : 1);
  });
  const ballMat = useMemo(() => new THREE.MeshStandardMaterial({ map: ballTexture() }), []);
  const handlers = {
    onClick: (e: any) => {
      e.stopPropagation();
      onHit(id);
    },
    onPointerOver: () => setHover(true),
    onPointerOut: () => setHover(false),
  };
  return (
    <group ref={ref} position={pos} {...handlers}>
      {id === 'ball' && <mesh material={ballMat} position-y={0.35} castShadow><sphereGeometry args={[0.35, 24, 16]} /></mesh>}
      {id === 'cones' &&
        [-0.6, 0, 0.6].map((x) => (
          <mesh key={x} position={[x, 0.35, 0]} castShadow><coneGeometry args={[0.25, 0.7, 16]} /><meshStandardMaterial color="#ff7a00" /></mesh>
        ))}
      {id === 'bottle' && <mesh position-y={0.45} castShadow><cylinderGeometry args={[0.15, 0.15, 0.9, 16]} /><meshStandardMaterial color="#5dade2" transparent opacity={0.8} /></mesh>}
      {id === 'flag' && (
        <>
          <mesh position-y={1}><cylinderGeometry args={[0.04, 0.04, 2]} /><meshStandardMaterial color="#fff" /></mesh>
          <mesh position={[0.3, 1.7, 0]}><boxGeometry args={[0.6, 0.4, 0.02]} /><meshStandardMaterial color="#ffd23f" /></mesh>
        </>
      )}
      {id === 'gloves' &&
        [-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 0.15, 0]} castShadow><boxGeometry args={[0.3, 0.12, 0.45]} /><meshStandardMaterial color="#22c55e" /></mesh>
        ))}
      {id === 'shirt' && (
        <group position-y={0.6}>
          <mesh castShadow><boxGeometry args={[0.8, 0.9, 0.12]} /><meshStandardMaterial color="#ff7a00" /></mesh>
          {[-0.5, 0.5].map((x) => <mesh key={x} position={[x, 0.3, 0]}><boxGeometry args={[0.3, 0.3, 0.12]} /><meshStandardMaterial color="#ff7a00" /></mesh>)}
        </group>
      )}
      {id === 'trophy' && (
        <group>
          <mesh position-y={0.15}><cylinderGeometry args={[0.3, 0.35, 0.3]} /><meshStandardMaterial color="#5a3a1a" /></mesh>
          <mesh position-y={0.7}><cylinderGeometry args={[0.35, 0.12, 0.8, 16]} /><meshStandardMaterial color="#e8b923" metalness={0.8} roughness={0.2} /></mesh>
        </group>
      )}
      {id === 'goal' && (
        <group>
          {[-1.5, 1.5].map((x) => <mesh key={x} position={[x, 1, 0]}><cylinderGeometry args={[0.07, 0.07, 2]} /><meshStandardMaterial color="#fff" /></mesh>)}
          <mesh position={[0, 2, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.07, 0.07, 3]} /><meshStandardMaterial color="#fff" /></mesh>
          <mesh position={[0, 1, -0.6]}><boxGeometry args={[3, 2, 0.05]} /><meshStandardMaterial color="#fff" transparent opacity={0.25} /></mesh>
        </group>
      )}
      {id === 'whistle' && (
        <group position-y={0.15}>
          <mesh rotation-z={Math.PI / 2}><cylinderGeometry args={[0.13, 0.13, 0.3, 16]} /><meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} /></mesh>
          <mesh position={[0.25, 0.05, 0]}><boxGeometry args={[0.25, 0.08, 0.1]} /><meshStandardMaterial color="#c0c0c0" metalness={0.9} /></mesh>
        </group>
      )}
      {id === 'bench' && (
        <group>
          <mesh position-y={0.45}><boxGeometry args={[2.5, 0.12, 0.5]} /><meshStandardMaterial color="#1d3f8f" /></mesh>
          {[-1, 1].map((x) => <mesh key={x} position={[x, 0.22, 0]}><boxGeometry args={[0.1, 0.45, 0.4]} /><meshStandardMaterial color="#333" /></mesh>)}
        </group>
      )}
      {/* zona de clic más grande */}
      <mesh visible={false} position-y={0.6}>
        <boxGeometry args={[id === 'goal' || id === 'bench' ? 3 : 1.4, 1.6, 1.4]} />
      </mesh>
    </group>
  );
}

function Find3D({ onExit }: { onExit: () => void }) {
  const g = useGame();
  const [seed, setSeed] = useState(0);
  const layout = useMemo(() => {
    const spots: [number, number, number][] = shuffle([
      [-6, 0, -3], [-3, 0, 2], [0, 0, -4], [3, 0, 1], [6, 0, -3], [-5, 0, 4], [5, 0, 4], [0, 0, 3.5], [-8, 0, 0], [8, 0, 0],
    ]);
    return FIND_OBJECTS.map((o, i) => ({ ...o, pos: spots[i] }));
  }, [seed]);
  const order = useMemo(() => shuffle(FIND_OBJECTS).slice(0, 7), [seed]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState<null | boolean>(null);
  const target = order[i];
  useEffect(() => {
    if (target) setTimeout(() => speak(target.say.es), 300);
  }, [target]);
  const hit = (id: string) => {
    if (!target || fb !== null) return;
    const ok = id === target.id;
    setFb(ok);
    if (ok) {
      ding(true);
      setScore((s) => s + 1);
      g.learnPhrase(target.say.es, 2);
    } else {
      ding(false);
      const name = FIND_OBJECTS.find((o) => o.id === id)!.name;
      speak(`No, eso es ${name.es}.`);
    }
    setTimeout(() => {
      setFb(null);
      if (ok) setI((x) => x + 1);
    }, 1200);
  };
  const ftex = useMemo(() => fieldTexture('#3fa34d', '#379445'), []);
  return (
    <Shell title={MINIGAMES[7].name} onExit={onExit} score={score}>
      {target ? (
        <>
          <div className="find-bar">
            <PhraseCard t={target.say} compact />
            {fb !== null && <div className={fb ? 'praise' : 'warn'}><Es t={fb ? UI.correct : UI.wrong} /></div>}
          </div>
          <div className="find-canvas">
            <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 9, 12], fov: 50 }}>
              <color attach="background" args={['#8fd3ff']} />
              <hemisphereLight args={['#fff', '#2d5a27', 0.9]} />
              <directionalLight position={[5, 10, 6]} intensity={2} castShadow />
              <mesh rotation-x={-Math.PI / 2} receiveShadow>
                <planeGeometry args={[FIELD_L + MARGIN * 2, FIELD_W + MARGIN * 2]} />
                <meshLambertMaterial map={ftex} />
              </mesh>
              {layout.map((o) => (
                <FindObj key={o.id} id={o.id} pos={o.pos} onHit={hit} />
              ))}
              <LookAt />
            </Canvas>
          </div>
        </>
      ) : (
        <Finish id="find3d" score={score} max={7} onExit={onExit} onAgain={() => { setSeed((s) => s + 1); setI(0); setScore(0); }} />
      )}
    </Shell>
  );
}
function LookAt() {
  useFrame(({ camera }) => camera.lookAt(0, 0, 0));
  return null;
}

export function MiniGame({ id, onExit }: { id: GameId; onExit: () => void }) {
  switch (id) {
    case 'memory':
      return <Memory onExit={onExit} />;
    case 'listen':
      return <Listen onExit={onExit} />;
    case 'order':
      return <Order onExit={onExit} />;
    case 'quick':
      return <Quick onExit={onExit} />;
    case 'dialog':
      return <Dialog onExit={onExit} />;
    case 'situations':
      return <Situations onExit={onExit} />;
    case 'race':
      return <Race onExit={onExit} />;
    case 'find3d':
      return <Find3D onExit={onExit} />;
  }
}

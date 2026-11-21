import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENES, Scene, Place, Opt } from '../data/conversations';
import { PlayerModel } from '../game/PlayerModel';
import { Btn, Es, PhraseCard, usePop } from '../components/Es';
import { UI, p } from '../i18n/ui';
import { useGame, getKit } from '../store';
import { speak, listenOnce, recognitionSupported, bestMatch } from '../audio/speech';
import { ding } from '../audio/sfx';
import { boardTexture, ballTexture } from '../game/textures';

export function ConversationList({ onPick, onBack }: { onPick: (s: Scene) => void; onBack: () => void }) {
  const done = useGame((s) => s.conversationsDone);
  return (
    <div className="screen">
      <div className="screen-head">
        <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onBack} />
        <Es t={UI.conversations} as="h1" />
      </div>
      <div className="grid3">
        {SCENES.map((s, i) => (
          <div key={s.id} className={`card conv-card ${done.includes(s.id) ? 'done' : ''}`} onClick={() => onPick(s)}>
            <div className="conv-icon">{s.icon}</div>
            <div className="conv-num">{i + 1}</div>
            <Es t={s.title} as="h3" />
            <span className={`cefr cefr-${s.cefr}`}>{s.cefr}</span> <Es t={s.grammar} className="muted" />
            {done.includes(s.id) && <div className="done-mark">✅</div>}
            <div>
              <Btn label={UI.play} icon="▶️" className="small" onClick={() => onPick(s)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Place3D({ place }: { place: Place }) {
  const wall = (c: string) => new THREE.MeshLambertMaterial({ color: c });
  const mats = useMemo(
    () => ({
      floor: wall(place === 'field' || place === 'academy' ? '#2f9a44' : place === 'bus' ? '#444' : '#c9b79c'),
      wall: wall(place === 'locker' ? '#1d3f8f' : place === 'press' ? '#0b1d3a' : place === 'shop' ? '#f4f6fb' : place === 'bus' ? '#ddd' : '#8fd3ff'),
      orange: wall('#ff7a00'),
      wood: wall('#a0703c'),
      white: wall('#ffffff'),
      seat: wall('#1d3f8f'),
      glass: new THREE.MeshStandardMaterial({ color: '#9fd3ff', transparent: true, opacity: 0.5 }),
      board: new THREE.MeshBasicMaterial({ map: boardTexture('RADIO DEPORTE ★ FÚTBOL HABLA ★', '#0b1d3a', '#ffffff') }),
      ball: new THREE.MeshStandardMaterial({ map: ballTexture() }),
    }),
    [place],
  );
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} material={mats.floor} receiveShadow>
        <planeGeometry args={[30, 30]} />
      </mesh>
      {place !== 'field' && place !== 'academy' && (
        <mesh position={[0, 3, -3]} material={mats.wall}>
          <boxGeometry args={[14, 6, 0.2]} />
        </mesh>
      )}
      {place === 'field' && (
        <group position={[0, 0, -9]}>
          {[-3, 3].map((x) => (
            <mesh key={x} position={[x, 1.1, 0]} material={mats.white}>
              <cylinderGeometry args={[0.07, 0.07, 2.2]} />
            </mesh>
          ))}
          <mesh position={[0, 2.2, 0]} rotation-z={Math.PI / 2} material={mats.white}>
            <cylinderGeometry args={[0.07, 0.07, 6]} />
          </mesh>
          <mesh position={[2, 0.17, 4]} material={mats.ball}>
            <sphereGeometry args={[0.17, 16, 12]} />
          </mesh>
        </group>
      )}
      {place === 'locker' && (
        <group>
          {[-4, -2.5, -1, 0.5, 2, 3.5].map((x) => (
            <mesh key={x} position={[x, 1.1, -2.6]} material={mats.orange} castShadow>
              <boxGeometry args={[1.3, 2.2, 0.5]} />
            </mesh>
          ))}
          <mesh position={[0, 0.25, -1.6]} material={mats.wood}>
            <boxGeometry args={[8, 0.12, 0.5]} />
          </mesh>
        </group>
      )}
      {place === 'bus' && (
        <group>
          {[-2, 0, 2].map((z) =>
            [-1.7, 1.7].map((x) => (
              <mesh key={`${x}${z}`} position={[x, 0.6, z - 1]} material={mats.seat}>
                <boxGeometry args={[1.2, 1.2, 0.4]} />
              </mesh>
            )),
          )}
          <mesh position={[0, 2.8, -2.85]} material={mats.glass}>
            <boxGeometry args={[10, 1.4, 0.1]} />
          </mesh>
        </group>
      )}
      {place === 'press' && (
        <group>
          <mesh position={[0, 2.2, -2.85]} material={mats.board}>
            <boxGeometry args={[10, 1, 0.05]} />
          </mesh>
          <mesh position={[0, 0.75, -1]} material={mats.white}>
            <boxGeometry args={[4, 0.1, 1]} />
          </mesh>
          {[-1, 1].map((x) => (
            <mesh key={x} position={[x, 1, -1]} material={mats.seat}>
              <cylinderGeometry args={[0.03, 0.05, 0.4]} />
            </mesh>
          ))}
        </group>
      )}
      {place === 'shop' && (
        <group>
          {[0.6, 1.4, 2.2].map((y) => (
            <group key={y}>
              <mesh position={[0, y, -2.6]} material={mats.wood}>
                <boxGeometry args={[8, 0.08, 0.6]} />
              </mesh>
              {[-3, -1.5, 0, 1.5, 3].map((x) => (
                <mesh key={x} position={[x, y + 0.2, -2.6]} material={mats.ball}>
                  <sphereGeometry args={[0.17, 12, 10]} />
                </mesh>
              ))}
            </group>
          ))}
          <mesh position={[1.6, 0.5, -0.8]} material={mats.orange}>
            <boxGeometry args={[2, 1, 0.6]} />
          </mesh>
        </group>
      )}
      {place === 'academy' && (
        <group position={[0, 0, -7]}>
          <mesh position={[0, 2.5, 0]} material={mats.white}>
            <boxGeometry args={[12, 5, 2]} />
          </mesh>
          <mesh position={[0, 5.4, 0]} material={mats.orange}>
            <boxGeometry args={[12.4, 0.6, 2.4]} />
          </mesh>
          {[-4.5, -1.5, 1.5, 4.5].map((x) => (
            <mesh key={x} position={[x, 2.5, 1.3]} material={mats.white}>
              <cylinderGeometry args={[0.3, 0.3, 5]} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function ConvCanvas({ scene, speaking }: { scene: Scene; speaking: () => number }) {
  const kit = getKit(useGame((s) => s.kit));
  const n = scene.npcs.length;
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 2.4, 7.2], fov: 42 }}>
      <color attach="background" args={[scene.place === 'field' || scene.place === 'academy' ? '#8fd3ff' : '#0b1d3a']} />
      <hemisphereLight args={['#ffffff', '#335533', 0.9]} />
      <directionalLight position={[3, 6, 5]} intensity={2.2} castShadow />
      <Place3D place={scene.place} />
      <PlayerModel
        look={{ shirt: kit.shirt, shorts: kit.shorts, socks: kit.socks, numberColor: kit.number, number: 7, name: 'RAZMIK', hair: '#1a0f08', skin: '#e3b18c' }}
        pose={() => ({ x: -1.3, y: 0, z: 0.6, yaw: 0.9, speed: 0, kick: 0, tackle: 0, dive: 0, diveDir: 0, celebrate: 0, talking: speaking() === -1 })}
      />
      {scene.npcs.map((npc, i) => (
        <PlayerModel
          key={npc.name}
          look={{ shirt: npc.shirt, shorts: npc.shorts, socks: npc.shorts, numberColor: '#fff', skin: npc.skin, hair: npc.hair, coach: npc.coach, number: npc.coach ? undefined : npc.name === 'Lucas' ? 9 : npc.name === 'Mateo' ? 10 : 1 }}
          pose={() => ({ x: 1.2 + i * 1.3 - (n > 1 ? 0.3 : 0), y: 0, z: 0.2 - i * 0.6, yaw: -0.8, speed: 0, kick: 0, tackle: 0, dive: 0, diveDir: 0, celebrate: 0, talking: speaking() === i })}
        />
      ))}
      <Look />
    </Canvas>
  );
}
function Look() {
  useFrame(({ camera }) => camera.lookAt(0, 1.2, 0));
  return null;
}

export function ConversationPlayer({ scene, onExit, onComplete }: { scene: Scene; onExit: () => void; onComplete?: () => void }) {
  const g = useGame();
  const [i, setI] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; why?: ReturnType<typeof p> } | null>(null);
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState<{ who: string; t: ReturnType<typeof p> }[]>([]);
  const speaker = useRef(-2);
  const talkUntil = useRef(0);
  const [mistakes, setMistakes] = useState(0);
  const node = scene.nodes[i];
  const open = usePop((s) => s.open);
  const end = i >= scene.nodes.length;

  const talk = (who: number, text: string) => {
    speaker.current = who;
    talkUntil.current = performance.now() + 900 + text.length * 70;
    speak(text);
  };

  useEffect(() => {
    if (!node) return;
    if ('npc' in node) {
      talk(node.who ?? 0, node.npc.es);
      setHistory((h) => [...h, { who: scene.npcs[node.who ?? 0].name, t: node.npc }]);
      g.learnPhrase(node.npc.es, 1);
    }
  }, [i]);

  useEffect(() => {
    if (end) {
      g.finishConversation(scene.id);
      g.addXP(40 + Math.max(0, 20 - mistakes * 5));
      onComplete?.();
    }
  }, [end]);

  const choose = (o: Opt) => {
    if (o.ok) {
      ding(true);
      g.learnPhrase(o.t.es, 2);
      g.addXP(8);
      setHistory((h) => [...h, { who: 'Razmik', t: o.t }]);
      talk(-1, o.t.es);
      setFeedback({ ok: true });
      setTimeout(() => {
        setFeedback(null);
        setI((x) => x + 1);
      }, 1500 + o.t.es.length * 30);
    } else {
      ding(false);
      setMistakes((m) => m + 1);
      setFeedback({ ok: false, why: o.why });
      if (o.why) talk(0, o.why.es);
    }
  };

  const answerByVoice = async (opts: Opt[]) => {
    if (!recognitionSupported()) {
      setFeedback({ ok: false, why: UI.noMic });
      return;
    }
    setListening(true);
    const r = await listenOnce();
    setListening(false);
    g.stat('speakAttempts');
    if (!r.ok) {
      setFeedback({ ok: false, why: UI.almost });
      return;
    }
    const m = bestMatch(r.transcripts, opts.map((o) => o.t.es));
    if (m.score >= 0.5) {
      g.stat('speakSuccess');
      g.addXP(6);
      choose(opts[m.index]);
    } else setFeedback({ ok: false, why: p(`He oído: «${r.transcripts[0]}». Inténtalo otra vez.`, `Ես լսեցի․ «${r.transcripts[0]}»։ Նորից փորձի՛ր։`) });
  };

  // auto avance tras frase del personaje
  useEffect(() => {
    if (node && 'npc' in node) {
      const next = scene.nodes[i + 1];
      if (next && 'npc' in next) {
        const t = setTimeout(() => setI((x) => x + 1), 1800 + node.npc.es.length * 65);
        return () => clearTimeout(t);
      }
      if (next && 'choose' in next) {
        const t = setTimeout(() => setI((x) => x + 1), 700);
        return () => clearTimeout(t);
      }
      if (!next) {
        const t = setTimeout(() => setI((x) => x + 1), 2500 + node.npc.es.length * 50);
        return () => clearTimeout(t);
      }
    }
  }, [i]);

  // nodo actual para mostrar: última frase del NPC + opciones
  const lastNpc = [...scene.nodes.slice(0, i + 1)].reverse().find((n) => 'npc' in n) as { npc: ReturnType<typeof p>; who?: 0 | 1 } | undefined;
  const choices = node && 'choose' in node ? node.choose : null;
  const shuffled = useMemo(() => (choices ? [...choices].sort(() => Math.random() - 0.5) : null), [i]);

  return (
    <div className="conv">
      <div className="conv-3d">
        <ConvCanvas scene={scene} speaking={() => (performance.now() < talkUntil.current ? speaker.current : -2)} />
        <div className="conv-top">
          <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onExit} />
          <Es t={scene.title} as="h3" className="conv-title" />
        </div>
        <div className="history">
          {history.slice(-4, -1).map((h, k) => (
            <div key={k} className={`hist ${h.who === 'Razmik' ? 'me' : ''}`}>
              <b>{h.who}:</b> <Es t={h.t} />
            </div>
          ))}
        </div>
      </div>
      <div className="conv-panel">
        {end ? (
          <div className="center">
            <div className="big-emoji">🎉</div>
            <Es t={UI.sceneEnd} as="h2" />
            <Btn label={UI.next} icon="➡️" onClick={onExit} />
          </div>
        ) : (
          <>
            {lastNpc && <PhraseCard t={lastNpc.npc} speaker={`${scene.npcs[lastNpc.who ?? 0].name} · ${scene.npcs[lastNpc.who ?? 0].role.es}`} />}
            {shuffled && (
              <div className="choices">
                <Es t={UI.chooseAnswer} as="div" className="muted" />
                {shuffled.map((o, k) => (
                  <div key={k} className="choice-row">
                    <button className="choice" onClick={() => !feedback?.ok && choose(o)}>
                      {o.t.es}
                    </button>
                    <button className="mini" onClick={() => speak(o.t.es, { force: true })}>
                      🔊
                    </button>
                    <button className="mini" onClick={(e) => open(o.t, e.currentTarget)}>
                      🇦🇲
                    </button>
                  </div>
                ))}
                <button className={`btn voice ${listening ? 'pulse' : ''}`} onClick={() => answerByVoice(shuffled)}>
                  🎤 {listening ? UI.listeningNow.es : UI.speak.es}
                </button>
              </div>
            )}
            {feedback && (
              <div className={feedback.ok ? 'praise' : 'warn'}>
                {feedback.ok ? <Es t={UI.correct} /> : feedback.why ? <Es t={feedback.why} /> : <Es t={UI.wrong} />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

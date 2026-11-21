import { useEffect, useRef, useState, ReactNode } from 'react';
import { Engine, EngineConfig, GameEvent, initPhysics } from './engine';
import { attachKeyboard, createInput, InputState } from './input';
import { GameScene, CamMode, Zone } from './GameScene';
import { TouchControls } from './TouchControls';
import { useGame, getKit, getStadium } from '../store';
import { Btn, Es } from '../components/Es';
import { UI } from '../i18n/ui';
import { startCrowd, stopCrowd } from '../audio/sfx';
import { stopSpeaking } from '../audio/speech';

export type GameApi = {
  engine: Engine;
  input: InputState;
};

type Props = {
  config: EngineConfig;
  onReady?: (api: GameApi) => void;
  onEvent?: (e: GameEvent, engine: Engine) => void;
  onFrame?: (dt: number, engine: Engine) => void;
  onExit: () => void;
  zones?: Zone[];
  coach?: { talking: () => boolean } | null;
  labels?: () => Record<number, string | null>;
  hud?: (engine: Engine) => ReactNode; // HUD superior
  overlay?: ReactNode; // ventanas (resultados, etc.)
  showScore?: boolean;
  clockLabel?: (engine: Engine) => string;
  stadiumId?: string;
};

export function GameView(props: Props) {
  const [engine, setEngine] = useState<Engine | null>(null);
  const input = useRef(createInput()).current;
  const kitId = useGame((s) => s.kit);
  const stadiumId = useGame((s) => s.stadium);
  const [cam, setCam] = useState<CamMode>(() => (window.innerWidth < window.innerHeight ? 'side' : 'behind'));
  const [paused, setPaused] = useState(false);
  const [, force] = useState(0);
  const cbs = useRef(props);
  cbs.current = props;

  useEffect(() => {
    let alive = true;
    let eng: Engine | null = null;
    initPhysics().then(() => {
      if (!alive) return;
      eng = new Engine(props.config);
      eng.on((e) => cbs.current.onEvent?.(e, eng!));
      setEngine(eng);
      // acceso para pruebas automáticas
      (window as any).__game = { engine: eng, input };
      cbs.current.onReady?.({ engine: eng, input });
    });
    const detach = attachKeyboard(input);
    startCrowd();
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') setPaused((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      alive = false;
      detach();
      stopCrowd();
      stopSpeaking();
      window.removeEventListener('keydown', onKey);
      eng?.dispose();
    };
  }, []);

  useEffect(() => {
    if (engine) engine.paused = paused;
  }, [paused, engine]);

  // refresco del HUD ~8 veces por segundo
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 120);
    return () => clearInterval(t);
  }, []);

  if (!engine)
    return (
      <div className="loading">
        <div className="spinner">⚽</div>
        <Es t={{ es: 'Preparando el estadio…', hy: 'Մարզադաշտը պատրաստվում է…' }} />
      </div>
    );

  const sp = engine.setPiece;
  const charge = sp ? (sp.taken ? 0 : sp.power) : engine.shootCharge;
  const banner = bannerFor(engine.freezeLabel);

  return (
    <div className="game">
      <GameScene
        engine={engine}
        input={input}
        kit={getKit(kitId)}
        stadium={getStadium(props.stadiumId || stadiumId)}
        camMode={cam}
        zones={props.zones}
        coach={props.coach}
        labels={props.labels}
        onFrame={(dt) => cbs.current.onFrame?.(dt, engine)}
      />
      <div className="hud-top">
        <Btn label={UI.pause} icon="⏸" className="small ghost" onClick={() => setPaused(true)} />
        {props.showScore !== false && (
          <div className="scoreboard">
            <span className="team home">
              <Es t={UI.home} />
            </span>
            <span className="score">
              {engine.score[0]} - {engine.score[1]}
            </span>
            <span className="team away">
              <Es t={UI.away} />
            </span>
            {props.clockLabel && <span className="clock">{props.clockLabel(engine)}</span>}
          </div>
        )}
        <Btn label={UI.camera} icon="🎥" className="small ghost" onClick={() => setCam((c) => (c === 'behind' ? 'side' : 'behind'))} />
      </div>
      {props.hud?.(engine)}
      {banner && (
        <div className={`banner ${engine.freezeLabel}`}>
          <Es t={banner} />
        </div>
      )}
      {charge > 0.02 && (
        <div className="charge">
          <div className="charge-fill" style={{ width: `${charge * 100}%` }} />
        </div>
      )}
      {sp && !sp.taken && (
        <div className="aim-help">
          <Es t={UI.aim} />
        </div>
      )}
      <TouchControls input={input} hasBall={() => engine.owner === engine.human} setPiece={() => !!engine.setPiece} />
      <div className="kb-help">
        <Es t={UI.controls} />
      </div>
      {paused && (
        <div className="modal-bg">
          <div className="modal">
            <Es t={UI.pause} as="h2" />
            <Btn label={UI.resume} icon="▶️" onClick={() => setPaused(false)} />
            <Btn label={UI.exit} icon="🚪" className="ghost" onClick={props.onExit} />
          </div>
        </div>
      )}
      {props.overlay}
    </div>
  );
}

function bannerFor(label: string) {
  switch (label) {
    case 'goal':
      return UI.goal;
    case 'throw':
      return UI.out;
    case 'corner':
      return UI.cornerKick;
    case 'goalkick':
      return UI.goalKick;
    case 'foul':
      return UI.foul;
    case 'save':
      return UI.saved;
    case 'miss':
      return UI.missed;
    default:
      return null;
  }
}

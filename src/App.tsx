import { useState } from 'react';
import { StartScreen } from './screens/StartScreen';
import { Menu, ScreenName } from './screens/Menu';
import { Training, TrainingSelect } from './screens/Training';
import { Match, MatchSetup, MatchSettings } from './screens/Match';
import { SetPieces } from './screens/SetPieces';
import { ConversationList, ConversationPlayer } from './screens/Conversations';
import { MissionDetail, MissionList } from './screens/Missions';
import { MiniGame, MiniGameList } from './screens/MiniGames';
import { Learn } from './screens/Learn';
import { Progress } from './screens/Progress';
import { Btn, Toasts, TranslationPopover } from './components/Es';
import { useGame, Cefr } from './store';
import { UI } from './i18n/ui';
import { Mission } from './data/missions';
import { SCENES, Scene } from './data/conversations';
import { GameId } from './data/minigames';
import { usePop } from './components/Es';

type Route =
  | { s: 'start' }
  | { s: 'menu' }
  | { s: 'trainingSelect' }
  | { s: 'training'; cefr: Cefr }
  | { s: 'matchSetup' }
  | { s: 'match'; settings: MatchSettings }
  | { s: 'setpieces'; kind: 'penalties' | 'freekicks' }
  | { s: 'conversations' }
  | { s: 'conversation'; scene: Scene }
  | { s: 'missions' }
  | { s: 'mission'; m: Mission }
  | { s: 'stage'; m: Mission; i: number }
  | { s: 'minigames' }
  | { s: 'minigame'; id: GameId }
  | { s: 'learn' }
  | { s: 'progress' };

function TopBar({ inGame }: { inGame: boolean }) {
  const g = useGame();
  const open = usePop((s) => s.open);
  return (
    <div className={`topbar ${inGame ? 'in-game' : ''}`}>
      <button
        className={`tb ${g.translateMode ? 'on' : ''}`}
        title={UI.translateMode.es}
        onClick={(e) => {
          const v = !g.translateMode;
          g.setTranslateMode(v);
          if (v) open(UI.translateModeOn, e.currentTarget);
        }}
      >
        🇦🇲
      </button>
      <button className="tb" title={g.voice ? UI.voiceOn.es : UI.voiceOff.es} onClick={() => g.setVoice(!g.voice)}>
        {g.voice ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

export default function App() {
  const [r, setR] = useState<Route>({ s: 'start' });
  const g = useGame();
  const menu = () => setR({ s: 'menu' });

  const go = (s: ScreenName) => {
    if (s === 'training') setR({ s: 'trainingSelect' });
    else if (s === 'match') setR({ s: 'matchSetup' });
    else if (s === 'conversations') setR({ s: 'conversations' });
    else if (s === 'missions') setR({ s: 'missions' });
    else if (s === 'minigames') setR({ s: 'minigames' });
    else if (s === 'learn') setR({ s: 'learn' });
    else if (s === 'progress') setR({ s: 'progress' });
  };

  const stageDone = (m: Mission, i: number, ok: boolean) => {
    if (!ok) return;
    g.setMission(m.id, i + 1);
    if (i + 1 === m.stages.length) {
      g.addXP(m.reward);
      g.unlock('firstMission');
      if (m.id === 'm6') g.unlock('champion');
      g.toast({ icon: m.icon, text: UI.completed, sub: `+${m.reward} XP` });
    }
  };

  const renderStage = (m: Mission, i: number) => {
    const s = m.stages[i];
    const back = () => setR({ s: 'mission', m });
    switch (s.type) {
      case 'training':
        return <Training cefr={g.cefr} tasks={s.tasks} onExit={back} onComplete={(ok) => stageDone(m, i, ok)} />;
      case 'match':
        return (
          <Match
            settings={{ minutes: s.minutes, difficulty: s.difficulty, stadium: s.stadium }}
            onExit={back}
            onComplete={(res) => stageDone(m, i, !s.needWin || res.us > res.them)}
          />
        );
      case 'conversation':
        return <ConversationPlayer scene={SCENES.find((x) => x.id === s.scene)!} onExit={back} onComplete={() => stageDone(m, i, true)} />;
      case 'penalties':
      case 'freekicks':
        return <SetPieces kind={s.type} shots={s.shots} need={s.need} difficulty={s.difficulty} onExit={back} onComplete={(_, ok) => stageDone(m, i, ok)} />;
      case 'minigame':
        return (
          <MiniGame
            id={s.game}
            onExit={() => {
              stageDone(m, i, true);
              back();
            }}
          />
        );
    }
  };

  let body: JSX.Element;
  switch (r.s) {
    case 'start':
      body = <StartScreen onStart={menu} />;
      break;
    case 'menu':
      body = <Menu go={go} />;
      break;
    case 'trainingSelect':
      body = (
        <div>
          <TrainingSelect onPick={(cefr) => setR({ s: 'training', cefr })} onBack={menu} />
          <div className="screen extra">
            <div className="row">
              <Btn label={UI.penaltiesTitle} icon="🥅" className="tile green" onClick={() => setR({ s: 'setpieces', kind: 'penalties' })} />
              <Btn label={UI.freeKicksTitle} icon="🎯" className="tile orange" onClick={() => setR({ s: 'setpieces', kind: 'freekicks' })} />
            </div>
          </div>
        </div>
      );
      break;
    case 'training':
      body = <Training key={r.cefr} cefr={r.cefr} onExit={() => setR({ s: 'trainingSelect' })} />;
      break;
    case 'matchSetup':
      body = <MatchSetup onStart={(settings) => setR({ s: 'match', settings })} onBack={menu} />;
      break;
    case 'match':
      body = <Match settings={r.settings} onExit={() => setR({ s: 'matchSetup' })} />;
      break;
    case 'setpieces':
      body = <SetPieces kind={r.kind} onExit={() => setR({ s: 'trainingSelect' })} />;
      break;
    case 'conversations':
      body = <ConversationList onPick={(scene) => setR({ s: 'conversation', scene })} onBack={menu} />;
      break;
    case 'conversation':
      body = <ConversationPlayer key={r.scene.id} scene={r.scene} onExit={() => setR({ s: 'conversations' })} />;
      break;
    case 'missions':
      body = <MissionList onPick={(m) => setR({ s: 'mission', m })} onBack={menu} />;
      break;
    case 'mission':
      body = <MissionDetail m={r.m} onStage={(i) => setR({ s: 'stage', m: r.m, i })} onBack={() => setR({ s: 'missions' })} />;
      break;
    case 'stage':
      body = <div key={`${r.m.id}-${r.i}`} className="stage-wrap">{renderStage(r.m, r.i)}</div>;
      break;
    case 'minigames':
      body = <MiniGameList onPick={(id) => setR({ s: 'minigame', id })} onBack={menu} />;
      break;
    case 'minigame':
      body = <MiniGame key={r.id} id={r.id} onExit={() => setR({ s: 'minigames' })} />;
      break;
    case 'learn':
      body = <Learn onBack={menu} go={(s) => go(s)} />;
      break;
    case 'progress':
      body = <Progress onBack={menu} />;
      break;
  }
  const inGame = ['training', 'match', 'setpieces', 'stage'].includes(r.s);
  return (
    <div className="app">
      {r.s !== 'start' && <TopBar inGame={inGame} />}
      {body}
      <Toasts />
      <TranslationPopover />
    </div>
  );
}

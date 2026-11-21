import { Btn, Es } from '../components/Es';
import { UI, Phrase } from '../i18n/ui';
import { Cefr, useGame } from '../store';
import { levelFromXP, titleFor, xpForLevel } from '../data/progression';
import { HeroCanvas } from './StartScreen';

export type ScreenName = 'training' | 'match' | 'conversations' | 'missions' | 'minigames' | 'learn' | 'progress';

const ITEMS: { id: ScreenName; icon: string; label: Phrase; desc: Phrase; color: string }[] = [
  { id: 'training', icon: '🏃', label: UI.training, desc: UI.trainingDesc, color: 'green' },
  { id: 'match', icon: '⚽', label: UI.match, desc: UI.matchDesc, color: 'orange' },
  { id: 'conversations', icon: '💬', label: UI.conversations, desc: UI.conversationsDesc, color: 'blue' },
  { id: 'missions', icon: '🗺️', label: UI.missions, desc: UI.missionsDesc, color: 'orange' },
  { id: 'minigames', icon: '🎲', label: UI.minigames, desc: UI.minigamesDesc, color: 'green' },
  { id: 'learn', icon: '📚', label: UI.learn, desc: UI.learnDesc, color: 'blue' },
  { id: 'progress', icon: '🏆', label: UI.progress, desc: UI.progressDesc, color: 'navy' },
];

export function PlayerBadge() {
  const xp = useGame((s) => s.xp);
  const lvl = levelFromXP(xp);
  const a = xpForLevel(lvl),
    b = xpForLevel(lvl + 1);
  return (
    <div className="badge">
      <div className="badge-num">7</div>
      <div className="badge-info">
        <b>RAZMIK</b> · <Es t={titleFor(lvl)} />
        <div className="bar small">
          <div style={{ width: `${((xp - a) / (b - a)) * 100}%` }} />
        </div>
        <small>
          <Es t={UI.level} /> {lvl} · {xp} XP
        </small>
      </div>
    </div>
  );
}

export function Menu({ go }: { go: (s: ScreenName) => void }) {
  const g = useGame();
  return (
    <div className="screen menu">
      <div className="menu-top">
        <PlayerBadge />
        <div className="cefr-pick">
          <Es t={UI.level} />:
          {(['A1', 'A2', 'B1', 'B2'] as Cefr[]).map((c) => (
            <button key={c} className={`cefr cefr-${c} ${g.cefr === c ? 'on' : ''}`} onClick={() => g.setCefr(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="menu-body">
        <div className="menu-hero">
          <HeroCanvas height={300} />
        </div>
        <div className="menu-grid">
          {ITEMS.map((it) => (
            <Btn key={it.id} label={it.label} icon={it.icon} sub={it.desc} className={`tile ${it.color}`} onClick={() => go(it.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

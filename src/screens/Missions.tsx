import { Btn, Es } from '../components/Es';
import { UI } from '../i18n/ui';
import { useGame } from '../store';
import { MISSIONS, Mission, Stage } from '../data/missions';

const ICON: Record<Stage['type'], string> = {
  training: '🏃',
  match: '⚽',
  conversation: '💬',
  penalties: '🥅',
  freekicks: '🎯',
  minigame: '🎲',
};

export function MissionList({ onPick, onBack }: { onPick: (m: Mission) => void; onBack: () => void }) {
  const prog = useGame((s) => s.missions);
  return (
    <div className="screen">
      <div className="screen-head">
        <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onBack} />
        <Es t={UI.missions} as="h1" />
      </div>
      <div className="grid3">
        {MISSIONS.map((m) => {
          const done = prog[m.id] || 0;
          return (
            <div key={m.id} className={`card mission ${done >= m.stages.length ? 'done' : ''}`} onClick={() => onPick(m)}>
              <div className="conv-icon">{m.icon}</div>
              <Es t={m.name} as="h3" />
              <Es t={m.story} as="p" className="muted" />
              <div className="bar">
                <div style={{ width: `${(done / m.stages.length) * 100}%` }} />
              </div>
              <small>
                {done} / {m.stages.length} · 🎁 {m.reward} XP
              </small>
              {done >= m.stages.length && <div className="done-mark">✅</div>}
              <Btn label={UI.play} icon="▶️" className="small" onClick={() => onPick(m)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MissionDetail({ m, onStage, onBack }: { m: Mission; onStage: (i: number) => void; onBack: () => void }) {
  const done = useGame((s) => s.missions[m.id] || 0);
  return (
    <div className="screen">
      <div className="screen-head">
        <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onBack} />
        <Es t={m.name} as="h1" />
      </div>
      <div className="card">
        <div className="big-emoji">{m.icon}</div>
        <Es t={m.story} as="p" />
        <div className="stages">
          {m.stages.map((s, i) => {
            const state = i < done ? 'done' : i === done ? 'cur' : 'locked';
            return (
              <div key={i} className={`stage ${state}`}>
                <span className="stage-icon">{state === 'done' ? '✅' : state === 'locked' ? '🔒' : ICON[s.type]}</span>
                <div className="stage-body">
                  <small>
                    <Es t={UI.stage} /> {i + 1}
                  </small>
                  <Es t={s.title} as="div" />
                  {s.type === 'match' && s.needWin && (
                    <small className="muted">
                      🏆 <Es t={UI.win} />
                    </small>
                  )}
                </div>
                {state !== 'locked' && <Btn label={state === 'done' ? UI.restart : UI.play} icon="▶️" className="small" onClick={() => onStage(i)} />}
              </div>
            );
          })}
        </div>
        {done >= m.stages.length && (
          <div className="praise">
            🎉 <Es t={UI.completed} />
          </div>
        )}
      </div>
    </div>
  );
}

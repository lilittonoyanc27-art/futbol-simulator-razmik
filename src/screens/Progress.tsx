import { useState } from 'react';
import { Btn, Es } from '../components/Es';
import { UI } from '../i18n/ui';
import { useGame } from '../store';
import { ACHIEVEMENTS, KITS, STADIUMS, levelFromXP } from '../data/progression';
import { PlayerBadge } from './Menu';
import { TRAINING } from '../data/training';
import { SCENES } from '../data/conversations';

export function Progress({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const lvl = levelFromXP(g.xp);
  const [confirm, setConfirm] = useState(false);
  const learned = Object.values(g.phrases).filter((v) => v >= 2).length;
  const heard = Object.keys(g.phrases).length;
  const s = g.stats;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  return (
    <div className="screen">
      <div className="screen-head">
        <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onBack} />
        <Es t={UI.progress} as="h1" />
      </div>
      <div className="card">
        <PlayerBadge />
        <div className="stat-grid">
          <div className="stat"><b>{learned}</b><Es t={UI.phrasesLearned} /><small>({heard})</small></div>
          <div className="stat"><b>{pct(s.listenCorrect, s.listenTotal)}%</b><Es t={UI.listening} /><small>{s.listenCorrect}/{s.listenTotal}</small></div>
          <div className="stat"><b>{pct(s.speakSuccess, s.speakAttempts)}%</b><Es t={UI.speaking} /><small>{s.speakSuccess}/{s.speakAttempts}</small></div>
          <div className="stat"><b>{s.understood}</b><Es t={UI.understood} /></div>
        </div>
      </div>

      <div className="card">
        <Es t={UI.stats} as="h2" />
        <div className="stat-grid">
          <div className="stat"><b>{s.played}</b><Es t={UI.played} /></div>
          <div className="stat"><b>{s.won}</b><Es t={UI.won} /></div>
          <div className="stat"><b>{s.drawn}</b><Es t={UI.drawn} /></div>
          <div className="stat"><b>{s.lost}</b><Es t={UI.lost} /></div>
          <div className="stat"><b>{s.goals}</b><Es t={UI.goalsScored} /></div>
          <div className="stat"><b>{s.passes}</b><Es t={UI.passesDone} /></div>
          <div className="stat"><b>{s.shots}</b><Es t={UI.shotsDone} /></div>
          <div className="stat"><b>{g.conversationsDone.length}/{SCENES.length}</b><Es t={UI.conversations} /></div>
        </div>
        <div className="row wrap">
          {(['A1', 'A2', 'B1', 'B2'] as const).map((c) => (
            <div key={c} className="mini-prog">
              <span className={`cefr cefr-${c}`}>{c}</span>
              <div className="bar"><div style={{ width: `${((g.trainingDone[c] || 0) / TRAINING[c].length) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <Es t={UI.achievements} as="h2" />
        <div className="ach-grid">
          {ACHIEVEMENTS.map((a) => {
            const got = g.achievements.includes(a.id);
            return (
              <div key={a.id} className={`ach ${got ? 'got' : ''}`}>
                <div className="ach-icon">{got ? a.icon : '🔒'}</div>
                <Es t={a.name} as="b" />
                <Es t={a.desc} as="small" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <Es t={UI.kits} as="h2" />
        <div className="kit-grid">
          {KITS.map((k) => {
            const locked = k.unlockLevel > lvl;
            return (
              <div key={k.id} className={`kit ${g.kit === k.id ? 'on' : ''} ${locked ? 'locked' : ''}`}>
                <div className="shirt" style={{ background: k.shirt, color: k.number }}>7</div>
                <Es t={k.name} />
                {locked ? (
                  <small>🔒 <Es t={UI.level} /> {k.unlockLevel}</small>
                ) : (
                  <Btn label={g.kit === k.id ? UI.equipped : UI.equip} className="small" onClick={() => g.setKit(k.id)} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <Es t={UI.stadiums} as="h2" />
        <div className="kit-grid">
          {STADIUMS.map((st) => {
            const locked = st.unlockLevel > lvl;
            return (
              <div key={st.id} className={`kit ${g.stadium === st.id ? 'on' : ''} ${locked ? 'locked' : ''}`}>
                <div className="stadium-thumb" style={{ background: `linear-gradient(${st.sky}, ${st.seat} 55%, ${st.grassA} 56%)` }}>🏟️</div>
                <Es t={st.name} />
                {locked ? (
                  <small>🔒 <Es t={UI.level} /> {st.unlockLevel}</small>
                ) : (
                  <Btn label={g.stadium === st.id ? UI.selected : UI.select} className="small" onClick={() => g.setStadium(st.id)} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <Es t={UI.settings} as="h2" />
        <div className="row wrap">
          <Btn label={g.voice ? UI.voiceOn : UI.voiceOff} icon={g.voice ? '🔊' : '🔇'} className="ghost" onClick={() => g.setVoice(!g.voice)} />
          <Btn label={g.slowVoice ? UI.slow : UI.normal} icon="🐢" className="ghost" onClick={() => g.setSlowVoice(!g.slowVoice)} sub={UI.speechRate} />
        </div>
        <Btn label={UI.resetProgress} icon="🗑️" className="danger" onClick={() => setConfirm(true)} />
      </div>

      {confirm && (
        <div className="modal-bg">
          <div className="modal">
            <div className="big-emoji">⚠️</div>
            <Es t={UI.sure} as="h3" />
            <div className="row">
              <Btn label={UI.yes} className="danger" onClick={() => { g.reset(); setConfirm(false); }} />
              <Btn label={UI.no} className="ghost" onClick={() => setConfirm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

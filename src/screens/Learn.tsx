import { useMemo, useState } from 'react';
import { Btn, Es, PhraseCard } from '../components/Es';
import { UI, p, Phrase } from '../i18n/ui';
import { Cefr, useGame } from '../store';
import { WORDS } from '../data/vocab';
import { GRAMMAR, GrammarTopic } from '../data/grammar';
import { TRAINING } from '../data/training';
import { SCENES } from '../data/conversations';
import { LISTEN_ITEMS } from '../data/minigames';
import { speak } from '../audio/speech';
import { ding } from '../audio/sfx';

type Cat = 'vocab' | 'listen' | 'speak' | 'grammar' | 'conversations' | 'missions' | 'matches';
const CATS: { id: Cat; icon: string; label: Phrase }[] = [
  { id: 'vocab', icon: '📗', label: UI.vocab },
  { id: 'listen', icon: '👂', label: UI.listenCat },
  { id: 'speak', icon: '🎤', label: UI.speakCat },
  { id: 'grammar', icon: '✏️', label: UI.grammar },
  { id: 'conversations', icon: '💬', label: UI.conversations },
  { id: 'missions', icon: '🗺️', label: UI.missions },
  { id: 'matches', icon: '⚽', label: UI.matches },
];
const LEVELS: Cefr[] = ['A1', 'A2', 'B1', 'B2'];
const order = (c: Cefr) => LEVELS.indexOf(c);

export function Learn({ onBack, go }: { onBack: () => void; go: (s: 'conversations' | 'missions' | 'match') => void }) {
  const g = useGame();
  const [cat, setCat] = useState<Cat | null>(null);
  const [level, setLevel] = useState<Cefr>(g.cefr);
  return (
    <div className="screen">
      <div className="screen-head">
        <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={() => (cat ? setCat(null) : onBack())} />
        <Es t={cat ? CATS.find((c) => c.id === cat)!.label : UI.learn} as="h1" />
        <div className="cefr-pick">
          {LEVELS.map((c) => (
            <button key={c} className={`cefr cefr-${c} ${level === c ? 'on' : ''}`} onClick={() => setLevel(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {!cat && (
        <div className="grid4">
          {CATS.map((c) => (
            <Btn
              key={c.id}
              label={c.label}
              icon={c.icon}
              className="tile blue"
              onClick={() => {
                if (c.id === 'conversations') go('conversations');
                else if (c.id === 'missions') go('missions');
                else if (c.id === 'matches') go('match');
                else setCat(c.id);
              }}
            />
          ))}
        </div>
      )}
      {cat === 'vocab' && <Vocab level={level} />}
      {cat === 'listen' && <ListenPractice level={level} />}
      {cat === 'speak' && <SpeakPractice level={level} />}
      {cat === 'grammar' && <Grammar level={level} />}
    </div>
  );
}

function Vocab({ level }: { level: Cefr }) {
  const g = useGame();
  const words = WORDS.filter((w) => order(w.cefr) <= order(level));
  const [sel, setSel] = useState(0);
  const w = words[Math.min(sel, words.length - 1)];
  return (
    <div className="vocab">
      <div className="card flash">
        <div className="flash-emoji">{w.emoji}</div>
        <PhraseCard t={{ es: w.es, hy: w.hy }} />
        <div className="muted">
          <Es t={UI.examples} />:
        </div>
        <PhraseCard t={w.ex} compact />
        <div className="row">
          <Btn label={p('Anterior', 'Նախորդը')} icon="⬅️" className="ghost" onClick={() => setSel((sel - 1 + words.length) % words.length)} />
          <Btn
            label={g.vocabLearned.includes(w.id) ? UI.learned : p('¡Ya la sé!', 'Արդեն գիտեմ։')}
            icon={g.vocabLearned.includes(w.id) ? '✅' : '⭐'}
            onClick={() => {
              if (!g.vocabLearned.includes(w.id)) {
                g.learnVocab(w.id);
                g.learnPhrase(w.es, 2);
                g.addXP(3);
                ding(true);
              }
              setSel((sel + 1) % words.length);
            }}
          />
          <Btn label={UI.next} icon="➡️" className="ghost" onClick={() => setSel((sel + 1) % words.length)} />
        </div>
      </div>
      <div className="word-grid">
        {words.map((x, i) => (
          <button key={x.id} className={`word-chip ${i === sel ? 'on' : ''} ${g.vocabLearned.includes(x.id) ? 'learned' : ''}`} onClick={() => { setSel(i); speak(x.es); }}>
            <span>{x.emoji}</span> {x.es} <small className={`cefr cefr-${x.cefr}`}>{x.cefr}</small>
            <div className="muted small">{x.cat.es}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ListenPractice({ level }: { level: Cefr }) {
  const g = useGame();
  const pool = useMemo(() => {
    const out: Phrase[] = [...LISTEN_ITEMS.map((x) => x.say)];
    for (const c of LEVELS.filter((c) => order(c) <= order(level))) TRAINING[c].forEach((t) => out.push(t.say));
    return out;
  }, [level]);
  const [round, setRound] = useState(() => make(pool));
  const [ans, setAns] = useState<number | null>(null);
  function make(pl: Phrase[]) {
    const sh = [...pl].sort(() => Math.random() - 0.5).slice(0, 3);
    return { target: sh[0], options: [...sh].sort(() => Math.random() - 0.5) };
  }
  return (
    <div className="card center">
      <Es t={p('Escucha y elige la frase que has oído', 'Լսի՛ր և ընտրի՛ր այն արտահայտությունը, որը լսեցիր')} as="h3" />
      <div className="row">
        <button className="btn big" onClick={() => speak(round.target.es, { force: true })}>
          🔊 {UI.listen.es}
        </button>
        <button className="btn ghost" onClick={() => speak(round.target.es, { force: true, rate: 0.65 })}>
          🐢 {UI.repeat.es}
        </button>
      </div>
      <div className="choices">
        {round.options.map((o, k) => (
          <button
            key={k}
            className={`choice ${ans !== null ? (o === round.target ? 'ok' : ans === k ? 'bad' : '') : ''}`}
            onClick={() => {
              if (ans !== null) return;
              setAns(k);
              g.stat('listenTotal');
              if (o === round.target) {
                g.stat('listenCorrect');
                g.learnPhrase(o.es, 2);
                g.addXP(5);
                ding(true);
              } else ding(false);
            }}
          >
            {o.es}
          </button>
        ))}
      </div>
      {ans !== null && (
        <>
          <PhraseCard t={round.target} compact />
          <Btn label={UI.next} icon="➡️" onClick={() => { setAns(null); const r = make(pool); setRound(r); speak(r.target.es); }} />
        </>
      )}
      <div className="muted">
        <Es t={UI.listening} />: {g.stats.listenCorrect} / {g.stats.listenTotal}
      </div>
    </div>
  );
}

function SpeakPractice({ level }: { level: Cefr }) {
  const g = useGame();
  const pool = useMemo(() => {
    const out: Phrase[] = [];
    for (const s of SCENES.filter((s) => order(s.cefr) <= order(level)))
      for (const n of s.nodes) if ('choose' in n) n.choose.filter((o) => o.ok).forEach((o) => out.push(o.t));
    return out;
  }, [level]);
  const [i, setI] = useState(0);
  const t = pool[i % pool.length];
  return (
    <div className="card center">
      <Es t={p('Escucha, repite y pulsa «Hablar»', 'Լսի՛ր, կրկնի՛ր և սեղմի՛ր «Խոսել»')} as="h3" />
      <PhraseCard t={t} autoSpeak onSpoken={(ok) => ok && setTimeout(() => setI(i + 1), 1600)} />
      <Btn label={UI.next} icon="➡️" className="ghost" onClick={() => setI(i + 1)} />
      <div className="muted">
        <Es t={UI.speaking} />: {g.stats.speakSuccess} / {g.stats.speakAttempts}
      </div>
    </div>
  );
}

function Grammar({ level }: { level: Cefr }) {
  const topics = GRAMMAR.filter((t) => order(t.cefr) <= order(level));
  const [sel, setSel] = useState<GrammarTopic | null>(null);
  if (sel) return <GrammarTopicView t={sel} onBack={() => setSel(null)} />;
  return (
    <div className="grid3">
      {topics.map((t) => (
        <div key={t.id} className="card" onClick={() => setSel(t)}>
          <span className={`cefr cefr-${t.cefr}`}>{t.cefr}</span>
          <Es t={t.name} as="h3" />
          <Es t={t.explain} as="p" className="muted" />
          <Btn label={UI.practice} icon="✏️" onClick={() => setSel(t)} />
        </div>
      ))}
    </div>
  );
}

function GrammarTopicView({ t, onBack }: { t: GrammarTopic; onBack: () => void }) {
  const g = useGame();
  const [ans, setAns] = useState<Record<number, number>>({});
  return (
    <div className="card grammar">
      <Btn label={UI.back} icon="⬅️" className="ghost small" onClick={onBack} />
      <Es t={t.name} as="h2" />
      <PhraseCard t={t.explain} compact />
      <div className="forms">
        {t.forms.map((f, i) => (
          <Es key={i} t={f} className="chip big" speakOnClick />
        ))}
      </div>
      <Es t={UI.examples} as="h3" />
      {t.examples.map((e, i) => (
        <PhraseCard key={i} t={e} compact />
      ))}
      <Es t={UI.practice} as="h3" />
      {t.exercises.map((ex, i) => (
        <div key={i} className="exercise">
          <Es t={ex.q} as="div" />
          <div className="row">
            {ex.options.map((o, k) => (
              <button
                key={k}
                className={`choice small ${ans[i] !== undefined ? (k === ex.answer ? 'ok' : ans[i] === k ? 'bad' : '') : ''}`}
                onClick={() => {
                  if (ans[i] !== undefined) return;
                  setAns({ ...ans, [i]: k });
                  if (k === ex.answer) {
                    ding(true);
                    g.addXP(5);
                    speak(ex.q.es.replace('___', o).replace(/\(.*\)/, ''));
                    g.learnPhrase(ex.q.es, 1);
                  } else ding(false);
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

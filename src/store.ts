import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACHIEVEMENTS, AchievementId, KITS, STADIUMS, levelFromXP } from './data/progression';
import { Phrase, UI } from './i18n/ui';
import { setSpeechRate, setVoiceEnabled } from './audio/speech';
import { ding } from './audio/sfx';

export type Cefr = 'A1' | 'A2' | 'B1' | 'B2';

export type Toast = { id: number; icon: string; text: Phrase; sub?: string };

type Stats = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals: number;
  passes: number;
  shots: number;
  understood: number;
  translations: number;
  listenCorrect: number;
  listenTotal: number;
  speakAttempts: number;
  speakSuccess: number;
  penaltyStreak: number;
};

type Persisted = {
  xp: number;
  cefr: Cefr;
  kit: string;
  stadium: string;
  voice: boolean;
  sfx: boolean;
  slowVoice: boolean;
  stats: Stats;
  phrases: Record<string, number>; // frase → nivel de dominio (1 escuchada, 2+ practicada)
  achievements: AchievementId[];
  trainingDone: Record<string, number>; // "A1" → nº de tareas completadas
  conversationsDone: string[];
  missions: Record<string, number>; // id → etapas completadas
  bests: Record<string, number>;
  vocabLearned: string[];
};

type State = Persisted & {
  toasts: Toast[];
  translateMode: boolean;
  setTranslateMode: (v: boolean) => void;
  addXP: (n: number) => void;
  setCefr: (c: Cefr) => void;
  setKit: (k: string) => void;
  setStadium: (s: string) => void;
  setVoice: (v: boolean) => void;
  setSfxOn: (v: boolean) => void;
  setSlowVoice: (v: boolean) => void;
  stat: (k: keyof Stats, n?: number) => void;
  setStat: (k: keyof Stats, n: number) => void;
  learnPhrase: (es: string, amount?: number) => void;
  unlock: (id: AchievementId) => void;
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  setTraining: (cefr: Cefr, n: number) => void;
  finishConversation: (id: string) => void;
  setMission: (id: string, n: number) => void;
  setBest: (id: string, n: number) => void;
  learnVocab: (id: string) => void;
  recordMatch: (us: number, them: number) => void;
  reset: () => void;
};

const initial: Persisted = {
  xp: 0,
  cefr: 'A1',
  kit: 'naranja',
  stadium: 'barrio',
  voice: true,
  sfx: true,
  slowVoice: false,
  stats: {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goals: 0,
    passes: 0,
    shots: 0,
    understood: 0,
    translations: 0,
    listenCorrect: 0,
    listenTotal: 0,
    speakAttempts: 0,
    speakSuccess: 0,
    penaltyStreak: 0,
  },
  phrases: {},
  achievements: [],
  trainingDone: {},
  conversationsDone: [],
  missions: {},
  bests: {},
  vocabLearned: [],
};

let toastId = 1;

export const useGame = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      toasts: [],
      translateMode: false,
      setTranslateMode: (v) => set({ translateMode: v }),
      addXP: (n) => {
        const before = levelFromXP(get().xp);
        const xp = get().xp + n;
        set({ xp });
        const after = levelFromXP(xp);
        if (after > before) {
          get().toast({ icon: '⭐', text: UI.levelUp, sub: `${UI.level.es} ${after}` });
          KITS.filter((k) => k.unlockLevel > before && k.unlockLevel <= after).forEach((k) =>
            get().toast({ icon: '👕', text: UI.newKit, sub: k.name.es }),
          );
          STADIUMS.filter((s) => s.unlockLevel > before && s.unlockLevel <= after).forEach((s) =>
            get().toast({ icon: '🏟️', text: UI.newStadium, sub: s.name.es }),
          );
        }
      },
      setCefr: (cefr) => set({ cefr }),
      setKit: (kit) => set({ kit }),
      setStadium: (stadium) => set({ stadium }),
      setVoice: (voice) => {
        setVoiceEnabled(voice);
        set({ voice });
      },
      setSfxOn: (sfx) => set({ sfx }),
      setSlowVoice: (slowVoice) => {
        setSpeechRate(slowVoice ? 0.72 : 0.92);
        set({ slowVoice });
      },
      stat: (k, n = 1) => {
        const stats = { ...get().stats, [k]: get().stats[k] + n };
        set({ stats });
        const s = stats;
        const u = get().unlock;
        if (s.goals >= 1) u('firstGoal');
        if (s.won >= 1) u('firstWin');
        if (s.won >= 5) u('fiveWins');
        if (s.passes >= 50) u('passMaster');
        if (s.translations >= 30) u('translator');
        if (s.speakSuccess >= 10) u('talker');
        if (s.listenCorrect >= 20) u('listener');
        if (s.penaltyStreak >= 5) u('penaltyKing');
      },
      setStat: (k, n) => set({ stats: { ...get().stats, [k]: n } }),
      learnPhrase: (es, amount = 1) => {
        const cur = get().phrases[es] || 0;
        const phrases = { ...get().phrases, [es]: Math.min(5, cur + amount) };
        set({ phrases });
        const learned = Object.values(phrases).filter((v) => v >= 2).length;
        if (learned >= 25) get().unlock('phrases25');
        if (learned >= 100) get().unlock('phrases100');
      },
      unlock: (id) => {
        if (get().achievements.includes(id)) return;
        set({ achievements: [...get().achievements, id] });
        const a = ACHIEVEMENTS.find((x) => x.id === id)!;
        get().toast({ icon: a.icon, text: a.name, sub: '+50 XP' });
        get().addXP(50);
        ding(true);
      },
      toast: (t) => {
        const id = toastId++;
        set({ toasts: [...get().toasts, { ...t, id }] });
        setTimeout(() => get().dismissToast(id), 3800);
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
      setTraining: (cefr, n) => {
        const cur = get().trainingDone[cefr] || 0;
        if (n > cur) set({ trainingDone: { ...get().trainingDone, [cefr]: n } });
      },
      finishConversation: (id) => {
        if (!get().conversationsDone.includes(id)) set({ conversationsDone: [...get().conversationsDone, id] });
        get().unlock('firstConversation');
        if (get().conversationsDone.length >= 10) get().unlock('allConversations');
      },
      setMission: (id, n) => {
        const cur = get().missions[id] || 0;
        if (n > cur) set({ missions: { ...get().missions, [id]: n } });
      },
      setBest: (id, n) => {
        if (n > (get().bests[id] || 0)) set({ bests: { ...get().bests, [id]: n } });
      },
      learnVocab: (id) => {
        if (!get().vocabLearned.includes(id)) set({ vocabLearned: [...get().vocabLearned, id] });
      },
      recordMatch: (us, them) => {
        const st = get().stat;
        st('played');
        if (us > them) st('won');
        else if (us === them) st('drawn');
        else st('lost');
        get().addXP(us > them ? 120 : us === them ? 60 : 30);
      },
      reset: () => {
        set({ ...initial, stats: { ...initial.stats } });
        setVoiceEnabled(true);
        setSpeechRate(0.92);
      },
    }),
    {
      name: 'futbol-habla-razmik-v1',
      partialize: (s) => {
        const { toasts, translateMode, ...rest } = s;
        void toasts;
        void translateMode;
        const out: Partial<State> = {};
        for (const k of Object.keys(initial) as (keyof Persisted)[]) (out as any)[k] = (rest as any)[k];
        return out as Persisted;
      },
      onRehydrateStorage: () => (s) => {
        if (s) {
          setVoiceEnabled(s.voice);
          setSpeechRate(s.slowVoice ? 0.72 : 0.92);
        }
      },
    },
  ),
);

export const getKit = (id: string) => KITS.find((k) => k.id === id) || KITS[0];
export const getStadium = (id: string) => STADIUMS.find((s) => s.id === id) || STADIUMS[0];

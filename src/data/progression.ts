import { p, Phrase } from '../i18n/ui';

export type Kit = { id: string; name: Phrase; shirt: string; shorts: string; socks: string; number: string; unlockLevel: number };
export const KITS: Kit[] = [
  { id: 'naranja', name: p('Naranja clásica', 'Դասական նարնջագույն'), shirt: '#ff7a00', shorts: '#0b1d3a', socks: '#ff7a00', number: '#ffffff', unlockLevel: 1 },
  { id: 'azul', name: p('Azul noche', 'Գիշերային կապույտ'), shirt: '#1d3f8f', shorts: '#ffffff', socks: '#1d3f8f', number: '#ff7a00', unlockLevel: 3 },
  { id: 'verde', name: p('Verde selva', 'Ջունգլիների կանաչ'), shirt: '#0f9d58', shorts: '#0b1d3a', socks: '#ffffff', number: '#ffffff', unlockLevel: 5 },
  { id: 'blanca', name: p('Blanca de campeón', 'Չեմպիոնի սպիտակ'), shirt: '#f4f6fb', shorts: '#ff7a00', socks: '#f4f6fb', number: '#ff7a00', unlockLevel: 7 },
  { id: 'dorada', name: p('Dorada de leyenda', 'Լեգենդի ոսկեգույն'), shirt: '#e8b923', shorts: '#111111', socks: '#e8b923', number: '#111111', unlockLevel: 10 },
];

export type Stadium = {
  id: string;
  name: Phrase;
  unlockLevel: number;
  night: boolean;
  standRows: number;
  grassA: string;
  grassB: string;
  seat: string;
  sky: string;
};
export const STADIUMS: Stadium[] = [
  { id: 'barrio', name: p('Campo del barrio', 'Թաղի դաշտ'), unlockLevel: 1, night: false, standRows: 4, grassA: '#3fa34d', grassB: '#379445', seat: '#ff7a00', sky: '#8fd3ff' },
  { id: 'municipal', name: p('Estadio Municipal', 'Քաղաքային մարզադաշտ'), unlockLevel: 2, night: false, standRows: 7, grassA: '#2f9a44', grassB: '#288a3b', seat: '#1d3f8f', sky: '#a9dcff' },
  { id: 'nacional', name: p('Estadio Nacional', 'Ազգային մարզադաշտ'), unlockLevel: 4, night: true, standRows: 10, grassA: '#2c8f3f', grassB: '#247f35', seat: '#d33', sky: '#0b1d3a' },
  { id: 'final', name: p('Gran Estadio de la Final', 'Եզրափակչի Մեծ մարզադաշտ'), unlockLevel: 6, night: true, standRows: 13, grassA: '#2a9a45', grassB: '#21863a', seat: '#ff7a00', sky: '#06122a' },
];

export const PLAYER_TITLES: Phrase[] = [
  p('Novato', 'Սկսնակ'),
  p('Aprendiz', 'Աշակերտ'),
  p('Promesa', 'Խոստումնալից'),
  p('Titular', 'Հիմնական կազմի խաղացող'),
  p('Capitán', 'Ավագ'),
  p('Estrella', 'Աստղ'),
  p('Crack', 'Կրակ (գերաստղ)'),
  p('Leyenda', 'Լեգենդ'),
];

export const xpForLevel = (lvl: number) => Math.round(120 * (lvl - 1) * (lvl + 2) * 0.5);
export function levelFromXP(xp: number) {
  let l = 1;
  while (xpForLevel(l + 1) <= xp) l++;
  return l;
}
export const titleFor = (lvl: number) => PLAYER_TITLES[Math.min(PLAYER_TITLES.length - 1, Math.floor((lvl - 1) / 2))];

export type AchievementId =
  | 'firstGoal'
  | 'hatTrick'
  | 'firstWin'
  | 'fiveWins'
  | 'firstTraining'
  | 'allTrainingA1'
  | 'allTrainingB2'
  | 'phrases25'
  | 'phrases100'
  | 'talker'
  | 'listener'
  | 'firstConversation'
  | 'allConversations'
  | 'firstMission'
  | 'champion'
  | 'penaltyKing'
  | 'memoryMaster'
  | 'passMaster'
  | 'translator';

export const ACHIEVEMENTS: { id: AchievementId; icon: string; name: Phrase; desc: Phrase }[] = [
  { id: 'firstTraining', icon: '🏃', name: p('Primer entrenamiento', 'Առաջին մարզումը'), desc: p('Completa un nivel de entrenamiento', 'Ավարտի՛ր մարզման մեկ մակարդակ') },
  { id: 'firstGoal', icon: '⚽', name: p('Primer gol', 'Առաջին գոլը'), desc: p('Marca tu primer gol', 'Խփի՛ր քո առաջին գոլը') },
  { id: 'hatTrick', icon: '🎩', name: p('Triplete', 'Հեթ-տրիկ'), desc: p('Marca tres goles en un partido', 'Խփի՛ր երեք գոլ մեկ խաղում') },
  { id: 'firstWin', icon: '🏅', name: p('Primera victoria', 'Առաջին հաղթանակը'), desc: p('Gana un partido', 'Հաղթի՛ր մեկ խաղում') },
  { id: 'fiveWins', icon: '🔥', name: p('Imparable', 'Անկասելի'), desc: p('Gana cinco partidos', 'Հաղթի՛ր հինգ խաղում') },
  { id: 'passMaster', icon: '🎯', name: p('Maestro del pase', 'Փոխանցումների վարպետ'), desc: p('Completa cincuenta pases', 'Կատարի՛ր հիսուն փոխանցում') },
  { id: 'allTrainingA1', icon: '🥉', name: p('Nivel A1 superado', 'A1 մակարդակը հաղթահարված է'), desc: p('Termina todo el entrenamiento A1', 'Ավարտի՛ր A1 մարզումն ամբողջությամբ') },
  { id: 'allTrainingB2', icon: '🥇', name: p('Nivel B2 superado', 'B2 մակարդակը հաղթահարված է'), desc: p('Termina todo el entrenamiento B2', 'Ավարտի՛ր B2 մարզումն ամբողջությամբ') },
  { id: 'phrases25', icon: '📗', name: p('Veinticinco frases', 'Քսանհինգ արտահայտություն'), desc: p('Aprende veinticinco frases', 'Սովորի՛ր քսանհինգ արտահայտություն') },
  { id: 'phrases100', icon: '📚', name: p('Cien frases', 'Հարյուր արտահայտություն'), desc: p('Aprende cien frases', 'Սովորի՛ր հարյուր արտահայտություն') },
  { id: 'translator', icon: '🇦🇲', name: p('Curioso', 'Հետաքրքրասեր'), desc: p('Mira treinta traducciones', 'Նայի՛ր երեսուն թարգմանություն') },
  { id: 'talker', icon: '🎤', name: p('Buen hablador', 'Լավ խոսող'), desc: p('Di diez frases en voz alta', 'Բարձրաձայն ասա՛ տասը արտահայտություն') },
  { id: 'listener', icon: '👂', name: p('Buen oído', 'Լավ լսող'), desc: p('Acierta veinte ejercicios de escucha', 'Ճիշտ կատարի՛ր լսողական քսան վարժություն') },
  { id: 'firstConversation', icon: '💬', name: p('Primera charla', 'Առաջին զրույցը'), desc: p('Termina una conversación', 'Ավարտի՛ր մեկ զրույց') },
  { id: 'allConversations', icon: '🗣️', name: p('Gran conversador', 'Մեծ զրուցակից'), desc: p('Termina las diez conversaciones', 'Ավարտի՛ր բոլոր տասը զրույցները') },
  { id: 'firstMission', icon: '🗺️', name: p('Aventurero', 'Արկածախնդիր'), desc: p('Completa una misión', 'Ավարտի՛ր մեկ առաքելություն') },
  { id: 'penaltyKing', icon: '🥅', name: p('Rey del penalti', 'Տասնմեկ մետրանոցի արքա'), desc: p('Marca cinco penaltis seguidos', 'Անընդմեջ խփի՛ր հինգ տասնմեկ մետրանոց') },
  { id: 'memoryMaster', icon: '🧠', name: p('Memoria de elefante', 'Փղի հիշողություն'), desc: p('Gana el Memory', 'Հաղթի՛ր Memory խաղում') },
  { id: 'champion', icon: '🏆', name: p('Campeón del torneo', 'Մրցաշարի չեմպիոն'), desc: p('Gana el gran torneo', 'Հաղթի՛ր մեծ մրցաշարում') },
];

import { p, Phrase } from '../i18n/ui';
import type { Task } from './training';
import type { GameId } from './minigames';

export type Stage =
  | { type: 'training'; title: Phrase; tasks: Task[] }
  | { type: 'match'; title: Phrase; minutes: number; difficulty: number; stadium: string; needWin: boolean }
  | { type: 'conversation'; title: Phrase; scene: string }
  | { type: 'penalties' | 'freekicks'; title: Phrase; shots: number; need: number; difficulty: number }
  | { type: 'minigame'; title: Phrase; game: GameId };

export type Mission = { id: string; icon: string; name: Phrase; story: Phrase; reward: number; stages: Stage[] };

export const MISSIONS: Mission[] = [
  {
    id: 'm1',
    icon: '🏃',
    name: p('Misión 1: El primer entrenamiento', 'Առաքելություն 1․ Առաջին մարզումը'),
    story: p('Es tu primer día en el equipo. El entrenador quiere ver si entiendes sus órdenes.', 'Թիմում քո առաջին օրն է։ Մարզիչն ուզում է տեսնել՝ հասկանո՞ւմ ես նրա հրահանգները։'),
    reward: 100,
    stages: [
      { type: 'conversation', title: p('Saluda al entrenador', 'Բարևի՛ր մարզչին'), scene: 'coach-before' },
      {
        type: 'training',
        title: p('Sigue las órdenes', 'Հետևի՛ր հրահանգներին'),
        tasks: [
          { say: p('¡Razmik, corre hacia el balón!', 'Ռազմի՛կ, վազի՛ր դեպի գնդակը։'), steps: [{ k: 'touch' }] },
          { say: p('¡Corre más rápido!', 'Վազի՛ր ավելի արագ։'), steps: [{ k: 'sprint', secs: 1.5 }] },
          { say: p('¡Salta!', 'Ցատկի՛ր։'), steps: [{ k: 'jump' }] },
          { say: p('¡Pasa el balón a Lucas!', 'Փոխանցի՛ր գնդակը Լուկասին։'), steps: [{ k: 'pass', to: 9 }] },
          { say: p('¡Ahora dispara a la portería!', 'Հիմա հարվածի՛ր դարպասին։'), steps: [{ k: 'shoot' }] },
        ],
      },
    ],
  },
  {
    id: 'm2',
    icon: '🎯',
    name: p('Misión 2: El pase perfecto', 'Առաքելություն 2․ Կատարյալ փոխանցումը'),
    story: p('Escucha los números y los nombres. Cada pase tiene que llegar al jugador correcto.', 'Լսի՛ր համարներն ու անունները։ Յուրաքանչյուր փոխանցում պետք է հասնի ճիշտ խաղացողին։'),
    reward: 120,
    stages: [
      {
        type: 'training',
        title: p('Pases con números', 'Փոխանցումներ համարներով'),
        tasks: [
          { say: p('Pásale el balón al número diez.', 'Գնդակը փոխանցի՛ր տասը համարին։'), steps: [{ k: 'pass', to: 10 }] },
          { say: p('Ahora, al número cuatro.', 'Հիմա՝ չորս համարին։'), steps: [{ k: 'pass', to: 4 }] },
          { say: p('Y ahora, al número nueve.', 'Իսկ հիմա՝ ինը համարին։'), steps: [{ k: 'pass', to: 9 }] },
          { say: p('Haz una pared con Mateo: pásale y espera su pase.', 'Պատ խաղա՛ Մատեոյի հետ․ փոխանցի՛ր և սպասի՛ր նրա փոխանցմանը։'), steps: [{ k: 'pass', to: 10 }, { k: 'receive', from: 10 }] },
          { say: p('Dale el balón al defensa y luego pídeselo: di «¡Pásamela!».', 'Գնդակը տո՛ւր պաշտպանին, հետո խնդրի՛ր․ ասա՛ «Փոխանցի՛ր ինձ»։'), steps: [{ k: 'pass', to: 4 }, { k: 'say', phrase: p('¡Pásamela!', 'Փոխանցի՛ր ինձ։'), mate: 4 }, { k: 'receive', from: 4 }] },
        ],
      },
      { type: 'minigame', title: p('Escucha las órdenes', 'Լսի՛ր հրահանգները'), game: 'listen' },
    ],
  },
  {
    id: 'm3',
    icon: '⚔️',
    name: p('Misión 3: El partido decisivo', 'Առաքելություն 3․ Վճռորոշ խաղը'),
    story: p('Hoy jugamos contra los Tigres. Habla con tus compañeros y gana el partido.', 'Այսօր խաղում ենք «Վագրերի» դեմ։ Խոսի՛ր թիմակիցներիդ հետ և հաղթի՛ր խաղում։'),
    reward: 180,
    stages: [
      { type: 'conversation', title: p('En el vestuario', 'Հանդերձարանում'), scene: 'locker' },
      { type: 'match', title: p('¡Gana a los Tigres!', 'Հաղթի՛ր «Վագրերին»։'), minutes: 4, difficulty: 0.3, stadium: 'municipal', needWin: true },
      { type: 'conversation', title: p('Celebración', 'Տոնակատարություն'), scene: 'after-win' },
    ],
  },
  {
    id: 'm4',
    icon: '🎙️',
    name: p('Misión 4: La rueda de prensa', 'Առաքելություն 4․ Մամուլի ասուլիսը'),
    story: p('Después del partido, los periodistas quieren hablar con el capitán.', 'Խաղից հետո լրագրողներն ուզում են խոսել ավագի հետ։'),
    reward: 150,
    stages: [
      { type: 'match', title: p('Juega el partido', 'Խաղա՛ խաղը'), minutes: 3, difficulty: 0.35, stadium: 'municipal', needWin: false },
      { type: 'conversation', title: p('Responde a la periodista', 'Պատասխանի՛ր լրագրողին'), scene: 'journalist' },
      { type: 'minigame', title: p('Preguntas de la prensa', 'Մամուլի հարցեր'), game: 'dialog' },
    ],
  },
  {
    id: 'm5',
    icon: '🏫',
    name: p('Misión 5: La academia española', 'Առաքելություն 5․ Իսպանական ակադեմիան'),
    story: p('Una academia de España busca jugadores. Supera las pruebas para entrar.', 'Իսպանիայի ակադեմիան խաղացողներ է փնտրում։ Հաղթահարի՛ր փորձությունները՝ ընդունվելու համար։'),
    reward: 220,
    stages: [
      { type: 'penalties', title: p('Prueba de penaltis', 'Տասնմեկ մետրանոցների փորձություն'), shots: 5, need: 3, difficulty: 0.4 },
      { type: 'minigame', title: p('Prueba de vocabulario', 'Բառապաշարի փորձություն'), game: 'find3d' },
      { type: 'conversation', title: p('Entrevista con la directora', 'Հարցազրույց տնօրենի հետ'), scene: 'academy' },
    ],
  },
  {
    id: 'm6',
    icon: '🏆',
    name: p('Misión 6: El gran torneo', 'Առաքելություն 6․ Մեծ մրցաշարը'),
    story: p('Cuartos, semifinal y final. ¡Gana el torneo y levanta la copa!', 'Քառորդ եզրափակիչ, կիսաեզրափակիչ և եզրափակիչ։ Հաղթի՛ր մրցաշարում և բարձրացրո՛ւ գավաթը։'),
    reward: 400,
    stages: [
      { type: 'match', title: p('Cuartos de final', 'Քառորդ եզրափակիչ'), minutes: 3, difficulty: 0.35, stadium: 'municipal', needWin: true },
      { type: 'conversation', title: p('Viaje en autobús', 'Ճամփորդություն ավտոբուսով'), scene: 'bus' },
      { type: 'match', title: p('Semifinal', 'Կիսաեզրափակիչ'), minutes: 4, difficulty: 0.5, stadium: 'nacional', needWin: true },
      { type: 'freekicks', title: p('Entrenamiento de tiros libres', 'Տուգանային հարվածների մարզում'), shots: 5, need: 2, difficulty: 0.45 },
      { type: 'match', title: p('¡La gran final!', 'Մեծ եզրափակիչը։'), minutes: 5, difficulty: 0.65, stadium: 'final', needWin: true },
    ],
  },
  {
    id: 'm7',
    icon: '🤝',
    name: p('Misión 7: El nuevo compañero', 'Առաքելություն 7․ Նոր թիմակիցը'),
    story: p('Óscar acaba de llegar al equipo. Ayúdale a sentirse en casa.', 'Օսկարը նոր է եկել թիմ։ Օգնի՛ր նրան իրեն տանը զգալ։'),
    reward: 120,
    stages: [
      { type: 'conversation', title: p('Conoce a Óscar', 'Ծանոթացի՛ր Օսկարի հետ'), scene: 'new-player' },
      { type: 'minigame', title: p('Memory con Óscar', 'Memory Օսկարի հետ'), game: 'memory' },
      { type: 'conversation', title: p('Hablamos de entrenar', 'Խոսում ենք մարզումների մասին'), scene: 'training-talk' },
    ],
  },
  {
    id: 'm8',
    icon: '🛍️',
    name: p('Misión 8: Día de compras', 'Առաքելություն 8․ Գնումների օր'),
    story: p('Necesitas botas nuevas y entradas para tu familia.', 'Քեզ նոր խաղակոշիկներ և ընտանիքիդ համար տոմսեր են պետք։'),
    reward: 120,
    stages: [
      { type: 'conversation', title: p('En la tienda', 'Խանութում'), scene: 'shop' },
      { type: 'minigame', title: p('Ordena las frases', 'Դասավորի՛ր նախադասությունները'), game: 'order' },
      { type: 'freekicks', title: p('Estrena tus botas', 'Փորձարկի՛ր նոր խաղակոշիկներդ'), shots: 5, need: 2, difficulty: 0.3 },
    ],
  },
  {
    id: 'm9',
    icon: '💪',
    name: p('Misión 9: Levantarse tras la derrota', 'Առաքելություն 9․ Ոտքի կանգնել պարտությունից հետո'),
    story: p('Perdimos el último partido. Anima al equipo y demuestra que podéis ganar.', 'Պարտվեցինք վերջին խաղում։ Քաջալերի՛ր թիմին և ապացուցի՛ր, որ կարող եք հաղթել։'),
    reward: 200,
    stages: [
      { type: 'conversation', title: p('En el vestuario', 'Հանդերձարանում'), scene: 'after-loss' },
      { type: 'minigame', title: p('¿Qué harías?', 'Ի՞նչ կանեիր'), game: 'situations' },
      { type: 'match', title: p('El partido de la revancha', 'Ռևանշի խաղը'), minutes: 4, difficulty: 0.55, stadium: 'nacional', needWin: true },
    ],
  },
];

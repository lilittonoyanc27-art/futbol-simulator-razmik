import { p, Phrase } from '../i18n/ui';
import { BOX_DEPTH, HALF_L, HALF_W, PENALTY_DIST } from '../game/constants';
import type { Cefr } from '../store';

export type ZoneId = 'centro' | 'area' | 'bandaDer' | 'bandaIzq' | 'cornerDer' | 'cornerIzq' | 'penalti' | 'propia';
export const ZONES: Record<ZoneId, { x: number; z: number; r: number; name: Phrase }> = {
  centro: { x: 0, z: 0, r: 2.6, name: p('el círculo central', 'կենտրոնական շրջանը') },
  area: { x: HALF_L - 5, z: 0, r: 3, name: p('el área', 'տուգանային հրապարակը') },
  bandaDer: { x: -2, z: HALF_W - 2.2, r: 2.4, name: p('la banda derecha', 'աջ եզրը') },
  bandaIzq: { x: -2, z: -HALF_W + 2.2, r: 2.4, name: p('la banda izquierda', 'ձախ եզրը') },
  cornerDer: { x: HALF_L - 2.5, z: HALF_W - 2.5, r: 2.2, name: p('el córner derecho', 'աջ անկյունը') },
  cornerIzq: { x: HALF_L - 2.5, z: -HALF_W + 2.5, r: 2.2, name: p('el córner izquierdo', 'ձախ անկյունը') },
  penalti: { x: HALF_L - PENALTY_DIST, z: 0, r: 1.4, name: p('el punto de penalti', 'տասնմեկ մետրանոցի կետը') },
  propia: { x: -HALF_L + 6, z: 0, r: 3, name: p('nuestra portería', 'մեր դարպասը') },
};

export type Check =
  | { k: 'touch' }
  | { k: 'pass'; to?: number }
  | { k: 'receive'; from?: number }
  | { k: 'shoot'; minPower?: number; outsideBox?: boolean }
  | { k: 'goal' }
  | { k: 'jump' }
  | { k: 'sprint'; secs: number }
  | { k: 'zone'; zone: ZoneId; withBall?: boolean }
  | { k: 'say'; phrase: Phrase; mate: number };

export type Task = { say: Phrase; steps: Check[]; zones?: ZoneId[] };

export const PRAISE: Phrase[] = [
  p('¡Muy bien!', 'Շատ լավ է։'),
  p('¡Genial!', 'Հիանալի է։'),
  p('¡Excelente!', 'Գերազանց է։'),
  p('¡Buen trabajo!', 'Ապրե՛ս։'),
  p('¡Perfecto!', 'Կատարյալ է։'),
  p('¡Así se hace!', 'Ահա այսպես են անում։'),
  p('¡Fenomenal, Razmik!', 'Ֆենոմենալ է, Ռազմի՛կ։'),
  p('¡Eres un crack!', 'Դու իսկական աստղ ես։'),
];

export const WRONG = {
  pass: p('¡Ese no es el compañero correcto! Escucha otra vez.', 'Դա ճիշտ թիմակիցը չէ։ Նորից լսի՛ր։'),
  zone: p('No, ahí no. Escucha la orden otra vez.', 'Ոչ, այնտեղ չէ։ Նորից լսի՛ր հրահանգը։'),
  weak: p('¡Más fuerte! Mantén pulsado el botón de tiro.', 'Ավելի ուժեղ։ Պահի՛ր հարվածի կոճակը։'),
  inside: p('Tienes que disparar desde fuera del área.', 'Պետք է հարվածես տուգանային հրապարակից դուրս։'),
};

export const COACH_INTRO: Phrase = p('¡Hola, Razmik! Hoy vamos a entrenar. Escucha bien mis órdenes.', 'Բարև, Ռազմի՛կ։ Այսօր մարզվելու ենք։ Լավ լսի՛ր իմ հրահանգները։');

export const TRAINING: Record<Cefr, Task[]> = {
  A1: [
    { say: p('¡Razmik, corre hacia el balón!', 'Ռազմի՛կ, վազի՛ր դեպի գնդակը։'), steps: [{ k: 'touch' }] },
    { say: p('¡Pasa el balón a Lucas!', 'Փոխանցի՛ր գնդակը Լուկասին։'), steps: [{ k: 'pass', to: 9 }] },
    { say: p('¡Muy bien! Ahora dispara a la portería.', 'Շատ լավ է։ Հիմա հարվածի՛ր դարպասին։'), steps: [{ k: 'shoot' }] },
    { say: p('¡Salta!', 'Ցատկի՛ր։'), steps: [{ k: 'jump' }] },
    { say: p('¡Corre más rápido!', 'Վազի՛ր ավելի արագ։'), steps: [{ k: 'sprint', secs: 1.5 }] },
    { say: p('¡Pasa el balón a Mateo!', 'Փոխանցի՛ր գնդակը Մատեոյին։'), steps: [{ k: 'pass', to: 10 }] },
    { say: p('¡Ve al círculo central!', 'Գնա՛ կենտրոնական շրջան։'), steps: [{ k: 'zone', zone: 'centro' }], zones: ['centro', 'area', 'bandaDer'] },
    { say: p('¡Marca un gol!', 'Գոլ խփի՛ր։'), steps: [{ k: 'goal' }] },
  ],
  A2: [
    { say: p('Lleva el balón al círculo central.', 'Գնդակը տա՛ր կենտրոնական շրջան։'), steps: [{ k: 'zone', zone: 'centro', withBall: true }], zones: ['centro', 'bandaDer', 'bandaIzq'] },
    { say: p('Pásale el balón al número nueve.', 'Գնդակը փոխանցի՛ր ինը համարին։'), steps: [{ k: 'pass', to: 9 }] },
    { say: p('Corre hacia la banda derecha.', 'Վազի՛ր դեպի աջ եզրը։'), steps: [{ k: 'zone', zone: 'bandaDer' }], zones: ['bandaDer', 'bandaIzq', 'centro'] },
    { say: p('Grita «¡Estoy libre!» para pedir el balón a Mateo.', 'Գոռա՛ «Ես ազատ եմ», որպեսզի գնդակը խնդրես Մատեոյից։'), steps: [{ k: 'say', phrase: p('¡Estoy libre!', 'Ես ազատ եմ։'), mate: 10 }, { k: 'receive', from: 10 }] },
    { say: p('Ve a la banda izquierda con el balón.', 'Գնդակով գնա՛ ձախ եզր։'), steps: [{ k: 'zone', zone: 'bandaIzq', withBall: true }], zones: ['bandaDer', 'bandaIzq', 'centro'] },
    { say: p('Dale un pase a Diego, el defensa.', 'Փոխանցո՛ւմ տուր Դիեգոյին՝ պաշտպանին։'), steps: [{ k: 'pass', to: 4 }] },
    { say: p('Ve al punto de penalti y dispara.', 'Գնա՛ տասնմեկ մետրանոցի կետ և հարվածի՛ր։'), steps: [{ k: 'zone', zone: 'penalti', withBall: true }, { k: 'shoot' }], zones: ['penalti', 'cornerDer', 'centro'] },
    { say: p('Salta dos veces.', 'Ցատկի՛ր երկու անգամ։'), steps: [{ k: 'jump' }, { k: 'jump' }] },
    { say: p('Marca un gol desde el área.', 'Գոլ խփի՛ր տուգանային հրապարակից։'), steps: [{ k: 'zone', zone: 'area', withBall: true }, { k: 'goal' }], zones: ['area', 'centro', 'cornerIzq'] },
  ],
  B1: [
    { say: p('Primero pásale el balón a Mateo y después corre hacia el área.', 'Սկզբում գնդակը փոխանցի՛ր Մատեոյին, հետո վազի՛ր դեպի տուգանային հրապարակ։'), steps: [{ k: 'pass', to: 10 }, { k: 'zone', zone: 'area' }], zones: ['area', 'centro', 'propia'] },
    { say: p('Pásale el balón a Lucas; cuando te lo devuelva, dispara a la portería.', 'Գնդակը փոխանցի՛ր Լուկասին․ երբ նա վերադարձնի, հարվածի՛ր դարպասին։'), steps: [{ k: 'pass', to: 9 }, { k: 'receive', from: 9 }, { k: 'shoot' }] },
    { say: p('Tienes que llevar el balón hasta el córner derecho sin perderlo.', 'Պետք է գնդակը տանես մինչև աջ անկյուն՝ առանց կորցնելու։'), steps: [{ k: 'zone', zone: 'cornerDer', withBall: true }], zones: ['cornerDer', 'cornerIzq', 'penalti'] },
    { say: p('Antes de disparar, ve al punto de penalti.', 'Հարվածելուց առաջ գնա՛ տասնմեկ մետրանոցի կետ։'), steps: [{ k: 'zone', zone: 'penalti', withBall: true }, { k: 'shoot' }], zones: ['penalti', 'area', 'centro'] },
    { say: p('Corre rápido hacia la banda izquierda y luego salta.', 'Արագ վազի՛ր դեպի ձախ եզրը, հետո ցատկի՛ր։'), steps: [{ k: 'sprint', secs: 1 }, { k: 'zone', zone: 'bandaIzq' }, { k: 'jump' }], zones: ['bandaIzq', 'bandaDer', 'centro'] },
    { say: p('Dale un pase al jugador que está más lejos de la portería rival.', 'Փոխանցո՛ւմ տուր այն խաղացողին, ով ամենահեռուն է մրցակցի դարպասից։'), steps: [{ k: 'pass', to: 4 }] },
    { say: p('Pídele el balón a Lucas: di «¡Pásamela!».', 'Գնդակը խնդրի՛ր Լուկասից․ ասա՛ «Փոխանցի՛ր ինձ»։'), steps: [{ k: 'say', phrase: p('¡Pásamela!', 'Փոխանցի՛ր ինձ։'), mate: 9 }, { k: 'receive', from: 9 }] },
    { say: p('Lleva el balón al círculo central y luego pásaselo a Diego.', 'Գնդակը տա՛ր կենտրոնական շրջան, հետո փոխանցի՛ր Դիեգոյին։'), steps: [{ k: 'zone', zone: 'centro', withBall: true }, { k: 'pass', to: 4 }], zones: ['centro', 'bandaDer', 'area'] },
    { say: p('Has entrenado muy bien. Ahora marca un gol para terminar.', 'Դու շատ լավ ես մարզվել։ Հիմա գոլ խփի՛ր՝ ավարտելու համար։'), steps: [{ k: 'goal' }] },
  ],
  B2: [
    { say: p('Si quieres marcar, tendrás que llevar el balón hasta el área y disparar con fuerza.', 'Եթե ուզում ես գոլ խփել, պետք է գնդակը տանես տուգանային հրապարակ և ուժեղ հարվածես։'), steps: [{ k: 'zone', zone: 'area', withBall: true }, { k: 'shoot', minPower: 0.6 }], zones: ['area', 'centro', 'cornerDer'] },
    { say: p('Pásale el balón al compañero que lleva el número más alto.', 'Գնդակը փոխանցի՛ր այն թիմակցին, ով ամենամեծ համարն ունի։'), steps: [{ k: 'pass', to: 10 }] },
    { say: p('Ahora busca al compañero que está más cerca de la banda derecha y dale un pase.', 'Հիմա գտի՛ր աջ եզրին ամենամոտ թիմակցին և փոխանցո՛ւմ տուր նրան։'), steps: [{ k: 'pass', to: 9 }] },
    { say: p('Me gustaría que hicieras una pared con Mateo y que luego marcaras un gol.', 'Կցանկանայի, որ Մատեոյի հետ «պատ» խաղայիր, իսկ հետո գոլ խփեիր։'), steps: [{ k: 'pass', to: 10 }, { k: 'receive', from: 10 }, { k: 'goal' }] },
    { say: p('No dispares todavía: primero lleva el balón al córner izquierdo y después pásaselo a Lucas.', 'Դեռ մի՛ հարվածիր․ սկզբում գնդակը տա՛ր ձախ անկյուն, հետո փոխանցի՛ր Լուկասին։'), steps: [{ k: 'zone', zone: 'cornerIzq', withBall: true }, { k: 'pass', to: 9 }], zones: ['cornerIzq', 'cornerDer', 'centro'] },
    { say: p('Antes de que termine el entrenamiento, corre hacia nuestra portería y vuelve al círculo central.', 'Մինչև մարզման ավարտը վազի՛ր դեպի մեր դարպասը և վերադարձի՛ր կենտրոնական շրջան։'), steps: [{ k: 'zone', zone: 'propia' }, { k: 'zone', zone: 'centro' }], zones: ['propia', 'centro', 'area'] },
    { say: p('Habrías marcado si hubieras disparado de lejos. Inténtalo: dispara desde fuera del área.', 'Գոլ կխփեիր, եթե հեռվից հարվածեիր։ Փորձի՛ր․ հարվածի՛ր տուգանային հրապարակից դուրս։'), steps: [{ k: 'shoot', outsideBox: true }] },
    { say: p('Después de correr hacia la banda derecha, pídele el balón a Mateo diciendo «¡Estoy solo, pásamela!».', 'Աջ եզր վազելուց հետո գնդակը խնդրի՛ր Մատեոյից՝ ասելով «Ես մենակ եմ, փոխանցի՛ր ինձ»։'), steps: [{ k: 'zone', zone: 'bandaDer' }, { k: 'say', phrase: p('¡Estoy solo, pásamela!', 'Ես մենակ եմ, փոխանցի՛ր ինձ։'), mate: 10 }, { k: 'receive', from: 10 }], zones: ['bandaDer', 'bandaIzq', 'centro'] },
    { say: p('Quien marque ahora será el capitán del próximo partido. ¡A por el gol!', 'Ով հիմա գոլ խփի, կլինի հաջորդ խաղի ավագը։ Առա՛ջ՝ դեպի գոլ։'), steps: [{ k: 'goal' }] },
  ],
};

export const outsideBox = (x: number) => x < HALF_L - BOX_DEPTH;

import { p, Phrase } from '../i18n/ui';
import type { Cefr } from '../store';

export type Exercise = { q: Phrase; options: string[]; answer: number };
export type GrammarTopic = {
  id: string;
  cefr: Cefr;
  name: Phrase;
  explain: Phrase;
  forms: Phrase[];
  examples: Phrase[];
  exercises: Exercise[];
};

export const GRAMMAR: GrammarTopic[] = [
  {
    id: 'presente',
    cefr: 'A1',
    name: p('Presente', 'Ներկա ժամանակ'),
    explain: p('Usamos el presente para hablar de lo que hacemos ahora o siempre.', 'Ներկան օգտագործում ենք խոսելու համար այն մասին, ինչ անում ենք հիմա կամ միշտ։'),
    forms: [p('yo juego', 'ես խաղում եմ'), p('tú juegas', 'դու խաղում ես'), p('él juega', 'նա խաղում է'), p('nosotros jugamos', 'մենք խաղում ենք'), p('ellos juegan', 'նրանք խաղում են')],
    examples: [p('Razmik juega en el centro del campo.', 'Ռազմիկը խաղում է դաշտի կենտրոնում։'), p('Nosotros entrenamos los lunes.', 'Մենք մարզվում ենք երկուշաբթի օրերին։')],
    exercises: [
      { q: p('Yo ___ al fútbol todos los días.', 'Ես ամեն օր ֆուտբոլ եմ ___։'), options: ['juego', 'juegas', 'jugamos'], answer: 0 },
      { q: p('Lucas ___ muy rápido.', 'Լուկասը շատ արագ է ___։'), options: ['corro', 'corre', 'corren'], answer: 1 },
      { q: p('Nosotros ___ el partido.', 'Մենք ___ խաղը։'), options: ['ganamos', 'gana', 'ganan'], answer: 0 },
    ],
  },
  {
    id: 'imperativo',
    cefr: 'A1',
    name: p('Imperativo', 'Հրամայական եղանակ'),
    explain: p('El imperativo sirve para dar órdenes. El entrenador lo usa mucho: ¡corre!, ¡pasa!, ¡dispara!', 'Հրամայականը ծառայում է հրահանգներ տալու համար։ Մարզիչը շատ է այն օգտագործում․ վազի՛ր, փոխանցի՛ր, հարվածի՛ր։'),
    forms: [p('correr → ¡corre!', 'վազել → վազի՛ր'), p('pasar → ¡pasa!', 'փոխանցել → փոխանցի՛ր'), p('disparar → ¡dispara!', 'հարվածել → հարվածի՛ր'), p('ir → ¡ve!', 'գնալ → գնա՛'), p('no perder → ¡no pierdas!', 'չկորցնել → մի՛ կորցրու')],
    examples: [p('¡Pasa el balón a Mateo!', 'Գնդակը փոխանցի՛ր Մատեոյին։'), p('¡No pierdas el balón!', 'Գնդակը մի՛ կորցրու։')],
    exercises: [
      { q: p('¡___ a la portería! (disparar)', '___ դարպասին։ (հարվածել)'), options: ['Dispara', 'Disparo', 'Disparamos'], answer: 0 },
      { q: p('¡___ más rápido! (correr)', '___ ավելի արագ։ (վազել)'), options: ['Corro', 'Corre', 'Corremos'], answer: 1 },
      { q: p('¡No ___ el balón! (perder)', 'Գնդակը մի՛ ___։ (կորցնել)'), options: ['pierdes', 'pierdas', 'pierde'], answer: 1 },
    ],
  },
  {
    id: 'tenerQue',
    cefr: 'A2',
    name: p('Tener que + infinitivo', 'Tener que + անորոշ դերբայ (պետք է)'),
    explain: p('«Tener que» expresa obligación: lo que es necesario hacer.', '«Tener que»-ն արտահայտում է պարտականություն՝ այն, ինչ անհրաժեշտ է անել։'),
    forms: [p('tengo que entrenar', 'պետք է մարզվեմ'), p('tienes que pasar', 'պետք է փոխանցես'), p('tenemos que defender', 'պետք է պաշտպանվենք')],
    examples: [p('Tienes que llevar el balón hasta el córner.', 'Պետք է գնդակը տանես մինչև անկյուն։'), p('Tenemos que ganar este partido.', 'Պետք է հաղթենք այս խաղում։')],
    exercises: [
      { q: p('Nosotros ___ que defender mejor.', 'Մենք ___ ավելի լավ պաշտպանվենք։'), options: ['tenemos', 'tengo', 'tiene'], answer: 0 },
      { q: p('Tú tienes que ___ el balón.', 'Դու պետք է ___ գնդակը։'), options: ['pasas', 'pasar', 'pasado'], answer: 1 },
    ],
  },
  {
    id: 'querer',
    cefr: 'A2',
    name: p('Querer y poder', 'Querer (ուզել) և poder (կարողանալ)'),
    explain: p('«Querer» es desear algo. «Poder» es tener la capacidad o el permiso. Después va un infinitivo.', '«Querer»՝ ինչ-որ բան ցանկանալ։ «Poder»՝ կարողություն կամ թույլտվություն ունենալ։ Հետո գալիս է անորոշ դերբայ։'),
    forms: [p('quiero jugar', 'ուզում եմ խաղալ'), p('quieres ganar', 'ուզում ես հաղթել'), p('puedo correr', 'կարող եմ վազել'), p('podemos marcar', 'կարող ենք գոլ խփել')],
    examples: [p('Quiero ser futbolista profesional.', 'Ուզում եմ դառնալ պրոֆեսիոնալ ֆուտբոլիստ։'), p('¿Puedes venir por las tardes?', 'Կարո՞ղ ես գալ կեսօրից հետո։')],
    exercises: [
      { q: p('Yo ___ jugar en la academia.', 'Ես ___ խաղալ ակադեմիայում։'), options: ['quiero', 'quieres', 'quiere'], answer: 0 },
      { q: p('¿___ pasarme el balón? (tú)', '___ գնդակը փոխանցել ինձ։ (դու)'), options: ['Puedo', 'Puedes', 'Podemos'], answer: 1 },
    ],
  },
  {
    id: 'irA',
    cefr: 'A2',
    name: p('Ir a + infinitivo', 'Ir a + անորոշ դերբայ (պատրաստվել անելու)'),
    explain: p('«Ir a + infinitivo» habla de planes y del futuro cercano.', '«Ir a + անորոշ դերբայը» խոսում է ծրագրերի և մոտ ապագայի մասին։'),
    forms: [p('voy a disparar', 'հարվածելու եմ'), p('vas a marcar', 'գոլ ես խփելու'), p('vamos a ganar', 'հաղթելու ենք')],
    examples: [p('Hoy vamos a entrenar.', 'Այսօր մարզվելու ենք։'), p('Voy a hablar con mis compañeros.', 'Խոսելու եմ թիմակիցներիս հետ։')],
    exercises: [
      { q: p('Mañana ___ a jugar la final. (nosotros)', 'Վաղը ___ եզրափակիչում խաղալու։ (մենք)'), options: ['vamos', 'voy', 'van'], answer: 0 },
      { q: p('Razmik va a ___ el penalti.', 'Ռազմիկը ___ է տասնմեկ մետրանոցը։'), options: ['tirar', 'tira', 'tiró'], answer: 0 },
    ],
  },
  {
    id: 'perfecto',
    cefr: 'A2',
    name: p('Pretérito perfecto', 'Անցյալ կատարյալ (haber + -ado/-ido)'),
    explain: p('Se usa para acciones terminadas en un tiempo que todavía no ha acabado: hoy, esta semana… Se forma con haber + participio.', 'Օգտագործվում է ավարտված գործողությունների համար այն ժամանակահատվածում, որը դեռ չի ավարտվել․ այսօր, այս շաբաթ… Կազմվում է haber + դերբայ։'),
    forms: [p('he marcado', 'գոլ եմ խփել'), p('has jugado', 'խաղացել ես'), p('ha parado', 'բռնել է'), p('hemos ganado', 'հաղթել ենք')],
    examples: [p('¡Hemos ganado tres a uno!', 'Մենք հաղթել ենք երեքը մեկ հաշվով։'), p('Razmik, has marcado un golazo.', 'Ռազմի՛կ, դու հիասքանչ գոլ ես խփել։')],
    exercises: [
      { q: p('Hoy nosotros ___ ganado.', 'Այսօր մենք ___ հաղթել։'), options: ['hemos', 'han', 'he'], answer: 0 },
      { q: p('El portero ha ___ el balón. (parar)', 'Դարպասապահը ___ է գնդակը։ (բռնել)'), options: ['parado', 'para', 'paró'], answer: 0 },
    ],
  },
  {
    id: 'indefinido',
    cefr: 'B1',
    name: p('Pretérito indefinido', 'Անցյալ ժամանակ (indefinido)'),
    explain: p('Para acciones terminadas en el pasado: ayer, la semana pasada, en 2020…', 'Անցյալում ավարտված գործողությունների համար․ երեկ, անցյալ շաբաթ, 2020-ին…'),
    forms: [p('jugué', 'խաղացի'), p('marcaste', 'խփեցիր'), p('ganó', 'հաղթեց'), p('perdimos', 'պարտվեցինք'), p('fallé', 'վրիպեցի')],
    examples: [p('Ayer perdimos dos a cero.', 'Երեկ պարտվեցինք երկու-զրո։'), p('Mateo me pasó el balón y disparé.', 'Մատեոն ինձ փոխանցեց գնդակը, և ես հարվածեցի։')],
    exercises: [
      { q: p('Ayer yo ___ un gol. (marcar)', 'Երեկ ես գոլ ___։ (խփել)'), options: ['marqué', 'marco', 'marcaré'], answer: 0 },
      { q: p('La semana pasada nosotros ___. (perder)', 'Անցյալ շաբաթ մենք ___։ (պարտվել)'), options: ['perdemos', 'perdimos', 'perderemos'], answer: 1 },
    ],
  },
  {
    id: 'imperfecto',
    cefr: 'B1',
    name: p('Pretérito imperfecto', 'Անցյալ անկատար (imperfecto)'),
    explain: p('Describe costumbres y situaciones del pasado: cuando era pequeño, jugaba en la calle.', 'Նկարագրում է անցյալի սովորություններ և իրավիճակներ․ երբ փոքր էի, խաղում էի փողոցում։'),
    forms: [p('era', 'էի / էր'), p('jugaba', 'խաղում էի'), p('tenía', 'ունեի'), p('estábamos', 'գտնվում էինք')],
    examples: [p('Cuando era pequeño, jugaba en el parque.', 'Երբ փոքր էի, խաղում էի այգում։'), p('Íbamos perdiendo, pero no nos rendíamos.', 'Պարտվում էինք, բայց չէինք հանձնվում։')],
    exercises: [
      { q: p('Cuando ___ pequeño, jugaba en la calle.', 'Երբ ___ փոքր, խաղում էի փողոցում։'), options: ['era', 'soy', 'seré'], answer: 0 },
      { q: p('Antes nosotros ___ los sábados. (entrenar)', 'Առաջ մենք շաբաթ օրերին ___։ (մարզվել)'), options: ['entrenábamos', 'entrenamos', 'entrenaremos'], answer: 0 },
    ],
  },
  {
    id: 'futuro',
    cefr: 'B1',
    name: p('Futuro simple', 'Ապառնի ժամանակ'),
    explain: p('Para hablar del futuro y hacer predicciones: mañana jugaremos la final.', 'Ապագայի մասին խոսելու և կանխատեսումներ անելու համար․ վաղը կխաղանք եզրափակիչում։'),
    forms: [p('jugaré', 'կխաղամ'), p('marcarás', 'կխփես'), p('será', 'կլինի'), p('ganaremos', 'կհաղթենք')],
    examples: [p('Si ganamos mañana, jugaremos la final.', 'Եթե վաղը հաղթենք, կխաղանք եզրափակիչում։'), p('Será un partido difícil.', 'Դժվար խաղ կլինի։')],
    exercises: [
      { q: p('Mañana nosotros ___ la final. (jugar)', 'Վաղը մենք ___ եզրափակիչում։ (խաղալ)'), options: ['jugaremos', 'jugamos', 'jugábamos'], answer: 0 },
      { q: p('El partido ___ muy difícil. (ser)', 'Խաղը շատ դժվար ___։ (լինել)'), options: ['era', 'será', 'es'], answer: 1 },
    ],
  },
  {
    id: 'condicional',
    cefr: 'B2',
    name: p('Condicional y subjuntivo', 'Ըղձական և ստորադասական եղանակներ'),
    explain: p('Con «si + imperfecto de subjuntivo» imaginamos situaciones: si hubieras disparado, habrías marcado. Con «me gustaría que + subjuntivo» pedimos algo con cortesía.', '«Si + ստորադասականի անկատար» կառույցով պատկերացնում ենք իրավիճակներ․ եթե հարվածեիր, գոլ կխփեիր։ «Me gustaría que + ստորադասական»-ով քաղաքավարի ինչ-որ բան ենք խնդրում։'),
    forms: [p('me gustaría que hicieras', 'կցանկանայի, որ անեիր'), p('si tuviera tiempo, entrenaría', 'եթե ժամանակ ունենայի, կմարզվեի'), p('habrías marcado', 'գոլ կխփեիր'), p('no dispares', 'մի՛ հարվածիր')],
    examples: [p('Me gustaría que hicieras una pared con Mateo.', 'Կցանկանայի, որ Մատեոյի հետ պատ խաղայիր։'), p('Si quieres marcar, tendrás que disparar con fuerza.', 'Եթե ուզում ես գոլ խփել, պետք է ուժեղ հարվածես։')],
    exercises: [
      { q: p('Si ___ más fuerte, habrías marcado.', 'Եթե ավելի ուժեղ ___, գոլ կխփեիր։'), options: ['hubieras disparado', 'disparas', 'dispararás'], answer: 0 },
      { q: p('Me gustaría que tú ___ conmigo. (entrenar)', 'Կցանկանայի, որ դու ինձ հետ ___։ (մարզվել)'), options: ['entrenaras', 'entrenas', 'entrenarás'], answer: 0 },
      { q: p('¡No ___ todavía! (disparar)', 'Դեռ մի՛ ___։ (հարվածել)'), options: ['disparas', 'dispares', 'disparar'], answer: 1 },
    ],
  },
];

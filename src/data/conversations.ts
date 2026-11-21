import { p, Phrase } from '../i18n/ui';
import type { Cefr } from '../store';

export type Opt = { t: Phrase; ok: boolean; why?: Phrase };
export type Node = { npc: Phrase; who?: 0 | 1 } | { choose: Opt[] };
export type Place = 'field' | 'locker' | 'bus' | 'press' | 'shop' | 'academy';
export type NpcLook = { name: string; shirt: string; shorts: string; skin: string; hair: string; coach?: boolean; role: Phrase };
export type Scene = { id: string; icon: string; title: Phrase; place: Place; cefr: Cefr; grammar: Phrase; npcs: NpcLook[]; nodes: Node[] };

const COACH: NpcLook = { name: 'Entrenador Pablo', shirt: '#0b1d3a', shorts: '#0b1d3a', skin: '#d9a47e', hair: '#555', coach: true, role: p('Entrenador', 'Մարզիչ') };
const LUCAS: NpcLook = { name: 'Lucas', shirt: '#ff7a00', shorts: '#0b1d3a', skin: '#c68c5f', hair: '#5a3a1a', role: p('Compañero, número nueve', 'Թիմակից, ինը համար') };
const MATEO: NpcLook = { name: 'Mateo', shirt: '#ff7a00', shorts: '#0b1d3a', skin: '#f0c8a0', hair: '#d9b56a', role: p('Compañero, número diez', 'Թիմակից, տասը համար') };
const NEW: NpcLook = { name: 'Óscar', shirt: '#ff7a00', shorts: '#0b1d3a', skin: '#8d5a3b', hair: '#111', role: p('Jugador nuevo', 'Նոր խաղացող') };
const JOURNALIST: NpcLook = { name: 'Laura', shirt: '#d63031', shorts: '#222', skin: '#f0c8a0', hair: '#704214', coach: true, role: p('Periodista', 'Լրագրող') };
const DIRECTOR: NpcLook = { name: 'Señora Ruiz', shirt: '#1d3f8f', shorts: '#1d3f8f', skin: '#e0ac85', hair: '#2b1a10', coach: true, role: p('Directora de la academia', 'Ակադեմիայի տնօրեն') };
const SELLER: NpcLook = { name: 'Andrés', shirt: '#0f9d58', shorts: '#222', skin: '#c68c5f', hair: '#2b1a10', coach: true, role: p('Vendedor', 'Վաճառող') };

const huh = p('Hmm… eso no tiene mucho sentido aquí. Piensa otra vez.', 'Հմմ… դա այստեղ իմաստ չունի։ Նորից մտածի՛ր։');

export const SCENES: Scene[] = [
  {
    id: 'coach-before',
    icon: '👨‍🏫',
    title: p('Con el entrenador antes del partido', 'Մարզչի հետ խաղից առաջ'),
    place: 'field',
    cefr: 'A1',
    grammar: p('Presente: estoy, tengo, juego', 'Ներկա ժամանակ․ estoy, tengo, juego'),
    npcs: [COACH],
    nodes: [
      { npc: p('¡Hola, Razmik! ¿Cómo estás hoy?', 'Բարև, Ռազմի՛կ։ Ինչպե՞ս ես այսօր։') },
      { choose: [
        { t: p('¡Hola, entrenador! Estoy muy bien, gracias.', 'Բարև, մարզի՛չ։ Շատ լավ եմ, շնորհակալություն։'), ok: true },
        { t: p('Tengo doce años.', 'Ես տասներկու տարեկան եմ։'), ok: false, why: p('Te pregunto cómo estás, no cuántos años tienes.', 'Ես հարցնում եմ՝ ինչպես ես, ոչ թե քանի տարեկան ես։') },
        { t: p('Me gusta la pizza.', 'Ես սիրում եմ պիցցա։'), ok: false, why: huh },
      ] },
      { npc: p('¡Me alegro! Hoy jugamos contra los Tigres. ¿Estás listo para jugar?', 'Ուրախ եմ։ Այսօր խաղում ենք «Վագրերի» դեմ։ Պատրա՞ստ ես խաղալու։') },
      { choose: [
        { t: p('¡Sí, estoy listo! Tengo muchas ganas.', 'Այո, պատրաստ եմ։ Շատ եմ ուզում։'), ok: true },
        { t: p('No, estoy en el autobús.', 'Ոչ, ես ավտոբուսում եմ։'), ok: false, why: p('Estamos en el campo, no en el autobús.', 'Մենք դաշտում ենք, ոչ թե ավտոբուսում։') },
        { t: p('Sí, quiero dormir.', 'Այո, ուզում եմ քնել։'), ok: false, why: huh },
      ] },
      { npc: p('Muy bien. Tú eres el capitán. Juegas en el centro del campo, con el número siete.', 'Շատ լավ։ Դու ավագն ես։ Խաղում ես դաշտի կենտրոնում՝ յոթ համարով։') },
      { npc: p('¿Qué tienes que hacer cuando un compañero está libre?', 'Ի՞նչ պետք է անես, երբ թիմակիցը ազատ է։') },
      { choose: [
        { t: p('Tengo que pasarle el balón.', 'Պետք է գնդակը փոխանցեմ նրան։'), ok: true },
        { t: p('Tengo que salir del campo.', 'Պետք է դուրս գամ դաշտից։'), ok: false, why: p('¡No! Si un compañero está libre, le pasas el balón.', 'Ոչ։ Եթե թիմակիցն ազատ է, գնդակը փոխանցում ես նրան։') },
        { t: p('Tengo que comer.', 'Պետք է ուտեմ։'), ok: false, why: huh },
      ] },
      { npc: p('¡Exacto! Y si estás cerca de la portería, ¿qué haces?', 'Ճիշտ է։ Իսկ եթե դարպասին մոտ ես, ի՞նչ ես անում։') },
      { choose: [
        { t: p('¡Disparo a la portería!', 'Հարվածում եմ դարպասին։'), ok: true },
        { t: p('Corro hacia mi casa.', 'Վազում եմ դեպի տուն։'), ok: false, why: huh },
        { t: p('Me siento en el banquillo.', 'Նստում եմ պահեստայինների նստարանին։'), ok: false, why: p('Cerca de la portería tienes que disparar.', 'Դարպասի մոտ պետք է հարվածես։') },
      ] },
      { npc: p('¡Perfecto, capitán! ¡Vamos a ganar!', 'Կատարյալ է, ավա՛գ։ Հաղթելու ենք։') },
    ],
  },
  {
    id: 'locker',
    icon: '👕',
    title: p('En el vestuario con los compañeros', 'Հանդերձարանում թիմակիցների հետ'),
    place: 'locker',
    cefr: 'A1',
    grammar: p('Tener / necesitar + objeto', 'Tener / necesitar + առարկա'),
    npcs: [LUCAS, MATEO],
    nodes: [
      { npc: p('¡Eh, Razmik! ¿Dónde están tus botas?', 'Է՜յ, Ռազմի՛կ։ Որտե՞ղ են քո խաղակոշիկները։'), who: 0 },
      { choose: [
        { t: p('Están en mi mochila.', 'Իմ ուսապարկում են։'), ok: true },
        { t: p('Son las cinco de la tarde.', 'Երեկոյան ժամը հինգն է։'), ok: false, why: p('Te preguntan dónde están tus botas, no la hora.', 'Քեզ հարցնում են՝ որտեղ են խաղակոշիկներդ, ոչ թե ժամը։') },
        { t: p('Mis botas son de Lucas.', 'Իմ խաղակոշիկները Լուկասինն են։'), ok: false, why: huh },
      ] },
      { npc: p('Yo no tengo agua. ¿Tienes una botella de agua?', 'Ես ջուր չունեմ։ Դու ջրի շիշ ունե՞ս։'), who: 1 },
      { choose: [
        { t: p('Sí, tengo dos. Toma una.', 'Այո, երկու հատ ունեմ։ Վերցրո՛ւ մեկը։'), ok: true },
        { t: p('Sí, tengo un perro.', 'Այո, ես շուն ունեմ։'), ok: false, why: huh },
        { t: p('No me gusta el fútbol.', 'Ես ֆուտբոլ չեմ սիրում։'), ok: false, why: p('¿De verdad? ¡Eres el capitán! Te preguntan por el agua.', 'Իսկապե՞ս։ Դու ավագն ես։ Քեզ ջրի մասին են հարցնում։') },
      ] },
      { npc: p('¡Gracias! Oye, ¿de qué color es nuestra camiseta hoy?', 'Շնորհակալություն։ Լսի՛ր, այսօր ի՞նչ գույնի է մեր մարզաշապիկը։'), who: 1 },
      { choose: [
        { t: p('Es naranja, como siempre.', 'Նարնջագույն է, ինչպես միշտ։'), ok: true },
        { t: p('Es muy rápida.', 'Շատ արագ է։'), ok: false, why: huh },
        { t: p('Es el número siete.', 'Յոթ համարն է։'), ok: false, why: p('Te preguntan el color, no el número.', 'Քեզ գույնն են հարցնում, ոչ թե համարը։') },
      ] },
      { npc: p('Estoy un poco nervioso. Los Tigres son muy fuertes.', 'Ես մի քիչ անհանգիստ եմ։ «Վագրերը» շատ ուժեղ են։'), who: 0 },
      { choose: [
        { t: p('Tranquilo, Lucas. Somos un equipo y jugamos juntos.', 'Հանգի՛ստ, Լուկաս։ Մենք թիմ ենք և խաղում ենք միասին։'), ok: true },
        { t: p('Sí, vamos a perder.', 'Այո, պարտվելու ենք։'), ok: false, why: p('Un capitán anima a sus compañeros. Di algo positivo.', 'Ավագը քաջալերում է թիմակիցներին։ Մի դրական բան ասա՛։') },
        { t: p('Los tigres viven en la selva.', 'Վագրերն ապրում են ջունգլիներում։'), ok: false, why: huh },
      ] },
      { npc: p('¡Tienes razón! ¡Vamos, equipo!', 'Դու ճիշտ ես։ Առա՛ջ, թիմ։'), who: 0 },
    ],
  },
  {
    id: 'after-win',
    icon: '🏆',
    title: p('Después de la victoria', 'Հաղթանակից հետո'),
    place: 'field',
    cefr: 'A2',
    grammar: p('Pretérito perfecto: hemos ganado, has marcado', 'Անցյալ կատարյալ․ hemos ganado, has marcado'),
    npcs: [COACH, MATEO],
    nodes: [
      { npc: p('¡Hemos ganado tres a uno! ¡Qué partido, chicos!', 'Մենք հաղթեցինք երեքը մեկ հաշվով։ Ինչ խաղ էր, տղանե՛ր։'), who: 0 },
      { npc: p('Razmik, has marcado un golazo. ¿Cómo te sientes?', 'Ռազմի՛կ, դու հիասքանչ գոլ խփեցիր։ Ինչպե՞ս ես քեզ զգում։'), who: 0 },
      { choose: [
        { t: p('¡Me siento muy feliz! Ha sido un día increíble.', 'Ինձ շատ երջանիկ եմ զգում։ Անհավանական օր էր։'), ok: true },
        { t: p('Me siento triste porque hemos perdido.', 'Տխուր եմ, որովհետև պարտվել ենք։'), ok: false, why: p('¡Pero si hemos ganado!', 'Բայց մենք հաղթել ենք։') },
        { t: p('He comido una manzana.', 'Ես խնձոր եմ կերել։'), ok: false, why: huh },
      ] },
      { npc: p('Mateo, tú también has jugado muy bien. Has dado dos pases de gol.', 'Մատեո, դու էլ շատ լավ ես խաղացել։ Երկու գոլային փոխանցում ես տվել։'), who: 0 },
      { npc: p('¡Gracias, entrenador! Razmik, ¿has visto mi pase en el primer gol?', 'Շնորհակալություն, մարզի՛չ։ Ռազմի՛կ, տեսե՞լ ես իմ փոխանցումը առաջին գոլի ժամանակ։'), who: 1 },
      { choose: [
        { t: p('¡Sí! Ha sido un pase perfecto. ¡Gracias, Mateo!', 'Այո։ Կատարյալ փոխանցում էր։ Շնորհակալություն, Մատեո։'), ok: true },
        { t: p('No, he estado en casa.', 'Ոչ, ես տանն եմ եղել։'), ok: false, why: p('Has jugado el partido, ¡claro que lo has visto!', 'Դու խաղացել ես, իհարկե տեսել ես։') },
        { t: p('Sí, he visto una película.', 'Այո, ես ֆիլմ եմ դիտել։'), ok: false, why: huh },
      ] },
      { npc: p('¿Qué ha sido lo más difícil del partido?', 'Ի՞նչն էր խաղում ամենադժվարը։'), who: 0 },
      { choose: [
        { t: p('Lo más difícil ha sido defender al delantero rival.', 'Ամենադժվարը մրցակից հարձակվողի դեմ պաշտպանվելն էր։'), ok: true },
        { t: p('Lo más difícil ha sido el desayuno.', 'Ամենադժվարը նախաճաշն էր։'), ok: false, why: huh },
        { t: p('He marcado tres goles en la piscina.', 'Ես երեք գոլ եմ խփել լողավազանում։'), ok: false, why: huh },
      ] },
      { npc: p('Muy bien dicho. Hoy habéis trabajado como un verdadero equipo. ¡Estoy orgulloso!', 'Շատ լավ ասացիր։ Այսօր դուք աշխատեցիք որպես իսկական թիմ։ Հպարտ եմ։'), who: 0 },
    ],
  },
  {
    id: 'after-loss',
    icon: '😔',
    title: p('Después de la derrota', 'Պարտությունից հետո'),
    place: 'locker',
    cefr: 'A2',
    grammar: p('Indefinido: perdimos, jugamos, fallé', 'Անցյալ կատարյալ (indefinido)․ perdimos, jugamos, fallé'),
    npcs: [COACH, LUCAS],
    nodes: [
      { npc: p('Ayer perdimos dos a cero. Lucas está muy triste.', 'Երեկ պարտվեցինք երկու-զրո։ Լուկասը շատ տխուր է։'), who: 0 },
      { npc: p('Fallé un penalti… Fue mi culpa.', 'Ես վրիպեցի տասնմեկ մետրանոցը… Իմ մեղքն էր։'), who: 1 },
      { choose: [
        { t: p('No fue tu culpa, Lucas. Todos jugamos mal ayer.', 'Քո մեղքը չէր, Լուկաս։ Երեկ բոլորս վատ խաղացինք։'), ok: true },
        { t: p('Sí, fue tu culpa. Eres muy malo.', 'Այո, քո մեղքն էր։ Դու շատ վատն ես։'), ok: false, why: p('Así no se habla a un compañero. Un capitán ayuda.', 'Թիմակցի հետ այդպես չեն խոսում։ Ավագն օգնում է։') },
        { t: p('Mañana es domingo.', 'Վաղը կիրակի է։'), ok: false, why: huh },
      ] },
      { npc: p('Razmik tiene razón. ¿Qué podemos aprender de esta derrota?', 'Ռազմիկը ճիշտ է։ Ի՞նչ կարող ենք սովորել այս պարտությունից։'), who: 0 },
      { choose: [
        { t: p('Podemos aprender a defender mejor y a pasar más el balón.', 'Կարող ենք սովորել ավելի լավ պաշտպանվել և ավելի շատ փոխանցել գնդակը։'), ok: true },
        { t: p('Podemos aprender a cocinar.', 'Կարող ենք սովորել ճաշ պատրաստել։'), ok: false, why: huh },
        { t: p('No podemos aprender nada nunca.', 'Երբեք ոչինչ չենք կարող սովորել։'), ok: false, why: p('¡Siempre se puede aprender algo!', 'Միշտ կարելի է ինչ-որ բան սովորել։') },
      ] },
      { npc: p('Gracias, Razmik. ¿Practicamos penaltis juntos mañana?', 'Շնորհակալություն, Ռազմի՛կ։ Վաղը միասին տասնմեկ մետրանոցներ կպարապե՞նք։'), who: 1 },
      { choose: [
        { t: p('¡Claro! Quedamos a las cinco en el campo.', 'Իհարկե։ Ժամը հինգին հանդիպենք դաշտում։'), ok: true },
        { t: p('No, nunca juego al fútbol.', 'Ոչ, ես երբեք ֆուտբոլ չեմ խաղում։'), ok: false, why: huh },
        { t: p('Ayer fui al cine.', 'Երեկ կինո գնացի։'), ok: false, why: p('Lucas te pregunta por mañana, no por ayer.', 'Լուկասը քեզ հարցնում է վաղվա մասին, ոչ թե երեկվա։') },
      ] },
      { npc: p('Así me gusta. Perder también es parte del fútbol. El próximo partido lo ganaremos.', 'Այսպես եմ սիրում։ Պարտվելը նույնպես ֆուտբոլի մաս է։ Հաջորդ խաղում կհաղթենք։'), who: 0 },
    ],
  },
  {
    id: 'new-player',
    icon: '🤝',
    title: p('Conocer a un jugador nuevo', 'Ծանոթություն նոր խաղացողի հետ'),
    place: 'field',
    cefr: 'A1',
    grammar: p('Presentarse: me llamo, soy de, tengo… años', 'Ներկայանալ․ me llamo, soy de, tengo… años'),
    npcs: [NEW],
    nodes: [
      { npc: p('Hola… Soy nuevo en el equipo. Me llamo Óscar.', 'Բարև… Ես նոր եմ թիմում։ Իմ անունը Օսկար է։') },
      { choose: [
        { t: p('¡Hola, Óscar! Me llamo Razmik. Soy el capitán.', 'Բարև, Օսկա՛ր։ Իմ անունը Ռազմիկ է։ Ես ավագն եմ։'), ok: true },
        { t: p('Adiós, Óscar.', 'Ցտեսություն, Օսկար։'), ok: false, why: p('¡Acaba de llegar! Primero hay que saludar y presentarse.', 'Նա նոր է եկել։ Սկզբում պետք է բարևել և ներկայանալ։') },
        { t: p('Me llamo balón.', 'Իմ անունը գնդակ է։'), ok: false, why: huh },
      ] },
      { npc: p('¡Encantado! ¿De dónde eres, Razmik?', 'Շատ հաճելի է։ Որտեղի՞ց ես, Ռազմի՛կ։') },
      { choose: [
        { t: p('Soy de Armenia. ¿Y tú?', 'Ես Հայաստանից եմ։ Իսկ դու՞։'), ok: true },
        { t: p('Soy de color naranja.', 'Ես նարնջագույն եմ։'), ok: false, why: huh },
        { t: p('Tengo doce años.', 'Ես տասներկու տարեկան եմ։'), ok: false, why: p('Te pregunta de dónde eres.', 'Նա հարցնում է, թե որտեղից ես։') },
      ] },
      { npc: p('Yo soy de Valencia. Tengo doce años. ¿Cuántos años tienes tú?', 'Ես Վալենսիայից եմ։ Տասներկու տարեկան եմ։ Իսկ դու քանի՞ տարեկան ես։') },
      { choose: [
        { t: p('¡Yo también tengo doce años!', 'Ես էլ եմ տասներկու տարեկան։'), ok: true },
        { t: p('Tengo dos botas.', 'Ես երկու խաղակոշիկ ունեմ։'), ok: false, why: huh },
        { t: p('Son las doce.', 'Ժամը տասներկուսն է։'), ok: false, why: p('Te pregunta tu edad, no la hora.', 'Նա հարցնում է տարիքդ, ոչ թե ժամը։') },
      ] },
      { npc: p('¿En qué posición juegas?', 'Ո՞ր դիրքում ես խաղում։') },
      { choose: [
        { t: p('Juego de centrocampista. ¿Y tú?', 'Խաղում եմ որպես կիսապաշտպան։ Իսկ դու՞։'), ok: true },
        { t: p('Juego en mi habitación.', 'Խաղում եմ իմ սենյակում։'), ok: false, why: huh },
        { t: p('Juego con mi gato.', 'Խաղում եմ կատվիս հետ։'), ok: false, why: huh },
      ] },
      { npc: p('Yo soy portero. ¡Me encanta parar penaltis!', 'Ես դարպասապահ եմ։ Շատ եմ սիրում տասնմեկ մետրանոցներ բռնել։') },
      { choose: [
        { t: p('¡Genial! Bienvenido al equipo, Óscar.', 'Հիանալի է։ Բարի գալուստ թիմ, Օսկա՛ր։'), ok: true },
        { t: p('No me gustan los porteros.', 'Ես դարպասապահներին չեմ սիրում։'), ok: false, why: p('Sé amable con tu nuevo compañero.', 'Բարյացակա՛մ եղիր նոր թիմակցիդ հետ։') },
        { t: p('Buenas noches.', 'Բարի գիշեր։'), ok: false, why: huh },
      ] },
    ],
  },
  {
    id: 'academy',
    icon: '🏫',
    title: p('En la academia de fútbol', 'Ֆուտբոլի ակադեմիայում'),
    place: 'academy',
    cefr: 'B1',
    grammar: p('Querer / poder + infinitivo, ir a + infinitivo', 'Querer / poder + անորոշ դերբայ, ir a + անորոշ դերբայ'),
    npcs: [DIRECTOR],
    nodes: [
      { npc: p('Bienvenido a la Academia Española de Fútbol. ¿Por qué quieres estudiar aquí?', 'Բարի գալուստ Իսպանական ֆուտբոլի ակադեմիա։ Ինչո՞ւ ես ուզում սովորել այստեղ։') },
      { choose: [
        { t: p('Quiero estudiar aquí porque quiero ser futbolista profesional.', 'Ուզում եմ սովորել այստեղ, որովհետև ուզում եմ դառնալ պրոֆեսիոնալ ֆուտբոլիստ։'), ok: true },
        { t: p('Porque aquí hay mucha comida.', 'Որովհետև այստեղ շատ ուտելիք կա։'), ok: false, why: p('Es una academia de fútbol, no un restaurante.', 'Սա ֆուտբոլի ակադեմիա է, ոչ թե ռեստորան։') },
        { t: p('No quiero nada.', 'Ես ոչինչ չեմ ուզում։'), ok: false, why: huh },
      ] },
      { npc: p('Muy bien. Aquí entrenamos cinco días a la semana. ¿Puedes venir por las tardes?', 'Շատ լավ։ Այստեղ մարզվում ենք շաբաթը հինգ օր։ Կարո՞ղ ես գալ կեսօրից հետո։') },
      { choose: [
        { t: p('Sí, puedo venir después del colegio.', 'Այո, կարող եմ գալ դպրոցից հետո։'), ok: true },
        { t: p('Sí, puedo nadar muy rápido.', 'Այո, ես կարող եմ շատ արագ լողալ։'), ok: false, why: huh },
        { t: p('Voy a dormir todas las tardes.', 'Ամեն կեսօրից հետո քնելու եմ։'), ok: false, why: p('Así no podrás entrenar con nosotros.', 'Այդպես չես կարողանա մեզ հետ մարզվել։') },
      ] },
      { npc: p('En la academia también estudiamos español e inglés. ¿Qué vas a hacer para mejorar tu español?', 'Ակադեմիայում սովորում ենք նաև իսպաներեն և անգլերեն։ Ի՞նչ ես անելու, որ իսպաներենդ լավացնես։') },
      { choose: [
        { t: p('Voy a hablar mucho con mis compañeros y voy a escuchar a los entrenadores.', 'Շատ եմ խոսելու թիմակիցներիս հետ և լսելու եմ մարզիչներին։'), ok: true },
        { t: p('Voy a jugar al ajedrez.', 'Շախմատ եմ խաղալու։'), ok: false, why: huh },
        { t: p('No voy a hablar nunca.', 'Երբեք չեմ խոսելու։'), ok: false, why: p('¡Para aprender un idioma hay que hablar!', 'Լեզու սովորելու համար պետք է խոսել։') },
      ] },
      { npc: p('Una última pregunta: ¿qué es lo más importante en un equipo?', 'Վերջին հարցը․ ի՞նչն է ամենակարևորը թիմում։') },
      { choose: [
        { t: p('Lo más importante es ayudar a los compañeros y respetar a todos.', 'Ամենակարևորը թիմակիցներին օգնելն ու բոլորին հարգելն է։'), ok: true },
        { t: p('Lo más importante es que yo marque todos los goles.', 'Ամենակարևորն այն է, որ բոլոր գոլերը ես խփեմ։'), ok: false, why: p('El fútbol es un deporte de equipo.', 'Ֆուտբոլը թիմային խաղ է։') },
        { t: p('Lo más importante es el color de las botas.', 'Ամենակարևորը խաղակոշիկների գույնն է։'), ok: false, why: huh },
      ] },
      { npc: p('¡Excelente respuesta! Puedes empezar en la academia el lunes.', 'Գերազանց պատասխան է։ Կարող ես ակադեմիայում սկսել երկուշաբթի։') },
    ],
  },
  {
    id: 'journalist',
    icon: '🎤',
    title: p('Entrevista con una periodista', 'Հարցազրույց լրագրողի հետ'),
    place: 'press',
    cefr: 'B1',
    grammar: p('Indefinido e imperfecto: marqué, estaba, había', 'Indefinido և imperfecto․ marqué, estaba, había'),
    npcs: [JOURNALIST],
    nodes: [
      { npc: p('Buenas tardes, Razmik. Soy Laura, de Radio Deporte. ¿Puedo hacerte unas preguntas?', 'Բարի օր, Ռազմի՛կ։ Ես Լաուրան եմ, «Ռադիո Սպորտից»։ Կարո՞ղ եմ քեզ մի քանի հարց տալ։') },
      { choose: [
        { t: p('Buenas tardes. Sí, claro.', 'Բարի օր։ Այո, իհարկե։'), ok: true },
        { t: p('No sé nadar.', 'Ես լողալ չգիտեմ։'), ok: false, why: huh },
        { t: p('Buenas noches, mamá.', 'Բարի գիշեր, մայրի՛կ։'), ok: false, why: huh },
      ] },
      { npc: p('¿Cómo fue el gol de la victoria?', 'Ինչպե՞ս եղավ հաղթական գոլը։') },
      { choose: [
        { t: p('Mateo me pasó el balón, regateé al defensa y disparé con la derecha.', 'Մատեոն ինձ փոխանցեց գնդակը, ես խաբեցի պաշտպանին և հարվածեցի աջով։'), ok: true },
        { t: p('Mañana voy a comprar pan.', 'Վաղը հաց եմ գնելու։'), ok: false, why: p('Te pregunta por el gol del partido.', 'Նա հարցնում է խաղի գոլի մասին։') },
        { t: p('El gol es rojo.', 'Գոլը կարմիր է։'), ok: false, why: huh },
      ] },
      { npc: p('¿Qué pensabas cuando ibais perdiendo en el primer tiempo?', 'Ի՞նչ էիր մտածում, երբ առաջին խաղակեսում պարտվում էիք։') },
      { choose: [
        { t: p('Pensaba que todavía podíamos ganar si trabajábamos juntos.', 'Մտածում էի, որ դեռ կարող ենք հաղթել, եթե միասին աշխատենք։'), ok: true },
        { t: p('Pensaba en mis vacaciones en la playa.', 'Մտածում էի լողափում իմ արձակուրդի մասին։'), ok: false, why: huh },
        { t: p('No pensaba porque estaba dormido.', 'Չէի մտածում, որովհետև քնած էի։'), ok: false, why: huh },
      ] },
      { npc: p('Cuando eras pequeño, ¿quién era tu ídolo?', 'Երբ փոքր էիր, ո՞վ էր քո կուռքը։') },
      { choose: [
        { t: p('Cuando era pequeño, mi ídolo era un centrocampista que pasaba muy bien el balón.', 'Երբ փոքր էի, իմ կուռքը մի կիսապաշտպան էր, որը շատ լավ էր փոխանցում գնդակը։'), ok: true },
        { t: p('Mi ídolo es mañana.', 'Իմ կուռքը վաղն է։'), ok: false, why: huh },
        { t: p('Cuando era pequeño, tenía un balón.', 'Երբ փոքր էի, գնդակ ունեի։'), ok: false, why: p('Está bien dicho, pero no responde a la pregunta.', 'Լավ է ասված, բայց հարցին չի պատասխանում։') },
      ] },
      { npc: p('Muchas gracias, Razmik. ¿Quieres decir algo a los aficionados?', 'Շատ շնորհակալություն, Ռազմի՛կ։ Ուզո՞ւմ ես մի բան ասել երկրպագուներին։') },
      { choose: [
        { t: p('¡Gracias por venir! Con vuestro apoyo somos más fuertes.', 'Շնորհակալություն գալու համար։ Ձեր աջակցությամբ մենք ավելի ուժեղ ենք։'), ok: true },
        { t: p('No, gracias. Adiós.', 'Ոչ, շնորհակալություն։ Ցտեսություն։'), ok: false, why: p('Los aficionados esperan unas palabras de su capitán.', 'Երկրպագուները իրենց ավագից մի քանի խոսք են սպասում։') },
        { t: p('Los aficionados son verdes.', 'Երկրպագուները կանաչ են։'), ok: false, why: huh },
      ] },
    ],
  },
  {
    id: 'training-talk',
    icon: '📋',
    title: p('Hablar sobre los entrenamientos', 'Խոսել մարզումների մասին'),
    place: 'field',
    cefr: 'A2',
    grammar: p('Rutinas: siempre, a veces, nunca + presente', 'Սովորույթներ․ siempre, a veces, nunca + ներկա'),
    npcs: [COACH],
    nodes: [
      { npc: p('Razmik, quiero hablar contigo sobre los entrenamientos. ¿Cuántos días entrenas a la semana?', 'Ռազմի՛կ, ուզում եմ քեզ հետ խոսել մարզումների մասին։ Շաբաթը քանի՞ օր ես մարզվում։') },
      { choose: [
        { t: p('Entreno tres días a la semana: lunes, miércoles y viernes.', 'Մարզվում եմ շաբաթը երեք օր՝ երկուշաբթի, չորեքշաբթի և ուրբաթ։'), ok: true },
        { t: p('Entreno a las siete de la mañana con pan.', 'Մարզվում եմ առավոտյան յոթին՝ հացով։'), ok: false, why: huh },
        { t: p('Nunca tengo hambre.', 'Ես երբեք քաղցած չեմ։'), ok: false, why: huh },
      ] },
      { npc: p('Bien. ¿Qué haces siempre antes de entrenar?', 'Լավ։ Ի՞նչ ես միշտ անում մարզվելուց առաջ։') },
      { choose: [
        { t: p('Siempre caliento y estiro los músculos.', 'Միշտ տաքանում եմ և ձգում մկանները։'), ok: true },
        { t: p('Siempre veo la tele tres horas.', 'Միշտ երեք ժամ հեռուստացույց եմ դիտում։'), ok: false, why: p('Eso no es una buena preparación.', 'Դա լավ նախապատրաստություն չէ։') },
        { t: p('Siempre pierdo las botas.', 'Միշտ կորցնում եմ խաղակոշիկներս։'), ok: false, why: huh },
      ] },
      { npc: p('Muy bien. ¿Y qué ejercicio te gusta más?', 'Շատ լավ։ Իսկ ո՞ր վարժությունն ես ամենաշատը սիրում։') },
      { choose: [
        { t: p('Me gusta más practicar los tiros a puerta.', 'Ամենաշատը սիրում եմ դարպասին հարվածներ պարապել։'), ok: true },
        { t: p('Me gusta más la sopa.', 'Ամենաշատը սիրում եմ ապուրը։'), ok: false, why: huh },
        { t: p('Me gustan más los martes.', 'Ամենաշատը սիրում եմ երեքշաբթիները։'), ok: false, why: p('Te pregunto por un ejercicio, no por un día.', 'Ես հարցնում եմ վարժության, ոչ թե օրվա մասին։') },
      ] },
      { npc: p('¿Y qué ejercicio es más difícil para ti?', 'Իսկ ո՞ր վարժությունն է քեզ համար ամենադժվարը։') },
      { choose: [
        { t: p('A veces me cuesta defender con la pierna izquierda.', 'Երբեմն ինձ դժվար է ձախ ոտքով պաշտպանվել։'), ok: true },
        { t: p('Es difícil comer helado.', 'Պաղպաղակ ուտելը դժվար է։'), ok: false, why: huh },
        { t: p('Nunca entreno.', 'Երբեք չեմ մարզվում։'), ok: false, why: p('¡Pero si acabas de decir que entrenas tres días!', 'Բայց հենց նոր ասացիր, որ երեք օր ես մարզվում։') },
      ] },
      { npc: p('Entonces vamos a practicar con la izquierda. ¡Poco a poco vas a mejorar!', 'Ուրեմն կպարապենք ձախ ոտքով։ Քիչ-քիչ կլավանաս։') },
    ],
  },
  {
    id: 'bus',
    icon: '🚌',
    title: p('En el autobús del equipo', 'Թիմի ավտոբուսում'),
    place: 'bus',
    cefr: 'B1',
    grammar: p('Futuro simple: jugaremos, llegaremos, será', 'Ապառնի ժամանակ․ jugaremos, llegaremos, será'),
    npcs: [MATEO, LUCAS],
    nodes: [
      { npc: p('¿Cuánto tiempo falta para llegar a Madrid?', 'Որքա՞ն ժամանակ է մնացել մինչև Մադրիդ հասնելը։'), who: 0 },
      { choose: [
        { t: p('Creo que llegaremos en una hora.', 'Կարծում եմ՝ մեկ ժամից կհասնենք։'), ok: true },
        { t: p('Madrid es una ciudad.', 'Մադրիդը քաղաք է։'), ok: false, why: p('Es verdad, pero te pregunta cuánto tiempo falta.', 'Ճիշտ է, բայց նա հարցնում է, թե որքան ժամանակ է մնացել։') },
        { t: p('Llegamos ayer.', 'Երեկ հասանք։'), ok: false, why: huh },
      ] },
      { npc: p('¿Contra quién jugaremos mañana?', 'Վաղը ու՞մ դեմ ենք խաղալու։'), who: 1 },
      { choose: [
        { t: p('Jugaremos contra el Atlético Juvenil. Será un partido difícil.', 'Կխաղանք «Ատլետիկո Յունիորի» դեմ։ Դժվար խաղ կլինի։'), ok: true },
        { t: p('Jugaremos contra mi abuela.', 'Կխաղանք տատիկիս դեմ։'), ok: false, why: huh },
        { t: p('Jugamos al ajedrez ayer.', 'Երեկ շախմատ խաղացինք։'), ok: false, why: huh },
      ] },
      { npc: p('Si ganamos mañana, ¿qué pasará?', 'Եթե վաղը հաղթենք, ի՞նչ կլինի։'), who: 0 },
      { choose: [
        { t: p('Si ganamos mañana, jugaremos la final del torneo.', 'Եթե վաղը հաղթենք, կխաղանք մրցաշարի եզրափակիչում։'), ok: true },
        { t: p('Si ganamos, el autobús será azul.', 'Եթե հաղթենք, ավտոբուսը կապույտ կլինի։'), ok: false, why: huh },
        { t: p('Si llueve, comeré pasta.', 'Եթե անձրև գա, մակարոն կուտեմ։'), ok: false, why: huh },
      ] },
      { npc: p('Estoy un poco mareado… ¿Qué hago?', 'Գլուխս մի քիչ պտտվում է… Ի՞նչ անեմ։'), who: 1 },
      { choose: [
        { t: p('Mira por la ventana y bebe un poco de agua. Le diré al entrenador.', 'Նայի՛ր պատուհանից և մի քիչ ջուր խմի՛ր։ Ես մարզչին կասեմ։'), ok: true },
        { t: p('Corre por el autobús.', 'Վազի՛ր ավտոբուսի մեջ։'), ok: false, why: p('¡Eso es peligroso!', 'Դա վտանգավոր է։') },
        { t: p('Come tres bocadillos.', 'Կե՛ր երեք բուտերբրոդ։'), ok: false, why: huh },
      ] },
      { npc: p('Gracias, Razmik. Eres un buen capitán. ¡Mañana marcaremos muchos goles!', 'Շնորհակալություն, Ռազմի՛կ։ Դու լավ ավագ ես։ Վաղը շատ գոլեր կխփենք։'), who: 1 },
    ],
  },
  {
    id: 'shop',
    icon: '🎟️',
    title: p('Comprar entradas y material deportivo', 'Տոմսեր և մարզական պարագաներ գնել'),
    place: 'shop',
    cefr: 'A2',
    grammar: p('Pedir y preguntar precios: quería, ¿cuánto cuesta?', 'Խնդրել և գին հարցնել․ quería, ¿cuánto cuesta?'),
    npcs: [SELLER],
    nodes: [
      { npc: p('¡Buenos días! ¿Qué necesitas?', 'Բարի լույս։ Ի՞նչ է քեզ պետք։') },
      { choose: [
        { t: p('Buenos días. Quería dos entradas para el partido del sábado.', 'Բարի լույս։ Ուզում էի երկու տոմս շաբաթ օրվա խաղի համար։'), ok: true },
        { t: p('Necesito un elefante.', 'Ինձ փիղ է պետք։'), ok: false, why: huh },
        { t: p('Buenas noches, me voy.', 'Բարի գիշեր, ես գնում եմ։'), ok: false, why: huh },
      ] },
      { npc: p('Muy bien. Cada entrada cuesta diez euros. Son veinte euros en total.', 'Շատ լավ։ Յուրաքանչյուր տոմսն արժե տասը եվրո։ Ընդհանուրը քսան եվրո է։') },
      { choose: [
        { t: p('Aquí tiene veinte euros.', 'Ահա քսան եվրո։'), ok: true },
        { t: p('Aquí tiene dos euros.', 'Ահա երկու եվրո։'), ok: false, why: p('Son veinte euros, no dos.', 'Քսան եվրո է, ոչ թե երկու։') },
        { t: p('No tengo pies.', 'Ես ոտքեր չունեմ։'), ok: false, why: huh },
      ] },
      { npc: p('Gracias. ¿Necesitas algo más?', 'Շնորհակալություն։ Ուրիշ բան պե՞տք է։') },
      { choose: [
        { t: p('Sí. ¿Cuánto cuestan estas botas negras?', 'Այո։ Որքա՞ն արժեն այս սև խաղակոշիկները։'), ok: true },
        { t: p('Sí, necesito dormir.', 'Այո, ինձ պետք է քնել։'), ok: false, why: huh },
        { t: p('¿Cuántos años tienes?', 'Քանի՞ տարեկան ես։'), ok: false, why: p('Es una pregunta un poco rara para un vendedor.', 'Վաճառողի համար դա մի քիչ տարօրինակ հարց է։') },
      ] },
      { npc: p('Cuestan cuarenta y cinco euros. ¿Qué número usas?', 'Արժեն քառասունհինգ եվրո։ Ո՞ր չափսն ես կրում։') },
      { choose: [
        { t: p('Uso el número treinta y ocho.', 'Կրում եմ երեսունութ չափսը։'), ok: true },
        { t: p('Uso el número siete, como en mi camiseta.', 'Կրում եմ յոթ համարը, ինչպես մարզաշապիկիս վրա։'), ok: false, why: p('Te pregunta la talla del pie, ¡no el dorsal!', 'Նա հարցնում է ոտքի չափսը, ոչ թե մարզաշապիկի համարը։') },
        { t: p('Uso los guantes.', 'Ես ձեռնոցներ եմ կրում։'), ok: false, why: huh },
      ] },
      { npc: p('Aquí las tienes. ¿Quieres probártelas?', 'Ահա դրանք։ Ուզո՞ւմ ես փորձել։') },
      { choose: [
        { t: p('Sí, por favor. ¡Me quedan perfectas! Me las llevo.', 'Այո, խնդրում եմ։ Ինձ կատարյալ են սազում։ Վերցնում եմ։'), ok: true },
        { t: p('No, gracias, prefiero comprar pan.', 'Ոչ, շնորհակալություն, նախընտրում եմ հաց գնել։'), ok: false, why: huh },
        { t: p('Sí, son las tres.', 'Այո, ժամը երեքն է։'), ok: false, why: huh },
      ] },
      { npc: p('¡Que disfrutes del partido y de tus botas nuevas!', 'Վայելի՛ր խաղը և նոր խաղակոշիկներդ։') },
    ],
  },
];

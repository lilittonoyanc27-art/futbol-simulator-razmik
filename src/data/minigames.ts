import { p, Phrase } from '../i18n/ui';

export type GameId = 'memory' | 'listen' | 'order' | 'quick' | 'dialog' | 'situations' | 'race' | 'find3d';

export const MINIGAMES: { id: GameId; icon: string; name: Phrase; desc: Phrase }[] = [
  { id: 'memory', icon: '🧠', name: p('Memory futbolero', 'Ֆուտբոլային Memory'), desc: p('Encuentra las parejas: dibujo y palabra', 'Գտի՛ր զույգերը․ նկար և բառ') },
  { id: 'listen', icon: '👂', name: p('¿Qué dice el entrenador?', 'Ի՞նչ է ասում մարզիչը'), desc: p('Escucha la orden y elige la acción', 'Լսի՛ր հրահանգը և ընտրի՛ր գործողությունը') },
  { id: 'order', icon: '🧩', name: p('Ordena la frase', 'Դասավորի՛ր նախադասությունը'), desc: p('Construye frases correctas', 'Կազմի՛ր ճիշտ նախադասություններ') },
  { id: 'quick', icon: '⚡', name: p('Preguntas rápidas', 'Արագ հարցեր'), desc: p('¿Verdadero o falso? ¡Rápido!', 'Ճի՞շտ է, թե՞ սխալ։ Արա՛գ։') },
  { id: 'dialog', icon: '💬', name: p('La respuesta correcta', 'Ճիշտ պատասխանը'), desc: p('Elige la mejor réplica', 'Ընտրի՛ր լավագույն պատասխանը') },
  { id: 'situations', icon: '🤔', name: p('¿Qué harías?', 'Ի՞նչ կանեիր'), desc: p('Situaciones de fútbol', 'Ֆուտբոլային իրավիճակներ') },
  { id: 'race', icon: '🏁', name: p('Carrera de comprensión', 'Ըմբռնման մրցավազք'), desc: p('Entiende rápido y gana la carrera', 'Արագ հասկացի՛ր և հաղթի՛ր մրցավազքում') },
  { id: 'find3d', icon: '🔎', name: p('Busca en el campo', 'Փնտրի՛ր դաշտում'), desc: p('Encuentra objetos en el campo 3D', 'Գտի՛ր առարկաներ եռաչափ դաշտում') },
];

export const LISTEN_ITEMS: { icon: string; say: Phrase }[] = [
  { icon: '🏃', say: p('¡Corre hacia el balón!', 'Վազի՛ր դեպի գնդակը։') },
  { icon: '➡️', say: p('¡Pasa el balón a tu compañero!', 'Գնդակը փոխանցի՛ր թիմակցիդ։') },
  { icon: '💥', say: p('¡Dispara a la portería!', 'Հարվածի՛ր դարպասին։') },
  { icon: '⤴️', say: p('¡Salta para cabecear!', 'Ցատկի՛ր՝ գլխով հարվածելու համար։') },
  { icon: '🛡️', say: p('¡Defiende! ¡Vuelve atrás!', 'Պաշտպանվի՛ր։ Վերադարձի՛ր ետ։') },
  { icon: '✋', say: p('¡Para el balón con el pie!', 'Կանգնեցրո՛ւ գնդակը ոտքով։') },
  { icon: '💧', say: p('Ahora bebe un poco de agua.', 'Հիմա մի քիչ ջուր խմի՛ր։') },
  { icon: '🧘', say: p('Descansa un minuto.', 'Հանգստացի՛ր մեկ րոպե։') },
  { icon: '🚩', say: p('Ve al córner y saca.', 'Գնա՛ անկյուն և խփի՛ր անկյունայինը։') },
  { icon: '🔥', say: p('Vamos a calentar antes de jugar.', 'Խաղալուց առաջ տաքանանք։') },
  { icon: '👂', say: p('Escucha bien al árbitro.', 'Լա՛վ լսիր մրցավարին։') },
  { icon: '🤝', say: p('Dale la mano al rival.', 'Ձե՛ռք տուր մրցակցին։') },
];

export const ORDER_SENTENCES: Phrase[] = [
  p('Pasa el balón a Lucas', 'Գնդակը փոխանցի՛ր Լուկասին'),
  p('Razmik corre muy rápido', 'Ռազմիկը շատ արագ է վազում'),
  p('El portero para el balón', 'Դարպասապահը բռնում է գնդակը'),
  p('Hoy vamos a ganar el partido', 'Այսօր հաղթելու ենք խաղում'),
  p('Tienes que disparar a la portería', 'Պետք է հարվածես դարպասին'),
  p('Hemos marcado tres goles', 'Մենք երեք գոլ ենք խփել'),
  p('Ayer jugamos contra los Tigres', 'Երեկ խաղացինք «Վագրերի» դեմ'),
  p('Mañana jugaremos la final', 'Վաղը կխաղանք եզրափակիչում'),
  p('Mi camiseta tiene el número siete', 'Իմ մարզաշապիկն ունի յոթ համարը'),
  p('No pierdas el balón en el centro', 'Կենտրոնում գնդակը մի՛ կորցրու'),
];

export const QUICK: { q: Phrase; a: boolean }[] = [
  { q: p('Un partido de fútbol dura noventa minutos.', 'Ֆուտբոլային խաղը տևում է իննսուն րոպե։'), a: true },
  { q: p('El portero puede tocar el balón con las manos en su área.', 'Դարպասապահը կարող է իր հրապարակում ձեռքերով դիպչել գնդակին։'), a: true },
  { q: p('Un equipo tiene veinte jugadores en el campo.', 'Թիմը դաշտում ունի քսան խաղացող։'), a: false },
  { q: p('La tarjeta roja significa que el jugador sale del partido.', 'Կարմիր քարտը նշանակում է, որ խաղացողը դուրս է գալիս խաղից։'), a: true },
  { q: p('El árbitro marca los goles.', 'Մրցավարը գոլեր է խփում։'), a: false },
  { q: p('Un penalti se tira desde el punto de penalti.', 'Տասնմեկ մետրանոցը խփում են տասնմեկ մետրանոցի կետից։'), a: true },
  { q: p('Razmik lleva el número diez.', 'Ռազմիկը կրում է տասը համարը։'), a: false },
  { q: p('Los delanteros intentan marcar goles.', 'Հարձակվողները փորձում են գոլեր խփել։'), a: true },
  { q: p('El balón de fútbol es cuadrado.', 'Ֆուտբոլի գնդակը քառակուսի է։'), a: false },
  { q: p('Antes de jugar es bueno calentar.', 'Խաղալուց առաջ լավ է տաքանալ։'), a: true },
  { q: p('Un empate es cuando los dos equipos marcan los mismos goles.', 'Ոչ-ոքին այն է, երբ երկու թիմերը նույնքան գոլ են խփում։'), a: true },
  { q: p('En el descanso los jugadores comen pizza en el campo.', 'Ընդմիջմանը խաղացողները դաշտում պիցցա են ուտում։'), a: false },
  { q: p('El córner se saca desde la esquina del campo.', 'Անկյունայինը խփում են դաշտի անկյունից։'), a: true },
  { q: p('Los defensas juegan cerca de su portería.', 'Պաշտպանները խաղում են իրենց դարպասի մոտ։'), a: true },
];

export const DIALOG: { q: Phrase; options: Phrase[]; answer: number }[] = [
  { q: p('¿Estás listo para jugar?', 'Պատրա՞ստ ես խաղալու։'), options: [p('¡Sí, estoy listo!', 'Այո, պատրաստ եմ։'), p('Es azul.', 'Կապույտ է։'), p('Tengo hambre de libros.', 'Գրքերի քաղց ունեմ։')], answer: 0 },
  { q: p('¿Dónde está el balón?', 'Որտե՞ղ է գնդակը։'), options: [p('Son las tres.', 'Ժամը երեքն է։'), p('Está en el córner.', 'Անկյունում է։'), p('Me llamo Razmik.', 'Իմ անունը Ռազմիկ է։')], answer: 1 },
  { q: p('¿Quién ha marcado el gol?', 'Ո՞վ է խփել գոլը։'), options: [p('Lo ha marcado Lucas.', 'Լուկասն է խփել։'), p('Mañana, por la tarde.', 'Վաղը, կեսօրից հետո։'), p('En el autobús.', 'Ավտոբուսում։')], answer: 0 },
  { q: p('¿Cuántos goles habéis marcado?', 'Քանի՞ գոլ եք խփել։'), options: [p('Hemos marcado cuatro.', 'Չորս ենք խփել։'), p('Me gusta el verde.', 'Կանաչն եմ սիրում։'), p('Estoy en casa.', 'Տանն եմ։')], answer: 0 },
  { q: p('¿Por qué estás triste?', 'Ինչո՞ւ ես տխուր։'), options: [p('Porque hemos perdido.', 'Որովհետև պարտվել ենք։'), p('Porque soy alto.', 'Որովհետև բարձրահասակ եմ։'), p('Porque es lunes y me gusta.', 'Որովհետև երկուշաբթի է, և ինձ դուր է գալիս։')], answer: 0 },
  { q: p('¿Qué vas a hacer mañana?', 'Ի՞նչ ես անելու վաղը։'), options: [p('Ayer jugué mucho.', 'Երեկ շատ խաղացի։'), p('Voy a entrenar con el equipo.', 'Մարզվելու եմ թիմի հետ։'), p('Soy de Armenia.', 'Ես Հայաստանից եմ։')], answer: 1 },
  { q: p('¿Me pasas el agua, por favor?', 'Ջուրը կփոխանցե՞ս, խնդրում եմ։'), options: [p('Claro, toma.', 'Իհարկե, վերցրո՛ւ։'), p('No, soy el portero.', 'Ոչ, ես դարպասապահն եմ։'), p('El agua es un estadio.', 'Ջուրը մարզադաշտ է։')], answer: 0 },
  { q: p('¿Cuál es tu posición?', 'Ո՞րն է քո դիրքը։'), options: [p('Soy centrocampista.', 'Կիսապաշտպան եմ։'), p('Tengo doce años.', 'Տասներկու տարեկան եմ։'), p('Vivo en Ereván.', 'Ապրում եմ Երևանում։')], answer: 0 },
  { q: p('¿Has visto el partido de ayer?', 'Տեսե՞լ ես երեկվա խաղը։'), options: [p('Sí, fue muy emocionante.', 'Այո, շատ հուզիչ էր։'), p('Sí, mañana.', 'Այո, վաղը։'), p('No, es naranja.', 'Ոչ, նարնջագույն է։')], answer: 0 },
  { q: p('¿A qué hora empieza el entrenamiento?', 'Ժամը քանիսի՞ն է սկսվում մարզումը։'), options: [p('Empieza a las cinco.', 'Սկսվում է ժամը հինգին։'), p('Empieza en Madrid.', 'Սկսվում է Մադրիդում։'), p('Empieza con botas.', 'Սկսվում է խաղակոշիկներով։')], answer: 0 },
];

export const SITUATIONS: { s: Phrase; options: { t: Phrase; ok: boolean; why: Phrase }[] }[] = [
  {
    s: p('Tu compañero está solo delante de la portería y tú tienes el balón.', 'Թիմակիցդ մենակ է դարպասի առջև, իսկ գնդակը քեզ մոտ է։'),
    options: [
      { t: p('Le paso el balón.', 'Գնդակը փոխանցում եմ նրան։'), ok: true, why: p('¡Bien! El fútbol es un juego de equipo.', 'Լավ է։ Ֆուտբոլը թիմային խաղ է։') },
      { t: p('Me quedo quieto.', 'Կանգնած եմ մնում։'), ok: false, why: p('Así perderás la oportunidad.', 'Այդպես կկորցնես հնարավորությունը։') },
      { t: p('Tiro el balón fuera del campo.', 'Գնդակը դաշտից դուրս եմ նետում։'), ok: false, why: p('¡No! Tu compañero puede marcar.', 'Ոչ։ Թիմակիցդ կարող է գոլ խփել։') },
    ],
  },
  {
    s: p('Un rival se cae y se hace daño en la pierna.', 'Մրցակիցն ընկնում է և ոտքը վնասում։'),
    options: [
      { t: p('Tiro el balón fuera para que lo atiendan.', 'Գնդակը դուրս եմ հանում, որ նրան օգնեն։'), ok: true, why: p('¡Eso es juego limpio!', 'Սա արդար խաղ է։') },
      { t: p('Me río de él.', 'Ծիծաղում եմ նրա վրա։'), ok: false, why: p('Hay que respetar siempre al rival.', 'Միշտ պետք է հարգել մրցակցին։') },
      { t: p('Sigo jugando y marco.', 'Շարունակում եմ խաղալ և գոլ խփում։'), ok: false, why: p('Primero, la salud del jugador.', 'Առաջինը խաղացողի առողջությունն է։') },
    ],
  },
  {
    s: p('El árbitro pita una falta que tú crees que no es falta.', 'Մրցավարը խախտում է սուլում, որը, քո կարծիքով, խախտում չէ։'),
    options: [
      { t: p('Acepto la decisión y sigo jugando.', 'Ընդունում եմ որոշումը և շարունակում խաղալ։'), ok: true, why: p('Muy bien. El árbitro decide.', 'Շատ լավ։ Որոշում է մրցավարը։') },
      { t: p('Le grito al árbitro.', 'Գոռում եմ մրցավարի վրա։'), ok: false, why: p('Puedes recibir una tarjeta amarilla.', 'Կարող ես դեղին քարտ ստանալ։') },
      { t: p('Me voy del campo.', 'Դաշտից հեռանում եմ։'), ok: false, why: p('Tu equipo te necesita.', 'Թիմդ քո կարիքն ունի։') },
    ],
  },
  {
    s: p('Estáis perdiendo uno a cero y quedan diez minutos.', 'Պարտվում եք մեկ-զրո, և մնացել է տասը րոպե։'),
    options: [
      { t: p('Animo a mis compañeros y atacamos juntos.', 'Քաջալերում եմ թիմակիցներիս, և միասին հարձակվում ենք։'), ok: true, why: p('¡Así se hace, capitán!', 'Ահա այսպես, ավա՛գ։') },
      { t: p('Me enfado con todos.', 'Բոլորի վրա բարկանում եմ։'), ok: false, why: p('Enfadarse no ayuda al equipo.', 'Բարկանալը թիմին չի օգնում։') },
      { t: p('Dejo de correr.', 'Դադարում եմ վազել։'), ok: false, why: p('¡Todavía hay tiempo para remontar!', 'Դեռ ժամանակ կա հաշիվը շրջելու համար։') },
    ],
  },
  {
    s: p('Un compañero nuevo no conoce a nadie en el equipo.', 'Նոր թիմակիցը թիմում ոչ ոքի չի ճանաչում։'),
    options: [
      { t: p('Me presento y le presento al equipo.', 'Ներկայանում եմ և նրան ծանոթացնում թիմի հետ։'), ok: true, why: p('Un buen capitán hace equipo.', 'Լավ ավագը թիմ է ստեղծում։') },
      { t: p('No le hablo.', 'Նրա հետ չեմ խոսում։'), ok: false, why: p('Así se sentirá solo.', 'Այդպես նա իրեն միայնակ կզգա։') },
      { t: p('Le quito sus botas.', 'Վերցնում եմ նրա խաղակոշիկները։'), ok: false, why: p('¡Eso no está bien!', 'Դա լավ չէ։') },
    ],
  },
  {
    s: p('Tienes el balón, pero dos rivales vienen hacia ti.', 'Գնդակը քեզ մոտ է, բայց երկու մրցակից գալիս են քեզ մոտ։'),
    options: [
      { t: p('Paso el balón a un compañero libre.', 'Գնդակը փոխանցում եմ ազատ թիմակցին։'), ok: true, why: p('¡Inteligente! El balón corre más que tú.', 'Խելացի է։ Գնդակն ավելի արագ է «վազում», քան դու։') },
      { t: p('Cierro los ojos.', 'Փակում եմ աչքերս։'), ok: false, why: p('¡Así perderás el balón!', 'Այդպես կկորցնես գնդակը։') },
      { t: p('Me siento en el césped.', 'Նստում եմ խոտին։'), ok: false, why: p('Eso no es una buena idea.', 'Դա լավ միտք չէ։') },
    ],
  },
];

export const FIND_OBJECTS: { id: string; say: Phrase; name: Phrase }[] = [
  { id: 'ball', say: p('Toca el balón.', 'Դիպչի՛ր գնդակին։'), name: p('el balón', 'գնդակը') },
  { id: 'cones', say: p('Toca los conos naranjas.', 'Դիպչի՛ր նարնջագույն կոներին։'), name: p('los conos', 'կոները') },
  { id: 'bottle', say: p('Toca la botella de agua.', 'Դիպչի՛ր ջրի շշին։'), name: p('la botella', 'շիշը') },
  { id: 'flag', say: p('Toca el banderín del córner.', 'Դիպչի՛ր անկյունի դրոշակին։'), name: p('el banderín', 'դրոշակը') },
  { id: 'gloves', say: p('Toca los guantes del portero.', 'Դիպչի՛ր դարպասապահի ձեռնոցներին։'), name: p('los guantes', 'ձեռնոցները') },
  { id: 'shirt', say: p('Toca la camiseta.', 'Դիպչի՛ր մարզաշապիկին։'), name: p('la camiseta', 'մարզաշապիկը') },
  { id: 'trophy', say: p('Toca el trofeo dorado.', 'Դիպչի՛ր ոսկեգույն գավաթին։'), name: p('el trofeo', 'գավաթը') },
  { id: 'goal', say: p('Toca la portería.', 'Դիպչի՛ր դարպասին։'), name: p('la portería', 'դարպասը') },
  { id: 'whistle', say: p('Toca el silbato del árbitro.', 'Դիպչի՛ր մրցավարի սուլիչին։'), name: p('el silbato', 'սուլիչը') },
  { id: 'bench', say: p('Toca el banquillo.', 'Դիպչի՛ր պահեստայինների նստարանին։'), name: p('el banquillo', 'նստարանը') },
];

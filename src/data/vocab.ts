import { p, Phrase } from '../i18n/ui';
import type { Cefr } from '../store';

export type Word = { id: string; es: string; hy: string; emoji: string; cefr: Cefr; ex: Phrase; cat: Phrase };

const OBJ = p('Objetos', 'Առարկաներ');
const PEO = p('Personas', 'Մարդիկ');
const ACT = p('Acciones', 'Գործողություններ');
const PLA = p('Lugares del campo', 'Դաշտի վայրեր');
const EXP = p('Expresiones', 'Արտահայտություններ');

const w = (id: string, es: string, hy: string, emoji: string, cefr: Cefr, cat: Phrase, exEs: string, exHy: string): Word => ({
  id,
  es,
  hy,
  emoji,
  cefr,
  cat,
  ex: p(exEs, exHy),
});

export const WORDS: Word[] = [
  w('balon', 'el balón', 'գնդակը', '⚽', 'A1', OBJ, 'Pasa el balón a Lucas.', 'Գնդակը փոխանցի՛ր Լուկասին։'),
  w('porteria', 'la portería', 'դարպասը', '🥅', 'A1', OBJ, 'Dispara a la portería.', 'Հարվածի՛ր դարպասին։'),
  w('botas', 'las botas', 'խաղակոշիկները', '👟', 'A1', OBJ, 'Mis botas son negras.', 'Իմ խաղակոշիկները սև են։'),
  w('camiseta', 'la camiseta', 'մարզաշապիկը', '👕', 'A1', OBJ, 'Mi camiseta es naranja.', 'Իմ մարզաշապիկը նարնջագույն է։'),
  w('guantes', 'los guantes', 'ձեռնոցները', '🧤', 'A1', OBJ, 'El portero lleva guantes.', 'Դարպասապահը ձեռնոցներ է կրում։'),
  w('silbato', 'el silbato', 'սուլիչը', '📯', 'A1', OBJ, 'El árbitro toca el silbato.', 'Մրցավարը սուլում է սուլիչով։'),
  w('agua', 'el agua', 'ջուրը', '💧', 'A1', OBJ, 'Bebe agua en el descanso.', 'Ընդմիջմանը ջո՛ւր խմիր։'),
  w('trofeo', 'el trofeo', 'գավաթը', '🏆', 'A1', OBJ, '¡Hemos ganado el trofeo!', 'Մենք շահեցինք գավաթը։'),
  w('medalla', 'la medalla', 'մեդալը', '🏅', 'A1', OBJ, 'Tengo una medalla de oro.', 'Ես ոսկե մեդալ ունեմ։'),
  w('bandera', 'el banderín', 'դրոշակը', '🚩', 'A2', OBJ, 'El banderín está en el córner.', 'Դրոշակը անկյունում է։'),
  w('tarjetaRoja', 'la tarjeta roja', 'կարմիր քարտը', '🟥', 'A2', OBJ, 'El árbitro saca tarjeta roja.', 'Մրցավարը կարմիր քարտ է ցույց տալիս։'),
  w('tarjetaAmarilla', 'la tarjeta amarilla', 'դեղին քարտը', '🟨', 'A2', OBJ, 'Cuidado, tienes tarjeta amarilla.', 'Զգո՛ւյշ, դու դեղին քարտ ունես։'),
  w('cono', 'el cono', 'կոնը', '🔶', 'A2', OBJ, 'Corre entre los conos.', 'Վազի՛ր կոների միջով։'),
  w('cronometro', 'el cronómetro', 'վայրկյանաչափը', '⏱️', 'A2', OBJ, 'El entrenador mira el cronómetro.', 'Մարզիչը նայում է վայրկյանաչափին։'),
  w('entrenador', 'el entrenador', 'մարզիչը', '👨‍🏫', 'A1', PEO, 'El entrenador da órdenes.', 'Մարզիչը հրահանգներ է տալիս։'),
  w('portero', 'el portero', 'դարպասապահը', '🧤', 'A1', PEO, 'El portero para el balón.', 'Դարպասապահը բռնում է գնդակը։'),
  w('arbitro', 'el árbitro', 'մրցավարը', '🧑‍⚖️', 'A1', PEO, 'El árbitro pita una falta.', 'Մրցավարը խախտում է սուլում։'),
  w('companero', 'el compañero', 'թիմակիցը', '🤝', 'A1', PEO, 'Mi compañero está libre.', 'Իմ թիմակիցը ազատ է։'),
  w('aficion', 'la afición', 'երկրպագուները', '📣', 'A2', PEO, 'La afición canta en el estadio.', 'Երկրպագուները երգում են մարզադաշտում։'),
  w('delantero', 'el delantero', 'հարձակվողը', '🎯', 'A2', PEO, 'El delantero marca goles.', 'Հարձակվողը գոլեր է խփում։'),
  w('defensa', 'el defensa', 'պաշտպանը', '🛡️', 'A2', PEO, 'El defensa protege la portería.', 'Պաշտպանը պաշտպանում է դարպասը։'),
  w('capitan', 'el capitán', 'ավագը', '©️', 'A2', PEO, 'Razmik es el capitán del equipo.', 'Ռազմիկը թիմի ավագն է։'),
  w('correr', 'correr', 'վազել', '🏃', 'A1', ACT, 'Me gusta correr rápido.', 'Ես սիրում եմ արագ վազել։'),
  w('pasar', 'pasar', 'փոխանցել', '➡️', 'A1', ACT, 'Tienes que pasar el balón.', 'Պետք է փոխանցես գնդակը։'),
  w('disparar', 'disparar', 'հարվածել', '💥', 'A1', ACT, 'Voy a disparar a puerta.', 'Հարվածելու եմ դարպասին։'),
  w('saltar', 'saltar', 'ցատկել', '⤴️', 'A1', ACT, 'El portero salta muy alto.', 'Դարպասապահը շատ բարձր է ցատկում։'),
  w('marcar', 'marcar un gol', 'գոլ խփել', '⚽', 'A1', ACT, 'Quiero marcar un gol.', 'Ուզում եմ գոլ խփել։'),
  w('ganar', 'ganar', 'հաղթել', '🥇', 'A1', ACT, 'Hoy vamos a ganar.', 'Այսօր հաղթելու ենք։'),
  w('perder', 'perder', 'պարտվել', '😞', 'A2', ACT, 'No pasa nada si perdemos.', 'Ոչինչ, եթե պարտվենք։'),
  w('defender', 'defender', 'պաշտպանել', '🛡️', 'A2', ACT, 'Tenemos que defender bien.', 'Պետք է լավ պաշտպանվենք։'),
  w('regatear', 'regatear', 'դրիբլինգ անել', '🌀', 'B1', ACT, 'Razmik sabe regatear muy bien.', 'Ռազմիկը շատ լավ է դրիբլինգ անում։'),
  w('cabecear', 'cabecear', 'գլխով հարվածել', '🙆', 'B1', ACT, 'Lucas cabeceó el balón a la red.', 'Լուկասը գլխով գնդակն ուղարկեց ցանցը։'),
  w('parar', 'parar', 'բռնել, կանգնեցնել', '✋', 'A2', ACT, 'El portero ha parado el penalti.', 'Դարպասապահը բռնել է տասնմեկ մետրանոցը։'),
  w('calentar', 'calentar', 'տաքանալ', '🔥', 'B1', ACT, 'Antes de jugar hay que calentar.', 'Խաղալուց առաջ պետք է տաքանալ։'),
  w('campo', 'el campo', 'դաշտը', '🟩', 'A1', PLA, 'Salimos al campo.', 'Դուրս ենք գալիս դաշտ։'),
  w('estadio', 'el estadio', 'մարզադաշտը', '🏟️', 'A1', PLA, 'El estadio está lleno.', 'Մարզադաշտը լեփ-լեցուն է։'),
  w('vestuario', 'el vestuario', 'հանդերձարանը', '🚪', 'A2', PLA, 'Nos cambiamos en el vestuario.', 'Մենք հանդերձարանում ենք փոխվում։'),
  w('area', 'el área', 'տուգանային հրապարակը', '⬜', 'A2', PLA, 'Estoy dentro del área.', 'Ես տուգանային հրապարակի ներսում եմ։'),
  w('banda', 'la banda', 'եզրը', '↔️', 'A2', PLA, 'Corre por la banda derecha.', 'Վազի՛ր աջ եզրով։'),
  w('banquillo', 'el banquillo', 'պահեստայինների նստարանը', '🪑', 'B1', PLA, 'Los suplentes están en el banquillo.', 'Պահեստայինները նստարանին են։'),
  w('libre', '¡Estoy libre!', 'Ես ազատ եմ։', '🙋', 'A2', EXP, '¡Estoy libre, pásamela!', 'Ես ազատ եմ, փոխանցի՛ր ինձ։'),
  w('cuidado', '¡Cuidado!', 'Զգո՛ւյշ։', '⚠️', 'A2', EXP, '¡Cuidado, viene un rival!', 'Զգո՛ւյշ, մրցակից է գալիս։'),
  w('golazo', '¡Qué golazo!', 'Ինչ հիասքանչ գոլ է։', '🤩', 'A2', EXP, '¡Qué golazo de Razmik!', 'Ինչ հիասքանչ գոլ Ռազմիկից։'),
  w('animo', '¡Ánimo!', 'Քաջությո՛ւն։ Առա՛ջ։', '💪', 'A2', EXP, '¡Ánimo, equipo, podemos ganar!', 'Առա՛ջ, թիմ, կարող ենք հաղթել։'),
  w('fuera', '¡Fuera de juego!', 'Խաղից դուրս։', '🚫', 'B1', EXP, 'El gol no vale: era fuera de juego.', 'Գոլը չի հաշվվում․ խաղից դուրս էր։'),
  w('remontada', 'la remontada', 'հաշվի շրջադարձը', '🔄', 'B2', EXP, 'Fue una remontada increíble.', 'Դա անհավանական շրջադարձ էր։'),
  w('dejarse', 'dejarse la piel', 'ամբողջ ուժը տալ', '🔥', 'B2', EXP, 'Hoy hay que dejarse la piel en el campo.', 'Այսօր պետք է դաշտում ամբողջ ուժը տալ։'),
  w('balonOro', 'estar en racha', 'հաջողությունների շարքում լինել', '📈', 'B2', EXP, 'Razmik está en racha: ha marcado en cinco partidos.', 'Ռազմիկը հաջողությունների շարքում է․ գոլ է խփել հինգ խաղում։'),
  w('hacerPared', 'hacer una pared', 'պատ խաղալ (մեկ-երկու փոխանցում)', '🧱', 'B1', EXP, 'Hicimos una pared y marcamos.', 'Պատ խաղացինք և գոլ խփեցինք։'),
  w('tiroLibre', 'el tiro libre', 'տուգանային հարվածը', '🎯', 'B1', OBJ, 'Voy a lanzar el tiro libre.', 'Ես եմ խփելու տուգանային հարվածը։'),
];

/** Palabras con un dibujo claro y único (para Memory y la carrera). */
export function pictureWords(): Word[] {
  const seen = new Set<string>();
  return WORDS.filter((w) => {
    if (w.cat.es === 'Expresiones' || w.cefr === 'B2' || seen.has(w.emoji) || ['estadio', 'campo', 'area', 'banda', 'vestuario', 'capitan', 'aficion', 'cono'].includes(w.id)) return false;
    seen.add(w.emoji);
    return true;
  });
}

export const wordPhrase = (wd: Word): Phrase => ({ es: wd.es, hy: wd.hy });

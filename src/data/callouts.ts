import { p } from '../i18n/ui';

// Frases naturales de compañeros, entrenador y afición durante el partido.
export const CALL = {
  free: p('¡Estoy libre!', 'Ես ազատ եմ։'),
  passMe: p('¡Pásamela!', 'Փոխանցի՛ր ինձ։'),
  careful: p('¡Cuidado! ¡Por detrás!', 'Զգո՜ւյշ։ Ետևից։'),
  right: p('¡Por la derecha!', 'Աջ կողմով։'),
  left: p('¡Por la izquierda!', 'Ձախ կողմով։'),
  mark: p('¡Marca al delantero!', 'Պահի՛ր հարձակվողին։'),
  defend: p('¡Defiende! ¡Vuelve atrás!', 'Պաշտպանվի՛ր։ Վերադարձի՛ր ետ։'),
  dontLose: p('¡No pierdas el balón!', 'Գնդակը մի՛ կորցրու։'),
  golazo: p('¡Qué golazo!', 'Ինչ հիասքանչ գոլ է։'),
  goal: p('¡Gooool de Razmik!', 'Գո՜լ Ռազմիկից։'),
  teamGoal: p('¡Gol! ¡Vamos, equipo!', 'Գոլ։ Առա՛ջ, թիմ։'),
  shoot: p('¡Dispara, Razmik!', 'Հարվածի՛ր, Ռազմի՛կ։'),
  pressure: p('¡Presiona! ¡Quítale el balón!', 'Ճնշի՛ր։ Խլի՛ր գնդակը։'),
  goodPass: p('¡Buen pase!', 'Լավ փոխանցում է։'),
  thanks: p('¡Gracias, capitán!', 'Շնորհակալություն, ավա՛գ։'),
  calm: p('¡Tranquilos! Todavía hay tiempo.', 'Հանգի՛ստ։ Դեռ ժամանակ կա։'),
  conceded: p('No pasa nada. ¡Ánimo!', 'Ոչինչ։ Քաջությո՛ւն։'),
  save: p('¡Qué parada del portero!', 'Ինչ փրկություն դարպասապահից։'),
  close: p('¡Uy! ¡Casi!', 'Վա՜յ։ Գրեթե։'),
  steal: p('¡Bien robado!', 'Լավ խլեցիր։'),
  wellUnderstood: p('¡Me has entendido perfectamente!', 'Դու ինձ հիանալի հասկացար։'),
  kickoff: p('¡Empieza el partido! ¡Suerte, equipo!', 'Խաղը սկսվում է։ Հաջողությո՛ւն, թիմ։'),
  halftime: p('¡Descanso! Bebed agua.', 'Ընդմիջում։ Ջուր խմե՛ք։'),
  lastMinutes: p('¡Últimos minutos! ¡Con todo!', 'Վերջին րոպեներն են։ Ամբողջ ուժով։'),
  passTo: (n: number, name: string) =>
    p(`¡Pásale el balón al número ${NUM_ES[n] || n}!`, `Գնդակը փոխանցի՛ր ${NUM_HY[n] || n} համարին (${name})։`),
  goRight: p('¡Razmik, sube por la banda derecha!', 'Ռազմի՛կ, բարձրացի՛ր աջ եզրով։'),
  goLeft: p('¡Razmik, ve por la banda izquierda!', 'Ռազմի՛կ, գնա՛ ձախ եզրով։'),
  win: p('¡Hemos ganado! ¡Sois increíbles!', 'Մենք հաղթեցինք։ Դուք անհավանական եք։'),
  lose: p('Hoy hemos perdido, pero vamos a mejorar.', 'Այսօր պարտվեցինք, բայց լավանալու ենք։'),
  draw: p('Un empate. ¡La próxima vez ganaremos!', 'Ոչ-ոքի։ Հաջորդ անգամ կհաղթենք։'),
  foul: p('¡Falta! ¡Árbitro, eso es falta!', 'Խախտում։ Մրցավա՛ր, դա խախտում է։'),
  penaltyCall: p('¡Penalti! Razmik, tú lo tiras.', 'Տասնմեկ մետրանոց։ Ռազմի՛կ, դու ես խփելու։'),
  freeKickCall: p('Tiro libre. ¡Apunta bien, capitán!', 'Տուգանային հարված։ Լա՛վ նշան բռնիր, ավա՛գ։'),
};

export const NUM_ES: Record<number, string> = { 1: 'uno', 4: 'cuatro', 7: 'siete', 9: 'nueve', 10: 'diez', 11: 'once' };
export const NUM_HY: Record<number, string> = { 1: 'մեկ', 4: 'չորս', 7: 'յոթ', 9: 'ինը', 10: 'տասը', 11: 'տասնմեկ' };

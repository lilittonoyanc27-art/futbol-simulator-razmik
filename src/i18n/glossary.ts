// Glosario palabra a palabra (español → armenio).
// Se usa para mostrar la traducción de palabras sueltas dentro de una frase.
const RAW = `
balón|գնդակ
pelota|գնդակ
portería|դարպաս
portero|դարպասապահ
entrenador|մարզիչ
entrenadora|մարզչուհի
compañero|թիմակից
compañera|թիմակից
compañeros|թիմակիցներ
equipo|թիմ
partido|խաղ, հանդիպում
gol|գոլ
golazo|հիասքանչ գոլ
goles|գոլեր
corre|վազի՛ր
correr|վազել
pasa|փոխանցի՛ր
pasar|փոխանցել
pase|փոխանցում
pases|փոխանցումներ
dispara|հարվածի՛ր
disparar|հարվածել
tiro|հարված
salta|ցատկի՛ր
saltar|ցատկել
defiende|պաշտպանվի՛ր
defender|պաշտպանել
rápido|արագ
despacio|դանդաղ
derecha|աջ
izquierda|ձախ
campo|դաշտ
banda|եզր
área|տուգանային հրապարակ
círculo|շրջան
central|կենտրոնական
córner|անկյունային
árbitro|մրցավար
falta|խախտում
penalti|11 մետրանոց
silbato|սուլիչ
camiseta|մարզաշապիկ
botas|խաղակոշիկներ
guantes|ձեռնոցներ
cono|կոն
conos|կոներ
bandera|դրոշ
banderín|դրոշակ
botella|շիշ
agua|ջուր
estadio|մարզադաշտ
afición|երկրպագուներ
ganar|հաղթել
ganamos|հաղթեցինք
perder|պարտվել
perdimos|պարտվեցինք
empatar|ոչ-ոքի խաղալ
entrenamiento|մարզում
ahora|հիմա
muy|շատ
bien|լավ
buen|լավ
buena|լավ
trabajo|աշխատանք
libre|ազատ
cuidado|զգույշ
hacia|դեպի
el|-ը (որոշյալ հոդ)
la|-ը (որոշյալ հոդ)
los|-ները
las|-ները
un|մի
una|մի
y|և
o|կամ
a|դեպի, -ին
de|-ի, -ից
del|-ի
al|դեպի, -ին
con|-ով, հետ
sin|առանց
por|-ով, համար
para|համար
en|-ում
tu|քո
mi|իմ
su|նրա
yo|ես
tú|դու
él|նա
ella|նա
nosotros|մենք
vosotros|դուք
ellos|նրանք
es|է
está|է (գտնվում է)
estás|ես
estoy|եմ
soy|եմ
eres|ես
somos|ենք
listo|պատրաստ
lista|պատրաստ
jugar|խաղալ
juega|խաղա՛
jugamos|խաղում ենք
jugador|խաղացող
jugadores|խաղացողներ
número|համար
más|ավելի
menos|պակաս
muy|շատ
qué|ինչ
quién|ով
dónde|որտեղ
cuándo|երբ
cómo|ինչպես
por qué|ինչու
porque|որովհետև
cuánto|որքան
hola|բարև
adiós|ցտեսություն
gracias|շնորհակալություն
por favor|խնդրում եմ
sí|այո
no|ոչ
vamos|գնանք, առա՛ջ
ánimo|քաջություն, առա՛ջ
marca|պահի՛ր, խփի՛ր
delantero|հարձակվող
defensa|պաշտպան
centrocampista|կիսապաշտպան
capitán|ավագ
pierdas|կորցնես
mira|նայի՛ր
escucha|լսի՛ր
habla|խոսի՛ր
ven|արի՛
aquí|այստեղ
allí|այնտեղ
primero|սկզբում, առաջին
después|հետո
luego|հետո
antes|առաջ, նախքան
cuando|երբ
si|եթե
también|նույնպես
siempre|միշտ
nunca|երբեք
hoy|այսօր
mañana|վաղը
ayer|երեկ
semana|շաբաթ
tiempo|ժամանակ
minuto|րոպե
minutos|րոպեներ
segundo|վայրկյան
grande|մեծ
pequeño|փոքր
nuevo|նոր
nueva|նոր
contrario|մրցակից
contraria|մրցակից
rival|մրցակից
tienes|ունես
tener|ունենալ
tengo|ունեմ
tienes que|պետք է
quiero|ուզում եմ
quieres|ուզում ես
puedo|կարող եմ
puedes|կարող ես
voy|գնում եմ
vas|գնում ես
va|գնում է
voy a|պատրաստվում եմ
hacer|անել
hice|արեցի
he|(օժանդակ բայ)
has|(օժանդակ բայ)
hemos|(օժանդակ բայ)
jugado|խաղացել
ganado|հաղթել
marcado|խփել
entrenado|մարզվել
cansado|հոգնած
contento|ուրախ
triste|տխուր
feliz|երջանիկ
fuerte|ուժեղ
lejos|հեռու
cerca|մոտ
detrás|ետևում
delante|առջևում
centro|կենտրոն
línea|գիծ
palo|ձող
largo|երկար, հեռու
corto|կարճ, մոտ
alto|բարձր
bajo|ցածր
cabeza|գլուխ
pie|ոտք
pierna|ոտք
mano|ձեռք
regatea|խաբի՛ր, դրիբլինգ արա՛
regate|դրիբլինգ
toca|դիպչի՛ր
lleva|տա՛ր
busca|փնտրի՛ր
espera|սպասի՛ր
para|կանգնեցրո՛ւ
devuelve|վերադարձրո՛ւ
autobús|ավտոբուս
vestuario|հանդերձարան
academia|ակադեմիա
periodista|լրագրող
entrada|տոմս, մուտք
entradas|տոմսեր
tienda|խանութ
precio|գին
euros|եվրո
cuesta|արժե
torneo|մրցաշար
final|եզրափակիչ
semifinal|կիսաեզրափակիչ
copa|գավաթ
victoria|հաղթանակ
derrota|պարտություն
empate|ոչ-ոքի
`;

export const GLOSSARY: Record<string, string> = {};
for (const line of RAW.split('\n')) {
  const [es, hy] = line.split('|');
  if (es && hy) GLOSSARY[es.trim().toLowerCase()] = hy.trim();
}

export function normalizeWord(w: string): string {
  return w
    .toLowerCase()
    .replace(/[¡!¿?.,;:«»"()…—–-]/g, '')
    .trim();
}

export function glossWords(sentence: string): { word: string; hy?: string }[] {
  const words = sentence.split(/\s+/).filter(Boolean);
  return words.map((w) => ({ word: w, hy: GLOSSARY[normalizeWord(w)] }));
}

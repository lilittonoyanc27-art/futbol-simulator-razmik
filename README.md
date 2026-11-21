# FÚTBOL HABLA — RAZMIK #7

Juego de fútbol 3D en el navegador para aprender español (interfaz en español, traducción al armenio al tocar).

## Tecnologías
React 18 · TypeScript · Vite · Three.js · React Three Fiber · Rapier (física) · Zustand (progreso guardado en `localStorage`).
Todos los modelos, texturas y sonidos se generan por código (sin recursos con licencia externa). La voz usa la Web Speech API del navegador.

## Modos
- **Entrenamiento** (A1–B2): un entrenador 3D da órdenes en español; las tareas se comprueban con eventos reales del motor (pases a un dorsal concreto, zonas del campo, disparos, saltos, decir una frase con el micrófono…). También tanda de penaltis y tiros libres.
- **Partido**: 5 contra 5 con IA, porteros, faltas, penaltis, tiros libres, saques, marcador y reloj. Compañeros y entrenador gritan órdenes (`¡Estoy libre!`, `¡Por la derecha!`, `¡Marca al delantero!`…); cumplirlas da bonus sin parar el juego. «Momentos clave» con órdenes concretas.
- **Conversaciones**: 10 escenas 3D con respuesta por clic o por voz.
- **Misiones**: 9 misiones que encadenan entrenamiento, partidos, diálogos, penaltis y minijuegos (incluido el gran torneo).
- **Minijuegos**: Memory, escuchar al entrenador, ordenar frases, preguntas rápidas, réplicas, «¿Qué harías?», carrera de comprensión, búsqueda de objetos en un campo 3D.
- **Aprender**: vocabulario, escucha, habla, gramática (presente, imperativo, tener que, querer/poder, ir a, perfecto, indefinido, imperfecto, futuro, condicional/subjuntivo).
- **Progreso**: XP, niveles, logros, camisetas, estadios, estadísticas, botón *Reiniciar progreso* con confirmación.

## Controles
Teclado: WASD/flechas mover · J pase/entrada · K (mantener) tiro · Shift correr · Espacio saltar · Esc pausa.
Táctil: joystick + botones Tiro / Pase / Correr / Saltar. En penaltis y tiros libres: flechas o joystick para apuntar, mantener Tiro para la potencia.

Mantén pulsado cualquier botón (o activa 🇦🇲 *Modo traducción*) para ver su traducción armenia.

## Desarrollo
```bash
npm install
npm run dev
npm run build          # comprobación de tipos + build de producción
npm run check:content  # verifica que toda frase tenga traducción armenia
```

## Publicación en Vercel
Importa el repositorio en Vercel: `vercel.json` ya define `npm run build` y la carpeta `dist`.

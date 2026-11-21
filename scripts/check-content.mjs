// Comprueba que cada frase p('español', 'armenio') tiene traducción armenia.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(p)) files.push(p);
  }
};
walk('src');

const ARM = /[Ա-֏]/;
const re = /\bp\(\s*(['`])((?:\\.|(?!\1).)*)\1\s*,\s*(['`])((?:\\.|(?!\3).)*)\3\s*\)/gs;
let total = 0;
const problems = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(re)) {
    total++;
    const [, , es, , hy] = m;
    if (!es.trim()) problems.push(`${f}: frase española vacía`);
    if (!hy.trim() || !ARM.test(hy)) problems.push(`${f}: falta traducción armenia para «${es}»`);
  }
}
console.log(`Frases comprobadas: ${total}`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: todas las frases tienen traducción armenia.');

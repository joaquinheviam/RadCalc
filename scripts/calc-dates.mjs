// Genera src/criteria/lastUpdated.js: para cada calculadora, la fecha del
// último commit que modificó su contenido. Se muestra como "Última
// actualización" en la sección "Criterios y referencias".
//
// Qué cuenta como "modificar la calculadora" (se toma la fecha más reciente):
//   - su componente (src/calculators/<Nombre>.jsx, según registry.js),
//   - su módulo de lógica (src/calculators/logic/<id>.js), si existe,
//   - su bloque calc.<id> en strings.es.js y strings.en.js,
//   - su bloque REFERENCES.<id> en references.js.
// Los bloques se siguen con `git log -L` (solo cuentan los commits que
// tocaron esas líneas, no el resto del archivo compartido).
//
// Se ignoran los commits cuyo mensaje contiene [sin-cambio-clinico]
// (refactorizaciones que no cambian el contenido, p. ej. extraer la lógica).
//
// Si el repositorio es un clon superficial (como en el build de Vercel), el
// historial no es confiable: no se regenera y se usa el archivo ya commiteado.
// Si para alguna calculadora no se puede obtener la fecha, se deja en null
// y la sección la omite (queda en la lista de pendientes).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'src', 'criteria', 'lastUpdated.js');
const IGNORE_MARK = '[sin-cambio-clinico]';

const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

try {
  if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
    console.log('calc-dates: clon superficial, se usa src/criteria/lastUpdated.js tal como está.');
    process.exit(0);
  }
} catch {
  console.log('calc-dates: sin git disponible, se usa src/criteria/lastUpdated.js tal como está.');
  process.exit(0);
}

// id -> archivo del componente, leído de registry.js.
const registry = readFileSync(join(root, 'src', 'calculators', 'registry.js'), 'utf8');
const fileOf = {};
for (const [, name, file] of registry.matchAll(/const (\w+) = lazy\(\(\) => import\('\.\/([\w.]+)'\)\)/g)) fileOf[name] = file;
const entries = [...registry.matchAll(/\{ id: '(\w+)', catKey: '\w+', component: (\w+) \}/g)].map(([, id, comp]) => ({ id, file: fileOf[comp] }));

const newestDate = (lines) => lines.split('\n').filter((l) => l.startsWith('DATE:')).map((l) => l.slice(5).trim()).sort().pop() || null;

function fileDate(paths) {
  const out = git(['log', '-1', '-F', `--grep=${IGNORE_MARK}`, '--invert-grep', '--format=DATE:%cs', '--', ...paths]);
  return newestDate(out);
}

function blockDate(file, startRe, endRe) {
  const out = git(['log', '-F', `--grep=${IGNORE_MARK}`, '--invert-grep', '--format=DATE:%cs', '-L', `/${startRe}/,/${endRe}/:${file}`]);
  return newestDate(out);
}

const result = {};
const problems = [];
for (const { id, file } of entries) {
  const dates = [];
  try {
    if (!file) throw new Error('componente no encontrado en registry.js');
    const paths = [`src/calculators/${file}`];
    if (existsSync(join(root, 'src', 'calculators', 'logic', `${id}.js`))) paths.push(`src/calculators/logic/${id}.js`);
    dates.push(fileDate(paths));
    dates.push(blockDate('src/i18n/strings.es.js', `^    ${id}: {`, '^    },'));
    dates.push(blockDate('src/i18n/strings.en.js', `^    ${id}: {`, '^    },'));
    if (new RegExp(`^  ${id}: \\[`, 'm').test(readFileSync(join(root, 'src', 'i18n', 'references.js'), 'utf8'))) {
      dates.push(blockDate('src/i18n/references.js', `^  ${id}: \\[`, '^  \\],'));
    }
    const valid = dates.filter(Boolean);
    if (valid.length === 0) throw new Error('sin commits que cuenten');
    result[id] = valid.sort().pop();
  } catch (e) {
    result[id] = null;
    problems.push(`${id}: ${String(e.message).split('\n')[0]}`);
  }
}

const json = '// Generado por scripts/calc-dates.mjs (corre en `npm run build`). No editar a mano.\n'
  + `export const LAST_UPDATED = ${JSON.stringify(result, null, 2)};\n`;
const prev = existsSync(outPath) ? readFileSync(outPath, 'utf8') : '';
if (json !== prev) writeFileSync(outPath, json);
console.log(`calc-dates: ${Object.values(result).filter(Boolean).length} de ${entries.length} calculadoras con fecha${json !== prev ? ' (actualizado)' : ''}.`);
if (problems.length) console.log(`calc-dates: sin fecha fiable -> ${problems.join('; ')}`);

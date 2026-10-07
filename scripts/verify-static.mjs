// Verifica, sin ejecutar JavaScript (solo descarga el HTML, como lo haría un
// lector tipo Microsoft 365 Copilot), que cada página de calculadora traiga
// la sección "Criterios y referencias" completa, y que la portada, el
// sitemap y /llms.txt enlacen todas las calculadoras.
//
// Uso:
//   npx vite preview --port 4173            (en otra terminal, tras npm run build)
//   node scripts/verify-static.mjs [baseUrl] [--ids tirads,lirads,lungNodule] [--md archivo.md]
//
// Sin --ids se exigen todas las calculadoras del registro; con --ids solo
// esas cuentan para el código de salida (la tabla muestra todas igual).
// Sale con código 1 si falta cualquier elemento requerido.
import { writeFileSync } from 'node:fs';
import { calculators } from '../src/calculators/registry.js';
import { STRINGS } from '../src/i18n/strings.js';
import { TIRADS_POINTS } from '../src/calculators/logic/tirads.js';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const base = (args.find((a) => /^https?:/.test(a)) || 'http://localhost:4173').replace(/\/$/, '');
const required = flag('--ids') ? flag('--ids').split(',') : calculators.map((c) => c.id);
const mdOut = flag('--md');
const LANGS = ['es', 'en'];
const SITE = 'https://radiocalc.app';

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const textOf = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

async function get(path) {
  const res = await fetch(base + path, { headers: { 'User-Agent': 'radiocalc-verify-static' } });
  return { status: res.status, body: await res.text() };
}

// Elementos requeridos: [clave, rótulo, función que devuelve true si está].
const CHECKS = [
  ['section', 'sección', (h) => /<section data-criteria-section/.test(h)],
  ['system', 'sistema', (h) => field(h, 'system')],
  ['version', 'versión', (h) => field(h, 'version')],
  ['organization', 'organismo', (h) => field(h, 'organization')],
  ['scope', 'a quién aplica', (h) => part(h, 'scope').length > 20],
  ['exclusions', 'exclusiones', (h) => /data-criteria="scope" data-exclusions="stated"/.test(h)],
  ['variables', 'variables', (h) => /<table/.test(partHtml(h, 'variables')) && part(h, 'variables').length > 20],
  ['rules', 'reglas', (h) => part(h, 'rules').length > 20],
  ['results', 'resultados', (h) => part(h, 'results').length > 5],
  ['references', 'referencias', (h) => /<li/.test(partHtml(h, 'references'))],
  ['updated', 'fecha', (h) => /<dd data-criteria="updated"><time datetime="\d{4}-\d{2}-\d{2}">/.test(h)],
];
function field(html, key) {
  const m = html.match(new RegExp(`<dd data-criteria="${key}">([\\s\\S]*?)</dd>`));
  return Boolean(m && textOf(m[1]));
}
function partHtml(html, key) {
  const m = html.match(new RegExp(`<section data-criteria="${key}"[^>]*>([\\s\\S]*?)</section>`));
  return m ? m[1] : '';
}
const part = (html, key) => textOf(partHtml(html, key));

async function main() {
  // Una vista previa de Vercel con Deployment Protection redirige al login:
  // avisar en vez de reportar todo como faltante.
  const probe = await fetch(`${base}/es/`, { redirect: 'manual' });
  if (probe.status >= 300 && probe.status < 400 || probe.status === 401) {
    console.error(`${base} responde ${probe.status} (¿protegido con login de Vercel?). Un lector sin sesión no puede verlo; verifica contra localhost (vite preview) o una URL pública.`);
    process.exit(2);
  }
  const rows = [];
  let failed = false;
  const problems = [];

  for (const cc of calculators) {
    const row = { id: cc.id, required: required.includes(cc.id), langs: {} };
    for (const lang of LANGS) {
      const { status, body } = await get(`/${lang}/calc/${cc.id}/`);
      const missing = status !== 200 ? ['HTTP ' + status] : CHECKS.filter(([, , ok]) => !ok(body)).map(([, label]) => label);
      row.langs[lang] = missing;
      if (row.required && missing.length) failed = true;
    }
    rows.push(row);
  }

  // Portada: enlaces <a href> reales a todas las calculadoras.
  for (const lang of LANGS) {
    const { body } = await get(`/${lang}/`);
    const missing = calculators.filter((cc) => !body.includes(`<a href="${SITE}/${lang}/calc/${cc.id}/"`));
    if (missing.length) { failed = true; problems.push(`Portada /${lang}/ sin enlace a: ${missing.map((m) => m.id).join(', ')}`); }
  }
  // Sitemap y llms.txt.
  const sitemap = (await get('/sitemap.xml')).body;
  const llms = await get('/llms.txt');
  for (const lang of LANGS) for (const cc of calculators) {
    const url = `${SITE}/${lang}/calc/${cc.id}/`;
    if (!sitemap.includes(`<loc>${url}</loc>`)) { failed = true; problems.push(`sitemap.xml sin ${url}`); }
    if (llms.status !== 200 || !llms.body.includes(url)) { failed = true; problems.push(`llms.txt sin ${url}`); }
  }

  // Prueba de aceptación TI-RADS: puntos de composición y ecogenicidad, y
  // umbrales de tamaño por categoría TR, legibles en el texto sin JS.
  for (const lang of LANGS) {
    const text = textOf((await get(`/${lang}/calc/tirads/`)).body);
    const c = STRINGS[lang].calc.tirads;
    for (const key of ['composition', 'echogenicity']) {
      c.criteria[key].options.forEach((opt, i) => {
        if (!text.includes(`${c.criteria[key].title} ${opt} ${TIRADS_POINTS[key][i]}`)) {
          failed = true; problems.push(`Aceptación TI-RADS /${lang}/: no se lee "${opt}" = ${TIRADS_POINTS[key][i]} puntos`);
        }
      });
    }
    // Fila de la categoría: "TR3 <puntaje> <riesgo> <PAAF> <seguimiento>".
    c.managementRows.forEach((row) => {
      const found = text.split(`${row[0]} `).slice(1).some((after) => after.slice(0, 150).includes(`${row[2]} ${row[3]} ${row[4]}`));
      if (!found) { failed = true; problems.push(`Aceptación TI-RADS /${lang}/: no se leen los umbrales de ${row[0]} (${row[3]} / ${row[4]})`); }
    });
  }

  // Tabla de resultados.
  const mark = (m) => (!m.length ? 'OK' : m.includes('sección') ? 'sin sección' : `falta: ${m.join(', ')}`);
  const lines = [
    '| Calculadora | Exigida | ES | EN |',
    '|---|---|---|---|',
    ...rows.map((r) => `| ${r.id} | ${r.required ? 'sí' : 'no'} | ${mark(r.langs.es)} | ${mark(r.langs.en)} |`),
  ];
  const complete = rows.filter((r) => !r.langs.es.length && !r.langs.en.length).map((r) => r.id);
  const summary = [
    '',
    `Completas (ES y EN): ${complete.length} de ${rows.length}${complete.length ? ` -> ${complete.join(', ')}` : ''}`,
    problems.length ? `\nOtros problemas:\n- ${problems.join('\n- ')}` : 'Portada, sitemap.xml, llms.txt y prueba de aceptación TI-RADS: OK',
    '',
    failed ? 'RESULTADO: FALLA' : 'RESULTADO: OK',
  ];
  const out = [...lines, ...summary].join('\n');
  console.log(out);
  if (mdOut) writeFileSync(mdOut, out + '\n');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });

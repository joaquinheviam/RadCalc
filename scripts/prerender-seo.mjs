// Genera, para cada ruta de calculadora, un dist/<lang>/[calc/<id>/]index.html
// propio con su <title>, <meta description>, canonical y hreflang ya escritos
// en el HTML estático (no agregados después por JavaScript como hace
// updateSeoHead() en el cliente). Esto es necesario porque un rastreador que
// no ejecute JS (o que lo haga en una segunda pasada tardía) de otro modo solo
// ve el HTML genérico de dist/index.html para las 66 rutas del sitio, lo cual
// puede hacer que Google trate cada calculadora como duplicado de la portada.
//
// La lógica de título/descripción/canonical/hreflang replica exactamente la
// de src/utils/seoHead.js (updateSeoHead) para que el <head> prerenderizado
// coincida con el que el cliente vuelve a escribir al hidratar — así no hay
// "flash" de metadatos distintos ni inconsistencia entre lo que ve el
// buscador y lo que ve un usuario real.
//
// Corre como parte de "postbuild" (después de "vite build"), leyendo
// dist/index.html ya con los hashes de assets inyectados por Vite, y
// clonándolo para cada ruta con el <head> reemplazado. El <body> y los
// <script>/<link> de assets quedan intactos, así que React Router hidrata
// normalmente y la navegación cliente-a-cliente no cambia en nada.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { calculators, categoryOrder } from '../src/calculators/registry.js';
import { STRINGS } from '../src/i18n/strings.js';
import { calcMetaDescription } from '../src/utils/calcMetaDescription.js';
import { CRITERIA_BUILDERS, renderCriteriaHtml } from '../src/criteria/index.js';
import { CRITERIA_META } from '../src/criteria/meta.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const SEO_BASE_URL = 'https://radiocalc.app';
const LANGS = ['es', 'en'];

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildHead(html, { lang, title, description, pathSuffix }) {
  const buildUrl = (l) => `${SEO_BASE_URL}/${l}/${pathSuffix}`;
  const urlEs = buildUrl('es');
  const urlEn = buildUrl('en');
  const canonical = lang === 'en' ? urlEn : urlEs;
  const t = escapeAttr(title);
  const d = escapeAttr(description);

  let out = html;
  out = out.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${d}">`);
  out = out.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapeAttr(canonical)}">`);
  out = out.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapeAttr(canonical)}">`);
  out = out.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${t}">`);
  out = out.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${d}">`);
  out = out.replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'es_CL'}">`);

  const hreflangTags =
    `  <link rel="alternate" href="${escapeAttr(urlEs)}" hreflang="es">\n` +
    `  <link rel="alternate" href="${escapeAttr(urlEn)}" hreflang="en">\n` +
    `  <link rel="alternate" href="${escapeAttr(urlEs)}" hreflang="x-default">\n`;
  out = out.replace('</head>', `\n${hreflangTags}</head>`);

  // Enlaces reales (<a href>) a la portada y a todas las calculadoras del
  // idioma de esta página, dentro de <noscript>. El <body> servido es, si
  // no, solo `<div id="root"></div>` — React recién arma la navegación real
  // al hidratar en el cliente. Un rastreador que lea el HTML tal cual llega
  // del servidor (sin ejecutar JS, o en su primera pasada antes de la
  // segunda pasada de renderizado) no encuentra ningún enlace interno entre
  // páginas, aunque el sitemap ya las liste todas — probablemente reduce la
  // prioridad de rastreo que Google les asigna. <noscript> es la forma
  // estándar de exponer una versión sin JS sin que además quede visible por
  // duplicado para usuarios reales (los navegadores nunca la muestran si JS
  // está activo) ni interfiera con la hidratación (React solo toca #root).
  const navItems = [
    `<a href="${escapeAttr(`${SEO_BASE_URL}/${lang}/`)}">${escapeAttr(STRINGS[lang].appName)}</a>`,
  ];
  for (const cc of calculators) {
    const entry = STRINGS[lang].calc[cc.id];
    const url = `${SEO_BASE_URL}/${lang}/calc/${cc.id}/`;
    navItems.push(`<a href="${escapeAttr(url)}">${escapeAttr(entry.title)}</a>`);
  }
  const noscriptNav = `\n  <noscript>\n    <nav>\n      ${navItems.join('\n      ')}\n    </nav>\n  </noscript>\n`;
  out = out.replace('<div id="root"></div>', `<div id="root"></div>${noscriptNav}`);

  return out;
}

function escapeText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Contenido de referencia de la calculadora dentro de #root: título, subtítulo
// y la sección "Criterios y referencias" (src/criteria), legibles sin
// JavaScript. Al cargar, React reemplaza #root por la app, que vuelve a
// mostrar la misma sección (CriteriaReferences.jsx, mismo renderer) al pie de
// la calculadora: no es contenido solo para bots. Antes de que cargue el JS
// puede verse un instante (solo en la primera visita: después el service
// worker sirve la app desde index.html).
function withCriteria(html, lang, id) {
  const build = CRITERIA_BUILDERS[id];
  if (!build) return html;
  const t = STRINGS[lang];
  const c = t.calc[id];
  const body = `<div class="mx-auto p-4 max-w-md space-y-4">`
    + `<h1 class="text-lg font-bold text-slate-800 dark:text-slate-100">${escapeText(c.title)}</h1>`
    + `<p class="text-sm text-slate-500 dark:text-slate-400">${escapeText(c.subtitle)}</p>`
    + renderCriteriaHtml(build(t), t.criteria)
    + `</div>`;
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

function writeRoute(relDir, html) {
  const outDir = join(distDir, relDir);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
}

let count = 0;
for (const lang of LANGS) {
  const t = STRINGS[lang];

  // Portada de cada idioma: /<lang>/
  writeRoute(lang, buildHead(template, {
    lang,
    title: `${t.appName} — ${t.tagline}`,
    description: t.metaDescription,
    pathSuffix: '',
  }));
  count++;

  // Cada calculadora: /<lang>/calc/<id>/ (con barra final, ver App.jsx)
  for (const cc of calculators) {
    const entry = t.calc[cc.id];
    writeRoute(`${lang}/calc/${cc.id}`, withCriteria(buildHead(template, {
      lang,
      title: `${entry.title} | RadioCalc Clinical`,
      description: calcMetaDescription(entry, t),
      pathSuffix: `calc/${cc.id}/`,
    }), lang, cc.id));
    count++;
  }
}

console.log(`prerender-seo: generadas ${count} páginas HTML con metadatos propios (${LANGS.length} idiomas x ${calculators.length + 1} rutas).`);
console.log(`prerender-seo: sección "Criterios y referencias" en ${Object.keys(CRITERIA_BUILDERS).length} calculadoras (${Object.keys(CRITERIA_BUILDERS).join(', ')}).`);

// /llms.txt: índice en texto plano para asistentes y agentes (formato
// llmstxt.org): cada calculadora con su URL en ambos idiomas y, si ya tiene
// ficha, sistema y versión. Público como cualquier otro archivo del sitio.
const es = STRINGS.es, en = STRINGS.en;
const llms = [
  '# RadioCalc Clinical',
  '',
  `> ${es.metaDescription}`,
  '',
  `${en.metaDescription}`,
  '',
  'Cada página de calculadora está en español (/es/) e inglés (/en/). Las marcadas con "criterios en texto" incluyen en el HTML, sin necesidad de JavaScript, la sección "Criterios y referencias": sistema, versión, organismo, a quién aplica, variables, reglas completas, resultados posibles, referencias y fecha de última actualización.',
  'Pages marked "criteria in text" include, in the HTML and without JavaScript, the "Criteria and references" section.',
  '',
];
for (const catKey of categoryOrder) {
  const items = calculators.filter((cc) => cc.catKey === catKey);
  if (!items.length) continue;
  llms.push(`## ${es.categories[catKey]} / ${en.categories[catKey]}`, '');
  for (const cc of items) {
    const meta = CRITERIA_META[cc.id];
    const extra = CRITERIA_BUILDERS[cc.id] && meta ? ` — ${meta.system}, ${meta.version} — criterios en texto / criteria in text` : '';
    llms.push(`- [${es.calc[cc.id].title}](${SEO_BASE_URL}/es/calc/${cc.id}/) · [${en.calc[cc.id].title}](${SEO_BASE_URL}/en/calc/${cc.id}/)${extra}`);
  }
  llms.push('');
}
writeFileSync(join(distDir, 'llms.txt'), llms.join('\n'));
console.log(`prerender-seo: dist/llms.txt con ${calculators.length} calculadoras.`);

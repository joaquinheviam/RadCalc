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
import { calculators } from '../src/calculators/registry.js';
import { STRINGS } from '../src/i18n/strings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const SEO_BASE_URL = 'https://rad-calc.vercel.app';
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

  return out;
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
    description: t.tagline,
    pathSuffix: '',
  }));
  count++;

  // Cada calculadora: /<lang>/calc/<id>/ (con barra final, ver App.jsx)
  for (const cc of calculators) {
    const entry = t.calc[cc.id];
    writeRoute(`${lang}/calc/${cc.id}`, buildHead(template, {
      lang,
      title: `${entry.title} | RadioCalc Clinical`,
      description: entry.subtitle || t.tagline,
      pathSuffix: `calc/${cc.id}/`,
    }));
    count++;
  }
}

console.log(`prerender-seo: generadas ${count} páginas HTML con metadatos propios (${LANGS.length} idiomas x ${calculators.length + 1} rutas).`);

// Genera public/sitemap.xml a partir del registro de calculadoras, con una
// URL por idioma x calculadora + la portada de cada idioma. Se corre solo
// (antes de "vite build", como script "prebuild" de npm) para que quede
// siempre sincronizado cuando se agregue o quite una calculadora, sin tener
// que acordarse de actualizarlo a mano.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { calculators } from '../src/calculators/registry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://rad-calc.vercel.app';
const LANGS = ['es', 'en'];

const urls = [];
for (const lang of LANGS) {
  urls.push(`${BASE_URL}/${lang}/`);
  for (const cc of calculators) {
    urls.push(`${BASE_URL}/${lang}/calc/${cc.id}`);
  }
}

const body = urls
  .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n  </url>`)
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

const outPath = join(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(outPath, xml);
console.log(`sitemap.xml generado con ${urls.length} URLs (${LANGS.length} idiomas x ${calculators.length} calculadoras + portada de cada idioma).`);

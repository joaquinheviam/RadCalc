// Copia dist/index.html a dist/404.html después de "vite build". Es el
// truco estándar para que un SPA con rutas del lado del cliente funcione en
// GitHub Pages: al no existir un archivo real para, por ejemplo,
// /RadCalc/es/calc/tirads, GitHub Pages sirve el contenido de 404.html (con
// status 404) mientras la barra de direcciones conserva la URL original;
// React Router arranca desde ahí y muestra la ruta correcta igual.
// En Vercel esto no hace falta (vercel.json ya define el rewrite a
// index.html), pero tenerlo de más no daña nada.
import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const src = join(distDir, 'index.html');
const dest = join(distDir, '404.html');

if (existsSync(src)) {
  copyFileSync(src, dest);
  console.log('postbuild: dist/404.html generado a partir de dist/index.html (fallback SPA para GitHub Pages).');
} else {
  console.warn('postbuild: no se encontró dist/index.html; se omite la generación de 404.html.');
}

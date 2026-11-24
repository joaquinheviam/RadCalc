// Compila la versión para intranet y la deja en un ZIP listo para entregar:
//   npm run build:intranet  ->  dist-intranet/radiocalc-intranet-<fecha>-<commit>.zip
// Diferencias con el sitio público: rutas relativas y con # (funciona en
// cualquier carpeta, sin reglas de reescritura), sin analítica, sin service
// worker y sin donaciones en línea. Ver docs/INTRANET.md.
// No corre "prebuild": no toca public/sitemap.xml ni src/criteria/lastUpdated.js.
import { execFileSync } from 'node:child_process';
import { copyFileSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = join(root, 'dist-intranet');
const out = join(outRoot, 'radiocalc');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

const date = git('log', '-1', '--format=%cs');
const commit = git('rev-parse', '--short=7', 'HEAD') + (git('status', '--porcelain') ? '-modificado' : '');
const version = `${date} (${commit})`;

rmSync(outRoot, { recursive: true, force: true });
process.env.VITE_INTRANET = '1';
process.env.VITE_INTRANET_VERSION = version;
const { build } = await import('vite');
await build({ root, configFile: join(root, 'vite.config.js'), logLevel: 'warn' });

// Archivos de public/ que solo sirven al sitio público.
for (const name of readdirSync(out)) {
  if (/^(ga-init\.js|sitemap\.xml|robots\.txt|og-image\.png|screenshots|google.*\.html)$/.test(name)) {
    rmSync(join(out, name), { recursive: true });
  }
}

// Control: la copia no debe cargar analítica, service worker ni pagos.
const forbidden = /googletagmanager|google-analytics|_vercel\/insights|va\.vercel-scripts|paypal\.com|link\.mercadopago|serviceWorker\.register/;
for (const rel of readdirSync(out, { recursive: true })) {
  if (!/\.(js|html|css)$/.test(rel)) continue;
  const hit = readFileSync(join(out, rel), 'utf8').match(forbidden);
  if (hit) throw new Error(`build-intranet: ${rel} contiene "${hit[0]}"`);
}
if (!existsSync(join(out, 'index.html'))) throw new Error('build-intranet: falta index.html');

const zip = `radiocalc-intranet-${date}-${commit}.zip`;
copyFileSync(join(root, 'docs', 'INTRANET.md'), join(outRoot, 'LEEME.txt'));
copyFileSync(join(root, 'LICENSE'), join(out, 'LICENSE.txt'));
writeFileSync(join(out, 'version.txt'), `RadioCalc Clinical, versión intranet ${version}\n`);
if (process.platform === 'win32') {
  // bsdtar de Windows: escribe rutas con "/" (Compress-Archive no siempre).
  execFileSync(join(process.env.SystemRoot, 'System32', 'tar.exe'), ['-a', '-c', '-f', zip, 'LEEME.txt', 'radiocalc'], { cwd: outRoot });
} else {
  execFileSync('zip', ['-qr', zip, 'LEEME.txt', 'radiocalc'], { cwd: outRoot });
}
console.log(`build-intranet: dist-intranet/${zip}`);

// Carga Playwright sin que sea dependencia del proyecto (no está en
// package.json a propósito). Busca, en orden:
//   1. PLAYWRIGHT_MODULE (ruta a .../playwright/index.mjs), si está definida.
//   2. Una instalación local (node_modules/playwright), si existiera.
//   3. La instalación global de npm (`npm i -g playwright`), que es como está
//      en la nube (/opt/node22/lib/node_modules/playwright) y en el PC.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadPlaywright() {
  const candidates = [];
  if (process.env.PLAYWRIGHT_MODULE) candidates.push(process.env.PLAYWRIGHT_MODULE);
  try {
    return await import('playwright');
  } catch { /* no hay instalación local */ }
  try {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    candidates.push(join(globalRoot, 'playwright', 'index.mjs'));
  } catch { /* npm no disponible */ }
  candidates.push('/opt/node22/lib/node_modules/playwright/index.mjs');
  for (const p of candidates) {
    if (existsSync(p)) return import(pathToFileURL(p).href);
  }
  throw new Error('No se encontró Playwright. Instálalo de forma global: npm i -g playwright && npx playwright install chromium');
}

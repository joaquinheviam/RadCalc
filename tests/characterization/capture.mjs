// Pruebas de caracterización por interfaz (Playwright): recorre muchas
// combinaciones de entradas de cada calculadora tal como lo haría un usuario
// (clics y campos), y guarda lo que la página muestra para cada una. Se graba
// una vez sobre el código de antes de un cambio ("golden") y se repite
// después: si algo difiere, el cambio alteró el comportamiento.
//
// Uso (con `npx vite preview --port 4173` corriendo sobre un build):
//   node tests/characterization/capture.mjs [baseUrl] [--out archivo.json] [--only tirads,lirads]
//   node tests/characterization/capture.mjs --compare tests/characterization/golden.json
//
// Para cada estado se guarda:
//   - sticky: texto del panel de resultado fijo (StickyBar), o null.
//   - report: texto de "Ver informe" (getReportText), o null.
//   - mainHash: hash del texto completo de <main>, sin la sección
//     "Criterios y referencias" (data-criteria-section), que es la única
//     parte nueva permitida.
import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadPlaywright } from '../lib/playwright.mjs';
import { STRINGS } from '../../src/i18n/strings.js';
import { IN_PAGE, CALCS, LANG } from './scenarios.mjs';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const baseUrl = (args.find((a) => /^https?:/.test(a)) || 'http://localhost:4173').replace(/\/$/, '');
const outFile = flag('--out');
const compareFile = flag('--compare');
const only = flag('--only') ? flag('--only').split(',') : null;
const t = STRINGS[LANG];

const sha = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16);


async function main() {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, serviceWorkers: 'block' });
  const result = {};
  for (const [id, { build, resetBetween }] of Object.entries(CALCS)) {
    if (only && !only.includes(id)) continue;
    const url = `${baseUrl}/${LANG}/calc/${id}/`;
    const title = t.calc[id].title;
    const scenarios = build();
    result[id] = {};
    let loaded = false;
    for (const sc of scenarios) {
      if (!resetBetween || !loaded) {
        await page.goto(url, { waitUntil: 'load' });
        await page.waitForFunction((tt) => document.querySelector('header h1')?.textContent.includes(tt) && document.querySelectorAll('main button').length > 3, title);
        await page.evaluate(IN_PAGE);
        loaded = true;
      }
      const snap = await page.evaluate(async ({ steps, labels, resetBetween }) => {
        const rc = window.__rc;
        if (resetBetween) { document.querySelector('button[aria-label="' + labels.reset + '"]')?.click(); await rc.tick(); }
        for (const [kind, a, b] of steps) {
          if (kind === 'click') rc.click(a, b);
          else rc.fill(a, b);
          await rc.tick();
        }
        return window.__rc.snapshot(labels.reset, labels.preview, labels.close);
      }, { steps: sc.steps, resetBetween, labels: { reset: t.common.reset, preview: t.common.showReport, close: t.common.closeAria } });
      result[id][sc.name] = { sticky: snap.sticky, report: snap.report, mainHash: sha(snap.mainText) };
    }
    console.log(`${id}: ${scenarios.length} estados`);
  }
  await browser.close();

  if (outFile) {
    writeFileSync(outFile, JSON.stringify(result, null, 1) + '\n');
    console.log(`Guardado en ${outFile}`);
  }
  if (compareFile) {
    const golden = JSON.parse(readFileSync(compareFile, 'utf8'));
    let diffs = 0, total = 0;
    for (const id of Object.keys(result)) {
      for (const [name, now] of Object.entries(result[id])) {
        total++;
        const before = golden[id]?.[name];
        if (!before || JSON.stringify(before) !== JSON.stringify(now)) {
          diffs++;
          if (diffs <= 20) console.log(`DIFERENCIA ${id} / ${name}\n  antes:   ${JSON.stringify(before)}\n  después: ${JSON.stringify(now)}`);
        }
      }
    }
    console.log(diffs ? `\n${diffs} de ${total} estados difieren.` : `\nOK: ${total} estados idénticos al golden.`);
    process.exit(diffs ? 1 : 0);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

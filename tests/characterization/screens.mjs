// Comparación visual con Playwright: toma capturas de cada calculadora en
// celular (375 px), en modo claro y oscuro, en su estado inicial y con un
// resultado, y las compara píxel a píxel (PNG idéntico) con las de antes.
//
// La sección "Criterios y referencias" (data-criteria-section) es lo único
// nuevo permitido: en la comparación se oculta, para que todo lo demás deba
// verse exactamente igual. Con --show se toman además capturas con la
// sección visible y abierta, para revisarla.
//
// Uso (con `npx vite preview --port 4173` corriendo):
//   node tests/characterization/screens.mjs [baseUrl] --out <carpeta>
//   node tests/characterization/screens.mjs [baseUrl] --out <carpeta> --compare <carpeta-antes> [--show]
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadPlaywright } from '../lib/playwright.mjs';
import { STRINGS } from '../../src/i18n/strings.js';
import { LANG, openCalc, runSteps } from './scenarios.mjs';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const baseUrl = (args.find((a) => /^https?:/.test(a)) || 'http://localhost:4173').replace(/\/$/, '');
const outDir = flag('--out');
const compareDir = flag('--compare');
const show = args.includes('--show');
if (!outDir) { console.error('Falta --out <carpeta>'); process.exit(2); }
mkdirSync(outDir, { recursive: true });

const t = STRINGS[LANG];
const tc = t.calc;
const STATES = {
  tirads: {
    inicial: [],
    resultado: [
      ['click', tc.tirads.criteria.composition.title, tc.tirads.criteria.composition.options[3]],
      ['click', tc.tirads.criteria.echogenicity.title, tc.tirads.criteria.echogenicity.options[2]],
      ['click', tc.tirads.criteria.echogenicFoci.title, tc.tirads.criteria.echogenicFoci.options[3]],
    ],
  },
  lirads: {
    inicial: [],
    resultado: [
      ['click', tc.lirads.lrTiv, t.common.no], ['click', tc.lirads.lrM, t.common.no],
      ['click', tc.lirads.sizeLabel, tc.lirads.size2], ['click', tc.lirads.apheLabel, t.common.yes],
      ['click', tc.lirads.featuresLabel, tc.lirads.featCapsule],
    ],
  },
  lungNodule: {
    inicial: [],
    resultado: [
      ['click', null, tc.lungNodule.pfnSkip],
      ['fill', tc.lungNodule.sizePh, '7'],
    ],
  },
};

const HIDE_CRITERIA = '[data-criteria-section]{display:none !important}';

async function main() {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  let diffs = 0, total = 0;
  for (const dark of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    await context.addInitScript((d) => { try { localStorage.setItem('radiocalc:darkMode', d ? 'true' : 'false'); } catch { /* sin storage */ } }, dark);
    const page = await context.newPage();
    for (const [id, states] of Object.entries(STATES)) {
      for (const [stateName, steps] of Object.entries(states)) {
        await openCalc(page, baseUrl, id);
        await runSteps(page, steps);
        const style = await page.addStyleTag({ content: HIDE_CRITERIA });
        await page.waitForTimeout(700); // deja terminar las animaciones de entrada
        const name = `${id}-${stateName}-${dark ? 'oscuro' : 'claro'}.png`;
        const png = await page.screenshot({ fullPage: true, animations: 'disabled' });
        writeFileSync(join(outDir, name), png);
        total++;
        if (compareDir) {
          const beforePath = join(compareDir, name);
          const same = existsSync(beforePath) && Buffer.compare(readFileSync(beforePath), png) === 0;
          if (!same) { diffs++; console.log(`DIFERENTE: ${name}`); }
        }
        if (show) {
          await style.evaluate((el) => el.remove());
          await page.evaluate(() => document.querySelectorAll('[data-criteria-section] details').forEach((d) => { d.open = true; }));
          await page.waitForTimeout(200);
          await page.screenshot({ path: join(outDir, `con-seccion-${name}`), fullPage: true, animations: 'disabled' });
        }
      }
    }
    await context.close();
  }
  await browser.close();
  if (compareDir) {
    console.log(diffs ? `${diffs} de ${total} capturas difieren.` : `OK: ${total} capturas idénticas (sin contar la sección nueva).`);
    process.exit(diffs ? 1 : 0);
  }
  console.log(`${total} capturas guardadas en ${outDir}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

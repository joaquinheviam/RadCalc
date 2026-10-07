// Escenarios y utilidades compartidas por capture.mjs y screens.mjs.
import { STRINGS } from '../../src/i18n/strings.js';

export const LANG = 'es';
const t = STRINGS[LANG];

// ---- Código que corre dentro de la página ---------------------------------
// React aplica los cambios de un clic en una microtarea, así que después de
// cada paso se espera un turno (tick) antes de seguir o de leer la página.
export const IN_PAGE = `
window.__rc = {
  clean: (s) => (s || '').replace(/\\s+/g, ' ').trim(),
  // Botón cuyo texto es exactamente "label", dentro del contenedor más chico
  // que también contiene el texto "scope" (o cualquiera si scope es null).
  find(scope, label) {
    // Coincide con el texto completo del botón o con su primer <span>
    // (TI-RADS muestra "+N pt" junto a la etiqueta).
    const btns = [...document.querySelectorAll('main button')].filter((b) =>
      this.clean(b.textContent) === label || this.clean(b.querySelector('span')?.textContent) === label);
    let best = null, bestLen = Infinity;
    for (const b of btns) {
      if (!scope) return b;
      let el = b.parentElement;
      while (el && el.tagName !== 'MAIN') {
        if (this.clean(el.textContent).includes(scope)) {
          const len = el.textContent.length;
          if (len < bestLen) { best = b; bestLen = len; }
          break;
        }
        el = el.parentElement;
      }
    }
    return best;
  },
  click(scope, label) {
    const b = this.find(scope, label);
    if (!b) throw new Error('No encontré el botón "' + label + '" en "' + scope + '"');
    b.click();
  },
  fill(placeholder, value) {
    const input = document.querySelector('main input[placeholder="' + placeholder + '"]');
    if (!input) throw new Error('No encontré el campo ' + placeholder);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  },
  tick: () => new Promise((r) => setTimeout(r, 0)),
  async snapshot(resetLabel, previewLabel, closeLabel) {
    const resetBtn = document.querySelector('button[aria-label="' + resetLabel + '"]');
    const bar = resetBtn ? resetBtn.closest('div.fixed') : null;
    const sticky = bar ? this.clean(bar.innerText) : null;
    let report = null;
    const prev = bar ? bar.querySelector('button[aria-label="' + previewLabel + '"]') : null;
    if (prev) {
      prev.click();
      await this.tick();
      const pre = document.querySelector('pre');
      report = pre ? pre.textContent : null;
      const close = document.querySelector('button[aria-label="' + closeLabel + '"]');
      if (close) { close.click(); await this.tick(); }
    }
    const main = document.querySelector('main').cloneNode(true);
    main.querySelectorAll('[data-criteria-section]').forEach((e) => e.remove());
    return { sticky, report, mainText: this.clean(main.textContent) };
  },
};`;

// ---- Escenarios por calculadora -------------------------------------------
// Cada escenario es una lista de pasos: ['click', scope, label] o
// ['fill', placeholder, value]. Se ejecuta desde la página recién cargada.
function tiradsScenarios() {
  const c = t.calc.tirads;
  const cr = c.criteria;
  const out = [{ name: 'vacío', steps: [] }];
  const subsets = [];
  for (let m = 0; m < 16; m++) subsets.push([0, 1, 2, 3].filter((i) => m & (1 << i)));
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) for (let s = 0; s < 2; s++) for (let m = 0; m < 4; m++) {
    const base = [
      ['click', cr.composition.title, cr.composition.options[a]],
      ['click', cr.echogenicity.title, cr.echogenicity.options[b]],
      ['click', cr.shape.title, cr.shape.options[s]],
      ['click', cr.margin.title, cr.margin.options[m]],
    ];
    out.push({ name: `c${a} e${b} s${s} m${m} foci[]`, steps: base });
    for (const sub of subsets.slice(1)) {
      out.push({
        name: `c${a} e${b} s${s} m${m} foci[${sub.join(',')}]`,
        steps: [...base, ...sub.map((i) => ['click', cr.echogenicFoci.title, cr.echogenicFoci.options[i]])],
      });
    }
  }
  return out;
}

function liradsScenarios() {
  const c = t.calc.lirads;
  const yes = t.common.yes, no = t.common.no;
  const out = [{ name: 'vacío', steps: [] }];
  out.push({ name: 'TIV sí', steps: [['click', c.lrTiv, yes]] });
  for (const [k, label] of Object.entries(c.lrTivContinuity)) {
    out.push({ name: `TIV sí, ${k}`, steps: [['click', c.lrTiv, yes], ['click', c.lrTivContinuityLabel, label]] });
  }
  out.push({ name: 'TIV no', steps: [['click', c.lrTiv, no]] });
  out.push({ name: 'TIV no, M sí', steps: [['click', c.lrTiv, no], ['click', c.lrM, yes]] });
  const feats = [['washout', c.featWashout], ['capsule', c.featCapsule], ['growth', c.featGrowth]];
  const afSets = {
    none: [],
    mal: [['click', c.afMalignantGeneralTitle, c.afMalignantGeneral[0]]],
    malHcc: [['click', c.afMalignantHccTitle, c.afMalignantHcc[0]]],
    ben: [['click', c.afBenignTitle, c.afBenign[0]]],
    both: [['click', c.afMalignantGeneralTitle, c.afMalignantGeneral[0]], ['click', c.afBenignTitle, c.afBenign[0]]],
  };
  const sizes = [c.size1, c.size2, c.size3];
  for (let si = 0; si < 3; si++) for (const aphe of [yes, no]) for (let m = 0; m < 8; m++) for (const [afName, afSteps] of Object.entries(afSets)) {
    const fs = feats.filter((_, i) => m & (1 << i));
    out.push({
      name: `size${si + 1} aphe=${aphe} feats[${fs.map((f) => f[0]).join(',')}] af=${afName}`,
      steps: [
        ['click', c.lrTiv, no], ['click', c.lrM, no],
        ['click', c.sizeLabel, sizes[si]], ['click', c.apheLabel, aphe],
        ...fs.map(([, label]) => ['click', c.featuresLabel, label]),
        ...afSteps,
      ],
    });
  }
  // Solo tamaño (sin APHE elegido): no debe haber resultado.
  out.push({ name: 'solo tamaño', steps: [['click', c.lrTiv, no], ['click', c.lrM, no], ['click', c.sizeLabel, c.size2]] });
  return out;
}

function lungNoduleScenarios() {
  const c = t.calc.lungNodule;
  const y = c.pfnYes, n = c.pfnNo;
  const out = [
    { name: 'vacío', steps: [] },
    { name: 'PFN g1 no', steps: [['click', c.pfnGate1Q, n]] },
    { name: 'PFN g1 sí', steps: [['click', c.pfnGate1Q, y]] },
    { name: 'PFN g1 sí g2 sí', steps: [['click', c.pfnGate1Q, y], ['click', c.pfnGate2Q, y]] },
    { name: 'PFN g1 sí g2 no', steps: [['click', c.pfnGate1Q, y], ['click', c.pfnGate2Q, n]] },
    { name: 'PFN g1 sí g2 no g3 sí', steps: [['click', c.pfnGate1Q, y], ['click', c.pfnGate2Q, n], ['click', c.pfnGate3Q, y]] },
    { name: 'PFN g1 sí g2 no g3 no', steps: [['click', c.pfnGate1Q, y], ['click', c.pfnGate2Q, n], ['click', c.pfnGate3Q, n]] },
    { name: 'PFN g1 sí g2 sí, continuar', steps: [['click', c.pfnGate1Q, y], ['click', c.pfnGate2Q, y], ['click', null, c.pfnContinueAnyway]] },
  ];
  const sizes = ['', '0.5', '5', '5.9', '6', '6.0', '7', '8', '8.0', '8.4', '9', '30', 'abc'];
  const types = [['solid', c.typeSolid], ['partSolid', c.typePartSolid], ['ggn', c.typeGgn]];
  for (const [fw, fwLabel] of [['fleischner', c.frameworkFleischner], ['nccn', c.frameworkNccn]]) {
    for (const [ty, tyLabel] of types) for (const [co, coLabel] of [['single', c.countSingle], ['multiple', c.countMultiple]]) {
      const risks = ty === 'solid' ? [['low', c.riskLow], ['high', c.riskHigh]] : [['low', null], ['high', c.riskHigh]];
      for (const [ri, riLabel] of risks) for (const size of sizes) {
        // Para subsólidos, "high" se fija como sólido+alto riesgo y luego se
        // cambia el tipo: comprueba que el riesgo oculto no afecte el resultado.
        const riskSteps = ty === 'solid'
          ? [['click', c.riskLabel, riLabel]]
          : (ri === 'high' ? [['click', c.typeLabel, c.typeSolid], ['click', c.riskLabel, c.riskHigh]] : []);
        out.push({
          name: `${fw} ${ty} ${co} ${ri} size=${size}`,
          steps: [
            ['click', null, c.pfnSkip],
            ['click', c.frameworkLabel, fwLabel],
            ...riskSteps,
            ['click', c.typeLabel, tyLabel],
            ['click', c.countLabel, coLabel],
            ['fill', c.sizePh, size],
          ],
        });
      }
    }
  }
  return out;
}

// resetBetween: en vez de recargar la página entre escenarios, usa el botón
// Reiniciar (TI-RADS tiene 2049 estados y siempre muestra el panel).
export const CALCS = {
  tirads: { build: tiradsScenarios, resetBetween: true },
  lirads: { build: liradsScenarios },
  lungNodule: { build: lungNoduleScenarios },
};

// Carga una calculadora y deja listas las utilidades de la página.
export async function openCalc(page, baseUrl, id) {
  await page.goto(`${baseUrl}/${LANG}/calc/${id}/`, { waitUntil: 'load' });
  await page.waitForFunction((tt) => document.querySelector('header h1')?.textContent.includes(tt) && document.querySelectorAll('main button').length > 3, t.calc[id].title);
  await page.evaluate(IN_PAGE);
}

export async function runSteps(page, steps) {
  await page.evaluate(async (steps) => {
    const rc = window.__rc;
    for (const [kind, a, b] of steps) {
      if (kind === 'click') rc.click(a, b); else rc.fill(a, b);
      await rc.tick();
    }
  }, steps);
}

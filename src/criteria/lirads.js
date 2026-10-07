// Ficha de "Criterios y referencias" de LI-RADS v2018 (TC/RM). La tabla
// diagnóstica y la del ajuste por características auxiliares se obtienen
// evaluando, celda por celda, las mismas funciones que usa la calculadora
// (src/calculators/logic/lirads.js).
import {
  LIRADS_SIZES, LIRADS_FEATURES, LIRADS_ORDER, computeLiRads, adjustLiRadsForAF, liradsFinalCategory,
} from '../calculators/logic/lirads.js';
import { baseSpec } from './common.js';

// Todos los subconjuntos de características adicionales, por cantidad.
function featureSubsets() {
  const n = LIRADS_FEATURES.length;
  const subsets = [];
  for (let mask = 0; mask < (1 << n); mask++) {
    subsets.push(LIRADS_FEATURES.filter((_, i) => mask & (1 << i)).map(([key]) => key));
  }
  return subsets.sort((a, b) => a.length - b.length);
}

export function buildLiradsCriteria(t) {
  const c = t.calc.lirads;
  const L = t.criteria;
  const LC = L.calc.lirads;
  const yes = t.common.yes, no = t.common.no;
  const spec = baseSpec('lirads', t);
  const featLabel = Object.fromEntries(LIRADS_FEATURES.map(([key, labelKey]) => [key, c[labelKey]]));
  const sizeLabels = LIRADS_SIZES.map(([, labelKey]) => c[labelKey]);

  spec.variables = [
    { name: c.lrTiv, definition: '', values: [yes, no], unit: L.unitYesNo },
    { name: c.lrTivContinuityLabel, definition: '', values: Object.values(c.lrTivContinuity), unit: L.unitCategorical },
    { name: c.lrM, definition: '', values: [yes, no], unit: L.unitYesNo },
    { name: c.sizeLabel, definition: '', values: sizeLabels, unit: 'mm' },
    { name: c.apheLabel, definition: '', values: [yes, no], unit: L.unitYesNo },
    { name: `${c.featuresLabel} — ${L.multiSelect}`, definition: '', values: Object.values(featLabel), unit: L.unitCategorical },
    { name: `${c.afSectionTitle} — ${L.multiSelect}`, definition: c.afIntro, values: [c.afMalignantGeneralTitle, c.afMalignantHccTitle, c.afBenignTitle], unit: L.unitCategorical },
  ];
  spec.pending.push('Variables sin definición propia en los textos (solo la pregunta): tamaño de la observación, APHE, características adicionales.');

  // Orden de prioridad, comprobado con la función de la calculadora.
  const precedenceOk = liradsFinalCategory(true, true, 'LR-5') === 'LR-TIV'
    && liradsFinalCategory(false, true, 'LR-5') === 'LR-M'
    && liradsFinalCategory(false, false, 'LR-5') === 'LR-5';
  if (!precedenceOk) spec.pending.push('El orden de prioridad LR-TIV > LR-M > numérica no coincide con la lógica.');
  spec.rules.push({ title: LC.precedenceTitle, list: LC.precedence(yes, 'LR-M'), ordered: true, after: [c.usage[1]] });

  // Tabla diagnóstica: filas = combinaciones de características (agrupadas
  // por cantidad cuando todas dan lo mismo), columnas = tamaño.
  const subsets = featureSubsets();
  for (const aphe of [false, true]) {
    const resultRow = (subset) => LIRADS_SIZES.map(([size]) => computeLiRads(size, aphe, Object.fromEntries(subset.map((k) => [k, true]))));
    const rows = [];
    const byCount = {};
    subsets.forEach((s) => { (byCount[s.length] = byCount[s.length] || []).push(s); });
    Object.entries(byCount).forEach(([n, group]) => {
      const results = group.map(resultRow);
      const uniform = results.every((r) => r.join() === results[0].join());
      if (Number(n) === 0) rows.push([t.common.none, ...results[0]]);
      else if (uniform && group.length > 1) rows.push([LC.featCount(Number(n)), ...results[0]]);
      else group.forEach((s, i) => rows.push([s.map((k) => featLabel[k]).join(' + '), ...results[i]]));
    });
    spec.rules.push({
      title: LC.tableTitle(c.apheLabel, aphe ? yes : no),
      table: { headers: [LC.featuresColumn, ...sizeLabels], rows },
    });
  }
  spec.rules[spec.rules.length - 1].after = [c.usage[2]];

  // Ajuste por características auxiliares.
  spec.rules.push({
    title: LC.afTitle,
    paragraphs: [c.afIntro],
    table: {
      headers: [LC.afBase, LC.afOnlyMalignant, LC.afOnlyBenign, LC.afBoth],
      rows: LIRADS_ORDER.map((cat) => [cat, adjustLiRadsForAF(cat, true, false), adjustLiRadsForAF(cat, false, true), adjustLiRadsForAF(cat, true, true)]),
    },
    after: [c.afRuleNote],
  });
  spec.rules.push({ title: `${LC.afListsTitle}: ${c.afMalignantGeneralTitle}`, list: c.afMalignantGeneral });
  spec.rules.push({ title: `${LC.afListsTitle}: ${c.afMalignantHccTitle}`, list: c.afMalignantHcc });
  spec.rules.push({ title: `${LC.afListsTitle}: ${c.afBenignTitle}`, list: c.afBenign });

  spec.results.push({
    table: { headers: [L.category, L.meaning], rows: Object.entries(c.categories).map(([k, v]) => [k, v]) },
  });
  spec.results.push({ title: LC.continuityTitle, list: Object.values(c.lrTivContinuity) });

  // Categorías que la calculadora nunca puede entregar con estas reglas.
  const reachable = new Set(['LR-TIV', 'LR-M']);
  LIRADS_SIZES.forEach(([size]) => [false, true].forEach((aphe) => subsets.forEach((s) => {
    const base = computeLiRads(size, aphe, Object.fromEntries(s.map((k) => [k, true])));
    [[false, false], [true, false], [false, true], [true, true]].forEach(([mal, ben]) => reachable.add(adjustLiRadsForAF(base, mal, ben)));
  })));
  Object.keys(c.categories).filter((k) => !reachable.has(k)).forEach((k) => {
    spec.pending.push(`La categoría ${k} figura en los textos pero la calculadora no puede entregarla (sus criterios no están en el repositorio).`);
  });

  return spec;
}

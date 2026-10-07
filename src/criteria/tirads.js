// Ficha de "Criterios y referencias" de ACR TI-RADS. Todo sale de la lógica
// (src/calculators/logic/tirads.js) y de los textos que ya muestra la
// calculadora (t.calc.tirads); aquí no se escribe ninguna regla a mano.
import {
  TIRADS_POINTS, TIRADS_SINGLE_CHOICE, TIRADS_MULTI_CHOICE, tiradsCategory, tiradsMaxPoints,
} from '../calculators/logic/tirads.js';
import { baseSpec, groupRuns } from './common.js';

export function buildTiradsCriteria(t) {
  const c = t.calc.tirads;
  const L = t.criteria;
  const LC = L.calc.tirads;
  const spec = baseSpec('tirads', t);
  const keys = Object.keys(c.criteria);

  spec.variables = keys.map((key) => {
    const cr = c.criteria[key];
    const multi = key === TIRADS_MULTI_CHOICE;
    return {
      name: multi ? `${cr.title} — ${L.multiSelect}` : cr.title,
      definition: cr.hint,
      values: cr.options.map((opt, i) => `${opt} (${TIRADS_POINTS[key][i]} ${c.points})`),
      unit: L.unitPoints,
    };
  });

  spec.rules.push({
    title: LC.pointsTitle,
    paragraphs: [c.usage[0]],
    table: {
      headers: [L.criterion, L.option, L.points],
      rows: keys.flatMap((key) => c.criteria[key].options.map((opt, i) => [c.criteria[key].title, opt, String(TIRADS_POINTS[key][i])])),
    },
  });

  // Rango de puntaje de cada categoría, recorriendo todos los puntajes
  // posibles con la misma función que usa la calculadora.
  const scores = Array.from({ length: tiradsMaxPoints() + 1 }, (_, i) => i);
  const ranges = groupRuns(scores, tiradsCategory).map(({ items, value }) => {
    const lo = items[0], hi = items[items.length - 1];
    const label = lo === hi ? `${lo}` : hi === tiradsMaxPoints() ? `≥ ${lo}` : `${lo}–${hi}`;
    return [value, label];
  });
  const mgmt = Object.fromEntries(c.managementRows.map((row) => [row[0], row]));
  const [hCat, hScore, hRisk, hFna, hFollow] = c.managementHeaders;
  spec.rules.push({
    title: LC.categoryTitle,
    paragraphs: [c.usage[1]],
    table: {
      headers: [hCat, `${hScore} (${L.points.toLowerCase()})`, hRisk, hFna, hFollow],
      rows: ranges.map(([cat, label]) => [cat, label, mgmt[cat][2], mgmt[cat][3], mgmt[cat][4]]),
    },
  });

  spec.results.push({
    table: {
      headers: [L.category, L.meaning, L.recommendation],
      rows: ranges.map(([cat]) => [cat, c.categories[cat].risk, c.categories[cat].recs]),
    },
  });

  // Discrepancias entre la lógica y la tabla de manejo escrita en strings:
  // se informan, no se corrigen.
  ranges.forEach(([cat, label]) => {
    const written = (mgmt[cat] || [])[1] || '';
    const normalized = written.replace(/\s*pts?$/, '').replace('-', '–').replace('≥', '≥ ').replace(/\s+/g, ' ').trim();
    if (normalized !== label) {
      spec.pending.push(`Tabla de manejo: ${cat} dice "${written}" pero la calculadora asigna ${cat} a ${label} puntos.`);
    }
  });
  if (TIRADS_SINGLE_CHOICE.length + 1 !== keys.length) spec.pending.push('Los criterios de strings no coinciden con los de la lógica.');

  return spec;
}

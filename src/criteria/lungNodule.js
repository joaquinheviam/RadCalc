// Ficha de "Criterios y referencias" de Nódulo Pulmonar Incidental
// (Fleischner 2017 / NCCN). Las tablas se obtienen evaluando las mismas
// funciones que usa la calculadora (src/calculators/logic/lungNodule.js) en
// cada tramo de tamaño; las filas que no dependen del riesgo o del número de
// nódulos se agrupan.
import {
  PFN_FLOW, NODULE_TYPES, NODULE_COUNTS, NODULE_RISKS, NODULE_SIZE_BANDS, NODULE_SIZE_LOWER, NODULE_SIZE_UPPER,
  fleischnerRec, nccnRec,
} from '../calculators/logic/lungNodule.js';
import { baseSpec, groupRuns } from './common.js';

function bandsLabel(keys, L, unit) {
  const first = keys[0], last = keys[keys.length - 1];
  if (keys.length === NODULE_SIZE_BANDS.length) return L.anySize;
  if (first === 'below' && last === 'below') return `< ${NODULE_SIZE_LOWER} ${unit}`;
  if (first === 'below') return `≤ ${NODULE_SIZE_UPPER} ${unit}`;
  if (first === 'middle' && last === 'middle') return `${NODULE_SIZE_LOWER}–${NODULE_SIZE_UPPER} ${unit}`;
  if (first === 'middle') return `≥ ${NODULE_SIZE_LOWER} ${unit}`;
  return `> ${NODULE_SIZE_UPPER} ${unit}`;
}

function recTable(c, L, LC, fn) {
  const label = (pairs, key) => c[pairs.find(([k]) => k === key)[1]];
  const sizesKey = (type, count, risk) => NODULE_SIZE_BANDS.map((b) => fn(c, type, count, risk, b.sample)).join('|');
  const rows = [];
  for (const [type] of NODULE_TYPES) {
    // ¿Depende del número de nódulos? ¿Del riesgo?
    const countMatters = NODULE_RISKS.some(([risk]) => sizesKey(type, 'single', risk) !== sizesKey(type, 'multiple', risk));
    const counts = countMatters ? NODULE_COUNTS.map(([k]) => k) : [null];
    for (const count of counts) {
      const cnt = count || 'single';
      const riskMatters = sizesKey(type, cnt, 'low') !== sizesKey(type, cnt, 'high');
      const risks = riskMatters ? NODULE_RISKS.map(([k]) => k) : [null];
      for (const risk of risks) {
        const results = NODULE_SIZE_BANDS.map((b) => ({ key: b.key, rec: fn(c, type, cnt, risk || 'low', b.sample) }));
        groupRuns(results, (r) => r.rec).forEach(({ items, value }) => {
          rows.push([
            label(NODULE_TYPES, type),
            count ? label(NODULE_COUNTS, count) : L.any,
            risk ? label(NODULE_RISKS, risk) : L.notApplicable,
            bandsLabel(items.map((i) => i.key), L, LC.unitMm),
            value,
          ]);
        });
      }
    }
  }
  return { headers: [c.typeLabel, c.countLabel, c.riskLabel, LC.sizeColumn, L.recommendation], rows };
}

export function buildLungNoduleCriteria(t) {
  const c = t.calc.lungNodule;
  const L = t.criteria;
  const LC = L.calc.lungNodule;
  const spec = baseSpec('lungNodule', t);
  const yesNo = [c.pfnYes, c.pfnNo];

  spec.variables = [
    { name: c.pfnGate1Q, definition: c.pfnGate1Items.join('; '), values: yesNo, unit: L.unitYesNo },
    { name: c.pfnGate2Q, definition: c.pfnGate2Items.join('; '), values: yesNo, unit: L.unitYesNo },
    { name: c.pfnGate3Q, definition: c.pfnGate3Items.join('; '), values: yesNo, unit: L.unitYesNo },
    { name: c.frameworkLabel, definition: '', values: [c.frameworkFleischner, c.frameworkNccn], unit: L.unitCategorical },
    { name: c.typeLabel, definition: c.usage[4], values: NODULE_TYPES.map(([, k]) => c[k]), unit: L.unitCategorical },
    { name: c.countLabel, definition: '', values: NODULE_COUNTS.map(([, k]) => c[k]), unit: L.unitCategorical },
    { name: c.riskLabel, definition: c.usage[2], values: NODULE_RISKS.map(([, k]) => c[k]), unit: L.unitCategorical },
    { name: c.sizeLabel, definition: c.usage[2], values: [c.sizePh], unit: LC.unitMm },
  ];

  // Paso 1: el flujo sale de PFN_FLOW, el mismo que usan los botones.
  const dest = {
    gate2: c.pfnGate2Q, gate3: c.pfnGate3Q, 'result-pfn': c.pfnResultTitle, 'result-notpfn': c.pfnNotResultTitle,
  };
  const gates = [['gate1', c.pfnGate1Q, c.pfnGate1Items], ['gate2', c.pfnGate2Q, c.pfnGate2Items], ['gate3', c.pfnGate3Q, c.pfnGate3Items]];
  spec.rules.push({
    title: LC.pfnFlowTitle,
    paragraphs: [c.pfnIntro],
    list: gates.map(([key, q, items]) => LC.pfnStep(q, items.join('; '), dest[PFN_FLOW[key].yes], dest[PFN_FLOW[key].no])),
    ordered: true,
    after: [c.usage[5]],
  });

  spec.rules.push({ title: LC.tableTitle(c.frameworkFleischner), table: recTable(c, L, LC, fleischnerRec), after: [c.usage[3]] });
  spec.rules.push({ title: LC.tableTitle(c.frameworkNccn), table: recTable(c, L, LC, nccnRec), after: [c.nccnCaveat] });

  spec.results.push({ title: LC.pfnResultsTitle, list: [`${c.pfnResultTitle}: ${c.pfnResultDesc}`, `${c.pfnNotResultTitle}: ${c.pfnNotResultDesc}`] });
  for (const [fw, fn] of [[c.frameworkFleischner, fleischnerRec], [c.frameworkNccn, nccnRec]]) {
    const recs = new Set();
    NODULE_TYPES.forEach(([type]) => NODULE_COUNTS.forEach(([count]) => NODULE_RISKS.forEach(([risk]) => NODULE_SIZE_BANDS.forEach((b) => recs.add(fn(c, type, count, risk, b.sample))))));
    spec.results.push({ title: LC.recsTitle(fw), list: [...recs] });
  }

  // La tabla NCCN escrita a mano en strings (nccnRows) se compara con la
  // lógica: si dicen cosas distintas, se informa.
  const generated = new Set(recTable(c, L, LC, nccnRec).rows.map((r) => r[4]));
  c.nccnRows.forEach((row) => {
    if (!generated.has(row[2])) spec.pending.push(`La tabla NCCN de referencia (nccnRows) tiene un texto que la lógica no produce: "${row[2]}".`);
  });
  spec.pending.push('Regla de redondeo del tamaño no explícita: la calculadora compara el valor decimal tal cual (p. ej. 8,4 mm cae en "> 8 mm").');

  return spec;
}

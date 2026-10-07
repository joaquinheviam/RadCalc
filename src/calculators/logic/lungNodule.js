// Lógica de Nódulo Pulmonar Incidental (Fleischner 2017 / NCCN), sin React: la
// usan la calculadora (LungNodule.jsx) y la sección "Criterios y referencias"
// (src/criteria/lungNodule.js).

// Cortes de tamaño (mm, promedio de diámetros). Todas las recomendaciones
// cambian solo en estos dos puntos: < 6 mm, 6 a 8 mm, > 8 mm.
export const NODULE_SIZE_LOWER = 6; // por debajo: "< 6 mm"
export const NODULE_SIZE_UPPER = 8; // hasta aquí inclusive: "6-8 mm"

// Paso 1, nódulo perifisural (Schreuder et al. 2020): a qué etapa lleva cada
// respuesta en cada pregunta.
export const PFN_FLOW = {
  gate1: { yes: 'gate2', no: 'result-notpfn' },
  gate2: { yes: 'result-pfn', no: 'gate3' },
  gate3: { yes: 'result-pfn', no: 'result-notpfn' },
};

export const NODULE_TYPES = [['solid', 'typeSolid'], ['partSolid', 'typePartSolid'], ['ggn', 'typeGgn']];
export const NODULE_COUNTS = [['single', 'countSingle'], ['multiple', 'countMultiple']];
export const NODULE_RISKS = [['low', 'riskLow'], ['high', 'riskHigh']];

export function fleischnerRec(c, type, count, risk, size) {
  if (type === 'solid') {
    if (count === 'single') {
      if (size < NODULE_SIZE_LOWER) return risk === 'high' ? c.recs.optionalCt12 : c.recs.none;
      if (size <= NODULE_SIZE_UPPER) return risk === 'high' ? c.recs.soloSolid6to8High : c.recs.soloSolid6to8Low;
      return c.recs.soloSolidOver8;
    }
    if (size < NODULE_SIZE_LOWER) return risk === 'high' ? c.recs.optionalCt12 : c.recs.none;
    return risk === 'high' ? c.recs.multipleSolidGeq6High : c.recs.multipleSolidGeq6Low;
  }
  if (type === 'ggn') {
    if (count === 'single') return size < NODULE_SIZE_LOWER ? c.recs.none : c.recs.ggnFollow;
    return size < NODULE_SIZE_LOWER ? c.recs.multiSubsolidUnder6 : c.recs.multiSubsolidGeq6;
  }
  // partSolid
  if (count === 'single') return size < NODULE_SIZE_LOWER ? c.recs.none : c.recs.partSolidFollow;
  return size < NODULE_SIZE_LOWER ? c.recs.multiSubsolidUnder6 : c.recs.multiSubsolidGeq6;
}

export function nccnRec(c, type, count, risk, size) {
  if (type === 'solid') {
    if (size < NODULE_SIZE_LOWER) return risk === 'high' ? c.nccnRecs.solidHighUnder6 : c.nccnRecs.none;
    if (size <= NODULE_SIZE_UPPER) return risk === 'high' ? c.nccnRecs.solidHighMid : c.nccnRecs.solidLowMid;
    return c.nccnRecs.solidOver8;
  }
  if (type === 'ggn') {
    if (count === 'single') return size < NODULE_SIZE_LOWER ? c.nccnRecs.none : c.nccnRecs.ggnSoloFollow;
    return size < NODULE_SIZE_LOWER ? c.nccnRecs.multiSubsolidUnder6 : c.nccnRecs.multiSubsolidGeq6;
  }
  // partSolid
  if (count === 'single') return size < NODULE_SIZE_LOWER ? c.nccnRecs.none : c.nccnRecs.partSolidSoloFollow;
  return size < NODULE_SIZE_LOWER ? c.nccnRecs.multiSubsolidUnder6 : c.nccnRecs.multiSubsolidGeq6;
}

// Tramos de tamaño para describir las reglas en tablas: un valor de muestra
// dentro de cada tramo. tests/logic verifica que ninguna recomendación cambie
// dentro de un mismo tramo.
export const NODULE_SIZE_BANDS = [
  { key: 'below', sample: NODULE_SIZE_LOWER - 0.5 },
  { key: 'middle', sample: (NODULE_SIZE_LOWER + NODULE_SIZE_UPPER) / 2 },
  { key: 'above', sample: NODULE_SIZE_UPPER + 0.5 },
];

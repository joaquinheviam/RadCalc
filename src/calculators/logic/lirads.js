// Lógica de LI-RADS v2018 (TC/RM), sin React: la usan la calculadora
// (LIRADS.jsx) y la sección "Criterios y referencias" (src/criteria/lirads.js).

// Tamaño de la observación: valor interno y clave del texto en t.calc.lirads.
export const LIRADS_SIZES = [[1, 'size1'], [2, 'size2'], [3, 'size3']];

// Características adicionales mayores: clave y clave del texto en t.calc.lirads.
export const LIRADS_FEATURES = [['washout', 'featWashout'], ['capsule', 'featCapsule'], ['growth', 'featGrowth']];

export const LIRADS_ORDER = ['LR-1', 'LR-2', 'LR-3', 'LR-4', 'LR-5'];

export function computeLiRads(size, aphe, feats) {
  // size: 1 (<10mm) | 2 (10-19mm) | 3 (>=20mm)
  const featCount = Object.values(feats).filter(Boolean).length;
  if (!aphe) {
    if (size === 3) return featCount >= 1 ? 'LR-4' : 'LR-3';
    return featCount >= 2 ? 'LR-4' : 'LR-3';
  }
  // APHE presente
  if (size === 1) return featCount >= 1 ? 'LR-4' : 'LR-3';
  if (size === 2) {
    // Celda diagonal de la tabla oficial CT/MRI LI-RADS v2018 CORE (10-19 mm + APHE):
    // 0 características = LR-3; con exactamente 1 característica, la cápsula realzante
    // por sí sola solo alcanza LR-4, mientras que el lavado no periférico o el crecimiento
    // umbral por sí solos ya son LR-5; ≥2 características = LR-5.
    if (featCount === 0) return 'LR-3';
    if (featCount === 1) return feats.capsule ? 'LR-4' : 'LR-5';
    return 'LR-5';
  }
  return featCount >= 1 ? 'LR-5' : 'LR-4';
}

export function adjustLiRadsForAF(baseCat, hasMalignantAF, hasBenignAF) {
  const order = LIRADS_ORDER;
  const idx = order.indexOf(baseCat);
  if (idx === -1) return baseCat;
  if (hasMalignantAF && hasBenignAF) return baseCat;
  if (hasMalignantAF) {
    if (baseCat === 'LR-5') return baseCat;
    const capIdx = order.indexOf('LR-4');
    return order[Math.min(idx + 1, capIdx)];
  }
  if (hasBenignAF) return order[Math.max(idx - 1, 0)];
  return baseCat;
}

// Prioridad: LR-TIV y luego LR-M reemplazan a la categoría numérica.
export function liradsFinalCategory(lrTiv, lrM, adjustedCat) {
  return lrTiv ? 'LR-TIV' : (lrM ? 'LR-M' : adjustedCat);
}

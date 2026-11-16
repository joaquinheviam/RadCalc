// Lipoma vs. tumor lipomatoso atípico (ALT / liposarcoma bien diferenciado).
//
// 1) ALT score de Nagano et al. 2015 (BMC Musculoskelet Disord 16:36, tabla 2
//    "Scoring for the diagnosis of ALT"): diámetro ≥ 10 cm = 1, profundo = 1,
//    septos (> 2 mm, RM) = 2, realce (RM) = 2; total 0–6. Conclusión del
//    trabajo: con ≥ 3 puntos recomiendan resección marginal para confirmar el
//    diagnóstico (sensibilidad 100 %, especificidad 77 % en su serie; el punto
//    de corte debe validarse).
// 2) Rendimiento agrupado de cada hallazgo en el metaanálisis de Wilson et al.
//    2023 (Eur Radiol 33:8605–8616, tabla 3). Se muestra hallazgo por hallazgo;
//    no se combinan ni se suman (el metaanálisis no valida ningún puntaje).

export const ALT_ITEMS = [
  { key: 'size', points: 1, wilson: 'size10' },
  { key: 'deep', points: 1, wilson: 'deep' },
  { key: 'septa', points: 2, wilson: 'thickSepta' },
  { key: 'enhancement', points: 2, wilson: 'enhancing' },
];

export const ALT_CUTOFF = 3;
export const ALT_MAX = 6;

// answers: { size, deep, septa, enhancement } con true/false/null.
export function altScore(answers) {
  if (ALT_ITEMS.some(({ key }) => typeof answers[key] !== 'boolean')) return null;
  return ALT_ITEMS.reduce((sum, { key, points }) => sum + (answers[key] ? points : 0), 0);
}

export function altBand(score) {
  if (score === null || score === undefined) return null;
  return score >= ALT_CUTOFF ? 'high' : 'low';
}

// Wilson 2023, tabla 3: sensibilidad y especificidad agrupadas (IC 95 %).
// fixed: modelo de efectos fijos (pocos estudios), según la tabla.
export const WILSON = {
  gestalt: { sens: [85, 79, 90], spec: [63, 52, 72] },
  deep: { sens: [94, 85, 98], spec: [40, 32, 49], fixed: true },
  septa: { sens: [81, 61, 92], spec: [76, 66, 83] },
  thickSepta: { sens: [85, 67, 94], spec: [76, 64, 85] },
  heterogeneous: { sens: [61, 44, 76], spec: [86, 71, 94] },
  irregularMargin: { sens: [65, 30, 89], spec: [81, 60, 92], fixed: true },
  nodules: { sens: [43, 19, 72], spec: [91, 70, 98] },
  size10: { sens: [92, 83, 96], spec: [58, 38, 76], fixed: true },
  enhancing: { sens: [89, 78, 95], spec: [74, 51, 89] },
};

// Hallazgos adicionales (fuera del ALT score) que se pueden marcar.
export const EXTRA_FINDINGS = ['heterogeneous', 'irregularMargin', 'nodules'];

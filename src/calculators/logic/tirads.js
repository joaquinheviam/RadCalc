// Lógica de ACR TI-RADS, sin React: la usan la calculadora (TIRADS.jsx) y la
// sección "Criterios y referencias" (src/criteria/tirads.js). Cualquier cambio
// de puntos o cortes se hace aquí y se refleja en ambas.

// Puntos por opción, en el mismo orden que t.calc.tirads.criteria.<clave>.options.
export const TIRADS_POINTS = {
  composition: [0, 0, 1, 2],
  echogenicity: [0, 1, 2, 3],
  shape: [0, 3],
  margin: [0, 0, 2, 3],
  echogenicFoci: [0, 1, 2, 3],
};

// Criterios de una sola opción; en echogenicFoci se suman todas las marcadas.
export const TIRADS_SINGLE_CHOICE = ['composition', 'echogenicity', 'shape', 'margin'];
export const TIRADS_MULTI_CHOICE = 'echogenicFoci';

export function tiradsPoints(selections) {
  let pts = 0;
  TIRADS_SINGLE_CHOICE.forEach(cat => {
    if (selections[cat] !== null) pts += TIRADS_POINTS[cat][selections[cat]];
  });
  selections[TIRADS_MULTI_CHOICE].forEach(i => { pts += TIRADS_POINTS[TIRADS_MULTI_CHOICE][i]; });
  return pts;
}

export function tiradsCategory(pts) {
  if (pts === 0) return 'TR1';
  if (pts <= 2) return 'TR2';
  if (pts === 3) return 'TR3';
  if (pts <= 6) return 'TR4';
  return 'TR5';
}

export const TIRADS_CATEGORY_COLOR = {
  TR1: 'text-emerald-500',
  TR2: 'text-emerald-500',
  TR3: 'text-amber-500',
  TR4: 'text-orange-500',
  TR5: 'text-red-500',
};

// Puntaje máximo posible: la opción más alta de cada criterio único más la
// suma de todos los focos ecogénicos.
export function tiradsMaxPoints() {
  const single = TIRADS_SINGLE_CHOICE.reduce((s, cat) => s + Math.max(...TIRADS_POINTS[cat]), 0);
  return single + TIRADS_POINTS[TIRADS_MULTI_CHOICE].reduce((s, p) => s + p, 0);
}

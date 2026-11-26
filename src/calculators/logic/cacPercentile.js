// Percentil del score de calcio coronario (Agatston) para edad, sexo y raza/etnia.
//
// 30-44 años: Javaid A, et al. Distribution of Coronary Artery Calcium by Age,
//   Sex, and Race Among Patients 30-45 Years Old. J Am Coll Cardiol
//   2022;79:1873-86 (doi 10.1016/j.jacc.2022.02.051), Tabla 3: CAC de los
//   percentiles 75, 90, 95 y 97,5 por año de edad. Solo blancos y negros.
//   La tabla llega a los 45 años, pero desde los 45 se usa MESA (decisión del autor).
// 45-84 años: McClelland RL, et al. Circulation 2006;113:30-7
//   (doi 10.1161/CIRCULATIONAHA.105.580696), mediante su calculador oficial
//   (tools.mesa-nhlbi.org/Calcium), que entrega la probabilidad de CAC > 0 y los
//   percentiles 25, 50, 75 y 90 por año de edad (ver cacPercentileMesa.js).
//
// Resultado: el rango de percentil donde cae el CAC observado. Un CAC igual o
// mayor que el valor de un percentil queda sobre ese percentil (así se
// reproducen los ejemplos de Javaid: hombre blanco de 36 años con CAC 8 →
// percentil 91; de 45 años con CAC 40 → percentil 87).
import { MESA } from './cacPercentileMesa.js';

export const JAVAID_MIN_AGE = 30;
export const MESA_MIN_AGE = 45;
export const MESA_MAX_AGE = 84;

// Javaid 2022, Tabla 3, edades 30 a 45 (índice = edad - 30).
export const JAVAID = {
  white: {
    female: {
      75: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      90: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      95: [0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 4, 5, 8, 10, 12, 12],
      97.5: [4, 5, 7, 7, 8, 10, 10, 11, 12, 15, 21, 27, 37, 47, 64, 76],
    },
    male: {
      75: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 5],
      90: [0, 0, 0, 0, 1, 3, 5, 8, 11, 15, 18, 21, 26, 32, 43, 55],
      95: [0, 1, 4, 9, 15, 21, 29, 35, 41, 47, 53, 59, 72, 83, 105, 131],
      97.5: [2, 9, 18, 29, 40, 55, 68, 80, 96, 100, 111, 125, 146, 166, 190, 249],
    },
  },
  black: {
    female: {
      75: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      90: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      95: [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 5, 8, 9, 11, 13, 12],
      97.5: [0, 0, 0, 0, 1, 2, 3, 7, 10, 16, 23, 30, 36, 41, 40, 37],
    },
    male: {
      75: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      90: [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 5, 7, 9, 12, 22, 36],
      95: [0, 0, 1, 2, 3, 4, 6, 10, 14, 17, 26, 33, 42, 54, 85, 138],
      97.5: [5, 9, 5, 8, 12, 16, 24, 35, 42, 47, 64, 82, 96, 119, 175, 277],
    },
  },
};

export const JAVAID_GROUPS = ['white', 'black'];
export const MESA_GROUPS = ['white', 'black', 'hispanic', 'chinese'];
// Grupo por defecto (decisión del autor): blanco en 30-44; hispano en ≥ 45.
export const DEFAULT_GROUP = { javaid: 'white', mesa: 'hispanic' };

// 'javaid' (30-44), 'mesa' (45-84) o null fuera de rango. Edad en años cumplidos.
export function cacSource(age) {
  if (!Number.isInteger(age)) return null;
  if (age >= JAVAID_MIN_AGE && age < MESA_MIN_AGE) return 'javaid';
  if (age >= MESA_MIN_AGE && age <= MESA_MAX_AGE) return 'mesa';
  return null;
}

export function groupsFor(source) {
  return source === 'javaid' ? JAVAID_GROUPS : source === 'mesa' ? MESA_GROUPS : [];
}

// [percentil, valor de CAC] de menor a mayor percentil.
function thresholds(source, group, sex, age) {
  if (source === 'javaid') {
    const t = JAVAID[group]?.[sex];
    return t ? [75, 90, 95, 97.5].map((k) => [k, t[k][age - JAVAID_MIN_AGE]]) : null;
  }
  const row = MESA[group]?.[sex]?.[age - MESA_MIN_AGE];
  return row ? [[25, row[1]], [50, row[2]], [75, row[3]], [90, row[4]]] : null;
}

/**
 * @returns null si faltan datos o están fuera de rango; si no:
 *   { source, group, zero: true, pPositive }                 con CAC 0
 *   { source, group, zero: false, lower, upper, pPositive }  con CAC > 0
 * lower/upper: percentiles que acotan el CAC (lower null = bajo el primero;
 * upper null = sobre el último). pPositive: % con CAC > 0 (solo MESA; null en Javaid).
 */
export function cacPercentile({ age, sex, group, cac }) {
  const source = cacSource(age);
  if (!source || !['female', 'male'].includes(sex) || !groupsFor(source).includes(group)) return null;
  if (typeof cac !== 'number' || !Number.isFinite(cac) || cac < 0) return null;
  const th = thresholds(source, group, sex, age);
  if (!th) return null;
  const pPositive = source === 'mesa' ? MESA[group][sex][age - MESA_MIN_AGE][0] : null;
  if (cac === 0) return { source, group, zero: true, pPositive };
  let lower = null;
  let upper = null;
  for (const [k, v] of th) {
    if (cac >= v) lower = k;
    else { upper = k; break; }
  }
  // MESA: con una proporción (100 - pPositive) % de CAC 0, todo CAC > 0 queda
  // sobre ese percentil (McClelland 2006, Métodos). Acota el límite inferior.
  if (pPositive !== null) {
    const floor = 100 - pPositive;
    if (floor > (lower ?? 0) && (upper === null || floor < upper)) lower = floor;
  }
  return { source, group, zero: false, lower, upper, pPositive };
}

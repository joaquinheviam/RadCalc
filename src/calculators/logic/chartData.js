// Datos para los gráficos de referencia (ReferenceChart). Solo reordena los
// valores que ya usan las calculadoras: no agrega cifras ni cambia criterios.
import { KIDNEY_LENGTH } from './kidneyPeds.js';
import { SPLEEN_LENGTH, SPLEEN_GROUPS } from './spleenPeds.js';
import { cacPercentile, cacThresholds, MESA_MIN_AGE } from './cacPercentile.js';
import { MESA } from './cacPercentileMesa.js';

const round = (x, d = 6) => Math.round(x * 10 ** d) / 10 ** d;

// Marcas "redondas" (paso 1, 2 o 5 × 10^n) que cubren [min, max].
export function niceTicks(min, max, target = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) { min -= 1; max += 1; }
  if (min > max) [min, max] = [max, min];
  const raw = (max - min) / Math.max(1, target);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(round(v));
  return out;
}

// Grupos de edad para el gráfico de banda: media y media ± 2 DE por grupo.
// Riñón: Viteri 2026, Tabla 3 (misma referencia para ambos sexos).
export function kidneyBins() {
  return KIDNEY_LENGTH.map(([key, mean, sd]) => ({ key, mean, lo: round(mean - 2 * sd), hi: round(mean + 2 * sd) }));
}

// Bazo: Megremis 2004, Tabla 1, por sexo.
export function spleenBins(sex) {
  if (!['female', 'male'].includes(sex)) return [];
  return SPLEEN_GROUPS.map((key) => {
    const [, mean, sd] = SPLEEN_LENGTH[key][sex];
    return { key, mean, lo: round(mean - 2 * sd), hi: round(mean + 2 * sd) };
  });
}

/**
 * Escala de percentiles del CAC (tramos ordinales entre percentiles conocidos).
 * @returns null si cacPercentile no da resultado; si no:
 *   { source, cuts: [{ p, cac }], zeroPct, bounds, bands: [{ from, to, zero, patient }],
 *     marker: null | number, result }
 * cuts: percentiles de la referencia con su valor de CAC (Javaid: 75/90/95/97,5;
 * MESA: 25/50/75/90). zeroPct: % de la referencia con CAC 0 (solo MESA; null en
 * Javaid). bounds: límites de los tramos (0, cortes, zeroPct, 100), sin repetir.
 * patient: el tramo contiene el rango de percentil del paciente (con CAC 0 en MESA,
 * el tramo de empate en 0; con CAC 0 en Javaid, ninguno: sin percentil asignable).
 * marker: percentil exacto cuando el resultado es "en torno a" un percentil.
 */
export function cacScale({ age, sex, group, cac }) {
  const result = cacPercentile({ age, sex, group, cac });
  if (!result) return null;
  const cuts = cacThresholds(result.source, group, sex, age).map(([p, v]) => ({ p, cac: v }));
  const zeroPct = result.source === 'mesa' ? 100 - MESA[group][sex][age - MESA_MIN_AGE][0] : null;
  const set = new Set([0, 100, ...cuts.map((c) => c.p)]);
  if (zeroPct !== null && zeroPct > 0 && zeroPct < 100) set.add(zeroPct);
  const bounds = [...set].sort((a, b) => a - b);
  let pLo = null;
  let pHi = null;
  let marker = null;
  if (result.zero) {
    if (zeroPct !== null && zeroPct > 0) { pLo = 0; pHi = zeroPct; }
  } else if (result.lower !== null && result.lower === result.upper) {
    marker = result.lower;
  } else {
    pLo = result.lower ?? 0;
    pHi = result.upper ?? 100;
  }
  const bands = bounds.slice(0, -1).map((from, i) => {
    const to = bounds[i + 1];
    return {
      from,
      to,
      zero: zeroPct !== null && to <= zeroPct,
      patient: pLo !== null && from >= pLo && to <= pHi,
    };
  });
  return { source: result.source, cuts, zeroPct, bounds, bands, marker, result };
}

/**
 * Valores de la fase tardía (UH) que alcanzarían los cortes de lavado del
 * protocolo, despejados de las mismas fórmulas del componente:
 *   PLR = (portal − tardía) / portal × 100       → tardía ≤ portal × (1 − corte/100)
 *   PLA = (portal − tardía) / (portal − sin c.) × 100 → tardía ≤ portal − corte/100 × (portal − sin c.)
 * Solo tiene sentido con realce portal positivo sobre la fase previa.
 */
export function washoutTargets({ nc, ven, apwCut, rpwCut }) {
  const out = {};
  if (Number.isFinite(ven) && ven > 0 && Number.isFinite(rpwCut)) out.rpw = round(ven * (1 - rpwCut / 100), 1);
  if (Number.isFinite(ven) && Number.isFinite(nc) && ven - nc > 0 && Number.isFinite(apwCut)) {
    out.apw = round(ven - (apwCut / 100) * (ven - nc), 1);
  }
  return out;
}

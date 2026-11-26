// Longitud esplénica normal en niños por ecografía.
// Megremis SD, Vlachonikolis IG, Tsilimigaki AM. Spleen length in childhood with US:
// normal values based on age, sex, and somatometric parameters. Radiology
// 2004;231:129-34 (doi 10.1148/radiol.2311020963), Tabla 1: 454 niños sanos con
// talla y peso entre los percentiles 5 y 95. Por grupo de edad y sexo:
// [n, media, DE, mínimo, máximo] en cm. Las diferencias por sexo no fueron
// significativas, pero el paper las tabula por separado y así se usan aquí.
// El límite superior propuesto por los autores (90 % UCL) solo se publicó en
// gráficos; aquí se informa el puntaje Z respecto de la media y la DE de la tabla.
import { normCdf } from './kidneyPeds.js';

export const SPLEEN_LENGTH = {
  m0: { female: [22, 4.4, 0.57, 3.2, 5.5], male: [35, 4.6, 0.84, 2.8, 6.8] },
  m3: { female: [6, 5.2, 0.47, 4.5, 5.6], male: [10, 5.8, 0.65, 4.9, 7.0] },
  m6: { female: [15, 6.3, 0.68, 5.1, 7.5], male: [12, 6.4, 0.78, 5.4, 7.4] },
  y1: { female: [18, 6.3, 0.69, 5.1, 8.2], male: [17, 6.8, 0.72, 5.6, 8.3] },
  y2: { female: [24, 7.5, 0.83, 5.7, 8.9], male: [22, 7.6, 1.07, 5.9, 9.9] },
  y4: { female: [36, 8.0, 0.74, 6.7, 9.5], male: [18, 8.1, 1.01, 6.4, 9.9] },
  y6: { female: [25, 8.2, 0.99, 6.6, 10.0], male: [26, 8.9, 0.91, 7.4, 10.5] },
  y8: { female: [26, 8.7, 0.92, 6.4, 10.5], male: [15, 9.0, 1.02, 7.4, 11.2] },
  y10: { female: [34, 9.1, 1.09, 6.8, 11.4], male: [19, 9.8, 1.05, 7.3, 11.3] },
  y12: { female: [30, 9.8, 1.02, 7.9, 11.6], male: [18, 10.2, 0.81, 8.5, 11.7] },
  y14: { female: [13, 10.3, 0.69, 8.7, 11.0], male: [13, 10.7, 0.90, 9.5, 12.5] },
};
export const SPLEEN_GROUPS = Object.keys(SPLEEN_LENGTH);
export const MAX_SPLEEN = 25;

// { n, mean, sd, min, max, z, pct, band } o null. band: 'small' (z < −2), 'normal', 'large' (z > +2).
export function spleenZ(group, sex, length) {
  const row = SPLEEN_LENGTH[group]?.[sex];
  if (!row || typeof length !== 'number' || !Number.isFinite(length) || length <= 0 || length > MAX_SPLEEN) return null;
  const [n, mean, sd, min, max] = row;
  const z = Math.round(((length - mean) / sd) * 1e6) / 1e6;
  const band = z < -2 ? 'small' : z > 2 ? 'large' : 'normal';
  return { n, mean, sd, min, max, z, pct: normCdf(z) * 100, band };
}

// Longitud renal normal en niños por ecografía.
// Viteri B, et al. US-derived Pediatric Kidney Length and Volume Percentiles by Age:
// A Big Data Approach. Radiol Artif Intell 2026;8(1):e250056 (doi 10.1148/ryai.250056),
// Tabla 3: media ± DE de la longitud renal (cm) por grupo de edad; 24 664 ecografías
// de 18 769 niños sin patología renal (promedio de ambos riñones; diferencia
// derecho-izquierdo y por sexo sin relevancia clínica). Cada año agrupa desde esa
// edad hasta antes de la siguiente (ej. "1 año" = 1 a < 2 años).
// El paper define riñón pequeño o aumentado a más de 2 DE de la media. Sus percentiles
// se calcularon con el método LMS (material suplementario); aquí el percentil se
// aproxima con una distribución normal a partir de la media y la DE.
export const KIDNEY_LENGTH = [
  ['w0', 4.32, 0.54], ['m0', 4.99, 0.80], ['m4', 5.71, 0.73], ['m8', 6.09, 0.80],
  ['y1', 6.53, 0.82], ['y2', 6.94, 0.87], ['y3', 7.31, 0.84], ['y4', 7.59, 0.84],
  ['y5', 7.89, 0.89], ['y6', 8.14, 0.95], ['y7', 8.39, 1.04], ['y8', 8.67, 0.94],
  ['y9', 8.97, 1.05], ['y10', 9.16, 1.13], ['y11', 9.52, 1.11], ['y12', 9.95, 1.24],
  ['y13', 10.20, 1.30], ['y14', 10.31, 1.17], ['y15', 10.47, 1.29], ['y16', 10.58, 1.18],
  ['y17', 10.59, 1.28],
];

// Función de distribución normal estándar (Abramowitz y Stegun 26.2.17).
export function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}

// Sobre este valor la medida probablemente está en mm.
export const MAX_LENGTH = 20;

// Devuelve { mean, sd, z, pct, band } o null. band: 'small' (z < −2), 'normal', 'large' (z > +2).
export function kidneyZ(group, length) {
  const row = KIDNEY_LENGTH.find((r) => r[0] === group);
  if (!row || typeof length !== 'number' || !Number.isFinite(length) || length <= 0 || length > MAX_LENGTH) return null;
  const [, mean, sd] = row;
  // Redondeo para que un valor exactamente a 2 DE no dependa del error de punto flotante.
  const z = Math.round(((length - mean) / sd) * 1e6) / 1e6;
  const band = z < -2 ? 'small' : z > 2 ? 'large' : 'normal';
  return { mean, sd, z, pct: normCdf(z) * 100, band };
}

// CAC-DRS: Coronary Artery Calcium Data and Reporting System (Hecht HS, et al.
// J Cardiovasc Comput Tomogr 2018;12:185-91, SCCT). Categorías, riesgo y
// recomendaciones según la Tabla 2 de Kumar P, Bhatia M. J Cardiovasc Imaging
// 2023;31:1-17 (revisión que reproduce el documento):
//   0: Agatston 0        visual ausente   riesgo muy bajo
//   1: Agatston 1-99     visual leve      riesgo leve
//   2: Agatston 100-299  visual moderado  riesgo moderado
//   3: Agatston ≥ 300    visual severo    riesgo moderado a severo
// Código: A (Agatston) o V (visual) + categoría, y /N1-N4 = número de arterias con
// calcio entre tronco común izquierdo, descendente anterior, circunfleja y coronaria
// derecha (ej. "A1/N2"). La tabla de Kumar dice "> 300" para la categoría 3 y
// 100-299 para la 2; el autor decidió asignar 300 a la categoría 3 (≥ 300).
export const VESSELS = ['LM', 'LAD', 'LCX', 'RCA'];

export function cacDrsFromAgatston(cac) {
  if (typeof cac !== 'number' || !Number.isFinite(cac) || cac < 0) return null;
  if (cac === 0) return 0;
  if (cac < 100) return 1;
  if (cac < 300) return 2;
  return 3;
}

// method 'A' | 'V'; category 0-3; vessels = número de arterias con calcio (0-4).
export function cacDrsCode(method, category, vessels) {
  if (!['A', 'V'].includes(method) || ![0, 1, 2, 3].includes(category)) return '';
  if (category === 0) return `${method}0`;
  return vessels >= 1 && vessels <= 4 ? `${method}${category}/N${vessels}` : `${method}${category}`;
}

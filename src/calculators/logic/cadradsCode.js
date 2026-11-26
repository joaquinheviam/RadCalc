// Código CAD-RADS 2.0 (Cury RC, et al. Radiol Cardiothorac Imaging 2022;4(5):e220183,
// sección "Modifiers"): primero la estenosis, luego la carga de placa P y después
// los modificadores, separados por "/", en este orden: N, HRP, I, S, G, E.
// Ej. del documento: "CAD-RADS 3/P3/HRP/S", "CAD-RADS 3/P2/N", "CAD-RADS 4A/I+/E".
// Isquemia (Tabla 1): I+ (TC-FFR o perfusión por TC positiva), I- (negativa), I± (limítrofe).
export const MOD_ORDER = ['N', 'HRP', 'I', 'S', 'G', 'E'];
export const ISCHEMIA = ['+', '-', '±'];

export function cadradsCode(stenosis, { p = '', mods = {}, ischemia = '' } = {}) {
  if (!stenosis) return '';
  const parts = [stenosis];
  if (p) parts.push(p);
  for (const m of MOD_ORDER) {
    if (m === 'I') { if (ISCHEMIA.includes(ischemia)) parts.push(`I${ischemia}`); }
    else if (mods[m]) parts.push(m);
  }
  return parts.join('/');
}

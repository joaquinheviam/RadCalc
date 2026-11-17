// Modificador P (carga de placa) de CAD-RADS 2.0.
// Cury RC, et al. CAD-RADS 2.0 - 2022. JACC Cardiovasc Imaging 2022;15:1974-2001
// (también Radiol Cardiothorac Imaging 2022;4(5):e220183), Tabla 2:
//   P1 leve:      CAC 1-100     SIS ≤ 2
//   P2 moderada:  CAC 101-300   SIS 3-4
//   P3 severa:    CAC 301-999   SIS 5-7
//   P4 extensa:   CAC > 1000    SIS ≥ 8
// SIS = 1 punto por cada uno de los 16 segmentos coronarios con placa (máx. 16).
// La evaluación visual (vasos con placa leve/moderada/severa) la elige el usuario.
// CAD-RADS 0 = sin placa: P0 no existe y P no se informa.

// Devuelve 'P1'..'P4', 'zero' (sin calcio: no asigna P) o 'boundary' (exactamente 1000,
// que la tabla no incluye: P3 llega a 999 y P4 parte en > 1000). null si no es válido.
export function pFromCac(cac) {
  if (typeof cac !== 'number' || !Number.isFinite(cac) || cac < 0) return null;
  if (cac === 0) return 'zero';
  if (cac <= 100) return 'P1';
  if (cac <= 300) return 'P2';
  if (cac < 1000) return 'P3';
  if (cac === 1000) return 'boundary';
  return 'P4';
}

export const SIS_MAX = 16;

export function pFromSis(sis) {
  if (!Number.isInteger(sis) || sis < 0 || sis > SIS_MAX) return null;
  if (sis === 0) return 'zero';
  if (sis <= 2) return 'P1';
  if (sis <= 4) return 'P2';
  if (sis <= 7) return 'P3';
  return 'P4';
}

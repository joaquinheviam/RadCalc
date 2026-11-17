// Fracción de volumen extracelular (ECV) miocárdico por RM.
// Fórmula (Arheden et al., usada por todos los estudios de Sardanelli 2019):
//   ECV = (1 − Hto) × (1/T1 miocardio post − 1/T1 miocardio pre) / (1/T1 sangre post − 1/T1 sangre pre)
// El cociente ΔR1 miocardio / ΔR1 sangre es el coeficiente de partición (λ).
//
// Valores de referencia en sanos:
// - Sardanelli F, et al. Eur Radiol 2019;29:6620-6633 (56 estudios, 1851 sujetos):
//   media agrupada 25,6 % (IC 95 % 25,2-26,0), intervalo de normalidad 19,6-31,6 %
//   (media ± 2 DE agrupadas). MOLLI: 25,9 % (25,5-26,4), DE 3,0, intervalo 19,9-31,9 %.
//   ShMOLLI: 26,9 % (25,5-28,3), DE 3,3, intervalo 20,3-33,5 %.
// - Gottbrecht M, et al. Radiology 2019;290:317-326 (81 artículos, 3872 participantes):
//   25,9 % a 1,5 T (25,5-26,3) y a 3,0 T (25,4-26,5).

export const REFERENCE = {
  all: { mean: 25.6, ci: [25.2, 26.0], range: [19.6, 31.6] },
  molli: { mean: 25.9, ci: [25.5, 26.4], sd: 3.0, range: [19.9, 31.9] },
  shmolli: { mean: 26.9, ci: [25.5, 28.3], sd: 3.3, range: [20.3, 33.5] },
};

export const GOTTBRECHT = {
  t15: { mean: 25.9, ci: [25.5, 26.3] },
  t30: { mean: 25.9, ci: [25.4, 26.5] },
};

// T1 en ms; hematocrito en % (0-100). Devuelve null si faltan datos o son incoherentes.
export function ecvCalc({ myoPre, myoPost, bloodPre, bloodPost, hct }) {
  const v = [myoPre, myoPost, bloodPre, bloodPost, hct];
  if (v.some((x) => typeof x !== 'number' || !Number.isFinite(x) || x <= 0)) return null;
  if (hct >= 100) return null;
  // El gadolinio acorta el T1: el valor post debe ser menor que el pre.
  if (myoPost >= myoPre || bloodPost >= bloodPre) return null;
  const dMyo = 1 / myoPost - 1 / myoPre;
  const dBlood = 1 / bloodPost - 1 / bloodPre;
  const lambda = dMyo / dBlood;
  const ecv = (1 - hct / 100) * lambda * 100;
  return { lambda, ecv };
}

export function ecvBand(ecv, seq = 'all') {
  if (ecv == null) return null;
  const [lo, hi] = (REFERENCE[seq] || REFERENCE.all).range;
  if (ecv > hi) return 'high';
  if (ecv < lo) return 'low';
  return 'normal';
}

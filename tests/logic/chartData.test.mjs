// Datos de los gráficos de referencia (riñón y bazo pediátricos, percentil del CAC,
// lavado suprarrenal). Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { niceTicks, kidneyBins, spleenBins, cacScale, washoutTargets } from '../../src/calculators/logic/chartData.js';
import { KIDNEY_LENGTH } from '../../src/calculators/logic/kidneyPeds.js';
import { SPLEEN_GROUPS } from '../../src/calculators/logic/spleenPeds.js';

test('niceTicks cubre el rango con pasos redondos', () => {
  assert.deepEqual(niceTicks(3.24, 12.8, 5), [2, 4, 6, 8, 10, 12, 14]);
  assert.deepEqual(niceTicks(-25, 120, 5), [-50, 0, 50, 100, 150]);
  const t = niceTicks(5, 5);
  assert.ok(t[0] <= 5 && t[t.length - 1] >= 5);
});

test('riñón: un tramo por grupo de Viteri con media ± 2 DE', () => {
  const b = kidneyBins();
  assert.equal(b.length, KIDNEY_LENGTH.length);
  const y3 = b.find((x) => x.key === 'y3'); // 7,31 ± 0,84
  assert.equal(y3.mean, 7.31);
  assert.equal(y3.lo, 5.63);
  assert.equal(y3.hi, 8.99);
});

test('bazo: tramos por sexo de Megremis', () => {
  const f = spleenBins('female');
  assert.equal(f.length, SPLEEN_GROUPS.length);
  const m6 = spleenBins('male').find((x) => x.key === 'y6'); // 8,9 ± 0,91
  assert.deepEqual([m6.mean, m6.lo, m6.hi], [8.9, 7.08, 10.72]);
  assert.deepEqual(spleenBins(''), []);
});

const patientBands = (s) => s.bands.filter((b) => b.patient).map((b) => [b.from, b.to]);

test('CAC MESA: tramos con el % de CAC 0 y rango del paciente', () => {
  // Mujer hispana de 60 años: [% CAC > 0 = 27, P25 0, P50 0, P75 2, P90 50]
  const s = cacScale({ age: 60, sex: 'female', group: 'hispanic', cac: 20 });
  assert.equal(s.source, 'mesa');
  assert.equal(s.zeroPct, 73);
  assert.deepEqual(s.bounds, [0, 25, 50, 73, 75, 90, 100]);
  assert.deepEqual(s.cuts.map((c) => c.cac), [0, 0, 2, 50]);
  assert.deepEqual(patientBands(s), [[75, 90]]);
  assert.deepEqual(s.bands.filter((b) => b.zero).map((b) => b.to), [25, 50, 73]);
});

test('CAC 0 en MESA: el tramo de empate en 0 completo', () => {
  const s = cacScale({ age: 60, sex: 'female', group: 'hispanic', cac: 0 });
  assert.equal(s.result.zero, true);
  assert.deepEqual(patientBands(s), [[0, 25], [25, 50], [50, 73]]);
  assert.equal(s.marker, null);
});

test('CAC 0 en Javaid: sin percentil asignable (ningún tramo marcado)', () => {
  const s = cacScale({ age: 36, sex: 'male', group: 'white', cac: 0 });
  assert.equal(s.source, 'javaid');
  assert.equal(s.zeroPct, null);
  assert.deepEqual(s.bounds, [0, 75, 90, 95, 97.5, 100]);
  assert.deepEqual(patientBands(s), []);
});

test('CAC Javaid alto y ejemplo del paper', () => {
  assert.deepEqual(patientBands(cacScale({ age: 36, sex: 'male', group: 'white', cac: 8 })), [[90, 95]]);
  assert.deepEqual(patientBands(cacScale({ age: 44, sex: 'male', group: 'white', cac: 500 })), [[97.5, 100]]);
  assert.deepEqual(patientBands(cacScale({ age: 44, sex: 'male', group: 'white', cac: 2 })), [[0, 75]]);
});

test('CAC "en torno a" un percentil usa marcador', () => {
  // Hombre blanco de 64 años (MESA): 75 % con CAC > 0 → 25 % con CAC 0 = P25.
  const s = cacScale({ age: 64, sex: 'male', group: 'white', cac: 1 });
  assert.equal(s.marker, 25);
  assert.deepEqual(patientBands(s), []);
  assert.deepEqual(s.bounds, [0, 25, 50, 75, 90, 100]);
});

test('CAC fuera de rango → null', () => {
  assert.equal(cacScale({ age: 29, sex: 'male', group: 'white', cac: 10 }), null);
});

test('lavado: tardía que cumple cada corte (inversa de las fórmulas del componente)', () => {
  // Protocolo 15 min: PLA ≥ 60, PLR ≥ 40. Sin contraste 20, portal 100.
  const t = washoutTargets({ nc: 20, ven: 100, apwCut: 60, rpwCut: 40 });
  assert.deepEqual(t, { rpw: 60, apw: 52 });
  // En el límite, el lavado calculado iguala el corte.
  assert.equal(((100 - t.rpw) / 100) * 100, 40);
  assert.equal(((100 - t.apw) / (100 - 20)) * 100, 60);
  // Sin precontraste o sin criterio absoluto: solo PLR.
  assert.deepEqual(washoutTargets({ nc: NaN, ven: 80, apwCut: 60, rpwCut: 40 }), { rpw: 48 });
  assert.deepEqual(washoutTargets({ nc: 10, ven: 80, apwCut: NaN, rpwCut: 27 }), { rpw: 58.4 });
  assert.deepEqual(washoutTargets({ nc: 10, ven: 0, apwCut: 60, rpwCut: 40 }), {});
  // Se trunca hacia abajo (83 × 0,73 = 60,59 → 60,5) para que el valor mostrado cumpla el corte.
  assert.equal(washoutTargets({ nc: NaN, ven: 83, apwCut: NaN, rpwCut: 27 }).rpw, 60.5);
});

test('CAC MESA: % con CAC 0 redondeado que coincide con un percentil de CAC > 0', () => {
  // Hombre hispano de 70 años: 25 % con CAC 0 y P25 = 1 (redondeo del calculador de MESA).
  const s = cacScale({ age: 70, sex: 'male', group: 'hispanic', cac: 0 });
  assert.equal(s.zeroPct, 25);
  assert.equal(s.cuts.find((c) => c.p === 25).cac, 1);
  assert.equal(s.zeroApprox, true);
  assert.equal(cacScale({ age: 60, sex: 'female', group: 'hispanic', cac: 0 }).zeroApprox, false);
  assert.equal(cacScale({ age: 36, sex: 'male', group: 'white', cac: 0 }).zeroApprox, false);
});

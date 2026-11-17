// ECV miocárdico (Sardanelli 2019, Gottbrecht 2019). Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../../src/i18n/strings.js';
import { REFERENCE, ecvCalc, ecvBand } from '../../src/calculators/logic/ecv.js';

test('ECV: fórmula (1 − Hto) × ΔR1 miocardio / ΔR1 sangre', () => {
  // Miocardio 1000 → 450 ms, sangre 1600 → 300 ms, Hto 42 %.
  const r = ecvCalc({ myoPre: 1000, myoPost: 450, bloodPre: 1600, bloodPost: 300, hct: 42 });
  const lambda = (1 / 450 - 1 / 1000) / (1 / 300 - 1 / 1600);
  assert.ok(Math.abs(r.lambda - lambda) < 1e-12);
  assert.ok(Math.abs(r.ecv - 58 * lambda) < 1e-9);
  assert.equal(r.ecv.toFixed(1), '26.2');
});

test('ECV: entradas incompletas o incoherentes devuelven null', () => {
  const ok = { myoPre: 1000, myoPost: 450, bloodPre: 1600, bloodPost: 300, hct: 42 };
  assert.equal(ecvCalc({ ...ok, hct: NaN }), null);
  assert.equal(ecvCalc({ ...ok, hct: 100 }), null);
  assert.equal(ecvCalc({ ...ok, myoPost: 1000 }), null);
  assert.equal(ecvCalc({ ...ok, bloodPost: 1700 }), null);
  assert.equal(ecvCalc({ ...ok, myoPre: 0 }), null);
});

test('Sardanelli 2019: intervalos de normalidad por secuencia', () => {
  assert.deepEqual(REFERENCE.all.range, [19.6, 31.6]);
  assert.deepEqual(REFERENCE.molli.range, [19.9, 31.9]);
  assert.deepEqual(REFERENCE.shmolli.range, [20.3, 33.5]);
  assert.equal(ecvBand(31.9, 'molli'), 'normal');
  assert.equal(ecvBand(32, 'molli'), 'high');
  assert.equal(ecvBand(32, 'shmolli'), 'normal');
  assert.equal(ecvBand(19.5, 'all'), 'low');
  assert.equal(ecvBand(null), null);
});

test('ECV: textos ES/EN presentes', () => {
  for (const lang of ['es', 'en']) {
    const c = STRINGS[lang].calc.ecv;
    assert.ok(c && c.title && c.usage.length);
    assert.equal(typeof c.reportText, 'function');
  }
});

// Hematocrito sintético: ecuaciones de Chen 2022 (Tabla 2), MESA (Liu 2017) y Reiter 2024. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../../src/i18n/strings.js';
import { syntheticHct, CHEN_SPECIFIC } from '../../src/calculators/logic/syntheticHct.js';
import { ecvCalc } from '../../src/calculators/logic/ecv.js';

const near = (a, b, tol = 1e-4) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test('Chen 2022, modelos comunes (Tabla 2)', () => {
  // VI, hombre, 1,5 T, T1 1550 ms: 816,325/1550 + 0,024 − 0,094 − 0,027
  near(syntheticHct({ model: 'chenCommon', t1: 1550, field: '1.5', sex: 'male', pool: 'lv' }), 816.325 / 1550 + 0.024 - 0.094 - 0.027);
  // VD, mujer, 3 T, T1 1785 ms: 694,200/1785 + 0,03
  near(syntheticHct({ model: 'chenCommon', t1: 1785, field: '3', sex: 'female', pool: 'rv' }), 694.2 / 1785 + 0.03);
  assert.equal(syntheticHct({ model: 'chenCommon', t1: 1550, field: '', sex: 'male' }), null);
});

test('Chen 2022, modelos específicos (8 ecuaciones de la Tabla 2)', () => {
  assert.deepEqual(CHEN_SPECIFIC['3'].male.lv, [1763, -0.5248]);
  assert.deepEqual(CHEN_SPECIFIC['3'].male.rv, [1373, -0.3365]);
  assert.deepEqual(CHEN_SPECIFIC['3'].female.lv, [1740, -0.5233]);
  assert.deepEqual(CHEN_SPECIFIC['3'].female.rv, [1574, -0.4504]);
  assert.deepEqual(CHEN_SPECIFIC['1.5'].male.lv, [1319, -0.4318]);
  assert.deepEqual(CHEN_SPECIFIC['1.5'].male.rv, [1137, -0.3212]);
  assert.deepEqual(CHEN_SPECIFIC['1.5'].female.lv, [1048, -0.2630]);
  assert.deepEqual(CHEN_SPECIFIC['1.5'].female.rv, [897.9, -0.1718]);
  near(syntheticHct({ model: 'chenSpecific', t1: 1835, field: '3', sex: 'male', pool: 'lv' }), 1763 / 1835 - 0.5248);
});

test('MESA y Reiter; valores plausibles con T1 típicos', () => {
  near(syntheticHct({ model: 'mesa', t1: 1550, field: '1.5' }), 726.19 / 1550 - 0.07);
  near(syntheticHct({ model: 'reiter', t1: 1835, field: '3' }), 1355.52 / 1835 - 0.31);
  // Solo en su campo de derivación
  assert.equal(syntheticHct({ model: 'mesa', t1: 1836, field: '3' }), null);
  assert.equal(syntheticHct({ model: 'reiter', t1: 1550, field: '1.5' }), null);
  // Con los T1 medios de la cohorte de Chen, todos dan un hematocrito de 0,38 a 0,48.
  for (const v of [
    syntheticHct({ model: 'chenCommon', t1: 1836, field: '3', sex: 'male', pool: 'lv' }),
    syntheticHct({ model: 'chenCommon', t1: 1552, field: '1.5', sex: 'female', pool: 'lv' }),
    syntheticHct({ model: 'mesa', t1: 1552, field: '1.5' }),
    syntheticHct({ model: 'reiter', t1: 1836, field: '3' }),
  ]) assert.ok(v > 0.38 && v < 0.48, String(v));
  near(syntheticHct({ model: 'local', t1: 1600, a: 800, b: -0.05 }), 800 / 1600 - 0.05);
  assert.equal(syntheticHct({ model: 'local', t1: 1600, a: NaN, b: 0 }), null);
  assert.equal(syntheticHct({ model: 'mesa', t1: 0, field: '1.5' }), null);
});

test('ECV con hematocrito sintético usa la misma fórmula', () => {
  const hct = syntheticHct({ model: 'mesa', t1: 1550, field: '1.5' }) * 100;
  const r = ecvCalc({ myoPre: 1000, myoPost: 450, bloodPre: 1550, bloodPost: 300, hct });
  assert.ok(r && r.ecv > 20 && r.ecv < 35);
});

test('Textos ES/EN del hematocrito sintético', () => {
  for (const lang of ['es', 'en']) {
    const s = STRINGS[lang].synHct;
    for (const k of ['chenCommon', 'chenSpecific', 'mesa', 'reiter', 'local']) assert.ok(s.models[k].name && s.models[k].desc);
    assert.match(s.modelReport({ model: 'chenCommon', field: '1.5', sex: 'male', pool: 'lv' }), /Chen 2022/);
    assert.match(s.modelReport({ model: 'local', a: '800', b: '-0.05' }), /800.*-0\.05/);
    assert.ok(STRINGS[lang].calc.synHct.reportText('42,0', '1550', 'x'));
    assert.ok(STRINGS[lang].calc.ecv.hctSynReport('42,0', 'x'));
  }
});

test('Riñón pediátrico: tabla de Viteri 2026 (Tabla 3) y puntaje Z', async () => {
  const { KIDNEY_LENGTH, kidneyZ, normCdf } = await import('../../src/calculators/logic/kidneyPeds.js');
  assert.equal(KIDNEY_LENGTH.length, 21);
  assert.deepEqual(KIDNEY_LENGTH[0], ['w0', 4.32, 0.54]);
  assert.deepEqual(KIDNEY_LENGTH.find((r) => r[0] === 'y14'), ['y14', 10.31, 1.17]);
  assert.deepEqual(KIDNEY_LENGTH.find((r) => r[0] === 'y17'), ['y17', 10.59, 1.28]);
  const r = kidneyZ('y3', 7.31);
  near(r.z, 0); near(r.pct, 50, 1e-3); assert.equal(r.band, 'normal');
  assert.equal(kidneyZ('y3', 7.31 - 2.01 * 0.84).band, 'small');
  assert.equal(kidneyZ('y3', 7.31 + 2.01 * 0.84).band, 'large');
  near(normCdf(1.96), 0.975, 1e-4);
  assert.equal(kidneyZ('y3', 0), null);
  for (const lang of ['es', 'en']) {
    const c = STRINGS[lang].calc.kidneyPeds;
    for (const [k] of KIDNEY_LENGTH) assert.ok(c.ages[k], k);
    assert.ok(STRINGS[lang].categories.peds);
  }
});

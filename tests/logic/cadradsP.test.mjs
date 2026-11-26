// CAD-RADS 2.0, Tabla 2: modificador P por CAC y por SIS. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../../src/i18n/strings.js';
import { pFromCac, pFromSis } from '../../src/calculators/logic/cadradsP.js';

test('P por CAC (Agatston): 1-100, 101-300, 301-999, > 1000', () => {
  assert.equal(pFromCac(0), 'zero');
  assert.equal(pFromCac(1), 'P1');
  assert.equal(pFromCac(100), 'P1');
  assert.equal(pFromCac(100.5), 'P2');
  assert.equal(pFromCac(300), 'P2');
  assert.equal(pFromCac(301), 'P3');
  assert.equal(pFromCac(999), 'P3');
  assert.equal(pFromCac(1000), 'boundary');
  assert.equal(pFromCac(1001), 'P4');
  assert.equal(pFromCac(-1), null);
  assert.equal(pFromCac(NaN), null);
});

test('P por SIS: ≤ 2, 3-4, 5-7, ≥ 8 (máximo 16)', () => {
  assert.equal(pFromSis(0), 'zero');
  assert.equal(pFromSis(2), 'P1');
  assert.equal(pFromSis(3), 'P2');
  assert.equal(pFromSis(4), 'P2');
  assert.equal(pFromSis(5), 'P3');
  assert.equal(pFromSis(7), 'P3');
  assert.equal(pFromSis(8), 'P4');
  assert.equal(pFromSis(16), 'P4');
  assert.equal(pFromSis(17), null);
  assert.equal(pFromSis(2.5), null);
});

test('CAD-RADS: textos del modificador P en ES/EN', () => {
  for (const lang of ['es', 'en']) {
    const c = STRINGS[lang].calc.cadrads;
    assert.equal(c.pVisualOptions.length, 4);
    for (const k of ['none', 'cac', 'sis', 'visual']) assert.ok(c.pMethods[k]);
  }
});

test('Código CAD-RADS 2.0: estenosis, P y modificadores N, HRP, I, S, G, E', async () => {
  const { cadradsCode } = await import('../../src/calculators/logic/cadradsCode.js');
  assert.equal(cadradsCode('3', { p: 'P3', mods: { S: true, HRP: true } }), '3/P3/HRP/S');
  assert.equal(cadradsCode('3', { p: 'P2', mods: { N: true } }), '3/P2/N');
  assert.equal(cadradsCode('4A', { mods: { E: true }, ischemia: '+' }), '4A/I+/E');
  assert.equal(cadradsCode('5', { p: 'P3', mods: { G: true } }), '5/P3/G');
  assert.equal(cadradsCode('2', { mods: { E: true, G: true, S: true, HRP: true, N: true }, ischemia: '±', p: 'P1' }), '2/P1/N/HRP/I±/S/G/E');
  assert.equal(cadradsCode('0'), '0');
  assert.equal(cadradsCode(null), '');
});

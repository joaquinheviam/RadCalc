// ALT score (Nagano 2015) y tabla de Wilson 2023. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../../src/i18n/strings.js';
import { ALT_ITEMS, ALT_MAX, WILSON, altScore, altBand } from '../../src/calculators/logic/altLipoma.js';

test('ALT score: puntos de la tabla 2 de Nagano (1, 1, 2, 2; máximo 6)', () => {
  assert.deepEqual(ALT_ITEMS.map((i) => [i.key, i.points]), [['size', 1], ['deep', 1], ['septa', 2], ['enhancement', 2]]);
  assert.equal(ALT_MAX, 6);
  assert.equal(altScore({ size: true, deep: true, septa: true, enhancement: true }), 6);
  assert.equal(altScore({ size: false, deep: false, septa: false, enhancement: false }), 0);
  assert.equal(altScore({ size: true, deep: true, septa: false, enhancement: false }), 2);
  assert.equal(altScore({ size: false, deep: false, septa: true, enhancement: false }), 2);
  assert.equal(altScore({ size: true, deep: false, septa: true, enhancement: false }), 3);
  assert.equal(altScore({ size: true, deep: null, septa: true, enhancement: false }), null);
});

test('ALT score: punto de corte ≥ 3', () => {
  assert.equal(altBand(2), 'low');
  assert.equal(altBand(3), 'high');
  assert.equal(altBand(null), null);
});

test('Wilson 2023: valores de la tabla 3', () => {
  assert.deepEqual(WILSON.irregularMargin, { sens: [65, 30, 89], spec: [81, 60, 92], fixed: true });
  assert.deepEqual(WILSON.thickSepta, { sens: [85, 67, 94], spec: [76, 64, 85] });
  assert.deepEqual(WILSON.nodules, { sens: [43, 19, 72], spec: [91, 70, 98] });
  assert.equal(Object.keys(WILSON).length, 9);
});

for (const lang of ['es', 'en']) {
  test(`ALT (${lang}): textos de cada hallazgo e informe`, () => {
    const c = STRINGS[lang].calc.altLipoma;
    for (const k of Object.keys(WILSON)) assert.ok(c.findings[k], k);
    for (const { key } of ALT_ITEMS) assert.ok(c.items[key].label && c.items[key].yesLabel && c.items[key].noLabel, key);
    const text = c.reportText(4, 6, c.highTitle, [c.reportItem('A', 'B', 2)], ['X']);
    assert.ok(text.includes('4/6') && text.includes(c.highTitle) && text.includes('- X'));
    assert.ok(!/undefined|NaN/.test(text));
  });
}

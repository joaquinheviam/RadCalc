// Pruebas de los textos (strings ES/EN) y de las plantillas de informe.
// Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../../src/i18n/strings.js';

// Recorre el árbol de strings y devuelve las rutas de claves hoja.
function keyPaths(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...keyPaths(v, p));
    else out.push(p);
  }
  return out;
}

test('ES y EN tienen las mismas claves', () => {
  const es = new Set(keyPaths(STRINGS.es));
  const en = new Set(keyPaths(STRINGS.en));
  const onlyEs = [...es].filter((k) => !en.has(k));
  const onlyEn = [...en].filter((k) => !es.has(k));
  assert.deepEqual(onlyEs, [], `Faltan en EN: ${onlyEs.join(', ')}`);
  assert.deepEqual(onlyEn, [], `Faltan en ES: ${onlyEn.join(', ')}`);
});

for (const lang of ['es', 'en']) {
  const c = STRINGS[lang].calc.lirads;

  test(`LI-RADS (${lang}): informe por LR-TIV sin tamaño ni APHE no inventa datos`, () => {
    const text = c.reportText('', '', '', c.lrTivReport, `LR-TIV — ${c.categories['LR-TIV']}`, '');
    assert.ok(!text.includes(c.size3), 'no debe decir ≥ 20 mm');
    assert.ok(!/APHE/.test(text), 'no debe incluir la línea de APHE');
    assert.ok(text.includes(c.lrTivReport));
    assert.ok(!text.includes('?'), 'no debe incluir el texto de la pregunta');
    assert.ok(!/undefined|NaN/.test(text));
  });

  test(`LI-RADS (${lang}): informe completo incluye tamaño, APHE y características`, () => {
    const yes = STRINGS[lang].common.yes;
    const text = c.reportText(c.size2, yes, c.featWashout, '', 'LR-5', '');
    assert.ok(text.includes(c.size2));
    assert.ok(text.includes(yes));
    assert.ok(text.includes(c.featWashout));
    assert.ok(!/undefined|NaN/.test(text));
  });
}

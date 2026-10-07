// Pruebas de las fichas de "Criterios y referencias" (src/criteria).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../../src/i18n/strings.js';
import { REFERENCES } from '../../src/i18n/references.js';
import { CRITERIA_META } from '../../src/criteria/meta.js';
import { CRITERIA_BUILDERS, renderCriteriaHtml } from '../../src/criteria/index.js';

test('Sistema, versión y organismo están respaldados por REFERENCES', () => {
  for (const [id, meta] of Object.entries(CRITERIA_META)) {
    assert.ok(meta.evidence?.length, `${id}: falta evidence`);
    for (const { ref, contains } of meta.evidence) {
      const r = REFERENCES[id][ref];
      const text = typeof r === 'string' ? r : r.text;
      contains.forEach((s) => assert.ok(text.includes(s), `${id}: la referencia ${ref} no contiene "${s}"`));
    }
  }
});

test('Cada ficha se genera en ES y EN con todas sus partes', () => {
  for (const [id, build] of Object.entries(CRITERIA_BUILDERS)) {
    for (const lang of ['es', 'en']) {
      const t = STRINGS[lang];
      const spec = build(t);
      assert.ok(spec.variables.length && spec.rules.length && spec.results.length && spec.references.length, `${id}/${lang}`);
      const html = renderCriteriaHtml(spec, t.criteria);
      for (const key of ['system', 'version', 'organization', 'updated', 'scope', 'variables', 'rules', 'results', 'references']) {
        assert.ok(html.includes(`data-criteria="${key}"`), `${id}/${lang}: falta ${key}`);
      }
      assert.ok(!/undefined|\[object Object\]|NaN/.test(html), `${id}/${lang}: valores sin resolver en el HTML`);
    }
  }
});

test('Las fichas no publican fuentes que no son primarias', () => {
  for (const [id, build] of Object.entries(CRITERIA_BUILDERS)) {
    const spec = build(STRINGS.es);
    spec.references.forEach((r) => assert.ok(!/radiology ?assistant|radiopaedia/i.test(r.text), `${id}: ${r.text}`));
  }
});

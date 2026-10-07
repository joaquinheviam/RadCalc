// Pruebas de los módulos de lógica (src/calculators/logic) contra lo que la
// interfaz mostraba ANTES de extraerlos (tests/characterization/golden.json,
// grabado con Playwright sobre main). Mismas entradas -> mismo resultado.
// Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STRINGS } from '../../src/i18n/strings.js';
import { tiradsPoints, tiradsCategory, tiradsMaxPoints } from '../../src/calculators/logic/tirads.js';
import { computeLiRads, adjustLiRadsForAF, liradsFinalCategory } from '../../src/calculators/logic/lirads.js';
import {
  fleischnerRec, nccnRec, NODULE_SIZE_BANDS, NODULE_SIZE_LOWER, NODULE_SIZE_UPPER, NODULE_TYPES, NODULE_COUNTS, NODULE_RISKS,
} from '../../src/calculators/logic/lungNodule.js';

const golden = JSON.parse(readFileSync(new URL('../characterization/golden.json', import.meta.url), 'utf8'));
const es = STRINGS.es;

test('TI-RADS: 2048 combinaciones = golden (puntaje y categoría)', () => {
  let n = 0;
  for (const [name, snap] of Object.entries(golden.tirads)) {
    const m = name.match(/^c(\d) e(\d) s(\d) m(\d) foci\[([\d,]*)\]$/);
    if (!m) continue;
    const sel = {
      composition: +m[1], echogenicity: +m[2], shape: +m[3], margin: +m[4],
      echogenicFoci: m[5] ? m[5].split(',').map(Number) : [],
    };
    const pts = tiradsPoints(sel);
    const cat = tiradsCategory(pts);
    assert.ok(snap.sticky.startsWith(`${es.calc.tirads.totalScore}: ${pts} ${cat} `), `${name}: ${snap.sticky}`);
    n++;
  }
  assert.equal(n, 2048);
  assert.equal(tiradsPoints({ composition: null, echogenicity: null, shape: null, margin: null, echogenicFoci: [] }), 0);
  assert.equal(tiradsMaxPoints(), 17);
});

test('LI-RADS: estados del golden = categoría final calculada', () => {
  const c = es.calc.lirads;
  let n = 0;
  for (const [name, snap] of Object.entries(golden.lirads)) {
    const m = name.match(/^size(\d) aphe=(Sí|No) feats\[([a-z,]*)\] af=(\w+)$/);
    if (!m) continue;
    const feats = { washout: false, capsule: false, growth: false };
    (m[3] ? m[3].split(',') : []).forEach((f) => { feats[f] = true; });
    const base = computeLiRads(+m[1], m[2] === 'Sí', feats);
    const mal = ['mal', 'malHcc', 'both'].includes(m[4]);
    const ben = ['ben', 'both'].includes(m[4]);
    const finalCat = liradsFinalCategory(false, false, adjustLiRadsForAF(base, mal, ben));
    assert.ok(snap.sticky.startsWith(`${finalCat} ${c.categories[finalCat]} `), `${name}: ${snap.sticky}`);
    n++;
  }
  assert.equal(n, 240);
  assert.ok(golden.lirads['TIV sí'].sticky.startsWith(liradsFinalCategory(true, null, null)));
  assert.ok(golden.lirads['TIV no, M sí'].sticky.startsWith(liradsFinalCategory(false, true, null)));
});

test('Nódulo pulmonar: estados del golden = recomendación calculada', () => {
  const c = es.calc.lungNodule;
  let n = 0;
  for (const [name, snap] of Object.entries(golden.lungNodule)) {
    const m = name.match(/^(fleischner|nccn) (solid|partSolid|ggn) (single|multiple) (low|high) size=(.*)$/);
    if (!m) continue;
    const size = parseFloat(m[5]);
    const hasSize = m[5] !== '' && !isNaN(size);
    if (!hasSize) { assert.equal(snap.sticky, null, name); n++; continue; }
    const rec = (m[1] === 'nccn' ? nccnRec : fleischnerRec)(c, m[2], m[3], m[4], size);
    assert.ok(snap.sticky.startsWith(`${rec} `), `${name}: ${snap.sticky}`);
    n++;
  }
  assert.equal(n, 312);
});

test('Nódulo pulmonar: la recomendación no cambia dentro de cada tramo de tamaño', () => {
  const c = es.calc.lungNodule;
  const bandOf = (size) => (size < NODULE_SIZE_LOWER ? 0 : size <= NODULE_SIZE_UPPER ? 1 : 2);
  for (const fn of [fleischnerRec, nccnRec]) {
    for (const [type] of NODULE_TYPES) for (const [count] of NODULE_COUNTS) for (const [risk] of NODULE_RISKS) {
      for (let tenth = 0; tenth <= 400; tenth++) {
        const size = tenth / 10;
        const band = NODULE_SIZE_BANDS[bandOf(size)];
        assert.equal(fn(c, type, count, risk, size), fn(c, type, count, risk, band.sample), `${fn.name} ${type} ${count} ${risk} ${size} mm`);
      }
    }
  }
});

// Percentil del CAC: Javaid 2022 (30-44 años) y MESA (45-84). Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../../src/i18n/strings.js';
import { cacPercentile, cacSource, JAVAID, DEFAULT_GROUP, MESA_GROUPS } from '../../src/calculators/logic/cacPercentile.js';
import { MESA } from '../../src/calculators/logic/cacPercentileMesa.js';

const band = (r) => [r.lower, r.upper];

test('fuente según edad: 30-44 Javaid, 45-84 MESA', () => {
  assert.equal(cacSource(29), null);
  assert.equal(cacSource(30), 'javaid');
  assert.equal(cacSource(44), 'javaid');
  assert.equal(cacSource(45), 'mesa');
  assert.equal(cacSource(84), 'mesa');
  assert.equal(cacSource(85), null);
  assert.equal(cacSource(44.5), null);
  assert.deepEqual(DEFAULT_GROUP, { javaid: 'white', mesa: 'hispanic' });
});

test('Javaid: ejemplo del paper (hombre blanco 36 años, CAC 8 → percentil 91)', () => {
  assert.deepEqual(band(cacPercentile({ age: 36, sex: 'male', group: 'white', cac: 8 })), [90, 95]);
});

test('Javaid: límites (≥ valor del percentil queda sobre él)', () => {
  // Hombre blanco 44: P75 3, P90 43, P95 105, P97,5 190
  assert.deepEqual(band(cacPercentile({ age: 44, sex: 'male', group: 'white', cac: 2 })), [null, 75]);
  assert.deepEqual(band(cacPercentile({ age: 44, sex: 'male', group: 'white', cac: 3 })), [75, 90]);
  assert.deepEqual(band(cacPercentile({ age: 44, sex: 'male', group: 'white', cac: 43 })), [90, 95]);
  assert.deepEqual(band(cacPercentile({ age: 44, sex: 'male', group: 'white', cac: 190 })), [97.5, null]);
  assert.equal(cacPercentile({ age: 44, sex: 'male', group: 'white', cac: 0 }).zero, true);
  assert.equal(cacPercentile({ age: 40, sex: 'male', group: 'hispanic', cac: 5 }), null);
});

test('Javaid: en mujeres, cualquier CAC > 0 queda sobre el P90', () => {
  for (const group of ['white', 'black']) for (let age = 30; age <= 44; age++) {
    const r = cacPercentile({ age, sex: 'female', group, cac: 1 });
    assert.ok(r.lower >= 90, `${group} ${age}`);
  }
});

test('Javaid: tabla con 16 edades y percentiles en orden creciente por edad', () => {
  for (const g of Object.values(JAVAID)) for (const t of Object.values(g)) {
    for (const k of [75, 90, 95, 97.5]) assert.equal(t[k].length, 16);
    for (let i = 0; i < 16; i++) assert.ok(t[75][i] <= t[90][i] && t[90][i] <= t[95][i] && t[95][i] <= t[97.5][i]);
  }
});

// McClelland 2006, Tabla 2: percentiles 25/50/75/90 estimados a la mitad de cada
// decenio (50, 60, 70 y 80 años). El calculador oficial debe dar lo mismo.
const TABLE2 = {
  white: { female: [[0, 0, 0, 8], [0, 0, 16, 102], [0, 13, 119, 391], [20, 106, 370, 921]], male: [[0, 0, 22, 110], [0, 28, 155, 452], [21, 145, 540, 1345], [103, 385, 1200, 2933]] },
  chinese: { female: [[0, 0, 0, 12], [0, 0, 18, 105], [0, 5, 70, 246], [0, 32, 146, 398]], male: [[0, 0, 14, 89], [0, 5, 67, 242], [0, 34, 174, 487], [11, 81, 305, 769]] },
  black: { female: [[0, 0, 0, 9], [0, 0, 5, 74], [0, 0, 77, 310], [0, 47, 214, 582]], male: [[0, 0, 2, 45], [0, 0, 40, 173], [0, 32, 191, 575], [23, 141, 516, 1281]] },
  hispanic: { female: [[0, 0, 0, 2], [0, 0, 2, 50], [0, 1, 51, 203], [0, 45, 205, 557]], male: [[0, 0, 9, 88], [0, 3, 75, 291], [1, 56, 247, 666], [36, 153, 494, 1221]] },
};

test('MESA: 40 edades por grupo y sexo; a los 50, 60, 70 y 80 años coincide con la Tabla 2', () => {
  for (const group of MESA_GROUPS) for (const sex of ['female', 'male']) {
    const rows = MESA[group][sex];
    assert.equal(rows.length, 40, `${group} ${sex}`);
    [50, 60, 70, 80].forEach((age, i) => {
      assert.deepEqual(rows[age - 45].slice(1), TABLE2[group][sex][i], `${group} ${sex} ${age}`);
    });
    for (const [p, a, b, c, d] of rows) assert.ok(p > 0 && p < 100 && a <= b && b <= c && c <= d);
  }
});

test('MESA: hombre blanco de 45 años con CAC 40 queda en o sobre el P90 (Javaid 2022, Discusión)', () => {
  const r = cacPercentile({ age: 45, sex: 'male', group: 'white', cac: 40 });
  assert.equal(r.source, 'mesa');
  assert.equal(r.lower, 90);
});

test('MESA: con CAC > 0 el límite inferior es el % con CAC 0 si es mayor', () => {
  // Hombre blanco 60: 68 % con CAC > 0 (→ sobre P32); P25 0, P50 28.
  assert.equal(MESA.white.male[15][0], 68);
  assert.deepEqual(band(cacPercentile({ age: 60, sex: 'male', group: 'white', cac: 8 })), [32, 50]);
  assert.deepEqual(band(cacPercentile({ age: 60, sex: 'male', group: 'white', cac: 28 })), [50, 75]);
});

test('MESA: % con CAC 0 igual al P25 (redondeo) → en torno al P25', () => {
  assert.deepEqual(MESA.white.male[64 - 45].slice(0, 2), [75, 2]);
  assert.deepEqual(band(cacPercentile({ age: 64, sex: 'male', group: 'white', cac: 1 })), [25, 25]);
});

test('Textos del percentil en ES/EN', () => {
  for (const lang of ['es', 'en']) {
    const p = STRINGS[lang].calc.cadrads.pct;
    const a = p.result(cacPercentile({ age: 36, sex: 'male', group: 'white', cac: 8 }), 36, 'male', '8');
    assert.match(a, /Agatston (CAC )?8/);
    assert.match(a, /Javaid 2022/);
    assert.match(a, lang === 'es' ? /entre el P90 y el P95/ : /between the P90 and the P95/);
    const b = p.result(cacPercentile({ age: 60, sex: 'female', group: 'hispanic', cac: 0 }), 60, 'female', '0');
    assert.match(b, /MESA/);
    assert.match(b, /CAC 0/);
    assert.match(p.result(cacPercentile({ age: 64, sex: 'male', group: 'white', cac: 1 }), 64, 'male', '1'), lang === 'es' ? /en torno al P25/ : /approximately at the P25/);
    const c = p.result(cacPercentile({ age: 44, sex: 'male', group: 'white', cac: 500 }), 44, 'male', '500');
    assert.match(c, lang === 'es' ? /en o sobre el P97,5/ : /at or above the P97\.5/);
  }
});

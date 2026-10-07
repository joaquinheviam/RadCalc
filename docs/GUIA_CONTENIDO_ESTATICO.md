# Guía: contenido estático "Criterios y referencias"

Esta guía explica cómo extender a otras calculadoras la sección «Criterios y referencias»: el texto de las reglas que viene en el HTML de cada página, sin JavaScript. Está pensada para que otro asistente de código continúe el trabajo sin releer todo el repositorio.

**Piloto terminado:** `tirads`, `lirads`, `lungNodule`. Al final de esta guía están las 58 calculadoras que faltan.

## 1. Cómo funciona

- Las reglas clínicas (puntos, umbrales, árboles) están **dentro de cada componente** `src/calculators/<Nombre>.jsx`, no en datos. Los textos están en `src/i18n/strings.{es,en}.js` (`calc.<id>`) y las referencias en `src/i18n/references.js` (`REFERENCES.<id>`).
- Por eso no hay un script único que sirva para todas. Cada calculadora se extrae a mano siguiendo el patrón de la sección 2, y desde ahí todo lo demás se genera solo.

| Pieza | Archivo | Qué hace |
|---|---|---|
| Lógica pura | `src/calculators/logic/<id>.js` | Funciones y constantes sin React, movidas tal cual desde el componente. La usan la calculadora y la ficha. |
| Ficha | `src/criteria/<id>.js` | `build<Id>Criteria(t)` devuelve la ficha (spec): variables, reglas, resultados, referencias y pendientes. Las tablas se obtienen **evaluando** la lógica. |
| Identificación | `src/criteria/meta.js` | Sistema, versión, organismo, textos de alcance y `evidence` (de qué referencia sale cada dato). |
| Comunes | `src/criteria/common.js` | `baseSpec(id, t)`: identificación, alcance, referencias (filtra las no primarias), fecha y pendientes. También `groupRuns()`. |
| Renderer | `src/criteria/render.js` | `renderCriteriaHtml(spec, t.criteria)` es el **único** HTML. Lo usan el prerender y React. |
| Índice | `src/criteria/index.js` | `CRITERIA_BUILDERS`: qué calculadoras tienen ficha. Lo leen el prerender, `llms.txt` y la verificación. |
| React | `src/components/shared/CriteriaReferences.jsx` | `<CriteriaReferences build={...} />` al pie de la calculadora: misma sección, visible después de que carga la app. |
| Prerender | `scripts/prerender-seo.mjs` | Inserta título, subtítulo y sección dentro de `#root` de `/es\|en/calc/<id>/`. Genera `dist/llms.txt`. |
| Fechas | `scripts/calc-dates.mjs` → `src/criteria/lastUpdated.js` | Fecha del último commit que tocó la calculadora. Corre en `prebuild`. |
| Rótulos | `criteria` en `strings.{es,en}.js` | Rótulos generales y `criteria.calc.<id>` para los títulos de bloques propios de cada calculadora. |

React monta con `createRoot` y reemplaza todo `#root`. La sección sigue visible porque el componente la vuelve a dibujar con el mismo renderer: el contenido es el mismo para usuarios y para bots, sin texto oculto.

## 2. Patrón exacto para una calculadora nueva

Hazlo en este orden y haz commit en cada paso.

1. **Golden antes de tocar nada.** En `tests/characterization/scenarios.mjs`, agrega `<id>Scenarios()` y regístrala en `CALCS`. Copia el estilo de los tres existentes: pasos `['click', textoDelContenedor, textoDelBotón]` o `['fill', placeholder, valor]`, con los textos tomados de `STRINGS.es.calc.<id>`. Cubre todas las combinaciones razonables, valores límite incluidos (p. ej. 5,9 / 6 / 8 / 8,4 mm). Luego, sobre el código **sin cambios**:
   ```bash
   npm run build && git restore public/sitemap.xml
   npx vite preview --port 4173   # en otra terminal
   node tests/characterization/capture.mjs --only <id> --out /tmp/g.json
   ```
   Agrega `g.json[<id>]` a `tests/characterization/golden.json`, sin borrar las otras claves. Graba también las capturas de pantalla de referencia: agrega estados en `STATES` de `screens.mjs` y corre `node tests/characterization/screens.mjs --out <carpeta-antes>`. Commit con `[sin-cambio-clinico]` en el mensaje.
2. **Extraer la lógica** a `src/calculators/logic/<id>.js`.
   - **Copia literal**: no corrijas nada aunque parezca un error. Si algo parece mal, anótalo en pendientes.
   - Pon nombre a los números mágicos (`NODULE_SIZE_LOWER = 6`).
   - Exporta las listas de opciones como pares `[clave, claveDelTexto]` (`LIRADS_FEATURES`), para que el componente y la ficha recorran lo mismo.
   - El componente importa desde ahí. Commit con `[sin-cambio-clinico]`.
3. **Comprobar que nada cambió:**
   ```bash
   npm run build && git restore public/sitemap.xml
   node tests/characterization/capture.mjs --compare tests/characterization/golden.json   # debe decir OK
   node tests/characterization/screens.mjs --out <carpeta-despues> --compare <carpeta-antes>
   ```
   Agrega pruebas `node:test` en `tests/logic/` que comparen la lógica con el golden (ver `pilot.test.mjs`).
4. **Ficha** `src/criteria/<id>.js`: copia la de `tirads.js` (ejemplo completo abajo). Reglas:
   - Variables: nombre, definición, valores y unidad, sacados de `t.calc.<id>`.
   - Reglas y resultados: tablas armadas **llamando** a las funciones de la lógica sobre todas las entradas o tramos. Nunca escribas el resultado de una regla como texto.
   - Para tablas con rangos, agrupa con `groupRuns`.
   - Lo que no esté en el repositorio va a `spec.pending.push('...')`.
5. **Meta** en `src/criteria/meta.js`: `system`, `version`, `organization`, `evidence` (textos que deben aparecer en `REFERENCES.<id>[ref]`), `scope` (`'subtitle'` o `'usage.N'`) y `exclusionsStated`.
6. **Rótulos nuevos** (títulos de bloques) en `criteria.calc.<id>` de **ambos** `strings.es.js` y `strings.en.js`. No toques el bloque `calc.<id>`: cambiaría la fecha de la calculadora y lo que ve el usuario.
7. **Registrar:**
   - `CRITERIA_BUILDERS` en `src/criteria/index.js`;
   - en el componente: `import { build<Id>Criteria } from '../criteria/<id>.js';` y `<CriteriaReferences build={build<Id>Criteria} />` justo después de `<References items={REFERENCES.<id>} />`.
8. **Verificar** (sección 5) y commit.
   - **Ojo con la marca:** `scripts/calc-dates.mjs` ignora todo commit cuyo mensaje contenga `[sin-cambio-clinico]` en **cualquier parte**, título o cuerpo. Agregar la sección no es un cambio clínico, así que incluye la marca para que la fecha de la calculadora no salte a hoy.
   - Al revés: **no menciones la marca** en el mensaje de un commit que sí cambia reglas o textos clínicos.

## 3. Ejemplo completo: ACR TI-RADS

**Lógica** (`src/calculators/logic/tirads.js`): son los mismos números y cortes que antes estaban en `TIRADS.jsx`.
```js
export const TIRADS_POINTS = {
  composition: [0, 0, 1, 2],
  echogenicity: [0, 1, 2, 3],
  shape: [0, 3],
  margin: [0, 0, 2, 3],
  echogenicFoci: [0, 1, 2, 3],
};
export const TIRADS_SINGLE_CHOICE = ['composition', 'echogenicity', 'shape', 'margin'];
export const TIRADS_MULTI_CHOICE = 'echogenicFoci';

export function tiradsPoints(selections) {
  let pts = 0;
  TIRADS_SINGLE_CHOICE.forEach(cat => {
    if (selections[cat] !== null) pts += TIRADS_POINTS[cat][selections[cat]];
  });
  selections[TIRADS_MULTI_CHOICE].forEach(i => { pts += TIRADS_POINTS[TIRADS_MULTI_CHOICE][i]; });
  return pts;
}
export function tiradsCategory(pts) {
  if (pts === 0) return 'TR1';
  if (pts <= 2) return 'TR2';
  if (pts === 3) return 'TR3';
  if (pts <= 6) return 'TR4';
  return 'TR5';
}
export const TIRADS_CATEGORY_COLOR = { TR1: 'text-emerald-500', TR2: 'text-emerald-500', TR3: 'text-amber-500', TR4: 'text-orange-500', TR5: 'text-red-500' };
export function tiradsMaxPoints() {
  const single = TIRADS_SINGLE_CHOICE.reduce((s, cat) => s + Math.max(...TIRADS_POINTS[cat]), 0);
  return single + TIRADS_POINTS[TIRADS_MULTI_CHOICE].reduce((s, p) => s + p, 0);
}
```

**Componente** (`TIRADS.jsx`). Estos son los únicos cambios:
```jsx
import { TIRADS_POINTS, tiradsPoints, tiradsCategory, TIRADS_CATEGORY_COLOR } from './logic/tirads.js';
import { buildTiradsCriteria } from '../criteria/tirads.js';
// ... (CriteriaReferences se agrega al import de ../components/shared/index.js)
const pts = tiradsPoints(selections);
const catKey = tiradsCategory(pts);
const color = TIRADS_CATEGORY_COLOR[catKey];
// ...
<References items={REFERENCES.tirads} />
<CriteriaReferences build={buildTiradsCriteria} />
```

**Meta** (`src/criteria/meta.js`):
```js
tirads: {
  system: 'ACR TI-RADS',
  version: '2017',
  organization: 'American College of Radiology (ACR)',
  evidence: [{ ref: 0, contains: ['ACR Thyroid Imaging, Reporting and Data System (TI-RADS)', 'ACR TI-RADS Committee', '2017'] }],
  scope: ['subtitle', 'usage.2'],
  exclusionsStated: false, // no hay exclusiones explícitas: queda pendiente
},
```

**Rótulos** (`strings.es.js`, y lo equivalente en `strings.en.js`):
```js
criteria: { /* rótulos generales ... */
  calc: {
    tirads: {
      pointsTitle: 'Puntos por característica',
      categoryTitle: 'Del puntaje total a la categoría TR, con umbrales de tamaño para PAAF y seguimiento',
    },
  },
},
```

**Ficha** (`src/criteria/tirads.js`):
```js
import { TIRADS_POINTS, TIRADS_SINGLE_CHOICE, TIRADS_MULTI_CHOICE, tiradsCategory, tiradsMaxPoints } from '../calculators/logic/tirads.js';
import { baseSpec, groupRuns } from './common.js';

export function buildTiradsCriteria(t) {
  const c = t.calc.tirads;
  const L = t.criteria;
  const LC = L.calc.tirads;
  const spec = baseSpec('tirads', t); // identificación, alcance, referencias, fecha, pendientes
  const keys = Object.keys(c.criteria);

  // Variables: textos de la calculadora + puntos de la lógica.
  spec.variables = keys.map((key) => {
    const cr = c.criteria[key];
    const multi = key === TIRADS_MULTI_CHOICE;
    return {
      name: multi ? `${cr.title} — ${L.multiSelect}` : cr.title,
      definition: cr.hint,
      values: cr.options.map((opt, i) => `${opt} (${TIRADS_POINTS[key][i]} ${c.points})`),
      unit: L.unitPoints,
    };
  });

  // Regla 1: tabla de puntos, directo de TIRADS_POINTS.
  spec.rules.push({
    title: LC.pointsTitle,
    paragraphs: [c.usage[0]],
    table: {
      headers: [L.criterion, L.option, L.points],
      rows: keys.flatMap((key) => c.criteria[key].options.map((opt, i) => [c.criteria[key].title, opt, String(TIRADS_POINTS[key][i])])),
    },
  });

  // Regla 2: rangos de puntaje por categoría, evaluando tiradsCategory en
  // todos los puntajes posibles (0..17) y agrupando los iguales.
  const scores = Array.from({ length: tiradsMaxPoints() + 1 }, (_, i) => i);
  const ranges = groupRuns(scores, tiradsCategory).map(({ items, value }) => {
    const lo = items[0], hi = items[items.length - 1];
    const label = lo === hi ? `${lo}` : hi === tiradsMaxPoints() ? `≥ ${lo}` : `${lo}–${hi}`;
    return [value, label];
  });
  const mgmt = Object.fromEntries(c.managementRows.map((row) => [row[0], row]));
  const [hCat, hScore, hRisk, hFna, hFollow] = c.managementHeaders;
  spec.rules.push({
    title: LC.categoryTitle,
    paragraphs: [c.usage[1]],
    table: {
      headers: [hCat, `${hScore} (${L.points.toLowerCase()})`, hRisk, hFna, hFollow],
      rows: ranges.map(([cat, label]) => [cat, label, mgmt[cat][2], mgmt[cat][3], mgmt[cat][4]]),
    },
  });

  // Resultados posibles.
  spec.results.push({
    table: {
      headers: [L.category, L.meaning, L.recommendation],
      rows: ranges.map(([cat]) => [cat, c.categories[cat].risk, c.categories[cat].recs]),
    },
  });

  // Discrepancias lógica vs. tabla escrita: se informan, no se corrigen.
  ranges.forEach(([cat, label]) => {
    const written = (mgmt[cat] || [])[1] || '';
    const normalized = written.replace(/\s*pts?$/, '').replace('-', '–').replace('≥', '≥ ').replace(/\s+/g, ' ').trim();
    if (normalized !== label) spec.pending.push(`Tabla de manejo: ${cat} dice "${written}" pero la calculadora asigna ${cat} a ${label} puntos.`);
  });
  if (TIRADS_SINGLE_CHOICE.length + 1 !== keys.length) spec.pending.push('Los criterios de strings no coinciden con los de la lógica.');
  return spec;
}
```

Un bloque de `rules` o `results` es `{ title, paragraphs, list, ordered, table: { headers, rows }, after }`. La primera columna de cada fila sale como `<th scope="row">`.

**Resultado sin JavaScript** (`curl -s https://<host>/es/calc/tirads/`): se leen `Composición Espongiforme 0` … y `TR3 3 Levemente sospechoso (2-5%) ≥ 2.5 cm ≥ 1.5 cm`.

- **Árboles de decisión** (como el Paso 1 de `lungNodule`): el flujo se extrae a un objeto que usan los botones y la ficha, `PFN_FLOW = { gate1: { yes: 'gate2', no: 'result-notpfn' }, … }`.
- **Matrices** (como `lirads`): la ficha recorre todas las combinaciones y agrupa las filas iguales.
- **Umbrales continuos**: se definen tramos con un valor de muestra (`NODULE_SIZE_BANDS`), y una prueba verifica que la recomendación no cambie dentro de cada tramo.

Ver `src/criteria/lirads.js` y `src/criteria/lungNodule.js`.

## 4. Reglas para no inventar contenido

1. **Fuente única.** Todo texto de reglas sale de la lógica o de `t.calc.<id>`. No escribas a mano umbrales, puntos ni resultados en la ficha ni en strings.
2. **Nada de memoria.** Si falta versión, organismo, exclusiones, definición, una regla o una referencia, **no la completes**: agrégala a `spec.pending` y a `docs/criterios-pendientes.md`.
3. **Referencias** solo de `REFERENCES.<id>`: artículos revisados por pares o documentos oficiales. `common.js` omite Radiology Assistant y Radiopaedia, y los deja como pendientes. No agregues DOI ni PMID que no estén en el repositorio.
4. **Identificación respaldada.** Cada dato de `meta.js` lleva `evidence`, y `npm test` comprueba que ese texto esté en la referencia.
5. **No corregir sin preguntar.** Si la lógica y los textos no calzan (p. ej. TR2 «2 pts» frente a 1–2 en el código), la ficha publica lo que **hace** la calculadora y la discrepancia va a pendientes.
6. **No cambiar comportamiento ni aspecto.** La extracción es literal. El golden y las capturas deben dar OK.
7. **Fecha.** «Última actualización» = fecha del último commit que modificó la calculadora (`calc-dates.mjs`). No es fecha de revisión, y nunca la fecha de hoy.
8. **Visible para todos.** Nada de texto oculto ni contenido solo para bots: el mismo renderer en el prerender y en React.

## 5. Verificación

```bash
npm test                                   # lógica vs golden + fichas (node --test)
npm run build && git restore public/sitemap.xml
npx vite preview --port 4173               # en otra terminal
node tests/characterization/capture.mjs --compare tests/characterization/golden.json
node tests/characterization/screens.mjs --out <carpeta-despues> --compare <carpeta-antes>
node scripts/verify-static.mjs --ids tirads,lirads,lungNodule        # sin JS; exit 1 si falta algo
node scripts/verify-static.mjs https://<url-de-vista-previa> --md resultado.md
```

- `verify-static.mjs` recorre todas las rutas `/es|en/calc/<id>/` sin ejecutar JavaScript. Revisa sistema, versión, organismo, alcance, exclusiones, variables, reglas, resultados, referencias y fecha. También comprueba que la portada, `sitemap.xml` y `llms.txt` enlacen todas las calculadoras, y corre la prueba de aceptación de TI-RADS.
- Sin `--ids` exige las 61 calculadoras. Agrega cada `<id>` nuevo a `--ids` a medida que avances.
- **Playwright** no está en `package.json`. Se usa la instalación global: `npm i -g playwright && npx playwright install chromium`. En la nube ya está en `/opt/node22/lib/node_modules/playwright`, y `tests/lib/playwright.mjs` lo encuentra solo.
- **Service worker:** las pruebas bloquean el service worker. En un navegador real que ya visitó el sitio, la PWA sirve el build anterior hasta que se acepta la actualización. Para revisar a mano, desregístralo.

## 6. Calculadoras pendientes (58)

- «Bloques fuera del componente»: constantes o funciones ya separadas arriba del componente, que son más fáciles de mover.
- «Todo dentro del componente»: hay que identificar la lógica dentro del JSX.
- «Ref. no primaria»: tiene referencias de Radiology Assistant, que la sección omitirá. Hay que pedir al autor una fuente primaria.

Pendientes de datos ya conocidos: ver `docs/criterios-pendientes.md`.

| id | categoría | archivo | líneas | lógica | nota |
|---|---|---|---|---|---|
| mediastinalMass | torax | MediastinalMass.jsx | 365 | 4 bloque(s) fuera del componente |  |
| thymic | torax | ThymicFat.jsx | 414 | 11 bloque(s) fuera del componente |  |
| ntmBcd | torax | NTMBcdScore.jsx | 82 | 1 bloque(s) fuera del componente |  |
| peQanadli | torax | PEQanadli.jsx | 372 | 2 bloque(s) fuera del componente |  |
| vdt | torax | VDT.jsx | 386 | 1 bloque(s) fuera del componente |  |
| lungRads | torax | LungRADS.jsx | 199 | 1 bloque(s) fuera del componente |  |
| lungScreening | torax | LungScreening.jsx | 105 | todo dentro del componente |  |
| lungCysts | torax | LungCysts.jsx | 121 | todo dentro del componente | Ref. no primaria |
| ildClassifier | torax | ILDClassifier.jsx | 925 | todo dentro del componente |  |
| epidExtent | torax | EPIDExtent.jsx | 202 | 2 bloque(s) fuera del componente |  |
| thoracicglossary | torax | ThoracicGlossary.jsx | 133 | 1 bloque(s) fuera del componente | sin fecha fiable desde git |
| pectusHallerCI | torax | PectusHallerCI.jsx | 208 | todo dentro del componente |  |
| lungCancerTNM9 | torax | LungCancerTNM9.jsx | 880 | 4 bloque(s) fuera del componente |  |
| cadrads | cardio | CADRADS.jsx | 102 | todo dentro del componente |  |
| cardiacSiderosis | cardio | CardiacSiderosis.jsx | 372 | 1 bloque(s) fuera del componente |  |
| mriFf | abdomen | MRIFatFraction.jsx | 143 | todo dentro del componente |  |
| siderosis | abdomen | HepaticSiderosis.jsx | 139 | 2 bloque(s) fuera del componente |  |
| liradsTr | abdomen | LIRADSTreatmentResponse.jsx | 145 | 2 bloque(s) fuera del componente |  |
| liradsUs | abdomen | LIRADSUS.jsx | 165 | todo dentro del componente |  |
| pancreatitisAtlanta | abdomen | PancreatitisAtlanta.jsx | 195 | todo dentro del componente |  |
| pancreasResect | abdomen | PancreasResect.jsx | 96 | 1 bloque(s) fuera del componente |  |
| pancreaticCystDx | abdomen | PancreaticCystDx.jsx | 362 | 1 bloque(s) fuera del componente |  |
| pancreaticCyst | abdomen | PancreaticCyst.jsx | 645 | todo dentro del componente |  |
| cholangiocarcinoma | abdomen | Cholangiocarcinoma.jsx | 201 | todo dentro del componente |  |
| spleenSize | abdomen | SpleenSize.jsx | 137 | todo dentro del componente |  |
| splenicLesion | abdomen | SplenicLesion.jsx | 386 | 3 bloque(s) fuera del componente |  |
| adrenalCt | abdomen | AdrenalWashout.jsx | 322 | 2 bloque(s) fuera del componente |  |
| adrenalMri | abdomen | AdrenalCSI.jsx | 141 | todo dentro del componente |  |
| aast2018 | abdomen | AAST2018.jsx | 152 | 2 bloque(s) fuera del componente |  |
| crads2023 | abdomen | CRADS2023.jsx | 168 | 2 bloque(s) fuera del componente |  |
| rectalCancer | abdomen | RectalCancerMRI.jsx | 659 | 1 bloque(s) fuera del componente |  |
| psad | gu | PSADCalculator.jsx | 110 | todo dentro del componente |  |
| pirads | gu | PIRADS.jsx | 222 | 1 bloque(s) fuera del componente |  |
| renalScore | gu | RenalScore.jsx | 125 | todo dentro del componente |  |
| bosniak | gu | Bosniak.jsx | 121 | todo dentro del componente | Ref. no primaria |
| ccls | gu | CCLS.jsx | 433 | 2 bloque(s) fuera del componente |  |
| virads | gu | VIRADS.jsx | 299 | 1 bloque(s) fuera del componente |  |
| orads | gyn | ORADS.jsx | 124 | todo dentro del componente (árbol ya en strings: `start`, `next`) |  |
| leiomyoma | gyn | UterineFibroids.jsx | 588 | 2 bloque(s) fuera del componente |  |
| adnexalIncidental | gyn | AdnexalIncidental.jsx | 294 | 8 bloque(s) fuera del componente |  |
| ovarianNeoplasmDx | gyn | OvarianNeoplasmDx.jsx | 465 | 1 bloque(s) fuera del componente |  |
| mullerianAnomalies | gyn | MullerianAnomalies.jsx | 887 | 5 bloque(s) fuera del componente |  |
| adnexalRisk | gyn | AdnexalRisk.jsx | 560 | 1 bloque(s) fuera del componente |  |
| biradsMammo | breast | BiradsMammography.jsx | 443 | 2 bloque(s) fuera del componente | Ref. no primaria |
| biradsUs | breast | BiradsUltrasound.jsx | 452 | 2 bloque(s) fuera del componente | Ref. no primaria |
| boneRads | msk | BoneRADS.jsx | 186 | 1 bloque(s) fuera del componente |  |
| mirels | msk | Mirels.jsx | 106 | todo dentro del componente |  |
| bactip | msk | BACTIP.jsx | 142 | todo dentro del componente |  |
| kellgrenLawrence | msk | KellgrenLawrence.jsx | 226 | 3 bloque(s) fuera del componente |  |
| tlics | msk | TLICS.jsx | 129 | todo dentro del componente |  |
| aspects | neuro | ASPECTS.jsx | 167 | 1 bloque(s) fuera del componente |  |
| abc2Hematoma | neuro | ABC2Hematoma.jsx | 153 | 2 bloque(s) fuera del componente |  |
| nascetStenosis | neuro | NASCETStenosis.jsx | 264 | 2 bloque(s) fuera del componente |  |
| fazekasScale | neuro | FazekasScale.jsx | 141 | 2 bloque(s) fuera del componente |  |
| sahGrading | neuro | SAHGrading.jsx | 200 | 1 bloque(s) fuera del componente |  |
| sins | neuro | SINS.jsx | 110 | todo dentro del componente |  |
| pecarn | neuro | Pecarn.jsx | 189 | todo dentro del componente |  |
| brainAvm | neuro | BrainAVM.jsx | 411 | todo dentro del componente |  |

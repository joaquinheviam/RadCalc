# RadioCalc Clinical

Calculadoras radiológicas para la práctica clínica diaria — PSAD, TI-RADS, O-RADS, PI-RADS, VI-RADS, LI-RADS, CAD-RADS, Lung-RADS, Bosniak, ccLS, clasificación FIGO de miomas, y más. Bilingüe (ES/EN), con buscador, modo oscuro, e instalable como PWA (funciona sin conexión).

Si buscás cómo instalar, compilar y publicar el sitio paso a paso (sin necesidad de saber programar), leé **[INSTRUCCIONES.md](./INSTRUCCIONES.md)**. Este documento es sobre cómo está organizado el código y cómo agregarle una calculadora nueva.

## Stack técnico

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) — sin backend, todo corre en el navegador.
- [Tailwind CSS v4](https://tailwindcss.com/) para los estilos.
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — genera el service worker (funcionamiento sin conexión) y el manifest de la PWA.
- Sin base de datos ni servidor: los textos, calculadoras y referencias son archivos JavaScript planos dentro de `src/`.

## Estructura de carpetas

```
radiocalc-vite/
├── index.html                 # HTML raíz (lo procesa Vite)
├── vite.config.js             # Config de Vite, Tailwind y PWA (incluye el BASE_PATH de GitHub Pages)
├── public/                    # Archivos estáticos que se copian tal cual (favicon, íconos del manifest)
├── src/
│   ├── main.jsx                # Punto de entrada: monta <App /> y el aviso de actualización
│   ├── App.jsx                 # Pantalla principal: header, buscador, listado por categorías
│   ├── index.css               # Import de Tailwind + estilos globales mínimos
│   ├── hooks/
│   │   └── useLocalStorageState.js   # useState que además persiste en localStorage (idioma y tema)
│   ├── utils/
│   │   ├── clipboard.js        # copiar texto de informe al portapapeles
│   │   ├── mailto.js           # arma los links "mailto:" de reporte de error / sugerencia
│   │   └── searchNormalize.js  # normaliza texto para el buscador (sin tildes, minúsculas)
│   ├── i18n/
│   │   ├── LangContext.js      # contexto de React para idioma actual + textos + toggle
│   │   ├── strings.es.js       # TODOS los textos de la UI en español
│   │   ├── strings.en.js       # TODOS los textos de la UI en inglés
│   │   ├── strings.js          # junta ambos: STRINGS = { es, en }
│   │   ├── references.js       # referencias bibliográficas de cada calculadora (un solo idioma)
│   │   ├── searchTerms.es.js / .en.js / .js   # sinónimos/conceptos para el buscador, por calculadora
│   ├── components/
│   │   ├── icons/               # un archivo por ícono SVG (IconCopy.jsx, IconSearch.jsx, etc.) + index.js
│   │   ├── schematics/          # un archivo por esquema SVG dibujado a mano (DiagProstate.jsx, etc.) + index.js
│   │   └── shared/               # componentes reutilizables: Card, NumberField, StickyBar,
│   │                              # Accordion, References, UsageNotes, ReportBugLink, SiteFooter, etc.
│   ├── calculators/
│   │   ├── registry.js          # LISTA MAESTRA: qué calculadoras existen, en qué categoría y con qué componente
│   │   ├── PSADCalculator.jsx
│   │   ├── TIRADS.jsx
│   │   ├── ... (una por cada una de las 25 calculadoras)
│   └── pwa/
│       └── UpdateToast.jsx      # aviso "Nueva versión disponible · Actualizar"
└── .github/workflows/deploy.yml # publica automáticamente en GitHub Pages con cada push a main
```

## Cómo se arma una calculadora

Cada calculadora es un componente de React independiente en `src/calculators/`. Por convención:

- Obtiene el idioma y los textos con `const { t, lang } = useLang();` y `const c = t.calc.miId;`.
- Todo el texto visible sale de `c.algo` (nunca texto "hardcodeado" en el JSX), para que exista en español e inglés.
- Usa los componentes de `src/components/shared/` para mantener el mismo look & feel: `Card` como contenedor, `NumberField` para inputs numéricos, `StickyBar` + `ResetIconButton` + `CopyIconButton` para la barra de resultado fija abajo, `References` y `UsageNotes` para las secciones colapsables del final, `ReportBugLink` para los links de reportar error / sugerir.
- Si copia un resultado al portapapeles, usa `copyToClipboard(texto, t.common.copiedOk, t.common.copiedErr)`.
- Si tiene bibliografía, la trae de `REFERENCES.miId` (en `src/i18n/references.js`) y la muestra con `<References items={REFERENCES.miId} />`.

## Cómo agregar una calculadora nueva

Digamos que querés agregar una calculadora nueva con id `miNuevoScore`, en la categoría "Tórax".

### 1. Agregar los textos (ES y EN)

En `src/i18n/strings.es.js`, dentro de la clave `calc`, agregá una entrada nueva:

```js
calc: {
  // ...las demás calculadoras...
  miNuevoScore: {
    title: 'Mi Nuevo Score',
    // acá van todas las claves de texto que tu calculadora necesite:
    // preguntas, opciones, resultados, notas de uso, etc.
    usage: [
      'Primer párrafo de "Cómo se usa y puntos de corte".',
    ],
  },
},
```

Repetí lo mismo en `src/i18n/strings.en.js`, con el mismo id (`miNuevoScore`) y las claves traducidas al inglés. **Las claves (los nombres a la izquierda) deben ser idénticas en ambos archivos** — lo único que cambia es el texto.

### 2. Agregar las referencias bibliográficas (si aplica)

En `src/i18n/references.js`:

```js
export const REFERENCES = {
  // ...
  miNuevoScore: [
    'Autor AB, Autor CD. Título del artículo. Revista. Año;Volumen(Número):Páginas.',
  ],
};
```

### 3. Agregar términos de búsqueda

En `src/i18n/searchTerms.es.js` y `src/i18n/searchTerms.en.js`, agregá sinónimos o conceptos relacionados para que el buscador de la pantalla principal encuentre tu calculadora aunque no se escriba el título exacto:

```js
miNuevoScore: ['concepto uno', 'sinonimo', 'sigla'],
```

### 4. Crear el componente

Creá `src/calculators/MiNuevoScore.jsx`. La forma más simple es copiar un archivo parecido que ya exista (por ejemplo `src/calculators/ThymicFat.jsx`, que es de las más cortas) y adaptarlo. La estructura mínima:

```jsx
import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

export default function MiNuevoScore() {
  const { t } = useLang();
  const c = t.calc.miNuevoScore;
  const [valor, setValor] = useState(null);

  const resetAll = () => setValor(null);
  const handleCopy = () => {
    if (valor == null) return;
    copyToClipboard(`Resultado: ${valor}`, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className="space-y-4 pb-24 fade-in">
      <Card>
        {/* tus preguntas / inputs acá */}
      </Card>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.miNuevoScore} />
      <ReportBugLink calcTitle={c.title} />

      {valor != null && (
        <StickyBar>
          <div className="font-bold">{valor}</div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
            <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
    </div>
  );
}
```

Si tu calculadora necesita algún ícono, importalo desde `../components/icons/index.js` (por ejemplo `import { IconCheckCircle } from '../components/icons/index.js';`). Si necesitás un esquema SVG nuevo, agregalo como archivo nuevo en `src/components/schematics/` siguiendo el estilo de los que ya existen (usan la constante compartida `SVG_STROKE` de `svgStroke.js` para el trazo).

### 5. Registrarla

En `src/calculators/registry.js`:

1. Agregá el import (con carga diferida, igual que las demás):
   ```js
   const MiNuevoScore = lazy(() => import('./MiNuevoScore.jsx'));
   ```
2. Agregala al array `calculators`, en el bloque de la categoría que corresponda:
   ```js
   { id: 'miNuevoScore', catKey: 'torax', component: MiNuevoScore },
   ```

El `id` tiene que ser exactamente el mismo que usaste en `strings.es.js`, `strings.en.js`, `references.js` y `searchTerms.*.js`.

### 6. Probar

```
npm run dev
```

Buscá tu calculadora por su título o por alguno de los términos de búsqueda que agregaste, para confirmar que aparece en la categoría correcta y que el resultado y el botón de copiar funcionan.

## Categorías disponibles

Las categorías están definidas en `STRINGS.es.categories` / `STRINGS.en.categories` (en `strings.es.js` / `strings.en.js`) y en el orden de `categoryOrder` de `registry.js`:

- `cabezaCuello` — Cabeza y Cuello
- `torax` — Tórax
- `cardio` — Cardiovascular
- `abdomen` — Abdomen
- `gu` — Genitourinario
- `gyn` — Ginecología

Si en algún momento hace falta una categoría nueva, se agrega una clave más en `categories` (ambos idiomas) y se suma al array `categoryOrder`.

## Comandos disponibles

| Comando           | Qué hace                                                              |
|--------------------|------------------------------------------------------------------------|
| `npm install`      | Instala las dependencias (una vez, o cuando cambia `package.json`).   |
| `npm run dev`      | Corre el sitio en modo desarrollo, con recarga instantánea.           |
| `npm run build`    | Genera la versión final en `dist/` (lo que se publica).               |
| `npm run preview`  | Sirve localmente lo que generó `npm run build`, para probarlo antes de publicar (incluye el service worker de la PWA). |

## Publicar cambios

Ver **[INSTRUCCIONES.md](./INSTRUCCIONES.md)**, sección 8 — en resumen: `git add .`, `git commit -m "..."`, `git push`, y GitHub Actions publica solo.

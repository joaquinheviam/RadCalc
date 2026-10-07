# RadioCalc Clinical: guía para asistentes (Claude Code / Cowork)

Calculadoras radiológicas en https://radiocalc.app. Lo mantiene el Dr. Joaquín Hevia M., radiólogo: escribe en español y es quien valida el contenido clínico.

Stack: React 19 + Vite + Tailwind v4 + react-router + PWA (vite-plugin-pwa). Hosting en Vercel, que despliega `main`. Hay un proyecto Capacitor (Android) en `capacitor.config.json`. Rutas: `/:lang/` y `/:lang/calc/:id/`, con `lang` = `es` | `en`.

## Antes de trabajar
- Ejecuta `git pull` primero: se trabaja desde varias sesiones (Claude Code en la nube y Cowork en el PC) y la copia local puede estar atrasada.
- Si algo del código no aparece donde lo esperas, confirma que estás al día con `origin/main` antes de concluir que no existe.
- Los cambios van en una rama con un Pull Request, no directo a `main`. El autor suele fusionar rápido. Antes de cada push, revisa si el PR anterior ya se fusionó. Si se fusionó, recrea la rama desde `origin/main` y abre un PR nuevo, sin apilar commits sobre historia ya fusionada.

## Estructura
- `src/calculators/registry.js`: catálogo de calculadoras (`id`, `catKey`, componente con `lazy`). De ahí salen las rutas, el sitemap y el prerender.
- `src/calculators/<Nombre>.jsx`: una calculadora por archivo. Lee sus textos de `t.calc.<id>`. En casi todas, la lógica clínica (puntajes, umbrales, árboles) está **dentro del componente**; los textos están en strings.
- `src/i18n/strings.es.js` y `strings.en.js`: todos los textos (`common`, `categories`, `changelog`, `calc.<id>`). Cualquier texto nuevo va en los dos idiomas.
- `src/i18n/references.js`: `REFERENCES.<id>` = `[{ text, doi }]`.
- `src/i18n/searchTerms.es.js` / `.en.js`: sinónimos para el buscador de la portada.
- `src/components/shared/`: Card, NumberField (con `allowNegative` para UH negativas), Modal, StickyBar, ReportPreviewModal, Accordion, ZoomableDiagram, InfoBox (tonos: amber, emerald, red, slate), etc.
- `src/components/schematics/`: esquemas SVG.
- Instalación como app:
  - `src/pwa/installPrompt.js`: detecta el navegador y captura `beforeinstallprompt`.
  - `src/components/InstallGuide.jsx`: botón «Instalar» y guía por navegador.
  - `InstallPromptIOS.jsx` / `InstallPromptAndroid.jsx` / `InstallStepsBanner.jsx`: avisos iniciales.
- Portada:
  - `CategoryNav.jsx`: accesos por especialidad y «Personalizar» para fijarlas.
  - `LanguageRequestPrompt.jsx`: aviso «¿Necesitas RadioCalc en tu idioma?».
- Build:
  - `scripts/generate-sitemap.mjs` (prebuild): sitemap desde el registro.
  - `scripts/prerender-seo.mjs` (postbuild): clona `dist/index.html` por ruta y reemplaza solo el `<head>`: título, descripción (`src/utils/calcMetaDescription.js`), canonical y hreflang. **El `<body>` queda vacío hasta que corre React**: sin JavaScript, solo se ve el menú.
  - `scripts/postbuild.mjs`: genera `404.html`.

## Agregar una calculadora (checklist)
1. Componente en `src/calculators/`.
2. Entrada en `registry.js`.
3. `calc.<id>` en strings ES y EN (`title`, `subtitle`, `usage`, textos del informe).
4. `REFERENCES.<id>` con DOI.
5. `searchTerms` en ES y EN.
6. Entrada en el historial (`changelog.entries`) en ES y EN.

El sitemap y las páginas prerenderizadas salen solos al compilar.

Patrón de UI de cada calculadora: StickyBar con Reiniciar, **Ver informe** (ReportPreviewModal) y Copiar. `getReportText()` se evalúa en cada render (el modal lo recibe como prop): **debe devolver `''` si no hay resultado**. Si no, la página queda en blanco al abrirla.

## Reglas del proyecto
- **Historial de actualizaciones** (`changelog.entries` en ambos idiomas): solo cambios que le importan a radiólogos y clínicos, con fecha y referencias. No incluir cambios técnicos, de diseño o de SEO.
- **Fórmulas, umbrales y referencias:**
  - Verificar contra la fuente primaria (PubMed / documento oficial) y citar con DOI en `REFERENCES`.
  - No inventar cifras ni completar datos de memoria: si algo no se puede verificar, se pregunta.
  - No usar Radiopaedia ni resúmenes de IA como fuente.
- **Esquemas SVG hechos con Gemini:** se integran tal cual. Si algo parece estar mal, se pregunta antes de corregirlo.
- **Agradecimientos / donantes:** nunca mostrar montos.
- **Sitemap:** `public/sitemap.xml` se regenera en cada build con la fecha del día. No commitear ese cambio si no hubo cambios de contenido (`git restore public/sitemap.xml`).
- El disclaimer y el texto de donación llevan `data-nosnippet` para que Google no los use como resumen.
- Modales dentro de elementos con `backdrop-blur`: montarlos con `createPortal(…, document.body)`.

## Verificar
- **No hay suite de tests automatizados.** La verificación es:
  - `npm run build` sin errores.
  - Pruebas con Playwright contra `npx vite preview --port 4173`, en ancho de celular (375 px) y en modo oscuro (`localStorage['radiocalc:darkMode'] = 'true'`).
- En la nube, Playwright está instalado de forma global (`import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'`) y Chromium en `/opt/pw-browsers`. No ejecutar `playwright install`.
- Control útil: recorrer todas las rutas `/{es,en}/calc/<id>/` del registro y fallar si hay `pageerror` o si `<main>` queda vacío.

# RadioCalc Clinical: guía para asistentes (Claude Code / Cowork)

Calculadoras radiológicas en https://radiocalc.app. React 19 + Vite + Tailwind v4 + PWA (vite-plugin-pwa).

## Antes de trabajar
- Ejecuta `git pull` primero: se trabaja desde varias sesiones (Claude Code en la nube y Cowork en el PC) y la copia local puede estar atrasada.
- Si algo del código no aparece donde lo esperas, confirma que estás al día con `origin/main` antes de concluir que no existe.
- Los cambios van en una rama con un Pull Request, no directo a `main`.

## Estructura
- `src/calculators/`: una calculadora por archivo, registrada en el catálogo de `src/App.jsx`.
- `src/i18n/strings.es.js` y `strings.en.js`: todos los textos. Cualquier texto nuevo va en los dos idiomas.
- `src/components/shared/`: Card, NumberField (con `allowNegative` para UH negativas), Modal, StickyBar, etc.
- Instalación como app:
  - `src/pwa/installPrompt.js`: detecta el navegador y captura `beforeinstallprompt`.
  - `src/components/InstallGuide.jsx`: botón «Instalar» y guía por navegador.
  - `InstallPromptIOS.jsx` / `InstallPromptAndroid.jsx` / `InstallStepsBanner.jsx`: avisos iniciales.
- Portada:
  - `CategoryNav.jsx`: accesos por especialidad y «Personalizar» para fijarlas.
  - `LanguageRequestPrompt.jsx`: aviso «¿Necesitas RadioCalc en tu idioma?».
- `scripts/prerender-seo.mjs`: genera un HTML con metadatos por ruta. Corre en `npm run build`.

## Reglas del proyecto
- **Historial de actualizaciones** (`changelog.entries` en ambos idiomas): solo cambios que le importan a radiólogos y clínicos, con fecha y referencias. No incluir cambios técnicos, de diseño o de SEO.
- **Esquemas SVG hechos con Gemini:** se integran tal cual. Si algo parece estar mal, se pregunta antes de corregirlo.
- **Agradecimientos / donantes:** nunca mostrar montos.
- **Fórmulas y umbrales:** verificar contra la fuente primaria y citarla en `REFERENCES` (`src/i18n/references.js`).
- **Sitemap:** `public/sitemap.xml` se regenera en cada build con la fecha del día. No commitear ese cambio si no hubo cambios de contenido.
- El disclaimer y el texto de donación llevan `data-nosnippet` para que Google no los use como resumen.

## Verificar
- Ejecuta `npm run build` y asegúrate de que no haya errores.
- Para cambios visuales, prueba con Playwright contra `npx vite preview --port 4173`, en ancho de celular (375 px) y en modo oscuro.

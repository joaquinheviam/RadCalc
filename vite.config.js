import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// ============================================================
// BASE PATH: dónde vive el sitio dentro del dominio
// ------------------------------------------------------------
// Se lee de la variable de entorno VITE_BASE_PATH en el momento de
// compilar, para poder publicar el mismo proyecto en dos lugares
// distintos sin tocar el código:
//
//   - GitHub Pages publica en   https://<usuario>.github.io/<repositorio>/
//     (una subcarpeta) -> el workflow de GitHub Actions
//     (.github/workflows/deploy.yml) define VITE_BASE_PATH='/<repositorio>/'
//     antes de compilar.
//
//   - Vercel (y la mayoría de los otros hostings) publican en la RAÍZ
//     del dominio (https://tu-sitio.vercel.app/) -> no hace falta definir
//     nada ahí, por eso el valor por defecto es '/'.
//
// Ver INSTRUCCIONES.md, paso 5, para más detalle.
const BASE_PATH = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base: BASE_PATH,
  build: {
    rollupOptions: {
      output: {
        // Separa las librerías de terceros (React, React Router) del código
        // propio en archivos aparte. No reduce el peso total descargado en
        // la primera visita (la PWA de todas formas precachea todo el build
        // para funcionar offline), pero como esas librerías cambian mucho
        // menos seguido que el código propio, el navegador puede reutilizar
        // ese chunk en caché entre actualizaciones del sitio en vez de
        // volver a descargarlo cada vez que se publica una nueva versión.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-dom')) return 'vendor-react-dom';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
          return 'vendor';
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt', // no actualiza solo: avisa y espera que el usuario confirme
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        id: '/',
        name: 'RadioCalc Clinical',
        short_name: 'RadioCalc',
        description:
          'Calculadoras radiológicas clínicas: PSAD, fracción grasa por RM, lavado adrenal, siderosis hepática, TI-RADS, O-RADS, PI-RADS y más.',
        categories: ['medical', 'health', 'utilities'],
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        lang: 'es',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Accesos directos (jump list en Windows, menú de mantener presionado en Android)
        // a algunas de las calculadoras más usadas.
        shortcuts: [
          {
            name: 'PSAD y Volumen Prostático',
            short_name: 'PSAD',
            url: `${BASE_PATH}es/calc/psad`,
            description: 'Volumen prostático (fórmula elipsoide) y densidad de PSA',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'ACR TI-RADS (Tiroides)',
            short_name: 'TI-RADS',
            url: `${BASE_PATH}es/calc/tirads`,
            description: 'Estratificación de riesgo de nódulos tiroideos por ecografía',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'PI-RADS v2.1 (Próstata)',
            short_name: 'PI-RADS',
            url: `${BASE_PATH}es/calc/pirads`,
            description: 'Estratificación de riesgo de cáncer de próstata por RM multiparamétrica',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'ACR O-RADS MRI (Ovario)',
            short_name: 'O-RADS',
            url: `${BASE_PATH}es/calc/orads`,
            description: 'Estratificación de riesgo de masas anexiales por RM',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
        // Screenshots para el diálogo de instalación enriquecido (Chrome/Edge) y para
        // que PWABuilder pueda usarlas al armar la ficha de las tiendas.
        screenshots: [
          {
            src: 'screenshots/mobile-home.png',
            sizes: '420x900',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Listado de calculadoras en el celular',
          },
          {
            src: 'screenshots/desktop-home.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Listado de calculadoras en escritorio',
          },
        ],
      },
      workbox: {
        // precachea todo el build (JS/CSS/HTML/SVG/PNG) para que la app funcione sin conexión
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${BASE_PATH}index.html`,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false, // activar en true solo si querés probar el service worker con `npm run dev`
      },
    }),
  ],
});

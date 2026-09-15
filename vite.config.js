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

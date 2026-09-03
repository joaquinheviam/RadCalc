import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// ============================================================
// BASE PATH para GitHub Pages
// ------------------------------------------------------------
// Si publicás el sitio en https://<usuario>.github.io/<repositorio>/
// esta línea DEBE ser '/<repositorio>/' (con las barras).
// Si publicás en un dominio propio o en https://<usuario>.github.io/
// (repositorio "de usuario", nombre <usuario>.github.io), usá '/'.
// Ver INSTRUCCIONES.md, paso 5, para más detalle.
const BASE_PATH = '/radiocalc/';

export default defineConfig({
  base: BASE_PATH,
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

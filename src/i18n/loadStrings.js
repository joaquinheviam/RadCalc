// Carga los textos de cada idioma por separado (cada archivo pesa ~600 KB),
// para que la app solo descargue y procese el idioma que se está usando.
// El otro idioma se precarga en segundo plano (lo usan el buscador y el
// botón ES/EN). El service worker precachea ambos archivos, así que el
// funcionamiento sin conexión no cambia.
// Los scripts de build y las pruebas siguen usando ./strings.js (ambos idiomas).
import { IS_INTRANET } from '../utils/buildTarget.js';

const loaders = {
  es: () => import('./strings.es.js'),
  en: () => import('./strings.en.js'),
};
const cache = {};
const pending = {};

export function getStrings(lang) {
  return cache[lang] || null;
}

export function loadStrings(lang) {
  if (cache[lang]) return Promise.resolve(cache[lang]);
  if (!pending[lang]) {
    pending[lang] = loaders[lang]().then((m) => {
      cache[lang] = m.default;
      return cache[lang];
    }).catch((err) => {
      delete pending[lang];
      throw err;
    });
  }
  return pending[lang];
}

// Idioma de la URL actual (respeta el prefijo /RadCalc/ de GitHub Pages);
// si no hay, el último idioma usado.
export function initialLang() {
  try {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const path = IS_INTRANET ? window.location.hash.slice(1) : window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) : window.location.pathname;
    const seg = path.split('/').filter(Boolean)[0];
    if (seg === 'en' || seg === 'es') return seg;
    const stored = JSON.parse(window.localStorage.getItem('radiocalc:lang') || '"es"');
    return stored === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

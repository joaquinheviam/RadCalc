// Gestión imperativa de <title>, meta description, canonical y hreflang por
// ruta. No usamos una librería extra (react-helmet, etc.) porque son pocos
// tags y esto evita otra dependencia para algo tan puntual.
//
// Ojo: SEO_BASE_URL está fijo al dominio de producción en Vercel a propósito,
// aunque el sitio también se publique en GitHub Pages (VITE_BASE_PATH=/RadCalc/).
// Así, la copia de GitHub Pages se autodeclara "canónica hacia Vercel" y no
// compite por los mismos resultados de búsqueda (contenido duplicado).
export const SEO_BASE_URL = 'https://rad-calc.vercel.app';

function setMetaByAttr(attrName, attrValue, content) {
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkByRelAndHreflang(rel, href, hreflang) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Actualiza <title>, meta description/og:*, canonical y hreflang para la
 * ruta activa.
 *
 * @param {Object} params
 * @param {string} params.title - Título de la página (sin sufijo del sitio).
 * @param {string} params.description - Descripción corta (150-160 caracteres ideal).
 * @param {'es'|'en'} params.lang - Idioma de la ruta activa.
 * @param {string} params.pathSuffix - Sufijo de ruta SIN barra inicial ni el
 *   idioma (ej. '' para portada, 'calc/tirads' para una calculadora).
 */
export function updateSeoHead({ title, description, lang, pathSuffix = '' }) {
  document.title = title;
  setMetaByAttr('name', 'description', description);
  setMetaByAttr('property', 'og:title', title);
  setMetaByAttr('property', 'og:description', description);

  const buildUrl = (l) => `${SEO_BASE_URL}/${l}/${pathSuffix}`;
  const urlEs = buildUrl('es');
  const urlEn = buildUrl('en');
  const canonical = lang === 'en' ? urlEn : urlEs;

  setLinkByRelAndHreflang('canonical', canonical, null);
  setMetaByAttr('property', 'og:url', canonical);

  setLinkByRelAndHreflang('alternate', urlEs, 'es');
  setLinkByRelAndHreflang('alternate', urlEn, 'en');
  setLinkByRelAndHreflang('alternate', urlEs, 'x-default');
}

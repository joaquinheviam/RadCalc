// Meta description de cada calculadora: su subtítulo más una frase fija que
// describe qué ofrece la página. Varios subtítulos son muy cortos (p. ej.
// Mirels, PECARN) y, ante una descripción escueta, Google tiende a armar el
// resumen con otro texto visible de la página (como el descargo de
// responsabilidad). Se usa tanto en el prerender (scripts/prerender-seo.mjs)
// como al navegar dentro de la app (App.jsx), para que ambas coincidan.
export function calcMetaDescription(entry, t) {
  if (!entry || !entry.subtitle) return t.tagline;
  const subtitle = entry.subtitle.trim();
  const sep = /[.!?)]$/.test(subtitle) ? ' ' : '. ';
  return `${subtitle}${sep}${t.calcMetaSuffix}`;
}

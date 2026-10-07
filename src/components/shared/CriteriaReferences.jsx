import { useMemo } from 'react';
import { useLang } from '../../i18n/LangContext.js';
import { renderCriteriaHtml } from '../../criteria/render.js';

// Sección plegable "Criterios y referencias" al pie de una calculadora.
// Usa el mismo renderer que el prerender (scripts/prerender-seo.mjs), así que
// lo que ve el usuario es idéntico a lo que recibe un lector sin JavaScript.
// `build` es la función de la ficha (p. ej. buildTiradsCriteria).
// React solo reescribe el HTML si cambia el texto (p. ej. al cambiar de
// idioma), así que el <details> no se cierra al usar la calculadora.
export default function CriteriaReferences({ build }) {
  const { t } = useLang();
  const html = useMemo(() => renderCriteriaHtml(build(t), t.criteria), [build, t]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

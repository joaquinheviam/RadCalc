import { useLang } from '../../i18n/LangContext.js';

// Mismo texto de descargo de responsabilidad que aparece en el pie de la
// página principal (SiteFooter), pero repetido dentro de cada calculadora
// para que sea visible sin tener que volver al listado.
export default function CalcDisclaimer() {
  const { t } = useLang();
  return (
    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed text-center max-w-sm mx-auto py-1">
      {t.common.disclaimer}
    </p>
  );
}

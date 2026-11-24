import { useLang } from '../i18n/LangContext.js';
import { INTRANET_VERSION } from '../utils/buildTarget.js';

// Franja bajo la barra superior, solo en la versión para intranet: es una
// copia que no se actualiza sola, así que siempre muestra su versión.
export default function IntranetNotice() {
  const { t } = useLang();
  return (
    <div data-intranet-notice="" className="bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs px-4 py-1.5 text-center">
      <span className="font-semibold">{t.common.intranetVersion} {INTRANET_VERSION}</span>
      {' · '}{t.common.intranetVerify}
    </div>
  );
}

import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { IconX } from './icons/index.js';

// Aviso para quienes lleguen desde un dominio anterior (rad-calc.vercel.app o
// la copia en GitHub Pages, joaquinheviam.github.io/RadCalc/) ahora que el
// sitio vive en radiocalc.app. En radiocalc.app (o en desarrollo local) no se
// renderiza nada.
const OLD_HOSTS = ['rad-calc.vercel.app', 'joaquinheviam.github.io'];
// Prefijo de la copia en GitHub Pages, que no existe en radiocalc.app.
const OLD_BASE = /^\/RadCalc(?=\/|$)/i;

export default function OldDomainBanner() {
  const { t } = useLang();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (typeof window === 'undefined' || !OLD_HOSTS.includes(window.location.hostname)) return null;

  const newUrl = `https://radiocalc.app${window.location.pathname.replace(OLD_BASE, '') || '/'}${window.location.search}`;

  return (
    <div className="bg-amber-500 text-amber-950 text-sm px-4 py-2 flex items-center justify-center gap-3 text-center flex-wrap">
      <span>
        {t.common.oldDomainNotice}{' '}
        <a href={newUrl} className="font-semibold underline underline-offset-2">radiocalc.app</a>
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label={t.common.closeAria}
        className="p-1 hover:bg-black/10 rounded-full shrink-0"
      >
        <IconX size={14} />
      </button>
    </div>
  );
}

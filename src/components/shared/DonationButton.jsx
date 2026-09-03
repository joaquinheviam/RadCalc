import { useLang } from '../../i18n/LangContext.js';
import { DONATION_URL } from '../../utils/donation.js';
import { IconCoffee } from '../icons/index.js';

// Botón de donación discreto para el final de la página. No se muestra
// nada si todavía no se configuró DONATION_URL (ver src/utils/donation.js).
export default function DonationButton() {
  const { t } = useLang();
  if (!DONATION_URL) return null;

  return (
    <div className="flex flex-col items-center gap-2 py-1">
      <p className="text-xs text-slate-400 dark:text-slate-500">{t.common.donateText}</p>
      <a
        href={DONATION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#009ee3] hover:bg-[#0088c4] transition-colors"
      >
        <IconCoffee size={16} />
        {t.common.donateButton}
      </a>
    </div>
  );
}

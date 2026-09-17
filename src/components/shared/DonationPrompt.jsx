import { useDonationPrompt } from '../../hooks/useDonationPrompt.js';
import { useLang } from '../../i18n/LangContext.js';
import DonationButton from './DonationButton.jsx';

export default function DonationPrompt() {
  const { show, dismiss, markDonated } = useDonationPrompt();
  const { t } = useLang();

  if (!show) return null;

  return (
    <div className="fixed top-20 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm z-[200]">
      <div className="fade-in flex flex-col gap-3 rounded-2xl shadow-lg border px-4 py-4 bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
        {/* Cabecera con título y botón cerrar */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm sm:text-base leading-tight">
            {t.common.donationPromptTitle}
          </h3>
          <button
            onClick={dismiss}
            aria-label={t.common.closeAria}
            className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none px-1 -mt-1"
          >
            ×
          </button>
        </div>

        {/* Cuerpo del mensaje */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {t.common.donationPromptBody}
        </p>

        {/* Botones de acción. DonationButton NO se envuelve en un onClick de
            cierre: cuando hay más de un método configurado (Mercado Pago +
            PayPal) es un botón que abre un menú desplegable, y cerrar el
            aviso en el mismo clic que lo abre impediría elegir el método. */}
        <div className="flex flex-col gap-2 mt-1">
          <DonationButton />

          <div className="flex flex-row gap-2">
            <button
              onClick={markDonated}
              className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
            >
              {t.common.donationPromptDonated}
            </button>
            <button
              onClick={dismiss}
              className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              {t.common.donationPromptLater}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

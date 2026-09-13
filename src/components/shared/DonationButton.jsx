import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/LangContext.js';
import { DONATION_URL, PAYPAL_HOSTED_BUTTON_ID } from '../../utils/donation.js';
import { IconCoffee, IconChevronDown, IconExternalLink, IconGlobe } from '../icons/index.js';

// Botón de donación del final de la página. Si solo hay un método
// configurado (ver src/utils/donation.js) se muestra un botón simple;
// si hay dos, se despliega un menú para elegir Mercado Pago o PayPal.
// Si no hay ninguno configurado, no se muestra nada.
export default function DonationButton() {
  const { t } = useLang();
  const hasMercadoPago = !!DONATION_URL;
  const hasPaypal = !!PAYPAL_HOSTED_BUTTON_ID;

  if (!hasMercadoPago && !hasPaypal) return null;

  if (hasMercadoPago && !hasPaypal) {
    return (
      <div className="flex flex-col items-center gap-2 py-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.common.donateText}</p>
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

  if (hasPaypal && !hasMercadoPago) {
    return (
      <div className="flex flex-col items-center gap-2 py-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.common.donateText}</p>
        <PaypalForm hostedButtonId={PAYPAL_HOSTED_BUTTON_ID} label={t.common.donateButton} />
      </div>
    );
  }

  return <DonationMenu t={t} />;
}

function DonationMenu({ t }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 py-1">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t.common.donateText}</p>
      <div className="relative inline-block text-left" ref={ref}>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#009ee3] hover:bg-[#0088c4] transition-colors"
        >
          <IconCoffee size={16} />
          {t.common.donateButton}
          <IconChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 text-left overflow-hidden">
            <p className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {t.common.donateChooseMethod}
            </p>
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-slate-700 dark:text-slate-200"
            >
              <span>
                <span className="block font-medium">Mercado Pago</span>
                <span className="block text-xs text-slate-400 dark:text-slate-500">{t.common.donateClp}</span>
              </span>
              <IconExternalLink size={14} className="text-slate-400 shrink-0" />
            </a>
            <div className="border-t border-slate-100 dark:border-slate-700/80">
              <PaypalForm
                hostedButtonId={PAYPAL_HOSTED_BUTTON_ID}
                asMenuItem
                onSubmitClick={() => setIsOpen(false)}
                subtitle={t.common.donateIntl}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaypalForm({ hostedButtonId, label, asMenuItem, onSubmitClick, subtitle }) {
  // Importante: no cerrar el menú de forma síncrona en el mismo tick del
  // submit. Si el <form> se desmonta antes de que el navegador procese el
  // envío, éste lo cancela con "Form submission canceled because the form
  // is not connected" y el click no hace nada (bug reportado por el
  // usuario). Diferimos el cierre con setTimeout para que el navegador ya
  // haya iniciado la navegación/apertura de pestaña antes de desmontar.
  const handleSubmit = onSubmitClick ? () => setTimeout(onSubmitClick, 0) : undefined;
  if (asMenuItem) {
    return (
      <form action="https://www.paypal.com/donate" method="post" target="_blank" rel="noopener" onSubmit={handleSubmit}>
        <input type="hidden" name="hosted_button_id" value={hostedButtonId} />
        <button
          type="submit"
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-slate-700 dark:text-slate-200"
        >
          <span>
            <span className="block font-medium">PayPal</span>
            {subtitle && <span className="block text-xs text-slate-400 dark:text-slate-500">{subtitle}</span>}
          </span>
          <IconGlobe size={14} className="text-slate-400 shrink-0" />
        </button>
      </form>
    );
  }
  return (
    <form action="https://www.paypal.com/donate" method="post" target="_blank" rel="noopener">
      <input type="hidden" name="hosted_button_id" value={hostedButtonId} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#009ee3] hover:bg-[#0088c4] transition-colors"
      >
        <IconGlobe size={16} />
        {label}
      </button>
    </form>
  );
}

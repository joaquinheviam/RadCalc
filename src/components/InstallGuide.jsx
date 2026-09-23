import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../i18n/LangContext.js';
import { useInstallState, promptInstall, detectPlatform } from '../pwa/installPrompt.js';
import Modal from './shared/Modal.jsx';

// Botón "Instalar" de la barra superior (junto a ES/EN) para quien cerró el
// aviso inicial o no lo entendió. Si el navegador ofrece la instalación
// nativa (Chrome/Edge en Android y computador) la abre directo; si no (Safari
// en iPhone/iPad, Firefox, Safari en Mac) muestra una guía ilustrada paso a
// paso, con pestañas por plataforma y la detectada abierta por defecto. Se
// oculta cuando la app ya está instalada (abierta como standalone).

const svgProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' };

const IconInstall = ({ className = 'w-4 h-4' }) => (
  <svg className={className} {...svgProps} aria-hidden="true">
    <path d="M12 3v11M7.5 9.5 12 14l4.5-4.5M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
  </svg>
);
const IconEllipsis = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);
const IconKebab = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
);
const IconShareIOS = () => (
  <svg className="w-5 h-5" {...svgProps} aria-hidden="true">
    <path d="M8.5 9H6v12h12V9h-2.5M12 3v12M8.5 6.5 12 3l3.5 3.5" />
  </svg>
);
const IconPlusSquare = () => (
  <svg className="w-5 h-5" {...svgProps} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M12 8v8M8 12h8" />
  </svg>
);
const IconAddToHome = () => (
  <svg className="w-5 h-5" {...svgProps} aria-hidden="true">
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M12 8.5v6M9 11.5h6" />
  </svg>
);
const IconDesktopInstall = () => (
  <svg className="w-5 h-5" {...svgProps} aria-hidden="true">
    <rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8 21h8M12 17v4M12 7.5v6M9.5 11 12 13.5l2.5-2.5" />
  </svg>
);

// Ícono que acompaña a cada paso, imitando el control real del navegador.
// null = botón azul de confirmación del sistema.
const STEP_ICONS = {
  ios: [IconEllipsis, IconShareIOS, IconPlusSquare, null],
  android: [IconKebab, IconAddToHome, null],
  desktop: [IconDesktopInstall, null],
};

// Dibujo del teléfono o ventana con el botón a tocar resaltado en ámbar.
function WhereIllustration({ platform, label }) {
  const frame = 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-600';
  const bar = 'fill-slate-100 dark:fill-slate-800';
  const lines = 'fill-slate-200 dark:fill-slate-700';
  const ring = 'fill-amber-400/25 stroke-amber-400';
  const dot = 'fill-slate-600 dark:fill-slate-200';
  let svg;
  if (platform === 'desktop') {
    svg = (
      <svg viewBox="0 0 220 120" className="w-48 h-auto" aria-hidden="true">
        <rect x="4" y="4" width="212" height="112" rx="8" strokeWidth="2" className={frame} />
        <rect x="4" y="4" width="212" height="26" rx="8" className={bar} />
        <rect x="30" y="11" width="150" height="12" rx="6" className="fill-white dark:fill-slate-900" />
        <rect x="36" y="15.5" width="60" height="3" rx="1.5" className={lines} />
        {[20, 40, 52, 64, 76, 88].map((y, i) => <rect key={y} x="20" y={y + 20} width={i ? 180 - i * 12 : 90} height="5" rx="2.5" className={lines} />)}
        <circle cx="170" cy="17" r="11" strokeWidth="2" className={ring}><animate attributeName="r" values="9;12;9" dur="1.6s" repeatCount="indefinite" /></circle>
        <g transform="translate(163 10) scale(0.58)" className="stroke-slate-600 dark:stroke-slate-200" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M12 7.5v6M9.5 11 12 13.5l2.5-2.5" />
        </g>
      </svg>
    );
  } else {
    const ios = platform === 'ios';
    svg = (
      <svg viewBox="0 0 110 200" className="w-20 h-auto" aria-hidden="true">
        <rect x="4" y="4" width="102" height="192" rx="16" strokeWidth="2" className={frame} />
        {[40, 52, 64, 88, 100, 112, 124].map((y, i) => <rect key={y} x="16" y={y} width={i % 3 === 0 ? 50 : 78} height="5" rx="2.5" className={lines} />)}
        {ios ? (
          <>
            <rect x="14" y="166" width="62" height="18" rx="9" className={bar} />
            <circle cx="91" cy="175" r="12" strokeWidth="2" className={ring}><animate attributeName="r" values="10;13;10" dur="1.6s" repeatCount="indefinite" /></circle>
            {[85, 91, 97].map((x) => <circle key={x} cx={x} cy="175" r="1.8" className={dot} />)}
          </>
        ) : (
          <>
            <rect x="12" y="14" width="68" height="16" rx="8" className={bar} />
            <circle cx="92" cy="22" r="11" strokeWidth="2" className={ring}><animate attributeName="r" values="9;12;9" dur="1.6s" repeatCount="indefinite" /></circle>
            {[16, 22, 28].map((y) => <circle key={y} cx="92" cy={y} r="1.8" className={dot} />)}
          </>
        )}
      </svg>
    );
  }
  return (
    <figure className="flex flex-col items-center gap-2 py-2">
      {svg}
      <figcaption className="text-[11px] font-medium text-amber-600 dark:text-amber-400 text-center">{label}</figcaption>
    </figure>
  );
}

function Steps({ steps, icons }) {
  return (
    <ol className="space-y-1.5">
      {steps.map((step, i) => {
        const Icon = icons[i];
        return (
          <li key={i}>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-2.5">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <div className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{step.text}</span>
                {Icon ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 text-xs font-semibold shadow-sm">
                    <Icon />
                    {step.action !== '•••' && step.action !== '⋮' && step.action}
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">{step.action}</span>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-0.5 text-slate-300 dark:text-slate-600" aria-hidden="true">
                <svg className="w-4 h-4" {...svgProps}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function InstallGuide({ compact = false }) {
  const { t } = useLang();
  const c = t.common.installGuide;
  const { canPrompt, installed } = useInstallState();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState(detectPlatform);

  if (installed) return null;

  const handleClick = async () => {
    // Instalación nativa en un toque cuando el navegador la ofrece; si la
    // persona la cancela, la próxima vez se muestra la guía.
    if (canPrompt) {
      const outcome = await promptInstall();
      if (outcome) return;
    }
    setPlatform(detectPlatform());
    setOpen(true);
  };

  const installNow = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') setOpen(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={c.buttonAria}
        title={c.buttonAria}
        className={`inline-flex items-center gap-1 ${compact ? 'p-1.5' : 'px-2.5 py-1.5'} text-xs font-bold rounded-full hover:bg-white/20 transition-colors border border-white/30`}
      >
        <IconInstall className="w-3.5 h-3.5" />
        {!compact && c.button}
      </button>
      {open && createPortal(
        <Modal title={c.title} onClose={() => setOpen(false)} closeLabel={t.common.closeAria}>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{c.intro}</p>
          {canPrompt && (
            <div className="mb-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{c.installNowHint}</p>
              <button onClick={installNow} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                <IconInstall /> {c.installNow}
              </button>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">{c.orManual}</p>
            </div>
          )}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-3" role="tablist">
            {['ios', 'android', 'desktop'].map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={platform === p}
                onClick={() => setPlatform(p)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${platform === p ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {c.tabs[p]}
              </button>
            ))}
          </div>
          <WhereIllustration platform={platform} label={c.where[platform]} />
          <Steps steps={c.steps[platform]} icons={STEP_ICONS[platform]} />
          <p className="mt-3 text-[11px] leading-snug text-slate-400 dark:text-slate-500">{c.notes[platform]}</p>
          <div className="flex justify-end mt-4">
            <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              {c.done}
            </button>
          </div>
        </Modal>,
        document.body
      )}
    </>
  );
}

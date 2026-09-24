import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../i18n/LangContext.js';
import { useInstallState, promptInstall, detectBrowser, platformOf, onOpenInstallGuide } from '../pwa/installPrompt.js';
import Modal from './shared/Modal.jsx';

// Botón "Instalar" de la barra superior (junto a ES/EN) para quien cerró el
// aviso inicial o no lo entendió. Si el navegador ofrece la instalación
// nativa (Chrome/Edge en Android y computador) la abre directo; si no muestra
// una guía ilustrada paso a paso. La guía tiene pestañas por plataforma y,
// dentro de cada una, los navegadores más usados (los pasos cambian entre
// Safari y Chrome en iPhone, o entre Chrome y Samsung Internet en Android);
// se abre en el navegador detectado. Los avisos iniciales reutilizan los
// pasos (BrowserSteps) y pueden abrir esta guía con openInstallGuide().
// Se oculta cuando la app ya está instalada (abierta como standalone).

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
const IconHamburger = () => (
  <svg className="w-5 h-5" {...svgProps} aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
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
const IconDock = () => (
  <svg className="w-5 h-5" {...svgProps} aria-hidden="true">
    <rect x="2.5" y="4" width="19" height="16" rx="2" /><path d="M6 16.5h12" />
  </svg>
);

// Ícono que acompaña a cada paso, imitando el control real del navegador.
// 'plain' = botón de texto sin ícono; null = botón azul de confirmación.
// Los símbolos (•••, ⋮, ≡) se dibujan solo como ícono, sin texto.
const STEP_ICONS = {
  iosSafari: [IconEllipsis, IconShareIOS, IconPlusSquare, null],
  iosChrome: [IconShareIOS, IconPlusSquare, null],
  iosOther: [IconEllipsis, IconShareIOS, IconPlusSquare, null],
  androidChrome: [IconKebab, IconAddToHome, null],
  androidSamsung: [IconHamburger, IconPlusSquare, IconAddToHome],
  androidFirefox: [IconKebab, IconAddToHome, null],
  desktopChromium: [IconDesktopInstall, null],
  desktopSafari: ['plain', IconDock, null],
  desktopFirefox: [],
};
const SYMBOLS = ['•••', '⋮', '≡'];

const BROWSERS_BY_PLATFORM = {
  ios: ['iosSafari', 'iosChrome'],
  android: ['androidChrome', 'androidSamsung', 'androidFirefox'],
  desktop: ['desktopChromium', 'desktopSafari', 'desktopFirefox'],
};

// Dónde está el botón a tocar en cada navegador, para el dibujo.
const WHERE = {
  iosSafari: { frame: 'phone', spot: 'bottom', glyph: 'ellipsis' },
  iosOther: { frame: 'phone', spot: 'bottom', glyph: 'ellipsis' },
  iosChrome: { frame: 'phone', spot: 'topInBar', glyph: 'share' },
  androidChrome: { frame: 'phone', spot: 'top', glyph: 'kebab' },
  androidFirefox: { frame: 'phone', spot: 'top', glyph: 'kebab' },
  androidSamsung: { frame: 'phone', spot: 'bottom', glyph: 'hamburger' },
  desktopChromium: { frame: 'desktop', spot: 'bar', glyph: 'install' },
  desktopSafari: { frame: 'desktop', spot: 'menu', glyph: 'file' },
};

function Glyph({ kind, x, y }) {
  const stroke = 'stroke-slate-600 dark:stroke-slate-200';
  const fill = 'fill-slate-600 dark:fill-slate-200';
  if (kind === 'ellipsis') return [-6, 0, 6].map((d) => <circle key={d} cx={x + d} cy={y} r="1.8" className={fill} />);
  if (kind === 'kebab') return [-6, 0, 6].map((d) => <circle key={d} cx={x} cy={y + d} r="1.8" className={fill} />);
  if (kind === 'hamburger') return [-4.5, 0, 4.5].map((d) => <line key={d} x1={x - 5.5} x2={x + 5.5} y1={y + d} y2={y + d} strokeWidth="2" strokeLinecap="round" className={stroke} />);
  if (kind === 'share') {
    return (
      <g transform={`translate(${x - 7} ${y - 7}) scale(0.58)`} fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={stroke}>
        <path d="M8.5 9H6v12h12V9h-2.5M12 3v12M8.5 6.5 12 3l3.5 3.5" />
      </g>
    );
  }
  if (kind === 'install') {
    return (
      <g transform={`translate(${x - 7} ${y - 7}) scale(0.58)`} fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={stroke}>
        <rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M12 7.5v6M9.5 11 12 13.5l2.5-2.5" />
      </g>
    );
  }
  return null;
}

// Dibujo del teléfono o ventana con el botón a tocar resaltado en ámbar.
function WhereIllustration({ browser, label, menuText }) {
  const where = WHERE[browser];
  if (!where) return null;
  const frame = 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-600';
  const bar = 'fill-slate-100 dark:fill-slate-800';
  const lines = 'fill-slate-200 dark:fill-slate-700';
  const ring = 'fill-amber-400/25 stroke-amber-400';
  const pulse = (r) => <animate attributeName="r" values={`${r - 2};${r + 1};${r - 2}`} dur="1.6s" repeatCount="indefinite" />;
  let svg;
  if (where.frame === 'desktop') {
    const menu = where.spot === 'menu';
    svg = (
      <svg viewBox="0 0 220 128" className="w-48 h-auto" aria-hidden="true">
        {menu && (
          <>
            <rect x="0" y="0" width="220" height="12" className={bar} />
            <text x="26" y="9" fontSize="7.5" fontWeight="700" className="fill-slate-600 dark:fill-slate-200">{menuText}</text>
          </>
        )}
        <rect x="4" y="16" width="212" height="108" rx="8" strokeWidth="2" className={frame} />
        <rect x="4" y="16" width="212" height="24" rx="8" className={bar} />
        <rect x="30" y="22" width="150" height="12" rx="6" className="fill-white dark:fill-slate-900" />
        <rect x="36" y="26.5" width="60" height="3" rx="1.5" className={lines} />
        {[56, 72, 84, 96, 108].map((y, i) => <rect key={y} x="20" y={y} width={i ? 180 - i * 14 : 90} height="5" rx="2.5" className={lines} />)}
        {menu ? (
          <rect x="21" y="1" width="30" height="10" rx="3" strokeWidth="1.5" className={ring} />
        ) : (
          <>
            <circle cx="170" cy="28" r="11" strokeWidth="2" className={ring}>{pulse(11)}</circle>
            <Glyph kind="install" x={170} y={28} />
          </>
        )}
      </svg>
    );
  } else {
    const spots = { bottom: [91, 175], top: [92, 22], topInBar: [70, 22] };
    const [cx, cy] = spots[where.spot];
    svg = (
      <svg viewBox="0 0 110 200" className="w-20 h-auto" aria-hidden="true">
        <rect x="4" y="4" width="102" height="192" rx="16" strokeWidth="2" className={frame} />
        {[44, 56, 68, 92, 104, 116, 128].map((y, i) => <rect key={y} x="16" y={y} width={i % 3 === 0 ? 50 : 78} height="5" rx="2.5" className={lines} />)}
        {where.spot === 'bottom'
          ? <rect x="14" y="166" width="62" height="18" rx="9" className={bar} />
          : <rect x="12" y="13" width={where.spot === 'topInBar' ? 72 : 68} height="18" rx="9" className={bar} />}
        <circle cx={cx} cy={cy} r="11" strokeWidth="2" className={ring}>{pulse(11)}</circle>
        <Glyph kind={where.glyph} x={cx} y={cy} />
      </svg>
    );
  }
  return (
    <figure className="flex flex-col items-center gap-2 py-2">
      {svg}
      <figcaption className="text-xs font-medium text-amber-600 dark:text-amber-400 text-center">{label}</figcaption>
    </figure>
  );
}

// Pasos numerados con el control real dibujado. `compact` para los avisos.
export function BrowserSteps({ browser, steps, compact = false }) {
  const icons = STEP_ICONS[browser] || [];
  return (
    <ol className="space-y-1.5">
      {steps.map((step, i) => {
        const Icon = icons[i];
        const chip = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 text-xs font-semibold shadow-sm';
        return (
          <li key={i}>
            <div className={`flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 ${compact ? 'p-2' : 'p-2.5'}`}>
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <div className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className={`${compact ? 'text-[13px]' : 'text-sm'} text-slate-600 dark:text-slate-200 leading-snug`}>{step.text}</span>
                {Icon === 'plain' ? (
                  <span className={chip}>{step.action}</span>
                ) : Icon ? (
                  <span className={chip}><Icon />{!SYMBOLS.includes(step.action) && step.action}</span>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">{step.action}</span>
                )}
              </div>
            </div>
            {!compact && i < steps.length - 1 && (
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
  const [detected] = useState(detectBrowser);
  const [browser, setBrowser] = useState(detected);
  const platform = platformOf(browser);

  const openGuide = () => { setBrowser(detected); setOpen(true); };
  useEffect(() => onOpenInstallGuide(openGuide));

  if (installed) return null;

  const handleClick = async () => {
    // Instalación nativa en un toque cuando el navegador la ofrece; si la
    // persona la cancela, la próxima vez se muestra la guía.
    if (canPrompt) {
      const outcome = await promptInstall();
      if (outcome) return;
    }
    openGuide();
  };

  const installNow = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') setOpen(false);
  };

  const info = c.browsers[browser];
  const browserTabs = BROWSERS_BY_PLATFORM[platform].includes(browser)
    ? BROWSERS_BY_PLATFORM[platform]
    : [browser, ...BROWSERS_BY_PLATFORM[platform]];

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={c.buttonAria}
        title={c.buttonAria}
        className={`inline-flex items-center gap-1 ${compact ? 'p-1.5' : 'px-2.5 py-1.5'} text-xs font-bold rounded-full hover:bg-white/20 transition-colors border border-white/30`}
      >
        <IconInstall className="w-3.5 h-3.5" />
        {!compact && <span className="max-[359px]:hidden">{c.button}</span>}
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
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">{c.orManual}</p>
            </div>
          )}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-2" role="tablist">
            {['ios', 'android', 'desktop'].map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={platform === p}
                onClick={() => setBrowser(platformOf(detected) === p ? detected : BROWSERS_BY_PLATFORM[p][0])}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${platform === p ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {c.tabs[p]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 mb-1">
            {browserTabs.map((b) => (
              <button
                key={b}
                onClick={() => setBrowser(b)}
                aria-pressed={browser === b}
                className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${browser === b
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'}`}
              >
                {c.browsers[b].label}
              </button>
            ))}
          </div>
          {browser === detected && <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">{c.detected}</p>}
          <WhereIllustration browser={browser} label={info.where} menuText={info.steps[0]?.action} />
          {info.steps.length > 0 && <BrowserSteps browser={browser} steps={info.steps} />}
          <p className={`${info.steps.length ? 'mt-3 text-xs text-slate-500 dark:text-slate-400' : 'mt-3 text-sm text-slate-600 dark:text-slate-300'} leading-snug`}>{info.note}</p>
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

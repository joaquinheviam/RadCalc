import { useContext } from 'react';
import { LangContext } from '../i18n/LangContext.js';
import { openInstallGuide } from '../pwa/installPrompt.js';
import { BrowserSteps } from './InstallGuide.jsx';

// Aviso inicial con los pasos para instalar en el navegador detectado
// (Safari o Chrome en iPhone; Chrome, Samsung Internet o Firefox en Android
// cuando el navegador no ofrece la instalación nativa). Siempre oscuro, igual
// que el aviso de instalación nativa; "Ver con imágenes" abre la guía
// completa del botón "Instalar".
export default function InstallStepsBanner({ title, desc, browser, dismissLabel, onDismiss }) {
  const { t } = useContext(LangContext);
  const g = t.common.installGuide;
  const info = g.browsers[browser];
  if (!info || !info.steps.length) return null;

  const seeGuide = () => { onDismiss(); openInstallGuide(); };

  return (
    <div className="dark fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-md z-[200]">
      <div className="fade-in p-4 rounded-2xl shadow-2xl border bg-slate-900/95 text-slate-100 border-slate-700 backdrop-blur-md space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-white">{title}</h4>
          <button onClick={onDismiss} aria-label={dismissLabel} className="text-slate-400 hover:text-white text-lg leading-none p-1">×</button>
        </div>
        <p className="text-xs text-slate-300">{desc}</p>
        <p className="text-[11px] font-medium text-amber-400">{info.label} · {info.where}</p>
        <BrowserSteps browser={browser} steps={info.steps} compact />
        <p className="text-[11px] text-slate-400">{g.later}</p>
        <div className="flex justify-end gap-2">
          <button onClick={seeGuide} className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-200 border border-slate-600 hover:bg-slate-800 transition-colors">
            {g.seeGuide}
          </button>
          <button onClick={onDismiss} className="text-xs font-semibold px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors">
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

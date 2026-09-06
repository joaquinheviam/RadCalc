import { useState, useEffect, useContext } from 'react';
import { LangContext } from '../i18n/LangContext.js';

// Icono nativo de Compartir en iOS (cuadrado con flecha hacia arriba)
const ShareIcon = () => (
  <svg className="w-4 h-4 inline-block mx-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

// Icono del signo más (+) dentro de un cuadrado
const PlusSquareIcon = () => (
  <svg className="w-4 h-4 inline-block mx-1 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function InstallPromptIOS() {
  const { t } = useContext(LangContext);
  const c = t.common.installIOS;
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Detecta si el dispositivo es iOS (iPhone/iPad/iPod)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // 2. Detecta si la app ya está corriendo instalada (standalone)
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    // 3. Revisa si el usuario cerró la notificación previamente
    const hasDismissed = localStorage.getItem('radiocalc:ios-prompt-dismissed');

    // Mostrar solo si es iOS, NO está instalada y no ha sido descartada previamente
    if (isIOS && !isStandalone && !hasDismissed) {
      setShowPrompt(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('radiocalc:ios-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-md z-[200]">
      <div className="fade-in p-4 rounded-2xl shadow-2xl border bg-slate-900/95 text-slate-100 border-slate-700 backdrop-blur-md space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            {c.title}
          </h4>
          <button
            onClick={handleDismiss}
            aria-label={c.dismiss}
            className="text-slate-400 hover:text-white text-lg leading-none p-1"
          >
            ×
          </button>
        </div>

        <p className="text-xs text-slate-300">{c.desc}</p>

        <ol className="text-xs space-y-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <li className="flex items-center">
            <span>1. {c.step1} <strong>{c.step1Action}</strong> <ShareIcon /> {c.step1Tail}</span>
          </li>
          <li className="flex items-center">
            <span>2. {c.step2} <strong>"{c.step2Action}"</strong> <PlusSquareIcon />.</span>
          </li>
        </ol>

        <div className="flex justify-end">
          <button
            onClick={handleDismiss}
            className="text-xs font-semibold px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            {c.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}

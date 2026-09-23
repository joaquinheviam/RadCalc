import { useState, useContext } from 'react';
import { LangContext } from '../i18n/LangContext.js';
import { useInstallState, promptInstall } from '../pwa/installPrompt.js';

// Icono simple de "instalar" (flecha hacia una bandeja), para no depender
// de más iconos del proyecto en un componente tan pequeño.
const DownloadIcon = () => (
  <svg className="w-4 h-4 inline-block text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
  </svg>
);

// Contraparte de InstallPromptIOS.jsx para Chrome/Edge/Samsung Internet en
// Android: estos navegadores exponen el evento nativo `beforeinstallprompt`
// cuando la PWA es instalable (manifest + service worker ya los provee
// vite-plugin-pwa). El evento se captura en src/pwa/installPrompt.js y aquí
// se muestra un banner con el mismo estilo visual que el de iOS, en vez del
// mini-infobar genérico del navegador. Firefox para Android no dispara este evento: en ese caso el
// banner simplemente nunca aparece (no hay downgrade visible).
export default function InstallPromptAndroid() {
  const { t } = useContext(LangContext);
  const c = t.common.installAndroid;
  const { canPrompt, installed } = useInstallState();
  const [dismissed, setDismissed] = useState(() => {
    try { return Boolean(localStorage.getItem('radiocalc:android-prompt-dismissed')); } catch { return false; }
  });
  const showPrompt = canPrompt && !installed && !dismissed;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('radiocalc:android-prompt-dismissed', 'true'); } catch { /* sin almacenamiento */ }
  };

  // Se acepte o no la instalación, el evento ya se consumió: se oculta el
  // banner (si la persona la rechazó, se respeta igual que con "Ahora no").
  // El botón "Instalar" de la barra superior sigue disponible.
  const handleInstall = async () => {
    await promptInstall();
    handleDismiss();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-md z-[200]">
      <div className="fade-in p-4 rounded-2xl shadow-2xl border bg-slate-900/95 text-slate-100 border-slate-700 backdrop-blur-md space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-white">{c.title}</h4>
          <button
            onClick={handleDismiss}
            aria-label={c.dismiss}
            className="text-slate-400 hover:text-white text-lg leading-none p-1"
          >
            ×
          </button>
        </div>

        <p className="text-xs text-slate-300">{c.desc}</p>
        <p className="text-[11px] text-slate-400">{t.common.installGuide.later}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            {c.dismiss}
          </button>
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            <DownloadIcon /> {c.install}
          </button>
        </div>
      </div>
    </div>
  );
}

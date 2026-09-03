import { useRegisterSW } from 'virtual:pwa-register/react';

// Textos mínimos y bilingües para el aviso. Se leen directamente de
// localStorage (misma clave que usa src/hooks/useLocalStorageState en
// App.jsx) para no depender del LangContext, ya que este componente vive
// fuera del árbol de <App />.
const TEXT = {
  es: {
    offlineReady: 'RadioCalc ya está listo para usarse sin conexión.',
    needRefresh: 'Hay una nueva versión de RadioCalc disponible.',
    update: 'Actualizar',
    dismiss: 'Ahora no',
  },
  en: {
    offlineReady: 'RadioCalc is ready to work offline.',
    needRefresh: 'A new version of RadioCalc is available.',
    update: 'Update',
    dismiss: 'Not now',
  },
};

function currentLang() {
  try {
    const stored = localStorage.getItem('radiocalc:lang');
    return stored === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

export default function UpdateToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Revisa si hay una versión nueva cada 60 minutos (además de la
      // revisión automática que hace el navegador al recargar).
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);
    },
  });

  const t = TEXT[currentLang()];
  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm z-[200]">
      <div className="fade-in flex items-center gap-3 rounded-2xl shadow-lg border px-4 py-3 bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
        <span className="text-sm flex-1">{needRefresh ? t.needRefresh : t.offlineReady}</span>
        {needRefresh ? (
          <button
            onClick={() => updateServiceWorker(true)}
            className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {t.update}
          </button>
        ) : null}
        <button
          onClick={close}
          aria-label={t.dismiss}
          className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}

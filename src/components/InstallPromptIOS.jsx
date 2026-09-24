import { useState, useContext } from 'react';
import { LangContext } from '../i18n/LangContext.js';
import { detectBrowser, platformOf, isStandalone } from '../pwa/installPrompt.js';
import InstallStepsBanner from './InstallStepsBanner.jsx';

const KEY = 'radiocalc:ios-prompt-dismissed';

// Aviso inicial en iPhone/iPad: Apple no permite instalar una web con un
// botón, así que se muestran los pasos del navegador que se está usando
// (Safari y Chrome los tienen en lugares distintos). Solo si la app no está
// instalada y el aviso no se cerró antes.
export default function InstallPromptIOS() {
  const { t } = useContext(LangContext);
  const c = t.common.installIOS;
  const [browser] = useState(detectBrowser);
  const [show, setShow] = useState(() => {
    if (platformOf(detectBrowser()) !== 'ios' || isStandalone()) return false;
    try { return !localStorage.getItem(KEY); } catch { return false; }
  });

  const handleDismiss = () => {
    setShow(false);
    try { localStorage.setItem(KEY, 'true'); } catch { /* sin almacenamiento */ }
  };

  if (!show) return null;
  return <InstallStepsBanner title={c.title} desc={c.desc} browser={browser} dismissLabel={c.dismiss} onDismiss={handleDismiss} />;
}

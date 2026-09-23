import { useEffect, useState } from 'react';

// Captura única del evento nativo `beforeinstallprompt` (Chrome/Edge/Samsung
// Internet en Android y Chrome/Edge en computador). El navegador lo dispara
// una sola vez y a veces antes de que React monte los componentes, así que se
// escucha al importar este módulo (main.jsx lo importa antes de renderizar) y
// se comparte entre el aviso de Android y el botón "Instalar" de la barra.
let deferredPrompt = null;
let installed = false;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.navigator.standalone)
    || window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: window-controls-overlay)').matches;
}

// 'ios' (iPhone/iPad, incluido iPadOS que se presenta como Mac), 'android'
// o 'desktop'.
export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

// Abre el cuadro nativo de instalación. Devuelve 'accepted', 'dismissed' o
// null si el navegador no lo ofrece. El evento sirve una sola vez.
export async function promptInstall() {
  const event = deferredPrompt;
  if (!event) return null;
  deferredPrompt = null;
  notify();
  event.prompt();
  const { outcome } = await event.userChoice;
  return outcome;
}

export function useInstallState() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
  return { canPrompt: Boolean(deferredPrompt), installed: installed || isStandalone() };
}

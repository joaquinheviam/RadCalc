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

// Navegador concreto, porque los pasos para instalar cambian entre Safari y
// Chrome en iPhone, o entre Chrome y Samsung Internet en Android:
// iosSafari, iosChrome, iosOther, androidChrome, androidSamsung,
// androidFirefox, desktopChromium, desktopSafari, desktopFirefox.
export function detectBrowser() {
  if (typeof navigator === 'undefined') return 'desktopChromium';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    if (/CriOS/.test(ua)) return 'iosChrome';
    if (/FxiOS|EdgiOS|OPiOS/.test(ua)) return 'iosOther';
    return 'iosSafari';
  }
  if (/Android/i.test(ua)) {
    if (/SamsungBrowser/.test(ua)) return 'androidSamsung';
    if (/Firefox/.test(ua)) return 'androidFirefox';
    return 'androidChrome';
  }
  if (/Firefox/.test(ua)) return 'desktopFirefox';
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return 'desktopSafari';
  return 'desktopChromium';
}

// 'ios', 'android' o 'desktop' a partir de la clave del navegador.
export const platformOf = (browser) => browser.replace(/[A-Z].*/, '');

// Permite abrir la guía del botón "Instalar" desde los avisos iniciales.
const guideListeners = new Set();
export function openInstallGuide() { guideListeners.forEach((fn) => fn()); }
export function onOpenInstallGuide(fn) {
  guideListeners.add(fn);
  return () => guideListeners.delete(fn);
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

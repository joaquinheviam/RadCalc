import { useState, useEffect, useCallback } from 'react';

// Aviso "¿Necesitas RadioCalc en tu idioma?". Se muestra una sola vez por
// dispositivo (tras cerrarlo o escribir no vuelve a aparecer), por una de dos
// señales:
//  1. 'browser': el idioma del navegador no es español ni inglés (p. ej.
//     portugués) → aparece una vez al entrar, a los pocos segundos.
//  2. 'toggle': la persona cambia de idioma 3 veces en menos de 1 minuto
//     (ir y volver una vez es normal; más sugiere que busca otro idioma).
// Además puede abrirse a mano desde el pie de página ("¿Otro idioma?"),
// disparando el evento OPEN_EVENT, aunque ya se haya cerrado antes.
const STORAGE_KEY = 'radiocalc:langPromptDone';
const TOGGLE_LIMIT = 3;
const TOGGLE_WINDOW_MS = 60 * 1000;
const BROWSER_DELAY_MS = 4000;
export const OPEN_EVENT = 'radiocalc:open-lang-prompt';

// Los cambios de idioma navegan entre rutas y pueden volver a montar el
// componente, así que las marcas de tiempo viven a nivel de módulo.
let toggleTimes = [];

function isDone() {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
}

function markDone() {
  try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* sin almacenamiento: solo se cierra */ }
}

// Código base del primer idioma del navegador (p. ej. 'pt' de 'pt-BR').
export function browserLanguage() {
  try {
    const raw = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    return raw.toLowerCase().split('-')[0];
  } catch {
    return '';
  }
}

function track(name, params) {
  try { if (typeof window.gtag === 'function') window.gtag('event', name, params); } catch { /* analítica opcional */ }
}

export function useLanguageRequestPrompt() {
  const [state, setState] = useState(null); // null | { reason, browserLang }

  const open = useCallback((reason) => {
    const browserLang = browserLanguage();
    setState({ reason, browserLang });
    track('lang_prompt_shown', { reason, browser_lang: browserLang });
  }, []);

  // Señal 1: idioma del navegador distinto de español/inglés.
  useEffect(() => {
    const code = browserLanguage();
    if (!code || code === 'es' || code === 'en' || isDone()) return undefined;
    const id = setTimeout(() => { if (!isDone()) open('browser'); }, BROWSER_DELAY_MS);
    return () => clearTimeout(id);
  }, [open]);

  // Apertura manual desde el pie de página.
  useEffect(() => {
    const handler = () => open('manual');
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, [open]);

  // Señal 2: se llama en cada cambio de idioma.
  const registerToggle = useCallback(() => {
    const now = Date.now();
    toggleTimes = [...toggleTimes.filter((ts) => now - ts < TOGGLE_WINDOW_MS), now];
    if (toggleTimes.length >= TOGGLE_LIMIT && !isDone()) {
      toggleTimes = [];
      open('toggle');
    }
  }, [open]);

  const close = useCallback((action) => {
    markDone();
    track(action === 'dismiss' ? 'lang_prompt_dismiss' : 'lang_prompt_contact', {
      method: action,
      reason: state?.reason,
      browser_lang: state?.browserLang,
    });
    if (action === 'dismiss' || action === 'mailto') setState(null);
  }, [state]);

  return { prompt: state, registerToggle, close };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.jsx';
import UpdateToast from './pwa/UpdateToast.jsx';
import './pwa/installPrompt.js';
import './index.css';
import { initialLang, loadStrings } from './i18n/loadStrings.js';

// Empieza a descargar los textos del idioma de la URL de inmediato, en
// paralelo con el arranque de React (App los espera antes de mostrarse).
loadStrings(initialLang()).catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <UpdateToast />
    <Analytics />
  </StrictMode>
);

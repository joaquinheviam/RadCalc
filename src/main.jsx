import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.jsx';
import UpdateToast from './pwa/UpdateToast.jsx';
import './pwa/installPrompt.js';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <UpdateToast />
    <Analytics />
  </StrictMode>
);

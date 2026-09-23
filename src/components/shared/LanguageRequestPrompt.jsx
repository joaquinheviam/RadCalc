import { useLang } from '../../i18n/LangContext.js';
import { buildMailto, buildMailTextForClipboard } from '../../utils/mailto.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { IconMail, IconCopy } from '../icons/index.js';

// Frase en el propio idioma del navegador, para los idiomas más probables
// entre quienes llegan al sitio. Se muestra bajo el título cuando el aviso
// salta por el idioma del navegador; para el resto basta con el título.
const NATIVE_LINE = {
  pt: 'Precisa do RadioCalc em português?',
  fr: 'Besoin de RadioCalc en français ?',
  it: 'Ti serve RadioCalc in italiano?',
  de: 'Brauchen Sie RadioCalc auf Deutsch?',
};

function languageName(code, lang) {
  try {
    return new Intl.DisplayNames([lang], { type: 'language' }).of(code) || '';
  } catch {
    return '';
  }
}

// Aviso no bloqueante (mismo estilo que DonationPrompt) que invita a pedir
// RadioCalc en otro idioma. La lógica de cuándo mostrarlo vive en
// useLanguageRequestPrompt; este componente solo lo dibuja.
export default function LanguageRequestPrompt({ prompt, onClose }) {
  const { t, lang } = useLang();
  if (!prompt) return null;
  const c = t.common;

  const code = prompt.browserLang;
  const named = prompt.reason === 'browser' && code ? languageName(code, lang) : '';
  const title = named ? c.langPromptTitleNamed(named) : c.langPromptTitle;
  const nativeLine = prompt.reason === 'browser' ? NATIVE_LINE[code] : null;
  const requested = named || (code && code !== 'es' && code !== 'en' ? languageName(code, lang) : '');

  return (
    <div className="fixed top-20 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm z-[200]">
      <div className="fade-in flex flex-col gap-3 rounded-2xl shadow-lg border px-4 py-4 bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-tight">🌐 {title}</h3>
            {nativeLine && <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-0.5">{nativeLine}</p>}
          </div>
          <button
            onClick={() => onClose('dismiss')}
            aria-label={c.closeAria}
            className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none px-1 -mt-1"
          >
            ×
          </button>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{c.langPromptBody}</p>
        <div className="flex flex-col gap-2">
          <a
            href={buildMailto(requested, lang, 'languageRequest')}
            onClick={() => onClose('mailto')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <IconMail size={14} /> {c.langPromptEmail}
          </a>
          <div className="flex flex-row gap-2">
            <button
              onClick={() => { copyToClipboard(buildMailTextForClipboard(requested, lang, 'languageRequest'), c.langPromptCopiedOk, c.copiedErr); onClose('copy'); }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
            >
              <IconCopy size={13} /> {c.langPromptCopy}
            </button>
            <button
              onClick={() => onClose('dismiss')}
              className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              {c.langPromptDismiss}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useLang } from '../../i18n/LangContext.js';
import Modal from './Modal.jsx';

export default function Changelog({ onClose }) {
  const { t, lang } = useLang();
  const c = t.changelog;
  const dateFmt = new Intl.DateTimeFormat(lang === 'es' ? 'es-CL' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Modal title={c.title} onClose={onClose} closeLabel={t.common.closeAria}>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{c.intro}</p>
      <ul className="space-y-4">
        {c.entries.map((entry, i) => (
          <li key={i} className="border-l-2 border-blue-200 dark:border-blue-800 pl-3">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {dateFmt.format(new Date(entry.date + 'T00:00:00'))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{entry.text}</p>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

import { useLang } from '../../i18n/LangContext.js';
import { buildMailto, buildMailTextForClipboard } from '../../utils/mailto.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { SPONSORS } from '../../data/sponsors.js';
import Modal from './Modal.jsx';
import DonationButton from './DonationButton.jsx';
import { IconMail, IconStar, IconCopy } from '../icons/index.js';

const VALID_MONTHS = 12;
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

export default function Sponsors({ onClose, onOpenAbout }) {
  const { t, lang } = useLang();
  const s = t.sponsors;
  const now = Date.now();

  const handleCopyMessage = (e) => {
    e.preventDefault();
    copyToClipboard(buildMailTextForClipboard(null, lang, 'sponsor'), s.messageCopiedOk, t.common.copiedErr);
  };

  // Una donación queda listada 12 meses desde su fecha; pasado ese plazo
  // desaparece sola, sin tener que editar src/data/sponsors.js. Se muestra
  // en el orden en que está escrita la lista (sin montos).
  const active = SPONSORS
    .filter((sp) => (now - new Date(sp.since + 'T00:00:00').getTime()) / MS_PER_MONTH <= VALID_MONTHS);

  return (
    <Modal title={s.title} onClose={onClose} closeLabel={t.common.closeAria}>
      <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>{s.intro}</p>

        {active.length > 0 ? (
          <ul className="space-y-1.5">
            {active.map((sp, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <IconStar size={14} className="text-amber-500 shrink-0" />
                <span className="font-medium">{sp.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs italic text-slate-400 dark:text-slate-500">{s.emptyState}</p>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">{s.howToAppear}</p>
          <div className="flex flex-wrap items-center gap-3">
            <DonationButton />
            <a
              href={buildMailto(null, lang, 'sponsor')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              <IconMail size={15} />
              {s.notifyLink}
            </a>
            <button
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              <IconCopy size={15} />
              {s.copyMessage}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{s.noMailAppHint}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{s.institutionalNote}</p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.disclaimer}</p>
          <button
            onClick={onOpenAbout}
            className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {s.aboutLink}
          </button>
        </div>
      </div>
    </Modal>
  );
}

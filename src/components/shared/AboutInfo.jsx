import { useLang } from '../../i18n/LangContext.js';
import { calculators } from '../../calculators/registry.js';
import Modal from './Modal.jsx';
import DonationButton from './DonationButton.jsx';

export default function AboutInfo({ onClose }) {
  const { t } = useLang();
  const c = t.about;
  const count = calculators.length;

  return (
    <Modal title={c.title} onClose={onClose} closeLabel={t.common.closeAria}>
      <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {c.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{c.calculatorCountText(count)}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <DonationButton />
      </div>
    </Modal>
  );
}

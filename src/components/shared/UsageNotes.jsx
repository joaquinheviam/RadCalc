import { useLang } from '../../i18n/LangContext.js';
import Accordion from './Accordion.jsx';
import { IconInfo } from '../icons/index.js';

export default function UsageNotes({ paragraphs }) {
  const { t } = useLang();
  if (!paragraphs || paragraphs.length === 0) return null;
  return (
    <Accordion icon={<IconInfo size={16} />} title={t.common.howToUse}>
      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </Accordion>
  );
}

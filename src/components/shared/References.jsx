import { useLang } from '../../i18n/LangContext.js';
import Accordion from './Accordion.jsx';
import { IconBookOpen } from '../icons/index.js';

export default function References({ items }) {
  const { t } = useLang();
  if (!items || items.length === 0) return null;
  return (
    <Accordion icon={<IconBookOpen size={16} />} title={t.common.references}>
      <ol className="space-y-2 text-xs text-slate-500 dark:text-slate-400 list-decimal list-inside">
        {items.map((ref, i) => <li key={i} className="leading-relaxed">{ref}</li>)}
      </ol>
    </Accordion>
  );
}

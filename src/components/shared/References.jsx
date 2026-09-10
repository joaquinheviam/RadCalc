import { useLang } from '../../i18n/LangContext.js';
import Accordion from './Accordion.jsx';
import { IconBookOpen } from '../icons/index.js';

export default function References({ items }) {
  const { t } = useLang();
  if (!items || items.length === 0) return null;
  return (
    <Accordion icon={<IconBookOpen size={16} />} title={t.common.references}>
      <ol className="space-y-2 text-xs text-slate-500 dark:text-slate-400 list-decimal list-inside">
        {items.map((ref, i) => {
          const text = typeof ref === 'string' ? ref : ref.text;
          const doi = typeof ref === 'string' ? null : ref.doi;
          return (
            <li key={i} className="leading-relaxed">
              {text}
              {doi && (
                <>
                  {' '}
                  <a
                    href={`https://doi.org/${doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 dark:text-sky-400 underline underline-offset-2 hover:text-sky-700 dark:hover:text-sky-300"
                  >
                    doi:{doi}
                  </a>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </Accordion>
  );
}

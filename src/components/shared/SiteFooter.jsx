import { useLang } from '../../i18n/LangContext.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { buildMailto, REPORT_EMAIL, LINKEDIN_URL } from '../../utils/mailto.js';
import { IconLinkedin, IconMail, IconCopy } from '../icons/index.js';

export default function SiteFooter() {
  const { t, lang } = useLang();
  return (
    <footer className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 text-center">
      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm mx-auto">
        {t.common.disclaimer}
      </p>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <IconLinkedin size={16} />
          {t.common.createdBy} Dr. Joaquín Hevia M.
        </a>
        <a
          href={buildMailto(null, lang, 'bug')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <IconMail size={16} />
          {t.common.reportBugGeneral}
        </a>
        <a
          href={buildMailto(null, lang, 'update')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <IconMail size={16} />
          {t.common.suggestUpdate}
        </a>
        <a
          href={buildMailto(null, lang, 'suggestion')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <IconMail size={16} />
          {t.common.suggestGeneral}
        </a>
        <button
          onClick={() => copyToClipboard(REPORT_EMAIL, t.common.emailCopiedOk, t.common.copiedErr)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <IconCopy size={16} />
          {t.common.copyEmail}
        </button>
      </div>
      <p className="text-[11px] text-slate-300 dark:text-slate-600">{REPORT_EMAIL} · RadioCalc Clinical</p>
    </footer>
  );
}

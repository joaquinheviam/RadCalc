import { useLang } from '../../i18n/LangContext.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { buildMailto, REPORT_EMAIL } from '../../utils/mailto.js';
import { IconMail, IconCopy } from '../icons/index.js';

export default function ReportBugLink({ calcTitle }) {
  const { t, lang } = useLang();
  const handleCopyEmail = (e) => {
    e.preventDefault();
    copyToClipboard(REPORT_EMAIL, t.common.emailCopiedOk, t.common.copiedErr);
  };
  return (
    <div className="flex items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400 py-1 flex-wrap">
      <a href={buildMailto(calcTitle, lang, 'bug')} className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-1">
        <IconMail size={14} /> {t.common.reportBug}
      </a>
      <span className="text-slate-300 dark:text-slate-600">·</span>
      <a href={buildMailto(calcTitle, lang, 'update')} className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-1">
        <IconMail size={14} /> {t.common.suggestUpdate}
      </a>
      <span className="text-slate-300 dark:text-slate-600">·</span>
      <a href={buildMailto(calcTitle, lang, 'suggestion')} className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-1">
        <IconMail size={14} /> {t.common.suggestGeneral}
      </a>
      <span className="text-slate-300 dark:text-slate-600">·</span>
      <button onClick={handleCopyEmail} className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-1">
        <IconCopy size={14} /> {t.common.copyEmail}
      </button>
    </div>
  );
}

import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';
import { useSyntheticHct } from '../components/shared/SyntheticHct.jsx';

export default function SyntheticHematocrit() {
  const { t, lang } = useLang();
  const c = t.calc.synHct;
  const [showPreview, setShowPreview] = useState(false);
  const [t1, setT1] = useState('');
  const syn = useSyntheticHct(t1);

  const getReportText = () => (syn.value === null ? '' : c.reportText(syn.valueText, t1, syn.modelText));
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setT1(''); syn.reset(); };

  return (
    <div className={`space-y-4 animate-in fade-in ${syn.value !== null ? 'pb-56' : ''}`}>
      <Card>
        <NumberField label={c.t1Label} value={t1} onChange={setT1} />
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.t1Hint}</p>
      </Card>
      <Card>{syn.fields}</Card>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.synHct} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {syn.value !== null && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className="text-3xl font-black block mt-1 leading-tight text-blue-600 dark:text-blue-400">{syn.valueText}{lang === 'es' ? ' %' : '%'}</span>
          </div>
          <div className="flex items-start gap-5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} caption={t.common.reset} />
            <PreviewIconButton onClick={() => setShowPreview(true)} label={t.common.showReport} caption={t.common.showReportCaption} />
            <CopyIconButton onClick={handleCopy} label={t.common.copyReport} caption={t.common.copy} />
          </div>
        </StickyBar>
      )}
      <ReportPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        closeLabel={t.common.closeAria}
        title={t.common.reportPreviewTitle}
        reportText={getReportText()}
        onCopy={handleCopy}
        copyLabel={t.common.copyReport}
      />
    </div>
  );
}

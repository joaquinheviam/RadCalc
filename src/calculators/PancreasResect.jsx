import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const PANCREAS_LEVEL = { none: 0, borderline: 1, locallyAdvanced: 2 };

export default function PancreasResect() {
  const { t, lang } = useLang();
  const c = t.calc.pancreasResect;
  const [arterial, setArterial] = useState(null);
  const [venous, setVenous] = useState(null);

  const arterialObj = c.arterialOptions.find(x => x.key === arterial);
  const venousObj = c.venousOptions.find(x => x.key === venous);

  let resultKey = null;
  if (arterial && venous) {
    const level = Math.max(PANCREAS_LEVEL[arterial], PANCREAS_LEVEL[venous]);
    resultKey = level === 0 ? 'resectable' : (level === 1 ? 'borderline' : 'locallyAdvanced');
  }
  const resultObj = resultKey ? c[resultKey] : null;

  const handleCopy = () => {
    if (!resultObj) return;
    const text = c.reportText(arterialObj.label, venousObj.label, resultObj.label, resultObj.mgmt);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setArterial(null); setVenous(null); };

  const resultColor = resultKey === 'resectable' ? 'text-emerald-500' : resultKey === 'borderline' ? 'text-amber-500' : 'text-red-500';

  return (
    <div className={`space-y-4 animate-in fade-in ${resultObj ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.arterialLabel}</label>
        <div className="space-y-2">
          {c.arterialOptions.map(opt => (
            <button key={opt.key} onClick={() => setArterial(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${arterial === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
          ))}
        </div>
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.venousLabel}</label>
        <div className="space-y-2">
          {c.venousOptions.map(opt => (
            <button key={opt.key} onClick={() => setVenous(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${venous === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
          ))}
        </div>
      </Card>
      {resultObj && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <span className={`text-2xl font-black ${resultColor}`}>{resultObj.label}</span>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{resultObj.mgmt}</p>
        </Card>
      )}
      <InfoBox tone="amber">{c.m0Note}</InfoBox>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.pancreasResect} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {resultObj && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className={`text-3xl font-black block leading-tight ${resultColor}`}>{resultObj.label}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 block mt-1">{c.resultLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
            <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
    </div>
  );
}

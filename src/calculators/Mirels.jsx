import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function Mirels() {
  const { t } = useLang();
  const c = t.calc.mirels;
  const [site, setSite] = useState(null);
  const [pain, setPain] = useState(null);
  const [lesionType, setLesionType] = useState(null);
  const [size, setSize] = useState(null);

  const allAnswered = site && pain && lesionType && size;
  const pointTotal = allAnswered ? site.points + pain.points + lesionType.points + size.points : null;

  let band = null;
  if (pointTotal !== null) {
    if (pointTotal >= 9) band = { key: 'high', title: c.highRiskTitle, note: c.highRiskNote, color: 'text-red-500' };
    else if (pointTotal === 8) band = { key: 'gray', title: c.grayZoneTitle, note: c.grayZoneNote, color: 'text-amber-500' };
    else band = { key: 'low', title: c.lowRiskTitle, note: c.lowRiskNote, color: 'text-emerald-500' };
  }

  const resetAll = () => { setSite(null); setPain(null); setLesionType(null); setSize(null); };

  const handleCopy = () => {
    if (!band || pointTotal === null) return;
    copyToClipboard(c.reportText(pointTotal, band.title), t.common.copiedOk, t.common.copiedErr);
  };

  const OptionGroup = ({ label, options, value, onChange }) => (
    <Card>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt)}
            className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-center ${value?.key === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            <span>{opt.label}</span>
            <span className="text-xs font-bold shrink-0 ml-2">{opt.points} pt</span>
          </button>
        ))}
      </div>
    </Card>
  );

  return (
    <div className={`space-y-4 animate-in fade-in ${band ? 'pb-56' : ''}`}>
      <OptionGroup label={c.siteLabel} options={c.siteOptions} value={site} onChange={setSite} />
      <OptionGroup label={c.painLabel} options={c.painOptions} value={pain} onChange={setPain} />
      <OptionGroup label={c.lesionTypeLabel} options={c.lesionTypeOptions} value={lesionType} onChange={setLesionType} />
      <OptionGroup label={c.sizeLabel} options={c.sizeOptions} value={size} onChange={setSize} />

      {band && (
        <Card>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className={`text-base font-bold ${band.color}`}>{band.title}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{c.pointTotalLabel}: {pointTotal}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{band.note}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 leading-snug">{c.thresholdComparisonNote}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.sensitivitySpecificityNote}</p>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.mirels} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {band && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultTitle}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${band.color}`}>{pointTotal} — {band.title}</span>
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

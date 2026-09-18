import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function TLICS() {
  const { t } = useLang();
  const c = t.calc.tlics;
  const [morph, setMorph] = useState(null);
  const [plc, setPlc] = useState(null);
  const [neuro, setNeuro] = useState(null);

  const allAnswered = morph && plc && neuro;
  const total = allAnswered ? morph.points + plc.points + neuro.points : null;

  let band = null;
  if (total !== null) {
    if (total <= 3) band = { key: 'nonop', title: c.nonopTitle, note: c.nonopNote, color: 'text-emerald-500', tone: 'emerald' };
    else if (total === 4) band = { key: 'either', title: c.eitherTitle, note: c.eitherNote, color: 'text-amber-500', tone: 'amber' };
    else band = { key: 'surg', title: c.surgTitle, note: c.surgNote, color: 'text-red-500', tone: 'red' };
  }

  // Table 5 (Vaccaro 2005, p.2329): surgical approach by neuro status × PLC, shown only
  // once surgery is on the table (total ≥ 4). The source gives no approach for a
  // "suspected/indeterminate" PLC — that gap is preserved explicitly rather than guessed.
  const showApproach = band && band.key !== 'nonop';
  let approachText = null;
  if (showApproach) {
    if (plc.key === 'suspected') approachText = c.approachNotSpecified;
    else if (neuro.key === 'intact' || neuro.key === 'nerveRoot') approachText = c.approachPosterior;
    else if (neuro.key === 'incompleteCord') approachText = plc.key === 'intact' ? c.approachAnterior : c.approachCombined;
    else if (neuro.key === 'completeCord') approachText = plc.key === 'intact' ? c.approachPosteriorAnterior : c.approachPosteriorCombined;
  }
  const showCompleteNote = showApproach && neuro.key === 'completeCord';

  const resetAll = () => { setMorph(null); setPlc(null); setNeuro(null); };

  const handleCopy = () => {
    if (!band || total === null) return;
    const lines = [c.reportText(total, band.title)];
    if (approachText) lines.push(`${c.approachLabel}: ${approachText}`);
    if (showCompleteNote) lines.push(c.approachCompleteNote);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  const OptionGroup = ({ label, options, value, onChange }) => (
    <Card>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt)}
            className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-center gap-2 ${value?.key === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            <span>{opt.label}</span>
            <span className="text-xs font-bold shrink-0">{opt.points} pt</span>
          </button>
        ))}
      </div>
    </Card>
  );

  return (
    <div className={`space-y-4 animate-in fade-in ${band ? 'pb-56' : ''}`}>
      <OptionGroup label={c.morphLabel} options={c.morphOptions} value={morph} onChange={setMorph} />
      <OptionGroup label={c.plcLabel} options={c.plcOptions} value={plc} onChange={setPlc} />
      <OptionGroup label={c.neuroLabel} options={c.neuroOptions} value={neuro} onChange={setNeuro} />

      {band && (
        <Card>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className={`text-base font-bold ${band.color}`}>{band.title}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{c.pointTotalLabel}: {total}/10</span>
          </div>
          <InfoBox tone={band.tone}>{band.note}</InfoBox>
          {approachText && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{c.approachLabel}: </span>
              {approachText}
            </p>
          )}
          {showCompleteNote && (
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-snug">{c.approachCompleteNote}</p>
          )}
        </Card>
      )}

      <InfoBox tone="slate">{c.clinicalNote}</InfoBox>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.tlics} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {band && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultTitle}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${band.color}`}>{total} — {band.title}</span>
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

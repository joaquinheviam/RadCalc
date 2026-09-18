import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function SINS() {
  const { t } = useLang();
  const c = t.calc.sins;
  const [loc, setLoc] = useState(null);
  const [pain, setPain] = useState(null);
  const [bone, setBone] = useState(null);
  const [align, setAlign] = useState(null);
  const [collapse, setCollapse] = useState(null);
  const [post, setPost] = useState(null);

  const allAnswered = loc && pain && bone && align && collapse && post;
  const total = allAnswered ? loc.points + pain.points + bone.points + align.points + collapse.points + post.points : null;

  let band = null;
  if (total !== null) {
    if (total <= 6) band = { title: c.resStableTitle, note: null, color: 'text-emerald-500', tone: 'emerald' };
    else if (total <= 12) band = { title: c.resIndetTitle, note: c.resSurgeryRecom, color: 'text-amber-500', tone: 'amber' };
    else band = { title: c.resUnstableTitle, note: c.resSurgeryRecom, color: 'text-red-500', tone: 'red' };
  }

  const resetAll = () => { setLoc(null); setPain(null); setBone(null); setAlign(null); setCollapse(null); setPost(null); };

  const handleCopy = () => {
    if (!band || total === null) return;
    copyToClipboard(c.reportText(total, band.title), t.common.copiedOk, t.common.copiedErr);
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
      <OptionGroup label={c.locLabel} options={c.locOptions} value={loc} onChange={setLoc} />
      <OptionGroup label={c.painLabel} options={c.painOptions} value={pain} onChange={setPain} />
      <OptionGroup label={c.boneLabel} options={c.boneOptions} value={bone} onChange={setBone} />
      <OptionGroup label={c.alignLabel} options={c.alignOptions} value={align} onChange={setAlign} />
      <OptionGroup label={c.collapseLabel} options={c.collapseOptions} value={collapse} onChange={setCollapse} />
      <OptionGroup label={c.postLabel} options={c.postOptions} value={post} onChange={setPost} />

      {band && (
        <Card>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className={`text-base font-bold ${band.color}`}>{band.title}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{c.pointTotalLabel}: {total}/18</span>
          </div>
          {band.note && <InfoBox tone={band.tone}>{band.note}</InfoBox>}
        </Card>
      )}

      <InfoBox tone="slate">{c.clinicalNote}</InfoBox>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.sins} />
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

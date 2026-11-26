import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';
import { KIDNEY_LENGTH, kidneyZ } from './logic/kidneyPeds.js';

const COLOR = { small: 'text-amber-500', normal: 'text-emerald-500', large: 'text-red-500' };

export default function KidneyPeds() {
  const { t, lang } = useLang();
  const c = t.calc.kidneyPeds;
  const [showPreview, setShowPreview] = useState(false);
  const [group, setGroup] = useState('');
  const [right, setRight] = useState('');
  const [left, setLeft] = useState('');

  const num = (x, d) => x.toLocaleString(lang === 'es' ? 'es-CL' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const sgn = (z) => (z >= 0 ? '+' : '−') + num(Math.abs(z), 1);
  const rr = group && right !== '' ? kidneyZ(group, parseFloat(right)) : null;
  const rl = group && left !== '' ? kidneyZ(group, parseFloat(left)) : null;
  const row = KIDNEY_LENGTH.find((r) => r[0] === group);
  const refText = row ? c.refLine(c.ages[group], num(row[1], 2), num(row[2], 2), num(row[1] - 2 * row[2], 1), num(row[1] + 2 * row[2], 1)) : '';
  const side = (k, r, v) => r && c.sideLine(c.sides[k], num(parseFloat(v), 1), sgn(r.z), Math.round(r.pct), c.bands[r.band]);
  const worst = [rr, rl].filter(Boolean).sort((a, b) => Math.abs(b.z) - Math.abs(a.z))[0];

  const getReportText = () => {
    if (!worst) return '';
    return [c.reportTitle(c.ages[group]), side('right', rr, right), side('left', rl, left), refText].filter(Boolean).join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setGroup(''); setRight(''); setLeft(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${worst ? 'pb-56' : ''}`}>
      <Card>
        <label htmlFor="kp-age" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{c.ageLabel}</label>
        <select id="kp-age" value={group} onChange={(e) => setGroup(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">{c.agePlaceholder}</option>
          {KIDNEY_LENGTH.map(([k]) => <option key={k} value={k}>{c.ages[k]}</option>)}
        </select>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.ageHint}</p>
        <div className="grid grid-cols-2 gap-3 items-end mt-4">
          <NumberField label={c.rightLabel} value={right} onChange={setRight} />
          <NumberField label={c.leftLabel} value={left} onChange={setLeft} />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.lengthHint}</p>
      </Card>
      {worst && (
        <Card>
          {[['right', rr, right], ['left', rl, left]].filter(([, r]) => r).map(([k, r, v]) => (
            <p key={k} className={`text-sm font-semibold ${COLOR[r.band]}`}>{side(k, r, v)}</p>
          ))}
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 leading-snug">{refText}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.pctNote}</p>
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.kidneyPeds} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {worst && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${COLOR[worst.band]}`}>{c.bandsShort[worst.band]}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{[rr && `${c.sidesShort.right} Z ${sgn(rr.z)}`, rl && `${c.sidesShort.left} Z ${sgn(rl.z)}`].filter(Boolean).join(' · ')}</span>
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

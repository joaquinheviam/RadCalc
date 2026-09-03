import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

export default function RenalScore() {
  const { t } = useLang();
  const c = t.calc.renalScore;
  const [radius, setRadius] = useState('');
  const [exo, setExo] = useState(null);
  const [near, setNear] = useState('');
  const [loc, setLoc] = useState(null);
  const [ant, setAnt] = useState(null);
  const [hilar, setHilar] = useState(false);

  const radiusNum = radius === '' ? null : parseFloat(radius);
  const nearNum = near === '' ? null : parseFloat(near);
  const rPts = radiusNum === null || isNaN(radiusNum) ? null : (radiusNum <= 4 ? 1 : radiusNum < 7 ? 2 : 3);
  const ePts = exo ? c.exoOptions.find(o => o.key === exo).pts : null;
  const nPts = nearNum === null || isNaN(nearNum) ? null : (nearNum >= 7 ? 1 : nearNum > 4 ? 2 : 3);
  const lPts = loc ? c.locOptions.find(o => o.key === loc).pts : null;

  const canCompute = rPts !== null && ePts !== null && nPts !== null && lPts !== null;
  const total = canCompute ? rPts + ePts + nPts + lPts : null;
  const risk = total === null ? null : (total <= 6 ? c.riskLow : total <= 9 ? c.riskIntermediate : c.riskHigh);
  const riskColor = total === null ? '' : (total <= 6 ? 'text-emerald-500' : total <= 9 ? 'text-amber-500' : 'text-red-500');
  const antLetter = ant || 'x';
  const formula = canCompute ? `R${rPts}E${ePts}N${nPts}A${antLetter}L${lPts}` : null;
  const suffix = hilar ? 'h' : '';

  const handleCopy = () => {
    if (!canCompute) return;
    const text = c.reportText(formula + suffix, total, risk);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => {
    setRadius(''); setExo(null); setNear(''); setLoc(null); setAnt(null); setHilar(false);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${canCompute ? 'pb-24' : ''}`}>
      <Card>
        <NumberField label={c.radiusLabel} value={radius} onChange={setRadius} placeholder={c.radiusPh} />
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.exoLabel}</label>
        <div className="space-y-2">
          {c.exoOptions.map(opt => (
            <button key={opt.key} onClick={() => setExo(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${exo === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
          ))}
        </div>
      </Card>
      <Card>
        <NumberField label={c.nearLabel} value={near} onChange={setNear} placeholder={c.nearPh} />
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.locLabel}</label>
        <div className="space-y-2">
          {c.locOptions.map(opt => (
            <button key={opt.key} onClick={() => setLoc(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${loc === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
          ))}
        </div>
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.anteriorLabel}</label>
        <div className="flex gap-2">
          {c.anteriorOptions.map(opt => (
            <button key={opt.key} onClick={() => setAnt(opt.key)} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${ant === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
          ))}
        </div>
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.hilarLabel}</label>
        <div className="flex gap-2">
          <button onClick={() => setHilar(true)} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${hilar === true ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
          <button onClick={() => setHilar(false)} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${hilar === false ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
        </div>
      </Card>
      {canCompute ? (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{formula}{suffix} = {total}</span>
          <p className={`text-sm font-semibold mt-1 ${riskColor}`}>{risk}</p>
        </Card>
      ) : (
        <InfoBox tone="amber">{c.pending}</InfoBox>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.renalScore} />
      <ReportBugLink calcTitle={c.title} />
      {canCompute && (
        <StickyBar>
          <div className="min-w-0 text-left">
            <span className="text-lg font-black text-slate-800 dark:text-slate-100 block truncate">{formula}{suffix} = {total}</span>
            <span className={`text-xs font-semibold block truncate ${riskColor}`}>{risk}</span>
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

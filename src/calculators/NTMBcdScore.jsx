import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

const BCD_LOBES = ['rul', 'rml', 'rll', 'lul', 'lingula', 'lll'];

export default function NTMBcdScore() {
  const { t, lang } = useLang();
  const c = t.calc.ntmBcd;
  const [lobes, setLobes] = useState(() => Object.fromEntries(BCD_LOBES.map(l => [l, { cavity: false, be: false }])));
  const hasAnyInput = Object.values(lobes).some(l => l.cavity || l.be);

  const toggle = (lobe, field) => setLobes(prev => ({ ...prev, [lobe]: { ...prev[lobe], [field]: !prev[lobe][field] } }));

  const score = Object.values(lobes).filter(l => l.cavity || l.be).length;
  let riskKey = 'low', riskLabel = c.lowRisk, riskColor = 'text-emerald-500', riskDesc = c.riskDesc.low;
  if (score >= 4) { riskKey = 'high'; riskLabel = c.highRisk; riskColor = 'text-red-500'; riskDesc = c.riskDesc.high; }
  else if (score >= 2) { riskKey = 'intermediate'; riskLabel = c.intermediateRisk; riskColor = 'text-amber-500'; riskDesc = c.riskDesc.intermediate; }

  const handleCopy = () => {
    const lobeDetail = BCD_LOBES.map(l => `${c.lobeLabels[l]}: ${[lobes[l].cavity ? c.cavityLabel : null, lobes[l].be ? c.beLabel : null].filter(Boolean).join(' + ') || '-'}`).join('; ');
    const text = c.reportText(score, riskLabel, lobeDetail);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => setLobes(Object.fromEntries(BCD_LOBES.map(l => [l, { cavity: false, be: false }])));

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyInput ? 'pb-24' : ''}`}>
      <Card>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.intro}</p>
        <div className="space-y-2">
          {BCD_LOBES.map(l => (
            <div key={l} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span className="text-sm font-medium w-16 shrink-0">{c.lobeLabels[l]}</span>
              <div className="flex gap-2 flex-1">
                <button onClick={() => toggle(l, 'cavity')} className={`flex-1 text-[11px] p-2 rounded-lg border transition-all ${lobes[l].cavity ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>{c.cavityLabel}</button>
                <button onClick={() => toggle(l, 'be')} className={`flex-1 text-[11px] p-2 rounded-lg border transition-all ${lobes[l].be ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>{c.beLabel}</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {hasAnyInput && <InfoBox tone={riskKey === 'low' ? 'emerald' : 'amber'}>{riskDesc}</InfoBox>}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.ntmBcd} />
      <ReportBugLink calcTitle={c.title} />
      {hasAnyInput && (
        <StickyBar>
          <div className="min-w-0 text-left">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.scoreLabel}</span>
            <span className={`text-lg font-black ${riskColor}`}>{score}/6 — {riskLabel}</span>
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

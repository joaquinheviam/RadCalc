import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconAlertTriangle, IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function PectusHallerCI() {
  const { t } = useLang();
  const c = t.calc.pectusHallerCI;
  const [transverse, setTransverse] = useState('');
  const [apDepth, setApDepth] = useState('');
  const [apCorrected, setApCorrected] = useState('');

  const A = parseFloat(transverse) || 0;
  const B = parseFloat(apDepth) || 0;
  const C = parseFloat(apCorrected) || 0;

  const hasHI = transverse !== '' && apDepth !== '' && A > 0 && B > 0;
  const hi = hasHI ? A / B : 0;
  const hiSignificant = hi >= 3.25;

  const hasCI = apDepth !== '' && apCorrected !== '' && B > 0 && C > 0;
  const ci = hasCI ? ((C - B) / C) * 100 : 0;
  const ciSignificant = ci >= 28;
  const ciBorderline = ci >= 10 && ci < 28;

  const hasAny = hasHI || hasCI;
  const hasBoth = hasHI && hasCI;
  const discordant = hasBoth && hiSignificant !== ciSignificant;
  const discordanceType = discordant ? (hiSignificant && !ciSignificant ? 'broad' : 'narrow') : null;

  const hiVerdictLabel = !hasHI ? '' : hiSignificant ? c.hiSignificant : c.hiNotSignificant;
  const ciVerdictLabel = !hasCI ? '' : ciSignificant ? c.ciSignificant : ciBorderline ? c.ciBorderline : c.ciNotSignificant;

  const handleCopy = () => {
    const lines = [];
    if (hasHI) lines.push(`${c.hiLabel}: ${hi.toFixed(2)} (${hiVerdictLabel})`);
    if (hasCI) lines.push(`${c.ciLabel}: ${ci.toFixed(1)}% (${ciVerdictLabel})`);
    if (discordanceType === 'broad') lines.push(c.discordanceBroad);
    if (discordanceType === 'narrow') lines.push(c.discordanceNarrow);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setTransverse(''); setApDepth(''); setApCorrected(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAny ? 'pb-56' : ''}`}>
      <Card>
        <NumberField label={c.transverseLabel} placeholder={c.transversePh} value={transverse} onChange={setTransverse} />
        <NumberField label={c.apLabel} placeholder={c.apPh} value={apDepth} onChange={setApDepth} />
        <div>
          <NumberField label={c.correctedApLabel} placeholder={c.correctedApPh} value={apCorrected} onChange={setApCorrected} />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{c.correctedApHelp}</p>
        </div>
      </Card>

      {hasHI && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.hiLabel}</span>
          <span className={`text-2xl font-black ${hiSignificant ? 'text-red-500' : 'text-emerald-500'}`}>{hi.toFixed(2)}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">{hiVerdictLabel}</span>
        </Card>
      )}

      {hasHI && !hasCI && (
        <p className="text-xs text-center text-slate-400 dark:text-slate-500 -mt-2">{c.ciPending}</p>
      )}

      {hasCI && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.ciLabel}</span>
          <span className={`text-2xl font-black ${ciSignificant ? 'text-red-500' : ciBorderline ? 'text-amber-500' : 'text-emerald-500'}`}>{ci.toFixed(1)}%</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">{ciVerdictLabel}</span>
        </Card>
      )}

      {discordant && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3 flex gap-2">
          <IconAlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>{discordanceType === 'broad' ? c.discordanceBroadTitle : c.discordanceNarrowTitle}: </strong>
            {discordanceType === 'broad' ? c.discordanceBroad : c.discordanceNarrow}
          </p>
        </div>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.pectusHallerCI} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasAny && (
        <StickyBar>
          <div className="min-w-0 text-center">
            {hasHI && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.hiLabel}:</span>
                <span className={`text-3xl font-black flex items-center justify-center gap-2 leading-tight ${hiSignificant ? 'text-red-500' : 'text-emerald-500'}`}>
                  {hiSignificant ? <IconAlertTriangle size={24} /> : <IconCheckCircle size={24} />}
                  {hi.toFixed(2)}
                </span>
              </>
            )}
            {hasCI && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block mt-2">{c.ciLabel}:</span>
                <span className={`text-3xl font-black flex items-center justify-center gap-2 leading-tight ${ciSignificant ? 'text-red-500' : ciBorderline ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {ciSignificant ? <IconAlertTriangle size={24} /> : <IconCheckCircle size={24} />}
                  {ci.toFixed(1)}%
                </span>
              </>
            )}
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

import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

// Puntos de corte según Hevia-Morel et al. (revisión suprarrenal, en preparación),
// que a su vez sintetizan: Caoili 2002 (15 min), Blake 2006 / Kumagae 2013 (10 min),
// Kumagae 2013 (5 min) y Liu et al. 2019 (~200 s / 3 min). A 5 y 3 min no existe
// un criterio absoluto (PLA) validado, solo relativo (PLR).
const ADRENAL_PROTOCOLS = {
  p15: { minutes: 15, apwCut: 60, rpwCut: 40, hasKamiyama: false, lowerEvidence: false },
  p10: { minutes: 10, apwCut: 50, rpwCut: 40, hasKamiyama: false, lowerEvidence: false },
  p5: { minutes: 5, apwCut: null, rpwCut: 27, hasKamiyama: true, lowerEvidence: true },
  p3: { minutes: 3, apwCut: null, rpwCut: 30, hasKamiyama: false, lowerEvidence: true },
};
const PROTOCOL_LABEL_KEYS = { p15: 'protocol15', p10: 'protocol10', p5: 'protocol5', p3: 'protocol3' };

export default function AdrenalWashout() {
  const { t, lang } = useLang();
  const c = t.calc.adrenalCt;
  const [protocol, setProtocol] = useState('p15');
  const [nc, setNc] = useState('');
  const [ven, setVen] = useState('');
  const [del, setDel] = useState('');
  const [size, setSize] = useState('');

  const hNc = parseFloat(nc);
  const hVen = parseFloat(ven);
  const hDel = parseFloat(del);
  const hSize = parseFloat(size);
  const hasNc = !isNaN(hNc);
  const hasVen = !isNaN(hVen);
  const hasDel = !isNaN(hDel);
  const hasSize = !isNaN(hSize);
  const hasAnyInput = nc !== '' || ven !== '' || del !== '' || size !== '';

  const cfg = ADRENAL_PROTOCOLS[protocol];
  const protocolLabel = c[PROTOCOL_LABEL_KEYS[protocol]];

  // PLR (lavado relativo) solo necesita portovenosa + tardía.
  // PLA (lavado absoluto) además necesita el valor sin contraste.
  const canPlr = hasVen && hasDel && hVen !== 0;
  const canPla = canPlr && hasNc && (hVen - hNc) !== 0;
  const plr = canPlr ? ((hVen - hDel) / hVen) * 100 : null;
  const pla = canPla ? ((hVen - hDel) / (hVen - hNc)) * 100 : null;

  const isAdenomaPla = cfg.apwCut != null && pla !== null && pla >= cfg.apwCut;
  const isAdenomaPlr = plr !== null && plr >= cfg.rpwCut;
  const isAdenomaWashout = isAdenomaPla || isAdenomaPlr;

  // Evidencia adicional a los 5 min (Kamiyama 2009), solo si también hay precontraste.
  const kamiyama = (cfg.hasKamiyama && canPla) ? {
    nc: hNc <= 19,
    delayed: hDel <= 50,
    pew: plr >= 45,
    rpew: pla >= 31,
  } : null;
  const kamiyamaCount = kamiyama ? Object.values(kamiyama).filter(Boolean).length : 0;

  // Interpretación aislada del valor sin contraste (siempre disponible si se ingresó).
  let ncTier = null;
  if (hasNc) {
    if (hNc <= 10) ncTier = 'ncHighSpec';
    else if (hNc <= 43) ncTier = 'ncIndeterminate';
    else ncTier = 'ncSuspiciousMalignant';
  }

  const ncResultLabel = ncTier === 'ncHighSpec' ? c.compatible : ncTier === 'ncIndeterminate' ? c.ncResultIndeterminate : ncTier === 'ncSuspiciousMalignant' ? c.ncResultSuspicious : null;
  const ncResultTone = ncTier === 'ncHighSpec' ? 'text-emerald-500' : ncTier === 'ncIndeterminate' ? 'text-amber-500' : 'text-red-500';

  const showMyelolipoma = hasNc && hNc <= -20;
  const showPheo = hasVen && hVen > 110 && (!hasNc || hNc >= 10);
  let sizeTier = null;
  if (hasSize) {
    if (hSize > 6) sizeTier = 'sizeVeryHigh';
    else if (hSize > 4) sizeTier = 'sizeHigh';
  }

  const handleCopy = () => {
    const lines = [];
    if (canPlr) {
      lines.push(c.reportTitle(protocolLabel));
      if (nc !== '') lines.push(c.reportLineNc(nc));
      lines.push(c.reportLineVen(ven));
      lines.push(c.reportLineDel(del, protocolLabel));
      if (size !== '') lines.push(c.reportLineSize(size));
      lines.push(pla !== null ? c.reportLinePla(pla.toFixed(1), isAdenomaPla ? c.compatible : c.notSuggestive) : c.reportLinePlaNA);
      lines.push(c.reportLinePlr(plr.toFixed(1), isAdenomaPlr ? c.compatible : c.notSuggestive));
      if (kamiyama) lines.push(c.reportLineKamiyama(kamiyamaCount));
      lines.push(c.reportConclusion(isAdenomaWashout ? c.adenomaCompatible : c.adenomaNot));
    } else if (hasNc) {
      lines.push(c.reportNcOnlyTitle);
      lines.push(c.reportLineNc(nc));
      if (size !== '') lines.push(c.reportLineSize(size));
      lines.push(c[ncTier]);
    }
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setProtocol('p15'); setNc(''); setVen(''); setDel(''); setSize(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${(canPlr || hasNc) ? 'pb-56' : ''}`}>
      <Card>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.protocol}</label>
          <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {['p15', 'p10', 'p5', 'p3'].map(p => (
              <button key={p} onClick={() => setProtocol(p)} className={`py-2 text-[11px] sm:text-xs font-medium rounded-lg transition-all ${protocol === p ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {c[PROTOCOL_LABEL_KEYS[p]]}
              </button>
            ))}
          </div>
        </div>
        <NumberField label={c.nonContrast} value={nc} onChange={setNc} />
        <div>
          <NumberField label={c.portal} value={ven} onChange={setVen} />
          <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-snug mt-1">{c.portalWarning}</p>
        </div>
        <NumberField label={protocol === 'p3' ? c.delayedAt3 : c.delayedAt(cfg.minutes)} value={del} onChange={setDel} />
        <NumberField label={c.sizeLabel} value={size} onChange={setSize} />
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{c.roiTip}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{c.heterogeneousNote}</p>
      </Card>

      {hasNc && (
        <Card>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{c.ncOnlyTitle}</p>
          <div className="space-y-2 text-sm">
            {ncTier === 'ncHighSpec' && <InfoBox tone="emerald">{c.ncHighSpec}</InfoBox>}
            {ncTier === 'ncIndeterminate' && <InfoBox tone="amber">{c.ncIndeterminate}</InfoBox>}
            {ncTier === 'ncSuspiciousMalignant' && <InfoBox tone="amber">{c.ncSuspiciousMalignant}</InfoBox>}
            {showMyelolipoma && <InfoBox tone="amber">{c.myelolipoma}</InfoBox>}
          </div>
        </Card>
      )}

      {showPheo && <InfoBox tone="amber">{c.pheoCaution}</InfoBox>}
      {sizeTier === 'sizeHigh' && <InfoBox tone="amber">{c.sizeHigh}</InfoBox>}
      {sizeTier === 'sizeVeryHigh' && <InfoBox tone="amber">{c.sizeVeryHigh}</InfoBox>}

      {canPlr && (
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.absolute}</span>
              <span className={`text-xl font-bold ${isAdenomaPla ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                {pla !== null ? pla.toFixed(1) + '%' : '—'}
              </span>
              {cfg.apwCut != null ? (
                <span className="block text-[10px] text-slate-400 mt-1">{t.common.cutoff} &ge; {cfg.apwCut}%</span>
              ) : (
                <span className="block text-[10px] text-slate-400 mt-1">{c.noAbsoluteCriterion}</span>
              )}
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.relative}</span>
              <span className={`text-xl font-bold ${isAdenomaPlr ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                {plr.toFixed(1) + '%'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-1">{t.common.cutoff} &ge; {cfg.rpwCut}%</span>
            </div>
          </div>
          {!canPla && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 leading-snug">{c.onlyRelativeNote}</p>}
          {cfg.lowerEvidence && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.lowerEvidenceNote}</p>}
          <div className="mt-2">
            <InfoBox tone={isAdenomaWashout ? 'emerald' : 'amber'}>
              {isAdenomaWashout ? c.adenomaCompatible : c.adenomaNot}
            </InfoBox>
          </div>
          {kamiyama && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{c.kamiyamaTitle}</p>
              <ul className="space-y-1.5 text-sm">
                <li className={`flex items-center gap-2 ${kamiyama.nc ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{kamiyama.nc ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.kamiyamaNc}</li>
                <li className={`flex items-center gap-2 ${kamiyama.delayed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{kamiyama.delayed ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.kamiyamaDelayed}</li>
                <li className={`flex items-center gap-2 ${kamiyama.pew ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{kamiyama.pew ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.kamiyamaPew}</li>
                <li className={`flex items-center gap-2 ${kamiyama.rpew ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{kamiyama.rpew ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.kamiyamaRpew}</li>
              </ul>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">{c.kamiyamaMetCount(kamiyamaCount)}</p>
            </div>
          )}
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.adrenalCt} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {canPlr && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{protocolLabel}</span>
            <span className={`text-3xl font-black block mt-1 leading-tight ${isAdenomaWashout ? 'text-emerald-500' : 'text-amber-500'}`}>{isAdenomaWashout ? c.adenomaCompatible : c.adenomaNot}</span>
            {sizeTier && (
              <span className={`text-xs font-semibold block mt-2 ${sizeTier === 'sizeVeryHigh' ? 'text-red-500' : 'text-amber-500'}`}>
                {sizeTier === 'sizeVeryHigh' ? c.sizeRiskShortVeryHigh : c.sizeRiskShortHigh}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
            <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
      {!canPlr && hasNc && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.ncOnlyShortLabel}</span>
            <span className={`text-3xl font-black block mt-1 leading-tight ${ncResultTone}`}>{ncResultLabel}</span>
            {sizeTier && (
              <span className={`text-xs font-semibold block mt-2 ${sizeTier === 'sizeVeryHigh' ? 'text-red-500' : 'text-amber-500'}`}>
                {sizeTier === 'sizeVeryHigh' ? c.sizeRiskShortVeryHigh : c.sizeRiskShortHigh}
              </span>
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

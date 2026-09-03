import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

const ADRENAL_PROTOCOLS = {
  p15: { minutes: 15, apwCut: 60, rpwCut: 40 },
  p10: { minutes: 10, apwCut: 52, rpwCut: 37.5 },
  p5: { minutes: 5 },
};

export default function AdrenalWashout() {
  const { t, lang } = useLang();
  const c = t.calc.adrenalCt;
  const [protocol, setProtocol] = useState('p15');
  const [nc, setNc] = useState('');
  const [ven, setVen] = useState('');
  const [del, setDel] = useState('');
  const hNc = parseFloat(nc);
  const hVen = parseFloat(ven);
  const hDel = parseFloat(del);
  const hasAnyInput = nc !== '' || ven !== '' || del !== '';
  const isValid = !isNaN(hNc) && !isNaN(hVen) && !isNaN(hDel);
  const cfg = ADRENAL_PROTOCOLS[protocol];

  // Protocolos 15 y 10 min: APW/RPW clásicos con distinto punto de corte
  const apw = isValid ? ((hVen - hDel) / (hVen - hNc)) * 100 : 0;
  const rpw = isValid ? ((hVen - hDel) / hVen) * 100 : 0;
  const isAdenomaAPW = protocol !== 'p5' && isValid && apw >= cfg.apwCut;
  const isAdenomaRPW = protocol !== 'p5' && isValid && rpw >= cfg.rpwCut;
  const isAdenomaClassic = isAdenomaAPW || isAdenomaRPW;

  // Protocolo 5 min (Kamiyama 2009): 4 criterios combinados, cualquiera basta
  const pew = isValid ? ((hVen - hDel) / hVen) * 100 : 0;
  const rpew = isValid ? ((hVen - hDel) / (hVen - hNc)) * 100 : 0;
  const crit5 = {
    nc: isValid && hNc <= 19,
    delayed: isValid && hDel <= 50,
    pew: isValid && pew >= 45,
    rpew: isValid && rpew >= 31,
  };
  const isAdenoma5min = isValid && (crit5.nc || crit5.delayed || crit5.pew || crit5.rpew);
  const isAdenoma = protocol === 'p5' ? isAdenoma5min : isAdenomaClassic;

  const protocolLabel = protocol === 'p15' ? c.protocol15 : protocol === 'p10' ? c.protocol10 : c.protocol5;

  const handleCopy = () => {
    let text;
    if (protocol === 'p5') {
      const met = Object.entries(crit5).filter(([,v]) => v).length;
      text = c.reportText5min(nc, ven, del, met, isAdenoma5min ? c.compatible : c.notSuggestive);
    } else {
      text = c.reportText(protocolLabel, nc, ven, del, apw.toFixed(1), isAdenomaAPW ? c.compatible : c.notSuggestive, rpw.toFixed(1), isAdenomaRPW ? c.compatible : c.notSuggestive);
    }
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setProtocol('p15'); setNc(''); setVen(''); setDel(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${isValid ? 'pb-56' : ''}`}>
      <Card>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.protocol}</label>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {['p15','p10','p5'].map(p => (
              <button key={p} onClick={() => setProtocol(p)} className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${protocol === p ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {p === 'p15' ? c.protocol15 : p === 'p10' ? c.protocol10 : c.protocol5}
              </button>
            ))}
          </div>
        </div>
        <NumberField label={c.nonContrast} value={nc} onChange={setNc} />
        <NumberField label={c.portal} value={ven} onChange={setVen} />
        <NumberField label={c.delayedAt(cfg.minutes)} value={del} onChange={setDel} />
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{c.roiTip}</p>
      </Card>

      {!isNaN(hNc) && (
        <Card>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{c.ncOnlyTitle}</p>
          <div className="space-y-2 text-sm">
            {hNc <= 10 && (
              <InfoBox tone="emerald">{c.ncHighSpec}</InfoBox>
            )}
            {hNc > 10 && hNc < 18 && (
              <InfoBox tone="amber">{c.ncSuggestive}</InfoBox>
            )}
            {hNc >= 18 && (
              <InfoBox tone="amber">{c.ncNonDiagnostic}</InfoBox>
            )}
            {hNc <= -30 && (
              <InfoBox tone="amber">{c.myelolipoma}</InfoBox>
            )}
          </div>
        </Card>
      )}

      {!isNaN(hVen) && hVen > 100 && (isNaN(hNc) || hNc >= 10) && (
        <InfoBox tone="amber">{c.pheoCaution}</InfoBox>
      )}

      {hasAnyInput && protocol !== 'p5' && (
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.absolute}</span>
              <span className={`text-xl font-bold ${isAdenomaAPW ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                {isValid ? apw.toFixed(1) + '%' : '—'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-1">{t.common.cutoff} &ge; {cfg.apwCut}%</span>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.relative}</span>
              <span className={`text-xl font-bold ${isAdenomaRPW ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                {isValid ? rpw.toFixed(1) + '%' : '—'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-1">{t.common.cutoff} &ge; {cfg.rpwCut}%</span>
            </div>
          </div>
          {isValid && (
            <InfoBox tone={isAdenoma ? 'emerald' : 'amber'}>
              {isAdenoma ? c.adenomaCompatible : c.adenomaNot}
            </InfoBox>
          )}
        </Card>
      )}

      {hasAnyInput && protocol === 'p5' && (
        <Card>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.fiveMinTitle}</p>
          <ul className="space-y-1.5 text-sm">
            <li className={`flex items-center gap-2 ${crit5.nc ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{crit5.nc ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.fiveMinNc}</li>
            <li className={`flex items-center gap-2 ${crit5.delayed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{crit5.delayed ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.fiveMinDelayed}</li>
            <li className={`flex items-center gap-2 ${crit5.pew ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{crit5.pew ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.fiveMinPew} {isValid && `(${pew.toFixed(1)}%)`}</li>
            <li className={`flex items-center gap-2 ${crit5.rpew ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{crit5.rpew ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.fiveMinRpew} {isValid && `(${rpew.toFixed(1)}%)`}</li>
          </ul>
          {isValid && (
            <InfoBox tone={isAdenoma5min ? 'emerald' : 'amber'}>
              {isAdenoma5min ? c.adenomaCompatible : c.adenomaNot}
            </InfoBox>
          )}
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.adrenalCt} />
      <ReportBugLink calcTitle={c.title} />
      {isValid && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{protocolLabel}</span>
            <span className={`text-3xl font-black block mt-1 leading-tight ${isAdenoma ? 'text-emerald-500' : 'text-amber-500'}`}>{isAdenoma ? c.adenomaCompatible : c.adenomaNot}</span>
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

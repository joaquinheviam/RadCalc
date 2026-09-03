import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconInfo } from '../components/icons/index.js';
import { Card, NumberField, CopyButton, StickyBar, ResetIconButton, CopyIconButton, Accordion, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

function fleischnerRec(c, type, count, risk, size) {
  if (type === 'solid') {
    if (count === 'single') {
      if (size < 6) return risk === 'high' ? c.recs.optionalCt12 : c.recs.none;
      if (size <= 8) return risk === 'high' ? c.recs.soloSolid6to8High : c.recs.soloSolid6to8Low;
      return c.recs.soloSolidOver8;
    }
    if (size < 6) return risk === 'high' ? c.recs.optionalCt12 : c.recs.none;
    return risk === 'high' ? c.recs.multipleSolidGeq6High : c.recs.multipleSolidGeq6Low;
  }
  if (type === 'ggn') {
    if (count === 'single') return size < 6 ? c.recs.none : c.recs.ggnFollow;
    return size < 6 ? c.recs.multiSubsolidUnder6 : c.recs.multiSubsolidGeq6;
  }
  // partSolid
  if (count === 'single') return size < 6 ? c.recs.none : c.recs.partSolidFollow;
  return size < 6 ? c.recs.multiSubsolidUnder6 : c.recs.multiSubsolidGeq6;
}

function nccnRec(c, type, count, risk, size) {
  if (type === 'solid') {
    if (size < 6) return risk === 'high' ? c.nccnRecs.solidHighUnder6 : c.nccnRecs.none;
    if (size <= 8) return risk === 'high' ? c.nccnRecs.solidHighMid : c.nccnRecs.solidLowMid;
    return c.nccnRecs.solidOver8;
  }
  if (type === 'ggn') {
    if (count === 'single') return size < 6 ? c.nccnRecs.none : c.nccnRecs.ggnSoloFollow;
    return size < 6 ? c.nccnRecs.multiSubsolidUnder6 : c.nccnRecs.multiSubsolidGeq6;
  }
  // partSolid
  if (count === 'single') return size < 6 ? c.nccnRecs.none : c.nccnRecs.partSolidSoloFollow;
  return size < 6 ? c.nccnRecs.multiSubsolidUnder6 : c.nccnRecs.multiSubsolidGeq6;
}

export default function LungNodule() {
  const { t, lang } = useLang();
  const c = t.calc.lungNodule;
  // Paso 1: cribado de nódulo perifisural (PFN / ganglio linfático intrapulmonar), Schreuder et al. 2020.
  // pfnStage: 'gate1' | 'gate2' | 'gate3' | 'result-pfn' | 'result-notpfn' | 'skipped'
  const [pfnHistory, setPfnHistory] = useState(['gate1']);
  const pfnStage = pfnHistory[pfnHistory.length - 1];
  const goPfn = (stage) => setPfnHistory(h => [...h, stage]);
  const pfnBack = () => setPfnHistory(h => h.length > 1 ? h.slice(0, -1) : h);
  const pfnReset = () => setPfnHistory(['gate1']);
  const [type, setType] = useState('solid');
  const [count, setCount] = useState('single');
  const [risk, setRisk] = useState('low');
  const [size, setSize] = useState('');
  const [framework, setFramework] = useState('fleischner'); // 'fleischner' | 'nccn'

  const resetAll = () => {
    pfnReset(); setType('solid'); setCount('single'); setRisk('low'); setSize(''); setFramework('fleischner');
  };

  const sizeNum = parseFloat(size);
  const hasSize = size !== '' && !isNaN(sizeNum);
  const rec = hasSize ? (framework === 'nccn' ? nccnRec(c, type, count, risk, sizeNum) : fleischnerRec(c, type, count, risk, sizeNum)) : null;
  const resultLabel = framework === 'nccn' ? c.nccnResult : c.fleischnerResult;
  const frameworkLabel = framework === 'nccn' ? c.frameworkNccn : c.frameworkFleischner;

  const typeLabelText = type === 'solid' ? c.typeSolid : type === 'partSolid' ? c.typePartSolid : c.typeGgn;
  const countLabelText = count === 'single' ? c.countSingle : c.countMultiple;
  const riskLabelText = risk === 'high' ? c.riskHigh : c.riskLow;

  const handleCopy = () => {
    if (!rec) return;
    const text = c.reportText(typeLabelText, countLabelText, size, type === 'solid' ? riskLabelText : '', rec, frameworkLabel);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const handleCopyPfn = () => {
    const text = c.pfnReportText(pfnStage === 'result-pfn' ? c.pfnResultTitle : c.pfnNotResultTitle);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const showFleischnerForm = pfnStage === 'result-notpfn' || pfnStage === 'skipped';

  return (
    <div className={`space-y-4 animate-in fade-in ${rec ? 'pb-56' : ''}`}>
      <Card>
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{c.pfnTitle}</h3>
          {pfnHistory.length > 1 && (pfnStage === 'gate2' || pfnStage === 'gate3') && (
            <button onClick={pfnBack} className="text-xs text-blue-500 dark:text-blue-400 font-medium shrink-0 hover:underline">{c.stepBack}</button>
          )}
        </div>
        {pfnStage === 'gate1' && (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.pfnIntro}</p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1 mb-3">
              {c.pfnGate1Items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.pfnGate1Q}</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => goPfn('gate2')} className="flex-1 p-2.5 rounded-lg border text-sm transition-all border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500">{c.pfnYes}</button>
              <button onClick={() => goPfn('result-notpfn')} className="flex-1 p-2.5 rounded-lg border text-sm transition-all border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500">{c.pfnNo}</button>
            </div>
            <button onClick={() => goPfn('skipped')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{c.pfnSkip}</button>
          </>
        )}
        {pfnStage === 'gate2' && (
          <>
            <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1 mb-3">
              {c.pfnGate2Items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.pfnGate2Q}</label>
            <div className="flex gap-2">
              <button onClick={() => goPfn('result-pfn')} className="flex-1 p-2.5 rounded-lg border text-sm transition-all border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500">{c.pfnYes}</button>
              <button onClick={() => goPfn('gate3')} className="flex-1 p-2.5 rounded-lg border text-sm transition-all border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500">{c.pfnNo}</button>
            </div>
          </>
        )}
        {pfnStage === 'gate3' && (
          <>
            <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1 mb-3">
              {c.pfnGate3Items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.pfnGate3Q}</label>
            <div className="flex gap-2">
              <button onClick={() => goPfn('result-pfn')} className="flex-1 p-2.5 rounded-lg border text-sm transition-all border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500">{c.pfnYes}</button>
              <button onClick={() => goPfn('result-notpfn')} className="flex-1 p-2.5 rounded-lg border text-sm transition-all border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500">{c.pfnNo}</button>
            </div>
          </>
        )}
        {pfnStage === 'result-pfn' && (
          <div className="text-center">
            <span className="text-lg font-black text-emerald-500 block">{c.pfnResultTitle}</span>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{c.pfnResultDesc}</p>
            <CopyButton onClick={handleCopyPfn}>{t.common.copyReport}</CopyButton>
            <button onClick={() => goPfn('skipped')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-3">{c.pfnContinueAnyway}</button>
          </div>
        )}
        {(pfnStage === 'result-notpfn' || pfnStage === 'skipped') && (
          <div>
            {pfnStage === 'result-notpfn' && (
              <div className="text-center mb-3">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 block">{c.pfnNotResultTitle}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.pfnNotResultDesc}</p>
              </div>
            )}
            <button onClick={pfnReset} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{c.pfnRestart}</button>
          </div>
        )}
      </Card>
      {showFleischnerForm && (
        <>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.frameworkLabel}</label>
            <div className="flex gap-2">
              <button onClick={() => setFramework('fleischner')} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${framework === 'fleischner' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.frameworkFleischner}</button>
              <button onClick={() => setFramework('nccn')} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${framework === 'nccn' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.frameworkNccn}</button>
            </div>
          </Card>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.typeLabel}</label>
            <div className="space-y-2">
              {[['solid', c.typeSolid], ['partSolid', c.typePartSolid], ['ggn', c.typeGgn]].map(([key, label]) => (
                <button key={key} onClick={() => setType(key)} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${type === key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{label}</button>
              ))}
            </div>
          </Card>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.countLabel}</label>
            <div className="flex gap-2">
              <button onClick={() => setCount('single')} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${count === 'single' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.countSingle}</button>
              <button onClick={() => setCount('multiple')} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${count === 'multiple' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.countMultiple}</button>
            </div>
          </Card>
          {type === 'solid' && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.riskLabel}</label>
              <div className="flex gap-2">
                <button onClick={() => setRisk('low')} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${risk === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.riskLow}</button>
                <button onClick={() => setRisk('high')} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${risk === 'high' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.riskHigh}</button>
              </div>
            </Card>
          )}
          <Card>
            <NumberField label={c.sizeLabel} placeholder={c.sizePh} value={size} onChange={setSize} />
          </Card>
          {rec && (
            <Card className="text-center">
              <span className="text-xs text-slate-500 block mb-1">{resultLabel}</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">{rec}</p>
            </Card>
          )}
          <Accordion icon={<IconInfo size={16} />} title={c.nccnTable}>
            <div className="space-y-2">
              {c.nccnRows.map((row, i) => (
                <div key={i} className="pb-2 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">{row[0]} — {row[1]}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{row[2]}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 leading-snug">{c.nccnCaveat}</p>
          </Accordion>
        </>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.lungNodule} />
      <ReportBugLink calcTitle={c.title} />
      {rec && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block leading-tight">{rec}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 block mt-1">{resultLabel}</span>
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

import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function UterineFibroids() {
  const { t } = useLang();
  const c = t.calc.leiomyoma;

  /* ---------- Sección 1: Clasificación FIGO ---------- */
  const [figoQ1, setFigoQ1] = useState(null); // null | 'type0' | 'type1' | 'type2' | 'noCavity'
  const [figoQ2, setFigoQ2] = useState(null); // null | 'type3'..'type8'
  const [figoHybrid, setFigoHybrid] = useState(false);
  const [figoHybridPick, setFigoHybridPick] = useState(null); // '1'|'2'|'5'|'6'
  const [figoMargin, setFigoMargin] = useState('');

  const resetFigo = () => { setFigoQ1(null); setFigoQ2(null); setFigoHybrid(false); setFigoHybridPick(null); setFigoMargin(''); };
  const handleFigoQ1 = (key) => { setFigoQ1(key); setFigoQ2(null); setFigoHybrid(false); setFigoHybridPick(null); setFigoMargin(''); };
  const handleFigoQ2 = (key) => { setFigoQ2(key); setFigoHybrid(false); setFigoHybridPick(null); setFigoMargin(''); };
  const handleFigoBack = () => {
    if (figoHybrid) { setFigoHybrid(false); setFigoHybridPick(null); return; }
    if (figoQ2 !== null) { setFigoQ2(null); return; }
    if (figoQ1 !== null) { setFigoQ1(null); return; }
  };

  const figoPrimaryKey = figoQ1 && figoQ1 !== 'noCavity' ? figoQ1 : figoQ2;
  const figoTypeObj = figoPrimaryKey ? c.figoTypes[figoPrimaryKey] : null;
  const canHybridSubmucosal = ['type1', 'type2', 'type3'].includes(figoPrimaryKey);
  const canHybridSubserosal = ['type5', 'type6'].includes(figoPrimaryKey);
  const showMarginField = ['type2', 'type3', 'type4'].includes(figoPrimaryKey);
  const hybridCode = (figoHybrid && figoHybridPick && figoTypeObj)
    ? (canHybridSubmucosal ? `${figoTypeObj.code}-${figoHybridPick}` : `${figoHybridPick}-${figoTypeObj.code}`)
    : null;
  const figoReportStr = figoTypeObj ? c.figoReportText(figoTypeObj.label, hybridCode, figoMargin) : null;

  /* ---------- Sección 2: Riesgo de leiomiosarcoma ---------- */
  const [step1, setStep1] = useState(null);
  const [t2, setT2] = useState(null);
  const [dw, setDw] = useState(null);
  const [adc, setAdc] = useState('');
  const [margins, setMargins] = useState(null);
  const [menop, setMenop] = useState(null);

  const handleStep1 = (v) => { setStep1(v); setT2(null); setDw(null); setAdc(''); setMargins(null); setMenop(null); };
  const handleT2 = (v) => { setT2(v); setDw(null); setAdc(''); setMargins(null); setMenop(null); };
  const handleDw = (v) => { setDw(v); setAdc(''); setMargins(null); setMenop(null); };
  const handleMargins = (v) => { setMargins(v); setMenop(null); };
  const resetRisk = () => { setStep1(null); setT2(null); setDw(null); setAdc(''); setMargins(null); setMenop(null); };
  const handleRiskBack = () => {
    if (menop !== null) { setMenop(null); return; }
    if (margins !== null) { setMargins(null); return; }
    if (adc !== '') { setAdc(''); return; }
    if (dw !== null) { setDw(null); return; }
    if (t2 !== null) { setT2(null); return; }
    if (step1 !== null) { setStep1(null); return; }
  };

  const adcNum = adc === '' ? null : parseFloat(adc);
  const adcValid = adcNum !== null && !isNaN(adcNum);

  let resultKey = null;
  if (step1 === 'no') resultKey = 'score1';
  else if (step1 === 'yes') {
    if (t2 === 'low') resultKey = 'score2';
    else if (t2 === 'highInt') {
      if (dw === 'low') resultKey = 'score2';
      else if (dw === 'high') {
        if (adcValid) {
          if (adcNum > 1.23) resultKey = 'score2';
          else if (margins === 'smooth') resultKey = 'score3';
          else if (margins === 'irregular') {
            if (menop === 'pre') resultKey = 'score4';
            else if (menop === 'post') resultKey = 'score5';
          }
        }
      }
    }
  }
  const resultObj = resultKey ? c[resultKey] : null;
  const scoreColor = !resultKey ? '' : (resultKey === 'score1' ? 'text-slate-500' : resultKey === 'score2' ? 'text-emerald-500' : resultKey === 'score3' ? 'text-amber-500' : 'text-red-500');

  const showMarginsQ = step1 === 'yes' && t2 === 'highInt' && dw === 'high' && adcValid && adcNum <= 1.23;
  const showMenopQ = showMarginsQ && margins === 'irregular';

  const riskReportStr = (() => {
    if (!resultObj) return null;
    const parts = [];
    if (step1) parts.push(step1 === 'yes' ? c.step1Yes : c.step1No);
    if (t2) parts.push(t2 === 'low' ? c.step2Low : c.step2HighInt);
    if (dw) parts.push(dw === 'low' ? c.step3Low : c.step3High);
    if (dw === 'high' && adcValid) parts.push(`ADC ${adc} × 10⁻³ mm²/s`);
    if (margins) parts.push(margins === 'smooth' ? c.step5Smooth : c.step5Irregular);
    if (menop) parts.push(menop === 'pre' ? c.step6Pre : c.step6Post);
    const path = parts.join('; ');
    return c.reportText(path, resultObj.label, resultObj.ppv, resultObj.mgmt);
  })();

  /* ---------- Combinado: reset total, copia total, sticky bar ---------- */
  const resetAll = () => { resetFigo(); resetRisk(); };
  const hasAnyResult = !!(figoTypeObj || resultObj);
  const handleCopyAll = () => {
    const parts = [figoReportStr, riskReportStr].filter(Boolean);
    if (parts.length === 0) return;
    copyToClipboard(parts.join('\n\n'), t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyResult ? 'pb-56' : ''}`}>
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">{c.figoSectionTitle}</h3>
      <InfoBox tone="amber">{c.figoIntro}</InfoBox>

      {figoQ1 !== null && (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span className="font-semibold uppercase">{c.figoResultLabel}</span>
          <div className="flex items-center gap-3">
            <button onClick={handleFigoBack} className="text-blue-500 font-medium">{c.stepBack}</button>
            <button onClick={resetFigo} className="text-slate-500 dark:text-slate-400 font-medium">{t.common.reset}</button>
          </div>
        </div>
      )}

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.figoQ1}</label>
        <div className="space-y-2">
          {c.figoQ1Options.map(opt => (
            <button key={opt.key} onClick={() => handleFigoQ1(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${figoQ1 === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
          ))}
        </div>
      </Card>

      {figoQ1 === 'noCavity' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.figoQ2}</label>
          <div className="space-y-2">
            {c.figoQ2Options.map(opt => (
              <button key={opt.key} onClick={() => handleFigoQ2(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${figoQ2 === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
            ))}
          </div>
        </Card>
      )}

      {(canHybridSubmucosal || canHybridSubserosal) && (
        <Card>
          <button onClick={() => { setFigoHybrid(v => !v); setFigoHybridPick(null); }} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-1.5 ${figoHybrid ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
            {figoHybrid ? <IconCheckCircle size={14} /> : <span className="w-3.5 shrink-0" />}
            <span>{canHybridSubmucosal ? c.figoHybridQSubmucosal : c.figoHybridQSubserosal}</span>
          </button>
          {figoHybrid && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{canHybridSubmucosal ? c.figoHybridPickSerosal : c.figoHybridPickSubmucosal}</p>
              <div className="flex gap-2">
                {(canHybridSubmucosal ? c.figoHybridOptions5 : c.figoHybridOptions2).map(opt => (
                  <button key={opt.key} onClick={() => setFigoHybridPick(opt.key)} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${figoHybridPick === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {showMarginField && (
        <Card>
          <NumberField label={c.figoMarginQ} value={figoMargin} onChange={setFigoMargin} placeholder={c.figoMarginPh} />
        </Card>
      )}

      {figoTypeObj && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.figoResultLabel}</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{figoTypeObj.code}{hybridCode ? ` (${hybridCode})` : ''}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{figoTypeObj.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{figoTypeObj.desc}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{figoTypeObj.mgmt}</p>
        </Card>
      )}

      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide mt-4">{c.riskSectionTitle}</h3>
      </div>

      {step1 !== null && (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span className="font-semibold uppercase">{c.resultLabel}</span>
          <div className="flex items-center gap-3">
            <button onClick={handleRiskBack} className="text-blue-500 font-medium">{c.stepBack}</button>
            <button onClick={resetRisk} className="text-slate-500 dark:text-slate-400 font-medium">{t.common.reset}</button>
          </div>
        </div>
      )}
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step1Q}</label>
        <div className="space-y-2">
          <button onClick={() => handleStep1('yes')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${step1 === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step1Yes}</button>
          <button onClick={() => handleStep1('no')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${step1 === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step1No}</button>
        </div>
      </Card>

      {step1 === 'yes' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step2Q}</label>
          <div className="space-y-2">
            <button onClick={() => handleT2('low')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${t2 === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step2Low}</button>
            <button onClick={() => handleT2('highInt')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${t2 === 'highInt' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step2HighInt}</button>
          </div>
        </Card>
      )}

      {step1 === 'yes' && t2 === 'highInt' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step3Q}</label>
          <div className="space-y-2">
            <button onClick={() => handleDw('low')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${dw === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step3Low}</button>
            <button onClick={() => handleDw('high')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${dw === 'high' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step3High}</button>
          </div>
        </Card>
      )}

      {step1 === 'yes' && t2 === 'highInt' && dw === 'high' && (
        <Card>
          <NumberField label={c.step4Q} value={adc} onChange={setAdc} placeholder={c.step4Ph} />
        </Card>
      )}

      {showMarginsQ && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step5Q}</label>
          <div className="space-y-2">
            <button onClick={() => handleMargins('smooth')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${margins === 'smooth' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step5Smooth}</button>
            <button onClick={() => handleMargins('irregular')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${margins === 'irregular' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step5Irregular}</button>
          </div>
        </Card>
      )}

      {showMenopQ && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step6Q}</label>
          <div className="flex gap-2">
            <button onClick={() => setMenop('pre')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${menop === 'pre' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step6Pre}</button>
            <button onClick={() => setMenop('post')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${menop === 'post' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step6Post}</button>
          </div>
        </Card>
      )}

      {resultObj && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <span className={`text-2xl font-black ${scoreColor}`}>{resultObj.label}</span>
          {resultObj.ppv && <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">{resultObj.ppv}</p>}
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{resultObj.mgmt}</p>
        </Card>
      )}

      <UsageNotes paragraphs={[...c.figoUsage, ...c.usage]} />
      <References items={REFERENCES.leiomyoma} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {hasAnyResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block leading-tight">
              {figoTypeObj && resultObj ? `FIGO ${figoTypeObj.code}${hybridCode ? ` (${hybridCode})` : ''} · ${resultObj.label}` : figoTypeObj ? `FIGO ${figoTypeObj.code}${hybridCode ? ` (${hybridCode})` : ''}` : resultObj.label}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 block mt-1">
              {figoTypeObj && resultObj ? `${c.figoResultLabel} · ${c.resultLabel}` : figoTypeObj ? c.figoResultLabel : c.resultLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
            <CopyIconButton onClick={handleCopyAll} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
    </div>
  );
}

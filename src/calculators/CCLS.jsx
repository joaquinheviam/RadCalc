import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, Accordion, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function cclsCompute(t2, cmp, ans) {
  const { fat, sei, ader, dwi, homog } = ans;
  if (t2 === 'hyper' || t2 === 'iso') {
    if (cmp === 'intense') {
      if (fat === 'y') return { score: 5, diff: null };
      if (fat === 'n') {
        if (sei === 'n') return { score: 4, diff: null };
        if (sei === 'y') return { score: 3, diff: t2 === 'hyper' ? 'diffOncocytoma' : 'diffChrrccOncocytoma' };
      }
      return null;
    }
    if (cmp === 'moderate') {
      if (fat === 'y') return { score: 3, diff: null };
      if (fat === 'n') {
        if (sei === 'n') return { score: 3, diff: 'diffChrrccOncocytoma' };
        if (sei === 'y') return { score: 2, diff: 'diffOncocytoma' };
      }
      return null;
    }
    if (cmp === 'mild') {
      if (t2 === 'hyper') return { score: 3, diff: null };
      if (fat === 'y') return { score: 2, diff: null };
      if (fat === 'n') {
        if (dwi === 'n') return { score: 3, diff: null };
        if (dwi === 'y') return { score: 1, diff: 'diffPrccFpaml' };
      }
      return null;
    }
  }
  if (t2 === 'hypo') {
    if (cmp === 'mild') {
      if (fat === 'y') return { score: 3, diff: null };
      if (fat === 'n') return { score: 1, diff: 'diffPrccFpaml' };
      return null;
    }
    if (cmp === 'intense' || cmp === 'moderate') {
      if (ader === 'y') return { score: 2, diff: 'diffFpaml' };
      if (ader === 'n') {
        if (dwi === 'y') return { score: 2, diff: 'diffFpaml' };
        if (dwi === 'n') {
          if (homog === 'y') return { score: 3, diff: 'diffFpaml' };
          if (homog === 'n') return { score: 4, diff: 'diffFpaml' };
        }
      }
      return null;
    }
  }
  return null;
}

export default function CCLS() {
  const { t } = useLang();
  const c = t.calc.ccls;
  const [gate, setGate] = useState(null);
  const [t2, setT2] = useState(null);
  const [cmp, setCmp] = useState(null);
  const [fat, setFat] = useState(null);
  const [sei, setSei] = useState(null);
  const [ader, setAder] = useState(null);
  const [dwi, setDwi] = useState(null);
  const [homog, setHomog] = useState(null);

  // Campos del cálculo "if uncertain" para el realce en CMP (Paso 3) y para
  // ADER — opcionales, complementan (no reemplazan) la evaluación visual,
  // que sigue siendo la opción por defecto y recomendada. Fórmulas según
  // Shetty et al., RadioGraphics 2023;43(7):e220209 (única referencia citada
  // en esta calculadora): realce% = (SI-CMP − SI-pre) / SI-pre × 100, y
  // ADER = (SI-CMP − SI-pre) / (SI-tardía − SI-pre), umbral ≥ 1.5.
  const [cmpTumorPre, setCmpTumorPre] = useState('');
  const [cmpTumorCmp, setCmpTumorCmp] = useState('');
  const [cmpCortexPre, setCmpCortexPre] = useState('');
  const [cmpCortexCmp, setCmpCortexCmp] = useState('');
  const [aderTumorPre, setAderTumorPre] = useState('');
  const [aderTumorCmp, setAderTumorCmp] = useState('');
  const [aderTumorDelayed, setAderTumorDelayed] = useState('');

  const resetCmpCalc = () => { setCmpTumorPre(''); setCmpTumorCmp(''); setCmpCortexPre(''); setCmpCortexCmp(''); };
  const resetAderCalc = () => { setAderTumorPre(''); setAderTumorCmp(''); setAderTumorDelayed(''); };
  const resetAncillary = () => { setFat(null); setSei(null); setAder(null); setDwi(null); setHomog(null); resetAderCalc(); };
  const handleGate = (key) => { setGate(key); setT2(null); setCmp(null); resetAncillary(); resetCmpCalc(); };
  const handleT2 = (key) => { setT2(key); setCmp(null); resetAncillary(); resetCmpCalc(); };
  const handleCmp = (key) => { setCmp(key); resetAncillary(); };
  const handleFat = (v) => { setFat(v); setSei(null); setDwi(null); };
  const handleAder = (v) => { setAder(v); setDwi(null); setHomog(null); };
  const handleDwi = (v) => { setDwi(v); setHomog(null); };

  const cmpPreT = parseFloat(cmpTumorPre);
  const cmpCmpT = parseFloat(cmpTumorCmp);
  const cmpPreC = parseFloat(cmpCortexPre);
  const cmpCmpC = parseFloat(cmpCortexCmp);
  const cmpCalcReady = [cmpPreT, cmpCmpT, cmpPreC, cmpCmpC].every(v => !isNaN(v)) && cmpPreT !== 0 && cmpPreC !== 0;
  const tumorEnhPct = cmpCalcReady ? ((cmpCmpT - cmpPreT) / cmpPreT) * 100 : null;
  const cortexEnhPct = cmpCalcReady ? ((cmpCmpC - cmpPreC) / cmpPreC) * 100 : null;
  const cmpRelPct = (cmpCalcReady && cortexEnhPct !== 0) ? (tumorEnhPct / cortexEnhPct) * 100 : null;
  const cmpCalcBucket = cmpRelPct === null ? null : (cmpRelPct > 75 ? 'intense' : cmpRelPct >= 40 ? 'moderate' : 'mild');
  const applyCmpCalc = () => { if (cmpCalcBucket) handleCmp(cmpCalcBucket); };

  const aderPre = parseFloat(aderTumorPre);
  const aderCmpV = parseFloat(aderTumorCmp);
  const aderDel = parseFloat(aderTumorDelayed);
  const aderCalcReady = [aderPre, aderCmpV, aderDel].every(v => !isNaN(v)) && (aderDel - aderPre) !== 0;
  const aderValue = aderCalcReady ? (aderCmpV - aderPre) / (aderDel - aderPre) : null;
  const aderCalcAnswer = aderValue === null ? null : (aderValue >= 1.5 ? 'y' : 'n');
  const applyAderCalc = () => { if (aderCalcAnswer) handleAder(aderCalcAnswer); };

  const showFatQ = gate === 'proceed' && t2 && cmp && !(t2 === 'hyper' && cmp === 'mild') && !(t2 === 'hypo' && cmp !== 'mild');
  const showSeiQ = showFatQ && fat === 'n' && (t2 === 'hyper' || t2 === 'iso') && (cmp === 'intense' || cmp === 'moderate');
  const showDwiMildIsoQ = showFatQ && fat === 'n' && t2 === 'iso' && cmp === 'mild';
  const showAderQ = gate === 'proceed' && t2 === 'hypo' && (cmp === 'intense' || cmp === 'moderate');
  const showDwiHypoQ = showAderQ && ader === 'n';
  const showHomogQ = showDwiHypoQ && dwi === 'n';

  const result = (t2 && cmp) ? cclsCompute(t2, cmp, { fat, sei, ader, dwi, homog }) : null;
  const likertLabel = result ? c.likert[result.score] : null;
  const diffText = result && result.diff ? c[result.diff] : null;
  const mgmtText = result ? (result.score <= 2 ? c.mgmtLow : result.score === 3 ? c.mgmtMid : c.mgmtHigh) : null;
  const scoreColor = !result ? '' : (result.score <= 2 ? 'text-emerald-500' : result.score === 3 ? 'text-amber-500' : 'text-red-500');

  const t2Label = t2 ? c.t2Options.find(o => o.key === t2).label : null;
  const cmpLabel = cmp ? c.cmpOptions.find(o => o.key === cmp).label : null;

  const handleCopy = () => {
    if (!result) return;
    const parts = [t2Label, cmpLabel];
    if (fat !== null) parts.push(`${c.fatQ.split('?')[0]}? ${fat === 'y' ? t.common.yes : t.common.no}`);
    if (sei !== null) parts.push(`${c.seiQ.split('?')[0]}? ${sei === 'y' ? t.common.yes : t.common.no}`);
    if (ader !== null) parts.push(`${c.aderQ.split('?')[0]}? ${ader === 'y' ? t.common.yes : t.common.no}`);
    if (dwi !== null) parts.push(`${c.dwiQ.split('?')[0]}? ${dwi === 'y' ? t.common.yes : t.common.no}`);
    if (homog !== null) parts.push(`${c.homogQ.split('?')[0]}? ${homog === 'y' ? t.common.yes : t.common.no}`);
    const path = parts.filter(Boolean).join('; ');
    const text = c.reportText(path, result.score, likertLabel, diffText, mgmtText);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const handleReset = () => { setGate(null); setT2(null); setCmp(null); resetAncillary(); resetCmpCalc(); };

  const YesNo = ({ value, onChange }) => (
    <div className="flex gap-2">
      <button onClick={() => onChange('y')} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${value === 'y' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
      <button onClick={() => onChange('n')} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${value === 'n' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
    </div>
  );

  return (
    <div className={`space-y-4 animate-in fade-in ${result ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.gateQ}</label>
        <div className="space-y-2">
          <button onClick={() => handleGate('fat')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${gate === 'fat' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.gateFat}</button>
          <button onClick={() => handleGate('cystic')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${gate === 'cystic' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.gateCystic}</button>
          <button onClick={() => handleGate('proceed')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${gate === 'proceed' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.gateProceed}</button>
        </div>
      </Card>

      {gate === 'fat' && (
        <Card className="text-center border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">{c.resultAmlTitle}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{c.resultAmlDesc}</p>
        </Card>
      )}
      {gate === 'cystic' && (
        <Card className="text-center border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">{c.resultBosniakTitle}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{c.resultBosniakDesc}</p>
        </Card>
      )}

      {gate === 'proceed' && (
        <>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.t2Label}</label>
            <div className="flex gap-2">
              {c.t2Options.map(opt => (
                <button key={opt.key} onClick={() => handleT2(opt.key)} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${t2 === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
              ))}
            </div>
          </Card>

          {t2 && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.cmpLabel}</label>
              <div className="flex gap-2">
                {c.cmpOptions.map(opt => (
                  <button key={opt.key} onClick={() => handleCmp(opt.key)} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${cmp === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug mt-2">{c.cmpVisualNote}</p>
              <div className="mt-3">
                <Accordion title={c.cmpCalcTitle}>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug mb-3">{c.cmpCalcIntro}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField label={c.cmpCalcTumorPre} value={cmpTumorPre} onChange={setCmpTumorPre} small />
                    <NumberField label={c.cmpCalcTumorCmp} value={cmpTumorCmp} onChange={setCmpTumorCmp} small />
                    <NumberField label={c.cmpCalcCortexPre} value={cmpCortexPre} onChange={setCmpCortexPre} small />
                    <NumberField label={c.cmpCalcCortexCmp} value={cmpCortexCmp} onChange={setCmpCortexCmp} small />
                  </div>
                  {cmpRelPct !== null && (
                    <div className="mt-3 text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.cmpCalcResultLabel}</span>
                      <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{cmpRelPct.toFixed(0)}%</span>
                      <span className="block text-[11px] text-slate-400 mt-1">&rarr; {c.cmpCalcBucketLabels[cmpCalcBucket]}</span>
                      <button onClick={applyCmpCalc} className="mt-2 w-full py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                        {c.cmpCalcApply}
                      </button>
                    </div>
                  )}
                </Accordion>
              </div>
            </Card>
          )}

          {showFatQ && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.fatQ}</label>
              <YesNo value={fat} onChange={handleFat} />
            </Card>
          )}
          {showSeiQ && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.seiQ}</label>
              <YesNo value={sei} onChange={setSei} />
            </Card>
          )}
          {showDwiMildIsoQ && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.dwiQ}</label>
              <YesNo value={dwi} onChange={setDwi} />
            </Card>
          )}
          {showAderQ && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.aderQ}</label>
              <YesNo value={ader} onChange={handleAder} />
              <div className="mt-3">
                <Accordion title={c.aderCalcTitle}>
                  <div className="space-y-2">
                    <NumberField label={c.aderCalcTumorPre} value={aderTumorPre} onChange={setAderTumorPre} small />
                    <NumberField label={c.aderCalcTumorCmp} value={aderTumorCmp} onChange={setAderTumorCmp} small />
                    <NumberField label={c.aderCalcTumorDelayed} value={aderTumorDelayed} onChange={setAderTumorDelayed} small />
                  </div>
                  {aderValue !== null && (
                    <div className="mt-3 text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.aderCalcResultLabel}</span>
                      <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{aderValue.toFixed(2)}</span>
                      <span className="block text-[10px] text-slate-400 mt-1">{t.common.cutoff} &ge; 1.5</span>
                      <button onClick={applyAderCalc} className="mt-2 w-full py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                        {c.aderCalcApply} ({aderCalcAnswer === 'y' ? t.common.yes : t.common.no})
                      </button>
                    </div>
                  )}
                </Accordion>
              </div>
            </Card>
          )}
          {showDwiHypoQ && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.dwiQ}</label>
              <YesNo value={dwi} onChange={handleDwi} />
            </Card>
          )}
          {showHomogQ && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.homogQ}</label>
              <YesNo value={homog} onChange={setHomog} />
            </Card>
          )}

          {result && (
            <Card className="text-center">
              <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
              <span className={`text-3xl font-black ${scoreColor}`}>{result.score}/5</span>
              <p className={`text-sm font-semibold mt-1 ${scoreColor}`}>{likertLabel}</p>
              {diffText && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{diffText}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{mgmtText}</p>
            </Card>
          )}
          {!result && (
            <button onClick={handleReset} className="w-full py-2.5 rounded-xl font-medium text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
              {t.common.reset}
            </button>
          )}
        </>
      )}
      {(gate === 'fat' || gate === 'cystic') && (
        <button onClick={handleReset} className="w-full py-2.5 rounded-xl font-medium text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
          {t.common.reset}
        </button>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.ccls} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {result && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className={`text-4xl font-black block ${scoreColor}`}>ccLS {result.score}/5</span>
            <span className={`text-sm font-semibold block mt-1 ${scoreColor}`}>{likertLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={handleReset} label={t.common.reset} />
            <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
    </div>
  );
}

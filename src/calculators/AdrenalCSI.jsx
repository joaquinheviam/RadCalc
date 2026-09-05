import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function AdrenalCSI() {
  const { t, lang } = useLang();
  const c = t.calc.adrenalMri;
  const [method, setMethod] = useState('asr'); // 'asr' = señal corregida con órgano de referencia; 'sii' = solo señal adrenal
  const [refOrgan, setRefOrgan] = useState('spleen'); // 'spleen' (preferido) | 'muscle'
  const [lesionIn, setLesionIn] = useState('');
  const [lesionOut, setLesionOut] = useState('');
  const [refIn, setRefIn] = useState('');
  const [refOut, setRefOut] = useState('');

  const lIn = parseFloat(lesionIn);
  const lOut = parseFloat(lesionOut);
  const rIn = parseFloat(refIn);
  const rOut = parseFloat(refOut);

  const hasAnyInput = lesionIn !== '' || lesionOut !== '' || (method === 'asr' && (refIn !== '' || refOut !== ''));

  // SII: solo la lesión, sin órgano de referencia.
  const isValidSii = !isNaN(lIn) && !isNaN(lOut) && lIn !== 0;
  const sii = isValidSii ? ((lIn - lOut) / lIn) * 100 : 0;
  const isAdenomaSii = isValidSii && sii > 16.5;

  // ASR: señal de la lesión normalizada por el órgano de referencia (bazo o músculo).
  const isValidAsr = !isNaN(lIn) && !isNaN(lOut) && !isNaN(rIn) && !isNaN(rOut) && lIn !== 0 && rOut !== 0 && rIn !== 0;
  const ratioIn = isValidAsr ? (lIn / rIn) : 0;
  const ratioOut = isValidAsr ? (lOut / rOut) : 0;
  const asr = isValidAsr ? (ratioOut / ratioIn) * 100 : 0;
  const isAdenomaAsr = isValidAsr && asr < 71;

  const isValid = method === 'sii' ? isValidSii : isValidAsr;
  const isAdenoma = method === 'sii' ? isAdenomaSii : isAdenomaAsr;
  const refLabel = refOrgan === 'spleen' ? c.referenceSpleen : c.referenceMuscle;

  const handleCopy = () => {
    const text = method === 'sii'
      ? c.reportTextSii(lesionIn, lesionOut, sii.toFixed(1), isAdenomaSii ? c.conclSiiAdenoma : c.conclSiiNot)
      : c.reportText(lesionIn, lesionOut, refIn, refOut, refLabel, asr.toFixed(1), isAdenomaAsr ? c.conclAdenoma : c.conclNot);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setLesionIn(''); setLesionOut(''); setRefIn(''); setRefOut(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyInput ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">{c.method}</label>
        <div className="space-y-2">
          <button
            onClick={() => setMethod('asr')}
            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${method === 'asr' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            {c.methodAsr}
          </button>
          <button
            onClick={() => setMethod('sii')}
            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${method === 'sii' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            {c.methodSii}
          </button>
        </div>
      </Card>
      <Card className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{c.lesion}</h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberField small label={c.inPhase} value={lesionIn} onChange={setLesionIn} />
            <NumberField small label={c.outPhase} value={lesionOut} onChange={setLesionOut} />
          </div>
        </div>
        {method === 'asr' && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{c.reference}</h3>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-3">
              <button onClick={() => setRefOrgan('spleen')} className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${refOrgan === 'spleen' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {c.referenceSpleen}
              </button>
              <button onClick={() => setRefOrgan('muscle')} className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${refOrgan === 'muscle' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {c.referenceMuscle}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug mb-3">{c.referenceMuscleNote}</p>
            <div className="grid grid-cols-2 gap-3">
              <NumberField small label={c.inPhase} value={refIn} onChange={setRefIn} />
              <NumberField small label={c.outPhase} value={refOut} onChange={setRefOut} />
            </div>
          </div>
        )}
      </Card>
      {hasAnyInput && isValid && (
        <InfoBox tone={isAdenoma ? 'emerald' : 'amber'}>
          {method === 'sii' ? (isAdenomaSii ? c.siiAdenoma : c.siiNot) : (isAdenomaAsr ? c.csiAdenoma : c.csiNot)}
        </InfoBox>
      )}
      <InfoBox tone="amber">{c.mriLimitNote}</InfoBox>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.adrenalMri} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {hasAnyInput && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{method === 'sii' ? c.siiIndex : c.csiIndex}</span>
            <span className={`text-4xl font-black block mt-1 ${isValid ? (isAdenoma ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-400'}`}>{isValid ? (method === 'sii' ? sii : asr).toFixed(1) + '%' : '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
            <CopyIconButton onClick={handleCopy} disabled={!isValid} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
    </div>
  );
}

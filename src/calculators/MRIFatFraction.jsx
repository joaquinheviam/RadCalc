import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

export default function MRIFatFraction() {
  const { t, lang } = useLang();
  const c = t.calc.mriFf;
  const [method, setMethod] = useState('ff'); // 'ff' = single dual-echo; 'pct' = spleen-normalized
  const [inPhase, setInPhase] = useState('');
  const [outPhase, setOutPhase] = useState('');
  const [spleenIn, setSpleenIn] = useState('');
  const [spleenOut, setSpleenOut] = useState('');
  const sIn = parseFloat(inPhase);
  const sOut = parseFloat(outPhase);
  const spIn = parseFloat(spleenIn);
  const spOut = parseFloat(spleenOut);

  const isValidFf = !isNaN(sIn) && !isNaN(sOut) && sIn !== 0;
  const ff = isValidFf ? ((sIn - sOut) / (2 * sIn)) * 100 : 0;

  const ratioIn = sIn / spIn;
  const ratioOut = sOut / spOut;
  const isValidPct = !isNaN(sIn) && !isNaN(sOut) && !isNaN(spIn) && !isNaN(spOut) && spIn !== 0 && spOut !== 0 && ratioIn !== 0;
  const fp = isValidPct ? ((ratioIn - ratioOut) / (2 * ratioIn)) * 100 : 0;

  const isValid = method === 'ff' ? isValidFf : isValidPct;
  const value = method === 'ff' ? ff : fp;
  const hasAnyInput = method === 'ff'
    ? (inPhase !== '' || outPhase !== '')
    : (inPhase !== '' || outPhase !== '' || spleenIn !== '' || spleenOut !== '');

  const handleCopy = () => {
    const text = method === 'ff'
      ? c.reportText(ff.toFixed(1), inPhase, outPhase)
      : c.reportTextPct(fp.toFixed(1), inPhase, outPhase, spleenIn, spleenOut);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setMethod('ff'); setInPhase(''); setOutPhase(''); setSpleenIn(''); setSpleenOut(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyInput ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">{c.methodLabel}</label>
        <div className="space-y-2">
          <button
            onClick={() => setMethod('ff')}
            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${method === 'ff' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            {c.methodFf}
          </button>
          <button
            onClick={() => setMethod('pct')}
            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${method === 'pct' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            {c.methodPct}
          </button>
        </div>
      </Card>
      <Card>
        <NumberField label={c.inPhase} placeholder={c.inPh} value={inPhase} onChange={setInPhase} />
        <div className="mt-3">
          <NumberField label={c.outPhase} placeholder={c.outPh} value={outPhase} onChange={setOutPhase} />
        </div>
        {method === 'pct' && (
          <>
            <div className="mt-3">
              <NumberField label={c.spleenInPhase} placeholder={c.spleenInPh} value={spleenIn} onChange={setSpleenIn} />
            </div>
            <div className="mt-3">
              <NumberField label={c.spleenOutPhase} placeholder={c.spleenOutPh} value={spleenOut} onChange={setSpleenOut} />
            </div>
          </>
        )}
      </Card>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.mriFf} />
      <ReportBugLink calcTitle={c.title} />
      {hasAnyInput && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{method === 'ff' ? c.estimated : c.estimatedPct}</span>
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400 block mt-1">{isValid ? value.toFixed(1) + '%' : '—'}</span>
            {!isValid && <span className="text-sm text-slate-400 block mt-1">{t.common.notEvaluated}</span>}
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

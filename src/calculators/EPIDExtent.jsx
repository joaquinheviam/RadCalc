import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const N_SLICES = 10;
const emptyArr = () => Array(N_SLICES).fill('');

export default function EPIDExtent() {
  const { t, lang } = useLang();
  const c = t.calc.epidExtent;
  const [method, setMethod] = useState('goh'); // 'goh' | 'tschaler'

  // --- Goh ---
  const [gohExtent, setGohExtent] = useState(null); // 'limited' | 'extensive' | 'indeterminate'
  const [fvc, setFvc] = useState('');
  const fvcVal = parseFloat(fvc);
  const hasFvc = fvc !== '' && !isNaN(fvcVal);
  let gohCategory = null;
  if (gohExtent === 'limited') gohCategory = 'limited';
  else if (gohExtent === 'extensive') gohCategory = 'extensive';
  else if (gohExtent === 'indeterminate' && hasFvc) gohCategory = fvcVal < 70 ? 'extensive' : 'limited';
  const gohHasResult = gohCategory !== null;

  // --- Tschalèr ---
  const [fibAreas, setFibAreas] = useState(emptyArr());
  const [totalAreas, setTotalAreas] = useState(emptyArr());
  const setFibAt = (i, v) => setFibAreas(prev => prev.map((x, idx) => (idx === i ? v : x)));
  const setTotalAt = (i, v) => setTotalAreas(prev => prev.map((x, idx) => (idx === i ? v : x)));
  const sumFib = fibAreas.reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
  const sumTotal = totalAreas.reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
  const nSlicesFilled = totalAreas.filter(v => parseFloat(v) > 0).length;
  const tschalerValid = sumTotal > 0;
  const tschalerPct = tschalerValid ? (sumFib / sumTotal) * 100 : 0;

  const hasAnyInput = method === 'goh'
    ? (gohExtent !== null)
    : (fibAreas.some(v => v !== '') || totalAreas.some(v => v !== ''));
  const hasResult = method === 'goh' ? gohHasResult : tschalerValid;

  const handleCopy = () => {
    const text = method === 'goh'
      ? c.reportTextGoh(
          gohExtent === 'indeterminate' ? c.gohIndeterminateLabel : (gohExtent === 'limited' ? c.gohLimitedInput : c.gohExtensiveInput),
          gohExtent === 'indeterminate' ? fvc : null,
          c[gohCategory + 'Label']
        )
      : c.reportTextTschaler(tschalerPct.toFixed(1), nSlicesFilled, sumFib.toFixed(1), sumTotal.toFixed(1));
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => {
    setGohExtent(null); setFvc('');
    setFibAreas(emptyArr()); setTotalAreas(emptyArr());
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasResult ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">{c.methodLabel}</label>
        <div className="space-y-2">
          <button
            onClick={() => setMethod('goh')}
            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${method === 'goh' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            {c.methodGoh}
          </button>
          <button
            onClick={() => setMethod('tschaler')}
            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${method === 'tschaler' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            {c.methodTschaler}
          </button>
        </div>
      </Card>

      {method === 'goh' ? (
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">{c.gohInstructions}</p>
          <div className="space-y-2">
            {[
              { key: 'limited', label: c.gohLimitedInput },
              { key: 'indeterminate', label: c.gohIndeterminateLabel },
              { key: 'extensive', label: c.gohExtensiveInput },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setGohExtent(opt.key)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${gohExtent === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {gohExtent === 'indeterminate' && (
            <div className="mt-1">
              <NumberField label={c.fvcLabel} placeholder={c.fvcPh} value={fvc} onChange={setFvc} />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{c.fvcHint}</p>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">{c.tschalerInstructions}</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 px-1">
            <span className="w-16 shrink-0">{c.sliceCol}</span>
            <span className="flex-1 text-center">{c.fibrosisAreaShort}</span>
            <span className="flex-1 text-center">{c.totalAreaShort}</span>
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: N_SLICES }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 w-16 shrink-0">
                  {i === 0 ? c.sliceApex : i === N_SLICES - 1 ? c.sliceBase : `${i + 1}`}
                </span>
                <NumberField small placeholder="cm²" value={fibAreas[i]} onChange={(v) => setFibAt(i, v)} />
                <NumberField small placeholder="cm²" value={totalAreas[i]} onChange={(v) => setTotalAt(i, v)} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.epidExtent} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasResult && (
        <StickyBar>
          {method === 'goh' ? (
            <div className="min-w-0 text-center">
              <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.gohResultLabel}</span>
              <span className={`text-4xl font-black block mt-1 ${gohCategory === 'extensive' ? 'text-red-500' : 'text-emerald-500'}`}>
                {c[gohCategory + 'Label']}
              </span>
              {gohExtent === 'indeterminate' && (
                <span className="text-sm text-slate-500 dark:text-slate-400 block mt-1">{c.fvcLabel}: {fvc}%</span>
              )}
            </div>
          ) : (
            <div className="min-w-0 text-center">
              <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.tschalerResultLabel} ({nSlicesFilled}/{N_SLICES} {c.slicesWord})</span>
              <span className={`text-4xl font-black block mt-1 ${tschalerPct >= 20 ? 'text-red-500' : 'text-emerald-500'}`}>{tschalerPct.toFixed(1)}%</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">{c.tschalerGohRefNote}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
            <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
    </div>
  );
}

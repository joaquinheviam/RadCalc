import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const N_SLICES = 10;
const emptyArr = () => Array(N_SLICES).fill('');

const N_GOH_LEVELS = 5;
const emptyGohLevels = () => Array(N_GOH_LEVELS).fill('');

export default function EPIDExtent() {
  const { t, lang } = useLang();
  const c = t.calc.epidExtent;
  const [method, setMethod] = useState('goh'); // 'goh' | 'tschaler'

  // --- Goh: promedio de 5 niveles estándar (Goh et al. 2008), 0-100% en incrementos de 5% ---
  const [gohLevels, setGohLevels] = useState(emptyGohLevels());
  const setGohLevelAt = (i, v) => setGohLevels(prev => prev.map((x, idx) => (idx === i ? v : x)));
  const gohLevelLabels = [c.gohLevel1, c.gohLevel2, c.gohLevel3, c.gohLevel4, c.gohLevel5];
  const gohFilledLevels = gohLevels.filter(v => v !== '' && !isNaN(parseFloat(v)));
  const nGohFilled = gohFilledLevels.length;
  const gohAvg = nGohFilled > 0 ? gohFilledLevels.reduce((acc, v) => acc + parseFloat(v), 0) / nGohFilled : null;
  const gohIsIndeterminate = gohAvg !== null && gohAvg >= 10 && gohAvg <= 30;

  const [fvc, setFvc] = useState('');
  const fvcVal = parseFloat(fvc);
  const hasFvc = fvc !== '' && !isNaN(fvcVal);
  let gohCategory = null;
  if (gohAvg !== null) {
    if (gohAvg < 10) gohCategory = 'limited';
    else if (gohAvg > 30) gohCategory = 'extensive';
    else if (hasFvc) gohCategory = fvcVal < 70 ? 'extensive' : 'limited';
  }
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
    ? gohLevels.some(v => v !== '')
    : (fibAreas.some(v => v !== '') || totalAreas.some(v => v !== ''));
  const hasResult = method === 'goh' ? gohHasResult : tschalerValid;

  const handleCopy = () => {
    const text = method === 'goh'
      ? c.reportTextGoh(
          gohAvg.toFixed(1),
          nGohFilled,
          gohIsIndeterminate ? fvc : null,
          c[gohCategory + 'Label']
        )
      : c.reportTextTschaler(tschalerPct.toFixed(1), nSlicesFilled, sumFib.toFixed(1), sumTotal.toFixed(1));
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => {
    setGohLevels(emptyGohLevels()); setFvc('');
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
          <div className="space-y-3">
            {gohLevelLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-xs text-slate-600 dark:text-slate-300">{label}</span>
                <NumberField small placeholder={c.gohLevelPh} value={gohLevels[i]} onChange={(v) => setGohLevelAt(i, v)} />
              </div>
            ))}
          </div>
          {gohAvg !== null && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1 border-t border-slate-100 dark:border-slate-700">
              {c.gohAverageLabel}: <span className="font-semibold text-slate-700 dark:text-slate-200">{gohAvg.toFixed(1)}%</span> ({nGohFilled}/{N_GOH_LEVELS} {c.gohLevelsWord})
            </p>
          )}
          {gohIsIndeterminate && (
            <div className="mt-1">
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-1">{c.gohIndeterminateNote}</p>
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
              <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.gohResultLabel} ({c.gohAverageLabel}: {gohAvg.toFixed(1)}%)</span>
              <span className={`text-4xl font-black block mt-1 ${gohCategory === 'extensive' ? 'text-red-500' : 'text-emerald-500'}`}>
                {c[gohCategory + 'Label']}
              </span>
              {gohIsIndeterminate && (
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

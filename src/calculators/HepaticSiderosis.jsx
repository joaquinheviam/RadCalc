import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

export default function HepaticSiderosis() {
  const { t, lang } = useLang();
  const c = t.calc.siderosis;
  const [inputType, setInputType] = useState('t2star');
  const [val, setVal] = useState('');
  const numericVal = parseFloat(val);
  const isValid = !isNaN(numericVal) && numericVal > 0;
  let r2star = 0, t2star = 0;
  if (isValid) {
    if (inputType === 't2star') { t2star = numericVal; r2star = 1000 / t2star; }
    else { r2star = numericVal; t2star = 1000 / r2star; }
  }
  const lic = isValid ? (0.0254 * r2star) + 0.202 : 0;
  let category = '', color = '';
  if (isValid) {
    if (lic < 1.8) { category = c.catNormal; color = 'text-emerald-500'; }
    else if (lic <= 7.0) { category = c.catMild; color = 'text-amber-500'; }
    else if (lic <= 15.0) { category = c.catModerate; color = 'text-orange-500'; }
    else { category = c.catSevere; color = 'text-red-500'; }
  }

  const handleCopy = () => {
    const text = c.reportText(t2star.toFixed(2), r2star.toFixed(2), lic.toFixed(2), category);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setInputType('t2star'); setVal(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${isValid ? 'pb-24' : ''}`}>
      <InfoBox tone="amber">{c.fieldStrengthNote}</InfoBox>
      <Card>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-1">
          <button
            onClick={() => { setInputType('t2star'); setVal(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${inputType === 't2star' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {c.enterT2}
          </button>
          <button
            onClick={() => { setInputType('r2star'); setVal(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${inputType === 'r2star' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {c.enterR2}
          </button>
        </div>
        <NumberField
          label={`${c.valueOf} ${inputType === 't2star' ? 'T2*' : 'R2*'}`}
          placeholder={inputType === 't2star' ? 'Ej: 12.5' : 'Ej: 80'}
          value={val}
          onChange={setVal}
        />
      </Card>
      {isValid && (
        <Card>
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <span className="block text-xs text-slate-500">T2*</span>
              <span className="text-lg font-bold">{t2star.toFixed(2)} ms</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">R2*</span>
              <span className="text-lg font-bold">{r2star.toFixed(2)} Hz</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{c.licEstimated}</span>
            <span className={`text-4xl font-bold ${color}`}>{lic.toFixed(2)}</span>
            <span className={`mt-2 font-medium px-3 py-1 rounded-full text-sm ${color.replace('text', 'bg').replace('500', '50 dark:bg-opacity-20')} ${color}`}>
              {category}
            </span>
          </div>
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.siderosis} />
      <ReportBugLink calcTitle={c.title} />
      {isValid && (
        <StickyBar>
          <div className="min-w-0 text-left">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.licEstimated}: <span className={`font-black ${color}`}>{lic.toFixed(2)}</span></span>
            <span className={`text-sm font-semibold ${color}`}>{category}</span>
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

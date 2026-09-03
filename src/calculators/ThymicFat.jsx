import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

export default function ThymicFat() {
  const { t, lang } = useLang();
  const c = t.calc.thymic;
  const [thymusIn, setThymusIn] = useState('');
  const [thymusOut, setThymusOut] = useState('');
  const [muscleIn, setMuscleIn] = useState('');
  const [muscleOut, setMuscleOut] = useState('');
  const tIn = parseFloat(thymusIn);
  const tOut = parseFloat(thymusOut);
  const mIn = parseFloat(muscleIn);
  const mOut = parseFloat(muscleOut);
  const isValid = !isNaN(tIn) && !isNaN(tOut) && !isNaN(mIn) && !isNaN(mOut) && tIn !== 0 && mIn !== 0;
  const csr = isValid ? (tOut / tIn) / (mOut / mIn) : 0;
  const sii = isValid ? ((tIn - tOut) / tIn) * 100 : 0;
  const isFatty = csr < 0.9 || sii > 9;

  const handleCopy = () => {
    const text = c.reportText(thymusIn, thymusOut, muscleIn, muscleOut, csr.toFixed(2), sii.toFixed(1), isFatty ? c.conclFatty : c.conclNotFatty);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setThymusIn(''); setThymusOut(''); setMuscleIn(''); setMuscleOut(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${isValid ? 'pb-24' : ''}`}>
      <Card className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{c.roiThymus}</h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberField small label={c.inPhase} value={thymusIn} onChange={setThymusIn} />
            <NumberField small label={c.outPhase} value={thymusOut} onChange={setThymusOut} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{c.roiMuscle}</h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberField small label={c.inPhase} value={muscleIn} onChange={setMuscleIn} />
            <NumberField small label={c.outPhase} value={muscleOut} onChange={setMuscleOut} />
          </div>
        </div>
      </Card>
      {isValid && (
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <span className="block text-xs text-slate-500 mb-1">{c.ratioCsr}</span>
              <span className={`text-2xl font-bold ${isFatty ? 'text-emerald-500' : 'text-amber-500'}`}>{csr.toFixed(2)}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs text-slate-500 mb-1">{c.indexSii}</span>
              <span className={`text-2xl font-bold ${isFatty ? 'text-emerald-500' : 'text-amber-500'}`}>{sii.toFixed(1)}%</span>
            </div>
          </div>
          <InfoBox tone={isFatty ? 'emerald' : 'amber'}>
            {isFatty ? c.fattyConcl : c.notFattyConcl}
          </InfoBox>
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.thymic} />
      <ReportBugLink calcTitle={c.title} />
      {isValid && (
        <StickyBar>
          <div className="min-w-0 text-left">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.ratioCsr}: <span className={`font-black ${isFatty ? 'text-emerald-500' : 'text-amber-500'}`}>{csr.toFixed(2)}</span></span>
            <span className={`text-sm font-semibold ${isFatty ? 'text-emerald-500' : 'text-amber-500'}`}>{isFatty ? c.fattyConcl : c.notFattyConcl}</span>
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

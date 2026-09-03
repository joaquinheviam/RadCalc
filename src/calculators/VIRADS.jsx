import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, ScoreSelector5 } from '../components/shared/index.js';

export default function VIRADS() {
  const { t, lang } = useLang();
  const c = t.calc.virads;
  const [t2, setT2] = useState(0);
  const [dwi, setDwi] = useState(0);
  const [dce, setDce] = useState(0);
  const final = dwi > 0 ? dwi : (dce > 0 ? dce : t2);

  const handleCopy = () => {
    if (!final) return;
    const text = c.reportText(t2 || t.common.notEvaluated, dwi || t.common.notEvaluated, dce || t.common.notEvaluated, final);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  let interp = '';
  if (final >= 4) interp = c.interpretation.high;
  else if (final === 3) interp = c.interpretation.equivocal;
  else if (final > 0) interp = c.interpretation.low;
  const resetAll = () => { setT2(0); setDwi(0); setDce(0); };

  return (
    <div className={`space-y-4 animate-in fade-in ${final > 0 ? 'pb-24' : ''}`}>
      <Card className="space-y-6">
        <ScoreSelector5 label={c.step1} value={t2} onChange={setT2} defs={c.t2Defs} />
        <ScoreSelector5 label={c.step2} value={dwi} onChange={setDwi} defs={c.dwiDefs} />
        <ScoreSelector5 label={c.step3} value={dce} onChange={setDce} defs={c.dceDefs} />
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{c.dominantNote}</p>
      </Card>
      {final > 0 && <InfoBox tone={final >= 4 ? 'amber' : 'emerald'}>{interp}</InfoBox>}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.virads} />
      <ReportBugLink calcTitle={c.title} />
      {final > 0 && (
        <StickyBar>
          <div className="min-w-0 text-left">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.finalCategory}</span>
            <span className={`text-xl font-black ${final >= 4 ? 'text-red-500' : final === 3 ? 'text-amber-500' : 'text-emerald-500'}`}>VI-RADS {final}</span>
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

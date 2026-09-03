import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function AdrenalCSI() {
  const { t, lang } = useLang();
  const c = t.calc.adrenalMri;
  const [lesionIn, setLesionIn] = useState('');
  const [lesionOut, setLesionOut] = useState('');
  const [refIn, setRefIn] = useState('');
  const [refOut, setRefOut] = useState('');
  const lIn = parseFloat(lesionIn);
  const lOut = parseFloat(lesionOut);
  const rIn = parseFloat(refIn);
  const rOut = parseFloat(refOut);
  const hasAnyInput = lesionIn !== '' || lesionOut !== '' || refIn !== '' || refOut !== '';
  const isValid = !isNaN(lIn) && !isNaN(lOut) && !isNaN(rIn) && !isNaN(rOut) && lIn !== 0 && rOut !== 0 && rIn !== 0;
  const ratioIn = isValid ? (lIn / rIn) : 0;
  const ratioOut = isValid ? (lOut / rOut) : 0;
  const csi = isValid ? (ratioOut / ratioIn) * 100 : 0;
  const isAdenoma = csi < 71;

  const handleCopy = () => {
    const text = c.reportText(lesionIn, lesionOut, refIn, refOut, csi.toFixed(1), isAdenoma ? c.conclAdenoma : c.conclNot);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setLesionIn(''); setLesionOut(''); setRefIn(''); setRefOut(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyInput ? 'pb-56' : ''}`}>
      <Card className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{c.lesion}</h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberField small label={c.inPhase} value={lesionIn} onChange={setLesionIn} />
            <NumberField small label={c.outPhase} value={lesionOut} onChange={setLesionOut} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{c.reference}</h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberField small label={c.inPhase} value={refIn} onChange={setRefIn} />
            <NumberField small label={c.outPhase} value={refOut} onChange={setRefOut} />
          </div>
        </div>
      </Card>
      {hasAnyInput && isValid && (
        <InfoBox tone={isAdenoma ? 'emerald' : 'amber'}>
          {isAdenoma ? c.csiAdenoma : c.csiNot}
        </InfoBox>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.adrenalMri} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {hasAnyInput && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.csiIndex}</span>
            <span className={`text-4xl font-black block mt-1 ${isValid ? (isAdenoma ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-400'}`}>{isValid ? csi.toFixed(1) + '%' : '—'}</span>
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

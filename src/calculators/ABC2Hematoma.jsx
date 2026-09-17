import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function ABC2Hematoma() {
  const { t } = useLang();
  const c = t.calc.abc2Hematoma;
  const [diamA, setDiamA] = useState('');
  const [diamB, setDiamB] = useState('');
  const [sliceCount, setSliceCount] = useState('');
  const [sliceThickness, setSliceThickness] = useState('');

  const A = parseFloat(diamA) || 0;
  const B = parseFloat(diamB) || 0;
  const sc = parseFloat(sliceCount) || 0;
  const st = parseFloat(sliceThickness) || 0;
  const C = sc * st;

  const hasVolume = diamA !== '' && diamB !== '' && sliceCount !== '' && sliceThickness !== '' && A > 0 && B > 0 && sc > 0 && st > 0;
  const volume = hasVolume ? (A * B * C) / 2 : 0;

  const showLowVolumeNote = hasVolume && volume < 10;
  const showLobarRangeNote = hasVolume && volume >= 10 && volume <= 20;

  const handleCopy = () => {
    const lines = [c.reportText(volume.toFixed(1))];
    if (showLowVolumeNote) lines.push(c.lowVolumeNote);
    if (showLobarRangeNote) lines.push(c.lobarRangeNote);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setDiamA(''); setDiamB(''); setSliceCount(''); setSliceThickness(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasVolume ? 'pb-56' : ''}`}>
      <Card>
        <NumberField label={c.aLabel} placeholder={c.aPh} value={diamA} onChange={setDiamA} />
        <NumberField label={c.bLabel} placeholder={c.bPh} value={diamB} onChange={setDiamB} />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.cGroupLabel}</label>
          <div className="grid grid-cols-2 gap-2">
            <NumberField small placeholder={c.sliceCountPh} value={sliceCount} onChange={setSliceCount} />
            <NumberField small placeholder={c.sliceThicknessPh} value={sliceThickness} onChange={setSliceThickness} />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{c.sliceCountHelp}</p>
        </div>
      </Card>

      {hasVolume && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.volumeLabel}</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{volume.toFixed(1)} {c.volumeUnit}</span>
        </Card>
      )}

      {showLowVolumeNote && (
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 p-3">
          <p className="text-xs text-emerald-800 dark:text-emerald-200">{c.lowVolumeNote}</p>
        </div>
      )}
      {showLobarRangeNote && (
        <div className="rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 p-3">
          <p className="text-xs text-sky-800 dark:text-sky-200">{c.lobarRangeNote}</p>
        </div>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.abc2Hematoma} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasVolume && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.volumeLabel}:</span>
            <span className="text-3xl font-black block leading-tight text-slate-700 dark:text-slate-200">{volume.toFixed(1)} {c.volumeUnit}</span>
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

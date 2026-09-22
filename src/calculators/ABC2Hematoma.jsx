import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function getBgTier(vol) {
  if (vol <= 45.3) return 'low';
  if (vol < 60) return 'intermediate';
  return 'high';
}

const BG_TONE = { low: 'emerald', intermediate: 'amber', high: 'red' };

export default function ABC2Hematoma() {
  const { t } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.abc2Hematoma;
  const [diamA, setDiamA] = useState('');
  const [diamB, setDiamB] = useState('');
  const [cMethod, setCMethod] = useState('coronal');
  const [sliceCount, setSliceCount] = useState('');
  const [sliceThickness, setSliceThickness] = useState('');
  const [coronalC, setCoronalC] = useState('');
  const [isBasalGanglia, setIsBasalGanglia] = useState(false);

  const A = parseFloat(diamA) || 0;
  const B = parseFloat(diamB) || 0;
  const sc = parseFloat(sliceCount) || 0;
  const st = parseFloat(sliceThickness) || 0;
  const coC = parseFloat(coronalC) || 0;
  const C = cMethod === 'axial' ? sc * st : coC;

  const hasC = cMethod === 'axial' ? (sliceCount !== '' && sliceThickness !== '' && sc > 0 && st > 0) : (coronalC !== '' && coC > 0);
  const hasVolume = diamA !== '' && diamB !== '' && A > 0 && B > 0 && hasC;
  const volume = hasVolume ? (A * B * C) / 2 : 0;

  const showLowVolumeNote = hasVolume && volume < 10;
  const showLobarRangeNote = hasVolume && volume >= 10 && volume <= 20;

  const bgTier = hasVolume && isBasalGanglia ? getBgTier(volume) : null;
  const bgText = bgTier === 'low' ? c.bgLowText : bgTier === 'intermediate' ? c.bgIntermediateText : bgTier === 'high' ? c.bgHighText : null;

  const getReportText = () => {
    const lines = [c.reportText(volume.toFixed(1))];
    if (isBasalGanglia && bgText) lines.push(bgText);
    if (showLowVolumeNote) lines.push(c.lowVolumeNote);
    if (showLobarRangeNote) lines.push(c.lobarRangeNote);
    return lines.join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setDiamA(''); setDiamB(''); setSliceCount(''); setSliceThickness(''); setCoronalC(''); setIsBasalGanglia(false); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasVolume ? 'pb-56' : ''}`}>
      <Card>
        <NumberField label={c.aLabel} placeholder={c.aPh} value={diamA} onChange={setDiamA} />
        <NumberField label={c.bLabel} placeholder={c.bPh} value={diamB} onChange={setDiamB} />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.cMethodLabel}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setCMethod('coronal')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold border transition-colors ${cMethod === 'coronal' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {c.cMethodCoronal}
            </button>
            <button
              onClick={() => setCMethod('axial')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold border transition-colors ${cMethod === 'axial' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {c.cMethodAxial}
            </button>
          </div>
        </div>

        {cMethod === 'coronal' ? (
          <NumberField label={c.coronalCLabel} placeholder={c.coronalCPh} value={coronalC} onChange={setCoronalC} />
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.cGroupLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              <NumberField small placeholder={c.sliceCountPh} value={sliceCount} onChange={setSliceCount} />
              <NumberField small placeholder={c.sliceThicknessPh} value={sliceThickness} onChange={setSliceThickness} />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{c.sliceCountHelp}</p>
          </div>
        )}

        <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 pt-1">
          <input type="checkbox" checked={isBasalGanglia} onChange={() => setIsBasalGanglia((v) => !v)} className="w-4 h-4 rounded mt-0.5" />
          <span>{c.isBasalGangliaLabel}</span>
        </label>
        {isBasalGanglia && <p className="text-xs text-slate-400 dark:text-slate-500">{c.isBasalGangliaHelp}</p>}
      </Card>

      {hasVolume && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.volumeLabel}</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{volume.toFixed(1)} {c.volumeUnit}</span>
        </Card>
      )}

      {isBasalGanglia && bgText && <InfoBox tone={BG_TONE[bgTier]}>{bgText}</InfoBox>}

      {!isBasalGanglia && showLowVolumeNote && (
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 p-3">
          <p className="text-xs text-emerald-800 dark:text-emerald-200">{c.lowVolumeNote}</p>
        </div>
      )}
      {!isBasalGanglia && showLobarRangeNote && (
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
          <div className="flex items-start gap-5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} caption={t.common.reset} />
            <PreviewIconButton onClick={() => setShowPreview(true)} label={t.common.showReport} caption={t.common.showReportCaption} />
            <CopyIconButton onClick={handleCopy} label={t.common.copyReport} caption={t.common.copy} />
          </div>
        </StickyBar>
      )}
      <ReportPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        closeLabel={t.common.closeAria}
        title={t.common.reportPreviewTitle}
        reportText={getReportText()}
        onCopy={handleCopy}
        copyLabel={t.common.copyReport}
      />
    </div>
  );
}

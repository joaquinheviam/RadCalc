import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="flex gap-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`flex-1 text-center p-2.5 rounded-lg border text-sm font-medium transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

export default function SpleenSize() {
  const { t, lang } = useLang();
  const c = t.calc.spleenSize;

  const [sex, setSex] = useState('f'); // 'f' | 'm'
  const [height, setHeight] = useState('');
  const [length, setLength] = useState('');
  const [ap, setAp] = useState('');
  const [width, setWidth] = useState('');

  const heightVal = parseFloat(height);
  const hasHeight = height !== '' && !isNaN(heightVal);

  const ulnLength = hasHeight ? (sex === 'f' ? 0.0282 * heightVal + 7.5526 : 0.0544 * heightVal + 3.6693) : null;
  const ulnVolume = hasHeight ? (sex === 'f' ? 7.0996 * heightVal - 939.5 : 4.3803 * heightVal - 457.15) : null;

  const outOfRange = hasHeight && (sex === 'f' ? (heightVal < 155 || heightVal > 179) : (heightVal < 165 || heightVal > 199));

  const lengthVal = parseFloat(length);
  const hasLength = length !== '' && !isNaN(lengthVal);
  const apVal = parseFloat(ap);
  const widthVal = parseFloat(width);
  const hasVolumeInputs = hasLength && ap !== '' && !isNaN(apVal) && width !== '' && !isNaN(widthVal);
  const actualVolume = hasVolumeInputs ? 0.52 * lengthVal * apVal * widthVal : null;

  const lengthEnlarged = hasHeight && hasLength ? lengthVal > ulnLength : null;
  const volumeEnlarged = hasHeight && actualVolume !== null ? actualVolume > ulnVolume : null;
  const showResult = hasHeight && hasLength;
  const enlarged = showResult ? (lengthEnlarged || (volumeEnlarged === true)) : null;

  const handleCopy = () => {
    const lines = [
      c.reportTitle,
      `${c.ulnLengthLabel}: ${ulnLength.toFixed(1)} cm`,
      `${c.reportLength}: ${lengthVal.toFixed(1)} cm`,
    ];
    if (actualVolume !== null) {
      lines.push(`${c.ulnVolumeLabel}: ${ulnVolume.toFixed(0)} cm³`);
      lines.push(`${c.actualVolumeLabel}: ${actualVolume.toFixed(0)} cm³`);
    }
    lines.push(`${c.resultLabel}: ${enlarged ? c.enlarged : c.normal}`);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setSex('f'); setHeight(''); setLength(''); setAp(''); setWidth(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${showResult ? 'pb-56' : ''}`}>
      <Card className="space-y-4">
        <OptionList
          label={c.sexLabel}
          options={[{ key: 'f', label: c.sexFemale }, { key: 'm', label: c.sexMale }]}
          value={sex}
          onChange={setSex}
        />
        <NumberField label={c.heightLabel} placeholder="Ej: 165" value={height} onChange={setHeight} />
      </Card>
      {outOfRange && <InfoBox tone="amber">{c.heightRangeWarning}</InfoBox>}
      <Card className="space-y-4">
        <NumberField label={c.lengthLabel} placeholder="Ej: 11" value={length} onChange={setLength} />
        <div className="grid grid-cols-2 gap-2">
          <NumberField small label={c.apLabel} value={ap} onChange={setAp} />
          <NumberField small label={c.widthLabel} value={width} onChange={setWidth} />
        </div>
      </Card>
      {showResult && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <span className={`text-2xl font-black ${enlarged ? 'text-red-500' : 'text-emerald-500'}`}>{enlarged ? c.enlarged : c.normal}</span>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">
            {c.ulnLengthLabel}: {ulnLength.toFixed(1)} cm ({c.reportLength}: {lengthVal.toFixed(1)} cm)
          </p>
          {actualVolume !== null && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-snug">
              {c.ulnVolumeLabel}: {ulnVolume.toFixed(0)} cm³ ({c.actualVolumeLabel}: {actualVolume.toFixed(0)} cm³)
            </p>
          )}
          <InfoBox tone="slate">{c.classicCutoffNote}</InfoBox>
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.spleenSize} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {showResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className={`text-3xl font-black block leading-tight ${enlarged ? 'text-red-500' : 'text-emerald-500'}`}>{enlarged ? c.enlarged : c.normal}</span>
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

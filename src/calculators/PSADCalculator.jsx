import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconAlertTriangle, IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function PSADCalculator() {
  const { t, lang } = useLang();
  const c = t.calc.psad;
  const [ap, setAp] = useState('');
  const [tr, setTr] = useState('');
  const [long, setLong] = useState('');
  const [psa, setPsa] = useState('');
  const [factor, setFactor] = useState(0.52);
  const vol = (parseFloat(ap) || 0) * (parseFloat(tr) || 0) * (parseFloat(long) || 0) * factor;
  const hasVolume = ap && tr && long && vol > 0;
  const psaVal = parseFloat(psa);
  const hasPsa = psa !== '' && !isNaN(psaVal);
  const psad = hasVolume && hasPsa ? psaVal / vol : 0;
  const showVolume = hasVolume;
  const showPsad = hasVolume && hasPsa;
  const isHighRisk = psad >= 0.15;
  const volCatKey = vol <= 30 ? 'volCatNormal' : vol <= 49 ? 'volCatMild' : vol <= 69 ? 'volCatModerate' : 'volCatMarked';
  const volCatLabel = c[volCatKey];

  const handleCopy = () => {
    const text = showPsad
      ? c.reportText(vol.toFixed(1), volCatLabel, psa, psad.toFixed(2), isHighRisk ? c.highRisk : c.normal)
      : c.reportTextVolOnly(vol.toFixed(1), volCatLabel);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setAp(''); setTr(''); setLong(''); setPsa(''); setFactor(0.52); };

  return (
    <div className={`space-y-4 animate-in fade-in ${showVolume ? 'pb-56' : ''}`}>
      <Card>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.dims}</label>
          <div className="grid grid-cols-3 gap-2">
            <NumberField small placeholder={c.ap} value={ap} onChange={setAp} />
            <NumberField small placeholder={c.tr} value={tr} onChange={setTr} />
            <NumberField small placeholder={c.long} value={long} onChange={setLong} />
          </div>
        </div>
        <NumberField label={c.psaLabel} placeholder={c.psaPh} value={psa} onChange={setPsa} />
        <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
          <span>{c.formulaFactor}:</span>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            <button onClick={() => setFactor(0.52)} className={`px-3 py-1 rounded-md ${factor === 0.52 ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : ''}`}>0.52</button>
            <button onClick={() => setFactor(0.523)} className={`px-3 py-1 rounded-md ${factor === 0.523 ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : ''}`}>0.523</button>
          </div>
        </div>
      </Card>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.psad} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {showVolume && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.volume}: <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{vol.toFixed(1)} cc</span></span>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">{volCatLabel}</span>
            {showPsad ? (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block mt-2">{c.antigenDensityLabel}:</span>
                <span className={`text-4xl font-black flex items-center justify-center gap-2 mt-1 ${isHighRisk ? 'text-red-500' : 'text-emerald-500'}`}>
                  {isHighRisk ? <IconAlertTriangle size={26} /> : <IconCheckCircle size={26} />}
                  {psad.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm text-slate-400 dark:text-slate-500 block mt-2">{c.psaPending}</span>
            )}
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

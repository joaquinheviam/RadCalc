import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconAlertTriangle, IconCheckCircle, IconRefresh } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const UNIT_KEY = 'radiocalc:psadUnit';

export default function PSADCalculator() {
  const { t, lang } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.psad;
  const [ap, setAp] = useState('');
  const [tr, setTr] = useState('');
  const [long, setLong] = useState('');
  const [psa, setPsa] = useState('');
  const [factor, setFactor] = useState(0.52);
  // La unidad elegida (cm/mm) se recuerda en este dispositivo.
  const [unit, setUnitState] = useState(() => { try { return localStorage.getItem(UNIT_KEY) === 'mm' ? 'mm' : 'cm'; } catch { return 'cm'; } });
  const setUnit = (u) => { setUnitState(u); try { localStorage.setItem(UNIT_KEY, u); } catch { /* sin almacenamiento */ } };
  const unitDivisor = unit === 'mm' ? 1000 : 1;
  const vol = (parseFloat(ap) || 0) * (parseFloat(tr) || 0) * (parseFloat(long) || 0) * factor / unitDivisor;
  const hasVolume = ap && tr && long && vol > 0;
  const psaVal = parseFloat(psa);
  const hasPsa = psa !== '' && !isNaN(psaVal);
  const psad = hasVolume && hasPsa ? psaVal / vol : 0;
  const showVolume = hasVolume;
  const showPsad = hasVolume && hasPsa;
  const isHighRisk = psad >= 0.15;
  const volCatKey = vol <= 30 ? 'volCatNormal' : vol <= 49 ? 'volCatMild' : vol <= 69 ? 'volCatModerate' : 'volCatMarked';
  const volCatLabel = c[volCatKey];

  const getReportText = () => {
    if (!showVolume) return '';
    const text = showPsad
      ? c.reportText(vol.toFixed(1), volCatLabel, psa, psad.toFixed(2), isHighRisk ? c.highRisk : c.normal)
      : c.reportTextVolOnly(vol.toFixed(1), volCatLabel);
    return text;
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setAp(''); setTr(''); setLong(''); setPsa(''); setFactor(0.52); };

  return (
    <div className={`space-y-4 animate-in fade-in ${showVolume ? 'pb-56' : ''}`}>
      <Card>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{c.dimsLabel(unit === 'mm' ? c.unitMm : c.unitCm)}</label>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-sm">
              {[['cm', c.unitCm], ['mm', c.unitMm]].map(([u, text]) => (
                <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)} className={`px-3 py-1 rounded-md ${unit === u ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{text}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <NumberField small placeholder={c.ap} value={ap} onChange={setAp} />
            <NumberField small placeholder={c.tr} value={tr} onChange={setTr} />
            <NumberField small placeholder={c.long} value={long} onChange={setLong} />
          </div>
        </div>
        <NumberField label={c.psaLabel} placeholder={c.psaPh} value={psa} onChange={setPsa} />
        <button type="button" onClick={resetAll} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.99] transition-colors">
          <IconRefresh size={16} />
          {t.common.reset}
        </button>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{c.formulaFactor}:</span>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg">
            {[0.52, 0.523].map(f => (
              <button key={f} type="button" aria-pressed={factor === f} onClick={() => setFactor(f)} className={`px-2.5 py-0.5 rounded-md ${factor === f ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : ''}`}>{f}</button>
            ))}
          </div>
        </div>
      </Card>
      {showVolume && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.volume}</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{vol.toFixed(1)} cc</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{volCatLabel}</span>
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.psad} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {showVolume && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.volume}:</span>
            <span className="text-3xl font-black text-slate-700 dark:text-slate-200 block leading-tight">{Math.round(vol)} cc</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">{volCatLabel}</span>
            {showPsad ? (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block mt-2">{c.antigenDensityLabel}:</span>
                <span className={`text-4xl font-black flex items-center justify-center gap-2 mt-1 ${isHighRisk ? 'text-red-500' : 'text-emerald-500'}`}>
                  {isHighRisk ? <IconAlertTriangle size={26} /> : <IconCheckCircle size={26} />}
                  {psad.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400 block mt-2">{c.psaPending}</span>
            )}
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

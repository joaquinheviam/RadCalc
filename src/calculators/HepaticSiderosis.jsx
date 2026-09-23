import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

// Calibraciones R2* -> LIC (mg/g de peso seco) según el campo del equipo.
// 1.5 T: Wood et al. 2005 (calibrada contra biopsia).
// 3 T: Hernando et al. 2023 (multicéntrica y multifabricante, recomendada
// por la guía ESGAR/SAR 2023).
const CALIBRATIONS = {
  '1.5': { lic: (r2) => 0.0254 * r2 + 0.202, maxReliableLic: 40 },
  '3': { lic: (r2) => 0.01349 * r2 - 0.03, maxReliableLic: 26 },
};

// Grados ESGAR/SAR 2023: normal < 1.8; limítrofe 1.8-3.2; leve 3.2-7.0;
// moderada 7.0-15.0; severa > 15.0 mg/g.
function grade(lic) {
  if (lic < 1.8) return { key: 'normal', color: 'text-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-500/10' };
  if (lic <= 3.2) return { key: 'borderline', color: 'text-lime-600 dark:text-lime-400', badge: 'bg-lime-50 dark:bg-lime-500/10' };
  if (lic <= 7.0) return { key: 'mild', color: 'text-amber-500', badge: 'bg-amber-50 dark:bg-amber-500/10' };
  if (lic <= 15.0) return { key: 'moderate', color: 'text-orange-500', badge: 'bg-orange-50 dark:bg-orange-500/10' };
  return { key: 'severe', color: 'text-red-500', badge: 'bg-red-50 dark:bg-red-500/10' };
}

const segBtn = (active) =>
  `flex-1 py-2 text-sm font-medium rounded-lg transition-all ${active ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`;

export default function HepaticSiderosis() {
  const { t } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.siderosis;
  const [field, setField] = useState('1.5');
  const [inputType, setInputType] = useState('r2star');
  const [val, setVal] = useState('');
  const numericVal = parseFloat(String(val).replace(',', '.'));
  const isValid = !isNaN(numericVal) && numericVal > 0;
  let r2star = 0, t2star = 0;
  if (isValid) {
    if (inputType === 't2star') { t2star = numericVal; r2star = 1000 / t2star; }
    else { r2star = numericVal; t2star = 1000 / r2star; }
  }
  const calib = CALIBRATIONS[field];
  const lic = isValid ? Math.max(0, calib.lic(r2star)) : 0;
  const g = isValid ? grade(lic) : null;
  const category = g ? c.categories[g.key] : '';
  const overRange = isValid && lic > calib.maxReliableLic;

  const getReportText = () =>
    isValid ? c.reportText(g.key, t2star.toFixed(1), r2star.toFixed(0), lic.toFixed(1), c.fieldLabels[field]) : '';
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setField('1.5'); setInputType('r2star'); setVal(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${isValid ? 'pb-56' : ''}`}>
      <InfoBox tone="amber">{c.fieldStrengthNote}</InfoBox>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.fieldQ}</label>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-4">
          <button onClick={() => setField('1.5')} className={segBtn(field === '1.5')}>{c.fieldLabels['1.5']}</button>
          <button onClick={() => setField('3')} className={segBtn(field === '3')}>{c.fieldLabels['3']}</button>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-1">
          <button onClick={() => { setInputType('t2star'); setVal(''); }} className={segBtn(inputType === 't2star')}>
            {c.enterT2}
          </button>
          <button onClick={() => { setInputType('r2star'); setVal(''); }} className={segBtn(inputType === 'r2star')}>
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
          <div className="flex flex-col items-center justify-center py-2 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{c.licEstimated}</span>
            <span className={`text-4xl font-bold ${g.color}`}>{lic.toFixed(2)}</span>
            <span className={`mt-2 font-medium px-3 py-1 rounded-full text-sm ${g.badge} ${g.color}`}>
              {category}
            </span>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{c.calibrationUsed[field]}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-snug">{c.meaning[g.key]}</p>
          </div>
          {overRange && <InfoBox tone="amber">{c.overRange[field]}</InfoBox>}
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.siderosis} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {isValid && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.licEstimated} · {c.fieldLabels[field]}</span>
            <span className={`text-4xl font-black block ${g.color}`}>{lic.toFixed(2)}</span>
            <span className={`text-base font-semibold block mt-1 ${g.color}`}>{category}</span>
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

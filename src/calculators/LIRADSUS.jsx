import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}
function YesNo({ label, value, onChange, yesLabel, noLabel, helpText }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      {helpText && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-snug">{helpText}</p>}
      <div className="flex gap-2">
        <button onClick={() => onChange(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === true ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{yesLabel}</button>
        <button onClick={() => onChange(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{noLabel}</button>
      </div>
    </div>
  );
}

export default function LIRADSUS() {
  const { t, lang } = useLang();
  const c = t.calc.liradsUs;

  const [highRisk, setHighRisk] = useState(null);
  const [observation, setObservation] = useState(null); // 'none' | 'benign' | 'sub10' | 'ge10' | 'distortion' | 'thrombus'
  const [afpPositive, setAfpPositive] = useState(null);
  const [vis, setVis] = useState(null); // 'A' | 'B' | 'C'
  const [riskFactors, setRiskFactors] = useState(null);

  let usCategory = null;
  if (observation === 'none' || observation === 'benign') usCategory = 1;
  else if (observation === 'sub10') usCategory = 2;
  else if (observation === 'ge10' || observation === 'distortion' || observation === 'thrombus') usCategory = 3;

  const hasAllInputs = highRisk === true && usCategory !== null && afpPositive !== null && vis !== null && (vis !== 'C' || riskFactors !== null);
  const showResult = hasAllInputs;

  let mgmtKey = null;
  if (showResult) {
    if (usCategory === 3) mgmtKey = 'mgmtUs3';
    else if (afpPositive) mgmtKey = 'mgmtAfp';
    else if (vis === 'C') mgmtKey = riskFactors ? 'mgmtVisCRisk' : 'mgmtVisCNoRisk';
    else if (usCategory === 2) mgmtKey = 'mgmtUs2';
    else mgmtKey = 'mgmtUs1';
  }

  const catLabel = usCategory === 1 ? c.us1Label : usCategory === 2 ? c.us2Label : usCategory === 3 ? c.us3Label : '';
  const catTone = usCategory === 1 ? 'emerald' : usCategory === 2 ? 'amber' : 'red';
  const catToneClass = catTone === 'red' ? 'text-red-500' : catTone === 'amber' ? 'text-amber-500' : 'text-emerald-500';

  const mgmtText = mgmtKey ? c[mgmtKey] : '';

  const handleCopy = () => {
    const lines = [
      c.reportTitle,
      `${c.categoryLabel}: ${catLabel}`,
      `${c.visLabel}: VIS-${vis}`,
      `AFP: ${afpPositive ? t.common.yes : t.common.no}`,
      `${c.managementTitle}: ${mgmtText}`,
    ];
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setHighRisk(null); setObservation(null); setAfpPositive(null); setVis(null); setRiskFactors(null); };

  return (
    <div className={`space-y-4 animate-in fade-in ${showResult ? 'pb-56' : ''}`}>
      <Card>
        <YesNo label={c.highRiskLabel} helpText={c.highRiskHelp} value={highRisk} onChange={setHighRisk} yesLabel={t.common.yes} noLabel={t.common.no} />
      </Card>
      {highRisk === false && <InfoBox tone="amber">{c.notHighRiskWarning}</InfoBox>}
      {highRisk === true && (
        <>
          <Card>
            <OptionList
              label={c.observationLabel}
              options={[
                { key: 'none', label: c.obsNone },
                { key: 'benign', label: c.obsBenign },
                { key: 'sub10', label: c.obsSub10 },
                { key: 'ge10', label: c.obsGe10 },
                { key: 'distortion', label: c.obsDistortion },
                { key: 'thrombus', label: c.obsThrombus },
              ]}
              value={observation}
              onChange={setObservation}
            />
          </Card>
          <Card>
            <YesNo label={c.afpLabel} helpText={c.afpHelp} value={afpPositive} onChange={setAfpPositive} yesLabel={t.common.yes} noLabel={t.common.no} />
          </Card>
          <Card>
            <OptionList
              label={c.visLabel}
              options={[
                { key: 'A', label: c.visA },
                { key: 'B', label: c.visB },
                { key: 'C', label: c.visC },
              ]}
              value={vis}
              onChange={(v) => { setVis(v); if (v !== 'C') setRiskFactors(null); }}
            />
          </Card>
          {vis === 'C' && (
            <Card>
              <YesNo label={c.riskFactorsLabel} helpText={c.riskFactorsHelp} value={riskFactors} onChange={setRiskFactors} yesLabel={t.common.yes} noLabel={t.common.no} />
            </Card>
          )}
        </>
      )}
      {showResult && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.categoryLabel}</span>
          <span className={`text-2xl font-black ${catToneClass}`}>{catLabel}</span>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug"><strong>{c.managementTitle}:</strong> {mgmtText}</p>
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.liradsUs} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {showResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.categoryLabel}</span>
            <span className={`text-3xl font-black block leading-tight ${catToneClass}`}>{catLabel}</span>
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

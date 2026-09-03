import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function LungScreening() {
  const { t, lang } = useLang();
  const c = t.calc.lungScreening;
  const [excluded, setExcluded] = useState(null); // null | true | false
  const [age, setAge] = useState('');
  const [packYears, setPackYears] = useState('');
  const [smokingYears, setSmokingYears] = useState('');

  const ageNum = parseFloat(age);
  const pyNum = parseFloat(packYears);
  const syNum = parseFloat(smokingYears);
  const hasAge = age !== '' && !isNaN(ageNum);

  let result = null;
  if (excluded === true) {
    result = { label: c.resultNotEligible, desc: c.resultNotEligibleDesc, tone: 'red' };
  } else if (excluded === false && hasAge) {
    const meetsCat1 = ageNum >= 50 && !isNaN(pyNum) && pyNum >= 20;
    const meetsCat2b = ageNum >= 50 && !meetsCat1 && !isNaN(syNum) && syNum >= 20;
    if (meetsCat1 || meetsCat2b) {
      result = { label: c.resultHigherRisk, desc: meetsCat1 ? c.resultHigherRiskCat1 : c.resultHigherRiskCat2b, note: c.resultHigherRiskNote, tone: 'emerald' };
    } else {
      result = { label: c.resultLowerRisk, desc: c.resultLowerRiskDesc, tone: 'slate' };
    }
  }

  const handleCopy = () => {
    if (!result) return;
    const text = c.reportText(age, packYears, smokingYears, result.label, result.desc);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => {
    setExcluded(null); setAge(''); setPackYears(''); setSmokingYears('');
  };

  const toneClass = !result ? '' : result.tone === 'red' ? 'text-red-500' : result.tone === 'emerald' ? 'text-emerald-500' : 'text-slate-400';

  return (
    <div className={`space-y-4 animate-in fade-in ${result ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.exclusionQ}</label>
        <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1 mb-3">
          {c.exclusionOptions.map((opt, i) => <li key={i}>{opt}</li>)}
        </ul>
        <div className="flex gap-2">
          <button onClick={() => setExcluded(true)} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${excluded === true ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.exclusionYes}</button>
          <button onClick={() => setExcluded(false)} className={`flex-1 p-2.5 rounded-lg border text-sm transition-all ${excluded === false ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.exclusionNo}</button>
        </div>
      </Card>
      {excluded === false && (
        <Card>
          <NumberField label={c.ageLabel} placeholder="55" value={age} onChange={setAge} />
          <NumberField label={c.packYearsLabel} placeholder="30" value={packYears} onChange={setPackYears} />
          <NumberField label={c.smokingYearsLabel} placeholder="25" value={smokingYears} onChange={setSmokingYears} />
        </Card>
      )}
      {result && (
        <Card className="text-center">
          <span className={`text-xl font-black ${toneClass}`}>{result.label}</span>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{result.desc}</p>
          {result.note && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-snug">{result.note}</p>}
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.lungScreening} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {result && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className={`text-3xl font-black block leading-tight ${toneClass}`}>{result.label}</span>
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

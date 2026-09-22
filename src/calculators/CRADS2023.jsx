import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function OptionButtons({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-start gap-2 ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
        >
          <span>
            <span className="font-semibold block mb-0.5">{opt.label}</span>
            <span className="text-xs opacity-80">{opt.desc}</span>
          </span>
          <span className="text-xs font-bold shrink-0">{opt.badge}</span>
        </button>
      ))}
    </div>
  );
}

const COLONIC_TONE = { C0: 'text-amber-500', C1: 'text-emerald-500', C2a: 'text-amber-500', C2b: 'text-amber-500', C3: 'text-red-500', C4: 'text-red-500' };
const EXTRA_TONE = { E0: 'text-amber-500', E1_E2: 'text-emerald-500', E3: 'text-amber-500', E4: 'text-red-500' };

export default function CRADS2023() {
  const { t } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.crads2023;

  const [colonic, setColonic] = useState(null);
  const [c2bCertainty, setC2bCertainty] = useState(null); // 'likely' | 'uncertain'
  const [extracolonic, setExtracolonic] = useState(null);

  const colonicOptions = [
    { key: 'C0', badge: 'C0', label: c.c0Label, desc: c.c0Desc },
    { key: 'C1', badge: 'C1', label: c.c1Label, desc: c.c1Desc },
    { key: 'C2a', badge: 'C2a', label: c.c2aLabel, desc: c.c2aDesc },
    { key: 'C2b', badge: 'C2b', label: c.c2bLabel, desc: c.c2bDesc },
    { key: 'C3', badge: 'C3', label: c.c3Label, desc: c.c3Desc },
    { key: 'C4', badge: 'C4', label: c.c4Label, desc: c.c4Desc },
  ];

  const extraOptions = [
    { key: 'E0', badge: 'E0', label: c.e0Label, desc: c.e0Desc },
    { key: 'E1_E2', badge: 'E1/E2', label: c.e1e2Label, desc: c.e1e2Desc },
    { key: 'E3', badge: 'E3', label: c.e3Label, desc: c.e3Desc },
    { key: 'E4', badge: 'E4', label: c.e4Label, desc: c.e4Desc },
  ];

  const selectColonic = (key) => {
    setColonic(key);
    if (key !== 'C2b') setC2bCertainty(null);
  };

  const c2bPending = colonic === 'C2b' && !c2bCertainty;

  const colonicRecommendation = (() => {
    if (!colonic || c2bPending) return null;
    if (colonic === 'C2b') return c2bCertainty === 'likely' ? c.c2bLikelyResult : c.c2bUncertainResult;
    return { C0: c.c0Result, C1: c.c1Result, C2a: c.c2aResult, C3: c.c3Result, C4: c.c4Result }[colonic];
  })();

  const extraRecommendation = extracolonic ? { E0: c.e0Result, E1_E2: c.e1e2Result, E3: c.e3Result, E4: c.e4Result }[extracolonic] : null;

  const hasAny = (colonic && !c2bPending) || extracolonic;

  const resetAll = () => { setColonic(null); setC2bCertainty(null); setExtracolonic(null); };

  const getReportText = () => {
    const lines = [];
    if (colonic && !c2bPending) {
      lines.push(`${c.colonicLabel}: ${colonic}`);
      lines.push(`${c.managementLabel}: ${colonicRecommendation}`);
    }
    if (extracolonic) {
      lines.push(`${c.extraLabel}: ${extracolonic === 'E1_E2' ? 'E1/E2' : extracolonic}`);
      lines.push(`${c.managementLabel}: ${extraRecommendation}`);
    }
    if (!lines.length) return;
    return lines.join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAny ? 'pb-56' : ''}`}>
      <Card>
        <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3">{c.colonicSectionTitle}</h3>
        <OptionButtons options={colonicOptions} value={colonic} onChange={selectColonic} />

        {colonic === 'C2b' && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{c.c2bCertaintyQ}</label>
            <div className="flex gap-2">
              <button onClick={() => setC2bCertainty('likely')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${c2bCertainty === 'likely' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.c2bLikelyLabel}</button>
              <button onClick={() => setC2bCertainty('uncertain')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${c2bCertainty === 'uncertain' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.c2bUncertainLabel}</button>
            </div>
          </div>
        )}
      </Card>

      {colonic && !c2bPending && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.colonicResultLabel}</span>
          <p className={`text-2xl font-black mb-1 ${COLONIC_TONE[colonic]}`}>{colonic}</p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{colonicRecommendation}</p>
        </Card>
      )}

      <Card>
        <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3">{c.extraSectionTitle}</h3>
        <OptionButtons options={extraOptions} value={extracolonic} onChange={setExtracolonic} />
      </Card>

      {extracolonic && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.extraResultLabel}</span>
          <p className={`text-2xl font-black mb-1 ${EXTRA_TONE[extracolonic]}`}>{extracolonic === 'E1_E2' ? 'E1/E2' : extracolonic}</p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{extraRecommendation}</p>
        </Card>
      )}

      <InfoBox tone="slate">{c.independentNote}</InfoBox>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.crads2023} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasAny && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.summaryLabel}</span>
            <span className="text-lg font-black leading-tight text-slate-800 dark:text-slate-100 block">
              {colonic && !c2bPending && `${c.colonicLabel}: ${colonic}`}
              {colonic && !c2bPending && extracolonic ? ' · ' : ''}
              {extracolonic && `${c.extraLabel}: ${extracolonic === 'E1_E2' ? 'E1/E2' : extracolonic}`}
            </span>
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

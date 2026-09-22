import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconAlertTriangle, IconCheckCircle } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const btnCls = (active) =>
  `w-full text-left p-2.5 rounded-lg border text-xs transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

function YesNoRow({ label, value, onChange, yesLabel, noLabel }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <button onClick={() => onChange('yes')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${value === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{yesLabel}</button>
        <button onClick={() => onChange('no')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${value === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{noLabel}</button>
      </div>
    </div>
  );
}

export default function Pecarn() {
  const { t } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.pecarn;

  const [age, setAge] = useState(null); // 'under2' | 'over2'

  // Criterios de alto riesgo
  const [gcsAms, setGcsAms] = useState(null);
  const [fracture, setFracture] = useState(null); // fractura palpable (<2) o signos de fractura basilar (>=2)

  // Criterios de riesgo intermedio, <2 años
  const [hematoma, setHematoma] = useState(null);
  const [locUnder2, setLocUnder2] = useState(null);
  const [abnormalBehavior, setAbnormalBehavior] = useState(null);

  // Criterios de riesgo intermedio, >=2 años
  const [locOver2, setLocOver2] = useState(null);
  const [vomiting, setVomiting] = useState(null);
  const [severeHeadache, setSevereHeadache] = useState(null);

  // Compartido entre ambas ramas etarias
  const [severeMech, setSevereMech] = useState(null);

  const resetAll = () => {
    setAge(null);
    setGcsAms(null);
    setFracture(null);
    setHematoma(null);
    setLocUnder2(null);
    setAbnormalBehavior(null);
    setLocOver2(null);
    setVomiting(null);
    setSevereHeadache(null);
    setSevereMech(null);
  };

  const selectAge = (value) => {
    resetAll();
    setAge(value);
  };

  const isUnder2 = age === 'under2';
  const isOver2 = age === 'over2';

  const isHighRisk = gcsAms === 'yes' || fracture === 'yes';
  const highRiskCleared = gcsAms === 'no' && fracture === 'no';

  const intFactorsUnder2 = [hematoma, locUnder2, severeMech, abnormalBehavior];
  const intAnsweredUnder2 = intFactorsUnder2.every((v) => v !== null);
  const isIntUnder2 = intFactorsUnder2.some((v) => v === 'yes');

  const intFactorsOver2 = [locOver2, vomiting, severeMech, severeHeadache];
  const intAnsweredOver2 = intFactorsOver2.every((v) => v !== null);
  const isIntOver2 = intFactorsOver2.some((v) => v === 'yes');

  const intermediateAnswered = highRiskCleared && ((isUnder2 && intAnsweredUnder2) || (isOver2 && intAnsweredOver2));
  const isIntermediate = intermediateAnswered && ((isUnder2 && isIntUnder2) || (isOver2 && isIntOver2));
  const isLow = intermediateAnswered && !isIntermediate;

  let verdict = null;
  if (isHighRisk) verdict = 'high';
  else if (isIntermediate) verdict = 'intermediate';
  else if (isLow) verdict = 'low';

  const verdictMeta = verdict && {
    high: { title: c.verdictHighTitle, risk: isUnder2 ? c.verdictHighRiskUnder2 : c.verdictHighRiskOver2, color: 'text-red-500', tone: 'red' },
    intermediate: { title: c.verdictIntTitle, risk: isUnder2 ? c.verdictIntRiskUnder2 : c.verdictIntRiskOver2, color: 'text-amber-500', tone: 'amber' },
    low: { title: c.verdictLowTitle, risk: isUnder2 ? c.verdictLowRiskUnder2 : c.verdictLowRiskOver2, color: 'text-emerald-500', tone: 'emerald' },
  }[verdict];

  const getReportText = () => {
    if (!verdictMeta) return;
    const lines = [verdictMeta.title, verdictMeta.risk];
    if (verdict === 'intermediate') lines.push(c.verdictIntNote);
    if (verdict === 'low') lines.push(c.verdictLowNote);
    return lines.join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${verdict ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.ageQ}</label>
        <div className="space-y-2">
          <button onClick={() => selectAge('under2')} className={btnCls(age === 'under2')}>{c.ageUnder2}</button>
          <button onClick={() => selectAge('over2')} className={btnCls(age === 'over2')}>{c.ageOver2}</button>
        </div>
      </Card>

      {age && (
        <Card>
          <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3">{c.highRiskTitle}</h4>
          <YesNoRow label={c.gcsAmsQ} value={gcsAms} onChange={setGcsAms} yesLabel={c.yes} noLabel={c.no} />
          <YesNoRow label={isUnder2 ? c.palpableFractureQ : c.basilarFractureQ} value={fracture} onChange={setFracture} yesLabel={c.yes} noLabel={c.no} />
        </Card>
      )}

      {highRiskCleared && isUnder2 && (
        <Card>
          <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3">{c.intermediateRiskTitle}</h4>
          <YesNoRow label={c.hematomaQ} value={hematoma} onChange={setHematoma} yesLabel={c.yes} noLabel={c.no} />
          <YesNoRow label={c.locUnder2Q} value={locUnder2} onChange={setLocUnder2} yesLabel={c.yes} noLabel={c.no} />
          <YesNoRow label={c.severeMechQ} value={severeMech} onChange={setSevereMech} yesLabel={c.yes} noLabel={c.no} />
          <YesNoRow label={c.abnormalBehaviorQ} value={abnormalBehavior} onChange={setAbnormalBehavior} yesLabel={c.yes} noLabel={c.no} />
        </Card>
      )}

      {highRiskCleared && isOver2 && (
        <Card>
          <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3">{c.intermediateRiskTitle}</h4>
          <YesNoRow label={c.locOver2Q} value={locOver2} onChange={setLocOver2} yesLabel={c.yes} noLabel={c.no} />
          <YesNoRow label={c.vomitingQ} value={vomiting} onChange={setVomiting} yesLabel={c.yes} noLabel={c.no} />
          <YesNoRow label={c.severeMechQ} value={severeMech} onChange={setSevereMech} yesLabel={c.yes} noLabel={c.no} />
          <YesNoRow label={c.severeHeadacheQ} value={severeHeadache} onChange={setSevereHeadache} yesLabel={c.yes} noLabel={c.no} />
        </Card>
      )}

      {verdictMeta && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <h3 className={`text-lg font-bold ${verdictMeta.color} mb-1`}>{verdictMeta.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{verdictMeta.risk}</p>
          {verdict === 'intermediate' && <InfoBox tone="amber">{c.verdictIntNote}</InfoBox>}
          {verdict === 'low' && <InfoBox tone="emerald">{c.verdictLowNote}</InfoBox>}
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.pecarn} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {verdictMeta && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}:</span>
            <span className={`text-xl font-black flex items-center justify-center gap-2 leading-tight ${verdictMeta.color}`}>
              {verdict === 'low' ? <IconCheckCircle size={22} /> : <IconAlertTriangle size={22} />}
              {verdictMeta.title}
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

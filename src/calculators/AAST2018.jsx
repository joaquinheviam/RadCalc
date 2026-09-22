import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const btnCls = (active) =>
  `w-full text-left p-2.5 rounded-lg border text-xs transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

const GRADE_ORDER = ['I', 'II', 'III', 'IV', 'V'];

// Criterios de imagen (TC) por órgano — AAST 2018 update (Kozar et al., J Trauma Acute
// Care Surg 2018;85(6):1119-1122). Solo se incluyen los criterios de imagen; la escala
// también admite criterios operatorios/patológicos, no cubiertos por esta calculadora.
const ORGAN_GRADE_KEYS = {
  spleen: { I: 'spleenGradeI', II: 'spleenGradeII', III: 'spleenGradeIII', IV: 'spleenGradeIV', V: 'spleenGradeV' },
  liver: { I: 'liverGradeI', II: 'liverGradeII', III: 'liverGradeIII', IV: 'liverGradeIV', V: 'liverGradeV' },
  kidney: { I: 'kidneyGradeI', II: 'kidneyGradeII', III: 'kidneyGradeIII', IV: 'kidneyGradeIV', V: 'kidneyGradeV' },
};

export default function AAST2018() {
  const { t } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.aast2018;

  const [organ, setOrgan] = useState(null); // 'spleen' | 'liver' | 'kidney'
  const [grade, setGrade] = useState(null); // 'I'..'V'
  const [modifier, setModifier] = useState(null); // 'yes' | 'no'

  const organOptions = [
    { key: 'spleen', label: c.organSpleen },
    { key: 'liver', label: c.organLiver },
    { key: 'kidney', label: c.organKidney },
  ];

  const selectOrgan = (key) => {
    setOrgan(key);
    setGrade(null);
    setModifier(null);
  };

  const selectGrade = (key) => {
    setGrade(key);
    setModifier(null);
  };

  // El modificador ("multiple grade I or II injuries" / "bilateral injuries") solo
  // se aplica cuando el grado base es I o II, avanzando un grado con tope en III.
  const modifierEligible = grade === 'I' || grade === 'II';

  const baseIndex = grade ? GRADE_ORDER.indexOf(grade) : -1;
  const modifierApplied = modifierEligible && modifier === 'yes';
  const finalIndex = modifierApplied ? baseIndex + 1 : baseIndex;
  const finalGrade = finalIndex >= 0 ? GRADE_ORDER[finalIndex] : null;

  const answered = organ && grade && (!modifierEligible || modifier !== null);

  const resetAll = () => { setOrgan(null); setGrade(null); setModifier(null); };

  const getReportText = () => {
    if (!answered) return;
    const lines = [`${c.resultLabel}: ${c.finalGradeLabel(finalGrade)}`];
    if (modifierApplied) lines.push(c.modifierAppliedNote);
    lines.push(c.treatmentCaveat);
    return lines.join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${answered ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.organQ}</label>
        <div className="space-y-2">
          {organOptions.map((opt) => (
            <button key={opt.key} onClick={() => selectOrgan(opt.key)} className={btnCls(organ === opt.key)}>{opt.label}</button>
          ))}
        </div>
      </Card>

      {organ && <InfoBox tone="slate">{c.criteriaScopeNote}</InfoBox>}

      {organ && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.gradeQ}</label>
          <div className="space-y-2">
            {GRADE_ORDER.map((g) => (
              <button key={g} onClick={() => selectGrade(g)} className={btnCls(grade === g)}>
                {c[ORGAN_GRADE_KEYS[organ][g]]}
              </button>
            ))}
          </div>
        </Card>
      )}

      {modifierEligible && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {organ === 'kidney' ? c.bilateralQ : c.multipleQ}
          </label>
          <div className="flex gap-2">
            <button onClick={() => setModifier('yes')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${modifier === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.yes}</button>
            <button onClick={() => setModifier('no')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${modifier === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.no}</button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{c.modifierNote}</p>
        </Card>
      )}

      {answered && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <h3 className="text-2xl font-black text-blue-500 mb-1">{c.finalGradeLabel(finalGrade)}</h3>
          {modifierApplied && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.modifierAppliedNote}</p>}
          <InfoBox tone="amber">{c.treatmentCaveat}</InfoBox>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.aast2018} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {answered && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}:</span>
            <span className="text-3xl font-black leading-tight text-blue-500">{c.finalGradeLabel(finalGrade)}</span>
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

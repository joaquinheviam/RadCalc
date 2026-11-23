import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, InfoBox, Accordion, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const CHANGE_SCORE = {
  newLesion: '4',
  increase: '4',
  stableVisible: '3-V',
  stableNonVisible: '3-NonV',
  reduction: '2',
  resolution: '1',
};

const SCORE_COLOR = {
  '1': 'text-emerald-500',
  '2': 'text-emerald-500',
  '3-V': 'text-amber-500',
  '3-NonV': 'text-slate-500 dark:text-slate-400',
  '4': 'text-red-500',
  '5': 'text-red-500',
  X: 'text-slate-500 dark:text-slate-400',
};

const optionClass = (active) => `w-full text-left p-3 rounded-xl border text-sm transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

export default function PRECISE() {
  const { t } = useLang();
  const c = t.calc.precise;
  const [showPreview, setShowPreview] = useState(false);
  const [quality, setQuality] = useState(null); // 'yes' | 'no'
  const [stage, setStage] = useState(null); // 'yes' | 'no'
  const [change, setChange] = useState(null);
  const [cmp, setCmp] = useState(null);

  // Puntaje PRECISE v2: calidad no diagnóstica -> X; progresión de etapa -> 5;
  // si no, según el cambio respecto de la RM basal y la previa.
  const score = quality === 'no' ? 'X'
    : quality === 'yes' && stage === 'yes' ? '5'
    : quality === 'yes' && stage === 'no' && change ? CHANGE_SCORE[change]
    : null;

  const label = score ? c.scoreLabels[score] : '';
  const likelihood = score ? c.likelihood[score] : '';
  const cmpText = cmp ? c.cmpOptions.find(o => o.key === cmp).report : '';

  const getReportText = () => {
    if (!score) return '';
    // El texto del 4 reúne dos hallazgos alternativos: se informa solo el marcado.
    const finding = score === '4' ? c.changeOptions.find(o => o.key === change).label : likelihood;
    return c.reportText(label, finding, cmpText);
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const pickQuality = (v) => {
    setQuality(v);
    if (v === 'no') { setStage(null); setChange(null); }
  };
  const pickStage = (v) => {
    setStage(v);
    if (v === 'yes') setChange(null);
  };
  const resetAll = () => { setQuality(null); setStage(null); setChange(null); setCmp(null); };

  return (
    <div className={`space-y-4 animate-in fade-in ${score ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.cmpLabel}</label>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-snug">{c.cmpHelp}</p>
        <div className="grid grid-cols-1 gap-2" role="group" aria-label={c.cmpLabel}>
          {c.cmpOptions.map(opt => (
            <button key={opt.key} type="button" onClick={() => setCmp(cmp === opt.key ? null : opt.key)} aria-pressed={cmp === opt.key} className={optionClass(cmp === opt.key)}>{opt.label}</button>
          ))}
        </div>
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.q1}</label>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-snug">{c.q1Help}</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => pickQuality('yes')} aria-pressed={quality === 'yes'} className={optionClass(quality === 'yes')}>{c.yes}</button>
          <button type="button" onClick={() => pickQuality('no')} aria-pressed={quality === 'no'} className={optionClass(quality === 'no')}>{c.noNonDiagnostic}</button>
        </div>
      </Card>

      {quality === 'yes' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.q2}</label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-snug">{c.q2Help}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => pickStage('yes')} aria-pressed={stage === 'yes'} className={optionClass(stage === 'yes')}>{c.yes}</button>
            <button type="button" onClick={() => pickStage('no')} aria-pressed={stage === 'no'} className={optionClass(stage === 'no')}>{c.no}</button>
          </div>
        </Card>
      )}

      {quality === 'yes' && stage === 'no' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.q3}</label>
          <div className="space-y-2">
            {c.changeOptions.map(opt => (
              <button key={opt.key} type="button" onClick={() => setChange(opt.key)} aria-pressed={change === opt.key} className={optionClass(change === opt.key)}>
                <span className="block">{opt.label}</span>
                <span className="block text-[11px] opacity-80 mt-0.5 leading-snug">{opt.sub}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {score && (
        <Card>
          <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
          <span className={`text-3xl font-black block mt-1 leading-tight ${SCORE_COLOR[score]}`}>{label}</span>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{likelihood}</p>
          {score === 'X' && <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-2">{c.repeatMri}</p>}
        </Card>
      )}

      {score && score !== 'X' && (
        <InfoBox tone="amber">
          <span className="font-semibold block mb-1">{c.mgmtTitle}</span>
          {c.mgmtText}
        </InfoBox>
      )}

      <Accordion title={c.recsTitle}>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          {c.recs.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </Accordion>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.precise} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {score && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className={`text-3xl font-black block mt-1 leading-tight ${SCORE_COLOR[score]}`}>{label}</span>
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

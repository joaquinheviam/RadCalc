import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconBookOpen } from '../components/icons/index.js';
import { ITMIGCompartmentsScheme } from '../components/schematics/ITMIGCompartmentsScheme.jsx';
import { Card, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion, ZoomableDiagram } from '../components/shared/index.js';

// Masas mediastínicas por compartimento ITMIG: 1) compartimento, 2) composición
// en TC (solo prevascular y visceral) y 3) hallazgo clínico-radiológico
// dominante. Cada rama termina en un diferencial orientativo y, cuando
// corresponde, una nota (RM para quistes hiperdensos, criterios NCCN de
// "tumor tímico probable", RM en compartimento paravertebral).

function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            aria-pressed={value === opt.key}
            className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Opciones del paso 3 según la rama; null si esa rama no tiene paso 3.
function featureOptionsFor(c, compartment, composition) {
  if (compartment === 'prevascular' && composition === 'solid') return { label: c.qPrevascSolid, options: c.prevascSolidOpts };
  if (compartment === 'visceral' && composition === 'cystic') return { label: c.qVisceralCystic, options: c.visceralCysticOpts };
  if (compartment === 'visceral' && composition === 'solid') return { label: c.qVisceralSolid, options: c.visceralSolidOpts };
  if (compartment === 'paravertebral') return { label: c.qParavertebral, options: c.paravertebralOpts };
  return null;
}

// Diferencial y nota para la combinación elegida. La lógica vive aquí; los
// textos, en strings.
function evaluate(compartment, composition, feature) {
  if (compartment === 'prevascular') {
    if (composition === 'fat') return { dx: 'dxPrevascFat' };
    if (composition === 'calcium') return { dx: 'dxPrevascCalcium' };
    if (composition === 'cystic') return { dx: 'dxThymicCyst', note: 'noteCysticMri', tone: 'emerald' };
    if (composition === 'solid') {
      if (feature === 'chemicalShift') return { dx: 'dxHyperplasia', note: 'noteHyperplasia', tone: 'emerald' };
      if (feature === 'dwiRestriction') return { dx: 'dxThymomaLymphoma', note: 'noteNccn', tone: 'amber' };
      if (feature === 'tumorMarkers') return { dx: 'dxGermCell' };
      if (feature === 'thyroid') return { dx: 'dxGoiter' };
      if (feature === 'bSymptoms') return { dx: 'dxLymphoma' };
      if (feature === 'none') return { dx: 'dxPrevascSolidIndeterminate', note: 'noteSolidIndeterminate', tone: 'amber' };
    }
  }
  if (compartment === 'visceral') {
    if (composition === 'cystic') {
      const dx = { subcarinal: 'dxBronchogenic', esophageal: 'dxEsophagealDuplication', cardiophrenic: 'dxPericardial' }[feature];
      if (dx) return { dx, note: 'noteCysticMri', tone: 'emerald' };
    }
    if (composition === 'solid') {
      if (feature === 'lymphadenopathy') return { dx: 'dxLymphadenopathy' };
      if (feature === 'hypervascular') return { dx: 'dxHypervascular' };
    }
  }
  if (compartment === 'paravertebral') {
    const dx = { dumbbell: 'dxNerveSheath', fusiform: 'dxGanglioneuroma', mibg: 'dxNeuroblastoma', csf: 'dxMeningocele', hematopoiesis: 'dxHematopoiesis' }[feature];
    if (dx) return { dx, note: 'noteParavertebralMri', tone: 'slate' };
  }
  return null;
}

export default function MediastinalMass() {
  const { t } = useLang();
  const c = t.calc.mediastinalMass;
  const [showPreview, setShowPreview] = useState(false);
  const [compartment, setCompartment] = useState(null); // 'prevascular' | 'visceral' | 'paravertebral'
  const [composition, setComposition] = useState(null); // 'fat' | 'calcium' | 'cystic' | 'solid'
  const [feature, setFeature] = useState(null);

  const chooseCompartment = (key) => { setCompartment(key); setComposition(null); setFeature(null); };
  const chooseComposition = (key) => { setComposition(key); setFeature(null); };
  const resetAll = () => { setCompartment(null); setComposition(null); setFeature(null); };

  const compositionOpts = compartment === 'visceral'
    ? c.compositionOpts.filter((o) => o.key === 'cystic' || o.key === 'solid')
    : c.compositionOpts;
  const featureStep = featureOptionsFor(c, compartment, composition);
  const result = evaluate(compartment, composition, feature);
  const hasResult = Boolean(result);

  const labelOf = (opts, key) => opts.find((o) => o.key === key)?.label;
  const getReportText = () => {
    if (!hasResult) return '';
    return c.reportText({
      compartment: labelOf(c.compartmentOpts, compartment),
      composition: composition ? labelOf(c.compositionOpts, composition) : null,
      feature: feature && featureStep ? labelOf(featureStep.options, feature) : null,
      dx: c[result.dx],
      note: result.note ? c[result.note] : null,
    });
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasResult ? 'pb-56' : ''}`}>
      <Card>
        <OptionList label={c.qCompartment} options={c.compartmentOpts} value={compartment} onChange={chooseCompartment} />
      </Card>

      {/* Esquema de Gemini integrado tal cual; resalta el compartimento elegido. */}
      <Accordion icon={<IconBookOpen size={16} />} title={c.diagramTitle}>
        <ZoomableDiagram title={c.diagramTitle} labels={t.common.diagramZoom}>
          <ITMIGCompartmentsScheme labels={c.diagramLabels} highlight={compartment} />
        </ZoomableDiagram>
      </Accordion>

      {(compartment === 'prevascular' || compartment === 'visceral') && (
        <Card>
          <OptionList label={c.qComposition} options={compositionOpts} value={composition} onChange={chooseComposition} />
        </Card>
      )}

      {featureStep && (
        <Card>
          <OptionList label={featureStep.label} options={featureStep.options} value={feature} onChange={setFeature} />
        </Card>
      )}

      {hasResult && (
        <Card className="text-center space-y-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase font-semibold tracking-wide">{c.resultLabel}</span>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">{c[result.dx]}</p>
          {result.note && <div className="text-left"><InfoBox tone={result.tone}>{c[result.note]}</InfoBox></div>}
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.mediastinalMass} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className="text-lg font-black block leading-tight text-slate-800 dark:text-slate-100 line-clamp-3">{c[result.dx]}</span>
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

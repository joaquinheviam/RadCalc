import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function YesNo({ label, value, onChange, yesLabel, noLabel }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <button onClick={() => onChange(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === true ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{yesLabel}</button>
        <button onClick={() => onChange(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{noLabel}</button>
      </div>
    </div>
  );
}

function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`flex-1 min-w-[45%] text-center p-2.5 rounded-lg border text-sm font-medium transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

// Diagnósticos candidatos, en el orden en que se evalúan sus gatillos.
// La lógica de clasificación es responsabilidad exclusiva del código (no delegada).
function buildDifferential(s) {
  const dx = [];
  const push = (k) => { if (!dx.includes(k)) dx.push(k); };

  if (s.knownMalignancy === true) push('dxMetastasis');
  if (s.wedgeShapedNoEnhancement) push('dxInfarct');

  if (s.consistency === 'cystic') {
    if (s.thickCalcifiedWall) push('dxCyst');
    if (s.thinWallLowAttenuation) push('dxCyst');
    if (s.numberOfLesions === 'multiple' || s.symptomCategory === 'fever') push('dxAbscess');
    push('dxLymphangioma');
    if (s.numberOfLesions === 'solitary') push('dxHydatid');
    if (!dx.includes('dxCyst')) push('dxCyst');
    if (s.numberOfLesions === 'multiple' && !dx.includes('dxHydatid')) push('dxHydatid');
  } else if (s.consistency === 'solid') {
    if (s.peripheralCentripetalEnhancement) push('dxHemangioma');
    if (s.spokeWheelScar) push('dxSANT');
    if (s.numberOfLesions === 'multiple' && s.progressiveIsoenhancement) push('dxLCA');
    if (s.hypervascular === 'yes') {
      push('dxHemangioma');
      if (s.numberOfLesions === 'solitary') { push('dxHamartoma'); push('dxSANT'); }
    } else if (s.hypervascular === 'no') {
      push('dxLymphoma');
      if (s.numberOfLesions === 'multiple') push('dxSarcoidosis');
    }
    if (s.symptomatic === true && (s.necrosis || s.heterogeneous)) push('dxAngiosarcoma');
  }
  return dx;
}

// Veredicto de conducta (flowchart ACR 2013 + salvedad Siewert 2018).
function buildVerdict(s) {
  if (s.symptomatic === true) {
    if (!s.symptomCategory) return { key: 'pending-symptom', tone: 'slate' };
    return { key: `specific-${s.symptomCategory}`, tone: s.symptomCategory === 'massEffect' ? 'red' : 'amber' };
  }
  if (s.symptomatic === false) {
    if (!s.consistency) return null;
    const suspicious = s.irregularMarginsInvasion || s.necrosis;
    const benignDiagnostic = s.thinWallLowAttenuation || s.peripheralCentripetalEnhancement || s.thickCalcifiedWall;
    const indeterminate = !suspicious && !benignDiagnostic && s.heterogeneous;
    if (suspicious) return { key: 'suspicious', tone: 'red' };
    if (benignDiagnostic) return { key: 'benignDiagnostic', tone: 'emerald' };
    if (indeterminate) return { key: 'indeterminate', tone: 'amber' };
    return { key: s.knownMalignancy === true ? 'benignImagingKnownMalignancy' : 'benignImagingNoMalignancy', tone: s.knownMalignancy === true ? 'amber' : 'emerald' };
  }
  return null;
}

const SYMPTOM_NOTE_KEY = {
  fever: 'specificManagementFeverNote',
  bSymptoms: 'specificManagementBSymptomsNote',
  massEffect: 'specificManagementMassEffectNote',
  hypersplenism: 'specificManagementHypersplenismNote',
};

export default function SplenicLesion() {
  const { t } = useLang();
  const c = t.calc.splenicLesion;

  const [symptomatic, setSymptomatic] = useState(null);
  const [symptomCategory, setSymptomCategory] = useState(null);
  const [knownMalignancy, setKnownMalignancy] = useState(null);
  const [numberOfLesions, setNumberOfLesions] = useState(null);
  const [consistency, setConsistency] = useState(null);
  const [hypervascular, setHypervascular] = useState(null);
  const [size, setSize] = useState('');

  const [thinWallLowAttenuation, setThinWallLowAttenuation] = useState(false);
  const [thickCalcifiedWall, setThickCalcifiedWall] = useState(false);
  const [peripheralCentripetalEnhancement, setPeripheralCentripetalEnhancement] = useState(false);
  const [progressiveIsoenhancement, setProgressiveIsoenhancement] = useState(false);
  const [spokeWheelScar, setSpokeWheelScar] = useState(false);
  const [wedgeShapedNoEnhancement, setWedgeShapedNoEnhancement] = useState(false);
  const [heterogeneous, setHeterogeneous] = useState(false);
  const [irregularMarginsInvasion, setIrregularMarginsInvasion] = useState(false);
  const [necrosis, setNecrosis] = useState(false);
  const [splenomegaly, setSplenomegaly] = useState(false);

  const state = {
    symptomatic, symptomCategory, knownMalignancy, numberOfLesions, consistency, hypervascular,
    thinWallLowAttenuation, thickCalcifiedWall, peripheralCentripetalEnhancement, progressiveIsoenhancement,
    spokeWheelScar, wedgeShapedNoEnhancement, heterogeneous, irregularMarginsInvasion, necrosis, splenomegaly,
  };

  const differential = consistency ? buildDifferential(state) : [];
  const verdict = buildVerdict(state);
  const showResult = verdict !== null;

  const VERDICT_BIG = {
    'pending-symptom': null,
    'specific-fever': c.specificManagementVerdictBig,
    'specific-bSymptoms': c.specificManagementVerdictBig,
    'specific-massEffect': c.specificManagementVerdictBig,
    'specific-hypersplenism': c.specificManagementVerdictBig,
    suspicious: c.suspiciousVerdictBig,
    indeterminate: c.indeterminateVerdictBig,
    benignDiagnostic: c.benignDiagnosticVerdictBig,
    benignImagingNoMalignancy: c.benignImagingIncidentalVerdictBig,
    benignImagingKnownMalignancy: c.benignImagingIncidentalVerdictBig,
  };
  const VERDICT_NOTE = {
    suspicious: c.suspiciousNote,
    indeterminate: c.indeterminateNote,
    benignDiagnostic: c.benignDiagnosticNote,
    benignImagingNoMalignancy: c.benignImagingNoMalignancyNote,
    benignImagingKnownMalignancy: c.benignImagingKnownMalignancyNote,
  };
  const TONE_TEXT = { red: 'text-red-500', amber: 'text-amber-500', emerald: 'text-emerald-500', slate: 'text-slate-500' };

  const verdictNote = verdict && verdict.key.startsWith('specific-')
    ? c[SYMPTOM_NOTE_KEY[symptomCategory]]
    : (verdict ? VERDICT_NOTE[verdict.key] : null);

  const DX_TITLE = {
    dxCyst: c.dxCystTitle, dxHydatid: c.dxHydatidTitle, dxLymphangioma: c.dxLymphangiomaTitle, dxAbscess: c.dxAbscessTitle,
    dxHemangioma: c.dxHemangiomaTitle, dxHamartoma: c.dxHamartomaTitle, dxSANT: c.dxSANTTitle, dxLCA: c.dxLCATitle,
    dxLymphoma: c.dxLymphomaTitle, dxMetastasis: c.dxMetastasisTitle, dxSarcoidosis: c.dxSarcoidosisTitle,
    dxInfarct: c.dxInfarctTitle, dxAngiosarcoma: c.dxAngiosarcomaTitle,
  };
  const DX_DESC = {
    dxCyst: c.dxCystDescription, dxHydatid: c.dxHydatidDescription, dxLymphangioma: c.dxLymphangiomaDescription, dxAbscess: c.dxAbscessDescription,
    dxHemangioma: c.dxHemangiomaDescription, dxHamartoma: c.dxHamartomaDescription, dxSANT: c.dxSANTDescription, dxLCA: c.dxLCADescription,
    dxLymphoma: c.dxLymphomaDescription, dxMetastasis: c.dxMetastasisDescription, dxSarcoidosis: c.dxSarcoidosisDescription,
    dxInfarct: c.dxInfarctDescription, dxAngiosarcoma: c.dxAngiosarcomaDescription,
  };

  const handleCopy = () => {
    const lines = [c.title];
    if (size !== '') lines.push(`${c.sizeLabel}: ${size} mm`);
    if (differential.length) {
      lines.push('', c.differentialSectionTitle + ':');
      differential.forEach(k => lines.push(`- ${DX_TITLE[k]}`));
    }
    if (verdict && VERDICT_BIG[verdict.key]) {
      lines.push('', `${c.managementSectionTitle}: ${VERDICT_BIG[verdict.key]}`);
      if (verdictNote) lines.push(verdictNote);
    }
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  const resetAll = () => {
    setSymptomatic(null); setSymptomCategory(null); setKnownMalignancy(null);
    setNumberOfLesions(null); setConsistency(null); setHypervascular(null); setSize('');
    setThinWallLowAttenuation(false); setThickCalcifiedWall(false); setPeripheralCentripetalEnhancement(false);
    setProgressiveIsoenhancement(false); setSpokeWheelScar(false); setWedgeShapedNoEnhancement(false);
    setHeterogeneous(false); setIrregularMarginsInvasion(false); setNecrosis(false); setSplenomegaly(false);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${showResult ? 'pb-56' : ''}`}>
      <Card className="space-y-4">
        <YesNo label={c.symptomaticLabel} value={symptomatic} onChange={(v) => { setSymptomatic(v); if (!v) setSymptomCategory(null); }} yesLabel={t.common.yes} noLabel={t.common.no} />
        {symptomatic === true && (
          <OptionList
            label={c.symptomCategoryLabel}
            options={[
              { key: 'fever', label: c.symptomFeverLabel },
              { key: 'bSymptoms', label: c.symptomBSymptomsLabel },
              { key: 'massEffect', label: c.symptomMassEffectLabel },
              { key: 'hypersplenism', label: c.symptomHypersplenismLabel },
            ]}
            value={symptomCategory}
            onChange={setSymptomCategory}
          />
        )}
        <YesNo label={c.knownMalignancyLabel} value={knownMalignancy} onChange={setKnownMalignancy} yesLabel={t.common.yes} noLabel={t.common.no} />
      </Card>

      <Card className="space-y-4">
        <OptionList label={c.numberOfLesionsLabel} options={[{ key: 'solitary', label: c.solitaryLabel }, { key: 'multiple', label: c.multipleLabel }]} value={numberOfLesions} onChange={setNumberOfLesions} />
        <OptionList label={c.consistencyLabel} options={[{ key: 'cystic', label: c.cysticLabel }, { key: 'solid', label: c.solidLabel }]} value={consistency} onChange={setConsistency} />
        {consistency === 'solid' && (
          <OptionList
            label={c.hypervascularLabel}
            options={[{ key: 'yes', label: c.hypervascularYesLabel }, { key: 'no', label: c.hypervascularNoLabel }, { key: 'unknown', label: c.hypervascularUnknownLabel }]}
            value={hypervascular}
            onChange={setHypervascular}
          />
        )}
        <NumberField label={c.sizeLabel} placeholder="Ej: 20" value={size} onChange={setSize} />
      </Card>

      {consistency === 'cystic' && (
        <Card className="space-y-3">
          <YesNo label={c.thinWallLowAttenuationLabel} value={thinWallLowAttenuation} onChange={setThinWallLowAttenuation} yesLabel={t.common.yes} noLabel={t.common.no} />
          <YesNo label={c.thickCalcifiedWallLabel} value={thickCalcifiedWall} onChange={setThickCalcifiedWall} yesLabel={t.common.yes} noLabel={t.common.no} />
        </Card>
      )}
      {consistency === 'solid' && (
        <Card className="space-y-3">
          <YesNo label={c.peripheralCentripetalEnhancementLabel} value={peripheralCentripetalEnhancement} onChange={setPeripheralCentripetalEnhancement} yesLabel={t.common.yes} noLabel={t.common.no} />
          <YesNo label={c.progressiveIsoenhancementLabel} value={progressiveIsoenhancement} onChange={setProgressiveIsoenhancement} yesLabel={t.common.yes} noLabel={t.common.no} />
          <YesNo label={c.spokeWheelScarLabel} value={spokeWheelScar} onChange={setSpokeWheelScar} yesLabel={t.common.yes} noLabel={t.common.no} />
        </Card>
      )}
      {consistency && (
        <Card className="space-y-3">
          <YesNo label={c.wedgeShapedNoEnhancementLabel} value={wedgeShapedNoEnhancement} onChange={setWedgeShapedNoEnhancement} yesLabel={t.common.yes} noLabel={t.common.no} />
          <YesNo label={c.heterogeneousLabel} value={heterogeneous} onChange={setHeterogeneous} yesLabel={t.common.yes} noLabel={t.common.no} />
          <YesNo label={c.irregularMarginsInvasionLabel} value={irregularMarginsInvasion} onChange={setIrregularMarginsInvasion} yesLabel={t.common.yes} noLabel={t.common.no} />
          <YesNo label={c.necrosisLabel} value={necrosis} onChange={setNecrosis} yesLabel={t.common.yes} noLabel={t.common.no} />
          <YesNo label={c.splenomegalyLabel} value={splenomegaly} onChange={setSplenomegaly} yesLabel={t.common.yes} noLabel={t.common.no} />
        </Card>
      )}

      {differential.length > 0 && (
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.differentialSectionTitle}</h3>
          <InfoBox tone="slate">{c.differentialIntroNote}</InfoBox>
          <div className="space-y-2">
            {differential.map(k => (
              <div key={k} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{DX_TITLE[k]}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-snug">{DX_DESC[k]}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {symptomatic === true && !symptomCategory && (
        <InfoBox tone="slate">{c.selectSymptomCategoryNote}</InfoBox>
      )}

      {verdict && VERDICT_BIG[verdict.key] && (
        <Card className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.managementSectionTitle}</h3>
          <InfoBox tone={verdict.tone}>{verdictNote}</InfoBox>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.splenicLesion} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {verdict && VERDICT_BIG[verdict.key] && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className={`text-xl font-black block leading-tight ${TONE_TEXT[verdict.tone]}`}>{VERDICT_BIG[verdict.key]}</span>
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

import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion } from '../components/shared/index.js';
import { IconInfo } from '../components/icons/index.js';

// Botón de dos opciones (Sí/No), estilo reutilizado de otras calculadoras (ej. LIRADS).
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

// Lista de botones de opción única (estilo PancreasResect/LIRADS).
function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

export default function PancreaticCyst() {
  const { t, lang } = useLang();
  const c = t.calc.pancreaticCyst;

  const [diagnosis, setDiagnosis] = useState('indeterminate'); // 'indeterminate' | 'sca' | 'pseudocyst' | 'spn'
  const [scaConfidence, setScaConfidence] = useState(null); // null | 'typical' | 'atypical' — solo aplica si diagnosis === 'sca'
  const [size, setSize] = useState('');
  const [symptomatic, setSymptomatic] = useState(null); // true | false | null
  const [age, setAge] = useState('');
  const [surgicalCandidate, setSurgicalCandidate] = useState(null); // true | false | null — solo se pregunta si edad >= 80
  const [mpdComm, setMpdComm] = useState(null); // 'established' | 'absent' | null
  const [mpdSize, setMpdSize] = useState('');
  const [nodule, setNodule] = useState('none'); // 'none' | 'nonenhancing' | 'highrisk'
  const [wallThickening, setWallThickening] = useState(false);
  const [jaundice, setJaundice] = useState(false);
  const [cytology, setCytology] = useState(false);
  const [pancreatitis, setPancreatitis] = useState(false);
  const [newOnsetDm, setNewOnsetDm] = useState(false);
  const [ca199, setCa199] = useState(false);
  const [rapidGrowth, setRapidGrowth] = useState(false);
  const [calcification, setCalcification] = useState('none'); // informativo
  const [location, setLocation] = useState(null); // informativo
  const [sex, setSex] = useState(null); // informativo
  const [morphology, setMorphology] = useState('none'); // informativo
  const [previousSize, setPreviousSize] = useState('');
  const [monthsSinceBaseline, setMonthsSinceBaseline] = useState('');

  const hSize = parseFloat(size);
  const hAge = parseFloat(age);
  const hMpdSize = parseFloat(mpdSize);
  const hasSize = !isNaN(hSize);
  const hasAge = !isNaN(hAge);
  const hasMpdSize = !isNaN(hMpdSize);
  const hPrevSize = parseFloat(previousSize);
  const hMonthsSinceBaseline = parseFloat(monthsSinceBaseline);
  const hasPrevSize = !isNaN(hPrevSize) && hPrevSize > 0;
  const hasMonthsSinceBaseline = !isNaN(hMonthsSinceBaseline) && hMonthsSinceBaseline >= 0;

  // Definición de crecimiento del ACR White Paper (Megibow et al., JACR 2017): 100% de aumento
  // del diámetro mayor para quistes < 0,5 cm; 50% para 0,5-<1,5 cm; 20% para >= 1,5 cm. Es una
  // definición basada solo en el cambio de tamaño (no depende del tiempo transcurrido).
  const acrGrowthPct = hPrevSize < 0.5 ? 1.0 : hPrevSize < 1.5 ? 0.5 : 0.2;
  const acrGrowthThresholdSize = hasPrevSize ? hPrevSize * (1 + acrGrowthPct) : null;
  const hasAcrGrowth = hasPrevSize && hasSize && hSize >= acrGrowthThresholdSize - 1e-9 && hSize > hPrevSize;

  // Tasa de crecimiento en mm/año (Consenso chileno: > 2,5 mm/año es una característica preocupante).
  const growthRateMmPerYear = (hasPrevSize && hasSize && hasMonthsSinceBaseline && hMonthsSinceBaseline > 0)
    ? ((hSize - hPrevSize) * 10) / (hMonthsSinceBaseline / 12)
    : null;
  const hasCalculatedRapidGrowth = growthRateMmPerYear !== null && growthRateMmPerYear > 2.5;

  const noduleOptions = [
    { key: 'none', label: c.noduleNone },
    { key: 'nonenhancing', label: c.noduleNonenhancing },
    { key: 'highrisk', label: c.noduleHighRisk },
  ];
  const mpdCommOptions = [
    { key: 'established', label: c.mpdCommEstablished },
    { key: 'absent', label: c.mpdCommAbsent },
  ];
  const calcificationOptions = [
    { key: 'none', label: c.calcificationNone },
    { key: 'central', label: c.calcificationCentral },
    { key: 'peripheral', label: c.calcificationPeripheral },
  ];
  const locationOptions = [
    { key: 'head', label: c.locationHead },
    { key: 'bodytail', label: c.locationBodyTail },
  ];
  const sexOptions = [
    { key: 'female', label: c.sexFemale },
    { key: 'male', label: c.sexMale },
  ];
  const morphologyOptions = [
    { key: 'none', label: c.morphologyNone },
    { key: 'microcystic', label: c.morphologyMicrocystic },
    { key: 'macrocystic', label: c.morphologyMacrocystic },
    { key: 'complex', label: c.morphologyComplex },
  ];

  const SCHEDULE_SHORT_KEY = {
    schLt15Lt65: 'schShortLt15Lt65',
    schLt15_65_79: 'schShortLt15_65_79',
    sch15_19Established: 'schShort15_19Established',
    sch20_25Established: 'schShort20_25Established',
    sch15_25NotEstablished: 'schShort15_25NotEstablished',
    schGt25Lt80: 'schShortGt25Lt80',
    sch80Le25: 'schShort80Le25',
    sch80Gt25: 'schShort80Gt25',
  };

  // ---- Lógica solo para la vía "indeterminado / presumiblemente mucinoso" ----
  const highRiskTriggers = [];
  if (jaundice) highRiskTriggers.push(c.triggerJaundice);
  if (nodule === 'highrisk') highRiskTriggers.push(c.triggerMuralHighRisk);
  if (hasMpdSize && hMpdSize >= 10) highRiskTriggers.push(c.triggerMpdHighRisk(mpdSize));
  if (cytology) highRiskTriggers.push(c.triggerCytology);
  const isHighRisk = highRiskTriggers.length > 0;

  const worrisomeTriggers = [];
  if (wallThickening) worrisomeTriggers.push(c.triggerWall);
  if (nodule === 'nonenhancing') worrisomeTriggers.push(c.triggerMuralWorrisome);
  if (hasMpdSize && hMpdSize >= 5 && hMpdSize < 10) worrisomeTriggers.push(c.triggerMpdWorrisome(mpdSize));
  if (pancreatitis) worrisomeTriggers.push(c.triggerPancreatitis);
  if (newOnsetDm) worrisomeTriggers.push(c.triggerDM);
  if (ca199) worrisomeTriggers.push(c.triggerCa199);
  if (rapidGrowth) worrisomeTriggers.push(c.triggerGrowthRate);
  if (hasAcrGrowth) worrisomeTriggers.push(c.triggerAcrGrowth(previousSize, size));
  if (hasCalculatedRapidGrowth) worrisomeTriggers.push(c.triggerGrowthRateCalculated(growthRateMmPerYear.toFixed(1)));
  const isWorrisome = worrisomeTriggers.length > 0;

  const needsMpdComm = hasSize && hSize >= 1.5 && hSize <= 2.5;
  const needsSurgicalCandidateAnswer = hasAge && hAge >= 80;
  const hasScheduleInputs = hasAge && hasSize && (!needsMpdComm || mpdComm !== null) && (!needsSurgicalCandidateAnswer || surgicalCandidate !== null);
  const notCandidate = needsSurgicalCandidateAnswer && surgicalCandidate === false;

  let scheduleKey = null;
  if (hasScheduleInputs && !isHighRisk && !isWorrisome) {
    if (hAge >= 80) {
      scheduleKey = hSize <= 2.5 ? 'sch80Le25' : 'sch80Gt25';
    } else if (hSize < 1.5) {
      scheduleKey = hAge < 65 ? 'schLt15Lt65' : 'schLt15_65_79';
    } else if (hSize <= 2.5) {
      if (mpdComm === 'established') scheduleKey = hSize < 2.0 ? 'sch15_19Established' : 'sch20_25Established';
      else scheduleKey = 'sch15_25NotEstablished';
    } else {
      scheduleKey = 'schGt25Lt80';
    }
  }

  let chileanKey = null;
  if (hasSize) {
    if (hSize < 1) chileanKey = 'clLt1';
    else if (hSize <= 2) chileanKey = 'cl1_2';
    else if (hSize <= 3) chileanKey = 'cl2_3';
    else chileanKey = 'clGt3';
  }

  // ---- Próximo control estimado, a partir de los meses transcurridos desde el estudio basal ----
  // Cada esquema ACR se modela como una secuencia de fases [intervalo en meses, número de controles
  // en esa fase]; se recorre la secuencia consumiendo la duración de cada fase hasta ubicar en cuál
  // cae el tiempo transcurrido, y se informa el intervalo de esa fase (no una fecha exacta: es una
  // estimación orientadora, asumiendo controles previos realizados según lo recomendado).
  const ACR_SCHEDULE_PHASES = {
    schLt15Lt65: [[12, 5], [24, 2]],
    schLt15_65_79: [[24, 5]],
    sch15_19Established: [[12, 5], [24, 2]],
    sch20_25Established: [[6, 4], [12, 2], [24, 3]],
    sch15_25NotEstablished: [[6, 4], [12, 2], [24, 3]],
    schGt25Lt80: [[6, 4], [12, 2], [24, 3]],
    sch80Le25: [[24, 2]],
    sch80Gt25: [[24, 2]],
  };
  const nextControlFromPhases = (phases, elapsedMonths) => {
    let remaining = elapsedMonths;
    for (const [m, n] of phases) {
      const dur = m * n;
      if (remaining < dur - 1e-9) {
        const posInPhase = remaining % m;
        const monthsUntilNext = posInPhase < 1e-9 ? m : m - posInPhase;
        return { done: false, monthsUntilNext: Math.round(monthsUntilNext) };
      }
      remaining -= dur;
    }
    return { done: true };
  };
  // Esquema chileno: solo clLt1 y cl2_3 tienen una fase inicial distinta antes del intervalo
  // habitual; ninguno especifica una duración total de seguimiento (a diferencia del ACR).
  const chileanNextControl = (key, elapsedMonths) => {
    if (key === 'clLt1') {
      if (elapsedMonths < 12 - 1e-9) return { monthsUntilNext: Math.round(12 - elapsedMonths) };
      const rem = (elapsedMonths - 12) % 24;
      return { monthsUntilNext: Math.round(rem < 1e-9 ? 24 : 24 - rem) };
    }
    if (key === 'cl1_2') {
      const rem = elapsedMonths % 12;
      return { monthsUntilNext: Math.round(rem < 1e-9 ? 12 : 12 - rem) };
    }
    if (key === 'cl2_3') {
      if (elapsedMonths < 6 - 1e-9) return { monthsUntilNext: Math.round(6 - elapsedMonths) };
      const rem = (elapsedMonths - 6) % 12;
      return { monthsUntilNext: Math.round(rem < 1e-9 ? 12 : 12 - rem) };
    }
    if (key === 'clGt3') {
      if (elapsedMonths < 6 - 1e-9) return { monthsUntilNext: Math.round(6 - elapsedMonths), approxWindow: true };
      return { indefinite: true };
    }
    return null;
  };

  // Nota especial ACR: tamaño >=3cm por sí solo (sin otras características) no obliga a EUS-FNA.
  const sizeGe3Alone = hasSize && hSize >= 3 && !isHighRisk && !isWorrisome;

  const indeterminateVerdict = isHighRisk ? 'highrisk' : isWorrisome ? 'worrisome' : (scheduleKey ? 'routine' : null);

  const acrNextControlResult = (indeterminateVerdict === 'routine' && scheduleKey && hasMonthsSinceBaseline)
    ? nextControlFromPhases(ACR_SCHEDULE_PHASES[scheduleKey], hMonthsSinceBaseline)
    : null;
  const chileanNextControlResult = (indeterminateVerdict === 'routine' && chileanKey && hasMonthsSinceBaseline)
    ? chileanNextControl(chileanKey, hMonthsSinceBaseline)
    : null;

  const mpdCommLabelText = mpdComm === 'established' ? c.mpdCommEstablished : mpdComm === 'absent' ? c.mpdCommAbsent : null;

  const diagnosisLabelText = diagnosis === 'sca' ? c.diagnosisSca : diagnosis === 'pseudocyst' ? c.diagnosisPseudocyst : diagnosis === 'spn' ? c.diagnosisSpn : c.diagnosisIndeterminate;

  // Sugerencias diagnósticas informativas (no cambian la conducta), combinando
  // morfología, sexo, localización y comunicación con el CPP.
  const suggestions = [];
  if (morphology === 'microcystic') suggestions.push(c.suggestSca);
  if (morphology === 'macrocystic' && sex === 'female' && location === 'bodytail') suggestions.push(c.suggestMcn);
  if (mpdComm === 'established') suggestions.push(c.suggestBdIpmn);
  if (mpdComm === 'established' && hasMpdSize && hMpdSize >= 5) suggestions.push(c.suggestMixedIpmn);

  // ---- Veredicto global (para StickyBar / copia de informe) ----
  let bigLabel = null, bigTone = null, bigMsg = null, smallLabel = null, extraNote = null;
  if (diagnosis === 'sca') {
    // ACR 2017 White Paper: "SCA displays characteristic features in >60% of cases, although
    // 'atypical' morphology can also be seen in a large proportion of cases" — y su Principio 1:
    // "All incidental cysts should be presumed mucinous, unless the cyst has DEFINITIVE features
    // of an alternative histology (eg, SCA)". Por eso no basta con que el radiólogo marque "SCA":
    // si la morfología es atípica, no corresponde suspender el seguimiento (ver scaAtypicalMsg).
    smallLabel = c.diagnosisShortSca;
    if (scaConfidence === null) {
      bigLabel = c.scaConfidenceNeededBig;
      bigTone = 'slate';
      bigMsg = c.scaConfidenceNeededMsg;
    } else if (scaConfidence === 'atypical') {
      bigLabel = c.scaAtypicalBig;
      bigTone = 'amber';
      bigMsg = c.scaAtypicalMsg;
    } else {
      const scaHighSize = hasSize && hSize > 4;
      bigLabel = scaHighSize ? c.scaSurgicalBig : c.scaNoFollowupBig;
      bigTone = scaHighSize ? 'amber' : 'emerald';
      bigMsg = scaHighSize ? c.scaSurgical : c.scaNoFollowup;
    }
  } else if (diagnosis === 'pseudocyst') {
    smallLabel = c.diagnosisShortPseudocyst;
    bigLabel = c.pseudocystVerdictBig;
    bigTone = 'slate';
    bigMsg = c.pseudocystNote;
  } else if (diagnosis === 'spn') {
    smallLabel = c.diagnosisShortSpn;
    bigLabel = c.spnVerdictBig;
    bigTone = 'amber';
    bigMsg = c.spnMsg;
  } else if (symptomatic === true) {
    smallLabel = c.diagnosisIndeterminate;
    bigLabel = c.exclusionStopTitle;
    bigTone = 'red';
    bigMsg = c.exclusionStop;
  } else if (symptomatic === false) {
    smallLabel = c.diagnosisIndeterminate;
    if (indeterminateVerdict === 'highrisk') {
      bigLabel = c.highRiskVerdictBig; bigTone = 'red'; bigMsg = c.highRiskMsg;
      if (notCandidate) extraNote = c.notCandidateNote;
    } else if (indeterminateVerdict === 'worrisome') {
      bigLabel = c.worrisomeVerdictBig; bigTone = 'amber'; bigMsg = c.worrisomeMsg;
      if (notCandidate) extraNote = c.notCandidateNote;
    } else if (indeterminateVerdict === 'routine') {
      if (notCandidate) { bigLabel = c.notCandidateVerdictBig; bigTone = 'slate'; bigMsg = c.notCandidateNote; }
      else { bigLabel = c.routineNextControl(c[SCHEDULE_SHORT_KEY[scheduleKey]]); bigTone = 'emerald'; bigMsg = c.routineMsg; }
    }
  }

  const showResult = bigLabel !== null;
  const toneClass = bigTone === 'red' ? 'text-red-500' : bigTone === 'amber' ? 'text-amber-500' : bigTone === 'slate' ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-500';

  const handleCopy = () => {
    const lines = [c.reportTitle];
    lines.push(c.reportLineDiagnosis(diagnosisLabelText));
    if (size !== '') lines.push(c.reportLineSize(size));
    if (diagnosis === 'indeterminate') {
      if (symptomatic === true) {
        lines.push(c.reportConclusion(c.exclusionStop));
      } else {
        if (age !== '') lines.push(c.reportLineAge(age));
        if (mpdCommLabelText) lines.push(c.reportLineMpdComm(mpdCommLabelText));
        const allTriggers = [...highRiskTriggers, ...worrisomeTriggers];
        lines.push(allTriggers.length ? c.reportLineTriggers(allTriggers.join('; ')) : c.reportLineNoTriggers);
        if (previousSize !== '') lines.push(c.reportLinePreviousSize(previousSize));
        if (monthsSinceBaseline !== '') lines.push(c.reportLineMonthsSinceBaseline(monthsSinceBaseline));
        if (indeterminateVerdict === 'routine' && scheduleKey) {
          lines.push(c.reportLineSchedule(c[scheduleKey]));
          if (chileanKey) lines.push(c.reportLineChilean(c[chileanKey]));
          if (acrNextControlResult) {
            lines.push(acrNextControlResult.done ? c.scheduleCompleteNote : c.reportLineNextControl(acrNextControlResult.monthsUntilNext));
          }
        }
        if (suggestions.length) lines.push(...suggestions);
        if (bigMsg) lines.push(c.reportConclusion(bigLabel + ' — ' + bigMsg));
        if (extraNote) lines.push(extraNote);
      }
    } else if (bigMsg) {
      lines.push(c.reportConclusion(bigMsg));
    }
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  const resetAll = () => {
    setDiagnosis('indeterminate'); setScaConfidence(null); setSize(''); setSymptomatic(null); setAge('');
    setSurgicalCandidate(null); setMpdComm(null); setMpdSize(''); setNodule('none'); setWallThickening(false);
    setJaundice(false); setCytology(false); setPancreatitis(false); setNewOnsetDm(false);
    setCa199(false); setRapidGrowth(false); setCalcification('none'); setLocation(null);
    setSex(null); setMorphology('none'); setPreviousSize(''); setMonthsSinceBaseline('');
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${showResult ? 'pb-56' : ''}`}>
      <Card>
        <OptionList
          label={c.diagnosisLabel}
          options={[
            { key: 'indeterminate', label: c.diagnosisIndeterminate },
            { key: 'sca', label: c.diagnosisSca },
            { key: 'pseudocyst', label: c.diagnosisPseudocyst },
            { key: 'spn', label: c.diagnosisSpn },
          ]}
          value={diagnosis}
          onChange={(v) => { setDiagnosis(v); setScaConfidence(null); }}
        />
      </Card>

      {diagnosis === 'sca' && (
        <Card>
          <OptionList
            label={c.diagnosisScaConfidenceLabel}
            options={[
              { key: 'typical', label: c.scaConfidenceTypical },
              { key: 'atypical', label: c.scaConfidenceAtypical },
            ]}
            value={scaConfidence}
            onChange={setScaConfidence}
          />
        </Card>
      )}

      <Card>
        <NumberField label={c.sizeLabel} value={size} onChange={setSize} />
      </Card>

      {diagnosis === 'indeterminate' && (
        <Card>
          <YesNo label={c.exclusionQuestion} value={symptomatic} onChange={setSymptomatic} yesLabel={t.common.yes} noLabel={t.common.no} />
        </Card>
      )}

      {diagnosis === 'indeterminate' && symptomatic === false && (
        <>
          <Card>
            <NumberField label={c.ageLabel} value={age} onChange={setAge} />
          </Card>

          {needsSurgicalCandidateAnswer && (
            <Card>
              <YesNo label={c.surgicalCandidateLabel} value={surgicalCandidate} onChange={setSurgicalCandidate} yesLabel={t.common.yes} noLabel={t.common.no} />
            </Card>
          )}

          <Card className="space-y-4">
            <OptionList label={c.mpdCommLabel} options={mpdCommOptions} value={mpdComm} onChange={setMpdComm} />
            <NumberField label={c.mpdSizeLabel} value={mpdSize} onChange={setMpdSize} />
            <OptionList label={c.noduleLabel} options={noduleOptions} value={nodule} onChange={setNodule} />
            <YesNo label={c.wallThickeningLabel} value={wallThickening} onChange={setWallThickening} yesLabel={t.common.yes} noLabel={t.common.no} />
            <YesNo label={c.jaundiceLabel} value={jaundice} onChange={setJaundice} yesLabel={t.common.yes} noLabel={t.common.no} />
            <YesNo label={c.cytologyLabel} value={cytology} onChange={setCytology} yesLabel={t.common.yes} noLabel={t.common.no} />
          </Card>

          <InfoBox tone="red">{c.redFlagAlways}</InfoBox>

          <Card className="space-y-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.chileanExtrasTitle}</p>
            <YesNo label={c.pancreatitisLabel} value={pancreatitis} onChange={setPancreatitis} yesLabel={t.common.yes} noLabel={t.common.no} />
            <YesNo label={c.newOnsetDmLabel} value={newOnsetDm} onChange={setNewOnsetDm} yesLabel={t.common.yes} noLabel={t.common.no} />
            <YesNo label={c.ca199Label} value={ca199} onChange={setCa199} yesLabel={t.common.yes} noLabel={t.common.no} />
            <YesNo label={c.rapidGrowthLabel} value={rapidGrowth} onChange={setRapidGrowth} yesLabel={t.common.yes} noLabel={t.common.no} />
          </Card>

          <Card className="space-y-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.previousComparisonTitle}</p>
            <NumberField label={c.previousSizeLabel} value={previousSize} onChange={setPreviousSize} />
            <NumberField label={c.monthsSinceBaselineLabel} value={monthsSinceBaseline} onChange={setMonthsSinceBaseline} />
          </Card>

          <Accordion icon={<IconInfo size={16} />} title={c.extraInfoTitle}>
            <div className="space-y-4">
              <OptionList label={c.calcificationLabel} options={calcificationOptions} value={calcification} onChange={setCalcification} />
              {calcification === 'central' && <InfoBox tone="amber">{c.calcificationCentralNote}</InfoBox>}
              {calcification === 'peripheral' && <InfoBox tone="amber">{c.calcificationPeripheralNote}</InfoBox>}
              <OptionList label={c.locationLabel} options={locationOptions} value={location} onChange={setLocation} />
              {location && <InfoBox tone="amber">{c.locationNote}</InfoBox>}
              <OptionList label={c.sexLabel} options={sexOptions} value={sex} onChange={setSex} />
              <OptionList label={c.morphologyLabel} options={morphologyOptions} value={morphology} onChange={setMorphology} />
            </div>
          </Accordion>

          {suggestions.length > 0 && (
            <Card>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{c.diagnosticSuggestionsTitle}</p>
              <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </Card>
          )}

          {(indeterminateVerdict === 'highrisk' || indeterminateVerdict === 'worrisome') && (
            <Card>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{c.triggersFoundLabel}</p>
              <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
                {[...highRiskTriggers, ...worrisomeTriggers].map((tr, i) => <li key={i}>{tr}</li>)}
              </ul>
            </Card>
          )}

          {(indeterminateVerdict === 'highrisk' || indeterminateVerdict === 'worrisome') && notCandidate && (
            <InfoBox tone="amber">{c.notCandidateNote}</InfoBox>
          )}

          {indeterminateVerdict === 'worrisome' && sizeGe3Alone && (
            <InfoBox tone="amber">{c.sizeGe3Note}</InfoBox>
          )}

          {!hasScheduleInputs && !isHighRisk && !isWorrisome && (
            <InfoBox tone="amber">{needsSurgicalCandidateAnswer && surgicalCandidate === null ? c.surgicalCandidateLabel : (needsMpdComm && hasAge && hasSize ? c.needMpdCommNote : c.needMoreDataNote)}</InfoBox>
          )}

          {indeterminateVerdict === 'routine' && scheduleKey && !notCandidate && (
            <Card className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{c.acrScheduleTitle}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{c[scheduleKey]}</p>
                {acrNextControlResult && (
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 leading-snug pt-1.5">
                    {acrNextControlResult.done ? c.scheduleCompleteNote : c.nextControlEstimate(acrNextControlResult.monthsUntilNext)}
                  </p>
                )}
              </div>
              {chileanKey && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{c.chileanScheduleTitle}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{c[chileanKey]}</p>
                  {chileanNextControlResult && (
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 leading-snug pt-1.5">
                      {chileanNextControlResult.indefinite
                        ? c.chileanNextControlIndefinite
                        : chileanNextControlResult.approxWindow
                        ? c.nextControlEstimateWindow
                        : c.nextControlEstimate(chileanNextControlResult.monthsUntilNext)}
                    </p>
                  )}
                </div>
              )}
              {sizeGe3Alone && <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug pt-1">{c.sizeGe3Note}</p>}
            </Card>
          )}

          {indeterminateVerdict === 'routine' && notCandidate && (
            <InfoBox tone="amber">{c.notCandidateNote}</InfoBox>
          )}
        </>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.pancreaticCyst} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {showResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{smallLabel}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${toneClass}`}>{bigLabel}</span>
            {bigMsg && <span className="text-base font-semibold block mt-2 leading-snug">{bigMsg}</span>}
            {extraNote && <span className="text-sm font-medium block mt-2 leading-snug text-amber-500">{extraNote}</span>}
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

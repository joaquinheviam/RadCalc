import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-sm font-medium transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

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

// Umbrales de tamaño (cm) del algoritmo ACR 2020 (Patel et al., JACR 2020),
// armonizados con el consenso SRU 2019 (Levine et al., Radiology 2019).
// Lógica de clasificación: responsabilidad exclusiva del código, no delegada.
const DEFAULT_THRESHOLD = { pre: 5, post: 3 };
const HIGHER_THRESHOLD = { pre: 7, post: 5 }; // solo aplica si fue "completamente caracterizado por RM dedicada"
const HEMORRHAGIC_THRESHOLD_PRE = 5;

// Resultado del algoritmo de exclusión (Fig 1, nota a).
function gateResultKey(gate) {
  switch (gate) {
    case 'normal': return 'resultNormalDesc';
    case 'calcOnly': return 'resultCalcOnlyDesc';
    case 'previouslyCharacterized': return 'resultPreviouslyCharacterizedDesc';
    case 'stable2y': return 'resultStable2yDesc';
    case 'symptomatic': return 'resultSymptomaticDesc';
    case 'highRisk': return 'resultHighRiskDesc';
    default: return null;
  }
}

const GATE_STICKY = {
  normal: 'stickyNormal',
  calcOnly: 'stickyCalcOnly',
  previouslyCharacterized: 'stickyReferPrevious',
  stable2y: 'stickyStableExcluded',
  symptomatic: 'stickySymptomatic',
  highRisk: 'stickyHighRisk',
};
const GATE_TONE = {
  normal: 'emerald',
  calcOnly: 'emerald',
  previouslyCharacterized: 'slate',
  stable2y: 'emerald',
  symptomatic: 'red',
  highRisk: 'slate',
};

// Subárbol del quiste de aspecto simple (Fig 1, cuerpo central del algoritmo).
// size en cm, menopausalEff: 'pre' | 'post'.
function simpleCystResult(size, menopausalEff, limitedAssessment, fullyCharacterizedMR) {
  const defaultT = DEFAULT_THRESHOLD[menopausalEff];
  if (size <= defaultT) return { key: 'resultNoFurtherImagingDesc', sticky: 'stickyNoFurtherImaging', tone: 'emerald' };

  if (limitedAssessment === true) {
    return { key: 'resultUSCharacterizePromptDesc', sticky: 'stickyCharacterizePrompt', tone: 'amber' };
  }
  if (limitedAssessment === false) {
    if (fullyCharacterizedMR === true) {
      const higherT = HIGHER_THRESHOLD[menopausalEff];
      if (size <= higherT) return { key: 'resultNoFurtherImagingDesc', sticky: 'stickyNoFurtherImaging', tone: 'emerald' };
      return { key: 'resultUSFollowUpDesc', sticky: 'stickyFollowUp', tone: 'amber' };
    }
    if (fullyCharacterizedMR === false) {
      return { key: 'resultUSFollowUpDesc', sticky: 'stickyFollowUp', tone: 'amber' };
    }
  }
  return null; // aún faltan respuestas
}

// Subárbol de entidades con características definitorias (Tabla 1, ACR 2020).
function entityResult(entity, menopausalEff, size) {
  if (entity === 'hemorrhagic') {
    if (menopausalEff === 'post') return { key: 'hemorrhagicPostDesc', sticky: 'stickyCharacterizePrompt', tone: 'amber' };
    if (menopausalEff === 'pre') {
      if (size === '' || size === null) return null;
      return size <= HEMORRHAGIC_THRESHOLD_PRE
        ? { key: 'hemorrhagicPreSmallDesc', sticky: 'stickyNoFurtherImaging', tone: 'emerald' }
        : { key: 'hemorrhagicPreLargeDesc', sticky: 'stickyFollowUp', tone: 'amber' };
    }
    return null;
  }
  if (entity === 'paraovarianGroup') return { key: 'paraovarianGroupDesc', sticky: 'stickyClinicalManagement', tone: 'emerald' };
  if (entity === 'endometriomaDermoid') return { key: 'endometriomaDermoidDesc', sticky: 'stickyGynManaged', tone: 'emerald' };
  if (entity === 'suspectedMalignancy') return { key: 'suspectedMalignancyDesc', sticky: 'stickySuspectedMalignancy', tone: 'red' };
  return null;
}

export default function AdnexalIncidental() {
  const { t } = useLang();
  const c = t.calc.adnexalIncidental;

  const [gate, setGate] = useState(null);

  const [size, setSize] = useState('');
  const [menopausalStatus, setMenopausalStatus] = useState(null); // 'pre' | 'post' | 'unknown'
  const [age, setAge] = useState('');

  const [category, setCategory] = useState(null); // 'simpleCyst' | 'characteristic' | 'uncertain'

  const [limitedAssessment, setLimitedAssessment] = useState(null);
  const [fullyCharacterizedMR, setFullyCharacterizedMR] = useState(null);

  const [entity, setEntity] = useState(null);

  const sizeNum = size === '' ? null : parseFloat(size);
  const ageNum = age === '' ? null : parseFloat(age);

  // Estado menopáusico efectivo: si se desconoce, se usa la edad como
  // subrogado (<50 años = premenopáusica, >=50 años = posmenopáusica),
  // según lo recomendado explícitamente por el ACR 2020.
  let menopausalEff = null;
  if (menopausalStatus === 'pre') menopausalEff = 'pre';
  else if (menopausalStatus === 'post') menopausalEff = 'post';
  else if (menopausalStatus === 'unknown' && ageNum !== null) menopausalEff = ageNum < 50 ? 'pre' : 'post';

  const gateDone = gate !== null;
  const excluded = gate !== null && gate !== 'none';
  const showSizeMenopause = gate === 'none';
  const sizeTooSmall = sizeNum !== null && sizeNum < 1;
  const showCategory = showSizeMenopause && sizeNum !== null && !sizeTooSmall && menopausalEff !== null;
  const aboveDefaultThreshold = menopausalEff !== null && sizeNum !== null && sizeNum > DEFAULT_THRESHOLD[menopausalEff];
  const showSimpleCystQuestions = showCategory && category === 'simpleCyst' && aboveDefaultThreshold;
  const showEntitySelector = showCategory && category === 'characteristic';

  let result = null; // { key, sticky, tone }
  if (excluded) {
    result = { key: gateResultKey(gate), sticky: GATE_STICKY[gate], tone: GATE_TONE[gate] };
  } else if (showSizeMenopause && sizeTooSmall) {
    result = { key: 'sizeTooSmallDesc', sticky: 'stickyTooSmall', tone: 'slate' };
  } else if (category === 'uncertain') {
    result = { key: 'resultCharacterizeDesc', sticky: 'stickyCharacterizePrompt', tone: 'amber' };
  } else if (category === 'simpleCyst' && menopausalEff) {
    result = simpleCystResult(sizeNum, menopausalEff, limitedAssessment, fullyCharacterizedMR);
  } else if (category === 'characteristic' && entity) {
    result = entityResult(entity, menopausalEff, sizeNum);
  }

  const showResult = result !== null;
  const TONE_TEXT = { red: 'text-red-500', amber: 'text-amber-500', emerald: 'text-emerald-500', slate: 'text-slate-500' };

  const handleCopy = () => {
    const lines = [c.title];
    if (sizeNum !== null) lines.push(`${c.sizeLabel}: ${sizeNum} cm`);
    if (result) lines.push('', c[result.key]);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  const resetAll = () => {
    setGate(null); setSize(''); setMenopausalStatus(null); setAge('');
    setCategory(null); setLimitedAssessment(null); setFullyCharacterizedMR(null); setEntity(null);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${showResult ? 'pb-64' : ''}`}>
      <Card className="space-y-4">
        <OptionList
          label={c.gateQ}
          options={[
            { key: 'normal', label: c.gateNormal },
            { key: 'calcOnly', label: c.gateCalcOnly },
            { key: 'previouslyCharacterized', label: c.gatePreviouslyCharacterized },
            { key: 'stable2y', label: c.gateStable2y },
            { key: 'symptomatic', label: c.gateSymptomatic },
            { key: 'highRisk', label: c.gateHighRisk },
            { key: 'none', label: c.gateNone },
          ]}
          value={gate}
          onChange={(v) => { setGate(v); setSize(''); setMenopausalStatus(null); setAge(''); setCategory(null); setLimitedAssessment(null); setFullyCharacterizedMR(null); setEntity(null); }}
        />
      </Card>

      {showSizeMenopause && (
        <Card className="space-y-4">
          <NumberField label={c.sizeLabel} placeholder="Ej: 4" value={size} onChange={setSize} />
          <OptionList
            label={c.menopausalLabel}
            options={[
              { key: 'pre', label: c.menopausalPre },
              { key: 'post', label: c.menopausalPost },
              { key: 'unknown', label: c.menopausalUnknown },
            ]}
            value={menopausalStatus}
            onChange={(v) => { setMenopausalStatus(v); setCategory(null); }}
          />
          {menopausalStatus === 'unknown' && (
            <NumberField label={c.ageLabel} placeholder="Ej: 45" value={age} onChange={setAge} />
          )}
        </Card>
      )}

      {showCategory && (
        <Card className="space-y-4">
          <OptionList
            label={c.categoryLabel}
            options={[
              { key: 'simpleCyst', label: c.categorySimpleCyst },
              { key: 'characteristic', label: c.categoryCharacteristic },
              { key: 'uncertain', label: c.categoryUncertain },
            ]}
            value={category}
            onChange={(v) => { setCategory(v); setLimitedAssessment(null); setFullyCharacterizedMR(null); setEntity(null); }}
          />
        </Card>
      )}

      {showSimpleCystQuestions && (
        <Card className="space-y-4">
          <YesNo label={c.limitedAssessmentQ} value={limitedAssessment} onChange={(v) => { setLimitedAssessment(v); setFullyCharacterizedMR(null); }} yesLabel={t.common.yes} noLabel={t.common.no} />
          {limitedAssessment === false && (
            <YesNo label={c.fullyCharacterizedMRQ} value={fullyCharacterizedMR} onChange={setFullyCharacterizedMR} yesLabel={t.common.yes} noLabel={t.common.no} />
          )}
        </Card>
      )}

      {showEntitySelector && (
        <Card className="space-y-4">
          <OptionList
            label={c.entityLabel}
            options={[
              { key: 'hemorrhagic', label: c.entityHemorrhagic },
              { key: 'paraovarianGroup', label: c.entityParaovarianGroup },
              { key: 'endometriomaDermoid', label: c.entityEndometriomaDermoid },
              { key: 'suspectedMalignancy', label: c.entitySuspectedMalignancy },
            ]}
            value={entity}
            onChange={setEntity}
          />
        </Card>
      )}

      {result && (
        <InfoBox tone={result.tone}>{c[result.key]}</InfoBox>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.adnexalIncidental} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {result && (
        <StickyBar>
          <div className="min-w-0 w-full text-center space-y-1.5">
            <div className="text-xs text-slate-500 dark:text-slate-400">{c.stickyLabel}</div>
            <div className={`text-lg font-black leading-tight ${TONE_TEXT[result.tone]}`}>{c[result.sticky]}</div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">{c.stickySeeMoreHint}</div>
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

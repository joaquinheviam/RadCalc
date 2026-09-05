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

  const [diagnosis, setDiagnosis] = useState('indeterminate'); // 'indeterminate' | 'sca' | 'pseudocyst'
  const [size, setSize] = useState('');
  const [symptomatic, setSymptomatic] = useState(null); // true | false | null
  const [age, setAge] = useState('');
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

  const hSize = parseFloat(size);
  const hAge = parseFloat(age);
  const hMpdSize = parseFloat(mpdSize);
  const hasSize = !isNaN(hSize);
  const hasAge = !isNaN(hAge);
  const hasMpdSize = !isNaN(hMpdSize);

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
  const isWorrisome = worrisomeTriggers.length > 0;

  const needsMpdComm = hasSize && hSize >= 1.5 && hSize <= 2.5;
  const hasScheduleInputs = hasAge && hasSize && (!needsMpdComm || mpdComm !== null);

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

  // Nota especial ACR: tamaño >=3cm por sí solo (sin otras características) no obliga a EUS-FNA.
  const sizeGe3Alone = hasSize && hSize >= 3 && !isHighRisk && !isWorrisome;

  const indeterminateVerdict = isHighRisk ? 'highrisk' : isWorrisome ? 'worrisome' : (scheduleKey ? 'routine' : null);

  const mpdCommLabelText = mpdComm === 'established' ? c.mpdCommEstablished : mpdComm === 'absent' ? c.mpdCommAbsent : null;

  const diagnosisLabelText = diagnosis === 'sca' ? c.diagnosisSca : diagnosis === 'pseudocyst' ? c.diagnosisPseudocyst : c.diagnosisIndeterminate;

  // ---- Veredicto global (para StickyBar / copia de informe) ----
  let bigLabel = null, bigTone = null, bigMsg = null;
  if (diagnosis === 'sca') {
    const scaHighSize = hasSize && hSize > 4;
    bigLabel = c.scaVerdictBig;
    bigTone = scaHighSize ? 'amber' : 'emerald';
    bigMsg = scaHighSize ? c.scaSurgical : c.scaNoFollowup;
  } else if (diagnosis === 'pseudocyst') {
    bigLabel = c.pseudocystVerdictBig;
    bigTone = 'slate';
    bigMsg = c.pseudocystNote;
  } else if (symptomatic === true) {
    bigLabel = c.exclusionStopTitle;
    bigTone = 'red';
    bigMsg = c.exclusionStop;
  } else if (symptomatic === false) {
    if (indeterminateVerdict === 'highrisk') { bigLabel = c.highRiskVerdictBig; bigTone = 'red'; bigMsg = c.highRiskMsg; }
    else if (indeterminateVerdict === 'worrisome') { bigLabel = c.worrisomeVerdictBig; bigTone = 'amber'; bigMsg = c.worrisomeMsg; }
    else if (indeterminateVerdict === 'routine') { bigLabel = c.routineVerdictBig; bigTone = 'emerald'; bigMsg = c.routineMsg; }
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
        if (indeterminateVerdict === 'routine' && scheduleKey) {
          lines.push(c.reportLineSchedule(c[scheduleKey]));
          if (chileanKey) lines.push(c.reportLineChilean(c[chileanKey]));
        }
        if (bigMsg) lines.push(c.reportConclusion(bigLabel + ' — ' + bigMsg));
      }
    } else if (bigMsg) {
      lines.push(c.reportConclusion(bigMsg));
    }
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  const resetAll = () => {
    setDiagnosis('indeterminate'); setSize(''); setSymptomatic(null); setAge('');
    setMpdComm(null); setMpdSize(''); setNodule('none'); setWallThickening(false);
    setJaundice(false); setCytology(false); setPancreatitis(false); setNewOnsetDm(false);
    setCa199(false); setRapidGrowth(false); setCalcification('none'); setLocation(null);
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
          ]}
          value={diagnosis}
          onChange={setDiagnosis}
        />
      </Card>

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

          <Accordion icon={<IconInfo size={16} />} title={c.extraInfoTitle}>
            <div className="space-y-4">
              <OptionList label={c.calcificationLabel} options={calcificationOptions} value={calcification} onChange={setCalcification} />
              {calcification === 'central' && <InfoBox tone="amber">{c.calcificationCentralNote}</InfoBox>}
              {calcification === 'peripheral' && <InfoBox tone="amber">{c.calcificationPeripheralNote}</InfoBox>}
              <OptionList label={c.locationLabel} options={locationOptions} value={location} onChange={setLocation} />
              {location && <InfoBox tone="amber">{c.locationNote}</InfoBox>}
            </div>
          </Accordion>

          {(indeterminateVerdict === 'highrisk' || indeterminateVerdict === 'worrisome') && (
            <Card>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{c.triggersFoundLabel}</p>
              <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
                {[...highRiskTriggers, ...worrisomeTriggers].map((tr, i) => <li key={i}>{tr}</li>)}
              </ul>
            </Card>
          )}

          {indeterminateVerdict === 'worrisome' && sizeGe3Alone && (
            <InfoBox tone="amber">{c.sizeGe3Note}</InfoBox>
          )}

          {!hasScheduleInputs && !isHighRisk && !isWorrisome && (
            <InfoBox tone="amber">{needsMpdComm && hasAge && hasSize ? c.needMpdCommNote : c.needMoreDataNote}</InfoBox>
          )}

          {indeterminateVerdict === 'routine' && scheduleKey && (
            <Card className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{c.acrScheduleTitle}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{c[scheduleKey]}</p>
              </div>
              {chileanKey && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{c.chileanScheduleTitle}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{c[chileanKey]}</p>
                </div>
              )}
              {sizeGe3Alone && <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug pt-1">{c.sizeGe3Note}</p>}
            </Card>
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
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{diagnosisLabelText}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${toneClass}`}>{bigLabel}</span>
            {bigMsg && <span className="text-base font-semibold block mt-2 leading-snug">{bigMsg}</span>}
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

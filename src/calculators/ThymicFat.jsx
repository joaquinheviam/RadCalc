import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconGitBranch, IconArrowRight, IconChevronLeft, IconRefresh, IconInfo } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion } from '../components/shared/index.js';

// SII > 8.92% (Priola et al., Radiology 2015): 100% sensibilidad/especificidad
// para hiperplasia tímica / timo normal; no requiere tejido de referencia y no
// se ve afectado por edad/IMC. Por eso el SII es la métrica que prevalece.
// CSR < 0.70 / > 1.00 (Inaoka et al., Radiology 2007): puntos de corte
// clásicos para hiperplasia/timo normal vs. neoplasia; el rango 0.70-1.00 se
// trata como zona indeterminada, ya que la señal del músculo paraespinal de
// referencia varía con la edad y el IMC del paciente (Priola et al. 2015).
// Ver src/i18n/strings.*.js -> calc.thymic.usage para el detalle completo.
const SII_CUTOFF = 8.92;
const CSR_LOW = 0.70;
const CSR_HIGH = 1.00;

// Corte nT2 (señal T2 lesión / señal T2 LCR) de Hwang et al. 2019, mismo
// paper y misma cohorte que el nADC de más arriba. Ver src/i18n/strings.*.js
// -> calc.thymic.greenish.adc.t2* para el detalle verificado contra el PDF.
const NT2_CUTOFF = 0.39;

// Cortes de ADC para la estimación de agresividad en lesión sólida (4
// fuentes primarias independientes, leídas completas y verificadas contra
// el texto original). No se fusionan en un único número porque los propios
// estudios no coinciden entre sí — mismo criterio que los 4 marcos de VDT.
// Ver src/i18n/strings.*.js -> calc.thymic.aggressive para el detalle.
const RISK_ABDELRAZEK_CUTOFF = 1.22; // ADC medio, LRT vs HRT+TC (Abdel Razek 2014)
const RISK_SHEN_CUTOFF = 1.193; // ADC medio, LRT vs HRT+TC (Shen 2022)
const RISK_THUY_CUTOFF = 0.82; // ADC medio, LRT vs HRT+NT (Thuy 2022)
const STAGE_SHEN_CUTOFF = 1.033; // ADC medio, temprano vs avanzado (Shen 2022)
const STAGE_LAN_CUTOFF = 1.18; // ADCmin, temprano vs avanzado (Lan 2025)
const THYMOMA_VS_TC_LAN_CUTOFF = 1.14; // ADCmin, timoma (cualquier riesgo) vs carcinoma (Lan 2025)
const HRT_VS_TC_LAN_CUTOFF = 0.98; // ADCmin, timoma alto riesgo vs carcinoma (Lan 2025)

const OPTION_BTN =
  'w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-800 dark:hover:bg-blue-900/30 transition-colors flex justify-between items-center';

function GreenishTriage({ g }) {
  const [step, setStep] = useState('q1'); // q1 | q2 | cyst | complex | proceed
  const [showAdc, setShowAdc] = useState(false);
  const [adcLesion, setAdcLesion] = useState('');
  const [adcCsf, setAdcCsf] = useState('');
  const [t2Lesion, setT2Lesion] = useState('');
  const [t2Csf, setT2Csf] = useState('');
  const aLesion = parseFloat(adcLesion);
  const aCsf = parseFloat(adcCsf);
  const hasAdc = !isNaN(aLesion) && !isNaN(aCsf) && aCsf !== 0;
  const nadc = hasAdc ? aLesion / aCsf : null;
  const nadcFavorsCyst = nadc !== null ? nadc > 0.63 : null;

  const tLesion = parseFloat(t2Lesion);
  const tCsf = parseFloat(t2Csf);
  const hasT2 = !isNaN(tLesion) && !isNaN(tCsf) && tCsf !== 0;
  const nt2 = hasT2 ? tLesion / tCsf : null;
  const nt2FavorsCyst = nt2 !== null ? nt2 > NT2_CUTOFF : null;

  const reset = () => {
    setStep('q1');
    setShowAdc(false);
    setAdcLesion('');
    setAdcCsf('');
    setT2Lesion('');
    setT2Csf('');
  };

  const resultMap = {
    cyst: { tone: 'emerald', title: g.resultSimpleCystTitle, text: g.resultSimpleCystText },
    complex: { tone: 'amber', title: g.resultComplexCysticTitle, text: g.resultComplexCysticText },
    proceed: { tone: 'slate', title: g.resultProceedTitle, text: g.resultProceedText },
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">{g.intro}</p>

      {step === 'q1' && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{g.q1}</h4>
          <button className={OPTION_BTN} onClick={() => setStep('q2')}>
            <span>{g.q1Yes}</span>
            <IconArrowRight size={16} className="text-slate-400 shrink-0 ml-2" />
          </button>
          <button className={OPTION_BTN} onClick={() => setStep('proceed')}>
            <span>{g.q1No}</span>
            <IconArrowRight size={16} className="text-slate-400 shrink-0 ml-2" />
          </button>

          <div className="pt-1">
            <button
              onClick={() => setShowAdc((v) => !v)}
              className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
            >
              <IconInfo size={14} />
              {showAdc ? g.adc.toggleHide : g.adc.toggleShow}
            </button>
            {showAdc && (
              <div className="mt-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">{g.adc.intro}</p>
                <div className="grid grid-cols-2 gap-3">
                  <NumberField small label={g.adc.lesionLabel} value={adcLesion} onChange={setAdcLesion} />
                  <NumberField small label={g.adc.csfLabel} value={adcCsf} onChange={setAdcCsf} />
                </div>
                {hasAdc && (
                  <div className="space-y-2">
                    <div className="text-center">
                      <span className="block text-xs text-slate-500 mb-1">{g.adc.resultLabel}</span>
                      <span className={`text-xl font-bold ${nadcFavorsCyst ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {nadc.toFixed(2)}
                      </span>
                    </div>
                    <InfoBox tone={nadcFavorsCyst ? 'emerald' : 'amber'}>
                      <span className="block font-semibold mb-1">
                        {nadcFavorsCyst ? g.adc.favorsCystTitle : g.adc.favorsSolidTitle}
                      </span>
                      {nadcFavorsCyst ? g.adc.favorsCystText : g.adc.favorsSolidText}
                    </InfoBox>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{g.adc.t2Intro}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField small label={g.adc.t2LesionLabel} value={t2Lesion} onChange={setT2Lesion} />
                    <NumberField small label={g.adc.t2CsfLabel} value={t2Csf} onChange={setT2Csf} />
                  </div>
                  {hasT2 && (
                    <div className="space-y-2">
                      <div className="text-center">
                        <span className="block text-xs text-slate-500 mb-1">{g.adc.t2ResultLabel}</span>
                        <span className={`text-xl font-bold ${nt2FavorsCyst ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {nt2.toFixed(2)}
                        </span>
                      </div>
                      <InfoBox tone={nt2FavorsCyst ? 'emerald' : 'amber'}>
                        {nt2FavorsCyst ? g.adc.t2FavorsCystText : g.adc.t2FavorsSolidText}
                      </InfoBox>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'q2' && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{g.q2}</h4>
          <button className={OPTION_BTN} onClick={() => setStep('cyst')}>
            <span>{g.q2No}</span>
            <IconArrowRight size={16} className="text-slate-400 shrink-0 ml-2" />
          </button>
          <button className={OPTION_BTN} onClick={() => setStep('complex')}>
            <span>{g.q2Yes}</span>
            <IconArrowRight size={16} className="text-slate-400 shrink-0 ml-2" />
          </button>
          <button onClick={() => setStep('q1')} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
            <IconChevronLeft size={14} />{g.back}
          </button>
        </div>
      )}

      {(step === 'cyst' || step === 'complex' || step === 'proceed') && (
        <div className="space-y-3">
          <InfoBox tone={resultMap[step].tone}>
            <span className="block font-semibold mb-1">{resultMap[step].title}</span>
            {resultMap[step].text}
          </InfoBox>
          <button onClick={reset} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <IconRefresh size={14} />{g.restart}
          </button>
        </div>
      )}
    </div>
  );
}

function CutoffBox({ title, value, cutoff, belowText, aboveText }) {
  const below = value < cutoff;
  return (
    <InfoBox tone={below ? 'amber' : 'emerald'}>
      <span className="block font-semibold mb-1">{title}</span>
      {below ? belowText : aboveText}
    </InfoBox>
  );
}

function AggressiveAdc({ a }) {
  const [adcMean, setAdcMean] = useState('');
  const [adcMin, setAdcMin] = useState('');
  const mean = parseFloat(adcMean);
  const min = parseFloat(adcMin);
  const hasMean = !isNaN(mean);
  const hasMin = !isNaN(min);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">{a.intro}</p>

      <div className="grid grid-cols-2 gap-3">
        <NumberField small label={a.adcMeanLabel} value={adcMean} onChange={setAdcMean} />
        <NumberField small label={a.adcMinLabel} value={adcMin} onChange={setAdcMin} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{a.adcMeanHint}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{a.adcMinHint}</p>

      {!hasMean && !hasMin && (
        <p className="text-xs italic text-slate-400 dark:text-slate-500">{a.emptyHint}</p>
      )}

      {hasMean && (
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.axis1Title}</h5>
          <CutoffBox title={a.abdelRazekTitle} value={mean} cutoff={RISK_ABDELRAZEK_CUTOFF} belowText={a.abdelRazekBelowText} aboveText={a.abdelRazekAboveText} />
          <CutoffBox title={a.shenRiskTitle} value={mean} cutoff={RISK_SHEN_CUTOFF} belowText={a.shenRiskBelowText} aboveText={a.shenRiskAboveText} />
          <CutoffBox title={a.thuyTitle} value={mean} cutoff={RISK_THUY_CUTOFF} belowText={a.thuyBelowText} aboveText={a.thuyAboveText} />
        </div>
      )}

      {(hasMean || hasMin) && (
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.axis2Title}</h5>
          {hasMean && (
            <CutoffBox title={a.shenStageTitle} value={mean} cutoff={STAGE_SHEN_CUTOFF} belowText={a.shenStageBelowText} aboveText={a.shenStageAboveText} />
          )}
          {hasMin && (
            <CutoffBox title={a.lanStageTitle} value={min} cutoff={STAGE_LAN_CUTOFF} belowText={a.lanStageBelowText} aboveText={a.lanStageAboveText} />
          )}
        </div>
      )}

      {hasMin && (
        <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-2">
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.axis3Title}</h5>
          <p className="text-[11px] italic text-amber-600 dark:text-amber-400">{a.axis3SingleStudyWarning}</p>
          <CutoffBox title={a.lanThymomaVsTcTitle} value={min} cutoff={THYMOMA_VS_TC_LAN_CUTOFF} belowText={a.lanThymomaVsTcBelowText} aboveText={a.lanThymomaVsTcAboveText} />
          <CutoffBox title={a.lanHrtVsTcTitle} value={min} cutoff={HRT_VS_TC_LAN_CUTOFF} belowText={a.lanHrtVsTcBelowText} aboveText={a.lanHrtVsTcAboveText} />
        </div>
      )}

      <InfoBox tone="slate">{a.generalCaveat}</InfoBox>
    </div>
  );
}

export default function ThymicFat() {
  const { t, lang } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.thymic;
  const [thymusIn, setThymusIn] = useState('');
  const [thymusOut, setThymusOut] = useState('');
  const [muscleIn, setMuscleIn] = useState('');
  const [muscleOut, setMuscleOut] = useState('');
  const tIn = parseFloat(thymusIn);
  const tOut = parseFloat(thymusOut);
  const mIn = parseFloat(muscleIn);
  const mOut = parseFloat(muscleOut);

  // El SII solo necesita el ROI del timo. El CSR además necesita el ROI de
  // músculo paraespinal (ahora opcional: se agrega como dato complementario
  // en cuanto está disponible, sin bloquear el resultado del SII).
  const isThymusValid = !isNaN(tIn) && !isNaN(tOut) && tIn !== 0;
  const hasMuscle = !isNaN(mIn) && !isNaN(mOut) && mIn !== 0;
  const isValid = isThymusValid;

  const sii = isThymusValid ? ((tIn - tOut) / tIn) * 100 : 0;
  const csr = isThymusValid && hasMuscle ? (tOut / tIn) / (mOut / mIn) : null;

  const siiBenign = sii > SII_CUTOFF;

  // CSR de 3 zonas (Inaoka 2007) solo se evalúa si hay ROI de músculo. El SII
  // siempre prevalece cuando hay discordancia (Priola 2015) — ver constantes
  // más arriba y calc.thymic.usage para el detalle de cada escenario.
  let csrZone = null; // 'benign' | 'indet' | 'malignant'
  if (csr !== null) {
    if (csr < CSR_LOW) csrZone = 'benign';
    else if (csr <= CSR_HIGH) csrZone = 'indet';
    else csrZone = 'malignant';
  }

  // Escenario final: 1-5 según la tabla de decisión (SII x CSR), o 'siiOnly'
  // cuando no hay ROI de músculo disponible.
  let scenario = 'siiOnly';
  if (csrZone !== null) {
    if (siiBenign) {
      scenario = csrZone === 'benign' ? 1 : csrZone === 'indet' ? 2 : 3;
    } else {
      scenario = csrZone === 'malignant' ? 4 : 5;
    }
  }

  const scenarioMap = isThymusValid ? {
    1: { tone: 'emerald', title: c.scenario1Title, text: c.scenario1Text, note: null },
    2: { tone: 'emerald', title: c.scenario2Title, text: c.scenario2Text, note: c.scenario2Note },
    3: { tone: 'amber', title: c.scenario3Title, text: c.scenario3Text, note: c.scenario3Note },
    4: { tone: 'red', title: c.scenario4Title, text: c.scenario4Text, note: null },
    5: { tone: 'red', title: c.scenario5Title, text: c.scenario5Text, note: c.scenario5Note },
    siiOnly: siiBenign
      ? { tone: 'emerald', title: c.scenarioSiiOnlyBenignTitle, text: c.conclFatty, note: null }
      : { tone: 'amber', title: c.scenarioSiiOnlyMalignantTitle, text: c.conclNotFatty, note: null },
  } : null;

  const result = scenarioMap ? scenarioMap[scenario] : null;

  const getReportText = () => {
    if (!result) return;
    const text = c.reportText(
      thymusIn,
      thymusOut,
      muscleIn,
      muscleOut,
      csr !== null ? csr.toFixed(3) : null,
      sii.toFixed(1),
      result.title
    );
    return text;
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setThymusIn(''); setThymusOut(''); setMuscleIn(''); setMuscleOut(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${isValid ? 'pb-56' : ''}`}>
      <Accordion icon={<IconGitBranch size={16} />} title={c.greenish.sectionTitle}>
        <GreenishTriage g={c.greenish} />
      </Accordion>

      <Accordion icon={<IconGitBranch size={16} />} title={c.aggressive.sectionTitle}>
        <AggressiveAdc a={c.aggressive} />
      </Accordion>

      <Card className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">{c.roiThymus}</h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberField small label={c.inPhase} value={thymusIn} onChange={setThymusIn} />
            <NumberField small label={c.outPhase} value={thymusOut} onChange={setThymusOut} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 border-b border-slate-100 dark:border-slate-700 pb-2">{c.roiMuscle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.muscleOptionalHint}</p>
          <div className="grid grid-cols-2 gap-3">
            <NumberField small label={c.inPhase} value={muscleIn} onChange={setMuscleIn} />
            <NumberField small label={c.outPhase} value={muscleOut} onChange={setMuscleOut} />
          </div>
        </div>
      </Card>

      {isValid && result && (
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <span className="block text-xs text-slate-500 mb-1">{c.ratioCsr}</span>
              {csr !== null ? (
                <span className={`text-2xl font-bold ${csrZone === 'benign' ? 'text-emerald-500' : csrZone === 'indet' ? 'text-amber-500' : 'text-red-500'}`}>{csr.toFixed(2)}</span>
              ) : (
                <span className="block text-xs text-slate-400 dark:text-slate-500 italic pt-2">{c.csrPending}</span>
              )}
            </div>
            <div className="text-center">
              <span className="block text-xs text-slate-500 mb-1">{c.indexSii}</span>
              <span className={`text-2xl font-bold ${siiBenign ? 'text-emerald-500' : 'text-red-500'}`}>{sii.toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <InfoBox tone={result.tone}>
              <span className="block font-semibold mb-1">{result.title}</span>
              {result.text}
            </InfoBox>
            {result.note && <InfoBox tone="slate">{result.note}</InfoBox>}
          </div>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.thymic} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {isValid && result && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.indexSii}</span>
            <span className={`text-4xl font-black block ${siiBenign ? 'text-emerald-500' : 'text-red-500'}`}>{sii.toFixed(1)}%</span>
            <span className={`text-base font-semibold block mt-1 ${result.tone === 'red' ? 'text-red-500' : result.tone === 'amber' ? 'text-amber-500' : 'text-emerald-500'}`}>{result.title}</span>
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

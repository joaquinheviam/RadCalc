import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconGitBranch, IconArrowRight, IconChevronLeft, IconRefresh, IconInfo } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion } from '../components/shared/index.js';

// Puntos de corte validados por Priola et al. (Radiology 2015): SII > 8.92%
// y CSR <= 0.849 son compatibles con hiperplasia tímica / timo normal.
// Zona gris de CSR descrita entre 0.849 y 0.896 (superposición solo en
// adultos jóvenes). Ver src/i18n/strings.*.js -> calc.thymic.usage para el
// detalle completo verificado contra las 4 fuentes primarias.
const SII_CUTOFF = 8.92;
const CSR_CUTOFF = 0.849;
const CSR_GREY_MAX = 0.896;

const OPTION_BTN =
  'w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-800 dark:hover:bg-blue-900/30 transition-colors flex justify-between items-center';

function GreenishTriage({ g }) {
  const [step, setStep] = useState('q1'); // q1 | q2 | cyst | complex | proceed
  const [showAdc, setShowAdc] = useState(false);
  const [adcLesion, setAdcLesion] = useState('');
  const [adcCsf, setAdcCsf] = useState('');
  const aLesion = parseFloat(adcLesion);
  const aCsf = parseFloat(adcCsf);
  const hasAdc = !isNaN(aLesion) && !isNaN(aCsf) && aCsf !== 0;
  const nadc = hasAdc ? aLesion / aCsf : null;
  const nadcFavorsCyst = nadc !== null ? nadc > 0.63 : null;

  const reset = () => {
    setStep('q1');
    setShowAdc(false);
    setAdcLesion('');
    setAdcCsf('');
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

export default function ThymicFat() {
  const { t, lang } = useLang();
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

  const siiFatty = sii > SII_CUTOFF;
  const csrFatty = csr !== null ? csr <= CSR_CUTOFF : null;
  const csrGreyZone = csr !== null && csr > CSR_CUTOFF && csr <= CSR_GREY_MAX;
  const isFatty = siiFatty || csrFatty === true;

  const handleCopy = () => {
    const text = c.reportText(
      thymusIn,
      thymusOut,
      muscleIn,
      muscleOut,
      csr !== null ? csr.toFixed(3) : null,
      sii.toFixed(1),
      isFatty ? c.conclFatty : c.conclNotFatty
    );
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setThymusIn(''); setThymusOut(''); setMuscleIn(''); setMuscleOut(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${isValid ? 'pb-56' : ''}`}>
      <Accordion icon={<IconGitBranch size={16} />} title={c.greenish.sectionTitle}>
        <GreenishTriage g={c.greenish} />
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

      {isValid && (
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <span className="block text-xs text-slate-500 mb-1">{c.ratioCsr}</span>
              {csr !== null ? (
                <span className={`text-2xl font-bold ${csrFatty ? 'text-emerald-500' : 'text-amber-500'}`}>{csr.toFixed(2)}</span>
              ) : (
                <span className="block text-xs text-slate-400 dark:text-slate-500 italic pt-2">{c.csrPending}</span>
              )}
            </div>
            <div className="text-center">
              <span className="block text-xs text-slate-500 mb-1">{c.indexSii}</span>
              <span className={`text-2xl font-bold ${siiFatty ? 'text-emerald-500' : 'text-amber-500'}`}>{sii.toFixed(1)}%</span>
            </div>
          </div>
          {csrGreyZone && !siiFatty && (
            <div className="mt-3">
              <InfoBox tone="amber">{c.greyZoneWarning}</InfoBox>
            </div>
          )}
          <div className="mt-3">
            <InfoBox tone={isFatty ? 'emerald' : 'amber'}>
              {isFatty ? c.fattyConcl : c.notFattyConcl}
            </InfoBox>
          </div>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.thymic} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {isValid && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.indexSii}</span>
            <span className={`text-4xl font-black block ${siiFatty ? 'text-emerald-500' : 'text-amber-500'}`}>{sii.toFixed(1)}%</span>
            <span className={`text-base font-semibold block mt-1 ${isFatty ? 'text-emerald-500' : 'text-amber-500'}`}>{isFatty ? c.fattyConcl : c.notFattyConcl}</span>
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

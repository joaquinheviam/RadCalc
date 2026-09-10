import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, ScoreSelector5, Accordion, AlgorithmSchema } from '../components/shared/index.js';
import { IconGitBranch } from '../components/icons/index.js';

// Mirrors the algo-mode goToNextStep() branching verbatim (algoStep/preguntaGrasa/
// preguntaTamano/preguntaTallo). The "classic" per-sequence mode is a dominance
// lookup (DWI, else DCE, else T2W), not a branching tree, so it is intentionally
// not represented here.
function buildViradsAlgoTree(c) {
  const leaf = (score) => `VI-RADS ${score} — ${c.categoryDesc[score - 1]}`;
  return {
    q: c.algoQ1,
    branches: [
      { label: c.algoQ1Yes, node: { q: c.algoQFat, branches: [
        { label: c.algoQFatYes, leaf: leaf(5) },
        { label: c.algoQFatNo, leaf: leaf(4) },
      ]}},
      { label: c.algoQ1No, node: { q: c.algoQSize, branches: [
        { label: c.algoQSizeYes, leaf: leaf(1) },
        { label: c.algoQSizeNo, node: { q: c.algoQStalk, branches: [
          { label: c.algoQStalkYes, leaf: leaf(2) },
          { label: c.algoQStalkNo, leaf: leaf(3) },
        ]}},
      ]}},
    ],
  };
}

// SVG nativo consistente con la línea de íconos del sistema
const RefreshIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const GitForkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7a3 3 0 100-6 3 3 0 000 6zM16 7a3 3 0 100-6 3 3 0 000 6zM12 21a3 3 0 100-6 3 3 0 000 6zM12 15V9m0 0a3 3 0 013-3h1m-4 3a3 3 0 00-3-3H9" />
  </svg>
);

const LayersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0l-7 7m7-7l-7-7M5 11l7 7m-7-7l7-7" />
  </svg>
);

export default function VIRADS() {
  const { t } = useLang();
  const c = t.calc.virads;
  const algorithmTree = buildViradsAlgoTree(c);

  const [mode, setMode] = useState('algo');

  // Estado del modo algorítmico (árbol de decisión) + historial para "volver"
  const [algoStep, setAlgoStep] = useState(1);
  const [algoResult, setAlgoResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Estado del modo clásico por secuencias (ACR)
  const [t2, setT2] = useState(0);
  const [dwi, setDwi] = useState(0);
  const [dce, setDce] = useState(0);

  const goToNextStep = (nextStep, result = null) => {
    setHistory((prev) => [...prev, { step: algoStep, result: algoResult }]);
    if (result !== null) {
      setAlgoResult(result);
    } else {
      setAlgoStep(nextStep);
    }
  };

  const handleGoBack = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setAlgoStep(lastState.step);
    setAlgoResult(lastState.result);
  };

  const resetAll = () => {
    setAlgoStep(1);
    setAlgoResult(null);
    setHistory([]);
    setT2(0);
    setDwi(0);
    setDce(0);
  };

  // Regla de dominancia clásica: DWI domina, si no está puntuado se usa DCE, si no T2W.
  const classicCategory = dwi > 0 ? dwi : (dce > 0 ? dce : t2);
  const final = mode === 'algo' ? algoResult : (classicCategory > 0 ? classicCategory : null);

  let interp = '';
  if (final >= 4) interp = c.interpretation.high;
  else if (final === 3) interp = c.interpretation.equivocal;
  else if (final > 0) interp = c.interpretation.low;

  const handleCopy = () => {
    if (!final) return;
    const text = mode === 'classic'
      ? c.reportText(t2 || t.common.notEvaluated, dwi || t.common.notEvaluated, dce || t.common.notEvaluated, final)
      : `${c.algoTitle}\n${c.finalCategory}: VI-RADS ${final}\n${c.categoryDesc[final - 1]}`;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${final > 0 ? 'pb-56' : ''}`}>
      {/* Selector de modo */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setMode('algo')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            mode === 'algo'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/50'
          }`}
        >
          <GitForkIcon />
          {c.modeAlgo}
        </button>
        <button
          type="button"
          onClick={() => setMode('classic')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            mode === 'classic'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/50'
          }`}
        >
          <LayersIcon />
          {c.modeClassic}
        </button>
      </div>

      {/* MODO 1: ALGORÍTMICO */}
      {mode === 'algo' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{c.algoTitle}</h3>
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
          </div>

          {!algoResult ? (
            <div className="space-y-4">
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600/70 transition-all"
                >
                  <BackIcon />
                  <span>{c.backStep}</span>
                </button>
              )}

              {algoStep === 1 && (
                <div className="space-y-3">
                  <p className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-relaxed">{c.algoQ1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => goToNextStep('preguntaGrasa')} className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-white font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-600 hover:border-blue-500 text-sm">
                      {c.algoQ1Yes}
                    </button>
                    <button type="button" onClick={() => goToNextStep('preguntaTamano')} className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-white font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-600 hover:border-blue-500 text-sm">
                      {c.algoQ1No}
                    </button>
                  </div>
                </div>
              )}

              {algoStep === 'preguntaGrasa' && (
                <div className="space-y-3">
                  <p className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-relaxed">{c.algoQFat}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => goToNextStep(null, 5)} className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-red-600 hover:text-white text-slate-700 dark:text-white font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-600 hover:border-red-500 text-sm">
                      {c.algoQFatYes}
                    </button>
                    <button type="button" onClick={() => goToNextStep(null, 4)} className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-orange-600 hover:text-white text-slate-700 dark:text-white font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-600 hover:border-orange-500 text-sm">
                      {c.algoQFatNo}
                    </button>
                  </div>
                </div>
              )}

              {algoStep === 'preguntaTamano' && (
                <div className="space-y-3">
                  <p className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-relaxed">{c.algoQSize}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => goToNextStep(null, 1)} className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-white font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-600 hover:border-emerald-500 text-sm">
                      {c.algoQSizeYes}
                    </button>
                    <button type="button" onClick={() => goToNextStep('preguntaTallo')} className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-white font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-600 hover:border-blue-500 text-sm">
                      {c.algoQSizeNo}
                    </button>
                  </div>
                </div>
              )}

              {algoStep === 'preguntaTallo' && (
                <div className="space-y-3">
                  <p className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-relaxed">{c.algoQStalk}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => goToNextStep(null, 2)} className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-green-600 hover:text-white text-slate-700 dark:text-white font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-600 hover:border-green-500 text-sm">
                      {c.algoQStalkYes}
                    </button>
                    <button type="button" onClick={() => goToNextStep(null, 3)} className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-amber-600 hover:text-white text-slate-700 dark:text-white font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-600 hover:border-amber-500 text-sm">
                      {c.algoQStalkNo}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700/50">
              <span className="text-xs text-slate-500 dark:text-slate-400">{c.algoCompleted}</span>
              <button type="button" onClick={handleGoBack} className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                <BackIcon />
                <span>{c.modifySelection}</span>
              </button>
            </div>
          )}
        </Card>
      )}

      {/* MODO 2: SECUENCIAS (ACR CLÁSICO) */}
      {mode === 'classic' && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{c.modeClassic}</h3>
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
          </div>
          <ScoreSelector5 label={c.step1} value={t2} onChange={setT2} defs={c.t2Defs} />
          <ScoreSelector5 label={c.step2} value={dwi} onChange={setDwi} defs={c.dwiDefs} />
          <ScoreSelector5 label={c.step3} value={dce} onChange={setDce} defs={c.dceDefs} />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{c.dominantNote}</p>
        </Card>
      )}

      {final > 0 && (
        <InfoBox tone={final >= 4 ? 'amber' : final === 3 ? 'amber' : 'emerald'}>
          {mode === 'classic' ? interp : c.categoryDesc[final - 1]}
        </InfoBox>
      )}

      <UsageNotes paragraphs={c.usage} />
      <Accordion icon={<IconGitBranch size={16} />} title={t.common.viewFullAlgorithm}>
        <AlgorithmSchema tree={algorithmTree} />
      </Accordion>
      <References items={REFERENCES.virads} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {final > 0 && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{mode === 'algo' ? c.categoryLabel : c.finalCategory}</span>
            <span className={`text-4xl font-black block mt-1 ${final >= 4 ? 'text-red-500' : final === 3 ? 'text-amber-500' : 'text-emerald-500'}`}>VI-RADS {final}</span>
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

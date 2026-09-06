import React, { useState } from 'react';

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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7a3 3 0 100-6 3 3 0 000 6pt0 000 6zM16 7a3 3 0 100-6 3 3 0 000 6pt0 000 6zM12 21a3 3 0 100-6 3 3 0 000 6pt0 000 6zM12 15V9m0 0a3 3 0 013-3h1m-4 3a3 3 0 00-3-3H9" />
  </svg>
);

const LayersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0l-7 7m7-7l-7-7M5 11l7 7m-7-7l7-7" />
  </svg>
);

export default function VIRADS({ strings, lang = 'es' }) {
  const [mode, setMode] = useState('algo');

  // Estado Algorítmico e Historial
  const [algoStep, setAlgoStep] = useState(1);
  const [algoResult, setAlgoResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Estado Modo Clásico
  const [t2w, setT2w] = useState(null);
  const [dwi, setDwi] = useState(null);
  const [dce, setDce] = useState(null);

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

  const resetAlgo = () => {
    setAlgoStep(1);
    setAlgoResult(null);
    setHistory([]);
  };

  const resetClassic = () => {
    setT2w(null);
    setDwi(null);
    setDce(null);
  };

  const getClassicCategory = () => {
    if (dwi) return dwi;
    if (dce) return dce;
    if (t2w) return t2w;
    return null;
  };

  const currentCategory = mode === 'algo' ? algoResult : getClassicCategory();

  const categoryDetails = {
    1: {
      title: 'VI-RADS 1',
      desc: 'Invasión muscular extremadamente improbable. Tumor superficial (< 1 cm) o muscular propia completamente intacta.',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    2: {
      title: 'VI-RADS 2',
      desc: 'Invasión muscular improbable. Presencia de tallo fibrovascular o tumor sésil/base amplia con estroma/submucosa intacta.',
      badgeBg: 'bg-green-500/20 text-green-300 border-green-500/30',
    },
    3: {
      title: 'VI-RADS 3',
      desc: 'Invasión muscular dudosa / indeterminado. Hallazgos ambiguos en la capa submucosa o señal intermedia sin interrupción clara de la muscular.',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    4: {
      title: 'VI-RADS 4',
      desc: 'Invasión muscular probable. Interrupción clara de la capa muscular propia, pero confinada a la pared vesical (sin extensión a grasa).',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    },
    5: {
      title: 'VI-RADS 5',
      desc: 'Invasión de muscular y extensión extravesical. Interrupción de la muscular con extensión a la grasa perivesical o a órganos adyacentes.',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
  };

  return (
    <div className="space-y-6">
      {/* Selector de Modo */}
      <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
        <button
          onClick={() => setMode('algo')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            mode === 'algo'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <GitForkIcon />
          Modo Algorítmico (Recomendado)
        </button>
        <button
          onClick={() => setMode('classic')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            mode === 'classic'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <LayersIcon />
          Modo por Secuencias (ACR)
        </button>
      </div>

      {/* MODO 1: ALGORÍTMICO */}
      {mode === 'algo' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-base font-semibold text-white">Árbol de Decisión VI-RADS</h3>
            <button
              onClick={resetAlgo}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-700/50 px-2.5 py-1 rounded-lg transition-colors"
            >
              <RefreshIcon /> Reiniciar
            </button>
          </div>

          {!algoResult ? (
            <div className="space-y-4">
              {/* Botón Volver Atrás (Estilo Algoritmo Quístico) */}
              {history.length > 0 && (
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600/70 transition-all shadow-sm"
                >
                  <BackIcon />
                  <span>Volver al paso anterior</span>
                </button>
              )}

              {algoStep === 1 && (
                <div className="space-y-3">
                  <p className="text-slate-200 text-sm font-medium leading-relaxed">
                    1. ¿Existe disrupción / interrupción clara de la capa muscular propia hipointensa en T2 / restricción continua en DWI?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => goToNextStep('preguntaGrasa')}
                      className="py-3 px-4 bg-slate-700 hover:bg-blue-600 text-white font-medium rounded-xl transition-all border border-slate-600 hover:border-blue-500 text-sm"
                    >
                      Sí (Interrupción visible)
                    </button>
                    <button
                      onClick={() => goToNextStep('preguntaTamano')}
                      className="py-3 px-4 bg-slate-700 hover:bg-blue-600 text-white font-medium rounded-xl transition-all border border-slate-600 hover:border-blue-500 text-sm"
                    >
                      No (Muscular continua / intacta)
                    </button>
                  </div>
                </div>
              )}

              {algoStep === 'preguntaGrasa' && (
                <div className="space-y-3">
                  <p className="text-slate-200 text-sm font-medium leading-relaxed">
                    2. ¿Existe extensión tumoral a la grasa perivesical o compromiso de órganos adyacentes?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => goToNextStep(null, 5)}
                      className="py-3 px-4 bg-slate-700 hover:bg-red-600 text-white font-medium rounded-xl transition-all border border-slate-600 hover:border-red-500 text-sm"
                    >
                      Sí → VI-RADS 5
                    </button>
                    <button
                      onClick={() => goToNextStep(null, 4)}
                      className="py-3 px-4 bg-slate-700 hover:bg-orange-600 text-white font-medium rounded-xl transition-all border border-slate-600 hover:border-orange-500 text-sm"
                    >
                      No → VI-RADS 4
                    </button>
                  </div>
                </div>
              )}

              {algoStep === 'preguntaTamano' && (
                <div className="space-y-3">
                  <p className="text-slate-200 text-sm font-medium leading-relaxed">
                    2. ¿El tumor es menor a 1 cm (o lesión plana/sésil diminuta) sin alteración apreciable de la pared vesical?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => goToNextStep(null, 1)}
                      className="py-3 px-4 bg-slate-700 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all border border-slate-600 hover:border-emerald-500 text-sm"
                    >
                      Sí → VI-RADS 1
                    </button>
                    <button
                      onClick={() => goToNextStep('preguntaTallo')}
                      className="py-3 px-4 bg-slate-700 hover:bg-blue-600 text-white font-medium rounded-xl transition-all border border-slate-600 hover:border-blue-500 text-sm"
                    >
                      No (≥ 1 cm o características complejas)
                    </button>
                  </div>
                </div>
              )}

              {algoStep === 'preguntaTallo' && (
                <div className="space-y-3">
                  <p className="text-slate-200 text-sm font-medium leading-relaxed">
                    3. ¿Presenta tallo fibrovascular (stalk) claro O tumor sésil/base amplia con capa submucosa (capa interna) engrosada e intacta?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => goToNextStep(null, 2)}
                      className="py-3 px-4 bg-slate-700 hover:bg-green-600 text-white font-medium rounded-xl transition-all border border-slate-600 hover:border-green-500 text-sm"
                    >
                      Sí → VI-RADS 2
                    </button>
                    <button
                      onClick={() => goToNextStep(null, 3)}
                      className="py-3 px-4 bg-slate-700 hover:bg-amber-600 text-white font-medium rounded-xl transition-all border border-slate-600 hover:border-amber-500 text-sm"
                    >
                      No (Hallazgos ambiguos / indet.) → VI-RADS 3
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400">Evaluación algorítmica completada</span>
              <button
                onClick={handleGoBack}
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <BackIcon />
                <span>Modificar selección anterior</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODO 2: SECUENCIAS (CLÁSICO) */}
      {mode === 'classic' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-base font-semibold text-white">Puntuación por Secuencia (ACR)</h3>
            <button
              onClick={resetClassic}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-700/50 px-2.5 py-1 rounded-lg transition-colors"
            >
              <RefreshIcon /> Reiniciar
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">1. Puntuación T2W (Anatómica)</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={`t2-${val}`}
                  onClick={() => setT2w(val)}
                  className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                    t2w === val
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">2. Puntuación DWI/ADC (Dominante Primaria)</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={`dwi-${val}`}
                  onClick={() => setDwi(val)}
                  className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                    dwi === val
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">3. Puntuación DCE (Dominante Secundaria)</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={`dce-${val}`}
                  onClick={() => setDce(val)}
                  className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                    dce === val
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            La categoría final toma el valor de DWI (secuencia dominante). Si DWI no es interpretable, se utiliza DCE.
          </p>
        </div>
      )}

      {/* RESULTADO FINAL */}
      {currentCategory && (
        <div className={`p-5 rounded-xl border ${categoryDetails[currentCategory].badgeBg} space-y-2 transition-all shadow-lg`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Categoría Obtenida</span>
            <span className="text-2xl font-black">{categoryDetails[currentCategory].title}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200">
            {categoryDetails[currentCategory].desc}
          </p>
        </div>
      )}
    </div>
  );
}
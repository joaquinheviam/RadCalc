import React, { useState, useContext } from 'react';
import { LangContext } from '../i18n/LangContext.js';
import {
  Card,
  StickyBar,
  ResetIconButton,
  CopyIconButton,
  InfoBox,
  References,
  UsageNotes,
  ReportBugLink,
  DonationButton,
  CalcDisclaimer
} from '../components/shared/index.js';
import { copyToClipboard } from '../utils/clipboard.js';

// Componentes locales requeridos por las convenciones del proyecto
function YesNo({ label, value, onChange, yesLabel, noLabel }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${
            value === true
              ? 'bg-amber-500 border-amber-500 text-white'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
          }`}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${
            value === false
              ? 'bg-slate-600 border-slate-600 text-white'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
          }`}
        >
          {noLabel}
        </button>
      </div>
    </div>
  );
}

function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
              value === opt.key
                ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200 font-medium'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ILDClassifier() {
  const { t, lang } = useContext(LangContext);
  const c = t.calc.ildClassifier;

  // Estados del Formulario
  const [symptoms, setSymptoms] = useState(null);
  const [pftAbnormal, setPftAbnormal] = useState(null);
  const [extentZone, setExtentZone] = useState('under5'); // 'under5', '5to10', 'over10'
  const [volTotal, setVolTotal] = useState('under5'); // 'under5', 'over5'

  const [distribution, setDistribution] = useState('subpleuralBasal');
  const [feature, setFeature] = useState('ggo');

  // Signos atípicos / CTD / Tabaquismo
  const [straightEdge, setStraightEdge] = useState(false);
  const [exuberantHC, setExuberantHC] = useState(false);
  const [anteriorUpper, setAnteriorUpper] = useState(false);
  const [esophagus, setEsophagus] = useState(false);

  const [smokingHistory, setSmokingHistory] = useState(false);
  const [cystsSRIF, setCystsSRIF] = useState(false);
  const [cystsPLCH, setCystsPLCH] = useState(false);
  const [ggoCentrilobular, setGgoCentrilobular] = useState(false);
  const [threeDensity, setThreeDensity] = useState(false);
  const [consolidationOP, setConsolidationOP] = useState(false);
  const [subpleuralSparing, setSubpleuralSparing] = useState(false);

  // Lógica de Clasificación
  const isSymptomatic = symptoms === true || pftAbnormal === true;
  const isOver5Zone = extentZone !== 'under5';
  const isOver5VolTotal = volTotal === 'over5';

  // 1. ILA vs. EPID Franca
  let entityType = null; // 'ILA' o 'EPID'
  let ilaSubtype = null; // 'Nonsubpleural', 'SubpleuralNonFibrotic', 'SubpleuralFibrotic'

  if (!isOver5Zone && !isOver5VolTotal && !isSymptomatic && feature === 'ggo') {
    entityType = 'NORMAL_OR_MINIMAL';
  } else if (!isSymptomatic && !isOver5VolTotal && feature !== 'honeycombing' && distribution !== 'peribronchovascular') {
    entityType = 'ILA';
    if (distribution === 'upperMid' || distribution === 'diffuse') {
      ilaSubtype = c.ilaSubNonsubpleural;
    } else if (feature === 'ggo') {
      ilaSubtype = c.ilaSubNonFibrotic;
    } else {
      ilaSubtype = c.ilaSubFibrotic;
    }
  } else {
    entityType = 'EPID';
  }

  // 2. Clasificación del Patrón UIP vs Alternativos
  let uipCategory = 'INDETERMINATE'; // 'TYPICAL', 'PROBABLE', 'INDETERMINATE', 'ALTERNATIVE'
  let alternativeDetails = [];
  let isHPFibrotic = false;

  const hasInconsistentDistribution = distribution === 'peribronchovascular' || distribution === 'upperMid';
  const hasInconsistentFeatures = consolidationOP || ggoCentrilobular || threeDensity || cystsPLCH || cystsSRIF || subpleuralSparing;
  const hasCTDSigns = straightEdge || exuberantHC || anteriorUpper || esophagus;

  if (hasInconsistentDistribution || hasInconsistentFeatures) {
    uipCategory = 'ALTERNATIVE';
  } else if (feature === 'honeycombing' && distribution === 'subpleuralBasal') {
    uipCategory = 'TYPICAL';
  } else if (feature === 'traction' && distribution === 'subpleuralBasal') {
    uipCategory = 'PROBABLE';
  } else if (distribution === 'subpleuralBasal' || distribution === 'diffuse') {
    uipCategory = 'INDETERMINATE';
  }

  // Diagnósticos Alternativos Sugeridos
  if (uipCategory === 'ALTERNATIVE' || hasCTDSigns) {
    if (hasCTDSigns || subpleuralSparing) {
      alternativeDetails.push(c.msgCTDSuspect);
    }
    if (cystsSRIF) {
      alternativeDetails.push(c.msgSRIFSuspect);
    }
    if (cystsPLCH) {
      alternativeDetails.push("Sugerente de Histiocitosis de Células de Langerhans (PLCH) por quistes bizarros con respeto costofrénico.");
    }
    if (ggoCentrilobular && smokingHistory) {
      alternativeDetails.push("Sugerente de Bronquiolitis Respiratoria - EPID (RB-ILD).");
    }
    if (threeDensity || distribution === 'peribronchovascular') {
      isHPFibrotic = feature === 'traction' || feature === 'honeycombing';
      alternativeDetails.push(`${c.msgBIPHPSuspect} (${isHPFibrotic ? c.msgBIPFibr : c.msgBIPNonFibr})`);
    }
    if (subpleuralSparing && !hasCTDSigns) {
      alternativeDetails.push(c.msgNSIPSuspect);
    }
    if (consolidationOP) {
      alternativeDetails.push(c.msgOPSuspect);
    }
  }

  const showResult = entityType !== null && entityType !== 'NORMAL_OR_MINIMAL';

  const handleReset = () => {
    setSymptoms(null);
    setPftAbnormal(null);
    setExtentZone('under5');
    setVolTotal('under5');
    setDistribution('subpleuralBasal');
    setFeature('ggo');
    setStraightEdge(false);
    setExuberantHC(false);
    setAnteriorUpper(false);
    setEsophagus(false);
    setSmokingHistory(false);
    setCystsSRIF(false);
    setCystsPLCH(false);
    setGgoCentrilobular(false);
    setThreeDensity(false);
    setConsolidationOP(false);
    setSubpleuralSparing(false);
  };

  const handleCopy = () => {
    const text = `--- REPORT DE CLASIFICACIÓN EPID / ILA ---
Entidad: ${entityType === 'ILA' ? c.resILA : c.resEPID}
${ilaSubtype ? `Subtipo ILA: ${ilaSubtype}\n` : ''}Categoría de Patrón UIP: ${
      uipCategory === 'TYPICAL'
        ? c.resUIPDef
        : uipCategory === 'PROBABLE'
        ? c.resUIPProb
        : uipCategory === 'INDETERMINATE'
        ? c.resUIPIndet
        : c.resAlternative
    }
${alternativeDetails.length > 0 ? `Sugerencias Clínicas / Alternativas:\n- ${alternativeDetails.join('\n- ')}\n` : ''}
Criterios Tomográficos y Clínicos Evaluados según consensos ATS 2020-2025.`;
    copyToClipboard(text);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{c.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.subtitle}</p>
      </div>

      {/* Sección 1: Dominio Clínico */}
      <Card title={c.secClinical}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <YesNo
            label={c.symptomsLabel}
            value={symptoms}
            onChange={setSymptoms}
            yesLabel={c.yes}
            noLabel={c.no}
          />
          <YesNo
            label={c.pftLabel}
            value={pftAbnormal}
            onChange={setPftAbnormal}
            yesLabel={c.yes}
            noLabel={c.no}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <OptionList
            label={c.extentZonesLabel}
            value={extentZone}
            onChange={setExtentZone}
            options={[
              { key: 'under5', label: c.optUnder5 },
              { key: '5to10', label: c.opt5to10 },
              { key: 'over10', label: c.optOver10 }
            ]}
          />
          <OptionList
            label={c.volTotalLabel}
            value={volTotal}
            onChange={setVolTotal}
            options={[
              { key: 'under5', label: c.optUnder5 },
              { key: 'over5', label: c.optOver10 }
            ]}
          />
        </div>
      </Card>

      {/* Sección 2: Tomografía Computada */}
      <Card title={c.secImaging}>
        <div className="space-y-4">
          <OptionList
            label={c.distributionLabel}
            value={distribution}
            onChange={setDistribution}
            options={[
              { key: 'subpleuralBasal', label: c.distSubpleuralBasal },
              { key: 'peribronchovascular', label: c.distPeribronchovascular },
              { key: 'upperMid', label: c.distUpperMid },
              { key: 'diffuse', label: c.distDiffuse }
            ]}
          />
          <OptionList
            label={c.featuresLabel}
            value={feature}
            onChange={setFeature}
            options={[
              { key: 'ggo', label: c.featGGO },
              { key: 'traction', label: c.featTraction },
              { key: 'honeycombing', label: c.featHoneycombing }
            ]}
          />
        </div>
      </Card>

      {/* Sección 3: Signos Atípicos / Conectivopatía */}
      <Card title={c.secSigns}>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={straightEdge}
              onChange={(e) => setStraightEdge(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.signStraightEdge}</span>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={exuberantHC}
              onChange={(e) => setExuberantHC(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.signExuberantHC}</span>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={anteriorUpper}
              onChange={(e) => setAnteriorUpper(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.signAnteriorUpper}</span>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={subpleuralSparing}
              onChange={(e) => setSubpleuralSparing(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.subpleuralSparing}</span>
          </label>
        </div>
      </Card>

      {/* Sección 4: Tabaquismo / Alternativos */}
      <Card title={c.secSmoking}>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={smokingHistory}
              onChange={(e) => setSmokingHistory(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.tabaccoHistory}</span>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={cystsSRIF}
              onChange={(e) => setCystsSRIF(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.cystsSRIF}</span>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={cystsPLCH}
              onChange={(e) => setCystsPLCH(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.cystsPLCH}</span>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={ggoCentrilobular}
              onChange={(e) => setGgoCentrilobular(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.ggoCentrilobular}</span>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={threeDensity}
              onChange={(e) => setThreeDensity(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.threeDensitySign}</span>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={consolidationOP}
              onChange={(e) => setConsolidationOP(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.consolidationOP}</span>
          </label>
        </div>
      </Card>

      {/* Card Inline de Resultado */}
      {showResult && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {entityType === 'ILA' ? c.resILA : c.resEPID}
              </span>
              <div className="flex gap-2">
                <CopyIconButton onClick={handleCopy} />
                <ResetIconButton onClick={handleReset} />
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {uipCategory === 'TYPICAL'
                ? c.resUIPDef
                : uipCategory === 'PROBABLE'
                ? c.resUIPProb
                : uipCategory === 'INDETERMINATE'
                ? c.resUIPIndet
                : c.resAlternative}
            </h3>

            {ilaSubtype && (
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {ilaSubtype}
              </p>
            )}

            {uipCategory === 'TYPICAL' || uipCategory === 'PROBABLE' ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">{c.msgIPFSuspect}</p>
            ) : null}

            {alternativeDetails.length > 0 && (
              <InfoBox tone="amber">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {alternativeDetails.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </InfoBox>
            )}
          </div>
        </Card>
      )}

      {/* Referencias y Fuentes */}
      <div className="pt-4 space-y-4">
        <References references="ildClassifier" />
        <InfoBox tone="slate">
          <div className="text-xs space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">{c.sourcesTitle}</p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
              <li>ATS 2025 ILA Statement: Definición ILA vs ILD (Págs. 1134-1138, Tablas 1 y 3).</li>
              <li>ERS/ATS 2025 Classification: Patrón BIP, DAD, AMP (Págs. 3-7, Tabla 1 y 2).</li>
              <li>Consenso ATS 2022: Patrón UIP, Probable UIP y Criterios PPF (Págs. e20-e22, e34-e36).</li>
              <li>RadioGraphics 2026: SRIF, AEF, PLCH, RB-ILD y AEP (Págs. 6-12, Tablas 1 y 2).</li>
              <li>AJR 2017: Signos tomográficos específicos de Conectivopatía (Págs. 1-4, Tabla 3).</li>
              <li>ATS 2020: Criterios para HP Fibrótica vs No Fibrótica.</li>
            </ul>
          </div>
        </InfoBox>
      </div>

      {/* StickyBar Inferior */}
      {showResult && (
        <StickyBar>
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                {entityType === 'ILA' ? c.resILA : c.resEPID}
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {uipCategory === 'TYPICAL'
                  ? c.resUIPDef
                  : uipCategory === 'PROBABLE'
                  ? c.resUIPProb
                  : uipCategory === 'INDETERMINATE'
                  ? c.resUIPIndet
                  : c.resAlternative}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyIconButton onClick={handleCopy} />
              <ResetIconButton onClick={handleReset} />
            </div>
          </div>
        </StickyBar>
      )}
    </div>
  );
}
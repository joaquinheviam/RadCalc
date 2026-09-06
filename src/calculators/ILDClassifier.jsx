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
import { REFERENCES } from '../i18n/references.js';

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
  // Etapa 1 (ATS 2025 ILA/ILD): dominio clínico-fisiológico y extensión tomográfica
  const [symptoms, setSymptoms] = useState(null);
  const [pftAbnormal, setPftAbnormal] = useState(null);
  const [progressionCT, setProgressionCT] = useState(null);
  const [extentZone, setExtentZone] = useState('under5'); // 'under5', 'ge5' — Tabla 1 (criterio de ILA)
  const [volTotal, setVolTotal] = useState('under5'); // 'under5', 'ge5' — Tabla 3 (criterio de EPID por imagen)

  // Etapa 2: caracterización del patrón (solo se muestra en detalle si entityType === 'EPID')
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
  const [extensiveGGO, setExtensiveGGO] = useState(false);

  // Antecedente de conectivopatía conocida (independiente de los signos morfológicos de Etapa 2)
  const [ctdKnown, setCtdKnown] = useState('none'); // 'none','sle','sjogren','ssc','ra','pmdm','mctd'

  // --- Cálculos auxiliares de Etapa 2 (patrón), necesarios también para saber
  // si hay un "patrón fibrótico mayor" (criterio de EPID de la Tabla 3) ---
  const isFibroticFeature = feature === 'traction' || feature === 'honeycombing';
  const hasInconsistentDistribution = distribution === 'peribronchovascular' || distribution === 'upperMid';
  const hasInconsistentFeatures = consolidationOP || ggoCentrilobular || threeDensity || cystsPLCH || cystsSRIF || subpleuralSparing || extensiveGGO;
  // Signos morfológicos específicos de CTD (Chung et al. 2018) — se usan para el mensaje msgCTDSuspect,
  // que cita explícitamente esos tres signos y por eso no debe incluir la dilatación esofágica.
  const hasCTDMorphSigns = straightEdge || exuberantHC || anteriorUpper;
  // hasCTDSigns se mantiene con su significado original (incluye dilatación esofágica) porque también
  // se usa para gatillar isFibroticNSIP y uipCategory === 'ALTERNATIVE'.
  const hasCTDSigns = hasCTDMorphSigns || esophagus;

  let uipCategory = 'INDETERMINATE'; // 'TYPICAL', 'PROBABLE', 'INDETERMINATE', 'ALTERNATIVE'
  if (hasInconsistentDistribution || hasInconsistentFeatures) {
    uipCategory = 'ALTERNATIVE';
  } else if (feature === 'honeycombing' && distribution === 'subpleuralBasal') {
    uipCategory = 'TYPICAL';
  } else if (feature === 'traction' && distribution === 'subpleuralBasal') {
    uipCategory = 'PROBABLE';
  } else if (distribution === 'subpleuralBasal' || distribution === 'diffuse') {
    uipCategory = 'INDETERMINATE';
  }

  const isHPFibrotic = (threeDensity || distribution === 'peribronchovascular') && isFibroticFeature;
  const isFibroticNSIP = subpleuralSparing && !hasCTDSigns && isFibroticFeature;
  // Tabla 3 (ATS 2025), criterio de imagen "patrón fibrótico mayor": UIP/probable UIP, HP fibrótica o NSIP fibrótica.
  // Bug corregido: este criterio de patrón SOLO cuenta como criterio de EPID
  // si además alcanza ≥5% del volumen pulmonar TOTAL (volTotal === 'ge5'),
  // no solo ≥5% de una zona (extentZone). Antes, elegir panal/bronquiectasias
  // de tracción con la distribución subpleural-basal por defecto marcaba
  // uipCategory como TYPICAL/PROBABLE y eso solo ya forzaba EPID sin mirar la
  // extensión — así que un hallazgo focal (<5% del volumen total) que
  // debería quedar como ILA subtipo "Subpleural Fibrótica" (alto riesgo de
  // progresión, ver ilaSubFibrotic más abajo) terminaba clasificado como
  // EPID franca. Con la extensión ≥5% de una zona pero <5% del volumen
  // total, ahora sí puede quedar como ILA (siempre que no haya síntomas,
  // progresión radiológica u otro criterio de Tabla 3 independiente).
  const majorFibroticPattern = volTotal === 'ge5' && (uipCategory === 'TYPICAL' || uipCategory === 'PROBABLE' || isHPFibrotic || isFibroticNSIP);

  // --- Etapa 1 (ATS 2025): ¿ILA, EPID franca, o ninguno? ---
  const isSymptomatic = symptoms === true || pftAbnormal === true; // Tabla 3: Síntomas O Fisiología
  const meetsZoneILA = extentZone === 'ge5'; // Tabla 1: ≥5% de al menos una zona pulmonar
  const meetsImagingILDExtent = volTotal === 'ge5' && isFibroticFeature; // Tabla 3: ≥5% del volumen pulmonar total, con patrón fibrótico
  const meetsProgression = progressionCT === true; // Tabla 3: progresión radiológica en TC seriada
  const meetsILD = isSymptomatic || meetsImagingILDExtent || meetsProgression || majorFibroticPattern;

  let entityType; // 'EPID', 'ILA', 'NORMAL_OR_MINIMAL'
  let ilaSubtype = null; // 'Nonsubpleural', 'SubpleuralNonFibrotic', 'SubpleuralFibrotic'

  if (meetsILD) {
    entityType = 'EPID';
  } else if (meetsZoneILA) {
    entityType = 'ILA';
    if (distribution === 'upperMid' || distribution === 'diffuse' || distribution === 'peribronchovascular') {
      ilaSubtype = c.ilaSubNonsubpleural;
    } else if (feature === 'ggo') {
      ilaSubtype = c.ilaSubNonFibrotic;
    } else {
      ilaSubtype = c.ilaSubFibrotic;
    }
  } else {
    entityType = 'NORMAL_OR_MINIMAL';
  }

  // --- Etapa 2: Diagnósticos Alternativos Sugeridos (solo relevantes si entityType === 'EPID') ---
  let alternativeDetails = [];
  if (uipCategory === 'ALTERNATIVE' || hasCTDSigns) {
    if (hasCTDMorphSigns || subpleuralSparing) {
      alternativeDetails.push(c.msgCTDSuspect);
    }
    if (esophagus) {
      alternativeDetails.push(c.msgEsophagusSuspect);
    }
    if (extensiveGGO) {
      alternativeDetails.push(c.msgExtensiveGGOSuspect);
    }
    if (cystsSRIF) {
      alternativeDetails.push(c.msgSRIFSuspect);
    }
    if (cystsPLCH) {
      alternativeDetails.push(c.msgPLCHSuspect);
    }
    if (ggoCentrilobular && smokingHistory) {
      alternativeDetails.push(c.msgRBILDSuspect);
    }
    if (threeDensity || distribution === 'peribronchovascular') {
      alternativeDetails.push(`${c.msgBIPHPSuspect} (${isHPFibrotic ? c.msgBIPFibr : c.msgBIPNonFibr})`);
    }
    if (subpleuralSparing && !hasCTDSigns) {
      alternativeDetails.push(c.msgNSIPSuspect);
    }
    if (consolidationOP) {
      alternativeDetails.push(c.msgOPSuspect);
    }
  } else {
    // extensiveGGO es un hallazgo inconsistente por sí mismo (independiente de uipCategory/hasCTDSigns):
    // aunque el resto del patrón sea típico, un vidrio esmerilado extenso amerita la misma advertencia.
    if (extensiveGGO) {
      alternativeDetails.push(c.msgExtensiveGGOSuspect);
    }
  }

  // Antecedente de conectivopatía CONOCIDA (Ahuja et al. 2016, Tabla 2): sugiere el patrón de EPID más
  // frecuentemente descrito para esa conectivopatía, independientemente de los signos morfológicos de
  // Etapa 2 — por eso va fuera del bloque condicionado a uipCategory/hasCTDSigns de arriba.
  const CTD_PATTERNS = {
    sle: { label: c.ctdOptSLE, pattern: c.ctdPatternSLE },
    sjogren: { label: c.ctdOptSjogren, pattern: c.ctdPatternSjogren },
    ssc: { label: c.ctdOptSSc, pattern: c.ctdPatternSSc },
    ra: { label: c.ctdOptRA, pattern: c.ctdPatternRA },
    pmdm: { label: c.ctdOptPMDM, pattern: c.ctdPatternPMDM },
    mctd: { label: c.ctdOptMCTD, pattern: c.ctdPatternMCTD },
  };
  const ctdSelected = CTD_PATTERNS[ctdKnown] || null;
  if (ctdSelected) {
    alternativeDetails.push(
      `${c.msgCTDPatternIntro} ${ctdSelected.label}, ${c.msgCTDPatternRef}: ${ctdSelected.pattern} (Ahuja et al. 2016).`
    );
  }

  // Cuando hay EPID franca y además hay indicios de conectivopatía (signos morfológicos, dilatación
  // esofágica, o antecedente conocido), se agrega la coletilla solicitada al patrón final.
  const ctdIndicated = hasCTDSigns || Boolean(ctdSelected);

  // El resultado se muestra apenas el usuario empieza a interactuar con el formulario,
  // para cualquiera de las 3 entidades (incluyendo "sin criterios de ILA ni EPID").
  const started = symptoms !== null || pftAbnormal !== null || progressionCT !== null ||
    extentZone !== 'under5' || volTotal !== 'under5' ||
    distribution !== 'subpleuralBasal' || feature !== 'ggo' ||
    straightEdge || exuberantHC || anteriorUpper || esophagus ||
    smokingHistory || cystsSRIF || cystsPLCH || ggoCentrilobular || threeDensity || consolidationOP || subpleuralSparing ||
    extensiveGGO || ctdKnown !== 'none';

  const showResult = started;

  const handleReset = () => {
    setSymptoms(null);
    setPftAbnormal(null);
    setProgressionCT(null);
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
    setExtensiveGGO(false);
    setCtdKnown('none');
  };

  const entityLabel = entityType === 'EPID' ? c.resEPID : entityType === 'ILA' ? c.resILA : c.resNormal;

  const patternLabel = entityType === 'EPID'
    ? (uipCategory === 'TYPICAL'
        ? c.resUIPDef
        : uipCategory === 'PROBABLE'
        ? c.resUIPProb
        : uipCategory === 'INDETERMINATE'
        ? c.resUIPIndet
        : c.resAlternative)
    : entityType === 'ILA'
    ? ilaSubtype
    : c.msgNormalExplain;

  // Coletilla "consistente con EPID asociada a conectivopatía de base": solo cuando la clasificación
  // final es EPID franca y hay indicios de conectivopatía (signos morfológicos, dilatación esofágica,
  // o antecedente conocido seleccionado arriba).
  const patternLabelFinal = (entityType === 'EPID' && ctdIndicated)
    ? `${patternLabel} — ${c.msgCTDAssociatedSuffix}`
    : patternLabel;

  const handleCopy = () => {
    const lines = [
      c.reportTitle,
      `${c.reportEntityLabel} ${entityLabel}`,
    ];
    if (entityType === 'ILA' && ilaSubtype) {
      lines.push(`${c.reportSubtypeLabel} ${ilaSubtype}`);
    }
    if (entityType === 'EPID') {
      lines.push(`${c.reportPatternLabel} ${patternLabelFinal}`);
      if (alternativeDetails.length > 0) {
        lines.push(`${c.reportAltLabel}\n- ${alternativeDetails.join('\n- ')}`);
      }
    }
    lines.push(c.reportFooter);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Sección 1: Dominio Clínico */}
      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-2">{c.secClinical}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <YesNo
            label={c.symptomsLabel}
            value={symptoms}
            onChange={setSymptoms}
            yesLabel={t.common.yes}
            noLabel={t.common.no}
          />
          <YesNo
            label={c.pftLabel}
            value={pftAbnormal}
            onChange={setPftAbnormal}
            yesLabel={t.common.yes}
            noLabel={t.common.no}
          />
          <YesNo
            label={c.progressionLabel}
            value={progressionCT}
            onChange={setProgressionCT}
            yesLabel={t.common.yes}
            noLabel={t.common.no}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <OptionList
            label={c.extentZonesLabel}
            value={extentZone}
            onChange={setExtentZone}
            options={[
              { key: 'under5', label: c.optUnder5 },
              { key: 'ge5', label: c.optGe5 }
            ]}
          />
          <OptionList
            label={c.volTotalLabel}
            value={volTotal}
            onChange={setVolTotal}
            options={[
              { key: 'under5', label: c.optUnder5 },
              { key: 'ge5', label: c.optGe5 }
            ]}
          />
        </div>
      </Card>

      {/* Antecedente de Conectivopatía Conocida (independiente de los signos morfológicos de Etapa 2) */}
      <Card>
        <OptionList
          label={c.ctdSelectorLabel}
          value={ctdKnown}
          onChange={setCtdKnown}
          options={[
            { key: 'none', label: c.ctdOptNone },
            { key: 'sle', label: c.ctdOptSLE },
            { key: 'sjogren', label: c.ctdOptSjogren },
            { key: 'ssc', label: c.ctdOptSSc },
            { key: 'ra', label: c.ctdOptRA },
            { key: 'pmdm', label: c.ctdOptPMDM },
            { key: 'mctd', label: c.ctdOptMCTD }
          ]}
        />
      </Card>

      {/* Sección 2: Tomografía Computada */}
      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-2">{c.secImaging}</h3>
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
      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-2">{c.secSigns}</h3>
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
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={esophagus}
              onChange={(e) => setEsophagus(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.signEsophagus}</span>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={extensiveGGO}
              onChange={(e) => setExtensiveGGO(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{c.extensiveGGO}</span>
          </label>
        </div>
      </Card>

      {/* Sección 4: Tabaquismo / Alternativos */}
      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-2">{c.secSmoking}</h3>
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
        <Card className={entityType === 'NORMAL_OR_MINIMAL' ? 'border-slate-300/50 bg-slate-500/5' : 'border-amber-500/30 bg-amber-500/5'}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${entityType === 'NORMAL_OR_MINIMAL' ? 'text-slate-500 dark:text-slate-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {entityLabel}
              </span>
              <div className="flex gap-2">
                <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
                <ResetIconButton onClick={handleReset} label={t.common.reset} />
              </div>
            </div>

            {entityType !== 'NORMAL_OR_MINIMAL' && (
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {patternLabelFinal}
              </h3>
            )}

            {entityType === 'NORMAL_OR_MINIMAL' && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{c.msgNormalExplain}</p>
            )}

            {entityType === 'ILA' && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{c.msgILAFollowup}</p>
            )}

            {entityType === 'EPID' && (uipCategory === 'TYPICAL' || uipCategory === 'PROBABLE') && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{c.msgIPFSuspect}</p>
            )}

            {entityType === 'EPID' && alternativeDetails.length > 0 && (
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

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.ildClassifier} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {/* StickyBar Inferior */}
      {showResult && (
        <StickyBar>
          <div className="flex items-center justify-between w-full">
            <div>
              <div className={`text-xs font-semibold ${entityType === 'NORMAL_OR_MINIMAL' ? 'text-slate-500 dark:text-slate-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {entityLabel}
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {entityType === 'NORMAL_OR_MINIMAL' ? c.resNormal : patternLabelFinal}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
              <ResetIconButton onClick={handleReset} label={t.common.reset} />
            </div>
          </div>
        </StickyBar>
      )}
    </div>
  );
}
import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconBookOpen } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion, ZoomableDiagram } from '../components/shared/index.js';

const btnCls = (active) =>
  `w-full text-left p-2.5 rounded-lg border text-xs transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

function OptionList({ label, options, value, onChange }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={btnCls(value === opt.key)}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange, yesLabel, noLabel }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <button onClick={() => onChange('yes')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${value === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
          {yesLabel}
        </button>
        <button onClick={() => onChange('no')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${value === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
          {noLabel}
        </button>
      </div>
    </div>
  );
}

// Esquema anatómico de la MAV (arteria aferente, nido, vena de drenaje con
// dilatación aneurismática focal, corteza/surcos como referencia de
// elocuencia). Diseño y geometría fijados con Gemini y aprobados por la
// usuaria: se integra tal cual (sin redibujar formas ni recolorear), salvo
// el cambio estrictamente necesario para vivir como función local del
// archivo de la calculadora (igual que el resto de los esquemas de
// RadioCalc, ver p.ej. MullerianAnomalies.jsx) en lugar de un módulo
// exportado aparte.
function BrainAvmDiagram({ labels, activeHighlight }) {
  // activeHighlight: 'cortex' | 'artery' | 'nidus' | 'vein' | null — atenúa
  // los demás elementos al 20% para focalizar la atención visual.
  const getOpacity = (key) => {
    if (!activeHighlight) return 1;
    return activeHighlight === key ? 1 : 0.2;
  };

  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg
        viewBox="-140 -5 620 310"
        className="h-auto w-full max-w-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Filtro nativo SVG para dar volumen a las estructuras vasculares sin romper el render de la SPA */}
          <filter id="avmShadow_unique_v1" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 1. ANATOMÍA NEUTRA: Corteza Cerebral y Surcos (Elocuencia) */}
        <g opacity={getOpacity('cortex')} className="transition-opacity duration-300">
          {/* Margen cortical superficial */}
          <path
            d="M 20,130 C 40,90 70,80 90,110 C 120,60 170,50 200,80 C 230,40 280,40 310,70 C 340,50 370,60 380,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="text-slate-400 dark:text-slate-500"
          />
          {/* Surcos cerebrales penetrantes */}
          <path
            d="M 90,110 C 95,140 110,160 130,170 M 200,80 C 205,120 220,140 240,130 M 310,70 C 305,100 290,120 270,140"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="text-slate-300 dark:text-slate-600"
          />
        </g>

        {/* 2. ARTERIA AFERENTE (Feeding Artery) */}
        <g opacity={getOpacity('artery')} filter="url(#avmShadow_unique_v1)" className="transition-opacity duration-300">
          {/* Rama principal */}
          <path
            d="M 40,280 C 60,250 90,230 130,200"
            fill="none"
            stroke="#ef4444"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Rama secundaria alimentando el nido */}
          <path
            d="M 100,220 C 130,225 150,215 170,195"
            fill="none"
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* 3. VENA DE DRENAJE (Draining Vein) */}
        <g opacity={getOpacity('vein')} filter="url(#avmShadow_unique_v1)" className="transition-opacity duration-300">
          {/* Vaso de drenaje tortuoso hacia la superficie/seno */}
          <path
            d="M 230,180 C 270,150 310,100 350,50"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Detalle: Dilatación aneurismática venosa focal (Relevante para escala VALE) */}
          <ellipse
            cx="290"
            cy="125"
            rx="14"
            ry="10"
            fill="#3b82f6"
            transform="rotate(-45 290 125)"
          />
        </g>

        {/* 4. NIDO (Nidus) */}
        <g opacity={getOpacity('nidus')} filter="url(#avmShadow_unique_v1)" className="transition-opacity duration-300">
          {/* Maraña vascular primaria */}
          <path
            d="M 130,200 C 150,170 190,160 210,190 C 230,220 180,230 160,200 C 140,170 180,150 200,180 C 220,210 160,240 140,190"
            fill="none"
            stroke="#a855f7"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Maraña vascular superpuesta para dar densidad */}
          <path
            d="M 160,180 C 180,150 220,170 190,210 C 160,250 140,210 170,190 C 200,170 230,200 210,220"
            fill="none"
            stroke="#a855f7"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* 5. ETIQUETAS Y LÍNEAS DE REFERENCIA (Neutras, con soporte i18n) */}
        <g className="text-slate-500 dark:text-slate-400">
          {/* Etiqueta: Corteza (Elocuencia) - Arriba Izquierda */}
          <line x1="80" y1="60" x2="120" y2="90" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="120" cy="90" r="2" fill="currentColor" />
          <text x="75" y="55" fontSize="13" fontWeight="600" textAnchor="end" dominantBaseline="middle" className="fill-slate-700 dark:fill-slate-200">
            {labels.cortex}
          </text>

          {/* Etiqueta: Vena de Drenaje - Arriba Derecha */}
          <line x1="330" y1="120" x2="300" y2="100" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="300" cy="100" r="2" fill="currentColor" />
          <text x="335" y="125" fontSize="13" fontWeight="600" textAnchor="start" dominantBaseline="middle" className="fill-slate-700 dark:fill-slate-200">
            {labels.vein}
          </text>

          {/* Etiqueta: Arteria Aferente - Abajo Izquierda */}
          <line x1="80" y1="260" x2="100" y2="230" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="230" r="2" fill="currentColor" />
          <text x="75" y="265" fontSize="13" fontWeight="600" textAnchor="end" dominantBaseline="middle" className="fill-slate-700 dark:fill-slate-200">
            {labels.artery}
          </text>

          {/* Etiqueta: Nido - Abajo Derecha */}
          <line x1="260" y1="230" x2="210" y2="200" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="210" cy="200" r="2" fill="currentColor" />
          <text x="265" y="235" fontSize="13" fontWeight="600" textAnchor="start" dominantBaseline="middle" className="fill-slate-700 dark:fill-slate-200">
            {labels.nidus}
          </text>
        </g>
      </svg>
    </div>
  );
}

export default function BrainAVM() {
  const { t } = useLang();
  const c = t.calc.brainAvm;
  const [showPreview, setShowPreview] = useState(false);

  // Spetzler-Martin (SM)
  const [size, setSize] = useState(null); // 'small' (1) | 'medium' (2) | 'large' (3)
  const [eloquence, setEloquence] = useState(null); // 'no' (0) | 'yes' (1)
  const [venous, setVenous] = useState(null); // 'superficial' (0) | 'deep' (1)

  // Escala Suplementaria Lawton-Young (se suma al puntaje SM)
  const [age, setAge] = useState(null); // 'under20' (1) | '20to40' (2) | 'over40' (3)
  const [bleeding, setBleeding] = useState(null); // 'yes' (0) | 'no' (1)
  const [nidus, setNidus] = useState(null); // 'compact' (0) | 'diffuse' (1)

  // Escala VALE (riesgo de hemorragia en MAV no rotas)
  const [ventricular, setVentricular] = useState(null); // 'yes' (2) | 'no' (0)
  const [venousAneurysm, setVenousAneurysm] = useState(null); // 'yes' (-4) | 'no' (0)
  const [deepLocation, setDeepLocation] = useState(null); // 'yes' (1) | 'no' (0)
  const [excDeepDrainage, setExcDeepDrainage] = useState(null); // 'yes' (2) | 'no' (0)

  const isSmComplete = size !== null && eloquence !== null && venous !== null;
  const isSuppComplete = isSmComplete && age !== null && bleeding !== null && nidus !== null;
  const isValeComplete = ventricular !== null && venousAneurysm !== null && deepLocation !== null && excDeepDrainage !== null;
  const hasAnyResult = isSmComplete || isValeComplete;

  // --- Spetzler-Martin ---
  let smScore = null;
  let spetzlerPonceClass = null;
  let smMorbidity = null;
  if (isSmComplete) {
    const sizePts = size === 'small' ? 1 : size === 'medium' ? 2 : 3;
    const eloqPts = eloquence === 'yes' ? 1 : 0;
    const venousPts = venous === 'deep' ? 1 : 0;
    smScore = sizePts + eloqPts + venousPts;
    spetzlerPonceClass = smScore <= 2 ? 'A' : smScore === 3 ? 'B' : 'C';
    const morbidityMap = {
      1: '4% (IC 95%, 2-7)',
      2: '10% (IC 95%, 7-13)',
      3: '18% (IC 95%, 15-22)',
      4: '31% (IC 95%, 25-37)',
      5: '37% (IC 95%, 26-49)',
    };
    smMorbidity = morbidityMap[smScore];
  }

  // --- Suplementaria Lawton-Young (SM + edad + sangrado + configuración del nido) ---
  let suppScore = null;
  if (isSuppComplete) {
    const agePts = age === 'under20' ? 1 : age === '20to40' ? 2 : 3;
    const bleedPts = bleeding === 'yes' ? 0 : 1;
    const nidusPts = nidus === 'diffuse' ? 1 : 0;
    suppScore = smScore + agePts + bleedPts + nidusPts;
  }

  // --- VALE ---
  let valeScore = null;
  let valeRisk = null;
  let valeProb = null;
  if (isValeComplete) {
    const ventPts = ventricular === 'yes' ? 2 : 0;
    const aneurysmPts = venousAneurysm === 'yes' ? -4 : 0;
    const locPts = deepLocation === 'yes' ? 1 : 0;
    const excDeepPts = excDeepDrainage === 'yes' ? 2 : 0;
    valeScore = ventPts + aneurysmPts + locPts + excDeepPts;
    if (valeScore < -2) {
      valeRisk = c.valeLow;
      valeProb = '95.5% (IC 95%, 87.1-100)';
    } else if (valeScore <= 1) {
      valeRisk = c.valeModerate;
      valeProb = '92.8% (IC 95%, 88.8-97.0)';
    } else {
      valeRisk = c.valeHigh;
      valeProb = '75.8% (IC 95%, 65.1-88.3)';
    }
  }

  const resetAll = () => {
    setSize(null); setEloquence(null); setVenous(null);
    setAge(null); setBleeding(null); setNidus(null);
    setVentricular(null); setVenousAneurysm(null); setDeepLocation(null); setExcDeepDrainage(null);
  };

  const getReportText = () => {
    const parts = [c.reportTitle];
    if (isSmComplete) {
      parts.push(`${c.smGrade}: ${smScore} / 5`);
      parts.push(`${c.spetzlerPonce}: ${c.classPrefix} ${spetzlerPonceClass}`);
      parts.push(`${c.poorOutcomeRisk}: ${smMorbidity}`);
    }
    if (isSuppComplete) {
      parts.push(`${c.suppScoreLabel}: ${suppScore}`);
    }
    if (isValeComplete) {
      parts.push(`${c.valeScoreLabel}: ${valeScore} (${valeRisk})`);
      parts.push(`${c.valeProbLabel}: ${valeProb}`);
    }
    if (parts.length === 1) return;
    return parts.join('\n');
  };

  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const stickyLines = [];
  if (isSmComplete) stickyLines.push(`${c.smGrade}: ${smScore}/5 (${c.classPrefix} ${spetzlerPonceClass})`);
  if (isSuppComplete) stickyLines.push(`${c.suppScoreLabel}: ${suppScore}`);
  if (isValeComplete) stickyLines.push(`${c.valeScoreLabel}: ${valeScore} (${valeRisk})`);

  const diagramLabels = { cortex: c.diagramLabelCortex, artery: c.diagramLabelArtery, nidus: c.diagramLabelNidus, vein: c.diagramLabelVein };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyResult ? 'pb-56' : ''}`}>

      {/* ---- Spetzler-Martin (riesgo quirúrgico) ---- */}
      <div className="pt-2">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">{c.smSectionTitle}</h3>
      </div>
      <Card>
        <OptionList label={c.sizeQ} options={c.sizeOptions} value={size} onChange={setSize} />
        <OptionList label={c.eloquenceQ} options={c.eloquenceOptions} value={eloquence} onChange={setEloquence} />
        <OptionList label={c.venousQ} options={c.venousOptions} value={venous} onChange={setVenous} />
      </Card>

      <Accordion icon={<IconBookOpen size={16} />} title={c.diagramTitle}>
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">{c.diagramIntro}</p>
          <ZoomableDiagram title={c.diagramTitle} labels={t.common.diagramZoom}>
            <BrainAvmDiagram labels={diagramLabels} />
          </ZoomableDiagram>
        </div>
      </Accordion>

      {isSmComplete && (
        <Card className="text-center space-y-1">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.smGrade}: {smScore} / 5</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{c.spetzlerPonce}: <span className="font-semibold">{c.classPrefix} {spetzlerPonceClass}</span></p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{c.poorOutcomeRisk}: <span className="text-red-500 font-semibold">{smMorbidity}</span></p>
          {smScore >= 4 && <InfoBox tone="red">{c.smHighRiskNote}</InfoBox>}
          {smScore <= 2 && <InfoBox tone="emerald">{c.smLowRiskNote}</InfoBox>}
        </Card>
      )}

      {/* ---- Escala Suplementaria Lawton-Young ---- */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide mt-4">{c.suppSectionTitle}</h3>
        <p className="text-xs text-slate-500 mt-1">{c.suppIntro}</p>
      </div>
      <Card>
        <OptionList label={c.ageQ} options={c.ageOptions} value={age} onChange={setAge} />
        <YesNo label={c.bleedingQ} value={bleeding} onChange={setBleeding} yesLabel={c.yesLabel} noLabel={c.noLabel} />
        <OptionList label={c.nidusQ} options={c.nidusOptions} value={nidus} onChange={setNidus} />
      </Card>
      {isSuppComplete && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.suppScoreLabel}: {suppScore}</p>
        </Card>
      )}

      {/* ---- Escala VALE (riesgo de hemorragia) ---- */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide mt-4">{c.valeSectionTitle}</h3>
        <p className="text-xs text-slate-500 mt-1">{c.valeIntro}</p>
      </div>
      <Card>
        <YesNo label={c.ventricularQ} value={ventricular} onChange={setVentricular} yesLabel={c.yesLabel} noLabel={c.noLabel} />
        <YesNo label={c.venousAneurysmQ} value={venousAneurysm} onChange={setVenousAneurysm} yesLabel={c.yesLabel} noLabel={c.noLabel} />
        <YesNo label={c.deepLocationQ} value={deepLocation} onChange={setDeepLocation} yesLabel={c.yesLabel} noLabel={c.noLabel} />
        <YesNo label={c.excDeepDrainageQ} value={excDeepDrainage} onChange={setExcDeepDrainage} yesLabel={c.yesLabel} noLabel={c.noLabel} />
      </Card>
      {isValeComplete && (
        <Card className="text-center space-y-1">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.valeScoreLabel}: {valeScore}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{c.valeRiskLevel}: <span className={valeScore > 1 ? 'text-red-500 font-bold' : valeScore < -2 ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>{valeRisk}</span></p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{c.valeProbLabel}: <span className="font-semibold">{valeProb}</span></p>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.brainAvm} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasAnyResult && (
        <StickyBar>
          <div className="min-w-0 w-full text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <div className="mt-1 space-y-0.5">
              {stickyLines.map((line, i) => (
                <p key={i} className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-snug truncate">{line}</p>
              ))}
            </div>
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

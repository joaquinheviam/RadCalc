import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconAlertTriangle, IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, ZoomableDiagram } from '../components/shared/index.js';

function getCategory(pct) {
  if (pct >= 99.5) return 'occlusion';
  if (pct < 30) return 'mild';
  if (pct < 70) return 'moderate';
  return 'severe';
}

const CATEGORY_COLOR = {
  mild: 'text-emerald-500',
  moderate: 'text-amber-500',
  severe: 'text-red-500',
  occlusion: 'text-slate-500',
};

// Esquema didáctico de la bifurcación carotídea con estenosis del bulbo y las
// tres medidas que pide la calculadora (NASCET 1991, pág. 715, y nota
// ACR-ASNR-SPR 2025 de denominatorPrecisionNote):
//  - Medida 1: diámetro en el sitio de mayor estrechez (lumen residual).
//  - Medida 2: diámetro distal a la placa visible, ya en segmento de paredes
//    paralelas, inmediatamente después del fin de la placa.
//  - Medida 3: diámetro de la arteria normal distal al bulbo carotídeo, más
//    distal, en ACI cervical sana de paredes paralelas.
// Textos desde t.calc.nascetStenosis (ES/EN); colores con clases dark:.
const NASCET_FONT = 'ui-sans-serif, system-ui, -apple-system, sans-serif';

function MeasureLabel({ x, y, lines, colorClass }) {
  const [title, ...desc] = lines;
  return (
    <text x={x} y={y} fontFamily={NASCET_FONT}>
      <tspan x={x} fontSize="15" fontWeight="700" className={colorClass}>{title}</tspan>
      {desc.map((line, i) => (
        <tspan key={i} x={x} dy="17" fontSize="14" className="fill-slate-600 dark:fill-slate-300">{line}</tspan>
      ))}
    </text>
  );
}

function MeasureLine({ x1, x2, y, strokeClass }) {
  return (
    <g className={strokeClass} strokeLinecap="round">
      <line x1={x1} y1={y} x2={x2} y2={y} strokeWidth="3.5" />
      <path d={`M ${x1} ${y - 7} L ${x1} ${y + 7} M ${x2} ${y - 7} L ${x2} ${y + 7}`} strokeWidth="2.5" />
    </g>
  );
}

function NascetDiagram({ c }) {
  const leader = 'stroke-slate-400 dark:stroke-slate-500';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 470"
      className="w-full h-auto max-w-md"
      role="img"
      aria-label={c.diagramAria}
    >
      {/* Lumen: ACC, bulbo y ACI (vertical) con la ACE hacia la izquierda */}
      <path
        d="M 112 460 L 172 460 L 172 335 C 194 305, 196 225, 162 178 L 162 20 L 122 20 L 122 178
           C 112 200, 108 250, 112 300 C 98 285, 76 262, 70 228 L 66 140 L 44 140 L 48 232
           C 54 280, 84 318, 112 345 Z"
        className="fill-rose-100 dark:fill-red-950 stroke-red-500 dark:stroke-red-400"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Placa aterosclerótica del bulbo (pared posterior y anterior) */}
      <g fill="#facc15" stroke="#ca8a04" strokeWidth="1.5">
        <path d="M 172 335 C 194 305, 196 225, 162 178 C 158 215, 140 250, 146 285 C 150 305, 160 322, 172 335 Z" />
        <path d="M 117 195 C 132 225, 132 265, 112 298 C 109 260, 110 225, 117 195 Z" />
      </g>

      {/* Dirección del flujo (de la ACC hacia la ACI) */}
      <g className="stroke-red-700 dark:stroke-red-300" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="142" y1="448" x2="142" y2="392" />
        <polyline points="133,403 142,392 151,403" />
      </g>

      {/* Nombres de los vasos */}
      <g fontFamily={NASCET_FONT} fontSize="14" fontWeight="700" className="fill-slate-700 dark:fill-slate-200">
        <text x="114" y="118" textAnchor="end">{c.diagramIca}</text>
        <text x="55" y="130" textAnchor="middle">{c.diagramEca}</text>
        <text x="104" y="420" textAnchor="end">{c.diagramCca}</text>
      </g>

      {/* Medida 3: arteria normal distal al bulbo */}
      <MeasureLine x1={122} x2={162} y={62} strokeClass="stroke-blue-600 dark:stroke-blue-400" />
      <line x1="170" y1="62" x2="198" y2="62" className={leader} strokeWidth="1.5" strokeDasharray="3 3" />
      <MeasureLabel x={205} y={56} lines={c.diagramM3} colorClass="fill-blue-700 dark:fill-blue-300" />

      {/* Medida 2: distal a la placa visible */}
      <MeasureLine x1={122} x2={162} y={160} strokeClass="stroke-violet-600 dark:stroke-violet-400" />
      <line x1="170" y1="160" x2="198" y2="160" className={leader} strokeWidth="1.5" strokeDasharray="3 3" />
      <MeasureLabel x={205} y={154} lines={c.diagramM2} colorClass="fill-violet-700 dark:fill-violet-300" />

      {/* Medida 1: sitio de mayor estrechez */}
      <MeasureLine x1={128} x2={145} y={250} strokeClass="stroke-red-600 dark:stroke-red-400" />
      <line x1="152" y1="250" x2="198" y2="250" className={leader} strokeWidth="1.5" strokeDasharray="3 3" />
      <MeasureLabel x={205} y={244} lines={c.diagramM1} colorClass="fill-red-700 dark:fill-red-300" />

      {/* Rótulo de la placa */}
      <line x1="186" y1="300" x2="198" y2="320" className={leader} strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="205" y="330" fontFamily={NASCET_FONT} fontSize="14" fontWeight="600" className="fill-amber-700 dark:fill-amber-300">{c.diagramPlaque}</text>
    </svg>
  );
}

function NascetLegend({ c }) {
  return (
    <div className="space-y-1 text-xs leading-snug text-slate-600 dark:text-slate-300">
      <p><span className="font-semibold text-violet-700 dark:text-violet-300">{c.diagramFormulaEligLabel}</span> {c.diagramFormulaElig}</p>
      <p><span className="font-semibold text-blue-700 dark:text-blue-300">{c.diagramFormulaAnalysisLabel}</span> {c.diagramFormulaAnalysis}</p>
      <p className="text-slate-500 dark:text-slate-400">{c.diagramAbbrev}</p>
    </div>
  );
}

export default function NASCETStenosis() {
  const { t } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.nascetStenosis;
  const [measure1, setMeasure1] = useState('');
  const [measure2, setMeasure2] = useState('');
  const [measure3, setMeasure3] = useState('');
  const [totalOcclusion, setTotalOcclusion] = useState(false);
  const [flowRelated, setFlowRelated] = useState(false);

  const M1 = parseFloat(measure1) || 0;
  const M2 = parseFloat(measure2) || 0;
  const M3 = parseFloat(measure3) || 0;
  const forced = totalOcclusion ? 100 : flowRelated ? 95 : null;
  const usingToggle = totalOcclusion || flowRelated;

  const showElig = forced !== null || (measure1 !== '' && measure2 !== '' && M2 > 0);
  const pctElig = forced !== null ? forced : (M2 > 0 ? (1 - M1 / M2) * 100 : 0);
  const catElig = getCategory(pctElig);

  const showAnalysis = forced !== null || (measure1 !== '' && measure3 !== '' && M3 > 0);
  const pctAnalysis = forced !== null ? forced : (M3 > 0 ? (1 - M1 / M3) * 100 : 0);
  const catAnalysis = getCategory(pctAnalysis);

  const showResidual = !usingToggle && measure1 !== '' && M1 > 0;

  const hasAny = showElig || showAnalysis || showResidual;

  const categoryLabel = (cat) => ({
    mild: c.catMild, moderate: c.catModerate, severe: c.catSevere, occlusion: c.catOcclusion,
  })[cat];

  const getReportText = () => {
    const lines = [];
    if (showElig) lines.push(`${c.eligLabel}: ${pctElig.toFixed(0)}% (${categoryLabel(catElig)})`);
    if (showAnalysis) lines.push(`${c.analysisLabel}: ${pctAnalysis.toFixed(0)}% (${categoryLabel(catAnalysis)})`);
    if (showResidual) lines.push(`${c.residualLabel}: ${M1.toFixed(1)} mm`);
    if (flowRelated) lines.push(c.flowRelatedNote);
    if (showElig || showAnalysis) {
      const cat = showAnalysis ? catAnalysis : catElig;
      lines.push({ mild: c.resultMild, moderate: c.resultModerate, severe: c.resultSevere, occlusion: c.resultOcclusion }[cat]);
    }
    return lines.join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setMeasure1(''); setMeasure2(''); setMeasure3(''); setTotalOcclusion(false); setFlowRelated(false); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAny ? 'pb-56' : ''}`}>
      <Card>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">{c.schemeTitle}</p>
        <ZoomableDiagram title={c.schemeTitle} labels={t.common.diagramZoom} legend={<NascetLegend c={c} />}>
          <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
            <NascetDiagram c={c} />
          </div>
        </ZoomableDiagram>
        <div className="mt-3">
          <NascetLegend c={c} />
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={totalOcclusion} onChange={() => { setTotalOcclusion((v) => !v); setFlowRelated(false); }} className="w-4 h-4 rounded" />
            {c.totalOcclusionLabel}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={flowRelated} onChange={() => { setFlowRelated((v) => !v); setTotalOcclusion(false); }} className="w-4 h-4 rounded" />
            {c.flowRelatedLabel}
          </label>
        </div>

        {!usingToggle && (
          <div className="pt-2 space-y-3">
            <NumberField label={c.measure1Label} placeholder={c.measurePh} value={measure1} onChange={setMeasure1} />
            <NumberField label={c.measure2Label} placeholder={c.measurePh} value={measure2} onChange={setMeasure2} />
            <NumberField label={c.measure3Label} placeholder={c.measurePh} value={measure3} onChange={setMeasure3} />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{c.denominatorPrecisionNote}</p>
          </div>
        )}
      </Card>

      {flowRelated && (
        <div className="rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 p-3">
          <p className="text-xs text-sky-800 dark:text-sky-200">{c.flowRelatedNote}</p>
        </div>
      )}

      {showElig && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.eligLabel}</span>
          <span className={`text-2xl font-black ${CATEGORY_COLOR[catElig]}`}>{pctElig.toFixed(0)}%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{categoryLabel(catElig)}</span>
        </Card>
      )}

      {showAnalysis && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.analysisLabel}</span>
          <span className={`text-2xl font-black ${CATEGORY_COLOR[catAnalysis]}`}>{pctAnalysis.toFixed(0)}%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{categoryLabel(catAnalysis)}</span>
        </Card>
      )}

      {showResidual && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.residualLabel}</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{M1.toFixed(1)} mm</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1 leading-snug">{c.residualNote}</span>
        </Card>
      )}

      {(showElig || showAnalysis) && (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
            {{ mild: c.resultMild, moderate: c.resultModerate, severe: c.resultSevere, occlusion: c.resultOcclusion }[showAnalysis ? catAnalysis : catElig]}
          </p>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.nascetStenosis} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasAny && (
        <StickyBar>
          <div className="min-w-0 text-center">
            {showElig && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.eligLabel}:</span>
                <span className={`text-3xl font-black flex items-center justify-center gap-2 leading-tight ${CATEGORY_COLOR[catElig]}`}>
                  {catElig === 'severe' ? <IconAlertTriangle size={24} /> : <IconCheckCircle size={24} />}
                  {pctElig.toFixed(0)}%
                </span>
              </>
            )}
            {showAnalysis && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block mt-2">{c.analysisLabel}:</span>
                <span className={`text-3xl font-black flex items-center justify-center gap-2 leading-tight ${CATEGORY_COLOR[catAnalysis]}`}>
                  {catAnalysis === 'severe' ? <IconAlertTriangle size={24} /> : <IconCheckCircle size={24} />}
                  {pctAnalysis.toFixed(0)}%
                </span>
              </>
            )}
            {!showElig && !showAnalysis && showResidual && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.residualLabel}:</span>
                <span className="text-3xl font-black leading-tight text-slate-700 dark:text-slate-200">{M1.toFixed(1)} mm</span>
              </>
            )}
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

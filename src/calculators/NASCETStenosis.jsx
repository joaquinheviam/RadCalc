import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconAlertTriangle, IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

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

function NascetDiagram() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" className="w-full h-auto" style={{ maxWidth: '100%' }}>
      <defs>
        <linearGradient id="nascetBloodFlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fee2e2" />
          <stop offset="50%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#fee2e2" />
        </linearGradient>
        <linearGradient id="nascetPlaqueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>

      <style>
        {`
          .nascet-title { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 24px; font-weight: 700; fill: #0f172a; }
          .nascet-subtitle { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 16px; font-weight: 600; fill: #475569; }
          .nascet-label-main { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 16px; font-weight: 600; fill: #1e293b; }
          .nascet-label-sub { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 13px; font-weight: 400; fill: #64748b; }
          .nascet-math { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 17px; fill: #2563eb; font-weight: 700; }
        `}
      </style>

      {/* Pared arterial / Flujo sanguíneo de fondo */}
      <path d="M 350 500 L 350 350 C 300 300, 300 200, 340 100 L 340 40 L 460 40 L 460 100 C 500 200, 500 300, 450 350 L 450 500 Z"
            fill="url(#nascetBloodFlow)" stroke="#ef4444" strokeWidth="3" />

      {/* Flecha de dirección del flujo sanguíneo */}
      <g stroke="#991b1b" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="400" y1="480" x2="400" y2="410" />
        <polyline points="390,422 400,410 410,422" />
      </g>
      <text x="420" y="450" className="nascet-label-sub" style={{ fill: '#991b1b', fontWeight: 600 }}>Dirección del flujo</text>

      {/* Placa aterosclerótica izquierda */}
      <path d="M 350 350 C 300 300, 300 200, 340 100 C 375 160, 395 260, 350 350 Z"
            fill="url(#nascetPlaqueGrad)" stroke="#ca8a04" strokeWidth="2" />

      {/* Placa aterosclerótica derecha */}
      <path d="M 450 350 C 500 300, 500 200, 460 100 C 425 160, 405 260, 450 350 Z"
            fill="url(#nascetPlaqueGrad)" stroke="#ca8a04" strokeWidth="2" />

      {/* Medida 3: diámetro distal normal (denominador) */}
      <line x1="340" y1="70" x2="460" y2="70" stroke="#2563eb" strokeWidth="4" />
      <path d="M 340 62 L 340 78 M 460 62 L 460 78" stroke="#2563eb" strokeWidth="3" />
      <line x1="470" y1="70" x2="520" y2="70" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
      <text x="530" y="75" className="nascet-label-main">Diámetro distal normal (D)</text>
      <text x="530" y="93" className="nascet-label-sub">Arteria sana posterior al bulbo (Medida 3)</text>

      {/* Medida 1: lumen residual mínimo (numerador) */}
      <line x1="387" y1="230" x2="413" y2="230" stroke="#dc2626" strokeWidth="4" />
      <path d="M 387 222 L 387 238 M 413 222 L 413 238" stroke="#dc2626" strokeWidth="3" />
      <line x1="423" y1="230" x2="520" y2="230" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
      <text x="530" y="235" className="nascet-label-main">Lumen residual mínimo (L)</text>
      <text x="530" y="253" className="nascet-label-sub">Mayor estrechez en el bulbo (Medida 1)</text>

      {/* Tarjeta de referencia (fórmula) */}
      <rect x="40" y="40" width="260" height="150" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      <text x="60" y="75" className="nascet-title">Método NASCET</text>
      <text x="60" y="110" className="nascet-subtitle">Fórmula de severidad:</text>
      <text x="60" y="145" className="nascet-math">% Estenosis = (1 - L / D) × 100</text>
    </svg>
  );
}

export default function NASCETStenosis() {
  const { t } = useLang();
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

  const hasAny = showElig || showAnalysis;

  const categoryLabel = (cat) => ({
    mild: c.catMild, moderate: c.catModerate, severe: c.catSevere, occlusion: c.catOcclusion,
  })[cat];

  const handleCopy = () => {
    const lines = [];
    if (showElig) lines.push(`${c.eligLabel}: ${pctElig.toFixed(0)}% (${categoryLabel(catElig)})`);
    if (showAnalysis) lines.push(`${c.analysisLabel}: ${pctAnalysis.toFixed(0)}% (${categoryLabel(catAnalysis)})`);
    if (flowRelated) lines.push(c.flowRelatedNote);
    const cat = showAnalysis ? catAnalysis : catElig;
    lines.push({ mild: c.resultMild, moderate: c.resultModerate, severe: c.resultSevere, occlusion: c.resultOcclusion }[cat]);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setMeasure1(''); setMeasure2(''); setMeasure3(''); setTotalOcclusion(false); setFlowRelated(false); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAny ? 'pb-56' : ''}`}>
      <Card>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">{c.schemeTitle}</p>
        <div className="flex justify-center rounded-xl bg-slate-50 p-3">
          <NascetDiagram />
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
          <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">{categoryLabel(catElig)}</span>
        </Card>
      )}

      {showAnalysis && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.analysisLabel}</span>
          <span className={`text-2xl font-black ${CATEGORY_COLOR[catAnalysis]}`}>{pctAnalysis.toFixed(0)}%</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">{categoryLabel(catAnalysis)}</span>
        </Card>
      )}

      {hasAny && (
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

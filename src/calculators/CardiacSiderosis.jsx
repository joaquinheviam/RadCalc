import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconBookOpen } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion, ZoomableDiagram } from '../components/shared/index.js';

// Esquema de eje corto medioventricular con el ROI correcto (septo
// medioseptal) vs. el incorrecto (pared libre lateral, artefactos de
// susceptibilidad). Diseño y geometría fijados con Gemini: se integra tal
// cual (sin redibujar formas ni recolorear), como función local del archivo
// de la calculadora igual que el resto de los esquemas de RadioCalc (ver
// BrainAVM.jsx). Los textos llegan por `labels` y se mantienen cortos para
// que los rótulos laterales quepan dentro del viewBox.
function CardiacSiderosisDiagram({ labels }) {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-4">
      <svg
        viewBox="0 0 520 320"
        className="h-auto w-full max-w-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sombra nativa SVG, id único para evitar colisiones con otros esquemas */}
          <filter id="siderosisCardiacShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>

          {/* Patrón de líneas para simular artefactos de susceptibilidad magnética */}
          <pattern id="susceptibilityArtifact" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="2" opacity="0.3" />
          </pattern>
        </defs>

        {/* --- GRUPO ANATÓMICO (Adaptable a modo claro/oscuro) --- */}
        <g filter="url(#siderosisCardiacShadow)">
          {/* Miocardio del Ventrículo Izquierdo (VI) - Forma de dona */}
          <path
            d="M 260,60 A 100,100 0 1,0 260,260 A 100,100 0 1,0 260,60 Z M 260,110 A 50,50 0 1,1 260,210 A 50,50 0 1,1 260,110 Z"
            className="text-slate-200 dark:text-slate-700/80"
            fill="currentColor"
          />
          {/* Contornos del VI para definición */}
          <path
            d="M 260,60 A 100,100 0 1,0 260,260 A 100,100 0 1,0 260,60 Z"
            className="text-slate-400 dark:text-slate-500"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M 260,110 A 50,50 0 1,1 260,210 A 50,50 0 1,1 260,110 Z"
            className="text-slate-400 dark:text-slate-500"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Miocardio del Ventrículo Derecho (VD) - Forma de semiluna adherida al septo */}
          <path
            d="M 180,75 C 60,70 30,220 80,280 C 110,315 175,255 175,255 C 130,220 115,190 115,160 C 115,125 145,100 180,75 Z"
            className="text-slate-200 dark:text-slate-700/80"
            fill="currentColor"
          />
          {/* Contorno exterior del VD */}
          <path
            d="M 180,75 C 60,70 30,220 80,280 C 110,315 175,255 175,255"
            className="text-slate-400 dark:text-slate-500"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* --- HALLAZGOS Y ESTRUCTURAS CLÍNICAS (Colores fijos) --- */}

        {/* Zona de Artefactos de susceptibilidad (Interfase pulmón/venas en pared libre) */}
        <path
          d="M 350,90 Q 390,160 350,230 A 100,100 0 0,0 350,90 Z"
          fill="url(#susceptibilityArtifact)"
        />
        <path
          d="M 370,120 Q 385,160 370,200 M 380,135 Q 395,160 380,185"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* ROI CORRECTO (Septo Interventricular Medioseptal) */}
        <rect
          x="168"
          y="146"
          width="28"
          height="28"
          rx="4"
          fill="#10b981"
          fillOpacity="0.15"
          stroke="#10b981"
          strokeWidth="2"
        />
        {/* Checkmark verde */}
        <path
          d="M 174,160 L 180,166 L 190,154"
          stroke="#10b981"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ROI INCORRECTO (Pared Libre Lateral) */}
        <rect
          x="324"
          y="146"
          width="28"
          height="28"
          rx="4"
          fill="#ef4444"
          fillOpacity="0.1"
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
        {/* Cruz roja */}
        <path
          d="M 330,152 L 346,168 M 346,152 L 330,168"
          stroke="#ef4444"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* --- TEXTOS Y ETIQUETAS --- */}

        {/* Cavidades (Texto corto, centrado) */}
        <text
          x="260"
          y="166"
          className="text-slate-400 dark:text-slate-400"
          fill="currentColor"
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {labels.lvAbrev}
        </text>
        <text
          x="145"
          y="166"
          className="text-slate-400 dark:text-slate-400"
          fill="currentColor"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {labels.rvAbrev}
        </text>

        {/* Línea indicadora: ROI Correcto */}
        <line
          x1="182"
          y1="142"
          x2="150"
          y2="60"
          stroke="currentColor"
          className="text-slate-400"
          strokeWidth="1.5"
        />
        <circle cx="150" cy="60" r="3" className="text-slate-400" fill="currentColor" />
        <text
          x="142"
          y="56"
          className="text-slate-700 dark:text-slate-200"
          fill="currentColor"
          fontSize="14"
          fontWeight="bold"
          textAnchor="end"
        >
          {labels.septumCorrect}
        </text>
        <text
          x="142"
          y="74"
          className="text-slate-500 dark:text-slate-400"
          fill="currentColor"
          fontSize="12"
          textAnchor="end"
        >
          {labels.septumDesc}
        </text>

        {/* Línea indicadora: ROI Incorrecto / Artefactos */}
        <line
          x1="338"
          y1="142"
          x2="380"
          y2="60"
          stroke="currentColor"
          className="text-slate-400"
          strokeWidth="1.5"
        />
        <circle cx="380" cy="60" r="3" className="text-slate-400" fill="currentColor" />
        <text
          x="388"
          y="56"
          className="text-slate-700 dark:text-slate-200"
          fill="currentColor"
          fontSize="14"
          fontWeight="bold"
          textAnchor="start"
        >
          {labels.freeWallIncorrect}
        </text>
        <text
          x="388"
          y="74"
          className="text-slate-500 dark:text-slate-400"
          fill="currentColor"
          fontSize="12"
          textAnchor="start"
        >
          {labels.artifactDesc}
        </text>
      </svg>
    </div>
  );
}

// Categorías por T2* miocárdico (1.5 T). Umbrales: >20 ms normal, <20 ms
// sobrecarga, <10 ms grave, <6 ms riesgo muy alto (Anderson 2001; Kirk 2009).
function categorize(t2) {
  if (t2 > 20) return { key: 'normal', color: 'text-emerald-500', tone: 'emerald' };
  if (t2 >= 10) return { key: 'mildModerate', color: 'text-amber-500', tone: 'amber' };
  if (t2 >= 6) return { key: 'severe', color: 'text-orange-500', tone: 'red' };
  return { key: 'verySevere', color: 'text-red-500', tone: 'red' };
}

export default function CardiacSiderosis() {
  const { t } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.cardiacSiderosis;
  const [inputType, setInputType] = useState('t2star');
  const [val, setVal] = useState('');
  const numericVal = parseFloat(String(val).replace(',', '.'));
  const isValid = !isNaN(numericVal) && numericVal > 0;
  let r2star = 0, t2star = 0;
  if (isValid) {
    if (inputType === 't2star') { t2star = numericVal; r2star = 1000 / t2star; }
    else { r2star = numericVal; t2star = 1000 / r2star; }
  }
  // Calibración de Carpenter et al. 2011 (1.5 T): [Fe] = 45.0 × (T2*)^-1.22,
  // en mg/g de peso seco.
  const fe = isValid ? 45.0 * Math.pow(t2star, -1.22) : 0;
  const cat = isValid ? categorize(t2star) : null;
  const result = cat ? c.results[cat.key] : null;
  // Riesgo de insuficiencia cardíaca a 1 año por subtramo (Kirk 2009).
  const hfRisk = !isValid || t2star >= 10 ? null : t2star >= 8 ? c.hfRisk8to10 : t2star >= 6 ? c.hfRisk6to8 : c.hfRiskBelow6;

  const getReportText = () => (isValid ? c.reportText(t2star.toFixed(1), r2star.toFixed(1), fe.toFixed(2), result.title) : '');
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setInputType('t2star'); setVal(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${isValid ? 'pb-56' : ''}`}>
      <InfoBox tone="amber">{c.fieldStrengthNote}</InfoBox>
      <Card>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-1">
          <button
            onClick={() => { setInputType('t2star'); setVal(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${inputType === 't2star' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {c.enterT2}
          </button>
          <button
            onClick={() => { setInputType('r2star'); setVal(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${inputType === 'r2star' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {c.enterR2}
          </button>
        </div>
        <NumberField
          label={`${c.valueOf} ${inputType === 't2star' ? 'T2* (ms)' : 'R2* (Hz)'}`}
          placeholder={inputType === 't2star' ? 'Ej: 14.5' : 'Ej: 70'}
          value={val}
          onChange={setVal}
        />
      </Card>

      <Accordion icon={<IconBookOpen size={16} />} title={c.diagramTitle}>
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">{c.diagramIntro}</p>
          <ZoomableDiagram title={c.diagramTitle} labels={t.common.diagramZoom}>
            <CardiacSiderosisDiagram labels={c.diagramLabels} />
          </ZoomableDiagram>
        </div>
      </Accordion>

      {isValid && (
        <Card>
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <span className="block text-xs text-slate-500">T2*</span>
              <span className="text-lg font-bold">{t2star.toFixed(1)} ms</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">R2*</span>
              <span className="text-lg font-bold">{r2star.toFixed(1)} Hz</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-2 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{c.feEstimated}</span>
            <span className={`text-4xl font-bold ${cat.color}`}>{fe.toFixed(2)}</span>
            <span className={`mt-2 font-semibold text-base ${cat.color}`}>{result.title}</span>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-snug">{result.desc}</p>
          </div>
          {hfRisk && <InfoBox tone="red">{hfRisk}</InfoBox>}
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.cardiacSiderosis} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {isValid && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.feEstimated}</span>
            <span className={`text-4xl font-black block ${cat.color}`}>{fe.toFixed(2)}</span>
            <span className={`text-base font-semibold block mt-1 ${cat.color}`}>{result.title}</span>
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

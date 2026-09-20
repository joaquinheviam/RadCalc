import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconBookOpen } from '../components/icons/index.js';
import { Card, Accordion, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const btnCls = (active) =>
  `w-full text-left p-2.5 rounded-lg border text-xs transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

function OptionButtons({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button key={opt.key} onClick={() => onChange(opt.key)} className={btnCls(value === opt.key)}>
          <span className="font-medium block">{opt.label}</span>
          {opt.desc && <span className="text-[11px] opacity-80 block mt-0.5">{opt.desc}</span>}
        </button>
      ))}
    </div>
  );
}

// Diagrama didáctico de la subclasificación T3 (a-d) y T4 (a/b), en corte
// transversal simplificado de la pared rectal (mismo criterio visual que
// PectusScheme/SeptateScheme: contornos en currentColor adaptables a ambos
// temas, badges de color fijo para cada hito, leyenda bilingüe fuera del SVG).
// T3a/b (buen pronóstico) en verde, T3c/d (mayor riesgo de recurrencia local)
// en rojo — distinción tomada literalmente de la fuente ("T3 a/b good
// prognosis... T3 c/d higher risk of local recurrence").
// Corte axial esquemático (el plano en que realmente se lee el T en RM de
// recto): luz central, muscular propia como anillo, grasa perirrectal entre
// la muscular y la fascia mesorrectal (MRF, anillo discontinuo externo), y
// la reflexión peritoneal como arco discontinuo únicamente en la porción
// antero-superior (solo el recto superior está peritonealizado). Cada
// categoría T se dibuja como una lesión propia en un punto distinto del
// anillo, con su profundidad de invasión a escala relativa entre la
// muscular y la MRF — igual criterio visual que el resto de la app
// (currentColor para la anatomía, badges de color fijo por hallazgo).
function RectalTScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 520 580" className="h-auto w-full max-w-sm text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Fascia mesorrectal (MRF) */}
        <circle cx="260" cy="260" r="185" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="7 6" className="text-slate-400 dark:text-slate-500" />
        {/* Muscular propia */}
        <circle cx="260" cy="260" r="110" fill="none" stroke="currentColor" strokeWidth="4.5" />
        {/* Luz (mucosa/submucosa), forma irregular */}
        <path
          fill="currentColor" className="text-slate-300 dark:text-slate-700"
          d="M 240,220 C 262,214 270,232 285,232 C 305,226 296,248 302,262 C 316,270 300,282 306,300 C 288,316 278,296 262,310 C 246,326 232,304 216,314 C 200,308 214,286 202,272 C 188,262 206,244 214,228 C 208,208 228,216 240,220 Z"
        />
        {/* Reflexión peritoneal (solo recto superior, arco antero-superior) */}
        <path d="M 141.2,176.8 A 145,145 0 0 1 378.8,176.8" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />

        {/* T1/T2: confinado a la pared, no cruza la muscular propia */}
        <ellipse cx="185" cy="260" rx="30" ry="19" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="2.5" />
        <rect x="82" y="250" width="46" height="20" rx="5" fill="#64748b" />
        <text x="105" y="264" fill="#ffffff" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">T1/T2</text>

        {/* T3a (<1mm) y T3b (1-5mm) más allá de la muscular: verde */}
        <ellipse cx="175.2" cy="175.2" rx="19" ry="19" fill="#059669" opacity="0.3" stroke="#059669" strokeWidth="2.5" />
        <rect x="122" y="122" width="24" height="20" rx="5" fill="#059669" />
        <text x="134" y="136" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">a</text>

        <ellipse cx="164.6" cy="355.4" rx="22" ry="22" fill="#059669" opacity="0.3" stroke="#059669" strokeWidth="2.5" />
        <rect x="108" y="382" width="24" height="20" rx="5" fill="#059669" />
        <text x="120" y="396" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">b</text>

        {/* T3c (5-15mm) y T3d (>15mm), acercándose a la MRF: rojo */}
        <ellipse cx="369.6" cy="369.6" rx="25" ry="25" fill="#dc2626" opacity="0.28" stroke="#dc2626" strokeWidth="2.5" />
        <rect x="396" y="400" width="24" height="20" rx="5" fill="#dc2626" />
        <text x="408" y="414" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">c</text>

        <ellipse cx="371.7" cy="148.3" rx="23" ry="23" fill="#dc2626" opacity="0.28" stroke="#dc2626" strokeWidth="2.5" />
        <rect x="398" y="115" width="24" height="20" rx="5" fill="#dc2626" />
        <text x="410" y="129" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">d</text>

        {/* T3 con MRF+ (margen circunferencial <1mm): toca la fascia */}
        <ellipse cx="425" cy="260" rx="40" ry="19" fill="#dc2626" opacity="0.32" stroke="#dc2626" strokeWidth="2.5" />
        <rect x="447" y="288" width="58" height="20" rx="5" fill="#dc2626" />
        <text x="476" y="302" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">MRF+</text>

        {/* T4a: perfora a través de la reflexión peritoneal */}
        <ellipse cx="260" cy="108" rx="19" ry="42" fill="#dc2626" opacity="0.32" stroke="#dc2626" strokeWidth="2.5" />
        <line x1="260" y1="66" x2="260" y2="30" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#rcArrow)" />
        <rect x="228" y="8" width="64" height="20" rx="5" fill="#dc2626" />
        <text x="260" y="22" fill="#ffffff" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">T4a</text>

        {/* T4b: atraviesa la MRF hacia un órgano/estructura adyacente */}
        <ellipse cx="260" cy="450" rx="19" ry="42" fill="#dc2626" opacity="0.32" stroke="#dc2626" strokeWidth="2.5" />
        <line x1="260" y1="492" x2="260" y2="508" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#rcArrow)" />
        <circle cx="260" cy="540" r="30" fill="currentColor" className="text-slate-300 dark:text-slate-700" stroke="currentColor" strokeWidth="2" />
        <rect x="228" y="565" width="64" height="20" rx="5" fill="#dc2626" />
        <text x="260" y="579" fill="#ffffff" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">T4b</text>

        <defs>
          <marker id="rcArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Diagrama coronal del complejo esfinteriano, relevante solo para el recto
// bajo: IS (esfínter interno / continuación de la muscular propia), ISS
// (plano interesfinteriano graso) y ES (esfínter externo / elevador del
// ano). Reconstruido en currentColor + badges de color fijo a partir de la
// referencia de la usuaria (que usaba fondo blanco fijo y relleno de color
// por capa) — aquí las tres capas se distinguen por contorno/trama en vez
// de relleno de color, para que se lea igual en ambos temas.
function SphincterComplexScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 400 320" className="h-auto w-full max-w-xs text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* ES: esfínter externo / elevador del ano (capa más externa) */}
        <path
          fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          className="text-slate-400 dark:text-slate-500"
          d="M 100,40 C 60,60 40,110 44,160 L 44,260 C 44,280 60,290 70,278 L 70,170 C 68,120 84,75 115,50 Z
             M 300,40 C 340,60 360,110 356,160 L 356,260 C 356,280 340,290 330,278 L 330,170 C 332,120 316,75 285,50 Z"
        />
        {/* ISS: espacio interesfinteriano (graso), banda intermedia */}
        <path
          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 5"
          className="text-slate-400 dark:text-slate-500"
          d="M 118,55 C 92,85 80,125 82,165 L 82,255 C 82,268 94,274 100,266 L 100,160 C 99,120 108,88 128,65 Z
             M 282,55 C 308,85 320,125 318,165 L 318,255 C 318,268 306,274 300,266 L 300,160 C 301,120 292,88 272,65 Z"
        />
        {/* IS: esfínter interno, continuación directa de la muscular propia rectal */}
        <path
          fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
          d="M 150,20 C 122,55 108,105 110,150 L 110,250 C 110,265 124,270 132,260 L 132,148 C 131,110 142,68 168,35 Z
             M 250,20 C 278,55 292,105 290,150 L 290,250 C 290,265 276,270 268,260 L 268,148 C 269,110 258,68 232,35 Z"
        />

        {/* Tumor izquierdo: compromete IS + ISS, respeta ES */}
        <path
          fill="#1d4ed8" opacity="0.55" stroke="#1d4ed8" strokeWidth="2"
          d="M 118,190 C 132,180 148,196 150,212 C 158,226 148,246 130,244 C 110,252 96,232 100,214 C 96,200 108,192 118,190 Z"
        />
        <rect x="60" y="290" width="20" height="18" rx="4" fill="#1d4ed8" />
        <text x="70" y="303" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">1</text>

        {/* Tumor derecho: compromete IS + ISS + ES */}
        <path
          fill="#78350f" opacity="0.6" stroke="#78350f" strokeWidth="2"
          d="M 282,175 C 300,165 318,180 322,198 C 332,214 322,238 298,236 C 276,248 256,228 262,206 C 256,190 270,180 282,175 Z"
        />
        <rect x="320" y="290" width="20" height="18" rx="4" fill="#78350f" />
        <text x="330" y="303" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">2</text>
      </svg>
    </div>
  );
}

// Diagrama de distribución ganglionar (N vs. M) según la ubicación del
// tumor: los ganglios inguinales/ilíacos externos son N (regional) SOLO si
// el tumor invade el canal anal bajo la línea dentada (compromiso ES); en
// cualquier otro caso son M1 (a distancia). El resto de las estaciones
// (mesorrectales/presacros/mesentéricos inferiores = "*"; ilíacos
// internos/obturatrices = "+"; ilíacos comunes/retroperitoneo = "&") no
// cambian con la localización del tumor.
function NodalDistributionScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 420 260" className="h-auto w-full max-w-md text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Eje vascular esquemático (aorta distal + ilíacas), común a ambos paneles */}
        {[0, 220].map((ox) => (
          <g key={ox} transform={`translate(${ox},0)`}>
            <path d="M 100,10 L 100,50 L 55,140 L 35,220 M 100,50 L 145,140 L 165,220" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-slate-400 dark:text-slate-500" />
            {/* Recto esquemático */}
            <path d="M 78,95 Q 100,108 122,95 L 116,175 Q 100,160 84,175 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          </g>
        ))}

        {/* Panel A (izquierda, x 0-200): recto medio/alto, sin invasión anal
            — inguinales/ilíacos externos son M (rojo) */}
        <ellipse cx="45" cy="30" rx="12" ry="20" fill="#dc2626" opacity="0.55" transform="rotate(25 45 30)" />
        <ellipse cx="155" cy="30" rx="12" ry="20" fill="#dc2626" opacity="0.55" transform="rotate(-25 155 30)" />
        <text x="100" y="16" fontSize="10" fontWeight="700" textAnchor="middle" fill="#dc2626" fontFamily="system-ui, sans-serif">&amp;</text>

        <ellipse cx="100" cy="115" rx="16" ry="42" fill="#1d4ed8" opacity="0.4" />
        <ellipse cx="62" cy="115" rx="11" ry="28" fill="#1d4ed8" opacity="0.4" transform="rotate(12 62 115)" />
        <ellipse cx="138" cy="115" rx="11" ry="28" fill="#1d4ed8" opacity="0.4" transform="rotate(-12 138 115)" />

        <ellipse cx="30" cy="200" rx="13" ry="42" fill="#dc2626" opacity="0.5" transform="rotate(18 30 200)" />
        <ellipse cx="170" cy="200" rx="13" ry="42" fill="#dc2626" opacity="0.5" transform="rotate(-18 170 200)" />

        {/* Panel B (derecha, offset +220): recto bajo con invasión del canal
            anal — inguinales/ilíacos externos pasan a ser N (azul) */}
        <g transform="translate(220,0)">
          <ellipse cx="45" cy="30" rx="12" ry="20" fill="#dc2626" opacity="0.55" transform="rotate(25 45 30)" />
          <ellipse cx="155" cy="30" rx="12" ry="20" fill="#dc2626" opacity="0.55" transform="rotate(-25 155 30)" />
          <text x="100" y="16" fontSize="10" fontWeight="700" textAnchor="middle" fill="#dc2626" fontFamily="system-ui, sans-serif">&amp;</text>

          <ellipse cx="100" cy="115" rx="16" ry="42" fill="#1d4ed8" opacity="0.4" />
          <ellipse cx="62" cy="115" rx="11" ry="28" fill="#1d4ed8" opacity="0.4" transform="rotate(12 62 115)" />
          <ellipse cx="138" cy="115" rx="11" ry="28" fill="#1d4ed8" opacity="0.4" transform="rotate(-12 138 115)" />

          {/* tumor extendido al canal anal */}
          <ellipse cx="100" cy="168" rx="14" ry="18" fill="#451a03" opacity="0.7" />

          <ellipse cx="30" cy="200" rx="13" ry="42" fill="#1d4ed8" opacity="0.4" transform="rotate(18 30 200)" />
          <ellipse cx="170" cy="200" rx="13" ry="42" fill="#1d4ed8" opacity="0.4" transform="rotate(-18 170 200)" />
        </g>

        {/* Divisor entre paneles */}
        <line x1="205" y1="5" x2="205" y2="235" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" className="text-slate-200 dark:text-slate-700" />
      </svg>
    </div>
  );
}

const T_STAGE_KEYS = ['t1t2', 't3a', 't3b', 't3c', 't3d', 't4a', 't4b'];
const T3_KEYS = ['t3a', 't3b', 't3c', 't3d'];
const T3_OR_T4_KEYS = [...T3_KEYS, 't4a', 't4b'];

export default function RectalCancerMRI() {
  const { t } = useLang();
  const c = t.calc.rectalCancer;

  const [mode, setMode] = useState('primary'); // 'primary' | 'restaging'
  const [location, setLocation] = useState(null);
  const [morphology, setMorphology] = useState(null);
  const [mucin, setMucin] = useState(null);
  const [tStage, setTStage] = useState(null);
  const [sphincter, setSphincter] = useState(null);
  const [mrf, setMrf] = useState(null);
  const [emvi, setEmvi] = useState(null);
  const [nodesPrimary, setNodesPrimary] = useState(null); // 'n0'|'n_ge9'|'n_5to9'|'n_lt5'
  const [nodesRestaging, setNodesRestaging] = useState(null); // 'negative'|'positive'
  const [mrTrg, setMrTrg] = useState(null);

  const switchMode = (m) => {
    setMode(m);
    setTStage(null);
    setMrf(null);
    setEmvi(null);
    setNodesPrimary(null);
    setNodesRestaging(null);
    setMrTrg(null);
  };

  const resetAll = () => {
    switchMode('primary');
    setLocation(null);
    setMorphology(null);
    setMucin(null);
    setSphincter(null);
  };

  const tOptions = T_STAGE_KEYS.map((key) => ({ key, label: c.tOpts[key] }));
  const nodesPrimaryOptions = ['n0', 'n_ge9', 'n_5to9', 'n_lt5'].map((key) => ({ key, label: c.nodesPrimaryOpts[key] }));
  const trgOptions = ['1', '2', '3', '4', '5'].map((key) => ({ key, label: c.trgOpts[key], desc: key === '1' ? c.trg1Desc : null }));

  const nodesPositive = mode === 'primary' ? nodesPrimary && nodesPrimary !== 'n0' : nodesRestaging === 'positive';
  const nodesAnswered = mode === 'primary' ? nodesPrimary !== null : nodesRestaging !== null;

  // --- Etapificación primaria: LARC per NCCN ("T3 or T4, or any TN+") y ESMO
  // (T3c/d, recto muy bajo, EMVI+, T3 con MRF comprometida, o T4b). El criterio
  // ESMO de "ganglio lateral comprometido" y "elevador amenazado" no se evalúan
  // aquí porque Fase 1 no definió variables de entrada específicas para ellos.
  const isT3orT4 = tStage && T3_OR_T4_KEYS.includes(tStage);
  const nccnLarc = isT3orT4 || nodesPositive;
  const esmoLarc = tStage === 't3c' || tStage === 't3d' || tStage === 't4b'
    || location === 'lower'
    || emvi === 'yes'
    || (tStage && T3_KEYS.includes(tStage) && mrf === 'involved');

  let primaryVerdict = null;
  if (mode === 'primary' && tStage) {
    if (tStage === 't1t2') {
      primaryVerdict = { key: 'earlyT', tone: 'emerald', text: c.verdictEarlyT };
    } else if (T3_KEYS.slice(0, 2).includes(tStage) && location === 'upper' && nodesAnswered && !nodesPositive) {
      primaryVerdict = { key: 'lowRisk', tone: 'emerald', text: c.verdictLowRiskT3 };
    } else if (nodesAnswered && (nccnLarc || esmoLarc)) {
      primaryVerdict = { key: 'larc', tone: 'amber', text: c.verdictLarc };
    }
  }

  // --- Reetapificación: mrTRG + estado ganglionar orientan Watch & Wait vs cirugía.
  let restagingVerdict = null;
  if (mode === 'restaging' && mrTrg && nodesAnswered) {
    if (mrTrg === '1' && !nodesPositive) {
      restagingVerdict = { key: 'complete', tone: 'emerald', text: c.verdictComplete };
    } else if (mrTrg === '2' && !nodesPositive) {
      restagingVerdict = { key: 'nearComplete', tone: 'emerald', text: c.verdictNearComplete };
    } else if (nodesPositive && (mrTrg === '1' || mrTrg === '2')) {
      restagingVerdict = { key: 'goodTumorNodePos', tone: 'amber', text: c.verdictGoodTumorNodePos };
    } else {
      restagingVerdict = { key: 'incomplete', tone: 'red', text: c.verdictIncomplete };
    }
  }

  const verdict = mode === 'primary' ? primaryVerdict : restagingVerdict;
  const hasInteracted = !!(location || tStage || mrTrg);

  const buildReport = () => {
    const lines = [mode === 'primary' ? c.primaryStaging : c.restaging];
    if (location) lines.push(`${c.locationLbl}: ${c.locOpts.find((o) => o.key === location)?.label}`);
    if (morphology) lines.push(`${c.morphologyLbl}: ${c.morphOpts.find((o) => o.key === morphology)?.label}`);
    if (mucin) lines.push(`${c.mucinLbl}: ${c.mucinOpts.find((o) => o.key === mucin)?.label}`);
    if (tStage) lines.push(`${mode === 'primary' ? c.tStageLbl : c.ytStageLbl}: ${c.tOpts[tStage]}`);
    if (location === 'lower' && sphincter) lines.push(`${c.sphincterLbl}: ${c.sphincterOpts.find((o) => o.key === sphincter)?.label}`);
    if (mrf) lines.push(`${c.mrfLbl}: ${c.mrfOpts.find((o) => o.key === mrf)?.label}`);
    if (emvi) lines.push(`EMVI: ${emvi === 'yes' ? c.yes : c.no}`);
    if (mode === 'primary' && nodesPrimary) lines.push(`${c.nodesLbl}: ${c.nodesPrimaryOpts[nodesPrimary]}`);
    if (mode === 'restaging' && nodesRestaging) lines.push(`${c.nodesLbl}: ${nodesRestaging === 'positive' ? c.nodesRestagingPositive : c.nodesRestagingNegative}`);
    if (mode === 'restaging' && mrTrg) lines.push(`mrTRG: ${c.trgOpts[mrTrg]}`);
    if (verdict) lines.push(`\n${c.conclusion}: ${verdict.text}`);
    return lines.join('\n');
  };

  const handleCopy = () => copyToClipboard(buildReport(), t.common.copiedOk, t.common.copiedErr);

  return (
    <div className={`space-y-4 animate-in fade-in ${hasInteracted ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.modeQ}</label>
        <div className="flex gap-2">
          <button onClick={() => switchMode('primary')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${mode === 'primary' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.primaryStaging}</button>
          <button onClick={() => switchMode('restaging')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${mode === 'restaging' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.restaging}</button>
        </div>
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.locationQ}</label>
        <OptionButtons options={[
          { key: 'upper', label: c.locOpts.find((o) => o.key === 'upper').label },
          { key: 'mid', label: c.locOpts.find((o) => o.key === 'mid').label },
          { key: 'lower', label: c.locOpts.find((o) => o.key === 'lower').label },
        ]} value={location} onChange={setLocation} />
      </Card>

      <Card>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{c.morphologyLbl}</label>
            <div className="space-y-1.5">
              {['polypoid', 'annular', 'partlyAnnular'].map((key) => (
                <button key={key} onClick={() => setMorphology(key)} className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all ${morphology === key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {c.morphOpts.find((o) => o.key === key).label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{c.mucinLbl}</label>
            <div className="space-y-1.5">
              {['none', 'some', 'mostly'].map((key) => (
                <button key={key} onClick={() => setMucin(key)} className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all ${mucin === key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {c.mucinOpts.find((o) => o.key === key).label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Accordion icon={<IconBookOpen size={16} />} title={c.diagramTitle}>
        <RectalTScheme />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-600 mr-1 align-[-1px]"></span>{c.legendGoodPrognosis}</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-600 mr-1 align-[-1px]"></span>{c.legendHigherRisk}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.diagramNote}</p>
      </Accordion>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{mode === 'primary' ? c.tStageQ : c.ytStageQ}</label>
        <OptionButtons options={tOptions} value={tStage} onChange={setTStage} />
      </Card>

      {location === 'lower' && (
        <>
          <Accordion icon={<IconBookOpen size={16} />} title={c.sphincterDiagramTitle} defaultOpen>
            <SphincterComplexScheme />
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-700 mr-1 align-[-1px]"></span>{c.sphincterLegend1}</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-800 mr-1 align-[-1px]"></span>{c.sphincterLegend2}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.sphincterDiagramNote}</p>
          </Accordion>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.sphincterQ}</label>
            <OptionButtons options={[
              { key: 'none', label: c.sphincterOpts.find((o) => o.key === 'none').label },
              { key: 'is', label: c.sphincterOpts.find((o) => o.key === 'is').label },
              { key: 'iss', label: c.sphincterOpts.find((o) => o.key === 'iss').label },
              { key: 'es', label: c.sphincterOpts.find((o) => o.key === 'es').label },
            ]} value={sphincter} onChange={setSphincter} />
          </Card>
        </>
      )}

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.mrfQ}</label>
        <OptionButtons options={[
          { key: 'clear', label: c.mrfOpts.find((o) => o.key === 'clear').label },
          { key: 'threatened', label: c.mrfOpts.find((o) => o.key === 'threatened').label },
          { key: 'involved', label: c.mrfOpts.find((o) => o.key === 'involved').label },
        ]} value={mrf} onChange={setMrf} />
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.emviQ}</label>
        <div className="flex gap-2">
          <button onClick={() => setEmvi('yes')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${emvi === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.yes}</button>
          <button onClick={() => setEmvi('no')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${emvi === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.no}</button>
        </div>
      </Card>

      <Accordion icon={<IconBookOpen size={16} />} title={c.nodalDiagramTitle}>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.nodalDiagramIntro}</p>
        <NodalDistributionScheme />
        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2">
          <p>{c.nodalDiagramPanelA}</p>
          <p>{c.nodalDiagramPanelB}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
          <p>{c.nodalLegendStar}</p>
          <p>{c.nodalLegendPlus}</p>
          <p>{c.nodalLegendAmp}</p>
          <p className="text-blue-600 dark:text-blue-400">{c.nodalLegendInguinalN}</p>
          <p className="text-red-600 dark:text-red-400">{c.nodalLegendInguinalM}</p>
        </div>
      </Accordion>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.nodesQ}</label>
        {mode === 'primary' ? (
          <OptionButtons options={nodesPrimaryOptions} value={nodesPrimary} onChange={setNodesPrimary} />
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setNodesRestaging('negative')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${nodesRestaging === 'negative' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.nodesRestagingNegative}</button>
            <button onClick={() => setNodesRestaging('positive')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${nodesRestaging === 'positive' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.nodesRestagingPositive}</button>
          </div>
        )}
        {mode === 'restaging' && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{c.nodesRestagingNote}</p>}
      </Card>

      {mode === 'restaging' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.mrTrgQ}</label>
          <OptionButtons options={trgOptions} value={mrTrg} onChange={setMrTrg} />
        </Card>
      )}

      {verdict && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <InfoBox tone={verdict.tone}>{verdict.text}</InfoBox>
        </Card>
      )}

      <InfoBox tone="slate">{c.lateralNodesNote}</InfoBox>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.rectalCancer} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasInteracted && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}:</span>
            <span className="text-sm font-bold leading-snug text-slate-800 dark:text-slate-100 block">
              {verdict ? verdict.text : c.pendingVerdict}
            </span>
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

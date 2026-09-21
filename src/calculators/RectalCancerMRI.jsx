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
      <svg viewBox="0 0 760 650" className="h-auto w-full max-w-lg text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Fascia mesorrectal (MRF): plano fascial, por eso discontinuo */}
        <circle cx="280" cy="310" r="185" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="7 6" className="text-slate-400 dark:text-slate-500" />
        {/* Muscular propia: pared sólida real */}
        <circle cx="280" cy="310" r="110" fill="none" stroke="currentColor" strokeWidth="4.5" />
        {/* Luz rectal, forma irregular */}
        <path
          fill="currentColor" className="text-slate-300 dark:text-slate-700"
          d="M 258,268 C 280,260 292,278 305,276 C 322,272 316,296 326,306 C 340,312 328,328 334,344 C 320,362 302,350 288,364 C 272,380 254,364 238,372 C 222,364 234,344 222,332 C 208,322 224,306 232,292 C 226,272 246,272 258,268 Z"
        />
        {/* Reflexión peritoneal (solo recto superior, arco antero-superior) */}
        <path d="M 161.2,226.8 A 145,145 0 0 1 398.8,226.8" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />

        {/* T1/T2: confinado a la pared, no cruza la muscular propia */}
        <ellipse cx="205" cy="310" rx="40" ry="25" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="2.5" />
        <text x="205" y="315" fill="currentColor" className="text-slate-700 dark:text-slate-200" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">T1/T2</text>

        {/* T3a (<1mm) y T3b (1-5mm) más allá de la muscular: buen pronóstico, verde */}
        <ellipse cx="195.2" cy="225.2" rx="30" ry="30" fill="#059669" opacity="0.85" stroke="#059669" strokeWidth="2.5" />
        <text x="195.2" y="231" fill="#ffffff" fontSize="17" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">a</text>

        <ellipse cx="184.6" cy="405.4" rx="32" ry="32" fill="#059669" opacity="0.85" stroke="#059669" strokeWidth="2.5" />
        <text x="184.6" y="411.5" fill="#ffffff" fontSize="17" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">b</text>

        {/* T3c (5-15mm) y T3d (>15mm), acercándose a la MRF: mayor riesgo, rojo */}
        <ellipse cx="389.6" cy="419.6" rx="33" ry="33" fill="#dc2626" opacity="0.82" stroke="#dc2626" strokeWidth="2.5" />
        <text x="389.6" y="425.5" fill="#ffffff" fontSize="17" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">c</text>

        <ellipse cx="391.7" cy="198.3" rx="32" ry="32" fill="#dc2626" opacity="0.82" stroke="#dc2626" strokeWidth="2.5" />
        <text x="391.7" y="204" fill="#ffffff" fontSize="17" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">d</text>

        {/* T3 con MRF+ (margen circunferencial <1mm): toca la fascia */}
        <ellipse cx="445" cy="310" rx="46" ry="30" fill="#dc2626" opacity="0.82" stroke="#dc2626" strokeWidth="2.5" />
        <text x="445" y="315.5" fill="#ffffff" fontSize="12.5" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">MRF+</text>

        {/* T4a: perfora a través de la reflexión peritoneal, se extiende más allá de la MRF */}
        <ellipse cx="280" cy="158" rx="27" ry="95" fill="#dc2626" opacity="0.82" stroke="#dc2626" strokeWidth="2.5" />
        <text x="280" y="163" fill="#ffffff" fontSize="15" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">T4a</text>

        {/* T4b: atraviesa la MRF hacia un órgano/estructura adyacente */}
        <ellipse cx="280" cy="500" rx="27" ry="95" fill="#dc2626" opacity="0.82" stroke="#dc2626" strokeWidth="2.5" />
        <text x="280" y="505" fill="#ffffff" fontSize="15" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">T4b</text>

        {/* Órgano/estructura adyacente (acento fijo naranja, no depende del tema) */}
        <g transform="translate(280,592)">
          <circle cx="0" cy="0" r="34" fill="#ea580c" />
          <circle cx="-10" cy="-10" r="15" fill="#f97316" opacity="0.6" />
          <text x="0" y="5" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">ÓRGANO</text>
        </g>

        {/* Etiquetas anatómicas con línea guía, en el margen derecho */}
        <g className="text-slate-500 dark:text-slate-400" fontSize="12.5" fontWeight="600" fontFamily="system-ui, sans-serif" fill="currentColor">
          <path d="M 490,180 L 405,222" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x="495" y="165">REFLEXIÓN</text>
          <text x="495" y="181">PERITONEAL</text>

          <path d="M 490,255 L 388,272" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x="495" y="250">MUSCULAR</text>
          <text x="495" y="266">PROPIA</text>

          <path d="M 490,310 L 465,310" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x="495" y="315">MRF</text>

          <path d="M 490,405 L 335,340" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x="495" y="400">LUZ</text>
          <text x="495" y="416">RECTAL</text>
        </g>

        {/* Leyenda embebida de subcategorías T3 (a-d) */}
        <g transform="translate(495,460)" className="text-slate-500 dark:text-slate-400" fontSize="12.5" fontWeight="600" fontFamily="system-ui, sans-serif" fill="currentColor">
          <text x="0" y="0">a: &lt;1 mm</text>
          <text x="0" y="20">b: 1-5 mm</text>
          <text x="0" y="40">c: 5-15 mm</text>
          <text x="0" y="60">d: &gt;15 mm</text>
        </g>
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
  // Contenido de un panel (recto + eje vascular + estaciones ganglionares),
  // reutilizado en espejo para A y B. `inguinalTone` decide si el paquete
  // inguinal/ilíaco externo se pinta como N (azul) o M1 (rojo); `tumorLow`
  // extiende el tumor hacia el canal anal (Panel B).
  function PanelContent({ inguinalTone, tumorLow }) {
    const inguinalFill = inguinalTone === 'n' ? '#1d4ed8' : '#dc2626';
    return (
      <>
        {/* Eje vascular: aorta distal → bifurcación ilíaca común → ilíaca
            externa (lateral, trazo grueso) e ilíaca interna (medial, trazo
            fino, rama propia) */}
        <path d="M 130,8 L 130,55 L 58,165 L 28,275 M 130,55 L 202,165 L 232,275" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500" />
        <path d="M 88,115 L 100,205 M 172,115 L 160,205" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-slate-400 dark:text-slate-500" />

        {/* Recto esquemático */}
        <path d="M 110,170 Q 130,183 150,170 L 145,250 Q 130,236 115,250 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Tumor: confinado al recto (Panel A) o extendido al canal anal (Panel B) */}
        <ellipse cx="130" cy={tumorLow ? 245 : 205} rx={tumorLow ? 18 : 16} ry={tumorLow ? 26 : 22} fill="#451a03" opacity="0.75" />

        {/* Mesorrectales/rectales superiores/presacros/mesentéricos inferiores (*): siempre N */}
        <ellipse cx="130" cy="205" rx="24" ry="68" fill="#1d4ed8" opacity="0.32" />
        <text x="130" y="148" fontSize="13" fontWeight="700" textAnchor="middle" fill="#1d4ed8" fontFamily="system-ui, sans-serif">*</text>

        {/* Ilíacos internos/obturatrices (+): siempre N, sobre la rama medial */}
        <ellipse cx="93" cy="160" rx="14" ry="40" fill="#1d4ed8" opacity="0.4" transform="rotate(18 93 160)" />
        <text x="93" y="160" fontSize="13" fontWeight="700" textAnchor="middle" fill="#1d4ed8" fontFamily="system-ui, sans-serif">+</text>
        <ellipse cx="167" cy="160" rx="14" ry="40" fill="#1d4ed8" opacity="0.4" transform="rotate(-18 167 160)" />
        <text x="167" y="160" fontSize="13" fontWeight="700" textAnchor="middle" fill="#1d4ed8" fontFamily="system-ui, sans-serif">+</text>

        {/* Ilíacos comunes/retroperitoneo (&amp;): siempre M1, sobre el tramo común */}
        <ellipse cx="95" cy="108" rx="15" ry="32" fill="#dc2626" opacity="0.45" transform="rotate(32 95 108)" />
        <text x="95" y="108" fontSize="13" fontWeight="700" textAnchor="middle" fill="#dc2626" fontFamily="system-ui, sans-serif">&amp;</text>
        <ellipse cx="165" cy="108" rx="15" ry="32" fill="#dc2626" opacity="0.45" transform="rotate(-32 165 108)" />
        <text x="165" y="108" fontSize="13" fontWeight="700" textAnchor="middle" fill="#dc2626" fontFamily="system-ui, sans-serif">&amp;</text>

        {/* Inguinales/ilíacos externos: N o M1 según invasión del canal anal, sobre la rama lateral */}
        <ellipse cx="43" cy="225" rx="16" ry="56" fill={inguinalFill} opacity="0.4" transform="rotate(22 43 225)" />
        <text x="43" y="225" fontSize="15" fontWeight="700" textAnchor="middle" fill={inguinalFill} fontFamily="system-ui, sans-serif">{'{'}</text>
        <ellipse cx="217" cy="225" rx="16" ry="56" fill={inguinalFill} opacity="0.4" transform="rotate(-22 217 225)" />
        <text x="217" y="225" fontSize="15" fontWeight="700" textAnchor="middle" fill={inguinalFill} fontFamily="system-ui, sans-serif">{'}'}</text>
      </>
    );
  }

  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 560 300" className="h-auto w-full max-w-xl text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Panel A: recto medio/alto, sin invasión del canal anal */}
        <g transform="translate(20,10)">
          <PanelContent inguinalTone="m" tumorLow={false} />
        </g>
        {/* Panel B: recto inferior con invasión del canal anal bajo la línea dentada */}
        <g transform="translate(300,10)">
          <PanelContent inguinalTone="n" tumorLow />
        </g>
        {/* Divisor entre paneles */}
        <line x1="285" y1="5" x2="285" y2="290" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" className="text-slate-200 dark:text-slate-700" />
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
  const [restagingSystem, setRestagingSystem] = useState('mrtrg'); // 'mrtrg'|'simplified'
  const [mrTrg, setMrTrg] = useState(null);
  const [simplifiedResponse, setSimplifiedResponse] = useState(null); // 'casiCompleta'|'parcial'|'pobre'

  const switchMode = (m) => {
    setMode(m);
    setTStage(null);
    setMrf(null);
    setEmvi(null);
    setNodesPrimary(null);
    setNodesRestaging(null);
    setRestagingSystem('mrtrg');
    setMrTrg(null);
    setSimplifiedResponse(null);
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
  const trgDescs = { 1: c.trg1Desc, 2: c.trg2Desc, 3: c.trg3Desc, 4: c.trg4Desc, 5: c.trg5Desc };
  const trgOptions = ['1', '2', '3', '4', '5'].map((key) => ({ key, label: c.trgOpts[key], desc: trgDescs[key] }));
  const responseAnswered = restagingSystem === 'mrtrg' ? mrTrg !== null : simplifiedResponse !== null;

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

  // --- Reetapificación: respuesta al tratamiento + estado ganglionar orientan
  // Watch & Wait vs cirugía. El radiólogo puede graduar la respuesta con el
  // sistema mrTRG (5 niveles, Awiwi et al. 2023) o con el sistema simplificado
  // de 3 niveles de Alarcón y Besa (2024); este último agrupa mrTRG 1-2 en una
  // sola categoría ("casi completa o completa") sin distinguir cuál de los dos,
  // por lo que su veredicto usa un texto combinado en vez de los textos
  // separados verdictComplete/verdictNearComplete del sistema mrTRG.
  let restagingVerdict = null;
  if (mode === 'restaging' && nodesAnswered && responseAnswered) {
    if (restagingSystem === 'mrtrg') {
      if (mrTrg === '1' && !nodesPositive) {
        restagingVerdict = { key: 'complete', tone: 'emerald', text: c.verdictComplete };
      } else if (mrTrg === '2' && !nodesPositive) {
        restagingVerdict = { key: 'nearComplete', tone: 'emerald', text: c.verdictNearComplete };
      } else if (nodesPositive && (mrTrg === '1' || mrTrg === '2')) {
        restagingVerdict = { key: 'goodTumorNodePos', tone: 'amber', text: c.verdictGoodTumorNodePos };
      } else {
        restagingVerdict = { key: 'incomplete', tone: 'red', text: c.verdictIncomplete };
      }
    } else {
      if (simplifiedResponse === 'casiCompleta' && !nodesPositive) {
        restagingVerdict = { key: 'casiCompletaSimplified', tone: 'emerald', text: c.verdictCasiCompletaSimplified };
      } else if (nodesPositive && simplifiedResponse === 'casiCompleta') {
        restagingVerdict = { key: 'goodTumorNodePos', tone: 'amber', text: c.verdictGoodTumorNodePos };
      } else if (simplifiedResponse === 'parcial') {
        restagingVerdict = { key: 'partialSimplified', tone: 'amber', text: c.verdictPartialSimplified };
      } else {
        restagingVerdict = { key: 'incomplete', tone: 'red', text: c.verdictIncomplete };
      }
    }
  }

  const verdict = mode === 'primary' ? primaryVerdict : restagingVerdict;
  const hasInteracted = !!(location || tStage || mrTrg || simplifiedResponse);

  // Resumen radiológico compacto (p. ej. "T3a, N+, EMVI-, MRF-"): describe los
  // hallazgos tal como los reportaría el radiólogo, independiente del veredicto
  // clínico/terapéutico (LARC, Watch & Wait, etc.), que se muestra aparte como
  // contexto. En reetapificación el T se antepone con "y" (yT), como en el resto
  // de la calculadora.
  const COMPACT_T = { t1t2: 'T1-T2', t3a: 'T3a', t3b: 'T3b', t3c: 'T3c', t3d: 'T3d', t4a: 'T4a', t4b: 'T4b' };
  const radiologicalSummary = () => {
    const parts = [];
    if (tStage) parts.push(`${mode === 'restaging' ? 'y' : ''}${COMPACT_T[tStage]}`);
    if (nodesAnswered) parts.push(nodesPositive ? 'N+' : 'N-');
    if (emvi) parts.push(emvi === 'yes' ? 'EMVI+' : 'EMVI-');
    if (mrf) parts.push(mrf === 'clear' ? 'MRF-' : mrf === 'involved' ? 'MRF+' : 'MRF~');
    return parts.length ? parts.join(', ') : null;
  };
  const radSummary = radiologicalSummary();

  const buildReport = () => {
    const lines = [mode === 'primary' ? c.primaryStaging : c.restaging];
    if (mode === 'primary' && location) lines.push(`${c.locationLbl}: ${c.locOpts.find((o) => o.key === location)?.label}`);
    if (mode === 'primary' && morphology) lines.push(`${c.morphologyLbl}: ${c.morphOpts.find((o) => o.key === morphology)?.label}`);
    if (mode === 'primary' && mucin) lines.push(`${c.mucinLbl}: ${c.mucinOpts.find((o) => o.key === mucin)?.label}`);
    if (tStage) lines.push(`${mode === 'primary' ? c.tStageLbl : c.ytStageLbl}: ${c.tOpts[tStage]}`);
    if (mode === 'primary' && location === 'lower' && sphincter) lines.push(`${c.sphincterLbl}: ${c.sphincterOpts.find((o) => o.key === sphincter)?.label}`);
    if (mrf) lines.push(`${c.mrfLbl}: ${c.mrfOpts.find((o) => o.key === mrf)?.label}`);
    if (emvi) lines.push(`EMVI: ${emvi === 'yes' ? c.yes : c.no}`);
    if (mode === 'primary' && nodesPrimary) lines.push(`${c.nodesLbl}: ${c.nodesPrimaryOpts[nodesPrimary]}`);
    if (mode === 'restaging' && nodesRestaging) lines.push(`${c.nodesLbl}: ${nodesRestaging === 'positive' ? c.nodesRestagingPositive : c.nodesRestagingNegative}`);
    if (mode === 'restaging' && restagingSystem === 'mrtrg' && mrTrg) lines.push(`mrTRG: ${c.trgOpts[mrTrg]}`);
    if (mode === 'restaging' && restagingSystem === 'simplified' && simplifiedResponse) lines.push(`${c.simplifiedResponseQ}: ${c.simplifiedOpts.find((o) => o.key === simplifiedResponse)?.label}`);
    if (radSummary) lines.push(`\n${c.radSummaryLabel}: ${radSummary}`);
    if (verdict) lines.push(`${c.conclusion}: ${verdict.text}`);
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

      {mode === 'primary' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.locationQ}</label>
          <OptionButtons options={[
            { key: 'upper', label: c.locOpts.find((o) => o.key === 'upper').label },
            { key: 'mid', label: c.locOpts.find((o) => o.key === 'mid').label },
            { key: 'lower', label: c.locOpts.find((o) => o.key === 'lower').label },
          ]} value={location} onChange={setLocation} />
        </Card>
      )}

      {mode === 'primary' && (
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
      )}

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

      {mode === 'primary' && location === 'lower' && (
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
        {mode === 'primary' && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{c.nodesPrimaryMorphNote}</p>}
        {mode === 'restaging' && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{c.nodesRestagingNote}</p>}
      </Card>

      {mode === 'restaging' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.restagingSystemQ}</label>
          <div className="flex gap-2">
            <button onClick={() => setRestagingSystem('mrtrg')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${restagingSystem === 'mrtrg' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.restagingSystemMrtrg}</button>
            <button onClick={() => setRestagingSystem('simplified')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${restagingSystem === 'simplified' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.restagingSystemSimplified}</button>
          </div>
        </Card>
      )}

      {mode === 'restaging' && restagingSystem === 'mrtrg' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.mrTrgQ}</label>
          <OptionButtons options={trgOptions} value={mrTrg} onChange={setMrTrg} />
        </Card>
      )}

      {mode === 'restaging' && restagingSystem === 'simplified' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.simplifiedResponseQ}</label>
          <OptionButtons options={c.simplifiedOpts} value={simplifiedResponse} onChange={setSimplifiedResponse} />
        </Card>
      )}

      {mode === 'restaging' && <InfoBox tone="slate">{c.restagingAccuracyNote}</InfoBox>}

      {radSummary && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.radSummaryLabel}</span>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{radSummary}</p>
          {verdict && (
            <div className="mt-3 text-left">
              <InfoBox tone={verdict.tone}>{verdict.text}</InfoBox>
            </div>
          )}
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
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.radSummaryLabel}:</span>
            <span className="text-sm font-bold leading-snug text-slate-800 dark:text-slate-100 block">
              {radSummary || c.pendingVerdict}
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

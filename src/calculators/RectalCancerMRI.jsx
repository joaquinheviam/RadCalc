import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconBookOpen } from '../components/icons/index.js';
import { Card, Accordion, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, ZoomableDiagram } from '../components/shared/index.js';

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
// transversal simplificado de la pared rectal. Geometría, colores fijos y
// disposición tomados literalmente del esquema que Gemini preparó a pedido
// de la usuaria (no se modifican formas ni posiciones); solo se adaptó a las
// convenciones técnicas del proyecto: contornos/anotaciones anatómicas con
// clases Tailwind `fill-*`/`stroke-*` + `dark:` (en vez del `<rect>` de fondo
// blanco fijo de la versión original, que no se integraba con el tema oscuro
// de la app), texto vía prop `labels` (i18n) en vez de hardcodeado, sombra
// con `<filter>` de id único, y resaltado interactivo (`activeT`) según la
// categoría T que la usuaria ya seleccionó en la calculadora. A diferencia
// del esquema anterior, todos los T3 (a-d) comparten un mismo color (azul) —
// ya no se distingue T3a/b de T3c/d por buen/mal pronóstico; ese matiz queda
// solo en la nota de texto de más abajo.
function RectalTScheme({ labels, activeT }) {
  // Atenúa (opacidad 0.3) los tumores que no corresponden a la categoría T
  // activa; si no hay ninguna seleccionada aún, se muestran todos a opacidad
  // plena. matchKeys usa las mismas claves de estado que el resto de la
  // calculadora (T_STAGE_KEYS): 't1t2' | 't3a' | 't3b' | 't3c' | 't3d' | 't4a' | 't4b'.
  const getOp = (matchKeys) => (!activeT ? 1 : matchKeys.includes(activeT) ? 1 : 0.3);
  const T3_SUBKEYS = ['t3a', 't3b', 't3c', 't3d'];

  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 850 600" className="h-auto w-full max-w-2xl font-sans" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadowRectalT" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.3" />
          </filter>
          <marker id="arrowRectalT" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-500 dark:fill-slate-400" />
          </marker>
        </defs>

        {/* Fascia mesorrectal (MRF) — círculo exterior */}
        <circle cx="350" cy="350" r="190" className="fill-transparent stroke-slate-500 dark:stroke-slate-400" strokeWidth="5" />

        {/* Línea de la cavidad peritoneal (solo recto superior) */}
        <path d="M 160 350 Q 140 220 200 130 Q 230 80 300 110 Q 360 140 440 100" fill="none" className="stroke-slate-800 dark:stroke-slate-300" strokeWidth="3" />

        {/* Órgano/estructura adyacente (acento fijo naranja, no depende del tema) */}
        <g transform="translate(485, 100)">
          <circle cx="0" cy="0" r="45" fill="#ea580c" filter="url(#shadowRectalT)" />
          <circle cx="-12" cy="-12" r="20" fill="#f97316" opacity="0.6" />
          <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontWeight="800" fontSize="18px">{labels.organ}</text>
        </g>

        {/* Muscular propia — círculo interior (relleno = submucosa) */}
        <circle cx="350" cy="350" r="110" className="fill-slate-100 stroke-slate-400 dark:fill-slate-800/50 dark:stroke-slate-500" strokeWidth="4" />

        {/* Luz rectal, forma irregular */}
        <path
          d="M 330 250 C 370 240, 370 280, 390 280 C 430 270, 410 310, 420 330 C 450 340, 420 360, 430 390 C 400 420, 380 380, 360 410 C 340 440, 320 400, 300 420 C 270 410, 290 380, 270 360 C 240 350, 270 320, 280 300 C 260 270, 300 280, 330 250 Z"
          className="fill-slate-800 dark:fill-slate-950"
        />
        <text x="350" y="355" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="16px">{labels.lumen}</text>

        {/* T1/T2: confinado a la pared */}
        <g transform="translate(295, 305) rotate(-45)" style={{ opacity: getOp(['t1t2']), transition: 'opacity 0.3s' }}>
          <ellipse cx="0" cy="0" rx="15" ry="25" fill="#3b82f6" filter="url(#shadowRectalT)" />
          <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14px">T1</text>
        </g>
        <g transform="translate(285, 410) rotate(-30)" style={{ opacity: getOp(['t1t2']), transition: 'opacity 0.3s' }}>
          <ellipse cx="0" cy="0" rx="20" ry="35" fill="#3b82f6" filter="url(#shadowRectalT)" />
          <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14px">T2</text>
        </g>

        {/* T3 (a, b, c, d) */}
        <g transform="translate(370, 450) rotate(20)" style={{ opacity: getOp(T3_SUBKEYS), transition: 'opacity 0.3s' }}>
          <ellipse cx="0" cy="0" rx="30" ry="65" fill="#3b82f6" filter="url(#shadowRectalT)" />
          <text x="0" y="-15" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14px">T3</text>
          <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14px">a, b,</text>
          <text x="0" y="25" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14px">c, d</text>
        </g>

        {/* T3 con MRF+ (margen circunferencial <1mm) */}
        <g transform="translate(480, 360) rotate(80)" style={{ opacity: getOp(T3_SUBKEYS), transition: 'opacity 0.3s' }}>
          <ellipse cx="0" cy="0" rx="30" ry="75" fill="#3b82f6" filter="url(#shadowRectalT)" />
        </g>
        <text x="485" y="350" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14px" style={{ opacity: getOp(T3_SUBKEYS) }}>T3 MRF+</text>
        <text x="485" y="370" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14px" style={{ opacity: getOp(T3_SUBKEYS) }}>(&lt;1mm)</text>

        {/* T4a: perfora la reflexión peritoneal */}
        <g transform="translate(230, 190) rotate(-40)" style={{ opacity: getOp(['t4a']), transition: 'opacity 0.3s' }}>
          <ellipse cx="0" cy="0" rx="35" ry="110" fill="#3b82f6" filter="url(#shadowRectalT)" />
          <text x="0" y="20" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14px">T4a</text>
        </g>

        {/* T4b: atraviesa la MRF hacia un órgano/estructura adyacente */}
        <g transform="translate(430, 200) rotate(25)" style={{ opacity: getOp(['t4b']), transition: 'opacity 0.3s' }}>
          <ellipse cx="0" cy="0" rx="35" ry="110" fill="#3b82f6" filter="url(#shadowRectalT)" />
          <text x="0" y="10" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14px">T4b</text>
        </g>

        {/* Etiquetas y punteros anatómicos */}
        <text x="180" y="70" className="fill-slate-800 dark:fill-slate-200" fontWeight="600" fontSize="14px">{labels.peritonealCavity}</text>
        <path d="M 230 80 L 250 110" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" fill="none" />
        <path d="M 330 80 L 310 110" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" fill="none" />

        <text x="230" y="460" transform="rotate(45 230 460)" className="fill-slate-800 dark:fill-slate-200" fontWeight="600" fontSize="14px">{labels.mesorectum}</text>

        <text x="560" y="270" className="fill-slate-800 dark:fill-slate-200" fontWeight="600" fontSize="14px">{labels.muscularisPropriaL1}</text>
        <text x="560" y="290" className="fill-slate-800 dark:fill-slate-200" fontWeight="600" fontSize="14px">{labels.muscularisPropriaL2}</text>
        <path d="M 550 280 L 440 285" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" fill="none" markerEnd="url(#arrowRectalT)" />

        <text x="560" y="455" className="fill-slate-800 dark:fill-slate-200" fontWeight="600" fontSize="14px">{labels.mrf}</text>
        <path d="M 550 450 L 510 450" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" fill="none" markerEnd="url(#arrowRectalT)" />

        <text x="560" y="405" className="fill-slate-800 dark:fill-slate-200" fontWeight="600" fontSize="14px">{labels.submucosa}</text>
        <path d="M 550 400 L 415 390" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" fill="none" markerEnd="url(#arrowRectalT)" />

        {/* Leyenda embebida de subcategorías T3 (a-d) */}
        <g transform="translate(560, 490)" className="fill-slate-800 dark:fill-slate-200" fontWeight="700" fontSize="14px">
          <text x="0" y="0">{labels.legendA}</text>
          <text x="0" y="25">{labels.legendB}</text>
          <text x="0" y="50">{labels.legendC}</text>
          <text x="0" y="75">{labels.legendD}</text>
        </g>
      </svg>
    </div>
  );
}

// Diagrama coronal del complejo esfinteriano, relevante solo para el recto
// bajo: IS (esfínter interno / continuación de la muscular propia, rojo),
// ISS (espacio interesfinteriano graso, ámbar) y ES (esfínter externo /
// elevador del ano, café) como tres capas concéntricas de relleno sólido, con
// dos tumores ilustrativos (azul: IS+ISS; café oscuro: IS+ISS+ES) — mismos
// colores y trazado que la referencia de la usuaria; el color de cada capa es
// un hallazgo anatómico fijo (no theme-adaptive), igual criterio que el resto
// de la app para elementos con significado clínico. El fondo blanco fijo y el
// bloque de <style> de la referencia se omiten (el contenedor ya aporta el
// fondo en ambos temas, y las clases CSS globales están prohibidas en esta
// SPA de una sola página); las sombras se logran con un <filter> con id único
// en vez de clases.
function SphincterComplexScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="45 55 570 520" className="h-auto w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="rectSphincterTumorShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.4" />
          </filter>
          <filter id="rectSphincterTextShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.6" />
          </filter>
        </defs>

        <g transform="translate(25, 40)">
          {/* ================= DERECHA ================= */}
          <path fill="#943f33" stroke="#63261d" strokeWidth="2" d="M 530 140 C 470 180, 420 250, 408 320 L 408 480 C 408 520, 358 520, 358 480 L 358 300 C 370 220, 420 140, 480 90 C 515 65, 555 110, 530 140 Z" />
          <path fill="#fbb03b" stroke="#d98516" strokeWidth="2" d="M 358 260 L 358 475 C 358 505, 334 505, 334 475 L 334 240 C 342 245, 350 250, 358 260 Z" />
          <path fill="#e03a3a" stroke="#a81d1d" strokeWidth="2" d="M 410 50 C 370 110, 334 170, 334 240 L 334 470 C 334 495, 310 495, 310 470 L 310 240 C 310 170, 340 110, 370 50 C 385 25, 425 25, 410 50 Z" />
          <path fill="#e03a3a" stroke="#a81d1d" strokeWidth="2" d="M 345 150 Q 430 100, 480 50 C 490 60, 485 75, 465 95 Q 410 150, 340 175 Z" />
          {/* Tumor derecho (café oscuro): IS + ISS + ES */}
          <path fill="#451a03" stroke="#290f02" strokeWidth="1.5" filter="url(#rectSphincterTumorShadow)" d="M 330 310 C 350 290, 370 320, 380 340 C 400 360, 410 380, 390 410 C 395 430, 370 455, 340 445 C 310 460, 280 430, 290 400 C 275 380, 290 350, 305 340 C 300 320, 315 315, 330 310 Z" />

          {/* ================= IZQUIERDA ================= */}
          <path fill="#943f33" stroke="#63261d" strokeWidth="2" d="M 70 140 C 130 180, 180 250, 192 320 L 192 480 C 192 520, 242 520, 242 480 L 242 300 C 230 220, 180 140, 120 90 C 85 65, 45 110, 70 140 Z" />
          <path fill="#fbb03b" stroke="#d98516" strokeWidth="2" d="M 242 260 L 242 475 C 242 505, 266 505, 266 475 L 266 240 C 258 245, 250 250, 242 260 Z" />
          <path fill="#e03a3a" stroke="#a81d1d" strokeWidth="2" d="M 190 50 C 230 110, 266 170, 266 240 L 266 470 C 266 495, 290 495, 290 470 L 290 240 C 290 170, 260 110, 230 50 C 215 25, 175 25, 190 50 Z" />
          {/* Tumor izquierdo (azul): IS + ISS, respeta el ES */}
          <path fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="1.5" filter="url(#rectSphincterTumorShadow)" d="M 270 310 C 290 300, 310 320, 295 340 C 310 360, 290 390, 275 390 C 255 390, 245 375, 245 350 C 245 325, 250 315, 270 310 Z" />

          {/* Etiquetas anatómicas (lado izquierdo) */}
          <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="13" fill="#ffffff" textAnchor="middle" filter="url(#rectSphincterTextShadow)">
            <text x="217" y="440">ES</text>
            <text x="254" y="440">ISS</text>
            <text x="278" y="440">IS</text>
          </g>
          {/* Etiquetas sobre los tumores */}
          <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="13" fill="#ffffff" textAnchor="middle" dominantBaseline="middle">
            <text x="274" y="352">Tu</text>
            <text x="345" y="390">Tu</text>
          </g>
        </g>
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
  const isLowRectalSphincterCase = mode === 'primary' && location === 'lower';
  const radiologicalSummary = () => {
    const parts = [];
    if (tStage) {
      if (isLowRectalSphincterCase && sphincter === 'es') {
        // Reclasificación por consenso (Khasawneh et al., AJR 2025): la invasión
        // del esfínter externo es T4b independiente del T basado en profundidad;
        // se informa directamente T4b en vez de anexar una etiqueta aparte.
        parts.push(`T4b* (${c.sphincterEasSummaryReason})`);
      } else if (isLowRectalSphincterCase && sphincter === 'iss') {
        // Sufijo "-isp" del grupo ISOG-ISR: se agrega directamente al T ya
        // seleccionado (no cambia la categoría, solo la anota).
        parts.push(`${COMPACT_T[tStage]}-isp*`);
      } else {
        parts.push(`${mode === 'restaging' ? 'y' : ''}${COMPACT_T[tStage]}`);
      }
    }
    if (nodesAnswered) parts.push(nodesPositive ? 'N+' : 'N-');
    if (emvi) parts.push(emvi === 'yes' ? 'EMVI+' : 'EMVI-');
    if (mrf) parts.push(mrf === 'clear' ? 'MRF-' : mrf === 'involved' ? 'MRF+' : 'MRF~');
    return parts.length ? parts.join(', ') : null;
  };
  const radSummary = radiologicalSummary();
  // El asterisco remite a una nota general sobre cómo reportar recto inferior
  // (más allá de la sola categoría T) — se muestra junto al resumen cuando
  // aplica cualquiera de las dos reclasificaciones esfinterianas.
  const radSummaryHasSphincterFootnote = isLowRectalSphincterCase && (sphincter === 'es' || sphincter === 'iss');

  const buildReport = () => {
    const lines = [mode === 'primary' ? c.primaryStaging : c.restaging];
    if (mode === 'primary' && location) lines.push(`${c.locationLbl}: ${c.locOpts.find((o) => o.key === location)?.label}`);
    if (mode === 'primary' && morphology) lines.push(`${c.morphologyLbl}: ${c.morphOpts.find((o) => o.key === morphology)?.label}`);
    if (mode === 'primary' && mucin) lines.push(`${c.mucinLbl}: ${c.mucinOpts.find((o) => o.key === mucin)?.label}`);
    if (tStage) lines.push(`${mode === 'primary' ? c.tStageLbl : c.ytStageLbl}: ${c.tOpts[tStage]}`);
    if (mode === 'primary' && location === 'lower' && sphincter) {
      lines.push(`${c.sphincterLbl}: ${c.sphincterOpts.find((o) => o.key === sphincter)?.label}`);
      if (sphincter === 'iss') lines.push(`${c.sphincterIspNote}`);
      if (sphincter === 'es') lines.push(`${c.sphincterEasNote}`);
    }
    if (mrf) lines.push(`${c.mrfLbl}: ${c.mrfOpts.find((o) => o.key === mrf)?.label}`);
    if (emvi) lines.push(`EMVI: ${emvi === 'yes' ? c.yes : c.no}`);
    if (mode === 'primary' && nodesPrimary) lines.push(`${c.nodesLbl}: ${c.nodesPrimaryOpts[nodesPrimary]}`);
    if (mode === 'restaging' && nodesRestaging) lines.push(`${c.nodesLbl}: ${nodesRestaging === 'positive' ? c.nodesRestagingPositive : c.nodesRestagingNegative}`);
    if (mode === 'restaging' && restagingSystem === 'mrtrg' && mrTrg) lines.push(`mrTRG: ${c.trgOpts[mrTrg]}`);
    if (mode === 'restaging' && restagingSystem === 'simplified' && simplifiedResponse) lines.push(`${c.simplifiedResponseQ}: ${c.simplifiedOpts.find((o) => o.key === simplifiedResponse)?.label}`);
    if (radSummary) lines.push(`\n${c.radSummaryLabel}: ${radSummary}`);
    if (radSummary && radSummaryHasSphincterFootnote) lines.push(`* ${c.radSummaryFootnoteSphincter}`);
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
        <ZoomableDiagram title={c.diagramTitle} labels={t.common.diagramZoom}>
          <RectalTScheme labels={c.tSchemeLabels} activeT={tStage} />
        </ZoomableDiagram>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.diagramNote}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">{c.diagramPrognosisNote}</p>
      </Accordion>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{mode === 'primary' ? c.tStageQ : c.ytStageQ}</label>
        <OptionButtons options={tOptions} value={tStage} onChange={setTStage} />
      </Card>

      {mode === 'primary' && location === 'lower' && (
        <>
          <Accordion icon={<IconBookOpen size={16} />} title={c.sphincterDiagramTitle}>
            <ZoomableDiagram title={c.sphincterDiagramTitle} labels={t.common.diagramZoom}>
              <SphincterComplexScheme />
            </ZoomableDiagram>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#1d4ed8] mr-1 align-[-1px]"></span>{c.sphincterLegend1}</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#451a03] mr-1 align-[-1px]"></span>{c.sphincterLegend2}</span>
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
            {sphincter === 'iss' && <div className="mt-3"><InfoBox tone="slate">{c.sphincterIspNote}</InfoBox></div>}
            {sphincter === 'es' && <div className="mt-3"><InfoBox tone="amber">{c.sphincterEasNote}</InfoBox></div>}
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
          {radSummaryHasSphincterFootnote && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug text-left">* {c.radSummaryFootnoteSphincter}</p>
          )}
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

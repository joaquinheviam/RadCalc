import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconBookOpen } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion, ZoomableDiagram } from '../components/shared/index.js';

const btnCls = (active) =>
  `w-full text-left p-2.5 rounded-lg border text-xs transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

// Diagrama de línea (mismo criterio visual que PectusScheme en
// PectusHallerCI.jsx: silueta en currentColor para adaptarse a ambos temas,
// badges de color fijo por cada medición, leyenda bilingüe fuera del SVG).
// Muestra la anatomía relevante para diferenciar útero septado de
// normal/arcuato: línea intercornual (referencia externa), profundidad de
// indentación (d), grosor de pared en el fondo (w) y ángulo de indentación (α).
function SeptateScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 400 380" className="h-auto w-full max-w-xs text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Miometrio (contorno externo) */}
        <path
          fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          d="M 60,90 Q 200,20 340,90 Q 370,220 260,320 L 260,350 Q 260,365 245,365 L 155,365 Q 140,365 140,350 L 140,320 Q 30,220 60,90 Z"
        />
        {/* Cavidad endometrial: solo el tramo bajo el vértice (istmo/canal), en
            gris — los dos brazos de la "V" se dibujan más abajo en azul, como
            parte de la medición del ángulo, para no duplicar la línea. */}
        <path
          fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-slate-400 dark:text-slate-500"
          d="M 200,230 L 200,340"
        />
        {/* Línea intercornual (referencia externa, discontinua) */}
        <line x1="80" y1="110" x2="320" y2="110" stroke="currentColor" strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" className="text-slate-400 dark:text-slate-500" />

        {/* w: grosor de pared en el fondo */}
        <g stroke="#059669" strokeWidth="3" strokeLinecap="round">
          <line x1="200" y1="45" x2="200" y2="105" />
          <line x1="190" y1="45" x2="210" y2="45" />
          <line x1="190" y1="105" x2="210" y2="105" />
        </g>
        <rect x="216" y="60" width="26" height="26" rx="6" fill="#059669" />
        <text x="229" y="78" fill="#ffffff" fontSize="15" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">w</text>

        {/* d: profundidad de la indentación (línea intercornual al vértice) */}
        <g stroke="#dc2626" strokeWidth="3" strokeLinecap="round">
          <line x1="200" y1="115" x2="200" y2="212" />
          <line x1="190" y1="115" x2="210" y2="115" />
        </g>
        <rect x="216" y="150" width="26" height="26" rx="6" fill="#dc2626" />
        <text x="229" y="168" fill="#ffffff" fontSize="15" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">d</text>

        {/* α: ángulo de indentación — todo el ángulo del vértice de la "V", entre
            los dos brazos que van hacia cada cuerno (línea intercornual). */}
        <line x1="200" y1="230" x2="100" y2="110" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="200" y1="230" x2="300" y2="110" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 174.4,199.3 A 40,40 0 0 1 225.6,199.3" fill="none" stroke="#2563eb" strokeWidth="3" />
        <rect x="187" y="217" width="26" height="26" rx="6" fill="#2563eb" />
        <text x="200" y="235" fill="#ffffff" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">α</text>
      </svg>
    </div>
  );
}

// Comparación ASRM MAC2021 / ESHRE-ESGE / CUME, en Tailwind (no SVG) para que
// el texto quede en español/inglés vía i18n y se adapte a ambos temas — la
// ilustración de la usuaria usaba texto fijo dentro del SVG y los umbrales
// ASRM del "Uterine septum: a guideline" 2016 (≥1.5 cm / zona gris 1.0-1.5
// cm), que ya no son los que implementa esta calculadora; aquí se muestran
// los umbrales ASRM MAC2021 (Pfeifer et al. 2021) para que coincidan
// exactamente con el resultado que arroja más abajo.
function CriteriaComparison({ c }) {
  const rows = [
    { title: c.criteriaAsrmTitle, septate: c.criteriaAsrmSeptate, normal: c.criteriaAsrmNormal, note: c.criteriaAsrmGray },
    { title: c.criteriaEshreTitle, septate: c.criteriaEshreSeptate, normal: c.criteriaEshreNormal, note: null },
    { title: c.criteriaCumeTitle, septate: c.criteriaCumeSeptate, normal: c.criteriaCumeNormal, note: c.criteriaCumeSupport },
  ];
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.title} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">{r.title}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="block font-semibold text-red-500 mb-0.5">{c.criteriaSeptateLabel}</span>
              <span className="text-slate-600 dark:text-slate-300">{r.septate}</span>
            </div>
            <div>
              <span className="block font-semibold text-emerald-500 mb-0.5">{c.criteriaNormalLabel}</span>
              <span className="text-slate-600 dark:text-slate-300">{r.normal}</span>
            </div>
          </div>
          {r.note && <p className="text-[11px] italic text-slate-500 dark:text-slate-400 mt-1.5">{r.note}</p>}
        </div>
      ))}
    </div>
  );
}

// Diagrama de línea: desarrollo bilateral vs. unilateral (hemiútero), para la
// primera pregunta del cuerpo uterino. Deliberadamente esquemático — solo
// ilustra la diferencia bilateral/unilateral, sin adelantar la sub-pregunta
// de cuerno rudimentario (U4a/U4b), que se pregunta después.
function DevelopmentScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 440 260" className="h-auto w-full max-w-sm text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Panel A: bilateral (simétrico) */}
        <path
          fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          d="M 50,90 Q 110,40 170,90 Q 185,160 140,210 L 140,225 Q 140,235 130,235 L 90,235 Q 80,235 80,225 L 80,210 Q 35,160 50,90 Z"
        />
        <path
          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          className="text-slate-400 dark:text-slate-500"
          d="M 82,100 L 110,150 L 138,100 M 110,150 L 110,220"
        />

        {/* Panel B: unilateral / hemiútero — silueta ausente del lado contrario
            (discontinua y tenue) para contrastar con la mitad desarrollada. */}
        <path
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="5 6"
          className="text-slate-300 dark:text-slate-700"
          d="M 300,90 Q 260,50 305,90 Q 315,150 300,200 L 300,220 Q 300,230 310,230"
        />
        <path
          fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          d="M 305,90 Q 385,70 385,150 Q 388,200 350,225 L 340,236 Q 335,242 328,236 L 316,224 Q 300,198 300,150 Q 297,115 305,90 Z"
        />
        <path
          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          className="text-slate-400 dark:text-slate-500"
          d="M 340,105 Q 366,150 344,212"
        />

        {/* Divisor sutil entre paneles */}
        <line x1="220" y1="30" x2="220" y2="240" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" className="text-slate-200 dark:text-slate-700" />
      </svg>
    </div>
  );
}

// Diagrama de línea: contorno externo único vs. hendido (bicorne/didelfo), con
// la técnica de medición externa (Grimbizis et al. 2013 / criterio ASRM): una
// línea que conecta los dos ápices externos, y la profundidad de la hendidura
// serosa (D) trazada perpendicular a esa línea hasta su punto más bajo — la
// misma técnica que ya usan extDepthQ/wallThicknessQCleft más abajo.
function BicorneScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 400 380" className="h-auto w-full max-w-xs text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Miometrio (contorno externo hendido) */}
        <path
          fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          d="M 70,160 Q 60,80 140,50 Q 175,90 200,130 Q 225,90 260,50 Q 340,80 330,160 Q 360,240 260,320 L 260,350 Q 260,365 245,365 L 155,365 Q 140,365 140,350 L 140,320 Q 40,240 70,160 Z"
        />
        {/* Cavidades endometriales (dos cuernos convergiendo hacia el istmo) */}
        <path
          fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-slate-400 dark:text-slate-500"
          d="M 140,90 Q 150,200 197,276 M 260,90 Q 250,200 203,276 M 200,278 L 200,340"
        />
        {/* Línea entre los ápices externos (referencia, discontinua) */}
        <line x1="140" y1="50" x2="260" y2="50" stroke="currentColor" strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" className="text-slate-400 dark:text-slate-500" />
        <circle cx="140" cy="50" r="4" fill="currentColor" className="text-slate-400 dark:text-slate-500" />
        <circle cx="260" cy="50" r="4" fill="currentColor" className="text-slate-400 dark:text-slate-500" />

        {/* w: grosor de pared a nivel del cuerno (ápice externo a la cavidad) */}
        <g stroke="#059669" strokeWidth="3" strokeLinecap="round">
          <line x1="140" y1="55" x2="140" y2="85" />
          <line x1="130" y1="55" x2="150" y2="55" />
          <line x1="130" y1="85" x2="150" y2="85" />
        </g>
        <rect x="97" y="55" width="26" height="26" rx="6" fill="#059669" />
        <text x="110" y="73" fill="#ffffff" fontSize="15" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">w</text>

        {/* D: profundidad de la hendidura serosa externa (perpendicular a la
            línea entre ápices, hasta el nadir de la hendidura) */}
        <g stroke="#dc2626" strokeWidth="3" strokeLinecap="round">
          <line x1="200" y1="50" x2="200" y2="122" />
          <line x1="190" y1="50" x2="210" y2="50" />
        </g>
        <rect x="216" y="80" width="30" height="26" rx="6" fill="#dc2626" />
        <text x="231" y="98" fill="#ffffff" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">D</text>
      </svg>
    </div>
  );
}

// Diagrama de línea: cavidad en "T" — canal central estrecho por engrosamiento
// de las paredes laterales, con ramas cornuales cortas y rectas, y contorno
// externo del fondo plano o mínimamente convexo (a diferencia del contorno
// convexo con indentación interna del útero septado).
function TshapeScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 400 380" className="h-auto w-full max-w-xs text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Miometrio (contorno externo del fondo plano/mínimamente convexo) */}
        <path
          fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          d="M 70,110 Q 70,90 100,80 L 300,80 Q 330,90 330,110 Q 350,220 260,310 L 260,340 Q 260,355 245,355 L 155,355 Q 140,355 140,340 L 140,310 Q 50,220 70,110 Z"
        />
        {/* Cavidad endometrial en "T": canal central estrecho + ramas cornuales
            cortas y rectas */}
        <path
          fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          className="text-slate-400 dark:text-slate-500"
          d="M 130,115 L 270,115 M 200,115 L 200,300"
        />
        {/* Paredes laterales engrosadas (llaves indicando el grosor a cada lado
            del canal) */}
        <g stroke="#059669" strokeWidth="2.5" strokeLinecap="round" className="opacity-90">
          <path d="M 155,105 L 145,105 L 145,125 L 155,125" fill="none" />
          <path d="M 245,105 L 255,105 L 255,125 L 245,125" fill="none" />
        </g>
      </svg>
    </div>
  );
}

// Diagrama de línea: hemi-útero (unicorne), con el cuerno desarrollado a la
// izquierda y, a la derecha, dos paneles pequeños en paralelo comparando el
// cuerno rudimentario contralateral CON cavidad endometrial (U4a) vs SIN
// cavidad/ausente (U4b) — la distinción que decide la sub-clasificación
// ESHRE/ESGE tras la pregunta unicorneHornQ.
function HemiuterusScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 460 260" className="h-auto w-full max-w-sm text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Cuerno desarrollado (hemi-útero funcional) */}
        <path
          fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          d="M 95,35 Q 175,15 175,95 Q 178,145 140,170 L 130,181 Q 125,187 118,181 L 106,169 Q 90,143 90,95 Q 87,60 95,35 Z"
        />
        <path
          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          className="text-slate-400 dark:text-slate-500"
          d="M 130,50 Q 156,95 134,157"
        />
        {/* Cérvix único, continuando el cuerno desarrollado */}
        <path
          fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          d="M 118,181 L 112,225 Q 112,238 124,238 L 130,238 Q 142,238 142,225 L 140,182"
        />

        {/* Divisor sutil */}
        <line x1="235" y1="20" x2="235" y2="248" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" className="text-slate-200 dark:text-slate-700" />

        {/* Panel derecho superior: cuerno rudimentario CON cavidad (U4a) */}
        <path
          fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          d="M 310,35 Q 355,28 353,68 Q 352,90 330,100 L 326,105 Q 322,110 317,105 L 313,99 Q 300,85 302,65 Q 300,48 310,35 Z"
        />
        <path
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-slate-400 dark:text-slate-500"
          d="M 322,45 Q 338,68 324,97"
        />
        {/* Línea discontinua tenue: la cavidad puede comunicar o no con la
            principal, distinción que no cambia el esquema (se resuelve por
            texto) */}
        <line x1="290" y1="70" x2="235" y2="130" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" className="text-slate-300 dark:text-slate-700" />

        {/* Panel derecho inferior: cuerno rudimentario SIN cavidad / ausente (U4b) */}
        <path
          fill="currentColor" className="text-slate-300 dark:text-slate-700"
          stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          d="M 308,155 Q 350,149 348,187 Q 347,207 327,216 L 323,220 Q 319,225 315,220 L 311,215 Q 299,202 301,184 Q 299,168 308,155 Z"
        />
      </svg>
    </div>
  );
}

// Verdictos, en el mismo orden en que se muestran las columnas.
const VERDICT_SEPTATE = 'septate';
const VERDICT_NORMAL = 'normal';
const VERDICT_GRAY = 'gray';

// Mapeo de los hallazgos de cuello/vagina (secciones independientes) a los
// códigos C0-C4 / V0-V4 del consenso ESHRE/ESGE 2013 (Grimbizis et al.),
// para construir el código compuesto U#,C#,V#.
const CERVIX_CODES = { normal: 'C0', septate: 'C1', double: 'C2', unilateralAplasia: 'C3', aplasia: 'C4' };
const VAGINA_CODES = { normal: 'V0', longNonObstructing: 'V1', longObstructing: 'V2', transverseOrHymen: 'V3', aplasia: 'V4' };

export default function MullerianAnomalies() {
  const { t } = useLang();
  const c = t.calc.mullerianAnomalies;

  /* ==================== Cuerpo uterino ==================== */
  const [dev, setDev] = useState(null); // null | 'bilateral' | 'unicorne' | 'agenesia'

  // -- Agenesia --
  const [agenesiaHorn, setAgenesiaHorn] = useState(null); // null | 'yes' | 'no'

  // -- Unicorne --
  const [unicorneHorn, setUnicorneHorn] = useState(null); // null | 'none' | 'noCavity' | 'communicating' | 'nonCommunicating'

  // -- Bilateral: contorno --
  const [contour, setContour] = useState(null); // null | 'normal' | 'cleft'

  // -- Bilateral + cleft: bicorne/didelfo --
  const [extDepthCleft, setExtDepthCleft] = useState('');
  const [wallThicknessCleft, setWallThicknessCleft] = useState('');
  const [cleftExtent, setCleftExtent] = useState(null); // null | 'partial' | 'complete'
  const [cervixCount, setCervixCount] = useState(null); // null | 'one' | 'two'

  // -- Bilateral + normal: T-shape / cuantitativo --
  const [tshape, setTshape] = useState(null); // null | 'yes' | 'no'
  const [intDepth, setIntDepth] = useState('');
  const [intAngle, setIntAngle] = useState('');
  const [extDepthNormal, setExtDepthNormal] = useState('');
  const [wallThickness, setWallThickness] = useState('');
  const [septumExtent, setSeptumExtent] = useState(null); // null | 'partial' | 'complete' — distingue U2a/U2b (ESHRE/ESGE)

  const resetBody = () => {
    setDev(null);
    setAgenesiaHorn(null);
    setUnicorneHorn(null);
    setContour(null);
    setExtDepthCleft(''); setWallThicknessCleft(''); setCleftExtent(null); setCervixCount(null);
    setTshape(null); setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness(''); setSeptumExtent(null);
  };
  const handleDev = (key) => {
    setDev(key);
    setAgenesiaHorn(null); setUnicorneHorn(null); setContour(null);
    setExtDepthCleft(''); setWallThicknessCleft(''); setCleftExtent(null); setCervixCount(null);
    setTshape(null); setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness(''); setSeptumExtent(null);
  };
  const handleContour = (key) => {
    setContour(key);
    setExtDepthCleft(''); setWallThicknessCleft(''); setCleftExtent(null); setCervixCount(null);
    setTshape(null); setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness(''); setSeptumExtent(null);
  };
  const handleTshape = (key) => {
    setTshape(key);
    setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness(''); setSeptumExtent(null);
  };
  const handleBodyBack = () => {
    if (dev === 'agenesia' && agenesiaHorn !== null) { setAgenesiaHorn(null); return; }
    if (dev === 'unicorne' && unicorneHorn !== null) { setUnicorneHorn(null); return; }
    if (dev === 'bilateral') {
      if (contour === 'cleft' && (cervixCount !== null || cleftExtent !== null)) {
        setCervixCount(null); setCleftExtent(null); return;
      }
      if (contour === 'normal' && tshape !== null) { setTshape(null); setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness(''); setSeptumExtent(null); return; }
      if (contour !== null) { setContour(null); return; }
    }
    if (dev !== null) { setDev(null); return; }
  };

  /* ---- Resultado: agenesia ---- */
  const agenesiaResult = dev === 'agenesia' && agenesiaHorn
    ? (agenesiaHorn === 'yes' ? c.agenesiaWithCavity : c.agenesiaNoCavity)
    : null;

  /* ---- Resultado: unicorne ---- */
  const unicorneResult = dev === 'unicorne' && unicorneHorn ? c.unicorneResults[unicorneHorn] : null;

  /* ---- Resultado: bicorne/didelfo (contorno hendido) ---- */
  const bicorneKey = (dev === 'bilateral' && contour === 'cleft' && cleftExtent && cervixCount)
    ? `${cleftExtent}${cervixCount === 'one' ? 'One' : 'Two'}`
    : null;
  const bicorneResult = bicorneKey ? c.bicorneResults[bicorneKey] : null;
  const extDepthCleftNum = extDepthCleft === '' ? null : parseFloat(extDepthCleft);
  const wallThicknessCleftNum = wallThicknessCleft === '' ? null : parseFloat(wallThicknessCleft);
  const extRatioCleft = (extDepthCleftNum !== null && wallThicknessCleftNum) ? ((extDepthCleftNum / wallThicknessCleftNum) * 100).toFixed(0) : null;

  /* ---- Resultado: T-shape ---- */
  const tshapeResultActive = dev === 'bilateral' && contour === 'normal' && tshape === 'yes';

  /* ---- Resultado: cuantitativo normal/arcuato vs. septado ---- */
  const showQuant = dev === 'bilateral' && contour === 'normal' && tshape === 'no';
  const intDepthNum = intDepth === '' ? null : parseFloat(intDepth);
  const intAngleNum = intAngle === '' ? null : parseFloat(intAngle);
  const extDepthNormalNum = extDepthNormal === '' ? null : parseFloat(extDepthNormal);
  const wallThicknessNum = wallThickness === '' ? null : parseFloat(wallThickness);
  const hasDepth = intDepthNum !== null && !isNaN(intDepthNum);
  const hasAngle = intAngleNum !== null && !isNaN(intAngleNum);
  const hasWall = wallThicknessNum !== null && !isNaN(wallThicknessNum) && wallThicknessNum > 0;
  const hasExtNormal = extDepthNormalNum !== null && !isNaN(extDepthNormalNum);

  // ASRM MAC2021: requiere profundidad >10 mm Y ángulo <90° (criterio
  // combinado); si solo se cumple uno de los dos, el caso queda en "zona
  // gris" (no clasificable) — Pfeifer et al. 2021 (documento primario ASRM,
  // umbral >10 mm desde la línea intercornual); Ludwin et al. 2022, revisión
  // crítica de MAC2021, confirma que la zona gris no se eliminó respecto al
  // guideline ASRM 2016 previo, solo bajó el umbral de profundidad.
  const asrmMac2021Verdict = (() => {
    if (!hasDepth || !hasAngle) return null;
    const deepEnough = intDepthNum > 10;
    const sharpEnough = intAngleNum < 90;
    if (deepEnough && sharpEnough) return VERDICT_SEPTATE;
    if (!deepEnough && !sharpEnough) return VERDICT_NORMAL;
    return VERDICT_GRAY;
  })();

  // ESHRE/ESGE: índice indentación interna/grosor de pared > 50%, con
  // indentación externa/grosor de pared < 50% (Grimbizis et al. 2013).
  const eshreInternalRatio = (hasDepth && hasWall) ? (intDepthNum / wallThicknessNum) * 100 : null;
  const eshreExternalRatio = (hasExtNormal && hasWall) ? (extDepthNormalNum / wallThicknessNum) * 100 : null;
  const eshreVerdict = (eshreInternalRatio === null) ? null : (eshreInternalRatio > 50 ? VERDICT_SEPTATE : VERDICT_NORMAL);
  const eshreExternalWarning = eshreExternalRatio !== null && eshreExternalRatio > 50;

  // CUME (Ludwin et al. 2018): tres mediciones validadas de forma
  // independiente contra el consenso de expertos, no una fórmula combinada.
  // El veredicto principal usa la profundidad (mejor reproducibilidad,
  // CCC 0.99); ángulo e índice I:WT se muestran solo como apoyo.
  const cumeVerdict = hasDepth ? (intDepthNum >= 10 ? VERDICT_SEPTATE : VERDICT_NORMAL) : null;
  const cumeRatio = (hasDepth && hasWall) ? ((intDepthNum / wallThicknessNum) * 100).toFixed(0) : null;

  const verdictLabel = (v) => v === VERDICT_SEPTATE ? c.verdictSeptate : v === VERDICT_NORMAL ? c.verdictNormal : v === VERDICT_GRAY ? c.verdictGrayZone : '—';
  const verdictColor = (v) => v === VERDICT_SEPTATE ? 'text-red-500' : v === VERDICT_NORMAL ? 'text-emerald-500' : v === VERDICT_GRAY ? 'text-amber-500' : 'text-slate-400';

  const quantVerdicts = [asrmMac2021Verdict, eshreVerdict, cumeVerdict].filter(Boolean);
  const quantDiscrepancy = new Set(quantVerdicts).size > 1;

  /* ==================== Cuello uterino (independiente) ==================== */
  const [cervixFinding, setCervixFinding] = useState(null);

  /* ==================== Vagina (independiente) ==================== */
  const [vaginaFinding, setVaginaFinding] = useState(null);

  /* ==================== Código compuesto ESHRE/ESGE (U#,C#,V#) ==================== */
  // Código de cuello: prioriza la respuesta de la sección independiente; si no
  // se ha respondido, usa lo ya inferido en la rama bicorne/didelfo (cervixCount).
  const cCode = cervixFinding
    ? CERVIX_CODES[cervixFinding]
    : (dev === 'bilateral' && contour === 'cleft' && cervixCount ? (cervixCount === 'two' ? 'C2' : 'C0') : null);
  const vCode = vaginaFinding ? VAGINA_CODES[vaginaFinding] : null;
  const cervixShortLabel = cervixFinding ? (c.cervixOptions.find(o => o.key === cervixFinding)?.label ?? null) : null;
  const vaginaShortLabel = vaginaFinding ? (c.vaginaOptions.find(o => o.key === vaginaFinding)?.label ?? null) : null;

  // Código de cuerpo (clase U) según la rama activa.
  const bodyEshreCode = (() => {
    if (agenesiaResult) return agenesiaResult.eshreCode;
    if (unicorneResult) return unicorneResult.eshreCode;
    if (bicorneResult) return bicorneResult.eshreCode;
    if (tshapeResultActive) return c.tshapeResult.eshreCode;
    if (showQuant && eshreVerdict) {
      if (eshreVerdict === VERDICT_NORMAL) return 'U0';
      if (eshreVerdict === VERDICT_SEPTATE) {
        if (septumExtent === 'complete') return 'U2b';
        if (septumExtent === 'partial') return 'U2a';
        return 'U2';
      }
    }
    return null;
  })();

  const compositeCode = bodyEshreCode ? [bodyEshreCode, cCode, vCode].filter(Boolean).join(',') : null;

  /* ==================== Reporte combinado ==================== */
  const bodyReportStr = (() => {
    if (agenesiaResult) {
      const parts = [agenesiaResult.asrm, agenesiaResult.eshre];
      if (compositeCode) parts.push(`${c.eshreCompositeLabel}: ${compositeCode}`);
      parts.push(`${c.systemCume}: ${c.cumeNotApplicableCleft}`);
      if (agenesiaResult.note) parts.push(agenesiaResult.note);
      return parts.join(' · ');
    }
    if (unicorneResult) {
      const parts = [unicorneResult.asrm, unicorneResult.eshre];
      if (compositeCode) parts.push(`${c.eshreCompositeLabel}: ${compositeCode}`);
      parts.push(`${c.systemCume}: ${c.cumeNotApplicableCleft}`);
      if (unicorneResult.note) parts.push(unicorneResult.note);
      return parts.join(' · ');
    }
    if (bicorneResult) {
      const parts = [bicorneResult.asrm, bicorneResult.eshre];
      if (compositeCode) parts.push(`${c.eshreCompositeLabel}: ${compositeCode}`);
      parts.push(`${c.systemCume}: ${c.cumeNotApplicableCleft}`);
      if (extDepthCleftNum !== null) parts.push(c.extConfirmAsrm(extDepthCleft));
      if (extRatioCleft !== null) parts.push(c.extConfirmEshre(extRatioCleft));
      return parts.join(' · ');
    }
    if (tshapeResultActive) {
      const parts = [c.tshapeResult.eshre, c.tshapeResult.asrmNote];
      if (compositeCode) parts.push(`${c.eshreCompositeLabel}: ${compositeCode}`);
      parts.push(`${c.systemCume}: ${c.cumeNotApplicableCleft}`);
      return parts.join(' · ');
    }
    if (showQuant && quantVerdicts.length > 0) {
      const parts = [];
      parts.push(`${c.systemAsrmMac2021}: ${verdictLabel(asrmMac2021Verdict)}`);
      parts.push(`${c.systemEshre}: ${verdictLabel(eshreVerdict)}`);
      parts.push(`${c.systemCume}: ${verdictLabel(cumeVerdict)}`);
      if (compositeCode) parts.push(`${c.eshreCompositeLabel}: ${compositeCode}`);
      return parts.join(' · ');
    }
    return null;
  })();

  const cervixReportStr = cervixFinding ? c.cervixResults[cervixFinding] : null;
  const vaginaReportStr = vaginaFinding ? c.vaginaResults[vaginaFinding] : null;

  const hasAnyResult = !!(bodyReportStr || cervixReportStr || vaginaReportStr);

  // Resumen de 3 líneas (una por sistema) para el recuadro fijo inferior.
  const stickyLines = (() => {
    if (agenesiaResult) return [agenesiaResult.asrm, agenesiaResult.eshre, `${c.systemCume}: ${c.cumeNA}`];
    if (unicorneResult) return [unicorneResult.asrm, unicorneResult.eshre, `${c.systemCume}: ${c.cumeNA}`];
    if (bicorneResult) return [bicorneResult.asrm, bicorneResult.eshre, `${c.systemCume}: ${c.cumeNA}`];
    if (tshapeResultActive) return [c.tshapeResult.asrmNote, c.tshapeResult.eshre, `${c.systemCume}: ${c.cumeNA}`];
    if (showQuant && quantVerdicts.length > 0) {
      return [
        `${c.systemAsrmMac2021}: ${verdictLabel(asrmMac2021Verdict)}`,
        `${c.systemEshre}: ${verdictLabel(eshreVerdict)}${compositeCode ? ` (${compositeCode})` : ''}`,
        `${c.systemCume}: ${verdictLabel(cumeVerdict)}`,
      ];
    }
    return null;
  })();

  const resetAll = () => { resetBody(); setCervixFinding(null); setVaginaFinding(null); };
  const handleCopyAll = () => {
    const parts = [];
    if (bodyReportStr) parts.push(`${c.bodySectionTitle}: ${bodyReportStr}`);
    if (cervixReportStr) parts.push(`${c.cervixSectionTitle}: ${cervixReportStr}`);
    if (vaginaReportStr) parts.push(`${c.vaginaSectionTitle}: ${vaginaReportStr}`);
    if (parts.length === 0) return;
    copyToClipboard(`${c.reportTitle}\n${parts.join('\n')}`, t.common.copiedOk, t.common.copiedErr);
  };

  // Bloque reutilizable: muestra el código compuesto ESHRE/ESGE (U#,C#,V#)
  // dentro de la tarjeta de resultado de cada rama del cuerpo uterino.
  const CompositeCodeBlock = () => !compositeCode ? null : (
    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.eshreCompositeLabel}</p>
      <p className="text-base font-bold text-blue-600 dark:text-blue-400">{compositeCode}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
        {cervixShortLabel || c.cervixNotEvaluated} · {vaginaShortLabel || c.vaginaNotEvaluated}
      </p>
    </div>
  );

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyResult ? 'pb-56' : ''}`}>
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">{c.bodySectionTitle}</h3>

      {dev !== null && (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span className="font-semibold uppercase">{c.resultLabel}</span>
          <div className="flex items-center gap-3">
            <button onClick={handleBodyBack} className="text-blue-500 font-medium">{c.stepBack}</button>
            <button onClick={resetBody} className="text-slate-500 dark:text-slate-400 font-medium">{t.common.reset}</button>
          </div>
        </div>
      )}

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.devQ}</label>
        <div className="space-y-2">
          {c.devOptions.map(opt => (
            <button key={opt.key} onClick={() => handleDev(opt.key)} className={btnCls(dev === opt.key)}>{opt.label}</button>
          ))}
        </div>
      </Card>

      <Accordion icon={<IconBookOpen size={16} />} title={c.devDiagramTitle}>
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">{c.devDiagramIntro}</p>
          <ZoomableDiagram title={c.devDiagramTitle} labels={t.common.diagramZoom}>
            <DevelopmentScheme />
          </ZoomableDiagram>
          <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 dark:text-slate-400 text-center">
            <p>{c.devDiagramBilateralCaption}</p>
            <p>{c.devDiagramUnicorneCaption}</p>
          </div>
        </div>
      </Accordion>

      {/* ---- Agenesia ---- */}
      {dev === 'agenesia' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.agenesiaHornQ}</label>
          <div className="space-y-2">
            <button onClick={() => setAgenesiaHorn('yes')} className={btnCls(agenesiaHorn === 'yes')}>{c.agenesiaHornYes}</button>
            <button onClick={() => setAgenesiaHorn('no')} className={btnCls(agenesiaHorn === 'no')}>{c.agenesiaHornNo}</button>
          </div>
        </Card>
      )}
      {agenesiaResult && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{agenesiaResult.asrm}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{agenesiaResult.eshre}</p>
          <CompositeCodeBlock />
          {agenesiaResult.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{agenesiaResult.note}</p>}
          <InfoBox tone="amber">{`${c.systemCume}: ${c.cumeNotApplicableCleft}`}</InfoBox>
        </Card>
      )}

      {/* ---- Unicorne ---- */}
      {dev === 'unicorne' && (
        <Accordion icon={<IconBookOpen size={16} />} title={c.hemiuterusDiagramTitle}>
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.hemiuterusDiagramIntro}</p>
            <ZoomableDiagram title={c.hemiuterusDiagramTitle} labels={t.common.diagramZoom}>
              <HemiuterusScheme />
            </ZoomableDiagram>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 dark:text-slate-400 text-center">
              <p>{c.hemiuterusDiagramCavityCaption}</p>
              <p>{c.hemiuterusDiagramNoCavityCaption}</p>
            </div>
          </div>
        </Accordion>
      )}
      {dev === 'unicorne' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.unicorneHornQ}</label>
          <div className="space-y-2">
            {c.unicorneHornOptions.map(opt => (
              <button key={opt.key} onClick={() => setUnicorneHorn(opt.key)} className={btnCls(unicorneHorn === opt.key)}>{opt.label}</button>
            ))}
          </div>
        </Card>
      )}
      {unicorneResult && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{unicorneResult.asrm}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{unicorneResult.eshre}</p>
          <CompositeCodeBlock />
          {unicorneResult.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{unicorneResult.note}</p>}
          <InfoBox tone="amber">{`${c.systemCume}: ${c.cumeNotApplicableCleft}`}</InfoBox>
        </Card>
      )}

      {/* ---- Bilateral: contorno externo ---- */}
      {dev === 'bilateral' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.contourQ}</label>
          <div className="space-y-2">
            {c.contourOptions.map(opt => (
              <button key={opt.key} onClick={() => handleContour(opt.key)} className={btnCls(contour === opt.key)}>{opt.label}</button>
            ))}
          </div>
        </Card>
      )}

      {/* ---- Bilateral + cleft: bicorne/didelfo ---- */}
      {dev === 'bilateral' && contour === 'cleft' && (
        <>
          <Accordion icon={<IconBookOpen size={16} />} title={c.bicorneDiagramTitle}>
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.bicorneDiagramIntro}</p>
              <ZoomableDiagram title={c.bicorneDiagramTitle} labels={t.common.diagramZoom}>
                <BicorneScheme />
              </ZoomableDiagram>
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[11px] text-slate-500 dark:text-slate-400">
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-600 mr-1 align-[-1px]"></span>{c.bicorneLegendW}</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-600 mr-1 align-[-1px]"></span>{c.bicorneLegendD}</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-400 mr-1 align-[-1px]"></span>{c.bicorneLegendApex}</span>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-1.5 text-xs">
                <p><span className="font-semibold text-slate-700 dark:text-slate-200">{c.systemAsrmMac2021}: </span><span className="text-slate-600 dark:text-slate-300">{c.bicorneCriteriaAsrm}</span></p>
                <p><span className="font-semibold text-slate-700 dark:text-slate-200">{c.systemEshre}: </span><span className="text-slate-600 dark:text-slate-300">{c.bicorneCriteriaEshre}</span></p>
              </div>
            </div>
          </Accordion>

          <Card className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{c.extNumbersTitle}</h4>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label={c.extDepthQ} value={extDepthCleft} onChange={setExtDepthCleft} placeholder="mm" small />
              <NumberField label={c.wallThicknessQCleft} value={wallThicknessCleft} onChange={setWallThicknessCleft} placeholder="mm" small />
            </div>
          </Card>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.cleftExtentQ}</label>
            <div className="space-y-2">
              <button onClick={() => setCleftExtent('partial')} className={btnCls(cleftExtent === 'partial')}>{c.cleftExtentPartial}</button>
              <button onClick={() => setCleftExtent('complete')} className={btnCls(cleftExtent === 'complete')}>{c.cleftExtentComplete}</button>
            </div>
          </Card>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.cervixCountQ}</label>
            <div className="flex gap-2">
              <button onClick={() => setCervixCount('one')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${cervixCount === 'one' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.cervixCountOne}</button>
              <button onClick={() => setCervixCount('two')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${cervixCount === 'two' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.cervixCountTwo}</button>
            </div>
          </Card>
        </>
      )}
      {bicorneResult && (
        <Card className="text-center space-y-2">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{bicorneResult.asrm}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{bicorneResult.eshre}</p>
          <CompositeCodeBlock />
          {extDepthCleftNum !== null && <p className="text-xs text-slate-500 dark:text-slate-400">{c.extConfirmAsrm(extDepthCleft)}</p>}
          {extRatioCleft !== null && <p className="text-xs text-slate-500 dark:text-slate-400">{c.extConfirmEshre(extRatioCleft)}</p>}
          <InfoBox tone="amber">{`${c.systemCume}: ${c.cumeNotApplicableCleft}`}</InfoBox>
        </Card>
      )}

      {/* ---- Bilateral + normal: T-shape ---- */}
      {dev === 'bilateral' && contour === 'normal' && (
        <Accordion icon={<IconBookOpen size={16} />} title={c.tshapeDiagramTitle}>
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.tshapeDiagramIntro}</p>
            <ZoomableDiagram title={c.tshapeDiagramTitle} labels={t.common.diagramZoom}>
              <TshapeScheme />
            </ZoomableDiagram>
          </div>
        </Accordion>
      )}
      {dev === 'bilateral' && contour === 'normal' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.tshapeQ}</label>
          <div className="flex gap-2">
            <button onClick={() => handleTshape('yes')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${tshape === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.tshapeYes}</button>
            <button onClick={() => handleTshape('no')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${tshape === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.tshapeNo}</button>
          </div>
        </Card>
      )}
      {tshapeResultActive && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{c.tshapeResult.eshre}</p>
          <CompositeCodeBlock />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.tshapeResult.asrmNote}</p>
          <InfoBox tone="amber">{`${c.systemCume}: ${c.cumeNotApplicableCleft}`}</InfoBox>
        </Card>
      )}

      {/* ---- Bilateral + normal + no T-shape: cuantitativo ---- */}
      {showQuant && (
        <>
          <Accordion icon={<IconBookOpen size={16} />} title={c.diagramSectionTitle}>
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.diagramIntro}</p>
              <ZoomableDiagram title={c.diagramSectionTitle} labels={t.common.diagramZoom}>
                <SeptateScheme />
              </ZoomableDiagram>
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[11px] text-slate-500 dark:text-slate-400">
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-600 mr-1 align-[-1px]"></span>{c.schemeLegendW}</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-600 mr-1 align-[-1px]"></span>{c.schemeLegendD}</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-600 mr-1 align-[-1px]"></span>{c.schemeLegendAlpha}</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-400 mr-1 align-[-1px]"></span>{c.schemeLegendIntercornual}</span>
              </div>
              <CriteriaComparison c={c} />
            </div>
          </Accordion>

          <Card className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{c.quantTitle}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.quantIntro}</p>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label={c.intDepthQ} value={intDepth} onChange={setIntDepth} placeholder="mm" small />
              <NumberField label={c.intAngleQ} value={intAngle} onChange={setIntAngle} placeholder="°" small />
              <NumberField label={c.extDepthQNormal} value={extDepthNormal} onChange={setExtDepthNormal} placeholder="mm" small />
              <NumberField label={c.wallThicknessQ} value={wallThickness} onChange={setWallThickness} placeholder="mm" small />
            </div>
          </Card>

          {hasDepth && (
            <Card className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{c.quantResultsTitle}</h4>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-300">{c.systemAsrmMac2021}</span>
                <span className={`text-sm font-bold ${verdictColor(asrmMac2021Verdict)}`}>{verdictLabel(asrmMac2021Verdict)}</span>
              </div>
              <div className="py-1.5 border-b border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{c.systemEshre}</span>
                  <span className={`text-sm font-bold ${verdictColor(eshreVerdict)}`}>{verdictLabel(eshreVerdict)}</span>
                </div>
                {eshreVerdict === VERDICT_SEPTATE && (
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">{c.septumExtentQ}</label>
                    <div className="flex gap-2">
                      <button onClick={() => setSeptumExtent('partial')} className={`flex-1 p-2 rounded-lg border text-xs transition-all ${septumExtent === 'partial' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.septumExtentPartial}</button>
                      <button onClick={() => setSeptumExtent('complete')} className={`flex-1 p-2 rounded-lg border text-xs transition-all ${septumExtent === 'complete' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.septumExtentComplete}</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="py-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{c.systemCume}</span>
                  <span className={`text-sm font-bold ${verdictColor(cumeVerdict)}`}>{verdictLabel(cumeVerdict)}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.cumeDepthLabel}</p>
                {hasAngle && <p className="text-xs text-slate-500 dark:text-slate-400">{c.cumeAngleLabel(intAngle)}</p>}
                {cumeRatio !== null && <p className="text-xs text-slate-500 dark:text-slate-400">{c.cumeRatioLabel(cumeRatio)}</p>}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.cumeNote}</p>
              </div>

              <CompositeCodeBlock />

              {eshreExternalWarning && <InfoBox tone="amber">{c.verdictBicorneWarning}</InfoBox>}
              {quantDiscrepancy && <InfoBox tone="amber">{c.discrepancyWarning}</InfoBox>}
            </Card>
          )}
        </>
      )}

      {/* ==================== Cuello uterino ==================== */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide mt-4">{c.cervixSectionTitle}</h3>
      </div>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.cervixQ}</label>
        <div className="space-y-2">
          {c.cervixOptions.map(opt => (
            <button key={opt.key} onClick={() => setCervixFinding(opt.key)} className={btnCls(cervixFinding === opt.key)}>{opt.label}</button>
          ))}
        </div>
      </Card>
      {cervixReportStr && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cervixReportStr}</p>
        </Card>
      )}

      {/* ==================== Vagina ==================== */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide mt-4">{c.vaginaSectionTitle}</h3>
      </div>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.vaginaQ}</label>
        <div className="space-y-2">
          {c.vaginaOptions.map(opt => (
            <button key={opt.key} onClick={() => setVaginaFinding(opt.key)} className={btnCls(vaginaFinding === opt.key)}>{opt.label}</button>
          ))}
        </div>
      </Card>
      {vaginaReportStr && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{vaginaReportStr}</p>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.mullerianAnomalies} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {hasAnyResult && (
        <StickyBar>
          <div className="min-w-0 w-full text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            {stickyLines ? (
              <div className="mt-1 space-y-0.5">
                {stickyLines.map((line, i) => (
                  <p key={i} className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug truncate">{line}</p>
                ))}
              </div>
            ) : (
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 block mt-1 leading-tight truncate">
                {c.reportTitle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
            <CopyIconButton onClick={handleCopyAll} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
    </div>
  );
}

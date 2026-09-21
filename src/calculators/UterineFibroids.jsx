import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, ZoomableDiagram } from '../components/shared/index.js';

const FIGO_SUBMUCOSAL_TYPES = ['0', '1', '2'];
const FIGO_OTHER_TYPES = ['3', '4', '5', '6', '7', '8'];

/**
 * Esquema FIGO de topografía de miomas uterinos.
 * `onSelectType` es opcional: si se entrega, cada tipo se vuelve clickeable/enfocable
 * (mouse, touch y teclado) y refleja la selección activa vía `highlightType`.
 * El nodo "2-5" es solo un ejemplo ilustrativo del concepto de mioma híbrido
 * (la app permite combinaciones arbitrarias vía las preguntas guiadas), por lo
 * que no es seleccionable directamente.
 */
function FigoFibroidDiagram({ labels, typeLabels, highlightType = null, onSelectType = null }) {
  const [hoveredType, setHoveredType] = useState(null);

  const COLOR_SUBMUCOSAL = '#f59e0b';
  const COLOR_INTRAMURAL = '#14b8a6';
  const COLOR_SUBSEROSAL = '#3b82f6';
  const COLOR_HYBRID = '#8b5cf6';
  const COLOR_HIGHLIGHT = '#ef4444';

  const getColor = (type, defaultHex) => (highlightType === type ? COLOR_HIGHLIGHT : defaultHex);
  const getOpacity = (type) => {
    if (hoveredType === type) return 1;
    if (!highlightType) return 1;
    return highlightType === type ? 1 : 0.35;
  };

  const nodeProps = (type) => {
    const base = { style: { opacity: getOpacity(type) }, filter: 'url(#figoFibroidShadow)', className: 'transition-opacity duration-200' };
    if (!onSelectType) return base;
    return {
      ...base,
      className: `${base.className} cursor-pointer`,
      role: 'button',
      tabIndex: 0,
      'aria-label': typeLabels?.[type] || `FIGO ${type}`,
      onClick: () => onSelectType(type),
      onMouseEnter: () => setHoveredType(type),
      onMouseLeave: () => setHoveredType(null),
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectType(type); }
      },
    };
  };

  const node = (type, defaultHex, children) => (
    <g {...nodeProps(type)}>
      {onSelectType && <title>{typeLabels?.[type] || `FIGO ${type}`}</title>}
      {children(getColor(type, defaultHex))}
    </g>
  );

  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 720 540" className="h-auto w-full max-w-lg select-none" xmlns="http://www.w3.org/2000/svg">
        <title>{labels?.title || 'FIGO'}</title>
        <defs>
          <filter id="figoFibroidShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Miometrio / silueta uterina */}
        <path
          d="M 120,280 C 100,100 280,60 480,120 C 600,160 620,260 560,330 C 500,400 380,430 250,410 C 160,395 130,340 120,280 Z"
          className="fill-slate-200 stroke-slate-400 dark:fill-slate-800/80 dark:stroke-slate-600" strokeWidth="3"
        />
        {/* Borde seroso (auxiliar, punteado) */}
        <path
          d="M 125,280 C 105,105 282,65 478,123 C 595,162 615,258 555,327 C 495,395 378,425 252,405"
          fill="none" className="stroke-slate-400/50 dark:stroke-slate-500/50" strokeWidth="1.5" strokeDasharray="4 4"
        />
        {/* Cavidad endometrial */}
        <path
          d="M 240,240 C 260,180 380,160 530,220 C 560,232 540,270 480,270 C 360,270 280,310 240,240 Z"
          className="fill-slate-300 stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-700" strokeWidth="2"
        />
        {/* Zona de unión (auxiliar, punteada) */}
        <path
          d="M 230,240 C 250,170 385,150 535,210"
          fill="none" className="stroke-slate-500/60 dark:stroke-slate-400/60" strokeWidth="1.5" strokeDasharray="3 3"
        />

        {/* TIPO 0: intracavitario puro, pediculado */}
        {node('0', COLOR_SUBMUCOSAL, (fill) => (<>
          <rect x="296" y="200" width="8" height="20" rx="2" fill={fill} />
          <circle cx="300" cy="225" r="20" fill={fill} />
          <text x="300" y="230" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14">0</text>
        </>))}
        {/* TIPO 1: <50% intramural — centro dentro de la cavidad endometrial */}
        {node('1', COLOR_SUBMUCOSAL, (fill) => (<>
          <circle cx="345" cy="275" r="23" fill={fill} />
          <text x="345" y="280" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14">1</text>
        </>))}
        {/* TIPO 2: ≥50% intramural — centro dentro del miometrio, asoma poco a la cavidad */}
        {node('2', COLOR_SUBMUCOSAL, (fill) => (<>
          <circle cx="430" cy="290" r="24" fill={fill} />
          <text x="430" y="295" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14">2</text>
        </>))}
        {/* TIPO 3: 100% intramural, borde apenas toca la cavidad endometrial (contacto sin protruir) */}
        {node('3', COLOR_INTRAMURAL, (fill) => (<>
          <circle cx="410" cy="152" r="24" fill={fill} />
          <text x="410" y="157" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14">3</text>
        </>))}
        {/* TIPO 4: 100% intramural, sin contacto con cavidad ni serosa */}
        {node('4', COLOR_INTRAMURAL, (fill) => (<>
          <circle cx="340" cy="120" r="24" fill={fill} />
          <text x="340" y="125" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14">4</text>
        </>))}
        {/* TIPO 5: subseroso ≥50% intramural — centro dentro del miometrio, asoma poco a la serosa */}
        {node('5', COLOR_SUBSEROSAL, (fill) => (<>
          <circle cx="230" cy="105" r="24" fill={fill} />
          <text x="230" y="110" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14">5</text>
        </>))}
        {/* TIPO 6: subseroso <50% intramural — centro fuera del miometrio, flotando sobre la serosa */}
        {node('6', COLOR_SUBSEROSAL, (fill) => (<>
          <circle cx="170" cy="405" r="24" fill={fill} />
          <text x="170" y="410" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14">6</text>
        </>))}
        {/* TIPO 7: subseroso pediculado, totalmente externo */}
        {node('7', COLOR_SUBSEROSAL, (fill) => (<>
          <rect x="306" y="415" width="8" height="20" rx="2" fill={fill} />
          <circle cx="310" cy="450" r="22" fill={fill} />
          <text x="310" y="455" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="14">7</text>
        </>))}
        {/* Híbrido 2-5: ejemplo ilustrativo, no seleccionable directamente */}
        <g style={{ opacity: getOpacity('2-5') }} filter="url(#figoFibroidShadow)" className="transition-opacity duration-200">
          <title>{`${labels?.hybrid || 'Híbrido'} 2-5`}</title>
          <circle cx="510" cy="340" r="55" fill={COLOR_HYBRID} />
          <text x="510" y="345" textAnchor="middle" fill="#ffffff" fontWeight="700" fontSize="15">2-5</text>
        </g>

        <g className="fill-slate-700 dark:fill-slate-300" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif">
          <text x="230" y="60" textAnchor="middle">{labels?.subserosal || 'Subserosal'}</text>
          <text x="440" y="70" textAnchor="middle">{labels?.intramural || 'Intramural'}</text>
          <text x="180" y="240" textAnchor="middle">{labels?.submucosal || 'Submucosal'}</text>
        </g>
      </svg>
    </div>
  );
}

export default function UterineFibroids() {
  const { t } = useLang();
  const c = t.calc.leiomyoma;

  const figoDiagramTypeLabels = {};
  Object.values(c.figoTypes).forEach((v) => { figoDiagramTypeLabels[v.code] = v.label; });

  /* ---------- Sección 1: Clasificación FIGO ---------- */
  const [figoQ1, setFigoQ1] = useState(null); // null | 'type0' | 'type1' | 'type2' | 'noCavity'
  const [figoQ2, setFigoQ2] = useState(null); // null | 'type3'..'type8'
  const [figoHybrid, setFigoHybrid] = useState(false);
  const [figoHybridPick, setFigoHybridPick] = useState(null); // '1'|'2'|'5'|'6'
  const [figoMargin, setFigoMargin] = useState('');

  const resetFigo = () => { setFigoQ1(null); setFigoQ2(null); setFigoHybrid(false); setFigoHybridPick(null); setFigoMargin(''); };
  const handleFigoQ1 = (key) => { setFigoQ1(key); setFigoQ2(null); setFigoHybrid(false); setFigoHybridPick(null); setFigoMargin(''); };
  const handleFigoQ2 = (key) => { setFigoQ2(key); setFigoHybrid(false); setFigoHybridPick(null); setFigoMargin(''); };
  const handleFigoBack = () => {
    if (figoHybrid) { setFigoHybrid(false); setFigoHybridPick(null); return; }
    if (figoQ2 !== null) { setFigoQ2(null); return; }
    if (figoQ1 !== null) { setFigoQ1(null); return; }
  };
  // Selección directa desde el esquema FIGO: reproduce la respuesta a las preguntas
  // guiadas que llevaría a ese mismo tipo, para no duplicar la lógica del árbol.
  const handleDiagramSelect = (type) => {
    if (FIGO_SUBMUCOSAL_TYPES.includes(type)) {
      handleFigoQ1(`type${type}`);
    } else if (FIGO_OTHER_TYPES.includes(type)) {
      handleFigoQ1('noCavity');
      handleFigoQ2(`type${type}`);
    }
  };

  const figoPrimaryKey = figoQ1 && figoQ1 !== 'noCavity' ? figoQ1 : figoQ2;
  const figoDiagramHighlight = figoPrimaryKey ? figoPrimaryKey.replace('type', '') : null;
  const figoTypeObj = figoPrimaryKey ? c.figoTypes[figoPrimaryKey] : null;
  const canHybridSubmucosal = ['type1', 'type2', 'type3'].includes(figoPrimaryKey);
  const canHybridSubserosal = ['type5', 'type6'].includes(figoPrimaryKey);
  const showMarginField = ['type2', 'type3', 'type4'].includes(figoPrimaryKey);
  const hybridCode = (figoHybrid && figoHybridPick && figoTypeObj)
    ? (canHybridSubmucosal ? `${figoTypeObj.code}-${figoHybridPick}` : `${figoHybridPick}-${figoTypeObj.code}`)
    : null;
  const figoReportStr = figoTypeObj ? c.figoReportText(figoTypeObj.label, hybridCode, figoMargin) : null;

  /* ---------- Sección 2: Riesgo de leiomiosarcoma ---------- */
  const [step1, setStep1] = useState(null);
  const [t2, setT2] = useState(null);
  const [dw, setDw] = useState(null);
  const [adcMode, setAdcMode] = useState('quant'); // 'quant' | 'qual'
  const [adc, setAdc] = useState('');
  const [adcQual, setAdcQual] = useState(null); // null | 'low' | 'high'
  const [margins, setMargins] = useState(null);
  const [menop, setMenop] = useState(null);
  // Caracterización opcional de variante/degeneración (solo se ofrece cuando el
  // riesgo de leiomiosarcoma ya resultó bajo: Score 2 o 3). No modifica ni depende
  // de una nueva pregunta redundante: reutiliza la señal T2 (t2) y el score ya
  // calculados por el algoritmo de riesgo, y solo agrega T1/fat-sat/realce.
  const [t1Signal, setT1Signal] = useState(null); // null | 'isohypo' | 'hyper' | 'void'
  const [fatSatLoss, setFatSatLoss] = useState(null); // null | 'yes' | 'no'
  const [enhancement, setEnhancement] = useState(null); // null | 'none_minimal' | 'progressive' | 'marked'

  const resetVariant = () => { setT1Signal(null); setFatSatLoss(null); setEnhancement(null); };
  const resetAdcStep = () => { setAdcMode('quant'); setAdc(''); setAdcQual(null); setMargins(null); setMenop(null); resetVariant(); };
  const handleStep1 = (v) => { setStep1(v); setT2(null); setDw(null); resetAdcStep(); };
  const handleT2 = (v) => { setT2(v); setDw(null); resetAdcStep(); };
  const handleDw = (v) => { setDw(v); resetAdcStep(); };
  const handleMargins = (v) => { setMargins(v); setMenop(null); resetVariant(); };
  const handleT1Signal = (v) => { setT1Signal(v); setFatSatLoss(null); setEnhancement(null); };
  const resetRisk = () => { setStep1(null); setT2(null); setDw(null); resetAdcStep(); };
  const handleRiskBack = () => {
    if (enhancement !== null) { setEnhancement(null); return; }
    if (fatSatLoss !== null) { setFatSatLoss(null); return; }
    if (t1Signal !== null) { setT1Signal(null); return; }
    if (menop !== null) { setMenop(null); return; }
    if (margins !== null) { setMargins(null); return; }
    if (adc !== '' || adcQual !== null) { setAdc(''); setAdcQual(null); return; }
    if (dw !== null) { setDw(null); return; }
    if (t2 !== null) { setT2(null); return; }
    if (step1 !== null) { setStep1(null); return; }
  };

  const adcNum = adc === '' ? null : parseFloat(adc);
  const adcNumValid = adcNum !== null && !isNaN(adcNum);
  const hasAdcInput = adcMode === 'quant' ? adcNumValid : adcQual !== null;
  // "restringido" equivale a ADC <= 1.23 x10^-3 mm^2/s (umbral cuantitativo validado);
  // en modo cualitativo, "marcadamente bajo" se mapea a esa misma rama.
  const adcRestricted = !hasAdcInput ? null : (adcMode === 'quant' ? adcNum <= 1.23 : adcQual === 'low');

  let resultKey = null;
  if (step1 === 'no') resultKey = 'score1';
  else if (step1 === 'yes') {
    if (t2 === 'low') resultKey = 'score2';
    else if (t2 === 'highInt') {
      if (dw === 'low') resultKey = 'score2';
      else if (dw === 'high') {
        if (hasAdcInput) {
          if (!adcRestricted) resultKey = 'score2';
          else if (margins === 'smooth') resultKey = 'score3';
          else if (margins === 'irregular') {
            if (menop === 'pre') resultKey = 'score4';
            else if (menop === 'post') resultKey = 'score5';
          }
        }
      }
    }
  }
  const resultObj = resultKey ? c[resultKey] : null;
  const scoreColor = !resultKey ? '' : (resultKey === 'score1' ? 'text-slate-500' : resultKey === 'score2' ? 'text-emerald-500' : resultKey === 'score3' ? 'text-amber-500' : 'text-red-500');

  const showMarginsQ = step1 === 'yes' && t2 === 'highInt' && dw === 'high' && hasAdcInput && adcRestricted;
  const showMenopQ = showMarginsQ && margins === 'irregular';

  // Caracterización de variante/degeneración: solo se ofrece cuando el riesgo ya
  // resultó bajo (Score 2 o 3); reutiliza `t2` y `resultKey` del algoritmo de
  // riesgo (ver Arleo et al. AJR 2015; DeMulder & Ascher, AJR 2018, Tabla 2).
  const showVariantForm = resultKey === 'score2' || resultKey === 'score3';
  let variant = null;
  if (showVariantForm) {
    if (t1Signal === 'void') {
      variant = 'calcific';
    } else if (t1Signal === 'hyper') {
      if (fatSatLoss === 'yes') variant = 'lipoleiomyoma';
      else if (fatSatLoss === 'no') variant = 'red';
    } else if (t1Signal === 'isohypo') {
      if (t2 === 'low') {
        if (enhancement === 'none_minimal') variant = 'hyaline';
        else if (enhancement) variant = 'usual';
      } else if (t2 === 'highInt') {
        if (enhancement === 'none_minimal') variant = 'cystic';
        else if (enhancement === 'progressive') variant = 'myxoid';
        else if (enhancement === 'marked') variant = resultKey === 'score3' ? 'cellular' : 'indeterminate';
      }
    }
  }
  const variantReportStr = variant ? `${c.variantSectionTitle}: ${c.variants[variant]}. ${c.variantsDesc[variant] || ''}`.trim() : null;

  const riskReportStr = (() => {
    if (!resultObj) return null;
    const parts = [];
    if (step1) parts.push(step1 === 'yes' ? c.step1Yes : c.step1No);
    if (t2) parts.push(t2 === 'low' ? c.step2Low : c.step2HighInt);
    if (dw) parts.push(dw === 'low' ? c.step3Low : c.step3High);
    if (dw === 'high' && hasAdcInput) {
      parts.push(adcMode === 'quant'
        ? `ADC ${adc} × 10⁻³ mm²/s`
        : `${c.adcQualLabelShort} (${adcQual === 'low' ? c.step4QualLow : c.step4QualHigh}) — ${c.step4QualWarningShort}`);
    }
    if (margins) parts.push(margins === 'smooth' ? c.step5Smooth : c.step5Irregular);
    if (menop) parts.push(menop === 'pre' ? c.step6Pre : c.step6Post);
    const path = parts.join('; ');
    return c.reportText(path, resultObj.label, resultObj.ppv, resultObj.mgmt);
  })();

  /* ---------- Combinado: reset total, copia total, sticky bar ---------- */
  const resetAll = () => { resetFigo(); resetRisk(); };
  const hasAnyResult = !!(figoTypeObj || resultObj);
  const handleCopyAll = () => {
    const parts = [figoReportStr, riskReportStr, variantReportStr].filter(Boolean);
    if (parts.length === 0) return;
    copyToClipboard(parts.join('\n\n'), t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyResult ? 'pb-56' : ''}`}>
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">{c.figoSectionTitle}</h3>
      <InfoBox tone="amber">{c.figoIntro}</InfoBox>

      <Card>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">{c.figoDiagramTitle}</p>
        <ZoomableDiagram title={c.figoDiagramTitle} labels={t.common.diagramZoom}>
          <FigoFibroidDiagram
            labels={c.figoDiagramLabels}
            typeLabels={figoDiagramTypeLabels}
            highlightType={figoDiagramHighlight}
            onSelectType={handleDiagramSelect}
          />
        </ZoomableDiagram>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#f59e0b] mr-1 align-[-1px]"></span>{c.figoDiagramLabels.submucosal} (0-2)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#14b8a6] mr-1 align-[-1px]"></span>{c.figoDiagramLabels.intramural} (3-4)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#3b82f6] mr-1 align-[-1px]"></span>{c.figoDiagramLabels.subserosal} (5-7)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#8b5cf6] mr-1 align-[-1px]"></span>{c.figoDiagramLabels.hybrid}</span>
        </div>
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-1">{c.figoDiagramHint}</p>
      </Card>

      {figoQ1 !== null && (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span className="font-semibold uppercase">{c.figoResultLabel}</span>
          <div className="flex items-center gap-3">
            <button onClick={handleFigoBack} className="text-blue-500 font-medium">{c.stepBack}</button>
            <button onClick={resetFigo} className="text-slate-500 dark:text-slate-400 font-medium">{t.common.reset}</button>
          </div>
        </div>
      )}

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.figoQ1}</label>
        <div className="space-y-2">
          {c.figoQ1Options.map(opt => (
            <button key={opt.key} onClick={() => handleFigoQ1(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${figoQ1 === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
          ))}
        </div>
      </Card>

      {figoQ1 === 'noCavity' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.figoQ2}</label>
          <div className="space-y-2">
            {c.figoQ2Options.map(opt => (
              <button key={opt.key} onClick={() => handleFigoQ2(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${figoQ2 === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
            ))}
          </div>
        </Card>
      )}

      {(canHybridSubmucosal || canHybridSubserosal) && (
        <Card>
          <button onClick={() => { setFigoHybrid(v => !v); setFigoHybridPick(null); }} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-1.5 ${figoHybrid ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
            {figoHybrid ? <IconCheckCircle size={14} /> : <span className="w-3.5 shrink-0" />}
            <span>{canHybridSubmucosal ? c.figoHybridQSubmucosal : c.figoHybridQSubserosal}</span>
          </button>
          {figoHybrid && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{canHybridSubmucosal ? c.figoHybridPickSerosal : c.figoHybridPickSubmucosal}</p>
              <div className="flex gap-2">
                {(canHybridSubmucosal ? c.figoHybridOptions5 : c.figoHybridOptions2).map(opt => (
                  <button key={opt.key} onClick={() => setFigoHybridPick(opt.key)} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${figoHybridPick === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {showMarginField && (
        <Card>
          <NumberField label={c.figoMarginQ} value={figoMargin} onChange={setFigoMargin} placeholder={c.figoMarginPh} />
        </Card>
      )}

      {figoTypeObj && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.figoResultLabel}</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{figoTypeObj.code}{hybridCode ? ` (${hybridCode})` : ''}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{figoTypeObj.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{figoTypeObj.desc}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{figoTypeObj.mgmt}</p>
        </Card>
      )}

      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide mt-4">{c.riskSectionTitle}</h3>
      </div>

      {step1 !== null && (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span className="font-semibold uppercase">{c.resultLabel}</span>
          <div className="flex items-center gap-3">
            <button onClick={handleRiskBack} className="text-blue-500 font-medium">{c.stepBack}</button>
            <button onClick={resetRisk} className="text-slate-500 dark:text-slate-400 font-medium">{t.common.reset}</button>
          </div>
        </div>
      )}
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step1Q}</label>
        <div className="space-y-2">
          <button onClick={() => handleStep1('yes')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${step1 === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step1Yes}</button>
          <button onClick={() => handleStep1('no')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${step1 === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step1No}</button>
        </div>
      </Card>

      {step1 === 'yes' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step2Q}</label>
          <div className="space-y-2">
            <button onClick={() => handleT2('low')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${t2 === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step2Low}</button>
            <button onClick={() => handleT2('highInt')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${t2 === 'highInt' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step2HighInt}</button>
          </div>
        </Card>
      )}

      {step1 === 'yes' && t2 === 'highInt' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step3Q}</label>
          <div className="space-y-2">
            <button onClick={() => handleDw('low')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${dw === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step3Low}</button>
            <button onClick={() => handleDw('high')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${dw === 'high' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step3High}</button>
          </div>
        </Card>
      )}

      {step1 === 'yes' && t2 === 'highInt' && dw === 'high' && (
        <Card className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.adcModeLabel}</label>
            <div className="flex gap-2">
              <button onClick={() => { setAdcMode('quant'); setAdcQual(null); }} className={`flex-1 py-2 rounded-lg font-medium border text-xs transition-all ${adcMode === 'quant' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.adcModeQuant}</button>
              <button onClick={() => { setAdcMode('qual'); setAdc(''); }} className={`flex-1 py-2 rounded-lg font-medium border text-xs transition-all ${adcMode === 'qual' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.adcModeQual}</button>
            </div>
          </div>
          {adcMode === 'quant' ? (
            <NumberField label={c.step4Q} value={adc} onChange={setAdc} placeholder={c.step4Ph} />
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.step4QualLabel}</label>
              <button onClick={() => setAdcQual('low')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${adcQual === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step4QualLow}</button>
              <button onClick={() => setAdcQual('high')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${adcQual === 'high' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step4QualHigh}</button>
              <InfoBox tone="amber">{c.step4QualWarning}</InfoBox>
            </div>
          )}
        </Card>
      )}

      {showMarginsQ && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step5Q}</label>
          <div className="space-y-2">
            <button onClick={() => handleMargins('smooth')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${margins === 'smooth' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step5Smooth}</button>
            <button onClick={() => handleMargins('irregular')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${margins === 'irregular' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step5Irregular}</button>
          </div>
        </Card>
      )}

      {showMenopQ && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.step6Q}</label>
          <div className="flex gap-2">
            <button onClick={() => setMenop('pre')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${menop === 'pre' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step6Pre}</button>
            <button onClick={() => setMenop('post')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${menop === 'post' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.step6Post}</button>
          </div>
        </Card>
      )}

      {resultObj && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <span className={`text-2xl font-black ${scoreColor}`}>{resultObj.label}</span>
          {resultObj.ppv && <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">{resultObj.ppv}</p>}
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{resultObj.mgmt}</p>
        </Card>
      )}

      {showVariantForm && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide mt-4">{c.variantSectionTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">{c.variantIntro}</p>

          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.t1SignalQ}</label>
            <div className="space-y-2">
              {c.t1SignalOpts.map(opt => (
                <button key={opt.key} onClick={() => handleT1Signal(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${t1Signal === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
              ))}
            </div>
          </Card>

          {t1Signal === 'hyper' && (
            <Card className="mt-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.fatSatQ}</label>
              <div className="flex gap-2">
                <button onClick={() => setFatSatLoss('yes')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${fatSatLoss === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
                <button onClick={() => setFatSatLoss('no')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${fatSatLoss === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
              </div>
            </Card>
          )}

          {t1Signal === 'isohypo' && (
            <Card className="mt-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.enhancementQ}</label>
              <div className="space-y-2">
                {c.enhancementOpts.map(opt => (
                  <button key={opt.key} onClick={() => setEnhancement(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${enhancement === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
                ))}
              </div>
            </Card>
          )}

          {variant && (
            <Card className="text-center mt-3">
              <span className="text-xs text-slate-500 block mb-1">{c.variantResultLabel}</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{c.variants[variant]}</span>
              {c.variantsDesc[variant] && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.variantsDesc[variant]}</p>}
            </Card>
          )}
        </div>
      )}

      <UsageNotes paragraphs={[...c.figoUsage, ...c.usage]} />
      <References items={REFERENCES.leiomyoma} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {hasAnyResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block leading-tight">
              {figoTypeObj && resultObj ? `FIGO ${figoTypeObj.code}${hybridCode ? ` (${hybridCode})` : ''} · ${resultObj.label}` : figoTypeObj ? `FIGO ${figoTypeObj.code}${hybridCode ? ` (${hybridCode})` : ''}` : resultObj.label}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 block mt-1">
              {figoTypeObj && resultObj ? `${c.figoResultLabel} · ${c.resultLabel}` : figoTypeObj ? c.figoResultLabel : c.resultLabel}
            </span>
            {variant && (
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mt-1">{c.variants[variant]}</span>
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

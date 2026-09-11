import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion } from '../components/shared/index.js';
import { IconClock } from '../components/icons/index.js';

// Lista de botones de opción única (mismo patrón que PancreaticCyst/PancreasResect).
function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

// Selector segmentado horizontal (mismo patrón que el toggle de factor en PSADCalculator).
function Segmented({ options, value, onChange }) {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm transition-all ${value === opt.key ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}

// Días entre dos fechas 'YYYY-MM-DD' (formato nativo de <input type="date">).
function daysBetween(d1, d2) {
  const t1 = new Date(d1 + 'T00:00:00');
  const t2 = new Date(d2 + 'T00:00:00');
  if (isNaN(t1) || isNaN(t2)) return null;
  return Math.round((t2 - t1) / 86400000);
}

export default function VDT() {
  const { t } = useLang();
  const c = t.calc.vdt;

  const [noduleType, setNoduleType] = useState(null); // 'solid' | 'partSolid' | 'nonSolid'
  const [measurementMode, setMeasurementMode] = useState('volume'); // 'volume' | 'diameter'
  const [baseline, setBaseline] = useState('');
  const [followup, setFollowup] = useState('');
  const [intervalMode, setIntervalMode] = useState('dates'); // 'dates' | 'manual'
  const [baselineDate, setBaselineDate] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [manualDays, setManualDays] = useState('');

  const unit = measurementMode === 'volume' ? 'mm³' : 'mm';

  const hBaseline = parseFloat(baseline);
  const hFollowup = parseFloat(followup);
  const hasBaseline = !isNaN(hBaseline) && hBaseline > 0;
  const hasFollowup = !isNaN(hFollowup) && hFollowup > 0;

  const intervalDays = intervalMode === 'dates'
    ? (baselineDate && followupDate ? daysBetween(baselineDate, followupDate) : null)
    : (manualDays !== '' && !isNaN(parseFloat(manualDays)) ? parseFloat(manualDays) : null);
  const hasInterval = intervalDays !== null && intervalDays > 0;

  const hasAllInputs = hasBaseline && hasFollowup && hasInterval;

  // Se normaliza todo a una "razón de volumen": si la medición fue por diámetro, se usa la
  // relación V ∝ d³ (misma equivalencia matemática documentada en Gould 2013 y Prokop 2026).
  const rawRatio = hasAllInputs ? hFollowup / hBaseline : null;
  const volumeRatio = hasAllInputs ? (measurementMode === 'volume' ? rawRatio : Math.pow(rawRatio, 3)) : null;

  const isStable = hasAllInputs && Math.abs(volumeRatio - 1) < 0.005;
  const isGrowth = hasAllInputs && !isStable && volumeRatio > 1;
  const isShrinkage = hasAllInputs && !isStable && volumeRatio < 1;

  const vdtDays = isGrowth ? (intervalDays * Math.LN2) / Math.log(volumeRatio) : null;
  const vhtDays = isShrinkage ? (intervalDays * Math.LN2) / Math.log(1 / volumeRatio) : null;

  // Cambios porcentuales cruzados (volumen y diámetro), independientemente de qué se haya
  // medido directamente — permite mostrar la nota de verificación cruzada en ambos modos.
  const volumePercent = hasAllInputs ? (measurementMode === 'volume' ? (rawRatio - 1) * 100 : (Math.pow(rawRatio, 3) - 1) * 100) : null;
  const diameterPercent = hasAllInputs ? (measurementMode === 'diameter' ? (rawRatio - 1) * 100 : (Math.pow(rawRatio, 1 / 3) - 1) * 100) : null;

  // Proyección de crecimiento exponencial constante a intervalos habituales de seguimiento
  // (90/180/365 días), solo como referencia matemática — ver growthProjectionNote.
  const projections = isGrowth ? [90, 180, 365].map(d => ({ days: d, fold: Math.pow(2, d / vdtDays) })) : [];

  // ---- Marco clásico (Gould/ACCP 2013) ----
  let classicNote = null;
  if (isGrowth && noduleType === 'solid') {
    classicNote = vdtDays < 20 ? c.classicSolidRapidNote : vdtDays <= 400 ? c.classicSolidTypicalNote : c.classicSolidSlowNote;
  } else if (isGrowth && (noduleType === 'partSolid' || noduleType === 'nonSolid')) {
    classicNote = c.classicSubsolidRangeNote;
  }
  const classicFlag = isGrowth && noduleType === 'solid' && vdtDays >= 20 && vdtDays <= 400;

  // ---- Metaanálisis Jiang 2024 ----
  const JIANG_THRESHOLD = { solid: 400, partSolid: 600, nonSolid: 800 };
  const jiangThresholdNote = noduleType === 'solid' ? c.jiangValidatedThresholdNote : (noduleType ? c.jiangProposedThresholdNote : null);
  const jiangFlag = isGrowth && noduleType && vdtDays <= JIANG_THRESHOLD[noduleType];

  // ---- ESTI/Prokop 2026 (umbrales ajustados por intervalo de seguimiento) ----
  // Los umbrales de la fuente son discretos por protocolo (3/6/12 meses); se aproxima el
  // intervalo ingresado al más cercano usando los puntos medios entre esas categorías
  // (135 y 270 días) solo para decidir qué línea resaltar en la UI — no es un dato nuevo,
  // es una forma de mapear un intervalo cualquiera a las tres categorías de la fuente.
  const estiBucket = hasInterval ? (intervalDays <= 135 ? '3mo' : intervalDays <= 270 ? '6mo' : '12mo') : null;
  const ESTI_THRESHOLD = { '3mo': 250, '6mo': 400, '12mo': 500 };
  const estiFlag = isGrowth && estiBucket && vdtDays < ESTI_THRESHOLD[estiBucket];

  // ---- BTS (vía Callister/NEJM 2026, Tabla 2) ----
  const btsBand = isGrowth ? (vdtDays <= 400 ? 1 : vdtDays <= 600 ? 2 : 3) : null;

  const showInterpretation = hasAllInputs;
  const showResult = hasAllInputs;

  const handleCopy = () => {
    const lines = [c.title];
    if (isGrowth) lines.push(`${c.resultVdtLabel} ${Math.round(vdtDays)} d`);
    else if (isShrinkage) lines.push(`${c.resultShrinkageLabel} ${Math.round(vhtDays)} d`);
    else if (isStable) lines.push(c.resultStableLabel);
    if (volumePercent !== null && diameterPercent !== null) {
      lines.push(c.crossCheckNote(volumePercent.toFixed(1), diameterPercent.toFixed(1)));
    }
    if (noduleType && classicNote) lines.push(`${c.classicFrameTitle}: ${classicNote}`);
    if (noduleType && jiangThresholdNote) lines.push(`${c.jiangFrameTitle}: ${jiangThresholdNote}`);
    if (estiBucket) lines.push(`${c.estiFrameTitle}: ${c[`esti${estiBucket}ThresholdNote`]}`);
    if (btsBand) lines.push(`${c.btsFrameTitle}: ${c[`btsBand${btsBand}Note`]}`);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  const resetAll = () => {
    setNoduleType(null); setMeasurementMode('volume'); setBaseline(''); setFollowup('');
    setIntervalMode('dates'); setBaselineDate(''); setFollowupDate(''); setManualDays('');
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${showResult ? 'pb-56' : ''}`}>
      <Card>
        <OptionList
          label={c.noduleTypeLabel}
          options={[
            { key: 'solid', label: c.noduleTypeSolidLabel },
            { key: 'partSolid', label: c.noduleTypePartSolidLabel },
            { key: 'nonSolid', label: c.noduleTypeNonSolidLabel },
          ]}
          value={noduleType}
          onChange={setNoduleType}
        />
      </Card>

      <Card className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.measurementModeLabel}</label>
          <Segmented
            options={[
              { key: 'volume', label: c.measurementModeVolumeLabel },
              { key: 'diameter', label: c.measurementModeDiameterLabel },
            ]}
            value={measurementMode}
            onChange={setMeasurementMode}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={`${c.baselineValueLabel} (${unit})`} value={baseline} onChange={setBaseline} />
          <NumberField label={`${c.followupValueLabel} (${unit})`} value={followup} onChange={setFollowup} />
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.intervalModeLabel}</label>
          <Segmented
            options={[
              { key: 'dates', label: c.intervalModeDatesLabel },
              { key: 'manual', label: c.intervalModeManualLabel },
            ]}
            value={intervalMode}
            onChange={setIntervalMode}
          />
        </div>
        {intervalMode === 'dates' ? (
          <div className="grid grid-cols-2 gap-3">
            <DateField label={c.baselineDateLabel} value={baselineDate} onChange={setBaselineDate} />
            <DateField label={c.followupDateLabel} value={followupDate} onChange={setFollowupDate} />
          </div>
        ) : (
          <NumberField label={c.manualDaysLabel} value={manualDays} onChange={setManualDays} />
        )}
      </Card>

      {showInterpretation && (
        <>
          <Card className="text-center space-y-1">
            {isGrowth && (
              <>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.resultVdtLabel}</span>
                <span className="text-3xl font-black text-amber-500">{Math.round(vdtDays)} d</span>
              </>
            )}
            {isShrinkage && (
              <>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.resultShrinkageLabel}</span>
                <span className="text-3xl font-black text-emerald-500">{Math.round(vhtDays)} d</span>
              </>
            )}
            {isStable && (
              <span className="text-lg font-bold text-slate-500 dark:text-slate-400">{c.resultStableLabel}</span>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">{c.crossCheckNote(volumePercent.toFixed(1), diameterPercent.toFixed(1))}</p>
          </Card>

          {isGrowth && (
            <Card>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{c.growthProjectionLabel}</p>
              <div className="flex gap-2">
                {projections.map(p => (
                  <div key={p.days} className="flex-1 text-center bg-slate-50 dark:bg-slate-900 rounded-lg py-2">
                    <span className="block text-xs text-slate-400">{p.days} d</span>
                    <span className="block text-sm font-bold text-slate-600 dark:text-slate-300">×{p.fold.toFixed(1)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-2">{c.growthProjectionNote}</p>
            </Card>
          )}

          {isShrinkage && <InfoBox tone="slate">{c.classicTransientShrinkageNote}</InfoBox>}

          {isStable && (
            <Card className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-300">{c.classicStabilityNote}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700">{c.subsolidStabilityNote}</p>
            </Card>
          )}

          {isGrowth && !noduleType && (
            <InfoBox tone="slate">{c.noduleTypeLabel}</InfoBox>
          )}

          {isGrowth && noduleType && (
            <>
              <Accordion icon={<IconClock size={16} />} title={c.classicFrameTitle}>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p className={classicFlag ? 'font-semibold text-amber-600 dark:text-amber-400' : ''}>{classicNote}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700">{c.classicTransientShrinkageNote}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{c.subsolidStabilityNote}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">{c.classicFrameCitation}</p>
                </div>
              </Accordion>

              <Accordion icon={<IconClock size={16} />} title={c.jiangFrameTitle}>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p className="text-xs text-slate-400 dark:text-slate-500">{c.jiangPooledMeanNote}</p>
                  <p><span className="font-medium">{c.jiangPooledByTypeLabel}</span> {c.jiangPooledByTypeValues}</p>
                  <p><span className="font-medium">{c.jiangPooledByHistologyLabel}</span> {c.jiangPooledByHistologyValues}</p>
                  <p className={jiangFlag ? 'font-semibold text-amber-600 dark:text-amber-400' : ''}>{jiangThresholdNote}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700">{c.jiangIndolentDefNote}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{c.jiangSmokingCaveatNote}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">{c.jiangFrameCitation}</p>
                </div>
              </Accordion>

              <Accordion icon={<IconClock size={16} />} title={c.estiFrameTitle}>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p className="text-xs text-slate-400 dark:text-slate-500">{c.estiContextNote}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{c.estiIntervalRationaleNote}</p>
                  <p className={estiBucket === '3mo' ? (estiFlag ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-semibold') : ''}>{c.esti3moThresholdNote}</p>
                  <p className={estiBucket === '6mo' ? (estiFlag ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-semibold') : ''}>{c.esti6moThresholdNote}</p>
                  <p className={estiBucket === '12mo' ? (estiFlag ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-semibold') : ''}>{c.esti12moThresholdNote}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700">{c.estiFixedThresholdCritiqueNote}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">{c.estiFrameCitation}</p>
                </div>
              </Accordion>

              <Accordion icon={<IconClock size={16} />} title={c.btsFrameTitle}>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p className={btsBand === 1 ? 'font-semibold text-red-600 dark:text-red-400' : ''}>{c.btsBand1Note}</p>
                  <p className={btsBand === 2 ? 'font-semibold text-amber-600 dark:text-amber-400' : ''}>{c.btsBand2Note}</p>
                  <p className={btsBand === 3 ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}>{c.btsBand3Note}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">{c.btsFrameCitation}</p>
                </div>
              </Accordion>
            </>
          )}
        </>
      )}

      <InfoBox tone="slate">{c.generalCaveatNote}</InfoBox>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.vdt} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {showResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            {isGrowth && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultVdtLabel}</span>
                <span className="text-3xl font-black text-amber-500 block mt-1">{Math.round(vdtDays)} d</span>
              </>
            )}
            {isShrinkage && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultShrinkageLabel}</span>
                <span className="text-3xl font-black text-emerald-500 block mt-1">{Math.round(vhtDays)} d</span>
              </>
            )}
            {isStable && <span className="text-xl font-bold text-slate-500 dark:text-slate-400">{c.resultStableLabel}</span>}
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

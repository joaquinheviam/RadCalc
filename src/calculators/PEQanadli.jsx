import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconAlertTriangle, IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, Accordion, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

// Lista de botones de opción única (patrón compartido con otras calculadoras).
function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}
function YesNo({ label, value, onChange, yesLabel, noLabel }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <button onClick={() => onChange(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === true ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{yesLabel}</button>
        <button onClick={() => onChange(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{noLabel}</button>
      </div>
    </div>
  );
}

const PE_QANADLI_LUNGS = [
  { key: 'right', nameKey: 'qanadliRightLung', groups: [
      { labelKey: 'qanadliLobeUpper', ids: ['rUpApical', 'rUpPosterior', 'rUpAnterior'] },
      { labelKey: 'qanadliLobeMiddle', ids: ['rMidLateral', 'rMidMedial'] },
      { labelKey: 'qanadliLobeLower', ids: ['rLowSuperior', 'rLowMedialBasal', 'rLowAnteriorBasal', 'rLowLateralBasal', 'rLowPosteriorBasal'] },
    ] },
  { key: 'left', nameKey: 'qanadliLeftLung', groups: [
      { labelKey: 'qanadliLobeUpper', ids: ['lUpApical', 'lUpPosterior', 'lUpAnterior'] },
      { labelKey: 'qanadliLobeLingula', ids: ['lLinSuperior', 'lLinInferior'] },
      { labelKey: 'qanadliLobeLower', ids: ['lLowSuperior', 'lLowMedialBasal', 'lLowAnteriorBasal', 'lLowLateralBasal', 'lLowPosteriorBasal'] },
    ] },
];

const PE_QANADLI_ALL_IDS = PE_QANADLI_LUNGS.flatMap(l => l.groups.flatMap(g => g.ids));

export default function PEQanadli() {
  const { t, lang } = useLang();
  const c = t.calc.peQanadli;
  const p = c.perads;
  const [mode, setMode] = useState('perads'); // 'perads' (por defecto) | 'quant'

  // ---- Estado PE-RADS v2026 ----
  const [quality, setQuality] = useState('optimal'); // 'optimal' | 'limited' | 'nondiagnostic'
  const [location, setLocation] = useState(null); // '0' | '1' | '2' | '3' | '4'
  const [exception, setException] = useState(false);
  const [rvPlus, setRvPlus] = useState(false);
  const [tPlus, setTPlus] = useState(false);

  const showPerads = quality === 'nondiagnostic' || location !== null;
  let peradsCode = '', peradsTitle = '', peradsTone = 'slate', peradsFindings = '', peradsMgmt = '', peradsInv = '';
  if (quality === 'nondiagnostic') {
    peradsCode = 'PE-RADS N' + (exception ? '/E' : '');
    peradsTitle = p.catNTitle; peradsTone = 'red'; peradsFindings = p.catNText;
  } else if (quality === 'limited' && location === '0') {
    peradsCode = 'PE-RADS 0L' + (exception ? '/E' : '');
    peradsTitle = p.cat0LTitle; peradsTone = 'amber'; peradsFindings = p.cat0LText;
  } else if (location !== null) {
    let code = `PE-RADS ${location}`;
    if (exception) code += '/E';
    if (rvPlus) code += '/RV+';
    if (tPlus) code += '/T+';
    peradsCode = code;
    if (location === '0') {
      peradsTitle = 'PE-RADS 0'; peradsTone = 'emerald'; peradsFindings = p.cat0Text;
    } else if (location === '1') {
      peradsTitle = p.cat1Title; peradsTone = 'amber'; peradsFindings = p.cat1Text; peradsMgmt = p.cat1Mgmt; peradsInv = p.cat1Inv;
    } else if (location === '2') {
      peradsTitle = p.cat2Title; peradsTone = 'amber'; peradsFindings = p.cat2Text + (rvPlus ? ' ' + p.cat2RvText : ''); peradsMgmt = p.cat2Mgmt; peradsInv = rvPlus ? p.cat2RvInv : '';
    } else if (location === '3') {
      peradsTitle = p.cat3Title; peradsTone = 'red'; peradsFindings = p.cat3Text + (rvPlus ? ' ' + p.cat3RvText : ''); peradsMgmt = p.cat3Mgmt; peradsInv = rvPlus ? p.cat3RvInv : '';
    } else if (location === '4') {
      peradsTitle = p.cat4Title; peradsTone = 'red'; peradsFindings = p.cat4Text + (rvPlus ? ' ' + p.cat4RvText : ''); peradsMgmt = p.cat4Mgmt; peradsInv = p.cat4RvInv;
    }
  }
  const peradsToneClass = peradsTone === 'red' ? 'text-red-500' : peradsTone === 'amber' ? 'text-amber-500' : peradsTone === 'emerald' ? 'text-emerald-500' : 'text-slate-500';

  const handleCopyPerads = () => {
    const lines = [p.reportTitle, `${p.categoryLabel}: ${peradsCode}`, peradsFindings];
    if (peradsMgmt) lines.push(`${p.managementTitle}: ${peradsMgmt}`);
    if (peradsInv) lines.push(`${p.investigationsTitle}: ${peradsInv}`);
    if (exception) lines.push(p.modifierEText);
    if (tPlus) lines.push(p.modifierTText);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetPerads = () => { setQuality('optimal'); setLocation(null); setException(false); setRvPlus(false); setTPlus(false); };

  const [qMode, setQMode] = useState('manual'); // 'manual' | 'segments'
  const [qScore, setQScore] = useState('');
  const [segGrades, setSegGrades] = useState(() => Object.fromEntries(PE_QANADLI_ALL_IDS.map(id => [id, 0])));
  const [rvMethod, setRvMethod] = useState('axial');
  const [rv, setRv] = useState('');
  const [lv, setLv] = useState('');

  const setSegGrade = (id, grade) => setSegGrades(prev => ({ ...prev, [id]: grade }));
  const resetSegments = () => setSegGrades(Object.fromEntries(PE_QANADLI_ALL_IDS.map(id => [id, 0])));
  const segTotal = Object.values(segGrades).reduce((a, b) => a + b, 0);

  const qVal = qMode === 'segments' ? segTotal : parseFloat(qScore);
  const hasQ = qMode === 'segments' ? true : (qScore !== '' && !isNaN(qVal));
  const qScoreDisplay = qMode === 'segments' ? String(segTotal) : qScore;
  const qPercent = hasQ ? Math.min(100, Math.max(0, (qVal / 40) * 100)) : 0;
  let qCat = '', qColor = '';
  if (hasQ) {
    if (qPercent < 25) { qCat = c.qanadliMild; qColor = 'text-emerald-500'; }
    else if (qPercent <= 50) { qCat = c.qanadliModerate; qColor = 'text-amber-500'; }
    else { qCat = c.qanadliSevere; qColor = 'text-red-500'; }
  }

  const rvVal = parseFloat(rv);
  const lvVal = parseFloat(lv);
  const hasRv = rv !== '' && lv !== '' && !isNaN(rvVal) && !isNaN(lvVal) && lvVal !== 0;
  const rvRatio = hasRv ? rvVal / lvVal : 0;
  const rvThreshold = rvMethod === 'axial' ? 1.0 : 0.9;
  const rvStrain = hasRv && rvRatio > rvThreshold;

  const handleCopy = () => {
    const text = c.reportText(
      hasQ ? qScoreDisplay : '—', hasQ ? qPercent.toFixed(0) : '—', hasQ ? qCat : t.common.notEvaluated,
      hasRv ? rvRatio.toFixed(2) : '—', hasRv ? (rvStrain ? c.rvStrainPositive : c.rvStrainNegative) : t.common.notEvaluated
    );
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => {
    setQMode('manual'); setQScore(''); resetSegments(); setRvMethod('axial'); setRv(''); setLv('');
  };

  const renderSegmentRow = (id) => {
    const grade = segGrades[id] ?? 0;
    const gradeTitle = grade === 0 ? c.qanadliGrade0 : grade === 1 ? c.qanadliGrade1 : c.qanadliGrade2;
    return (
      <div key={id} className="flex items-center justify-between gap-2 py-1.5">
        <span className="text-xs text-slate-600 dark:text-slate-400" title={gradeTitle}>{c.qanadliSegmentLabels[id]}</span>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg shrink-0">
          {[0, 1, 2].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setSegGrade(id, g)}
              title={g === 0 ? c.qanadliGrade0 : g === 1 ? c.qanadliGrade1 : c.qanadliGrade2}
              className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${grade === g ? (g === 0 ? 'bg-emerald-500 text-white shadow-sm' : g === 1 ? 'bg-amber-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm') : 'text-slate-400 dark:text-slate-500'}`}
            >{g}</button>
          ))}
        </div>
      </div>
    );
  };

  const showResult = mode === 'perads' ? showPerads : (hasQ || hasRv);

  return (
    <div className={`space-y-4 animate-in fade-in ${showResult ? 'pb-56' : ''}`}>
      <Card>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button onClick={() => setMode('perads')} className={`flex-1 px-3 py-1.5 rounded-md text-xs ${mode === 'perads' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : 'text-slate-500'}`}>{c.modePerads}</button>
          <button onClick={() => setMode('quant')} className={`flex-1 px-3 py-1.5 rounded-md text-xs ${mode === 'quant' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : 'text-slate-500'}`}>{c.modeQuant}</button>
        </div>
      </Card>

      {mode === 'perads' && (
        <>
          <Card className="space-y-4">
            <OptionList
              label={p.qualityLabel}
              options={[
                { key: 'optimal', label: p.qualityOptimal },
                { key: 'limited', label: p.qualityLimited },
                { key: 'nondiagnostic', label: p.qualityNondiagnostic },
              ]}
              value={quality}
              onChange={(v) => { setQuality(v); if (v === 'nondiagnostic') setLocation(null); }}
            />
            {quality !== 'nondiagnostic' && (
              <OptionList
                label={p.locationLabel}
                options={[
                  { key: '0', label: p.loc0 },
                  { key: '1', label: p.loc1 },
                  { key: '2', label: p.loc2 },
                  { key: '3', label: p.loc3 },
                  { key: '4', label: p.loc4 },
                ]}
                value={location}
                onChange={setLocation}
              />
            )}
          </Card>
          {(quality === 'nondiagnostic' || location !== null) && (
            <Card className="space-y-4">
              <YesNo label={p.exceptionLabel} value={exception} onChange={setException} yesLabel={t.common.yes} noLabel={t.common.no} />
              {quality !== 'nondiagnostic' && location !== null && location !== '0' && (
                <>
                  <YesNo label={p.rvLabel} value={rvPlus} onChange={setRvPlus} yesLabel={t.common.yes} noLabel={t.common.no} />
                  <YesNo label={p.thrombusLabel} value={tPlus} onChange={setTPlus} yesLabel={t.common.yes} noLabel={t.common.no} />
                </>
              )}
            </Card>
          )}
          {showPerads && (
            <Card className="text-center">
              <span className="text-xs text-slate-500 block mb-1">{p.categoryLabel}</span>
              <span className={`text-2xl font-black ${peradsToneClass}`}>{peradsCode}</span>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{peradsFindings}</p>
              {peradsMgmt && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug"><strong>{p.managementTitle}:</strong> {peradsMgmt}</p>}
              {peradsInv && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug"><strong>{p.investigationsTitle}:</strong> {peradsInv}</p>}
              {exception && <InfoBox tone="amber">{p.modifierEText}</InfoBox>}
              {tPlus && <InfoBox tone="red">{p.modifierTText}</InfoBox>}
            </Card>
          )}
        </>
      )}

      {mode === 'quant' && (
      <>
      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm">{c.qanadliSectionTitle}</h3>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg mb-3">
          <button onClick={() => setQMode('manual')} className={`flex-1 px-3 py-1.5 rounded-md text-xs ${qMode === 'manual' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : 'text-slate-500'}`}>{c.qanadliModeManual}</button>
          <button onClick={() => setQMode('segments')} className={`flex-1 px-3 py-1.5 rounded-md text-xs ${qMode === 'segments' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : 'text-slate-500'}`}>{c.qanadliModeSegments}</button>
        </div>
        {qMode === 'manual' ? (
          <NumberField label={c.qanadliScoreLabel} placeholder="Ej: 18" value={qScore} onChange={setQScore} />
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{c.qanadliSegmentHint}</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>{c.qanadliGrade0}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>{c.qanadliGrade1}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>{c.qanadliGrade2}</span>
            </div>
            {PE_QANADLI_LUNGS.map(lung => {
              const lungTotal = lung.groups.flatMap(g => g.ids).reduce((s, id) => s + (segGrades[id] || 0), 0);
              return (
                <Accordion key={lung.key} title={`${c[lung.nameKey]} (${lungTotal}/20)`}>
                  <div className="space-y-3">
                    {lung.groups.map(group => (
                      <div key={group.labelKey + lung.key}>
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{c[group.labelKey]}</span>
                        <div className="mt-1 divide-y divide-slate-100 dark:divide-slate-700">
                          {group.ids.map(id => renderSegmentRow(id))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Accordion>
              );
            })}
            <button type="button" onClick={resetSegments} className="text-xs text-slate-400 hover:text-red-500 transition-colors underline">{c.qanadliResetLabel}</button>
          </div>
        )}
        <Accordion title={c.qanadliHowTitle}>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{c.qanadliHow}</p>
        </Accordion>
      </Card>
      {hasQ && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.qanadliPercent}</span>
          <span className={`text-3xl font-black ${qColor}`}>{qPercent.toFixed(0)}% <span className="text-base font-semibold">({qScoreDisplay}/40)</span></span>
          <p className={`text-sm font-semibold mt-1 ${qColor}`}>{qCat}</p>
        </Card>
      )}
      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm">{c.rvSectionTitle}</h3>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg mb-3">
          <button onClick={() => setRvMethod('axial')} className={`flex-1 px-3 py-1.5 rounded-md text-xs ${rvMethod === 'axial' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : 'text-slate-500'}`}>{c.rvMethodAxial}</button>
          <button onClick={() => setRvMethod('fourChamber')} className={`flex-1 px-3 py-1.5 rounded-md text-xs ${rvMethod === 'fourChamber' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-slate-900 dark:text-white' : 'text-slate-500'}`}>{c.rvMethodFourChamber}</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField small label={c.rvLabel} value={rv} onChange={setRv} />
          <NumberField small label={c.lvLabel} value={lv} onChange={setLv} />
        </div>
      </Card>
      {hasRv && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.rvRatio}</span>
          <span className={`text-3xl font-black flex items-center justify-center gap-2 ${rvStrain ? 'text-red-500' : 'text-emerald-500'}`}>
            {rvStrain ? <IconAlertTriangle size={22} /> : <IconCheckCircle size={22} />}
            {rvRatio.toFixed(2)}
          </span>
          <p className={`text-sm font-semibold mt-1 ${rvStrain ? 'text-red-500' : 'text-emerald-500'}`}>{rvStrain ? c.rvStrainPositive : c.rvStrainNegative}</p>
        </Card>
      )}
      </>
      )}

      <InfoBox tone="slate">{p.disclaimerNote}</InfoBox>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.peQanadli} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {mode === 'perads' && showPerads && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{p.categoryLabel}</span>
            <span className={`text-3xl font-black block leading-tight ${peradsToneClass}`}>{peradsCode}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetPerads} label={t.common.reset} />
            <CopyIconButton onClick={handleCopyPerads} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
      {mode === 'quant' && (hasQ || hasRv) && (
        <StickyBar>
          <div className="min-w-0 text-center flex items-center justify-center gap-6">
            {hasQ && (
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.qanadliPercent}</span>
                <span className={`text-3xl font-black ${qColor}`}>{qPercent.toFixed(0)}%</span>
              </div>
            )}
            {hasRv && (
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.rvRatio}</span>
                <span className={`text-3xl font-black ${rvStrain ? 'text-red-500' : 'text-emerald-500'}`}>{rvRatio.toFixed(2)}</span>
              </div>
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

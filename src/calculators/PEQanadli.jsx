import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconAlertTriangle, IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, Accordion, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

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

  return (
    <div className={`space-y-4 animate-in fade-in ${(hasQ || hasRv) ? 'pb-24' : ''}`}>
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
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.peQanadli} />
      <ReportBugLink calcTitle={c.title} />
      {(hasQ || hasRv) && (
        <StickyBar>
          <div className="min-w-0 text-left flex items-center gap-3">
            {hasQ && (
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{c.qanadliPercent}</span>
                <span className={`text-lg font-black ${qColor}`}>{qPercent.toFixed(0)}%</span>
              </div>
            )}
            {hasRv && (
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{c.rvRatio}</span>
                <span className={`text-lg font-black ${rvStrain ? 'text-red-500' : 'text-emerald-500'}`}>{rvRatio.toFixed(2)}</span>
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

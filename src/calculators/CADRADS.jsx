import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';
import { pFromCac, pFromSis } from './logic/cadradsP.js';
import { cacPercentile, cacSource, groupsFor, DEFAULT_GROUP } from './logic/cacPercentile.js';

export default function CADRADS() {
  const { t, lang } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.cadrads;
  const [stenosis, setStenosis] = useState(null);
  const [mods, setMods] = useState({ N: false, S: false, G: false, I: false, HRP: false, E: false });
  const [pMethod, setPMethod] = useState('cac');
  const [cac, setCac] = useState('');
  const [sis, setSis] = useState('');
  const [pVisual, setPVisual] = useState('');
  // Percentil del CAC (opcional): edad, sexo y grupo poblacional.
  const [pctAge, setPctAge] = useState('');
  const [pctSex, setPctSex] = useState('');
  // Grupo elegido por fuente: el defecto (blanco 30-44, hispano ≥ 45) se aplica en cada una.
  const [pctGroup, setPctGroup] = useState({ javaid: '', mesa: '' });

  const toggleMod = (key) => setMods(prev => ({ ...prev, [key]: !prev[key] }));
  // Modificador P (CAD-RADS 2.0, tabla 2): por CAC, SIS o evaluación visual.
  const pRaw = pMethod === 'cac' ? (cac === '' ? null : pFromCac(parseFloat(cac)))
    : pMethod === 'sis' ? (sis === '' ? null : pFromSis(Number(sis)))
    : pMethod === 'visual' ? (pVisual || null) : null;
  const pValid = /^P[1-4]$/.test(pRaw || '');
  // CAD-RADS 0 = sin placa: P no se informa.
  const pMod = pValid && stenosis !== '0' ? pRaw : '';
  const pDetail = pMethod === 'cac' ? c.reportPDetail.cac(cac) : pMethod === 'sis' ? c.reportPDetail.sis(sis) : c.reportPDetail.visual();
  const modString = [...Object.entries(mods).filter(([,v]) => v).map(([k]) => k), ...(pMod ? [pMod] : [])].join('/');
  const ageNum = pctAge === '' ? null : Number(pctAge);
  const pctSource = Number.isInteger(ageNum) ? cacSource(ageNum) : null;
  const pctGroups = groupsFor(pctSource);
  const pctGroupEff = pctSource ? (pctGroup[pctSource] || DEFAULT_GROUP[pctSource]) : '';
  const pct = pMethod === 'cac' && cac !== '' && pctSource && pctSex
    ? cacPercentile({ age: ageNum, sex: pctSex, group: pctGroupEff, cac: parseFloat(cac) }) : null;
  const pctText = pct ? c.pct.result(pct, ageNum, pctSex, cac) : '';
  const resultString = stenosis ? `CAD-RADS ${stenosis}${modString ? '/' + modString : ''}` : '';

  const getReportText = () => {
    if (!stenosis) return '';
    const lines = [c.reportText(stenosis, modString)];
    if (pMod) lines.push(c.reportP(pMod, c.pLevel[pMod], pDetail));
    // CAD-RADS 0 (sin placa) con CAC > 0 es contradictorio: la UI ya lo advierte y el informe omite el percentil.
    if (pctText && !(stenosis === '0' && pct && !pct.zero)) lines.push(pctText);
    return lines.join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const riskColor = !stenosis ? '' : ['0','1'].includes(stenosis) ? 'text-emerald-500' : ['2','3'].includes(stenosis) ? 'text-amber-500' : stenosis === 'N' ? 'text-slate-500 dark:text-slate-400' : 'text-red-500';
  const resetAll = () => { setStenosis(null); setMods({ N: false, S: false, G: false, I: false, HRP: false, E: false }); setPMethod('cac'); setCac(''); setSis(''); setPVisual(''); setPctAge(''); setPctSex(''); setPctGroup({ javaid: '', mesa: '' }); };

  return (
    <div className={`space-y-4 animate-in fade-in ${stenosis ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.stenosisLabel}</label>
        <div className="space-y-2">
          {c.stenosisOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setStenosis(opt.key)}
              aria-pressed={!!(stenosis === opt.key)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-center ${stenosis === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              <span>{opt.label}</span>
              <span className="text-xs font-bold shrink-0 ml-2">{opt.key}</span>
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.modifiersLabel}</label>
        <div className="grid grid-cols-2 gap-2">
          {[['N', c.modN],['S', c.modS],['G', c.modG],['I', c.modI],['HRP', c.modHrp],['E', c.modE]].map(([key, label]) => (
            <button key={key} onClick={() => toggleMod(key)} aria-pressed={!!(mods[key])} className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-1.5 ${mods[key] ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {mods[key] ? <IconCheckCircle size={14} /> : <span className="w-3.5" />} {label}
            </button>
          ))}
        </div>
        {mods.HRP && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.modHrpHint}</p>}
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.pModifierLabel}</label>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={c.pMethodLabel}>
          {['none', 'cac', 'sis', 'visual'].map((k) => (
            <button key={k} type="button" onClick={() => setPMethod(k)} aria-pressed={pMethod === k} className={`p-2.5 rounded-lg border text-xs transition-all ${pMethod === k ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.pMethods[k]}</button>
          ))}
        </div>
        {pMethod === 'cac' && (
          <div className="mt-3">
            <NumberField label={c.cacLabel} value={cac} onChange={setCac} />
            <ul className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug space-y-0.5">{c.pRanges.cac.map((r) => <li key={r}>{r}</li>)}</ul>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2.5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.pct.title}</p>
              <NumberField label={c.pct.ageLabel} value={pctAge} onChange={setPctAge} small />
              {pctAge !== '' && !pctSource && <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-snug">{c.pct.ageOut}</p>}
              <div className="grid grid-cols-2 gap-2" role="group" aria-label={c.pct.sexLabel}>
                {['female', 'male'].map((k) => (
                  <button key={k} type="button" onClick={() => setPctSex(k)} aria-pressed={pctSex === k} className={`p-2.5 rounded-lg border text-xs transition-all ${pctSex === k ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.pct.sex[k]}</button>
                ))}
              </div>
              {pctSource && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{c.pct.groupLabel} ({c.pct.sourceName[pctSource]})</p>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label={c.pct.groupLabel}>
                    {pctGroups.map((k) => (
                      <button key={k} type="button" onClick={() => setPctGroup((prev) => ({ ...prev, [pctSource]: k }))} aria-pressed={pctGroupEff === k} className={`p-2.5 rounded-lg border text-xs transition-all ${pctGroupEff === k ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.pct.group[k]}</button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">{c.pct.groupHint[pctSource]}</p>
                </div>
              )}
              {pctText && <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{pctText}</p>}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{c.pct.caveat}</p>
            </div>
          </div>
        )}
        {pMethod === 'sis' && (
          <div className="mt-3">
            <NumberField label={c.sisLabel} value={sis} onChange={setSis} />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.sisHint}</p>
            <ul className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug space-y-0.5">{c.pRanges.sis.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        )}
        {pMethod === 'visual' && (
          <div className="space-y-2 mt-3">
            {c.pVisualOptions.map(opt => (
              <button key={opt.key} type="button" onClick={() => setPVisual(opt.key)} aria-pressed={pVisual === opt.key} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${pVisual === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
            ))}
          </div>
        )}
        {pValid && stenosis !== '0' && <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mt-3">{pRaw} ({c.pLevel[pRaw]})</p>}
        {pValid && stenosis === '0' && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 leading-snug">{c.pNotForZero}</p>}
        {pRaw === 'zero' && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 leading-snug">{c.pZero}</p>}
        {pRaw === 'boundary' && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 leading-snug">{c.pBoundary}</p>}
        {pMethod === 'sis' && sis !== '' && pRaw === null && <p className="text-[11px] text-red-500 mt-2 leading-snug">{c.pSisInvalid}</p>}
        {pMethod !== 'none' && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.pCaveat}</p>}
      </Card>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.cadrads} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {stenosis && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className={`text-3xl font-black block mt-1 leading-tight ${riskColor}`}>{resultString}</span>
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

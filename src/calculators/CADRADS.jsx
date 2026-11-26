import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';
import { pFromCac, pFromSis } from './logic/cadradsP.js';
import { cadradsCode } from './logic/cadradsCode.js';
import { useCacPercentile } from '../components/shared/CacPercentile.jsx';

export default function CADRADS() {
  const { t, lang } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.cadrads;
  const [stenosis, setStenosis] = useState(null);
  const [mods, setMods] = useState({ N: false, HRP: false, S: false, G: false, E: false });
  const [ischemia, setIschemia] = useState('');
  const [pMethod, setPMethod] = useState('cac');
  const [cac, setCac] = useState('');
  const [sis, setSis] = useState('');
  const [pVisual, setPVisual] = useState('');
  const pct = useCacPercentile(cac, pMethod === 'cac');

  const toggleMod = (key) => setMods(prev => ({ ...prev, [key]: !prev[key] }));
  // Modificador P (CAD-RADS 2.0, tabla 2): por CAC, SIS o evaluación visual.
  const cacNum = cac === '' ? NaN : parseFloat(cac);
  const pRaw = pMethod === 'cac' ? (cac === '' ? null : pFromCac(cacNum))
    : pMethod === 'sis' ? (sis === '' ? null : pFromSis(Number(sis)))
    : pMethod === 'visual' ? (pVisual || null) : null;
  const pValid = /^P[1-4]$/.test(pRaw || '');
  // CAD-RADS 0 = sin placa: P no se informa.
  const pMod = pValid && stenosis !== '0' ? pRaw : '';
  const pDetail = pMethod === 'cac' ? c.reportPDetail.cac() : pMethod === 'sis' ? c.reportPDetail.sis(sis) : c.reportPDetail.visual();
  const code = cadradsCode(stenosis, { p: pMod, mods, ischemia });
  const resultString = stenosis ? `CAD-RADS ${code}` : '';
  // CAD-RADS 0 (sin placa) con CAC > 0 es contradictorio: la UI lo advierte y el informe omite el CAC.
  const cacReportable = pMethod === 'cac' && Number.isFinite(cacNum) && cacNum >= 0 && !(stenosis === '0' && cacNum > 0);

  const getReportText = () => {
    if (!stenosis) return '';
    const lines = [c.reportText(code)];
    if (pMod) lines.push(c.reportP(pMod, c.pLevel[pMod], pDetail));
    if (cacReportable) {
      lines.push(c.reportCac(cac));
      if (pct.text) lines.push(pct.text);
    }
    return lines.join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const riskColor = !stenosis ? '' : ['0','1'].includes(stenosis) ? 'text-emerald-500' : ['2','3'].includes(stenosis) ? 'text-amber-500' : stenosis === 'N' ? 'text-slate-500 dark:text-slate-400' : 'text-red-500';
  const resetAll = () => { setStenosis(null); setMods({ N: false, HRP: false, S: false, G: false, E: false }); setIschemia(''); setPMethod('cac'); setCac(''); setSis(''); setPVisual(''); pct.reset(); };

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
          {[['N', c.modN], ['HRP', c.modHrp], ['S', c.modS], ['G', c.modG], ['E', c.modE]].map(([key, label]) => (
            <button key={key} onClick={() => toggleMod(key)} aria-pressed={!!(mods[key])} className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-1.5 ${mods[key] ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {mods[key] ? <IconCheckCircle size={14} /> : <span className="w-3.5" />} {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 mb-1">{c.modILabel}</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={c.modILabel}>
          {c.modIOptions.map((o) => (
            <button key={o.key} type="button" onClick={() => setIschemia(o.key)} aria-pressed={ischemia === o.key} className={`text-left p-2.5 rounded-lg border text-xs transition-all ${ischemia === o.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{o.label}</button>
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
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">{pct.fields}</div>
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

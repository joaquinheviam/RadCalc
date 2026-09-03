import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

export default function CADRADS() {
  const { t, lang } = useLang();
  const c = t.calc.cadrads;
  const [stenosis, setStenosis] = useState(null);
  const [mods, setMods] = useState({ N: false, S: false, G: false, I: false, HRP: false, E: false });
  const [pMod, setPMod] = useState('');

  const toggleMod = (key) => setMods(prev => ({ ...prev, [key]: !prev[key] }));
  const modString = [...Object.entries(mods).filter(([,v]) => v).map(([k]) => k), ...(pMod ? [pMod] : [])].join('/');
  const resultString = stenosis ? `CAD-RADS ${stenosis}${modString ? '/' + modString : ''}` : '';

  const handleCopy = () => {
    if (!stenosis) return;
    const text = c.reportText(stenosis, modString);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const riskColor = !stenosis ? '' : ['0','1'].includes(stenosis) ? 'text-emerald-500' : ['2','3'].includes(stenosis) ? 'text-amber-500' : stenosis === 'N' ? 'text-slate-400' : 'text-red-500';
  const resetAll = () => { setStenosis(null); setMods({ N: false, S: false, G: false, I: false, HRP: false, E: false }); setPMod(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${stenosis ? 'pb-24' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.stenosisLabel}</label>
        <div className="space-y-2">
          {c.stenosisOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setStenosis(opt.key)}
              className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-center ${stenosis === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
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
            <button key={key} onClick={() => toggleMod(key)} className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-1.5 ${mods[key] ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {mods[key] ? <IconCheckCircle size={14} /> : <span className="w-3.5" />} {label}
            </button>
          ))}
        </div>
        {mods.HRP && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.modHrpHint}</p>}
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.pModifierLabel}</label>
        <div className="space-y-2">
          <button onClick={() => setPMod('')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${pMod === '' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.pNone}</button>
          {c.pOptions.map(opt => (
            <button key={opt.key} onClick={() => setPMod(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${pMod === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
          ))}
        </div>
        {pMod && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.pCaveat}</p>}
      </Card>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.cadrads} />
      <ReportBugLink calcTitle={c.title} />
      {stenosis && (
        <StickyBar>
          <div className="min-w-0 text-left">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className={`text-xl font-black ${riskColor}`}>{resultString}</span>
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

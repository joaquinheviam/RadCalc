import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

function liradsTrCatColor(key) {
  if (key === 'viable') return 'text-red-500';
  if (key === 'equivocal') return 'text-amber-500';
  if (key === 'nonprogressing') return 'text-sky-500';
  if (key === 'nonviable') return 'text-emerald-500';
  return 'text-slate-400';
}

function liradsTrCatBorder(key, active) {
  if (!active) return 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400';
  if (key === 'viable') return 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300';
  if (key === 'equivocal') return 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300';
  if (key === 'nonprogressing') return 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300';
  if (key === 'nonviable') return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  return 'border-slate-500 bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300';
}

export default function LIRADSTreatmentResponse() {
  const { t, lang } = useLang();
  const c = t.calc.liradsTr;
  const [core, setCore] = useState(null); // 'nonradiation' | 'radiation'
  const [category, setCategory] = useState(null);
  const [afDiffusion, setAfDiffusion] = useState(false);
  const [afT2, setAfT2] = useState(false);

  const cats = core ? c.categoriesData[core] : [];
  const middleKey = core === 'nonradiation' ? 'equivocal' : (core === 'radiation' ? 'nonprogressing' : null);
  const showAfStep = category && category === middleKey;
  const afApplied = showAfStep && (afDiffusion || afT2);
  const finalCategoryKey = afApplied ? 'viable' : category;
  const finalCatObj = cats.find(x => x.key === finalCategoryKey);
  const selectedCatObj = cats.find(x => x.key === category);

  const handleCoreChange = (val) => { setCore(val); setCategory(null); setAfDiffusion(false); setAfT2(false); };
  const handleCategoryChange = (key) => { setCategory(key); setAfDiffusion(false); setAfT2(false); };

  const handleCopy = () => {
    if (!finalCatObj) return;
    const coreLabel = core === 'nonradiation' ? c.coreNonradiation : c.coreRadiation;
    const afNote = afApplied ? c.afUpgradedNote(selectedCatObj.label) : '';
    const text = c.reportText(coreLabel, finalCatObj.label, afNote);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setCore(null); setCategory(null); setAfDiffusion(false); setAfT2(false); };

  return (
    <div className={`space-y-4 animate-in fade-in ${finalCatObj ? 'pb-24' : ''}`}>
      <InfoBox tone="amber">{c.applicability}</InfoBox>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.coreLabel}</label>
        <div className="space-y-2">
          <button onClick={() => handleCoreChange('nonradiation')} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${core === 'nonradiation' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
            <span className="font-semibold block mb-0.5">{c.coreNonradiation}</span>
            <span className="text-xs opacity-80">{c.coreNonradiationDesc}</span>
          </button>
          <button onClick={() => handleCoreChange('radiation')} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${core === 'radiation' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
            <span className="font-semibold block mb-0.5">{c.coreRadiation}</span>
            <span className="text-xs opacity-80">{c.coreRadiationDesc}</span>
          </button>
        </div>
      </Card>
      {core && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.categoryLabel}</label>
          <div className="space-y-2">
            {cats.map(cat => (
              <button key={cat.key} onClick={() => handleCategoryChange(cat.key)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${liradsTrCatBorder(cat.key, category === cat.key)}`}>
                <span className="font-semibold block mb-1">LR-TR {cat.label}</span>
                <span className="text-xs opacity-90 block mb-1"><strong>{c.conceptualLabel}</strong> {cat.conceptual}</span>
                <span className="text-xs opacity-90 block"><strong>{c.criterionLabel}</strong> {cat.criterion}</span>
                {cat.examples && <span className="text-[11px] opacity-75 block mt-1"><strong>{c.examplesLabel}</strong> {cat.examples}</span>}
                {cat.onlyApplies && <span className="text-[11px] opacity-75 block mt-1"><strong>{c.onlyAppliesLabel}</strong> {cat.onlyApplies}</span>}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">{c.featureNote}</p>
        </Card>
      )}
      {showAfStep && (
        <Card className="space-y-3">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{c.afStepTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.afStepIntro[middleKey]}</p>
          </div>
          <div className="space-y-2">
            <button onClick={() => setAfDiffusion(v => !v)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${afDiffusion ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {afDiffusion ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.afDiffusion}
            </button>
            <button onClick={() => setAfT2(v => !v)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${afT2 ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {afT2 ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.afT2}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{c.afMriOnlyNote}</p>
        </Card>
      )}
      {finalCatObj && afApplied && (
        <InfoBox tone="amber">{c.afUpgradedNote(selectedCatObj.label)}</InfoBox>
      )}
      {finalCatObj && (
        <InfoBox tone="emerald"><strong>{c.managementLabel}</strong> {c.management[finalCatObj.key]}</InfoBox>
      )}
      {core && <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{c.tiebreakNote}</p>}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.liradsTr} />
      <ReportBugLink calcTitle={c.title} />
      {finalCatObj && (
        <StickyBar>
          <div className="min-w-0 text-left">
            <span className={`text-xl font-black ${liradsTrCatColor(finalCatObj.key)}`}>LR-TR {finalCatObj.label}</span>
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

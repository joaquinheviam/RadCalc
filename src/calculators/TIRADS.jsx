import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconInfo } from '../components/icons/index.js';
import { StickyBar, ResetIconButton, CopyIconButton, Accordion, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const TIRADS_POINTS = {
  composition: [0, 0, 1, 2],
  echogenicity: [0, 1, 2, 3],
  shape: [0, 3],
  margin: [0, 0, 2, 3],
  echogenicFoci: [0, 1, 2, 3],
};

export default function TIRADS() {
  const { t, lang } = useLang();
  const c = t.calc.tirads;
  const [selections, setSelections] = useState({
    composition: null, echogenicity: null, shape: null, margin: null, echogenicFoci: [],
  });

  const toggleSelection = (category, index, multi = false) => {
    setSelections(prev => {
      if (multi) {
        const current = prev[category];
        return {
          ...prev,
          [category]: current.includes(index) ? current.filter(i => i !== index) : [...current, index],
        };
      }
      return { ...prev, [category]: index };
    });
  };

  const calculatePoints = () => {
    let pts = 0;
    ['composition', 'echogenicity', 'shape', 'margin'].forEach(cat => {
      if (selections[cat] !== null) pts += TIRADS_POINTS[cat][selections[cat]];
    });
    selections.echogenicFoci.forEach(i => { pts += TIRADS_POINTS.echogenicFoci[i]; });
    return pts;
  };
  const pts = calculatePoints();

  let catKey = '', color = '';
  if (pts === 0) { catKey = 'TR1'; color = 'text-emerald-500'; }
  else if (pts <= 2) { catKey = 'TR2'; color = 'text-emerald-500'; }
  else if (pts === 3) { catKey = 'TR3'; color = 'text-amber-500'; }
  else if (pts <= 6) { catKey = 'TR4'; color = 'text-orange-500'; }
  else { catKey = 'TR5'; color = 'text-red-500'; }
  const catInfo = c.categories[catKey];

  const handleCopy = () => {
    const critEs = c.criteria;
    const label = (cat) => selections[cat] !== null ? critEs[cat].options[selections[cat]] : t.common.notEvaluated;
    const foci = selections.echogenicFoci.length
      ? selections.echogenicFoci.map(i => critEs.echogenicFoci.options[i]).join(', ')
      : t.common.none;
    const text = c.reportText(
      label('composition'), label('echogenicity'), label('shape'), label('margin'), foci,
      pts, catKey, catInfo.risk, catInfo.recs
    );
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => {
    setSelections({ composition: null, echogenicity: null, shape: null, margin: null, echogenicFoci: [] });
  };

  return (
    <div className="space-y-4 pb-56">
      {Object.entries(c.criteria).map(([key, data]) => (
        <div key={key} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 text-sm">{data.title}</h3>
          {data.hint && <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 leading-snug">{data.hint}</p>}
          <div className="space-y-2">
            {data.options.map((label, i) => {
              const multi = key === 'echogenicFoci';
              const isSelected = multi ? selections[key].includes(i) : selections[key] === i;
              return (
                <button
                  key={i}
                  onClick={() => toggleSelection(key, i, multi)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span>{label}</span>
                    <span className="text-xs font-medium bg-white dark:bg-slate-900 px-2 py-1 rounded-md opacity-70 shrink-0">+{TIRADS_POINTS[key][i]} {c.points}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Accordion icon={<IconInfo size={16} />} title={c.managementTable}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-700">
                {c.managementHeaders.map((h, i) => <th key={i} className="pb-2 pr-2 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {c.managementRows.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                  {row.map((cell, j) => <td key={j} className="py-1.5 pr-2 text-slate-600 dark:text-slate-300">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Accordion>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.tirads} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      <StickyBar>
        <div className="min-w-0 text-center">
          <span className="block text-sm text-slate-500 dark:text-slate-400 mb-0.5">{c.totalScore}: {pts}</span>
          <div className="flex items-center justify-center gap-2">
            <span className={`font-black text-4xl ${color}`}>{catKey}</span>
            <span className="text-base font-medium text-slate-600 dark:text-slate-300">{catInfo.risk}</span>
          </div>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{catInfo.recs}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ResetIconButton onClick={resetAll} label={t.common.reset} />
          <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
        </div>
      </StickyBar>
    </div>
  );
}

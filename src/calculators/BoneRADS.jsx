import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const FIELDS = ['margin', 'periosteal', 'endosteal', 'fracture', 'softTissue', 'priorCancer'];

export default function BoneRADS() {
  const { t } = useLang();
  const c = t.calc.boneRads;
  const [margin, setMargin] = useState(null);
  const [periosteal, setPeriosteal] = useState(null);
  const [endosteal, setEndosteal] = useState(null);
  const [fracture, setFracture] = useState(null);
  const [softTissue, setSoftTissue] = useState(null);
  const [priorCancer, setPriorCancer] = useState(null);
  const [notEvaluable, setNotEvaluable] = useState(false);

  const setters = { margin: setMargin, periosteal: setPeriosteal, endosteal: setEndosteal };
  const values = { margin, periosteal, endosteal };

  const boolFields = [
    ['fracture', fracture, setFracture, c.fractureLabel],
    ['softTissue', softTissue, setSoftTissue, c.softTissueLabel],
    ['priorCancer', priorCancer, setPriorCancer, c.priorCancerLabel],
  ];

  const allAnswered = margin && periosteal && endosteal && fracture !== null && softTissue !== null && priorCancer !== null;

  const pointTotal = allAnswered
    ? margin.points + periosteal.points + endosteal.points + (fracture ? 2 : 0) + (softTissue ? 4 : 0) + (priorCancer ? 2 : 0)
    : null;

  let categoryKey = null;
  if (notEvaluable) categoryKey = 0;
  else if (pointTotal !== null) {
    if (pointTotal >= 7) categoryKey = 4;
    else if (pointTotal >= 5) categoryKey = 3;
    else if (pointTotal >= 3) categoryKey = 2;
    else categoryKey = 1;
  }

  const category = categoryKey !== null ? c.categories[categoryKey] : null;

  const colorFor = (key) => ({
    0: 'text-slate-400',
    1: 'text-emerald-500',
    2: 'text-amber-500',
    3: 'text-orange-500',
    4: 'text-red-500',
  })[key];

  const resetAll = () => {
    setMargin(null); setPeriosteal(null); setEndosteal(null);
    setFracture(null); setSoftTissue(null); setPriorCancer(null);
    setNotEvaluable(false);
  };

  const handleCopy = () => {
    if (!category) return;
    copyToClipboard(c.reportText(category.title, notEvaluable ? null : pointTotal), t.common.copiedOk, t.common.copiedErr);
  };

  const OptionGroup = ({ label, options, value, onChange }) => (
    <Card>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt)}
            disabled={notEvaluable}
            className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${notEvaluable ? 'opacity-40 cursor-not-allowed' : ''} ${value?.key === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{opt.label}</span>
              <span className="text-xs font-bold shrink-0 ml-2">{opt.points} pt</span>
            </div>
            <p className="text-xs mt-0.5 opacity-80 leading-snug">{opt.caption}</p>
          </button>
        ))}
      </div>
    </Card>
  );

  const BoolGroup = ({ label, value, onChange }) => (
    <Card>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {[[false, c.noLabel], [true, c.yesLabel]].map(([v, lbl]) => (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            disabled={notEvaluable}
            className={`p-2.5 rounded-lg border text-sm transition-all flex items-center justify-center gap-1.5 ${notEvaluable ? 'opacity-40 cursor-not-allowed' : ''} ${value === v ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            {value === v ? <IconCheckCircle size={14} /> : <span className="w-3.5" />} {lbl}
          </button>
        ))}
      </div>
    </Card>
  );

  return (
    <div className={`space-y-4 animate-in fade-in ${category ? 'pb-56' : ''}`}>
      <Card>
        <button
          onClick={() => setNotEvaluable((v) => !v)}
          className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${notEvaluable ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
        >
          {notEvaluable ? <IconCheckCircle size={16} /> : <span className="w-4" />}
          <span className="font-semibold">{c.notEvaluableLabel}</span>
        </button>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.notEvaluableCaption}</p>
      </Card>
      <OptionGroup label={c.marginLabel} options={c.marginOptions} value={margin} onChange={setMargin} />
      <OptionGroup label={c.periostealLabel} options={c.periostealOptions} value={periosteal} onChange={setPeriosteal} />
      <OptionGroup label={c.endostealLabel} options={c.endostealOptions} value={endosteal} onChange={setEndosteal} />
      <BoolGroup label={c.fractureLabel} value={fracture} onChange={setFracture} />
      <BoolGroup label={c.softTissueLabel} value={softTissue} onChange={setSoftTissue} />
      <BoolGroup label={c.priorCancerLabel} value={priorCancer} onChange={setPriorCancer} />

      {category && (
        <Card>
          <h3 className={`text-base font-bold mb-1 ${colorFor(categoryKey)}`}>{category.title}</h3>
          {!notEvaluable && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.pointTotalLabel}: {pointTotal}</p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 leading-snug">{category.description}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{category.management}</p>
          {!notEvaluable && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{c.pointBreakdownLabel}</p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                <li>{c.marginLabel}: {margin.label} — {margin.points} pt</li>
                <li>{c.periostealLabel}: {periosteal.label} — {periosteal.points} pt</li>
                <li>{c.endostealLabel}: {endosteal.label} — {endosteal.points} pt</li>
                <li>{c.fractureLabel}: {fracture ? c.yesLabel : c.noLabel} — {fracture ? 2 : 0} pt</li>
                <li>{c.softTissueLabel}: {softTissue ? c.yesLabel : c.noLabel} — {softTissue ? 4 : 0} pt</li>
                <li>{c.priorCancerLabel}: {priorCancer ? c.yesLabel : c.noLabel} — {priorCancer ? 2 : 0} pt</li>
              </ul>
            </div>
          )}
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.boneRads} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {category && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultTitle}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${colorFor(categoryKey)}`}>{category.title}</span>
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

import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconInfo } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, Accordion, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function KellgrenLawrence() {
  const { t } = useLang();
  const c = t.calc.kellgrenLawrence;
  const [jointIdx, setJointIdx] = useState(0);
  const [grade, setGrade] = useState(null);

  const joint = c.joints[jointIdx];
  const hasAny = grade !== null;

  const handleCopy = () => {
    const lines = [
      `${c.jointLabel}: ${joint.name} (${joint.projection})`,
      `${c.gradeLabel}: ${grade} — ${c.gradeDefs[grade]}`,
    ];
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setJointIdx(0); setGrade(null); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAny ? 'pb-56' : ''}`}>
      <Card>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.jointLabel}</h3>
        <div className="flex gap-2 flex-wrap">
          {c.joints.map((j, i) => (
            <button
              key={j.name}
              onClick={() => setJointIdx(i)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${jointIdx === i ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {j.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{c.projectionLabel}: {joint.projection}</p>
      </Card>

      <Accordion icon={<IconInfo size={16} />} title={c.featuresTitle}>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          {c.features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </Accordion>

      <Card>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.gradeLabel}</h3>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${grade === g ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {g}
            </button>
          ))}
        </div>
        {grade !== null && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.gradeDefs[grade]}</p>}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.gradeDefsNote}</p>
      </Card>

      <InfoBox tone="slate">{c.groupingNote}</InfoBox>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.kellgrenLawrence} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasAny && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{joint.name}</span>
            <span className="text-2xl font-black block leading-tight text-slate-700 dark:text-slate-200">
              {c.gradeShort} {grade}
            </span>
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

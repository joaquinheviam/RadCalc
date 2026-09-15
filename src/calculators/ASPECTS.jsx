import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const ALL_REGION_KEYS = ['caudate', 'lentiform', 'internalCapsule', 'insularRibbon', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'];

export default function ASPECTS() {
  const { t } = useLang();
  const c = t.calc.aspects;
  const [checked, setChecked] = useState({});

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const checkedCount = ALL_REGION_KEYS.filter((k) => checked[k]).length;
  const score = 10 - checkedCount;

  let band;
  if (score >= 8) band = { title: c.band8to10Title, note: c.band8to10Note, color: 'text-emerald-500' };
  else if (score >= 6) band = { title: c.band6to7Title, note: c.band6to7Note, color: 'text-amber-500' };
  else if (score >= 3) band = { title: c.band3to5Title, note: c.band3to5Note, color: 'text-orange-500' };
  else band = { title: c.band0to2Title, note: c.band0to2Note, color: 'text-red-500' };

  const resetAll = () => setChecked({});
  const handleCopy = () => copyToClipboard(c.reportText(score, band.title), t.common.copiedOk, t.common.copiedErr);

  const RegionButton = ({ region }) => (
    <button
      onClick={() => toggle(region.key)}
      className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all flex items-center gap-2 ${checked[region.key] ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
    >
      {checked[region.key] ? <IconCheckCircle size={14} /> : <span className="w-3.5" />} {region.label}
    </button>
  );

  return (
    <div className="space-y-4 animate-in fade-in pb-56">
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.lowerLevelLabel}</label>
        <div className="space-y-2">
          {c.lowerRegions.map((region) => <RegionButton key={region.key} region={region} />)}
        </div>
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.upperLevelLabel}</label>
        <div className="space-y-2">
          {c.upperRegions.map((region) => <RegionButton key={region.key} region={region} />)}
        </div>
      </Card>

      <Card>
        <div className="flex items-baseline justify-between mb-1">
          <h3 className={`text-base font-bold ${band.color}`}>{band.title}</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{c.scoreLabel}: {score}/10</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{band.note}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 leading-snug">{c.interobserverNote}</p>
      </Card>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.aspects} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      <StickyBar>
        <div className="min-w-0 text-center">
          <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultTitle}</span>
          <span className={`text-3xl font-black block mt-1 leading-tight ${band.color}`}>{score}/10</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ResetIconButton onClick={resetAll} label={t.common.reset} />
          <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
        </div>
      </StickyBar>
    </div>
  );
}

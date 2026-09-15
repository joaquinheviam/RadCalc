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
  const [showPre, setShowPre] = useState(false);
  const [preAge, setPreAge] = useState('');
  const [preNihss, setPreNihss] = useState('');

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const checkedCount = ALL_REGION_KEYS.filter((k) => checked[k]).length;
  const score = 10 - checkedCount;

  let band;
  if (score >= 8) band = { title: c.band8to10Title, note: c.band8to10Note, color: 'text-emerald-500' };
  else if (score >= 6) band = { title: c.band6to7Title, note: c.band6to7Note, color: 'text-amber-500' };
  else if (score >= 3) band = { title: c.band3to5Title, note: c.band3to5Note, color: 'text-orange-500' };
  else band = { title: c.band0to2Title, note: c.band0to2Note, color: 'text-red-500' };

  const ageNum = parseFloat(preAge);
  const nihssNum = parseFloat(preNihss);
  const preValid = showPre && Number.isFinite(ageNum) && Number.isFinite(nihssNum);
  const preScore = preValid ? Math.round(ageNum + 2 * nihssNum - 10 * score) : null;

  let preBand = null;
  if (preValid) {
    if (preScore <= -25) preBand = { title: c.preBandTooGoodTitle, note: c.preBandTooGoodNote, color: 'text-emerald-500' };
    else if (preScore >= 50) preBand = { title: c.preBandTooBadTitle, note: c.preBandTooBadNote, color: 'text-red-500' };
    else preBand = { title: c.preBandOptimalTitle, note: c.preBandOptimalNote, color: 'text-sky-500' };
  }

  const resetAll = () => { setChecked({}); setShowPre(false); setPreAge(''); setPreNihss(''); };
  const handleCopy = () => {
    let text = c.reportText(score, band.title);
    if (preValid) text += `\n\n${c.preReportText(preScore, preBand.title)}`;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

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

      <Card>
        {!showPre ? (
          <button
            onClick={() => setShowPre(true)}
            className="w-full text-center p-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-sm font-medium text-sky-600 dark:text-sky-400"
          >
            {c.preToggleLabel}
          </button>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{c.preTitle}</h3>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{c.ageLabel}</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="120"
                value={preAge}
                onChange={(e) => setPreAge(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{c.nihssLabel}</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="42"
                value={preNihss}
                onChange={(e) => setPreNihss(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            {preValid && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-baseline justify-between mb-1">
                  <h4 className={`text-sm font-bold ${preBand.color}`}>{preBand.title}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{c.preScoreLabel}: {preScore}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{preBand.note}</p>
              </div>
            )}

            <UsageNotes paragraphs={c.preUsage} />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700 leading-snug">{c.preLimitationsNote}</p>
          </div>
        )}
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

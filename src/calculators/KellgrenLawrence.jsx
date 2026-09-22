import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconInfo } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, Accordion, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const ARTHROPLASTY_HR = {
  knee: { single: 19.3, paired: 4.8 },
  hip: { single: 24.4, paired: 7.7 },
};
const PREVALENCE_MULT = { knee: 2.4, hip: 2.9 };
const MANAGE_TONE = ['emerald', 'amber', 'amber', 'amber', 'red'];

export default function KellgrenLawrence() {
  const { t } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.kellgrenLawrence;
  const [jointIdx, setJointIdx] = useState(0);
  const [grade, setGrade] = useState(null);
  const [readingMethod, setReadingMethod] = useState(null);
  const [roaDef, setRoaDef] = useState(null);

  const joint = c.joints[jointIdx];
  const isKneeOrHip = joint.key === 'knee' || joint.key === 'hip';
  const hasAny = grade !== null;

  const readingMethodLabel = (key) => c.readingMethodOptions.find((o) => o.key === key)?.label;

  const showPrevalence = isKneeOrHip && readingMethod === 'paired';
  const prevalenceMult = isKneeOrHip ? PREVALENCE_MULT[joint.key] : null;

  const showArthroplasty = isKneeOrHip && readingMethod !== null && roaDef === 'established' && grade !== null && grade >= 2;
  const arthroplastyHR = showArthroplasty ? ARTHROPLASTY_HR[joint.key][readingMethod] : null;

  const showProgression = joint.key === 'knee' && grade === 1;

  const showNonKneeHipNote = !isKneeOrHip && (readingMethod !== null || roaDef !== null);

  const showManagement = joint.key === 'knee' && grade !== null;

  const getReportText = () => {
    const lines = [
      `${c.jointLabel}: ${joint.name} (${joint.projection})`,
      `${c.gradeLabel}: ${grade} — ${c.gradeDefs[grade]}`,
    ];
    if (showManagement) {
      lines.push(`${c.manageDiagLabel}: ${c.manageDiag[grade]}`);
      lines.push(`${c.manageLabel}: ${c.manageText[grade]}`);
    }
    if (showPrevalence) lines.push(c.prevalenceNote(prevalenceMult, joint.name));
    if (showArthroplasty) {
      lines.push(c.arthroplastyText(arthroplastyHR, joint.name, readingMethodLabel(readingMethod)));
      if (readingMethod === 'paired') lines.push(c.arthroplastyPairedCaveat);
    }
    if (showProgression) lines.push(c.progressionText);
    return lines.join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setJointIdx(0); setGrade(null); setReadingMethod(null); setRoaDef(null); };

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

      {showManagement && (
        <Card>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{c.manageTitle}</h3>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{c.manageDiagLabel}: {c.manageDiag[grade]}</p>
          <InfoBox tone={MANAGE_TONE[grade]}>
            <span className="font-semibold block mb-1">{c.manageLabel}:</span>
            {c.manageText[grade]}
          </InfoBox>
        </Card>
      )}

      <InfoBox tone="slate">{c.groupingNote}</InfoBox>

      <Card className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.readingMethodLabel}</h3>
          <div className="flex flex-col gap-2">
            {c.readingMethodOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setReadingMethod(opt.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left border transition-colors ${readingMethod === opt.key ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.roaDefLabel}</h3>
          <div className="flex gap-2">
            {c.roaDefOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRoaDef(opt.key)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${roaDef === opt.key ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {showNonKneeHipNote && <p className="text-xs text-amber-600 dark:text-amber-400 leading-snug">{c.nonKneeHipNote}</p>}
      </Card>

      {showPrevalence && <InfoBox tone="amber">{c.prevalenceNote(prevalenceMult, joint.name)}</InfoBox>}

      {showArthroplasty && (
        <Card>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{c.arthroplastyTitle}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{c.arthroplastyText(arthroplastyHR, joint.name, readingMethodLabel(readingMethod))}</p>
          {readingMethod === 'paired' && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.arthroplastyPairedCaveat}</p>}
        </Card>
      )}

      {showProgression && (
        <Card>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{c.progressionTitle}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{c.progressionText}</p>
        </Card>
      )}

      <Accordion icon={<IconInfo size={16} />} title={c.step.title}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{c.step.intro}</p>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{c.step.pharmaTitle}</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {c.step.pharma.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{c.step.regenTitle}</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {c.step.regen.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{c.step.interventTitle}</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {c.step.intervent.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        </div>
      </Accordion>

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

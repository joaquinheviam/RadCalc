import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconInfo } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, Accordion, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';
import { ALT_ITEMS, ALT_MAX, WILSON, EXTRA_FINDINGS, altScore, altBand } from './logic/altLipoma.js';

const fmt = (lang, [v, lo, hi]) => (lang === 'es' ? `${v} % (${lo}–${hi})` : `${v}% (${lo}–${hi})`);

export default function AltLipoma() {
  const { t, lang } = useLang();
  const c = t.calc.altLipoma;
  const [showPreview, setShowPreview] = useState(false);
  const [answers, setAnswers] = useState({ size: null, deep: null, septa: null, enhancement: null });
  const [extra, setExtra] = useState({});

  const score = altScore(answers);
  const band = altBand(score);
  const bandInfo = band === 'high'
    ? { title: c.highTitle, note: c.highNote, color: 'text-red-500' }
    : band === 'low' ? { title: c.lowTitle, note: c.lowNote, color: 'text-emerald-500' } : null;

  const stat = (key) => {
    const w = WILSON[key];
    return c.wilsonStat(fmt(lang, w.sens), fmt(lang, w.spec), !!w.fixed);
  };

  const setAnswer = (key, value) => setAnswers((prev) => ({ ...prev, [key]: value }));
  const toggleExtra = (key) => setExtra((prev) => ({ ...prev, [key]: !prev[key] }));
  const resetAll = () => { setAnswers({ size: null, deep: null, septa: null, enhancement: null }); setExtra({}); };

  const extraPresent = EXTRA_FINDINGS.filter((k) => extra[k]);

  const getReportText = () => {
    if (score === null) return '';
    const items = ALT_ITEMS.map(({ key, points }) => c.reportItem(c.items[key].short, answers[key] ? c.items[key].yesLabel : c.items[key].noLabel, answers[key] ? points : 0));
    const extras = extraPresent.map((k) => `${c.extra[k]} (${stat(k)})`);
    return c.reportText(score, ALT_MAX, bandInfo.title, items, extras);
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const btn = (active) => `flex-1 p-2.5 rounded-lg border text-sm transition-all flex justify-between items-center gap-2 ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

  return (
    <div className={`space-y-4 animate-in fade-in ${bandInfo ? 'pb-56' : ''}`}>
      <InfoBox tone="amber">{c.scopeNote}</InfoBox>

      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{c.scoreTitle}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.scoreIntro}</p>
        <div className="space-y-4">
          {ALT_ITEMS.map(({ key, points, wilson }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{c.items[key].label}</label>
              <div className="flex gap-2">
                <button type="button" aria-pressed={answers[key] === true} onClick={() => setAnswer(key, true)} className={btn(answers[key] === true)}>
                  <span>{c.items[key].yesLabel}</span><span className="text-xs font-bold shrink-0">+{points} pt</span>
                </button>
                <button type="button" aria-pressed={answers[key] === false} onClick={() => setAnswer(key, false)} className={btn(answers[key] === false)}>
                  <span>{c.items[key].noLabel}</span><span className="text-xs font-bold shrink-0">0 pt</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.wilsonPrefix} {stat(wilson)}.</p>
            </div>
          ))}
        </div>
      </Card>

      {bandInfo && (
        <Card>
          <div className="flex items-baseline justify-between mb-1 gap-2">
            <h3 className={`text-base font-bold ${bandInfo.color}`}>{bandInfo.title}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{c.pointTotalLabel}: {score}/{ALT_MAX}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{bandInfo.note}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 leading-snug">{c.validationNote}</p>
        </Card>
      )}

      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{c.extraTitle}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.extraIntro}</p>
        <div className="space-y-2">
          {EXTRA_FINDINGS.map((k) => (
            <button key={k} type="button" aria-pressed={!!extra[k]} onClick={() => toggleExtra(k)} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${extra[k] ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              <span className="block">{c.extra[k]}</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{c.wilsonPrefix} {stat(k)}.</span>
            </button>
          ))}
        </div>
      </Card>

      <Accordion icon={<IconInfo size={16} />} title={c.tableTitle}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th scope="col" className="pb-2 pr-2 font-medium">{c.tableFinding}</th>
                <th scope="col" className="pb-2 pr-2 font-medium">{c.tableSens}</th>
                <th scope="col" className="pb-2 font-medium">{c.tableSpec}</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(WILSON).map((k) => (
                <tr key={k} className="border-b border-slate-50 dark:border-slate-700/50 align-top">
                  <th scope="row" className="py-1.5 pr-2 font-medium text-slate-700 dark:text-slate-200">{c.findings[k]}{WILSON[k].fixed ? ' *' : ''}</th>
                  <td className="py-1.5 pr-2 text-slate-600 dark:text-slate-300">{fmt(lang, WILSON[k].sens)}</td>
                  <td className="py-1.5 text-slate-600 dark:text-slate-300">{fmt(lang, WILSON[k].spec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-snug">{c.tableNote}</p>
      </Accordion>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.altLipoma} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {bandInfo && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultTitle}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${bandInfo.color}`}>{score}/{ALT_MAX} — {bandInfo.title}</span>
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

import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconArrowRight, IconGitBranch } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion, AlgorithmSchema } from '../components/shared/index.js';
import { buildWizardTree, SHOW_ALGORITHM_VIEW } from '../utils/algorithmTree.js';

export default function Bosniak() {
  const { t, lang } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.bosniak;
  const algorithmTree = buildWizardTree(c, 'start');
  const [history, setHistory] = useState(['start']);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const currentId = history[history.length - 1];
  const currentNode = currentId === 'start' ? c.start : (c.nodes[currentId] || c.results[currentId]);
  const isResult = !!currentNode.cat;

  const handleSelect = (nextId, label) => {
    setHistory([...history, nextId]);
    setSelectedLabels([...selectedLabels, label]);
  };
  const handleReset = () => { setHistory(['start']); setSelectedLabels([]); };
  const handleUndo = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
      setSelectedLabels(selectedLabels.slice(0, -1));
    }
  };
  const getReportText = () => {
    if (!isResult) return '';
    const path = selectedLabels.join(' -> ');
    return c.reportText(path, currentNode.cat, currentNode.risk, currentNode.recs);
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${isResult ? 'pb-56' : 'pb-4'}`}>
      {history.length > 1 && (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs text-slate-500 dark:text-slate-400">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold uppercase">{c.history}</span>
            <div className="flex items-center gap-3">
              <button onClick={handleUndo} className="text-blue-500 font-medium">{c.undo}</button>
              <button onClick={handleReset} className="text-slate-500 dark:text-slate-400 font-medium">{t.common.reset}</button>
            </div>
          </div>
          <ol className="list-decimal pl-4 space-y-1">
            {selectedLabels.map((lbl, i) => <li key={i}>{lbl}</li>)}
          </ol>
        </div>
      )}
      {!isResult ? (
        <Card>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{currentNode.q}</h3>
          <div className="space-y-2">
            {currentNode.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt.next, opt.label)}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-800 dark:hover:bg-blue-900/30 transition-colors flex justify-between items-center"
              >
                <span>{opt.label}</span>
                <IconArrowRight size={16} className="text-slate-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-800 text-center space-y-4">
          <div>
            <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">{currentNode.cat}</h2>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 text-left">{currentNode.risk}</p>
          </div>
          <div className="bg-blue-50 dark:bg-slate-900 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 text-left">
            <span className="block font-semibold mb-1 text-blue-800 dark:text-blue-300">{c.recommendation}:</span>
            {currentNode.recs}
          </div>
        </div>
      )}
      <UsageNotes paragraphs={c.usage} />
      {SHOW_ALGORITHM_VIEW && (
        <Accordion icon={<IconGitBranch size={16} />} title={t.common.viewFullAlgorithm}>
          <AlgorithmSchema tree={algorithmTree} />
        </Accordion>
      )}
      <References items={REFERENCES.bosniak} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {isResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-2xl font-black block text-blue-600 dark:text-blue-400">{currentNode.cat}</span>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug mt-1">{currentNode.risk}</p>
          </div>
          <div className="flex items-start gap-5 shrink-0">
            <ResetIconButton onClick={handleReset} label={t.common.reset} caption={t.common.reset} />
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

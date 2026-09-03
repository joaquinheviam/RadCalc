import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCopy, IconArrowRight } from '../components/icons/index.js';
import { Card, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

export default function LungCysts() {
  const { t, lang } = useLang();
  const c = t.calc.lungCysts;
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
  const handleCopy = () => {
    if (!isResult) return;
    const path = selectedLabels.join(' -> ');
    const text = c.reportText(path, currentNode.cat, currentNode.risk, currentNode.recs);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className="space-y-4 pb-4 animate-in fade-in">
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
          <div className="flex gap-2 pt-2">
            <button onClick={handleReset} className="flex-1 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
              {t.common.reset}
            </button>
            <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              <IconCopy size={18} /> {t.common.copy}
            </button>
          </div>
        </div>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.lungCysts} />
      <ReportBugLink calcTitle={c.title} />
    </div>
  );
}

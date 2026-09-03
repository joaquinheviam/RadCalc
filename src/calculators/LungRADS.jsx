import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCopy, IconCheckCircle, IconArrowRight } from '../components/icons/index.js';
import { Card, NumberField, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

function lungRadsCatColor(key) {
  if (key === '1' || key === '2') return 'text-emerald-500';
  if (key === '0') return 'text-slate-400';
  if (key === '3') return 'text-amber-500';
  return 'text-red-500'; // 4A, 4B, 4X
}

export default function LungRADS() {
  const { t, lang } = useLang();
  const c = t.calc.lungRads;
  const w = c.wizard;
  const [history, setHistory] = useState(['start']);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [numVal, setNumVal] = useState('');
  const [sMod, setSMod] = useState(false);
  const [upgrade4X, setUpgrade4X] = useState(false);

  const currentId = history[history.length - 1];
  const currentNode = currentId === 'start' ? w.start : w.nodes[currentId];
  const isResult = !!currentNode.cat;
  const isNotClassified = isResult && currentNode.cat === 'notClassified';
  const canUpgrade4X = isResult && !isNotClassified && ['3', '4A', '4B'].includes(currentNode.cat);
  const effectiveCat = canUpgrade4X && upgrade4X ? '4X' : currentNode.cat;
  const effectiveCatObj = isResult && !isNotClassified ? c.categories.find(x => x.key === effectiveCat) : null;

  const handleSelect = (nextId, label) => {
    setHistory([...history, nextId]);
    setSelectedLabels([...selectedLabels, label]);
    setNumVal('');
  };
  const handleNumericSubmit = () => {
    const val = parseFloat(String(numVal).replace(',', '.'));
    if (isNaN(val)) return;
    const branch = currentNode.branches.find(b => b.lt === undefined || val < b.lt);
    if (!branch) return;
    handleSelect(branch.next, `${currentNode.q} ${val} ${c.mmLabel}`);
  };
  const handleReset = () => {
    setHistory(['start']); setSelectedLabels([]); setNumVal(''); setSMod(false); setUpgrade4X(false);
  };
  const handleUndo = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
      setSelectedLabels(selectedLabels.slice(0, -1));
      setNumVal('');
    }
  };
  const handleCopy = () => {
    if (!isResult) return;
    const path = selectedLabels.join(' -> ');
    if (isNotClassified) {
      const text = `${c.notClassifiedTitle}\n${c.notClassifiedDesc}${path ? '\n' + c.pathLabel + ': ' + path : ''}`;
      copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
      return;
    }
    const text = c.reportText(effectiveCatObj.key, effectiveCatObj.label, effectiveCatObj.mgmt, sMod, path);
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
          {currentNode.numeric ? (
            <div className="space-y-3 mt-2">
              <NumberField value={numVal} onChange={setNumVal} placeholder={c.sizePh} />
              <button
                onClick={handleNumericSubmit}
                disabled={numVal === ''}
                className="w-full py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t.common.next}
              </button>
            </div>
          ) : (
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
          )}
        </Card>
      ) : isNotClassified ? (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
          <h2 className="text-lg font-black text-emerald-600 dark:text-emerald-400">{c.notClassifiedTitle}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 text-left">{c.notClassifiedDesc}</p>
          <div className="flex gap-2 pt-2">
            <button onClick={handleReset} className="flex-1 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
              {c.changeType}
            </button>
            <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              <IconCopy size={18} /> {t.common.copy}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {canUpgrade4X && (
            <Card>
              <button onClick={() => setUpgrade4X(u => !u)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-1.5 ${upgrade4X ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {upgrade4X ? <IconCheckCircle size={14} /> : <span className="w-3.5 shrink-0" />} <span>{c.upgrade4XLabel}</span>
              </button>
            </Card>
          )}
          <Card>
            <button onClick={() => setSMod(s => !s)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-1.5 ${sMod ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {sMod ? <IconCheckCircle size={14} /> : <span className="w-3.5 shrink-0" />} <span>{c.sLabel}</span>
            </button>
          </Card>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-800 text-center space-y-4">
            <div>
              <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
              <span className={`text-3xl font-black ${lungRadsCatColor(effectiveCatObj.key)}`}>Lung-RADS {effectiveCatObj.key}{sMod ? 'S' : ''}</span>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">{effectiveCatObj.label}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-left">
              <span className="text-xs text-slate-500 block mb-1">{c.managementLabel}</span>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{effectiveCatObj.mgmt}</p>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">{c.prevalenceLabel}: {effectiveCatObj.prevalence}</p>
            <div className="flex gap-2 pt-2">
              <button onClick={handleReset} className="flex-1 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
                {c.changeType}
              </button>
              <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                <IconCopy size={18} /> {t.common.copy}
              </button>
            </div>
          </div>
        </div>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.lungRads} />
      <ReportBugLink calcTitle={c.title} />
    </div>
  );
}

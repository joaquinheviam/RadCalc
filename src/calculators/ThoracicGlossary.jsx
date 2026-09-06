import { useMemo, useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, References, UsageNotes, CalcDisclaimer } from '../components/shared/index.js';
import { FLEISCHNER_TERMS } from '../i18n/fleischnerTerms.js';
import { normalizeSearchText } from '../utils/searchNormalize.js';

const CATEGORY_STYLES = {
  anatomy: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  pathology: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800',
  distribution: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  pattern: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  physiology: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
};

export default function ThoracicGlossary() {
  const { t, lang } = useLang();
  const c = t.calc.thoracicglossary;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const filters = [
    { key: 'all', label: c.filterAll },
    { key: 'anatomy', label: c.filterAnatomy },
    { key: 'pathology', label: c.filterPathology },
    { key: 'distribution', label: c.filterDistribution },
    { key: 'pattern', label: c.filterPatterns },
    { key: 'physiology', label: c.filterPhysiology },
  ];
  const catLabel = {
    anatomy: c.catAnatomy,
    pathology: c.catPathology,
    distribution: c.catDistribution,
    pattern: c.catPattern,
    physiology: c.catPhysiology,
  };

  const normalizedQuery = normalizeSearchText(searchTerm.trim());
  const filteredTerms = useMemo(() => {
    return FLEISCHNER_TERMS.filter((item) => {
      if (selectedCat !== 'all' && item.cat !== selectedCat) return false;
      if (!normalizedQuery) return true;
      const content = item[lang] || item.es;
      const haystack = normalizeSearchText(`${content.term} ${content.def}`);
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, selectedCat, lang]);

  const handleCopyTerm = (item) => {
    const content = item[lang] || item.es;
    copyToClipboard(`${content.term}\n${content.def}`, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{c.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.subtitle}</p>
      </div>

      <Card>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={c.searchPlaceholder}
          className="w-full p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setSelectedCat(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                selectedCat === f.key
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {c.termCount.replace('{count}', filteredTerms.length).replace('{total}', FLEISCHNER_TERMS.length)}
        </div>
      </Card>

      <div className="space-y-3">
        {filteredTerms.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            {c.noResults}
          </div>
        ) : (
          filteredTerms.map((item) => {
            const content = item[lang] || item.es;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{content.term}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${CATEGORY_STYLES[item.cat]}`}>
                      {catLabel[item.cat]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyTerm(item)}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium shrink-0"
                  >
                    {c.copyReport}
                  </button>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{content.def}</p>
              </div>
            );
          })
        )}
      </div>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.thoracicglossary} />
      <CalcDisclaimer />
    </div>
  );
}

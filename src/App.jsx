import { Suspense, useEffect, useMemo, useState } from 'react';
import { LangContext } from './i18n/LangContext.js';
import { STRINGS } from './i18n/strings.js';
import { SEARCH_TERMS } from './i18n/searchTerms.js';
import { normalizeSearchText } from './utils/searchNormalize.js';
import { calculators, categoryOrder } from './calculators/registry.js';
import { Logo, SiteFooter } from './components/shared/index.js';
import { IconChevronLeft, IconChevronDown, IconSun, IconMoon, IconSearch, IconX, IconStar } from './components/icons/index.js';
import { useLocalStorageState } from './hooks/useLocalStorageState.js';

// Fila de una calculadora en el listado (favoritas, resultados de búsqueda o
// categoría): la estrella y el botón de abrir son elementos hermanos (nunca
// un <button> anidado dentro de otro) para que el click en cada uno se
// maneje por separado sin efectos raros de propagación.
function CalcListRow({ title, category, isFav, onToggleFav, favAddLabel, favRemoveLabel, onOpen, extra }) {
  return (
    <div className="w-full flex items-center gap-1">
      <button
        onClick={onToggleFav}
        aria-label={isFav ? favRemoveLabel : favAddLabel}
        aria-pressed={isFav}
        className="p-3 -mr-1 shrink-0 rounded-full text-slate-300 dark:text-slate-600 hover:text-amber-400 dark:hover:text-amber-400 active:text-amber-400 transition-colors"
      >
        <IconStar size={18} filled={isFav} className={isFav ? 'text-amber-400' : ''} />
      </button>
      <button
        onClick={onOpen}
        className="flex-1 min-w-0 text-left py-4 pr-4 active:bg-slate-50 dark:active:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex justify-between items-center gap-3"
      >
        <span className="flex flex-col min-w-0">
          <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{title}</span>
          {category && <span className="text-xs text-slate-400 dark:text-slate-500">{category}</span>}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {extra}
          <IconChevronLeft className="text-slate-400 transform rotate-180 w-4 h-4 shrink-0" />
        </div>
      </button>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorageState('radiocalc:darkMode', true);
  const [lang, setLang] = useLocalStorageState('radiocalc:lang', 'es');
  const [favorites, setFavorites] = useLocalStorageState('radiocalc:favorites', []);
  const [activeCalc, setActiveCalc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isFavorite = (id) => favorites.includes(id);
  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const moveFavorite = (id, dir) => {
    setFavorites((prev) => {
      const idx = prev.indexOf(id);
      const newIdx = idx + dir;
      if (idx === -1 || newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };
  const favoriteCalcs = favorites.map((id) => calculators.find((cc) => cc.id === id)).filter(Boolean);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = STRINGS[lang];
  const toggleLang = () => setLang((l) => (l === 'es' ? 'en' : 'es'));

  const activeEntry = activeCalc ? calculators.find((cc) => cc.id === activeCalc) : null;
  const activeTitle = activeEntry ? t.calc[activeEntry.id].title : null;

  const normalizedQuery = normalizeSearchText(searchQuery.trim());
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return null;
    return calculators.filter((cc) => {
      // Se busca en ambos idiomas a la vez (títulos y términos de búsqueda de
      // ES y EN), sin importar el idioma activo de la interfaz. Así, alguien
      // que use la app en español pero escriba un término en inglés (o
      // viceversa) igual encuentra la calculadora.
      const titleEs = STRINGS.es.calc[cc.id] ? STRINGS.es.calc[cc.id].title : '';
      const titleEn = STRINGS.en.calc[cc.id] ? STRINGS.en.calc[cc.id].title : '';
      const termsEs = (SEARCH_TERMS.es && SEARCH_TERMS.es[cc.id]) || [];
      const termsEn = (SEARCH_TERMS.en && SEARCH_TERMS.en[cc.id]) || [];
      const haystack = normalizeSearchText([titleEs, titleEn, ...termsEs, ...termsEn].join(' '));
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
        <header className="sticky top-0 z-50 bg-blue-600 dark:bg-slate-800 text-white shadow-md px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {activeCalc ? (
              <button onClick={() => setActiveCalc(null)} aria-label={t.common.back} className="p-1 -ml-1 hover:bg-white/20 rounded-full transition-colors shrink-0">
                <IconChevronLeft className="w-6 h-6" />
              </button>
            ) : (
              <Logo size={32} />
            )}
            <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">
              {activeTitle || t.appName}
            </h1>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              className="px-2.5 py-1.5 text-xs font-bold rounded-full hover:bg-white/20 transition-colors border border-white/30"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme" className="p-2 hover:bg-white/20 rounded-full transition-colors">
              {darkMode ? <IconSun /> : <IconMoon />}
            </button>
          </div>
        </header>
        <main className="max-w-md mx-auto p-4">
          {activeEntry ? (
            <Suspense fallback={<div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">…</div>}>
              <activeEntry.component />
            </Suspense>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <Logo size={56} />
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.appName}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{t.tagline}</p>
                </div>
              </div>
              <div className="relative">
                <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search.placeholder}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label={lang === 'es' ? 'Limpiar búsqueda' : 'Clear search'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                  >
                    <IconX size={16} />
                  </button>
                )}
              </div>
              {!searchResults && favoriteCalcs.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
                    <IconStar size={14} filled className="text-amber-400" />
                    {t.favorites.title}
                  </h2>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                    {favoriteCalcs.map((cc, i) => (
                      <CalcListRow
                        key={cc.id}
                        title={t.calc[cc.id].title}
                        category={t.categories[cc.catKey]}
                        isFav
                        onToggleFav={() => toggleFavorite(cc.id)}
                        favAddLabel={t.favorites.addAria}
                        favRemoveLabel={t.favorites.removeAria}
                        onOpen={() => setActiveCalc(cc.id)}
                        extra={
                          <span className="flex flex-col shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); moveFavorite(cc.id, -1); }}
                              disabled={i === 0}
                              aria-label={t.favorites.moveUpAria}
                              className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-25 disabled:pointer-events-none"
                            >
                              <IconChevronDown size={16} className="rotate-180" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); moveFavorite(cc.id, 1); }}
                              disabled={i === favoriteCalcs.length - 1}
                              aria-label={t.favorites.moveDownAria}
                              className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-25 disabled:pointer-events-none"
                            >
                              <IconChevronDown size={16} />
                            </button>
                          </span>
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
              {searchResults ? (
                searchResults.length > 0 ? (
                  <div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                      {searchResults.map((cc) => (
                        <CalcListRow
                          key={cc.id}
                          title={t.calc[cc.id].title}
                          category={t.categories[cc.catKey]}
                          isFav={isFavorite(cc.id)}
                          onToggleFav={() => toggleFavorite(cc.id)}
                          favAddLabel={t.favorites.addAria}
                          favRemoveLabel={t.favorites.removeAria}
                          onOpen={() => setActiveCalc(cc.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-6">
                    {t.search.noResults} "{searchQuery}"
                  </p>
                )
              ) : (
                <>
                  {categoryOrder.filter((catKey) => calculators.some((cc) => cc.catKey === catKey)).map((catKey) => (
                    <div key={catKey}>
                      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
                        {t.categories[catKey]}
                      </h2>
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                        {calculators.filter((cc) => cc.catKey === catKey).map((cc) => (
                          <CalcListRow
                            key={cc.id}
                            title={t.calc[cc.id].title}
                            isFav={isFavorite(cc.id)}
                            onToggleFav={() => toggleFavorite(cc.id)}
                            favAddLabel={t.favorites.addAria}
                            favRemoveLabel={t.favorites.removeAria}
                            onOpen={() => setActiveCalc(cc.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
              <SiteFooter />
            </div>
          )}
        </main>
      </div>
    </LangContext.Provider>
  );
}

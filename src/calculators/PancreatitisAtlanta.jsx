import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

export default function PancreatitisAtlanta() {
  const { t, lang } = useLang();
  const c = t.calc.pancreatitisAtlanta;
  const [necrosis, setNecrosis] = useState(null); // null | false | 'parenchymal'|'peripancreatic'|'combined'
  const [necrosisExtent, setNecrosisExtent] = useState(null); // null | 'under30' | 'over30'
  const [collection, setCollection] = useState(null); // null | 'none' | 'early' | 'late'
  const [organFailure, setOrganFailure] = useState(null); // null | 'none'|'transient'|'persistent'
  const [localComplications, setLocalComplications] = useState(null); // null | true | false
  const [multiplicity, setMultiplicity] = useState(null); // null | 'single' | 'multiple'

  const isNecrotizing = necrosis && necrosis !== 'none-selected' && necrosis !== false;
  const morphResult = necrosis === false
    ? c.morphResultInterstitial
    : (isNecrotizing ? c.necrosisSubtypes[necrosis] : null);
  const necrosisExtentLabel = isNecrotizing ? (necrosisExtent === 'under30' ? c.necrosisExtentUnder30 : necrosisExtent === 'over30' ? c.necrosisExtentOver30 : null) : null;

  let collectionResult = null;
  if (collection === 'early') collectionResult = isNecrotizing ? c.collectionResults.anc : c.collectionResults.apfc;
  else if (collection === 'late') collectionResult = isNecrotizing ? c.collectionResults.won : c.collectionResults.pseudocyst;

  let severityResult = null;
  if (organFailure) {
    if (organFailure === 'persistent') severityResult = c.severityResults.severe;
    else if (organFailure === 'transient' || localComplications) severityResult = c.severityResults.moderate;
    else if (organFailure === 'none' && localComplications === false) severityResult = c.severityResults.mild;
  }

  // Impresión diagnóstica final: combina el tipo morfológico (Paso 1) con la colección local (Paso 2)
  // en una sola frase de reporte, ej. "Pancreatitis aguda necrotizante con múltiples WON".
  const collectionKey = collection === 'early' ? (isNecrotizing ? 'anc' : 'apfc') : collection === 'late' ? (isNecrotizing ? 'won' : 'pseudocyst') : null;
  const morphPhrase = necrosis === false
    ? c.finalDx.interstitial
    : (isNecrotizing ? c.finalDx.necrotizing + (necrosisExtent ? ` (${necrosisExtent === 'over30' ? c.finalDx.extentOver30 : c.finalDx.extentUnder30})` : '') : null);
  const collectionPhrase = collection === 'none'
    ? c.finalDx.noCollection
    : (collectionKey ? (multiplicity === 'multiple' ? c.finalDx.collectionPlural[collectionKey] : c.finalDx.collectionSingular[collectionKey]) : null);
  const finalDxText = (morphPhrase && collectionPhrase) ? `${morphPhrase} ${collectionPhrase}` : null;

  const handleCopy = () => {
    const text = c.reportText(
      morphResult ? morphResult.label : t.common.notEvaluated,
      necrosisExtentLabel,
      collectionResult ? collectionResult.label : c.collectionNone,
      severityResult ? severityResult.label : t.common.notEvaluated,
      finalDxText
    );
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => {
    setNecrosis(null); setNecrosisExtent(null); setCollection(null); setOrganFailure(null); setLocalComplications(null); setMultiplicity(null);
  };
  const hasAnyResult = !!(morphResult || collectionResult || severityResult);

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyResult ? 'pb-24' : ''}`}>
      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm">{c.morphTitle}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.morphQ}</p>
        <div className="space-y-2">
          <button onClick={() => setNecrosis(false)} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${necrosis === false ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.morphNo}</button>
          <button onClick={() => setNecrosis('combined')} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${isNecrotizing ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.morphYes}</button>
        </div>
        {isNecrotizing && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.necrosisSubtypeQ}</p>
            <div className="space-y-2">
              {Object.entries(c.necrosisSubtypes).map(([key, opt]) => (
                <button key={key} onClick={() => setNecrosis(key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${necrosis === key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  <span className="font-semibold block">{opt.label}</span>
                  <span className="opacity-80">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {isNecrotizing && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.necrosisExtentQ}</p>
            <div className="flex gap-2">
              <button onClick={() => setNecrosisExtent('under30')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${necrosisExtent === 'under30' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.necrosisExtentUnder30}</button>
              <button onClick={() => setNecrosisExtent('over30')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${necrosisExtent === 'over30' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.necrosisExtentOver30}</button>
            </div>
          </div>
        )}
      </Card>
      {morphResult && (
        <InfoBox tone="amber">{morphResult.desc}</InfoBox>
      )}
      {necrosis !== null && (
        <Card>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm">{c.collectionTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.collectionQ}</p>
          <div className="space-y-2">
            <button onClick={() => setCollection('none')} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${collection === 'none' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.collectionNone}</button>
            <button onClick={() => setCollection('early')} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${collection === 'early' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.collectionEarly}</button>
            <button onClick={() => setCollection('late')} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${collection === 'late' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.collectionLate}</button>
          </div>
          {(collection === 'early' || collection === 'late') && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.multiplicityQ}</p>
              <div className="flex gap-2">
                <button onClick={() => setMultiplicity('single')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${multiplicity === 'single' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.multiplicitySingle}</button>
                <button onClick={() => setMultiplicity('multiple')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${multiplicity === 'multiple' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.multiplicityMultiple}</button>
              </div>
            </div>
          )}
        </Card>
      )}
      {collectionResult && (
        <Card className="text-center">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{collectionResult.label}</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{collectionResult.desc}</p>
        </Card>
      )}
      {finalDxText && (
        <Card className="text-center border-blue-200 dark:border-blue-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{c.finalDxTitle}</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">{finalDxText}</span>
        </Card>
      )}
      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 text-sm">{c.severityTitle}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.severityIntro}</p>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.organFailureQ}</label>
        <div className="space-y-2 mb-3">
          <button onClick={() => setOrganFailure('none')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${organFailure === 'none' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.organFailureNone}</button>
          <button onClick={() => setOrganFailure('transient')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${organFailure === 'transient' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.organFailureTransient}</button>
          <button onClick={() => setOrganFailure('persistent')} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${organFailure === 'persistent' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.organFailurePersistent}</button>
        </div>
        {organFailure === 'none' && (
          <>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.localComplicationsQ}</label>
            <div className="flex gap-2">
              <button onClick={() => setLocalComplications(true)} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${localComplications === true ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes || 'Sí'}</button>
              <button onClick={() => setLocalComplications(false)} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${localComplications === false ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no || 'No'}</button>
            </div>
          </>
        )}
      </Card>
      {severityResult && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.severityTitle}</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{severityResult.label}</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{severityResult.desc}</p>
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.pancreatitisAtlanta} />
      <ReportBugLink calcTitle={c.title} />
      {hasAnyResult && (
        <StickyBar>
          <div className="min-w-0 text-left">
            {finalDxText ? (
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate">{finalDxText}</span>
            ) : morphResult ? (
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate">{morphResult.label}</span>
            ) : (
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate">{collectionResult.label}</span>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">{severityResult ? `${c.severityTitle}: ${severityResult.label}` : c.finalDxTitle}</span>
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

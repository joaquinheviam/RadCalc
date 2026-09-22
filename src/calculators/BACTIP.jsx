import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function BACTIP() {
  const { t } = useLang();
  const [showPreview, setShowPreview] = useState(false);
  const c = t.calc.bactip;
  const [fracture, setFracture] = useState(null);
  const [aggressive, setAggressive] = useState(null);
  const [length, setLength] = useState(null);
  const [scalloping, setScalloping] = useState(null);

  const forcedType3 = fracture === true || aggressive === true;
  const needsMoreInput = fracture === null || (fracture === false && aggressive === null);
  const showSizeScalloping = fracture === false && aggressive === false;

  let typeKey = null;
  if (forcedType3) typeKey = 'III';
  else if (showSizeScalloping && length && scalloping) {
    const map = {
      lt4: { absent: 'IA', focal: 'IB', generalized: 'IC' },
      ge4: { absent: 'IIA', focal: 'IIB', generalized: 'IIC' },
    };
    typeKey = map[length][scalloping];
  }

  const type = typeKey ? c.types[typeKey] : null;

  const resetAll = () => { setFracture(null); setAggressive(null); setLength(null); setScalloping(null); };

  const getReportText = () => {
    if (!type) return;
    return c.reportText(typeKey, type.title);
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const colorFor = (key) => {
    if (!key) return '';
    if (key === 'III' || key === 'IC' || key === 'IIC') return 'text-red-500';
    if (key === 'IB' || key === 'IIB') return 'text-amber-500';
    return 'text-emerald-500';
  };

  const BoolCard = ({ label, caption, value, onChange, disabled }) => (
    <Card>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {[[false, c.noLabel], [true, c.yesLabel]].map(([v, lbl]) => (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            disabled={disabled}
            className={`p-2.5 rounded-lg border text-sm transition-all flex items-center justify-center gap-1.5 ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${value === v ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            {value === v ? <IconCheckCircle size={14} /> : <span className="w-3.5" />} {lbl}
          </button>
        ))}
      </div>
      {caption && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{caption}</p>}
    </Card>
  );

  return (
    <div className={`space-y-4 animate-in fade-in ${type ? 'pb-56' : ''}`}>
      <BoolCard label={c.pathologicFractureLabel} value={fracture} onChange={(v) => { setFracture(v); setAggressive(null); setLength(null); setScalloping(null); }} />
      {fracture === false && (
        <BoolCard label={c.aggressiveFeaturesLabel} caption={c.aggressiveFeaturesCaption} value={aggressive} onChange={(v) => { setAggressive(v); setLength(null); setScalloping(null); }} />
      )}
      {showSizeScalloping && (
        <>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.lengthLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              {c.lengthOptions.map((opt) => (
                <button key={opt.key} onClick={() => setLength(opt.key)} className={`p-2.5 rounded-lg border text-sm transition-all ${length === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
              ))}
            </div>
          </Card>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.scallopingLabel}</label>
            <div className="space-y-2">
              {c.scallopingOptions.map((opt) => (
                <button key={opt.key} onClick={() => setScalloping(opt.key)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${scalloping === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  <span className="font-semibold">{opt.label}</span>
                  <p className="text-xs mt-0.5 opacity-80 leading-snug">{opt.caption}</p>
                </button>
              ))}
            </div>
          </Card>
        </>
      )}

      {type && (
        <Card>
          <h3 className={`text-base font-bold mb-2 ${colorFor(typeKey)}`}>{type.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{type.management}</p>
          {!forcedType3 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 leading-snug">{c.changeDefinitionNote}</p>
          )}
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.bactip} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {type && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultTitle}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${colorFor(typeKey)}`}>{type.title}</span>
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

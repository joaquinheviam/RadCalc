import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle, IconInfo } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, Accordion, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

// BI-RADS assessment is not a deterministic algorithm (unlike LI-RADS/PI-RADS/TI-RADS):
// it is a radiologist gestalt synthesis of descriptors. This component therefore never
// computes a final category — the user always picks it from finalCategoryOptions. A
// "suggested category" badge is shown ONLY at the handful of points where the ACR
// BI-RADS Atlas v2025 / Radiology Assistant literature gives an explicit, citable rule
// (see the spec this was built from); everywhere else only reference definitions are
// shown, never an auto-computed number.

const CAT_ORDER = ['0', '1', '2', '3', '4A', '4B', '4C', '5', '6'];

const catColor = (cat) => {
  if (!cat) return '';
  if (cat === '1' || cat === '2') return 'text-emerald-500';
  if (cat === '3') return 'text-amber-500';
  if (cat === '0') return 'text-slate-400';
  if (cat === '6') return 'text-slate-500';
  return 'text-red-500'; // 4A/4B/4C/5
};

const managementGroup = (cat) => (cat === '0' ? '0' : (cat === '1' || cat === '2') ? '12' : cat === '3' ? '3' : cat === '6' ? '6' : '45');

function OptionButtons({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(value === opt.key ? null : opt.key)}
          className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
        >
          <span className="font-semibold block mb-0.5">{opt.label}</span>
          {opt.desc && <span className="text-xs opacity-80">{opt.desc}</span>}
        </button>
      ))}
    </div>
  );
}

function CheckButtons({ options, values, onToggle }) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onToggle(opt.key)}
          className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start gap-2 ${values[opt.key] ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
        >
          {values[opt.key] ? <IconCheckCircle size={16} className="shrink-0 mt-0.5" /> : <span className="w-4 shrink-0" />}
          <span>
            <span className="font-medium block">{opt.label}</span>
            {opt.desc && <span className="text-xs opacity-80">{opt.desc}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function BiradsMammography() {
  const { t } = useLang();
  const c = t.calc.biradsMammo;

  const [density, setDensity] = useState(null);
  const [findingType, setFindingType] = useState(null);

  const [massShape, setMassShape] = useState(null);
  const [massMargin, setMassMargin] = useState(null);
  const [massDensity, setMassDensity] = useState(null);

  const [calcMorph, setCalcMorph] = useState(null);
  const [calcDist, setCalcDist] = useState(null);

  const [asymType, setAsymType] = useState(null);
  const [focalUsCorrelate, setFocalUsCorrelate] = useState(null); // true | false | null

  const [ductType, setDuctType] = useState(null);
  const [ductStable, setDuctStable] = useState(false);

  const [assoc, setAssoc] = useState({});
  const toggleAssoc = (key) => setAssoc(prev => ({ ...prev, [key]: !prev[key] }));

  const [finalCategory, setFinalCategory] = useState(null);

  let suggestion = null; // { cat, note }
  if (findingType === 'calc' && calcMorph) {
    if (calcMorph === 'benign') suggestion = { cat: '2', note: c.calcSuggestBenignNote('2') };
    else if (['amorphous', 'coarseHet', 'finePleo'].includes(calcMorph)) suggestion = { cat: '4B', note: c.calcSuggest4BNote('4B') };
    else if (calcMorph === 'fineLinear') suggestion = { cat: '4C', note: c.calcSuggest4CNote('4C') };
  } else if (findingType === 'asymmetry' && asymType === 'focal' && focalUsCorrelate === false) {
    suggestion = { cat: '3', note: c.focalSuggestCat3Note('3') };
  } else if (findingType === 'duct' && ductType === 'solitary' && ductStable) {
    suggestion = { cat: '2', note: c.ductSolitarySuggestCat2Note('2') };
  }

  const hasContent = !!findingType;

  const resetAll = () => {
    setDensity(null); setFindingType(null);
    setMassShape(null); setMassMargin(null); setMassDensity(null);
    setCalcMorph(null); setCalcDist(null);
    setAsymType(null); setFocalUsCorrelate(null);
    setDuctType(null); setDuctStable(false);
    setAssoc({}); setFinalCategory(null);
  };

  const findingLabel = () => {
    const ft = c.findingTypes.find(f => f.key === findingType);
    if (!ft) return '';
    const parts = [ft.label];
    if (findingType === 'mass') {
      if (massShape) parts.push(c.massShapeOptions.find(o => o.key === massShape)?.label);
      if (massMargin) parts.push(c.massMarginOptions.find(o => o.key === massMargin)?.label);
      if (massDensity) parts.push(c.massDensityOptions.find(o => o.key === massDensity)?.label);
    } else if (findingType === 'calc') {
      if (calcMorph) parts.push(c.calcMorphOptions.find(o => o.key === calcMorph)?.label);
      if (calcDist) parts.push(c.calcDistOptions.find(o => o.key === calcDist)?.label);
    } else if (findingType === 'asymmetry') {
      if (asymType) parts.push(c.asymmetryTypes.find(o => o.key === asymType)?.label);
      if (asymType === 'focal' && focalUsCorrelate !== null) parts.push(focalUsCorrelate ? c.focalUsCorrelateYes : c.focalUsCorrelateNo);
    } else if (findingType === 'duct') {
      if (ductType) parts.push(c.ductTypes.find(o => o.key === ductType)?.label);
      if (ductType === 'solitary' && ductStable) parts.push(c.ductSolitaryStableLabel);
    }
    return parts.filter(Boolean).join(' — ');
  };

  const assocLabelsList = () => c.assocFeatures.filter(a => assoc[a.key]).map(a => a.label);

  const handleCopy = () => {
    if (!finalCategory) return;
    const densityLabel = density ? c.densityOptions.find(o => o.key === density)?.label : '';
    const finding = findingLabel();
    const assocText = assocLabelsList().length ? assocLabelsList().join(', ') : t.common.none;
    const catDesc = c.categories[finalCategory];
    const categoryLine = `BI-RADS ${finalCategory} — ${catDesc}`;
    const managementLine = c.management[managementGroup(finalCategory)];
    const text = c.reportText(densityLabel, finding, assocText, categoryLine, managementLine);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${finalCategory ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.densityLabel}</label>
        <div className="grid grid-cols-2 gap-2">
          {c.densityOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setDensity(density === opt.key ? null : opt.key)}
              className={`text-left p-2.5 rounded-lg border text-xs transition-all ${density === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              <span className="font-semibold block">{opt.label}</span>
              {opt.desc && <span className="opacity-80">{opt.desc}</span>}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.densityNote}</p>
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.findingTypeLabel}</label>
        <div className="grid grid-cols-2 gap-2">
          {c.findingTypes.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFindingType(opt.key)}
              className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${findingType === opt.key ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {findingType === 'mass' && (
        <Card className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.massShapeLabel}</label>
            <OptionButtons options={c.massShapeOptions} value={massShape} onChange={setMassShape} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.massMarginLabel}</label>
            <OptionButtons options={c.massMarginOptions} value={massMargin} onChange={setMassMargin} />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.massMarginDbtNote}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.massDensityLabel}</label>
            <OptionButtons options={c.massDensityOptions} value={massDensity} onChange={setMassDensity} />
          </div>
        </Card>
      )}

      {findingType === 'calc' && (
        <Card className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.calcMorphLabel}</label>
            <OptionButtons options={c.calcMorphOptions} value={calcMorph} onChange={setCalcMorph} />
            {calcMorph === 'amorphous' && <InfoBox tone="amber">{c.calcAmorphousCaveat}</InfoBox>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.calcDistLabel}</label>
            <OptionButtons options={c.calcDistOptions} value={calcDist} onChange={setCalcDist} />
          </div>
        </Card>
      )}

      {findingType === 'distortion' && (
        <Card className="space-y-3">
          <InfoBox tone="slate">{c.distortionInfo}</InfoBox>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{c.distortionDiffNote}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{c.distortionMassNote}</p>
          <InfoBox tone="amber">{c.distortionGuidance}</InfoBox>
        </Card>
      )}

      {findingType === 'asymmetry' && (
        <Card className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.asymmetryTypeLabel}</label>
            <OptionButtons options={c.asymmetryTypes} value={asymType} onChange={setAsymType} />
          </div>
          {asymType === 'focal' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.focalUsCorrelateLabel}</label>
              <div className="flex gap-2">
                <button onClick={() => setFocalUsCorrelate(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${focalUsCorrelate === true ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.focalUsCorrelateYes}</button>
                <button onClick={() => setFocalUsCorrelate(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${focalUsCorrelate === false ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.focalUsCorrelateNo}</button>
              </div>
              {focalUsCorrelate === false && <InfoBox tone="amber">{suggestion?.note}</InfoBox>}
            </div>
          )}
          {asymType === 'global' && <InfoBox tone="amber">{c.globalGuidance}</InfoBox>}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{c.asymmetryRemovedNote}</p>
        </Card>
      )}

      {findingType === 'duct' && (
        <Card className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.ductTypeLabel}</label>
            <OptionButtons options={c.ductTypes} value={ductType} onChange={setDuctType} />
          </div>
          {ductType === 'multiple' && <InfoBox tone="amber">{c.ductMultipleGuidance}</InfoBox>}
          {ductType === 'solitary' && (
            <div className="space-y-2">
              <button
                onClick={() => setDuctStable(!ductStable)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${ductStable ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
              >
                {ductStable ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.ductSolitaryStableLabel}
              </button>
              {ductStable ? (
                <InfoBox tone="emerald">{c.ductSolitarySuggestCat2Note('2')}</InfoBox>
              ) : (
                <InfoBox tone="amber">{c.ductSolitaryGeneralGuidance}</InfoBox>
              )}
            </div>
          )}
        </Card>
      )}

      {hasContent && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.assocFeaturesLabel}</label>
          <CheckButtons options={c.assocFeatures} values={assoc} onToggle={toggleAssoc} />
          {assoc.nippleRetraction && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.nippleRetractionVsInversionNote}</p>}
        </Card>
      )}

      <Accordion icon={<IconInfo size={16} />} title={c.categoryRefTitle}>
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {CAT_ORDER.map(k => (
            <p key={k}><span className="font-semibold">BI-RADS {k}:</span> {c.categories[k]}</p>
          ))}
        </div>
      </Accordion>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.finalCategoryLabel}</label>
        {suggestion && <InfoBox tone="amber">{c.suggestedBadge(suggestion.cat)} — {suggestion.note}</InfoBox>}
        <div className="space-y-2">
          {c.finalCategoryOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFinalCategory(opt.key)}
              className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-center ${finalCategory === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'} ${suggestion && suggestion.cat === opt.key ? 'ring-2 ring-amber-400' : ''}`}
            >
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.biradsMammo} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {finalCategory && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className={`text-3xl font-black block mt-1 leading-tight ${catColor(finalCategory)}`}>BI-RADS {finalCategory}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.management[managementGroup(finalCategory)]}</p>
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

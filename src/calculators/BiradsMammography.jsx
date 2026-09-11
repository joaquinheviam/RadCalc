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

// Mass suggestion logic: shape + margin + density. Each candidate rule carries a
// priority (higher wins when more than one matches) and a type ('A' = the combination
// literally matches a numbered textual example in the ACR/Radiology Assistant source;
// 'B' = a reasonable generalization of the lexicon's qualitative language, with no
// exact textual numbered example for that specific combination). Priority order per
// spec: spiculated+high+irregular > spiculated alone > indistinct > obscured >
// circumscribed+irregular > circumscribed+benign shape > fat.
function computeMammoMassSuggestion(shape, margin, density, c) {
  const benignShape = shape === 'oval' || shape === 'round' || shape === 'lobulated';
  const fatShapeOk = shape == null || benignShape;
  const candidates = [];

  if (margin === 'spiculated' && density === 'high' && shape === 'irregular') {
    candidates.push({ priority: 7, cat: '5', type: 'A', note: c.massSuggestSpiculatedHighIrregular('5') });
  }
  if (margin === 'spiculated' && !(density === 'high' && shape === 'irregular')) {
    candidates.push({ priority: 6, cat: '4C', type: 'B', note: c.massSuggestSpiculatedOther('4C') });
  }
  if (margin === 'indistinct') {
    candidates.push({ priority: 5, cat: '4', type: 'B', note: c.massSuggestIndistinct('4') });
  }
  if (margin === 'obscured') {
    candidates.push({ priority: 4, cat: '0', type: 'A', note: c.massSuggestObscured('0') });
  }
  if (margin === 'circumscribed' && shape === 'irregular') {
    candidates.push({ priority: 3, cat: '4', type: 'B', note: c.massSuggestCircumscribedIrregular('4') });
  }
  if (margin === 'circumscribed' && benignShape) {
    let note = c.massSuggestCircumscribedBenign('3');
    if (shape === 'lobulated') note += ' ' + c.massSuggestCircumscribedLobulatedNote;
    candidates.push({ priority: 2, cat: '3', type: 'A', note });
  }
  if (density === 'fat' && fatShapeOk && margin !== 'indistinct' && margin !== 'spiculated') {
    candidates.push({ priority: 1, cat: '2', type: 'A', note: c.massSuggestFat('2') });
  }

  let top = candidates.length ? candidates.reduce((a, b) => (b.priority > a.priority ? b : a)) : null;
  if (!top && density === 'high') {
    top = { cat: '4', type: 'B', note: c.massSuggestHighFloor('4') };
  }
  if (!top) return null;

  let atypicalNote = null;
  if (density === 'fat' && (margin === 'indistinct' || margin === 'spiculated')) {
    const marginLabel = c.massMarginOptions.find(o => o.key === margin)?.label || margin;
    atypicalNote = c.massSuggestFatAtypicalNote(marginLabel);
  }

  return { cat: top.cat, type: top.type, note: top.note, atypicalNote };
}

function SuggestionNote({ suggestion, c, tone = 'amber' }) {
  if (!suggestion) return null;
  const typeLabel = suggestion.type === 'A' ? c.suggestionTypeA : c.suggestionTypeB;
  return (
    <InfoBox tone={tone}>
      {c.suggestedBadge(suggestion.cat)} — {typeLabel}: {suggestion.note}
      {suggestion.atypicalNote ? (<><br />{suggestion.atypicalNote}</>) : null}
    </InfoBox>
  );
}

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
  const [globalStable, setGlobalStable] = useState(null); // true | false | null

  const [ductType, setDuctType] = useState(null);
  const [ductStable, setDuctStable] = useState(false);
  const [ductMultipleExpected, setDuctMultipleExpected] = useState(null); // true | false | null

  const [assoc, setAssoc] = useState({});
  const toggleAssoc = (key) => setAssoc(prev => ({ ...prev, [key]: !prev[key] }));

  const [finalCategory, setFinalCategory] = useState(null);

  let suggestion = null; // { cat, type: 'A'|'B', note, atypicalNote? }
  if (findingType === 'mass') {
    suggestion = computeMammoMassSuggestion(massShape, massMargin, massDensity, c);
  } else if (findingType === 'calc' && calcMorph) {
    if (calcMorph === 'benign') suggestion = { cat: '2', type: 'A', note: c.calcSuggestBenignNote('2') };
    else if (calcMorph === 'fineLinear' && calcDist === 'segmental') suggestion = { cat: '5', type: 'A', note: c.calcSuggestSegmentalNote('5') };
    else if (['amorphous', 'coarseHet', 'finePleo'].includes(calcMorph)) suggestion = { cat: '4B', type: 'A', note: c.calcSuggest4BNote('4B') };
    else if (calcMorph === 'fineLinear') suggestion = { cat: '4C', type: 'A', note: c.calcSuggest4CNote('4C') };
  } else if (findingType === 'distortion') {
    suggestion = { cat: '4', type: 'B', note: c.distortionSuggestCat4Note('4') };
  } else if (findingType === 'asymmetry') {
    if (asymType === 'focal' && focalUsCorrelate === false) {
      suggestion = { cat: '3', type: 'A', note: c.focalSuggestCat3Note('3') };
    } else if (asymType === 'global' && globalStable === true) {
      suggestion = { cat: '2', type: 'B', note: c.asymmetryGlobalSuggestCat2Note('2') };
    }
  } else if (findingType === 'duct') {
    if (ductType === 'solitary' && ductStable) {
      suggestion = { cat: '2', type: 'A', note: c.ductSolitarySuggestCat2Note('2') };
    } else if (ductType === 'multiple' && ductMultipleExpected === true) {
      suggestion = { cat: '2', type: 'B', note: c.ductMultipleSuggestCat2Note('2') };
    }
  }

  const hasContent = !!findingType;

  const resetAll = () => {
    setDensity(null); setFindingType(null);
    setMassShape(null); setMassMargin(null); setMassDensity(null);
    setCalcMorph(null); setCalcDist(null);
    setAsymType(null); setFocalUsCorrelate(null); setGlobalStable(null);
    setDuctType(null); setDuctStable(false); setDuctMultipleExpected(null);
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
      if (asymType === 'global' && globalStable !== null) parts.push(globalStable ? t.common.yes : t.common.no);
    } else if (findingType === 'duct') {
      if (ductType) parts.push(c.ductTypes.find(o => o.key === ductType)?.label);
      if (ductType === 'solitary' && ductStable) parts.push(c.ductSolitaryStableLabel);
      if (ductType === 'multiple' && ductMultipleExpected !== null) parts.push(ductMultipleExpected ? t.common.yes : t.common.no);
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
          <SuggestionNote suggestion={suggestion} c={c} />
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
          <SuggestionNote suggestion={suggestion} c={c} />
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
              {focalUsCorrelate === false && <SuggestionNote suggestion={suggestion} c={c} />}
            </div>
          )}
          {asymType === 'global' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.asymmetryGlobalStableLabel}</label>
              <div className="flex gap-2 mb-2">
                <button onClick={() => setGlobalStable(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${globalStable === true ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
                <button onClick={() => setGlobalStable(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${globalStable === false ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
              </div>
              <InfoBox tone="amber">{c.globalGuidance}</InfoBox>
              {globalStable === true && <SuggestionNote suggestion={suggestion} c={c} />}
            </div>
          )}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{c.asymmetryRemovedNote}</p>
        </Card>
      )}

      {findingType === 'duct' && (
        <Card className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.ductTypeLabel}</label>
            <OptionButtons options={c.ductTypes} value={ductType} onChange={setDuctType} />
          </div>
          {ductType === 'multiple' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.ductMultipleExpectedLabel}</label>
              <div className="flex gap-2 mb-2">
                <button onClick={() => setDuctMultipleExpected(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${ductMultipleExpected === true ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
                <button onClick={() => setDuctMultipleExpected(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${ductMultipleExpected === false ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
              </div>
              <InfoBox tone="amber">{c.ductMultipleGuidance}</InfoBox>
              {ductMultipleExpected === true && <SuggestionNote suggestion={suggestion} c={c} />}
            </div>
          )}
          {ductType === 'solitary' && (
            <div className="space-y-2">
              <button
                onClick={() => setDuctStable(!ductStable)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${ductStable ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
              >
                {ductStable ? <IconCheckCircle size={16} /> : <span className="w-4" />} {c.ductSolitaryStableLabel}
              </button>
              {ductStable ? (
                <SuggestionNote suggestion={suggestion} c={c} tone="emerald" />
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
        <SuggestionNote suggestion={suggestion} c={c} />
        <div className="space-y-2">
          {c.finalCategoryOptions.map(opt => {
            const ring = suggestion && (suggestion.cat === opt.key || (suggestion.cat === '4' && ['4A', '4B', '4C'].includes(opt.key)));
            return (
              <button
                key={opt.key}
                onClick={() => setFinalCategory(opt.key)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-center ${finalCategory === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'} ${ring ? 'ring-2 ring-amber-400' : ''}`}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
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

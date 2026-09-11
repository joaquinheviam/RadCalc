import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle, IconInfo } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, Accordion, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

// See BiradsMammography.jsx for the design rationale: BI-RADS assessment is a
// radiologist gestalt synthesis, not a deterministic algorithm, so this component
// never computes a final category. It only surfaces a "suggested category" badge at
// the handful of points where the literature gives an explicit, citable rule.

const CAT_ORDER = ['0', '1', '2', '3', '4A', '4B', '4C', '5', '6'];

const catColor = (cat) => {
  if (!cat) return '';
  if (cat === '1' || cat === '2') return 'text-emerald-500';
  if (cat === '3') return 'text-amber-500';
  if (cat === '0') return 'text-slate-400';
  if (cat === '6') return 'text-slate-500';
  return 'text-red-500';
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
          <span className="font-medium">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function BiradsUltrasound() {
  const { t } = useLang();
  const c = t.calc.biradsUs;

  const [composition, setComposition] = useState(null);
  const [gtc, setGtc] = useState(null);
  const [findingType, setFindingType] = useState(null);

  // Mass
  const [shape, setShape] = useState(null);
  const [margin, setMargin] = useState(null);
  const [orientation, setOrientation] = useState(null);
  const [echo, setEcho] = useState(null);
  const [posterior, setPosterior] = useState(null);

  // Non-mass
  const [nonMassDist, setNonMassDist] = useState(null);
  const [nonMassAssoc, setNonMassAssoc] = useState({});
  const toggleNonMassAssoc = (key) => setNonMassAssoc(prev => ({ ...prev, [key]: !prev[key] }));

  // Special case
  const [specialCase, setSpecialCase] = useState(null);
  const [microcystsAbnormal, setMicrocystsAbnormal] = useState(null); // true/false
  const [complicatedCystConfirmed, setComplicatedCystConfirmed] = useState(null);
  const [fatNecrosisConfirmed, setFatNecrosisConfirmed] = useState(null);
  const [nodeNormal, setNodeNormal] = useState(null);

  // Associated features
  const [pseudocapsule, setPseudocapsule] = useState(false);
  const [echogenicRind, setEchogenicRind] = useState(false);
  const [edema, setEdema] = useState(null); // null | 'unilateral' | 'bilateral'
  const [skinChange, setSkinChange] = useState(false);
  const [vascularity, setVascularity] = useState(null);

  const [finalCategory, setFinalCategory] = useState(null);

  let suggestion = null; // { cat, note }
  if (findingType === 'special' && specialCase) {
    if (specialCase === 'simpleCyst') suggestion = { cat: '2', note: null };
    else if (specialCase === 'clusteredMicrocysts') {
      if (microcystsAbnormal === true) suggestion = { cat: '4', note: c.microcystsSuggest4('4') };
      else if (microcystsAbnormal === false) suggestion = { cat: '2', note: c.microcystsSuggest2('2') };
    } else if (specialCase === 'complicatedCyst' && complicatedCystConfirmed === true) {
      suggestion = { cat: '2', note: c.complicatedCystSuggest2('2') };
    } else if (specialCase === 'fatNecrosis' && fatNecrosisConfirmed === true) {
      suggestion = { cat: '2', note: c.fatNecrosisSuggest2('2') };
    } else if ((specialCase === 'intramammaryNode' || specialCase === 'axillaryNode') && nodeNormal !== null) {
      suggestion = nodeNormal ? { cat: '2', note: c.nodeSuggest2('2') } : { cat: '4', note: c.nodeSuggest4('4') };
    }
  }

  const hasContent = !!findingType;

  const resetAll = () => {
    setComposition(null); setGtc(null); setFindingType(null);
    setShape(null); setMargin(null); setOrientation(null); setEcho(null); setPosterior(null);
    setNonMassDist(null); setNonMassAssoc({});
    setSpecialCase(null); setMicrocystsAbnormal(null); setComplicatedCystConfirmed(null); setFatNecrosisConfirmed(null); setNodeNormal(null);
    setPseudocapsule(false); setEchogenicRind(false); setEdema(null); setSkinChange(false); setVascularity(null);
    setFinalCategory(null);
  };

  const findingLabel = () => {
    const ft = c.findingTypes.find(f => f.key === findingType);
    if (!ft) return '';
    const parts = [ft.label];
    if (findingType === 'mass') {
      if (shape) parts.push(c.massShapeOptions.find(o => o.key === shape)?.label);
      if (margin) parts.push(c.massMarginOptions.find(o => o.key === margin)?.label);
      if (orientation) parts.push(c.orientationOptions.find(o => o.key === orientation)?.label);
      if (echo) parts.push(c.echoOptions.find(o => o.key === echo)?.label);
      if (posterior && posterior !== 'none') parts.push(c.posteriorOptions.find(o => o.key === posterior)?.label);
    } else if (findingType === 'nonmass') {
      if (nonMassDist) parts.push(c.nonMassDistOptions.find(o => o.key === nonMassDist)?.label);
      const feats = c.nonMassAssoc.filter(a => nonMassAssoc[a.key]).map(a => a.label);
      if (feats.length) parts.push(feats.join(', '));
    } else if (findingType === 'special') {
      if (specialCase) parts.push(c.specialOptions.find(o => o.key === specialCase)?.label);
    }
    return parts.filter(Boolean).join(' — ');
  };

  const assocLabelsList = () => {
    const list = [];
    if (pseudocapsule) list.push(c.pseudocapsuleLabel);
    if (echogenicRind) list.push(c.echogenicRindLabel);
    if (edema) list.push(`${c.edemaLabel} (${edema === 'unilateral' ? c.edemaUnilateral : c.edemaBilateral})`);
    if (skinChange) list.push(c.skinChangeLabel);
    if (vascularity) list.push(c.vascularityOptions.find(o => o.key === vascularity)?.label);
    return list;
  };

  const handleCopy = () => {
    if (!finalCategory) return;
    const compositionLabel = composition ? c.compositionOptions.find(o => o.key === composition)?.label : '';
    const finding = findingLabel();
    const assocText = assocLabelsList().length ? assocLabelsList().join(', ') : t.common.none;
    const catDesc = c.categories[finalCategory];
    const categoryLine = `BI-RADS ${finalCategory} — ${catDesc}`;
    const managementLine = c.management[managementGroup(finalCategory)];
    const text = c.reportText(compositionLabel, finding, assocText, categoryLine, managementLine);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${finalCategory ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.compositionLabel}</label>
        <OptionButtons options={c.compositionOptions} value={composition} onChange={setComposition} />
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.gtcLabel}</label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-snug">{c.gtcNote}</p>
        <div className="grid grid-cols-2 gap-2">
          {c.gtcOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setGtc(gtc === opt.key ? null : opt.key)}
              className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${gtc === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.findingTypeLabel}</label>
        <div className="grid grid-cols-1 gap-2">
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
          <InfoBox tone="slate">{c.massDefinition}</InfoBox>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.massShapeLabel}</label>
            <OptionButtons options={c.massShapeOptions} value={shape} onChange={setShape} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.massMarginLabel}</label>
            <OptionButtons options={c.massMarginOptions} value={margin} onChange={setMargin} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.orientationLabel}</label>
            <OptionButtons options={c.orientationOptions} value={orientation} onChange={setOrientation} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.echoLabel}</label>
            <OptionButtons options={c.echoOptions} value={echo} onChange={setEcho} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.posteriorLabel}</label>
            <OptionButtons options={c.posteriorOptions} value={posterior} onChange={setPosterior} />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.posteriorCombinedRemovedNote}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">{c.posteriorRefractiveNote}</p>
          </div>
        </Card>
      )}

      {findingType === 'nonmass' && (
        <Card className="space-y-4">
          <InfoBox tone="slate">{c.nonMassDefinition}</InfoBox>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.nonMassDistLabel}</label>
            <OptionButtons options={c.nonMassDistOptions} value={nonMassDist} onChange={setNonMassDist} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.nonMassAssocLabel}</label>
            <CheckButtons options={c.nonMassAssoc} values={nonMassAssoc} onToggle={toggleNonMassAssoc} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{c.nonMassClinicalNote}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{c.nonMassHistoNote}</p>
          <InfoBox tone="amber">{c.nonMassGuidance}</InfoBox>
        </Card>
      )}

      {findingType === 'special' && (
        <Card className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.specialLabel}</label>
            <OptionButtons options={c.specialOptions} value={specialCase} onChange={setSpecialCase} />
          </div>

          {specialCase === 'clusteredMicrocysts' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.microcystsToggleLabel}</label>
              <div className="flex gap-2">
                <button onClick={() => setMicrocystsAbnormal(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${microcystsAbnormal === true ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
                <button onClick={() => setMicrocystsAbnormal(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${microcystsAbnormal === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
              </div>
            </div>
          )}

          {specialCase === 'complicatedCyst' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.complicatedCystToggleLabel}</label>
              <div className="flex gap-2">
                <button onClick={() => setComplicatedCystConfirmed(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${complicatedCystConfirmed === true ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
                <button onClick={() => setComplicatedCystConfirmed(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${complicatedCystConfirmed === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
              </div>
              {complicatedCystConfirmed === false && <InfoBox tone="amber">{c.complicatedCystIndeterminate}</InfoBox>}
            </div>
          )}

          {specialCase === 'fatNecrosis' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.fatNecrosisToggleLabel}</label>
              <div className="flex gap-2">
                <button onClick={() => setFatNecrosisConfirmed(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${fatNecrosisConfirmed === true ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
                <button onClick={() => setFatNecrosisConfirmed(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${fatNecrosisConfirmed === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
              </div>
              {fatNecrosisConfirmed === false && <InfoBox tone="amber">{c.fatNecrosisIndeterminate}</InfoBox>}
            </div>
          )}

          {specialCase === 'skinMass' && <InfoBox tone="amber">{c.skinMassGuidance}</InfoBox>}

          {(specialCase === 'intramammaryNode' || specialCase === 'axillaryNode') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.nodeNormalToggleLabel}</label>
              <div className="flex gap-2">
                <button onClick={() => setNodeNormal(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${nodeNormal === true ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
                <button onClick={() => setNodeNormal(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm ${nodeNormal === false ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
              </div>
            </div>
          )}
        </Card>
      )}

      {hasContent && (
        <Card className="space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.assocFeaturesLabel}</label>
          <div>
            <button onClick={() => setPseudocapsule(!pseudocapsule)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start gap-2 ${pseudocapsule ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {pseudocapsule ? <IconCheckCircle size={16} className="mt-0.5 shrink-0" /> : <span className="w-4 shrink-0" />}
              <span><span className="font-medium block">{c.pseudocapsuleLabel}</span><span className="text-xs opacity-80">{c.pseudocapsuleDesc}</span></span>
            </button>
            {pseudocapsule && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.pseudocapsuleGuidance}</p>}
          </div>
          <div>
            <button onClick={() => setEchogenicRind(!echogenicRind)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start gap-2 ${echogenicRind ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {echogenicRind ? <IconCheckCircle size={16} className="mt-0.5 shrink-0" /> : <span className="w-4 shrink-0" />}
              <span><span className="font-medium block">{c.echogenicRindLabel}</span><span className="text-xs opacity-80">{c.echogenicRindDesc}</span></span>
            </button>
          </div>
          <div>
            <button onClick={() => setSkinChange(!skinChange)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start gap-2 ${skinChange ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {skinChange ? <IconCheckCircle size={16} className="mt-0.5 shrink-0" /> : <span className="w-4 shrink-0" />}
              <span><span className="font-medium block">{c.skinChangeLabel}</span><span className="text-xs opacity-80">{c.skinChangeDesc}</span></span>
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{c.edemaLabel}</label>
            <div className="flex gap-2 mb-1">
              {['unilateral', 'bilateral'].map(k => (
                <button key={k} onClick={() => setEdema(edema === k ? null : k)} className={`flex-1 py-2 rounded-lg font-medium border text-xs ${edema === k ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {k === 'unilateral' ? c.edemaUnilateral : c.edemaBilateral}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{c.edemaDesc}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{c.vascularityLabel}</label>
            <OptionButtons options={c.vascularityOptions} value={vascularity} onChange={setVascularity} />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.vascularityNote}</p>
          </div>
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
        {suggestion && (suggestion.note ? <InfoBox tone="amber">{c.suggestedBadge(suggestion.cat)} — {suggestion.note}</InfoBox> : <InfoBox tone="amber">{c.suggestedBadge(suggestion.cat)}</InfoBox>)}
        <div className="space-y-2">
          {c.finalCategoryOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFinalCategory(opt.key)}
              className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-center ${finalCategory === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'} ${suggestion && (suggestion.cat === opt.key || (suggestion.cat === '4' && ['4A', '4B', '4C'].includes(opt.key))) ? 'ring-2 ring-amber-400' : ''}`}
            >
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.biradsUs} />
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

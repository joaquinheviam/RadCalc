import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink } from '../components/shared/index.js';

function computeLiRads(size, aphe, feats) {
  // size: 1 (<10mm) | 2 (10-19mm) | 3 (>=20mm)
  const featCount = Object.values(feats).filter(Boolean).length;
  if (!aphe) {
    if (size === 3) return featCount >= 1 ? 'LR-4' : 'LR-3';
    return featCount >= 2 ? 'LR-4' : 'LR-3';
  }
  // APHE presente
  if (size === 1) return featCount >= 1 ? 'LR-4' : 'LR-3';
  if (size === 2) {
    // Celda diagonal de la tabla oficial CT/MRI LI-RADS v2018 CORE (10-19 mm + APHE):
    // 0 características = LR-3; con exactamente 1 característica, la cápsula realzante
    // por sí sola solo alcanza LR-4, mientras que el lavado no periférico o el crecimiento
    // umbral por sí solos ya son LR-5; ≥2 características = LR-5.
    if (featCount === 0) return 'LR-3';
    if (featCount === 1) return feats.capsule ? 'LR-4' : 'LR-5';
    return 'LR-5';
  }
  return featCount >= 1 ? 'LR-5' : 'LR-4';
}

function adjustLiRadsForAF(baseCat, hasMalignantAF, hasBenignAF) {
  const order = ['LR-1', 'LR-2', 'LR-3', 'LR-4', 'LR-5'];
  const idx = order.indexOf(baseCat);
  if (idx === -1) return baseCat;
  if (hasMalignantAF && hasBenignAF) return baseCat;
  if (hasMalignantAF) {
    if (baseCat === 'LR-5') return baseCat;
    const capIdx = order.indexOf('LR-4');
    return order[Math.min(idx + 1, capIdx)];
  }
  if (hasBenignAF) return order[Math.max(idx - 1, 0)];
  return baseCat;
}

export default function LIRADS() {
  const { t, lang } = useLang();
  const c = t.calc.lirads;
  const [size, setSize] = useState(0);
  const [aphe, setAphe] = useState(null);
  const [feats, setFeats] = useState({ washout: false, capsule: false, growth: false });
  const [lrM, setLrM] = useState(null);
  const [lrTiv, setLrTiv] = useState(null);
  const [lrTivCont, setLrTivCont] = useState('');
  const [afMalignant, setAfMalignant] = useState({});
  const [afBenignSel, setAfBenignSel] = useState({});

  const hasBasics = size > 0 && aphe !== null;
  const baseCat = hasBasics ? computeLiRads(size, aphe, feats) : null;
  // El Paso 2 (características auxiliares) solo aplica a la vía numérica (LR-1 a LR-5),
  // nunca cuando la categoría final ya quedó fijada por LR-TIV o LR-M.
  const showAfStep = hasBasics && lrTiv === false && lrM === false;
  const hasMalignantAF = showAfStep && Object.values(afMalignant).some(Boolean);
  const hasBenignAF = showAfStep && Object.values(afBenignSel).some(Boolean);
  const adjustedCat = showAfStep ? adjustLiRadsForAF(baseCat, hasMalignantAF, hasBenignAF) : baseCat;
  const finalCat = lrTiv ? 'LR-TIV' : (lrM ? 'LR-M' : adjustedCat);
  const afApplied = hasMalignantAF || hasBenignAF;
  const afNote = !afApplied ? null
    : (hasMalignantAF && hasBenignAF) ? c.afConflictNote
    : hasMalignantAF ? (adjustedCat !== baseCat ? c.afUpgradedTo(baseCat, adjustedCat) : c.afCappedNote(baseCat))
    : (adjustedCat !== baseCat ? c.afDowngradedTo(baseCat, adjustedCat) : null);

  const toggleFeat = (key) => setFeats(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAfMal = (key) => setAfMalignant(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAfBen = (key) => setAfBenignSel(prev => ({ ...prev, [key]: !prev[key] }));

  const handleCopy = () => {
    if (!finalCat) return;
    const sizeLabel = size === 1 ? c.size1 : size === 2 ? c.size2 : c.size3;
    const featLabels = Object.entries(feats).filter(([,v]) => v).map(([k]) => k === 'washout' ? c.featWashout : k === 'capsule' ? c.featCapsule : c.featGrowth);
    const override = lrTiv ? c.lrTiv : (lrM ? c.lrM : '');
    const contPhrase = (lrTiv && lrTivCont) ? c.lrTivContinuity[lrTivCont] : '';
    const catLabel = `${finalCat} — ${c.categories[finalCat]}` + (contPhrase ? ', ' + contPhrase.charAt(0).toLowerCase() + contPhrase.slice(1) : '');
    let afSummary = '';
    if (afApplied) {
      const malLabels = [
        ...c.afMalignantGeneral.map((l, i) => ({ l, k: 'g' + i })),
        ...c.afMalignantHcc.map((l, i) => ({ l, k: 'h' + i })),
      ].filter(x => afMalignant[x.k]).map(x => x.l);
      const benLabels = c.afBenign.map((l, i) => ({ l, k: 'b' + i })).filter(x => afBenignSel[x.k]).map(x => x.l);
      afSummary = c.afSummaryText(baseCat, malLabels.length ? malLabels.join(', ') : t.common.none, benLabels.length ? benLabels.join(', ') : t.common.none);
    }
    const text = c.reportText(sizeLabel, aphe ? t.common.yes : t.common.no, featLabels.length ? featLabels.join(', ') : t.common.none, override, catLabel, afSummary);
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => {
    setSize(0); setAphe(null); setFeats({ washout: false, capsule: false, growth: false });
    setLrM(null); setLrTiv(null); setLrTivCont(''); setAfMalignant({}); setAfBenignSel({});
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${finalCat ? 'pb-56' : ''}`}>
      <Card>
        <InfoBox tone="amber">{c.lrTiv}</InfoBox>
        <div className="flex gap-2">
          <button onClick={() => setLrTiv(true)} className={`flex-1 py-2 rounded-lg font-medium border ${lrTiv === true ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
          <button onClick={() => setLrTiv(false)} className={`flex-1 py-2 rounded-lg font-medium border ${lrTiv === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
        </div>
      </Card>
      {lrTiv === true && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.lrTivContinuityLabel}</label>
          <div className="space-y-2">
            {Object.entries(c.lrTivContinuity).map(([key, label]) => (
              <button key={key} onClick={() => setLrTivCont(key)} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${lrTivCont === key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{label}</button>
            ))}
          </div>
        </Card>
      )}
      {lrTiv === false && (
        <Card>
          <InfoBox tone="amber">{c.lrM}</InfoBox>
          <div className="flex gap-2">
            <button onClick={() => setLrM(true)} className={`flex-1 py-2 rounded-lg font-medium border ${lrM === true ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
            <button onClick={() => setLrM(false)} className={`flex-1 py-2 rounded-lg font-medium border ${lrM === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
          </div>
        </Card>
      )}
      {lrTiv === false && lrM === false && (
        <Card className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.sizeLabel}</label>
            <div className="flex gap-2">
              {[[1,c.size1],[2,c.size2],[3,c.size3]].map(([val,label]) => (
                <button key={val} onClick={() => setSize(val)} className={`flex-1 py-2 text-sm rounded-lg font-medium border ${size === val ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.apheLabel}</label>
            <div className="flex gap-2">
              <button onClick={() => setAphe(true)} className={`flex-1 py-2 rounded-lg font-medium border ${aphe === true ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.yes}</button>
              <button onClick={() => setAphe(false)} className={`flex-1 py-2 rounded-lg font-medium border ${aphe === false ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{t.common.no}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.featuresLabel}</label>
            <div className="space-y-2">
              {[['washout', c.featWashout],['capsule', c.featCapsule],['growth', c.featGrowth]].map(([key, label]) => (
                <button key={key} onClick={() => toggleFeat(key)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${feats[key] ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {feats[key] ? <IconCheckCircle size={16} /> : <span className="w-4" />} {label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
      {showAfStep && (
        <Card className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{c.afSectionTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.afIntro}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.afMalignantGeneralTitle}</label>
            <div className="space-y-2">
              {c.afMalignantGeneral.map((label, i) => {
                const key = 'g' + i;
                return (
                  <button key={key} onClick={() => toggleAfMal(key)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${afMalignant[key] ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                    {afMalignant[key] ? <IconCheckCircle size={16} /> : <span className="w-4" />} {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.afMalignantHccTitle}</label>
            <div className="space-y-2">
              {c.afMalignantHcc.map((label, i) => {
                const key = 'h' + i;
                return (
                  <button key={key} onClick={() => toggleAfMal(key)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${afMalignant[key] ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                    {afMalignant[key] ? <IconCheckCircle size={16} /> : <span className="w-4" />} {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.afBenignTitle}</label>
            <div className="space-y-2">
              {c.afBenign.map((label, i) => {
                const key = 'b' + i;
                return (
                  <button key={key} onClick={() => toggleAfBen(key)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${afBenignSel[key] ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                    {afBenignSel[key] ? <IconCheckCircle size={16} /> : <span className="w-4" />} {label}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">{c.afRuleNote}</p>
        </Card>
      )}
      {finalCat && lrTiv && lrTivCont && (
        <InfoBox tone={lrTivCont === 'unspecified' ? 'amber' : 'emerald'}>{c.lrTivContinuity[lrTivCont]}</InfoBox>
      )}
      {finalCat && afNote && (
        <InfoBox tone="amber">{afNote}</InfoBox>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.lirads} />
      <ReportBugLink calcTitle={c.title} />
      {finalCat && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className={`text-4xl font-black block ${finalCat === 'LR-5' || finalCat === 'LR-M' || finalCat === 'LR-TIV' ? 'text-red-500' : finalCat === 'LR-4' ? 'text-orange-500' : finalCat === 'LR-3' ? 'text-amber-500' : 'text-emerald-500'}`}>{finalCat}</span>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug mt-1">{c.categories[finalCat]}</p>
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

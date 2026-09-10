import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-sm font-medium transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange, yesLabel, noLabel }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <button onClick={() => onChange(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === true ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{yesLabel}</button>
        <button onClick={() => onChange(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{noLabel}</button>
      </div>
    </div>
  );
}

// Árbol de diagnóstico diferencial transcrito directamente de la Figura 2 de
// Taylor et al., "Multimodality Imaging Approach to Ovarian Neoplasms with
// Pathologic Correlation," RadioGraphics 2021;41(1):289-315. Lógica de
// clasificación: responsabilidad exclusiva del código, no delegada.
//
// Devuelve la lista de claves de diagnóstico (dx*) correspondiente al estado
// actual del árbol, o [] si aún faltan respuestas para llegar a un nodo
// terminal.
function buildDifferential(s) {
  if (s.fat === 'coarse') return ['dxMatureTeratoma'];
  if (s.fat === 'irregular') return ['dxImmatureTeratoma'];
  if (s.fat !== 'none') return [];

  if (s.t2Solid === true) return ['dxBrennerFibromaGroup'];
  if (s.t2Solid !== false) return [];

  if (s.age === 'under30') {
    return ['dxJuvenileGranulosa', 'dxDysgerminoma', 'dxChoriocarcinoma', 'dxYolkSac', 'dxEmbryonalCarcinoma'];
  }
  if (s.age !== 'over30') return [];

  if (s.proportion === 'solidCystic') {
    if (s.laterality === 'unilateral') return ['dxEndometrioidClearCell'];
    if (s.laterality === 'bilateral') return ['dxAdultGranulosaBilateral', 'dxMucinousNeoplasm', 'dxSerousBorderlineHGSC', 'dxMetastasisGI'];
    return [];
  }
  if (s.proportion === 'mostlySolid') {
    if (s.laterality === 'unilateral') return ['dxMucinousAdenocarcinoma', 'dxAdultGranulosaSolid', 'dxSertoliLeydig'];
    if (s.laterality === 'bilateral') return ['dxMetastasisSolidBilateral', 'dxHGSCBilateral', 'dxOvarianLymphoma'];
    return [];
  }
  if (s.proportion === 'mostlyCystic') {
    if (s.unilocular === 'unilocular') {
      if (s.wallSeptic === false) return ['dxSerousCystadenoma'];
      if (s.wallSeptic === true) return ['dxSerousBorderlineUnilocular'];
      return [];
    }
    if (s.unilocular === 'multilocular') {
      if (s.multiLaterality === 'unilateral') {
        if (s.cystContent === 'variable') return ['dxMucinousMultilocular'];
        if (s.cystContent === 'homogeneous') return ['dxSerousCystadenomaMultilocular'];
        return [];
      }
      if (s.multiLaterality === 'bilateral') return ['dxSerousBorderlineBilateralMultilocular', 'dxMetastasisCysticBilateral'];
      return [];
    }
    return [];
  }
  return [];
}

export default function OvarianNeoplasmDx() {
  const { t } = useLang();
  const c = t.calc.ovarianNeoplasmDx;

  const [fat, setFat] = useState(null); // 'coarse' | 'irregular' | 'none'
  const [t2Solid, setT2Solid] = useState(null); // bool
  const [age, setAge] = useState(null); // 'under30' | 'over30'
  const [proportion, setProportion] = useState(null); // 'solidCystic' | 'mostlySolid' | 'mostlyCystic'
  const [laterality, setLaterality] = useState(null); // 'unilateral' | 'bilateral' (solidCystic / mostlySolid branches)
  const [unilocular, setUnilocular] = useState(null); // 'unilocular' | 'multilocular' (mostlyCystic branch)
  const [wallSeptic, setWallSeptic] = useState(null); // bool (unilocular branch)
  const [multiLaterality, setMultiLaterality] = useState(null); // 'unilateral' | 'bilateral' (multilocular branch)
  const [cystContent, setCystContent] = useState(null); // 'variable' | 'homogeneous' (multilocular unilateral branch)

  const state = { fat, t2Solid, age, proportion, laterality, unilocular, wallSeptic, multiLaterality, cystContent };
  const differential = fat ? buildDifferential(state) : [];

  const DX_TITLE = {
    dxMatureTeratoma: c.dxMatureTeratomaTitle, dxImmatureTeratoma: c.dxImmatureTeratomaTitle,
    dxBrennerFibromaGroup: c.dxBrennerFibromaGroupTitle, dxJuvenileGranulosa: c.dxJuvenileGranulosaTitle,
    dxDysgerminoma: c.dxDysgerminomaTitle, dxChoriocarcinoma: c.dxChoriocarcinomaTitle, dxYolkSac: c.dxYolkSacTitle,
    dxEmbryonalCarcinoma: c.dxEmbryonalCarcinomaTitle, dxEndometrioidClearCell: c.dxEndometrioidClearCellTitle,
    dxAdultGranulosaBilateral: c.dxAdultGranulosaBilateralTitle, dxMucinousNeoplasm: c.dxMucinousNeoplasmTitle,
    dxSerousBorderlineHGSC: c.dxSerousBorderlineHGSCTitle, dxMetastasisGI: c.dxMetastasisGITitle,
    dxMucinousAdenocarcinoma: c.dxMucinousAdenocarcinomaTitle, dxAdultGranulosaSolid: c.dxAdultGranulosaSolidTitle,
    dxSertoliLeydig: c.dxSertoliLeydigTitle, dxMetastasisSolidBilateral: c.dxMetastasisSolidBilateralTitle,
    dxHGSCBilateral: c.dxHGSCBilateralTitle, dxOvarianLymphoma: c.dxOvarianLymphomaTitle,
    dxSerousCystadenoma: c.dxSerousCystadenomaTitle, dxSerousBorderlineUnilocular: c.dxSerousBorderlineUnilocularTitle,
    dxMucinousMultilocular: c.dxMucinousMultilocularTitle, dxSerousCystadenomaMultilocular: c.dxSerousCystadenomaMultilocularTitle,
    dxSerousBorderlineBilateralMultilocular: c.dxSerousBorderlineBilateralMultilocularTitle,
    dxMetastasisCysticBilateral: c.dxMetastasisCysticBilateralTitle,
  };
  const DX_DESC = {
    dxMatureTeratoma: c.dxMatureTeratomaDescription, dxImmatureTeratoma: c.dxImmatureTeratomaDescription,
    dxBrennerFibromaGroup: c.dxBrennerFibromaGroupDescription, dxJuvenileGranulosa: c.dxJuvenileGranulosaDescription,
    dxDysgerminoma: c.dxDysgerminomaDescription, dxChoriocarcinoma: c.dxChoriocarcinomaDescription, dxYolkSac: c.dxYolkSacDescription,
    dxEmbryonalCarcinoma: c.dxEmbryonalCarcinomaDescription, dxEndometrioidClearCell: c.dxEndometrioidClearCellDescription,
    dxAdultGranulosaBilateral: c.dxAdultGranulosaBilateralDescription, dxMucinousNeoplasm: c.dxMucinousNeoplasmDescription,
    dxSerousBorderlineHGSC: c.dxSerousBorderlineHGSCDescription, dxMetastasisGI: c.dxMetastasisGIDescription,
    dxMucinousAdenocarcinoma: c.dxMucinousAdenocarcinomaDescription, dxAdultGranulosaSolid: c.dxAdultGranulosaSolidDescription,
    dxSertoliLeydig: c.dxSertoliLeydigDescription, dxMetastasisSolidBilateral: c.dxMetastasisSolidBilateralDescription,
    dxHGSCBilateral: c.dxHGSCBilateralDescription, dxOvarianLymphoma: c.dxOvarianLymphomaDescription,
    dxSerousCystadenoma: c.dxSerousCystadenomaDescription, dxSerousBorderlineUnilocular: c.dxSerousBorderlineUnilocularDescription,
    dxMucinousMultilocular: c.dxMucinousMultilocularDescription, dxSerousCystadenomaMultilocular: c.dxSerousCystadenomaMultilocularDescription,
    dxSerousBorderlineBilateralMultilocular: c.dxSerousBorderlineBilateralMultilocularDescription,
    dxMetastasisCysticBilateral: c.dxMetastasisCysticBilateralDescription,
  };

  const showT2Solid = fat === 'none';
  const showAge = fat === 'none' && t2Solid === false;
  const showProportion = showAge && age === 'over30';
  const showLaterality = showProportion && (proportion === 'solidCystic' || proportion === 'mostlySolid');
  const showUnilocular = showProportion && proportion === 'mostlyCystic';
  const showWallSeptic = showUnilocular && unilocular === 'unilocular';
  const showMultiLaterality = showUnilocular && unilocular === 'multilocular';
  const showCystContent = showMultiLaterality && multiLaterality === 'unilateral';

  const handleCopy = () => {
    const lines = [c.title];
    if (differential.length) {
      differential.forEach(k => lines.push(`- ${DX_TITLE[k]}`));
    }
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  const resetAll = () => {
    setFat(null); setT2Solid(null); setAge(null); setProportion(null); setLaterality(null);
    setUnilocular(null); setWallSeptic(null); setMultiLaterality(null); setCystContent(null);
  };

  const showResult = differential.length > 0;

  return (
    <div className={`space-y-4 animate-in fade-in ${showResult ? 'pb-24' : ''}`}>
      <InfoBox tone="slate">{c.introNote}</InfoBox>

      <Card className="space-y-4">
        <OptionList
          label={c.fatQ}
          options={[
            { key: 'coarse', label: c.fatCalcCoarseLabel },
            { key: 'irregular', label: c.fatCalcIrregularLabel },
            { key: 'none', label: c.fatNoLabel },
          ]}
          value={fat}
          onChange={(v) => { setFat(v); setT2Solid(null); setAge(null); setProportion(null); setLaterality(null); setUnilocular(null); setWallSeptic(null); setMultiLaterality(null); setCystContent(null); }}
        />
      </Card>

      {showT2Solid && (
        <Card className="space-y-4">
          <YesNo label={c.t2SolidQ} value={t2Solid} onChange={(v) => { setT2Solid(v); setAge(null); }} yesLabel={t.common.yes} noLabel={t.common.no} />
        </Card>
      )}

      {showAge && (
        <Card className="space-y-4">
          <OptionList
            label={c.ageQ}
            options={[
              { key: 'under30', label: c.ageUnder30Label },
              { key: 'over30', label: c.ageOver30Label },
            ]}
            value={age}
            onChange={(v) => { setAge(v); setProportion(null); }}
          />
        </Card>
      )}

      {showProportion && (
        <Card className="space-y-4">
          <OptionList
            label={c.proportionQ}
            options={[
              { key: 'solidCystic', label: c.proportionSolidCysticLabel },
              { key: 'mostlySolid', label: c.proportionMostlySolidLabel },
              { key: 'mostlyCystic', label: c.proportionMostlyCysticLabel },
            ]}
            value={proportion}
            onChange={(v) => { setProportion(v); setLaterality(null); setUnilocular(null); setWallSeptic(null); setMultiLaterality(null); setCystContent(null); }}
          />
        </Card>
      )}

      {showLaterality && (
        <Card className="space-y-4">
          <OptionList
            label={c.lateralityQ}
            options={[
              { key: 'unilateral', label: c.lateralityUnilateralLabel },
              { key: 'bilateral', label: c.lateralityBilateralLabel },
            ]}
            value={laterality}
            onChange={setLaterality}
          />
        </Card>
      )}

      {showUnilocular && (
        <Card className="space-y-4">
          <OptionList
            label={c.unilocularQ}
            options={[
              { key: 'unilocular', label: c.unilocularLabel },
              { key: 'multilocular', label: c.multilocularLabel },
            ]}
            value={unilocular}
            onChange={(v) => { setUnilocular(v); setWallSeptic(null); setMultiLaterality(null); setCystContent(null); }}
          />
        </Card>
      )}

      {showWallSeptic && (
        <Card className="space-y-4">
          <YesNo label={c.wallSepticQ} value={wallSeptic} onChange={setWallSeptic} yesLabel={t.common.yes} noLabel={t.common.no} />
        </Card>
      )}

      {showMultiLaterality && (
        <Card className="space-y-4">
          <OptionList
            label={c.lateralityQ}
            options={[
              { key: 'unilateral', label: c.lateralityUnilateralLabel },
              { key: 'bilateral', label: c.lateralityBilateralLabel },
            ]}
            value={multiLaterality}
            onChange={(v) => { setMultiLaterality(v); setCystContent(null); }}
          />
        </Card>
      )}

      {showCystContent && (
        <Card className="space-y-4">
          <OptionList
            label={c.cystContentQ}
            options={[
              { key: 'variable', label: c.cystContentVariableLabel },
              { key: 'homogeneous', label: c.cystContentHomogeneousLabel },
            ]}
            value={cystContent}
            onChange={setCystContent}
          />
        </Card>
      )}

      {differential.length > 0 && (
        <Card className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.stickyLabel}</p>
          <div className="space-y-2">
            {differential.map(k => (
              <div key={k} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{DX_TITLE[k]}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-snug">{DX_DESC[k]}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.ovarianNeoplasmDx} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {showResult && (
        <StickyBar>
          <div className="min-w-0 w-full text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.stickyLabel}</span>
            <span className="text-lg font-black block mt-1 leading-tight text-blue-600 dark:text-blue-400 truncate">
              {differential.length === 1 ? DX_TITLE[differential[0]] : c.stickyMultipleLabel}
            </span>
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

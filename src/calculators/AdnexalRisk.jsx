import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function OptionButtons({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CheckButtons({ options, values, onToggle }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onToggle(opt.key)}
          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2 ${values[opt.key] ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
        >
          {values[opt.key] ? <IconCheckCircle size={15} className="shrink-0 mt-0.5" /> : <span className="w-[15px] shrink-0" />}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

const YES_NO = (value, onChange, yesLabel, noLabel) => (
  <div className="flex gap-2">
    <button onClick={() => onChange('yes')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${value === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{yesLabel}</button>
    <button onClick={() => onChange('no')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${value === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{noLabel}</button>
  </div>
);

export default function AdnexalRisk() {
  const { t } = useLang();
  const c = t.calc.adnexalRisk;

  const [activeTool, setActiveTool] = useState(null); // 'orads' | 'iota' | 'adnex'

  // ---- O-RADS US state ----
  const [mainType, setMainType] = useState(null); // normal | incomplete | classic | cystic | solid
  const [classicOrigin, setClassicOrigin] = useState(null); // ovarian | extraovarian
  const [size, setSize] = useState(null); // small(<10cm) | large(>=10cm)
  const [solidComp, setSolidComp] = useState(null); // yes | no (cystic lesions only)
  const [locules, setLocules] = useState(null); // uni | bi | multi
  const [innerWall, setInnerWall] = useState(null); // smooth | irregular
  const [papillary, setPapillary] = useState(null); // <4 | >=4
  const [contour, setContour] = useState(null); // smooth | irregular (solid lesions)
  const [shadowing, setShadowing] = useState(null);
  const [colorScore, setColorScore] = useState(null); // meaning depends on branch, see below
  const [ascites, setAscites] = useState(null);

  // ---- IOTA Simple Rules state ----
  const [iotaB, setIotaB] = useState({ b1: false, b2: false, b3: false, b4: false, b5: false });
  const [iotaM, setIotaM] = useState({ m1: false, m2: false, m3: false, m4: false, m5: false });

  // ---- IOTA ADNEX state ----
  const [adnexAge, setAdnexAge] = useState('');
  const [adnexCa125, setAdnexCa125] = useState('');
  const [adnexDiameter, setAdnexDiameter] = useState('');
  const [adnexHasSolid, setAdnexHasSolid] = useState(null); // yes | no
  const [adnexSolidDiameter, setAdnexSolidDiameter] = useState('');
  const [adnexLocules10, setAdnexLocules10] = useState(null); // yes | no
  const [adnexPapillary, setAdnexPapillary] = useState(null); // '0'|'1'|'2'|'3'|'4' (4 = >3)
  const [adnexShadows, setAdnexShadows] = useState(null); // yes | no
  const [adnexAscites, setAdnexAscites] = useState(null); // yes | no
  const [adnexCentre, setAdnexCentre] = useState(null); // oncology | other

  const resetAll = () => {
    setActiveTool(null);
    setMainType(null); setClassicOrigin(null); setSize(null); setSolidComp(null);
    setLocules(null); setInnerWall(null); setPapillary(null); setContour(null);
    setShadowing(null); setColorScore(null); setAscites(null);
    setIotaB({ b1: false, b2: false, b3: false, b4: false, b5: false });
    setIotaM({ m1: false, m2: false, m3: false, m4: false, m5: false });
    setAdnexAge(''); setAdnexCa125(''); setAdnexDiameter(''); setAdnexHasSolid(null);
    setAdnexSolidDiameter(''); setAdnexLocules10(null); setAdnexPapillary(null);
    setAdnexShadows(null); setAdnexAscites(null); setAdnexCentre(null);
  };

  const toggleIota = (type, key) => {
    if (type === 'b') setIotaB((prev) => ({ ...prev, [key]: !prev[key] }));
    else setIotaM((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---- O-RADS US decision tree ----
  // Se calcula primero la categoría de base ignorando ascitis/nódulos
  // peritoneales, porque el Fase 1 especifica que esa escalada a O-RADS 5
  // aplica "junto a lesiones O-RADS 3 a 5" — es decir, NO sube una lesión
  // que de otro modo sería O-RADS 1 o 2. Solo al final, si la base ya cae
  // en 3-5 y hay ascitis, se escala a 5.
  const getBaseOradsResult = () => {
    if (!mainType) return null;
    if (mainType === 'normal') return { score: 'O-RADS 1', tone: 'emerald', desc: c.orads1Desc, mgmt: c.orads1Mgmt };
    if (mainType === 'incomplete') return { score: 'O-RADS 0', tone: 'slate', desc: c.orads0Desc, mgmt: c.orads0Mgmt };

    if (mainType === 'classic') {
      if (!classicOrigin) return null;
      if (classicOrigin === 'extraovarian') return { score: 'O-RADS 2', tone: 'emerald', desc: c.orads2Desc, mgmt: c.orads2Mgmt };
      if (!size) return null;
      return size === 'small'
        ? { score: 'O-RADS 2', tone: 'emerald', desc: c.orads2Desc, mgmt: c.orads2Mgmt }
        : { score: 'O-RADS 3', tone: 'amber', desc: c.orads3Desc, mgmt: c.orads3Mgmt };
    }

    if (mainType === 'cystic') {
      if (!solidComp) return null;
      if (solidComp === 'yes') {
        if (!locules) return null;
        if (locules === 'uni') {
          if (!papillary) return null;
          return papillary === '>=4'
            ? { score: 'O-RADS 5', tone: 'red', desc: c.orads5Desc, mgmt: c.orads5Mgmt }
            : { score: 'O-RADS 4', tone: 'orange', desc: c.orads4Desc, mgmt: c.orads4Mgmt };
        }
        // bi/multilocular con componente sólido: el corte es por color score, no por proyecciones papilares
        if (!colorScore) return null;
        return colorScore === '3-4'
          ? { score: 'O-RADS 5', tone: 'red', desc: c.orads5Desc, mgmt: c.orads5Mgmt }
          : { score: 'O-RADS 4', tone: 'orange', desc: c.orads4Desc, mgmt: c.orads4Mgmt };
      }

      // Sin componente sólido
      if (!locules || !innerWall) return null;
      if (innerWall === 'irregular') {
        return locules === 'uni'
          ? { score: 'O-RADS 3', tone: 'amber', desc: c.orads3Desc, mgmt: c.orads3Mgmt }
          : { score: 'O-RADS 4', tone: 'orange', desc: c.orads4Desc, mgmt: c.orads4Mgmt };
      }
      // Paredes/septos lisos
      if (locules === 'multi') {
        if (!colorScore || !size) return null;
        if (size === 'small' && colorScore === '1-3') return { score: 'O-RADS 3', tone: 'amber', desc: c.orads3Desc, mgmt: c.orads3Mgmt };
        return { score: 'O-RADS 4', tone: 'orange', desc: c.orads4Desc, mgmt: c.orads4Mgmt };
      }
      if (!size) return null;
      return size === 'small'
        ? { score: 'O-RADS 2', tone: 'emerald', desc: c.orads2Desc, mgmt: c.orads2Mgmt }
        : { score: 'O-RADS 3', tone: 'amber', desc: c.orads3Desc, mgmt: c.orads3Mgmt };
    }

    if (mainType === 'solid') {
      if (!contour) return null;
      if (contour === 'irregular') return { score: 'O-RADS 5', tone: 'red', desc: c.orads5Desc, mgmt: c.orads5Mgmt };

      if (!colorScore) return null;
      if (colorScore === '1') return { score: 'O-RADS 3', tone: 'amber', desc: c.orads3Desc, mgmt: c.orads3Mgmt };
      if (!shadowing) return null;
      if (colorScore === '4') {
        return shadowing === 'yes'
          ? { score: 'O-RADS 4', tone: 'orange', desc: c.orads4Desc, mgmt: c.orads4Mgmt }
          : { score: 'O-RADS 5', tone: 'red', desc: c.orads5Desc, mgmt: c.orads5Mgmt };
      }
      // colorScore 2-3
      return shadowing === 'yes'
        ? { score: 'O-RADS 3', tone: 'amber', desc: c.orads3Desc, mgmt: c.orads3Mgmt }
        : { score: 'O-RADS 4', tone: 'orange', desc: c.orads4Desc, mgmt: c.orads4Mgmt };
    }
    return null;
  };

  const baseOradsResult = activeTool === 'orads' ? getBaseOradsResult() : null;
  const escalatedByAscites = !!(baseOradsResult && ascites === 'yes' && ['O-RADS 3', 'O-RADS 4', 'O-RADS 5'].includes(baseOradsResult.score) && baseOradsResult.score !== 'O-RADS 5');
  const oradsResult = escalatedByAscites
    ? { score: 'O-RADS 5', tone: 'red', desc: c.orads5Desc, mgmt: c.orads5Mgmt, ascitesNote: true }
    : baseOradsResult;
  // Solo se pregunta ascitis/nódulos una vez que el resto de la morfología ya
  // determinó una categoría base — así el orden de las preguntas sigue el
  // flujo clínico (caracterizar la lesión primero) y evita mostrar la
  // pregunta de ascitis mezclada con las de sub-tipo antes de tiempo.
  const showAscitesQ = !!baseOradsResult && baseOradsResult.score !== 'O-RADS 1' && baseOradsResult.score !== 'O-RADS 0';

  // ---- IOTA Simple Rules ----
  const getIotaResult = () => {
    const bCount = Object.values(iotaB).filter(Boolean).length;
    const mCount = Object.values(iotaM).filter(Boolean).length;
    if (bCount === 0 && mCount === 0) return null;
    if (mCount > 0 && bCount === 0) return { title: c.iotaMalignant, tone: 'red', desc: c.iotaMalignantDesc };
    if (bCount > 0 && mCount === 0) return { title: c.iotaBenign, tone: 'emerald', desc: c.iotaBenignDesc };
    return { title: c.iotaInconclusive, tone: 'amber', desc: c.iotaInconclusiveDesc };
  };

  const iotaResult = activeTool === 'iota' ? getIotaResult() : null;

  // ---- IOTA ADNEX model ----
  // Multinomial logistic regression (z1: borderline, z2: stage I, z3: stage
  // II-IV, z4: secondary metastatic — all vs. benign), coefficients as
  // published in Appendix D (retrained-on-pooled-data formula) of Van
  // Calster et al., BMJ 2014;349:g5920, verified by direct character-level
  // transcription against the paper's own supplementary PDF.
  const adnexInputsComplete = !!(
    adnexAge !== '' && adnexCa125 !== '' && adnexDiameter !== '' && adnexHasSolid &&
    (adnexHasSolid === 'no' || adnexSolidDiameter !== '') &&
    adnexLocules10 && adnexPapillary !== null && adnexShadows && adnexAscites && adnexCentre
  );

  const getAdnexResult = () => {
    if (!adnexInputsComplete) return null;
    const A = parseFloat(adnexAge);
    const B = parseFloat(adnexCa125);
    const C = parseFloat(adnexDiameter);
    const D = adnexHasSolid === 'yes' ? parseFloat(adnexSolidDiameter) : 0;
    if (!(A > 0) || !(B > 0) || !(C > 0) || D < 0) return null;
    if (D > C) return { error: 'solidExceeds' };

    const E = adnexLocules10 === 'yes' ? 1 : 0;
    const F = parseInt(adnexPapillary, 10);
    const G = adnexShadows === 'yes' ? 1 : 0;
    const H = adnexAscites === 'yes' ? 1 : 0;
    const I = adnexCentre === 'oncology' ? 1 : 0;

    const logB = Math.log2(B);
    const logC = Math.log2(C);
    const DC = D / C;
    const DC2 = DC * DC;

    const z1 = -7.577663 + 0.004506 * A + 0.111642 * logB + 0.372046 * logC + 6.967853 * DC
      - 5.65588 * DC2 + 1.375079 * E + 0.604238 * F - 2.04157 * G + 0.971061 * H + 0.953043 * I;
    const z2 = -12.276041 + 0.017260 * A + 0.197249 * logB + 0.873530 * logC + 9.583053 * DC
      - 5.83319 * DC2 + 0.791873 * E + 0.400369 * F - 1.87763 * G + 0.452731 * H + 0.452484 * I;
    const z3 = -14.915830 + 0.051239 * A + 0.765456 * logB + 0.430477 * logC + 10.37696 * DC
      - 5.70975 * DC2 + 0.273692 * E + 0.389874 * F - 2.35516 * G + 1.348408 * H + 0.459021 * I;
    const z4 = -11.909267 + 0.033601 * A + 0.276166 * logB + 0.449025 * logC + 6.644939 * DC
      - 2.30330 * DC2 + 0.899980 * E + 0.215645 * F - 2.49845 * G + 1.636407 * H + 0.808887 * I;

    const denom = 1 + Math.exp(z1) + Math.exp(z2) + Math.exp(z3) + Math.exp(z4);
    const benign = 1 / denom;
    const borderline = Math.exp(z1) / denom;
    const stage1 = Math.exp(z2) / denom;
    const stage2to4 = Math.exp(z3) / denom;
    const metastatic = Math.exp(z4) / denom;
    const totalMalignancy = borderline + stage1 + stage2to4 + metastatic;

    let tone = 'emerald';
    if (totalMalignancy >= 0.5) tone = 'red';
    else if (totalMalignancy >= 0.10) tone = 'orange';
    else if (totalMalignancy >= 0.01) tone = 'amber';

    return { benign, borderline, stage1, stage2to4, metastatic, totalMalignancy, tone };
  };

  const adnexResult = activeTool === 'adnex' ? getAdnexResult() : null;

  const hasResult = !!(oradsResult || iotaResult || (adnexResult && !adnexResult.error));

  const pct = (v) => `${(v * 100).toFixed(1)}%`;

  const handleCopy = () => {
    const toolName = activeTool === 'orads' ? 'O-RADS US v2022' : activeTool === 'iota' ? 'IOTA Simple Rules' : 'IOTA ADNEX';
    let txt = `${c.title}\n${c.toolTitle}: ${toolName}\n`;
    if (oradsResult) {
      txt += `${c.resultLabel}: ${oradsResult.score}\n${oradsResult.desc}\n${c.management}: ${oradsResult.mgmt}`;
    } else if (iotaResult) {
      txt += `${c.resultLabel}: ${iotaResult.title}\n${iotaResult.desc}`;
    } else if (adnexResult && !adnexResult.error) {
      txt += `${c.adnexBenignLabel}: ${pct(adnexResult.benign)}\n${c.adnexBorderlineLabel}: ${pct(adnexResult.borderline)}\n${c.adnexStage1Label}: ${pct(adnexResult.stage1)}\n${c.adnexStage24Label}: ${pct(adnexResult.stage2to4)}\n${c.adnexMetastaticLabel}: ${pct(adnexResult.metastatic)}\n${c.adnexTotalMalignancyLabel}: ${pct(adnexResult.totalMalignancy)}`;
    }
    copyToClipboard(txt, t.common.copiedOk, t.common.copiedErr);
  };

  const toneText = (tone) => ({
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-500 dark:text-orange-400',
    amber: 'text-amber-500 dark:text-amber-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    slate: 'text-slate-500 dark:text-slate-400',
  }[tone] || 'text-slate-500');

  return (
    <div className={`space-y-4 animate-in fade-in ${hasResult ? 'pb-56' : ''}`}>
      {!activeTool && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.selectToolQ}</label>
          <div className="flex flex-col gap-2">
            <button onClick={() => setActiveTool('orads')} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              O-RADS US v2022
            </button>
            <button onClick={() => setActiveTool('iota')} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              IOTA Simple Rules
            </button>
            <button onClick={() => setActiveTool('adnex')} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              IOTA ADNEX
            </button>
          </div>
        </Card>
      )}

      {activeTool === 'orads' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">O-RADS US v2022</h3>
            <button onClick={resetAll} className="text-xs text-slate-500 dark:text-slate-400">{t.common.reset}</button>
          </div>

          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.mainTypeQ}</label>
            <OptionButtons options={c.mainTypeOpts} value={mainType} onChange={setMainType} />
          </Card>

          {mainType === 'classic' && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.classicOriginQ}</label>
              <OptionButtons options={c.classicOriginOpts} value={classicOrigin} onChange={setClassicOrigin} />
            </Card>
          )}
          {mainType === 'classic' && classicOrigin === 'ovarian' && (
            <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.sizeQ}</label><OptionButtons options={c.sizeOpts} value={size} onChange={setSize} /></Card>
          )}

          {mainType === 'cystic' && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.solidCompQ}</label>
              {YES_NO(solidComp, setSolidComp, t.common.yes, t.common.no)}
            </Card>
          )}

          {mainType === 'cystic' && solidComp === 'yes' && (
            <>
              <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.loculesQ}</label><OptionButtons options={c.loculesOpts} value={locules} onChange={setLocules} /></Card>
              {locules === 'uni' && (
                <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.papillaryQ}</label><OptionButtons options={c.papillaryOpts} value={papillary} onChange={setPapillary} /></Card>
              )}
              {(locules === 'bi' || locules === 'multi') && (
                <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.colorScoreQ}</label><OptionButtons options={c.colorScoreAllOpts} value={colorScore} onChange={setColorScore} /></Card>
              )}
            </>
          )}

          {mainType === 'cystic' && solidComp === 'no' && (
            <>
              <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.loculesQ}</label><OptionButtons options={c.loculesOpts} value={locules} onChange={setLocules} /></Card>
              {locules && (
                <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.innerWallQ}</label><OptionButtons options={c.innerWallOpts} value={innerWall} onChange={setInnerWall} /></Card>
              )}
              {innerWall === 'smooth' && locules === 'multi' && (
                <>
                  <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.colorScoreQ}</label><OptionButtons options={c.colorScoreSplitOpts} value={colorScore} onChange={setColorScore} /></Card>
                  {colorScore === '1-3' && (
                    <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.sizeQ}</label><OptionButtons options={c.sizeOpts} value={size} onChange={setSize} /></Card>
                  )}
                </>
              )}
              {innerWall === 'smooth' && (locules === 'uni' || locules === 'bi') && (
                <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.sizeQ}</label><OptionButtons options={c.sizeOpts} value={size} onChange={setSize} /></Card>
              )}
            </>
          )}

          {mainType === 'solid' && (
            <>
              <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.contourQ}</label><OptionButtons options={c.contourOpts} value={contour} onChange={setContour} /></Card>
              {contour === 'smooth' && (
                <Card><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.colorScoreQ}</label><OptionButtons options={c.colorScoreSolidOpts} value={colorScore} onChange={setColorScore} /></Card>
              )}
              {contour === 'smooth' && (colorScore === '2-3' || colorScore === '4') && (
                <Card>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.shadowingQ}</label>
                  {YES_NO(shadowing, setShadowing, t.common.yes, t.common.no)}
                </Card>
              )}
            </>
          )}

          {showAscitesQ && (
            <Card>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.ascitesQ}</label>
              {YES_NO(ascites, setAscites, t.common.yes, t.common.no)}
            </Card>
          )}

          {oradsResult && (
            <Card className="text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{c.resultLabel}</span>
              <p className={`text-2xl font-bold ${toneText(oradsResult.tone)}`}>{oradsResult.score}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{oradsResult.desc}</p>
              {oradsResult.ascitesNote && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">{c.ascitesEscalationNote}</p>}
              <InfoBox tone={oradsResult.tone === 'orange' ? 'amber' : oradsResult.tone}>{oradsResult.mgmt}</InfoBox>
            </Card>
          )}
        </div>
      )}

      {activeTool === 'iota' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">IOTA Simple Rules</h3>
            <button onClick={resetAll} className="text-xs text-slate-500 dark:text-slate-400">{t.common.reset}</button>
          </div>

          <Card>
            <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2 text-sm">{c.iotaBenignFeatures}</h4>
            <CheckButtons options={c.iotaBList} values={iotaB} onToggle={(k) => toggleIota('b', k)} />
          </Card>

          <Card>
            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 text-sm">{c.iotaMalignantFeatures}</h4>
            <CheckButtons options={c.iotaMList} values={iotaM} onToggle={(k) => toggleIota('m', k)} />
          </Card>

          {iotaResult && (
            <Card className="text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{c.resultLabel}</span>
              <p className={`text-xl font-bold ${toneText(iotaResult.tone)}`}>{iotaResult.title}</p>
              <InfoBox tone={iotaResult.tone}>{iotaResult.desc}</InfoBox>
            </Card>
          )}
        </div>
      )}

      {activeTool === 'adnex' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">IOTA ADNEX</h3>
            <button onClick={resetAll} className="text-xs text-slate-500 dark:text-slate-400">{t.common.reset}</button>
          </div>

          <Card>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label={c.adnexAgeLabel} value={adnexAge} onChange={setAdnexAge} placeholder="55" />
              <NumberField label={c.adnexCa125Label} value={adnexCa125} onChange={setAdnexCa125} placeholder="35" />
            </div>
          </Card>

          <Card>
            <NumberField label={c.adnexDiameterLabel} value={adnexDiameter} onChange={setAdnexDiameter} placeholder="80" />
          </Card>

          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.adnexHasSolidQ}</label>
            {YES_NO(adnexHasSolid, setAdnexHasSolid, t.common.yes, t.common.no)}
          </Card>

          {adnexHasSolid === 'yes' && (
            <Card>
              <NumberField label={c.adnexSolidDiameterLabel} value={adnexSolidDiameter} onChange={setAdnexSolidDiameter} placeholder="20" />
              {adnexDiameter !== '' && adnexSolidDiameter !== '' && parseFloat(adnexSolidDiameter) > parseFloat(adnexDiameter) && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">{c.adnexSolidExceedsError}</p>
              )}
            </Card>
          )}

          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.adnexLocules10Q}</label>
            {YES_NO(adnexLocules10, setAdnexLocules10, t.common.yes, t.common.no)}
          </Card>

          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.adnexPapillaryQ}</label>
            <OptionButtons options={c.adnexPapillaryOpts} value={adnexPapillary} onChange={setAdnexPapillary} />
          </Card>

          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.adnexShadowsQ}</label>
            {YES_NO(adnexShadows, setAdnexShadows, t.common.yes, t.common.no)}
          </Card>

          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.adnexAscitesQ}</label>
            {YES_NO(adnexAscites, setAdnexAscites, t.common.yes, t.common.no)}
          </Card>

          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.adnexCentreQ}</label>
            <OptionButtons options={c.adnexCentreOpts} value={adnexCentre} onChange={setAdnexCentre} />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{c.adnexCentreNote}</p>
          </Card>

          {adnexResult && !adnexResult.error && (
            <Card className="text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{c.adnexTotalMalignancyLabel}</span>
              <p className={`text-3xl font-black ${toneText(adnexResult.tone)}`}>{pct(adnexResult.totalMalignancy)}</p>
              <div className="grid grid-cols-2 gap-2 mt-4 text-left">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{c.adnexBenignLabel}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{pct(adnexResult.benign)}</span>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{c.adnexBorderlineLabel}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{pct(adnexResult.borderline)}</span>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{c.adnexStage1Label}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{pct(adnexResult.stage1)}</span>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{c.adnexStage24Label}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{pct(adnexResult.stage2to4)}</span>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2.5 col-span-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{c.adnexMetastaticLabel}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{pct(adnexResult.metastatic)}</span>
                </div>
              </div>
              <div className="mt-3 text-left">
                <InfoBox tone="slate">{c.adnexPerformanceNote}</InfoBox>
              </div>
            </Card>
          )}
          {adnexResult && adnexResult.error === 'solidExceeds' && (
            <InfoBox tone="red">{c.adnexSolidExceedsError}</InfoBox>
          )}
        </div>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.adnexalRisk} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasResult && (
        <StickyBar>
          <div className="min-w-0 w-full">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              {activeTool === 'adnex' ? c.adnexTotalMalignancyLabel : c.resultLabel}
            </span>
            <span className={`text-sm font-bold block truncate ${activeTool === 'adnex' ? toneText(adnexResult.tone) : 'text-slate-800 dark:text-slate-100'}`}>
              {activeTool === 'orads' ? oradsResult.score : activeTool === 'iota' ? iotaResult.title : pct(adnexResult.totalMalignancy)}
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

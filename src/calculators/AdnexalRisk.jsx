import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

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

  const [activeTool, setActiveTool] = useState(null); // 'orads' | 'iota'

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

  const resetAll = () => {
    setActiveTool(null);
    setMainType(null); setClassicOrigin(null); setSize(null); setSolidComp(null);
    setLocules(null); setInnerWall(null); setPapillary(null); setContour(null);
    setShadowing(null); setColorScore(null); setAscites(null);
    setIotaB({ b1: false, b2: false, b3: false, b4: false, b5: false });
    setIotaM({ m1: false, m2: false, m3: false, m4: false, m5: false });
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
  const hasResult = !!(oradsResult || iotaResult);

  const handleCopy = () => {
    let txt = `${c.title}\n${c.toolTitle}: ${activeTool === 'orads' ? 'O-RADS US v2022' : 'IOTA Simple Rules'}\n`;
    if (oradsResult) {
      txt += `${c.resultLabel}: ${oradsResult.score}\n${oradsResult.desc}\n${c.management}: ${oradsResult.mgmt}`;
    } else if (iotaResult) {
      txt += `${c.resultLabel}: ${iotaResult.title}\n${iotaResult.desc}`;
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
          <div className="flex gap-2">
            <button onClick={() => setActiveTool('orads')} className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              O-RADS US v2022
            </button>
            <button onClick={() => setActiveTool('iota')} className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              IOTA Simple Rules
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

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.adnexalRisk} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasResult && (
        <StickyBar>
          <div className="min-w-0 w-full">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block truncate">
              {activeTool === 'orads' ? oradsResult.score : iotaResult.title}
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

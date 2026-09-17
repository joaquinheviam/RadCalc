import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const btnCls = (active) =>
  `w-full text-left p-2.5 rounded-lg border text-xs transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

// Verdictos, en el mismo orden en que se muestran las columnas.
const VERDICT_SEPTATE = 'septate';
const VERDICT_NORMAL = 'normal';
const VERDICT_GRAY = 'gray';

export default function MullerianAnomalies() {
  const { t } = useLang();
  const c = t.calc.mullerianAnomalies;

  /* ==================== Cuerpo uterino ==================== */
  const [dev, setDev] = useState(null); // null | 'bilateral' | 'unicorne' | 'agenesia'

  // -- Agenesia --
  const [agenesiaHorn, setAgenesiaHorn] = useState(null); // null | 'yes' | 'no'

  // -- Unicorne --
  const [unicorneHorn, setUnicorneHorn] = useState(null); // null | 'none' | 'noCavity' | 'communicating' | 'nonCommunicating'

  // -- Bilateral: contorno --
  const [contour, setContour] = useState(null); // null | 'normal' | 'cleft'

  // -- Bilateral + cleft: bicorne/didelfo --
  const [extDepthCleft, setExtDepthCleft] = useState('');
  const [wallThicknessCleft, setWallThicknessCleft] = useState('');
  const [cleftExtent, setCleftExtent] = useState(null); // null | 'partial' | 'complete'
  const [cervixCount, setCervixCount] = useState(null); // null | 'one' | 'two'

  // -- Bilateral + normal: T-shape / cuantitativo --
  const [tshape, setTshape] = useState(null); // null | 'yes' | 'no'
  const [intDepth, setIntDepth] = useState('');
  const [intAngle, setIntAngle] = useState('');
  const [extDepthNormal, setExtDepthNormal] = useState('');
  const [wallThickness, setWallThickness] = useState('');

  const resetBody = () => {
    setDev(null);
    setAgenesiaHorn(null);
    setUnicorneHorn(null);
    setContour(null);
    setExtDepthCleft(''); setWallThicknessCleft(''); setCleftExtent(null); setCervixCount(null);
    setTshape(null); setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness('');
  };
  const handleDev = (key) => {
    setDev(key);
    setAgenesiaHorn(null); setUnicorneHorn(null); setContour(null);
    setExtDepthCleft(''); setWallThicknessCleft(''); setCleftExtent(null); setCervixCount(null);
    setTshape(null); setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness('');
  };
  const handleContour = (key) => {
    setContour(key);
    setExtDepthCleft(''); setWallThicknessCleft(''); setCleftExtent(null); setCervixCount(null);
    setTshape(null); setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness('');
  };
  const handleTshape = (key) => {
    setTshape(key);
    setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness('');
  };
  const handleBodyBack = () => {
    if (dev === 'agenesia' && agenesiaHorn !== null) { setAgenesiaHorn(null); return; }
    if (dev === 'unicorne' && unicorneHorn !== null) { setUnicorneHorn(null); return; }
    if (dev === 'bilateral') {
      if (contour === 'cleft' && (cervixCount !== null || cleftExtent !== null)) {
        setCervixCount(null); setCleftExtent(null); return;
      }
      if (contour === 'normal' && tshape !== null) { setTshape(null); setIntDepth(''); setIntAngle(''); setExtDepthNormal(''); setWallThickness(''); return; }
      if (contour !== null) { setContour(null); return; }
    }
    if (dev !== null) { setDev(null); return; }
  };

  /* ---- Resultado: agenesia ---- */
  const agenesiaResult = dev === 'agenesia' && agenesiaHorn
    ? (agenesiaHorn === 'yes' ? c.agenesiaWithCavity : c.agenesiaNoCavity)
    : null;

  /* ---- Resultado: unicorne ---- */
  const unicorneResult = dev === 'unicorne' && unicorneHorn ? c.unicorneResults[unicorneHorn] : null;

  /* ---- Resultado: bicorne/didelfo (contorno hendido) ---- */
  const bicorneKey = (dev === 'bilateral' && contour === 'cleft' && cleftExtent && cervixCount)
    ? `${cleftExtent}${cervixCount === 'one' ? 'One' : 'Two'}`
    : null;
  const bicorneResult = bicorneKey ? c.bicorneResults[bicorneKey] : null;
  const extDepthCleftNum = extDepthCleft === '' ? null : parseFloat(extDepthCleft);
  const wallThicknessCleftNum = wallThicknessCleft === '' ? null : parseFloat(wallThicknessCleft);
  const extRatioCleft = (extDepthCleftNum !== null && wallThicknessCleftNum) ? ((extDepthCleftNum / wallThicknessCleftNum) * 100).toFixed(0) : null;

  /* ---- Resultado: T-shape ---- */
  const tshapeResultActive = dev === 'bilateral' && contour === 'normal' && tshape === 'yes';

  /* ---- Resultado: cuantitativo normal/arcuato vs. septado ---- */
  const showQuant = dev === 'bilateral' && contour === 'normal' && tshape === 'no';
  const intDepthNum = intDepth === '' ? null : parseFloat(intDepth);
  const intAngleNum = intAngle === '' ? null : parseFloat(intAngle);
  const extDepthNormalNum = extDepthNormal === '' ? null : parseFloat(extDepthNormal);
  const wallThicknessNum = wallThickness === '' ? null : parseFloat(wallThickness);
  const hasDepth = intDepthNum !== null && !isNaN(intDepthNum);
  const hasAngle = intAngleNum !== null && !isNaN(intAngleNum);
  const hasWall = wallThicknessNum !== null && !isNaN(wallThicknessNum) && wallThicknessNum > 0;
  const hasExtNormal = extDepthNormalNum !== null && !isNaN(extDepthNormalNum);

  // ASRM MAC2021: requiere profundidad >10 mm Y ángulo <90° (criterio
  // combinado); si solo se cumple uno de los dos, el caso queda en "zona
  // gris" (no clasificable) — Pfeifer et al. 2021 (documento primario ASRM,
  // umbral >10 mm desde la línea intercornual); Ludwin et al. 2022, revisión
  // crítica de MAC2021, confirma que la zona gris no se eliminó respecto al
  // guideline ASRM 2016 previo, solo bajó el umbral de profundidad.
  const asrmMac2021Verdict = (() => {
    if (!hasDepth || !hasAngle) return null;
    const deepEnough = intDepthNum > 10;
    const sharpEnough = intAngleNum < 90;
    if (deepEnough && sharpEnough) return VERDICT_SEPTATE;
    if (!deepEnough && !sharpEnough) return VERDICT_NORMAL;
    return VERDICT_GRAY;
  })();

  // ESHRE/ESGE: índice indentación interna/grosor de pared > 50%, con
  // indentación externa/grosor de pared < 50% (Grimbizis et al. 2013).
  const eshreInternalRatio = (hasDepth && hasWall) ? (intDepthNum / wallThicknessNum) * 100 : null;
  const eshreExternalRatio = (hasExtNormal && hasWall) ? (extDepthNormalNum / wallThicknessNum) * 100 : null;
  const eshreVerdict = (eshreInternalRatio === null) ? null : (eshreInternalRatio > 50 ? VERDICT_SEPTATE : VERDICT_NORMAL);
  const eshreExternalWarning = eshreExternalRatio !== null && eshreExternalRatio > 50;

  // CUME (Ludwin et al. 2018): tres mediciones validadas de forma
  // independiente contra el consenso de expertos, no una fórmula combinada.
  // El veredicto principal usa la profundidad (mejor reproducibilidad,
  // CCC 0.99); ángulo e índice I:WT se muestran solo como apoyo.
  const cumeVerdict = hasDepth ? (intDepthNum >= 10 ? VERDICT_SEPTATE : VERDICT_NORMAL) : null;
  const cumeRatio = (hasDepth && hasWall) ? ((intDepthNum / wallThicknessNum) * 100).toFixed(0) : null;

  const verdictLabel = (v) => v === VERDICT_SEPTATE ? c.verdictSeptate : v === VERDICT_NORMAL ? c.verdictNormal : v === VERDICT_GRAY ? c.verdictGrayZone : '—';
  const verdictColor = (v) => v === VERDICT_SEPTATE ? 'text-red-500' : v === VERDICT_NORMAL ? 'text-emerald-500' : v === VERDICT_GRAY ? 'text-amber-500' : 'text-slate-400';

  const quantVerdicts = [asrmMac2021Verdict, eshreVerdict, cumeVerdict].filter(Boolean);
  const quantDiscrepancy = new Set(quantVerdicts).size > 1;

  /* ==================== Cuello uterino (independiente) ==================== */
  const [cervixFinding, setCervixFinding] = useState(null);

  /* ==================== Vagina (independiente) ==================== */
  const [vaginaFinding, setVaginaFinding] = useState(null);

  /* ==================== Reporte combinado ==================== */
  const bodyReportStr = (() => {
    if (agenesiaResult) {
      const parts = [agenesiaResult.asrm, agenesiaResult.eshre];
      if (agenesiaResult.note) parts.push(agenesiaResult.note);
      return parts.join(' · ');
    }
    if (unicorneResult) {
      const parts = [unicorneResult.asrm, unicorneResult.eshre];
      if (unicorneResult.note) parts.push(unicorneResult.note);
      return parts.join(' · ');
    }
    if (bicorneResult) {
      const parts = [bicorneResult.asrm, bicorneResult.eshre, c.cumeNotApplicableCleft];
      if (extDepthCleftNum !== null) parts.push(c.extConfirmAsrm(extDepthCleft));
      if (extRatioCleft !== null) parts.push(c.extConfirmEshre(extRatioCleft));
      return parts.join(' · ');
    }
    if (tshapeResultActive) {
      return `${c.tshapeResult.eshre} · ${c.tshapeResult.asrmNote}`;
    }
    if (showQuant && quantVerdicts.length > 0) {
      const parts = [];
      parts.push(`${c.systemAsrmMac2021}: ${verdictLabel(asrmMac2021Verdict)}`);
      parts.push(`${c.systemEshre}: ${verdictLabel(eshreVerdict)}`);
      parts.push(`${c.systemCume}: ${verdictLabel(cumeVerdict)}`);
      return parts.join(' · ');
    }
    return null;
  })();

  const cervixReportStr = cervixFinding ? c.cervixResults[cervixFinding] : null;
  const vaginaReportStr = vaginaFinding ? c.vaginaResults[vaginaFinding] : null;

  const hasAnyResult = !!(bodyReportStr || cervixReportStr || vaginaReportStr);

  const stickyLabel = (() => {
    if (agenesiaResult) return agenesiaHorn === 'yes' ? c.agenesiaWithCavity.asrm : c.agenesiaNoCavity.asrm;
    if (unicorneResult) return unicorneResult.asrm;
    if (bicorneResult) return bicorneResult.asrm;
    if (tshapeResultActive) return c.tshapeResult.eshre;
    if (showQuant && quantVerdicts.length > 0) return `${c.systemAsrmMac2021}: ${verdictLabel(asrmMac2021Verdict)}`;
    return null;
  })();

  const resetAll = () => { resetBody(); setCervixFinding(null); setVaginaFinding(null); };
  const handleCopyAll = () => {
    const parts = [];
    if (bodyReportStr) parts.push(`${c.bodySectionTitle}: ${bodyReportStr}`);
    if (cervixReportStr) parts.push(`${c.cervixSectionTitle}: ${cervixReportStr}`);
    if (vaginaReportStr) parts.push(`${c.vaginaSectionTitle}: ${vaginaReportStr}`);
    if (parts.length === 0) return;
    copyToClipboard(`${c.reportTitle}\n${parts.join('\n')}`, t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAnyResult ? 'pb-56' : ''}`}>
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">{c.bodySectionTitle}</h3>

      {dev !== null && (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span className="font-semibold uppercase">{c.resultLabel}</span>
          <div className="flex items-center gap-3">
            <button onClick={handleBodyBack} className="text-blue-500 font-medium">{c.stepBack}</button>
            <button onClick={resetBody} className="text-slate-500 dark:text-slate-400 font-medium">{t.common.reset}</button>
          </div>
        </div>
      )}

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.devQ}</label>
        <div className="space-y-2">
          {c.devOptions.map(opt => (
            <button key={opt.key} onClick={() => handleDev(opt.key)} className={btnCls(dev === opt.key)}>{opt.label}</button>
          ))}
        </div>
      </Card>

      {/* ---- Agenesia ---- */}
      {dev === 'agenesia' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.agenesiaHornQ}</label>
          <div className="space-y-2">
            <button onClick={() => setAgenesiaHorn('yes')} className={btnCls(agenesiaHorn === 'yes')}>{c.agenesiaHornYes}</button>
            <button onClick={() => setAgenesiaHorn('no')} className={btnCls(agenesiaHorn === 'no')}>{c.agenesiaHornNo}</button>
          </div>
        </Card>
      )}
      {agenesiaResult && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{agenesiaResult.asrm}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{agenesiaResult.eshre}</p>
          {agenesiaResult.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{agenesiaResult.note}</p>}
        </Card>
      )}

      {/* ---- Unicorne ---- */}
      {dev === 'unicorne' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.unicorneHornQ}</label>
          <div className="space-y-2">
            {c.unicorneHornOptions.map(opt => (
              <button key={opt.key} onClick={() => setUnicorneHorn(opt.key)} className={btnCls(unicorneHorn === opt.key)}>{opt.label}</button>
            ))}
          </div>
        </Card>
      )}
      {unicorneResult && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{unicorneResult.asrm}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{unicorneResult.eshre}</p>
          {unicorneResult.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{unicorneResult.note}</p>}
        </Card>
      )}

      {/* ---- Bilateral: contorno externo ---- */}
      {dev === 'bilateral' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.contourQ}</label>
          <div className="space-y-2">
            {c.contourOptions.map(opt => (
              <button key={opt.key} onClick={() => handleContour(opt.key)} className={btnCls(contour === opt.key)}>{opt.label}</button>
            ))}
          </div>
        </Card>
      )}

      {/* ---- Bilateral + cleft: bicorne/didelfo ---- */}
      {dev === 'bilateral' && contour === 'cleft' && (
        <>
          <Card className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{c.extNumbersTitle}</h4>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label={c.extDepthQ} value={extDepthCleft} onChange={setExtDepthCleft} placeholder="mm" small />
              <NumberField label={c.wallThicknessQCleft} value={wallThicknessCleft} onChange={setWallThicknessCleft} placeholder="mm" small />
            </div>
          </Card>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.cleftExtentQ}</label>
            <div className="space-y-2">
              <button onClick={() => setCleftExtent('partial')} className={btnCls(cleftExtent === 'partial')}>{c.cleftExtentPartial}</button>
              <button onClick={() => setCleftExtent('complete')} className={btnCls(cleftExtent === 'complete')}>{c.cleftExtentComplete}</button>
            </div>
          </Card>
          <Card>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.cervixCountQ}</label>
            <div className="flex gap-2">
              <button onClick={() => setCervixCount('one')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${cervixCount === 'one' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.cervixCountOne}</button>
              <button onClick={() => setCervixCount('two')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${cervixCount === 'two' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.cervixCountTwo}</button>
            </div>
          </Card>
        </>
      )}
      {bicorneResult && (
        <Card className="text-center space-y-2">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{bicorneResult.asrm}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{bicorneResult.eshre}</p>
          {extDepthCleftNum !== null && <p className="text-xs text-slate-500 dark:text-slate-400">{c.extConfirmAsrm(extDepthCleft)}</p>}
          {extRatioCleft !== null && <p className="text-xs text-slate-500 dark:text-slate-400">{c.extConfirmEshre(extRatioCleft)}</p>}
          <InfoBox tone="amber">{c.cumeNotApplicableCleft}</InfoBox>
        </Card>
      )}

      {/* ---- Bilateral + normal: T-shape ---- */}
      {dev === 'bilateral' && contour === 'normal' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.tshapeQ}</label>
          <div className="flex gap-2">
            <button onClick={() => handleTshape('yes')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${tshape === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.tshapeYes}</button>
            <button onClick={() => handleTshape('no')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${tshape === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.tshapeNo}</button>
          </div>
        </Card>
      )}
      {tshapeResultActive && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{c.tshapeResult.eshre}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.tshapeResult.asrmNote}</p>
        </Card>
      )}

      {/* ---- Bilateral + normal + no T-shape: cuantitativo ---- */}
      {showQuant && (
        <>
          <Card className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{c.quantTitle}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.quantIntro}</p>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label={c.intDepthQ} value={intDepth} onChange={setIntDepth} placeholder="mm" small />
              <NumberField label={c.intAngleQ} value={intAngle} onChange={setIntAngle} placeholder="°" small />
              <NumberField label={c.extDepthQNormal} value={extDepthNormal} onChange={setExtDepthNormal} placeholder="mm" small />
              <NumberField label={c.wallThicknessQ} value={wallThickness} onChange={setWallThickness} placeholder="mm" small />
            </div>
          </Card>

          {hasDepth && (
            <Card className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{c.quantResultsTitle}</h4>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-300">{c.systemAsrmMac2021}</span>
                <span className={`text-sm font-bold ${verdictColor(asrmMac2021Verdict)}`}>{verdictLabel(asrmMac2021Verdict)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-300">{c.systemEshre}</span>
                <span className={`text-sm font-bold ${verdictColor(eshreVerdict)}`}>{verdictLabel(eshreVerdict)}</span>
              </div>
              <div className="py-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{c.systemCume}</span>
                  <span className={`text-sm font-bold ${verdictColor(cumeVerdict)}`}>{verdictLabel(cumeVerdict)}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.cumeDepthLabel}</p>
                {hasAngle && <p className="text-xs text-slate-500 dark:text-slate-400">{c.cumeAngleLabel(intAngle)}</p>}
                {cumeRatio !== null && <p className="text-xs text-slate-500 dark:text-slate-400">{c.cumeRatioLabel(cumeRatio)}</p>}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.cumeNote}</p>
              </div>

              {eshreExternalWarning && <InfoBox tone="amber">{c.verdictBicorneWarning}</InfoBox>}
              {quantDiscrepancy && <InfoBox tone="amber">{c.discrepancyWarning}</InfoBox>}
            </Card>
          )}
        </>
      )}

      {/* ==================== Cuello uterino ==================== */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide mt-4">{c.cervixSectionTitle}</h3>
      </div>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.cervixQ}</label>
        <div className="space-y-2">
          {c.cervixOptions.map(opt => (
            <button key={opt.key} onClick={() => setCervixFinding(opt.key)} className={btnCls(cervixFinding === opt.key)}>{opt.label}</button>
          ))}
        </div>
      </Card>
      {cervixReportStr && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cervixReportStr}</p>
        </Card>
      )}

      {/* ==================== Vagina ==================== */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide mt-4">{c.vaginaSectionTitle}</h3>
      </div>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.vaginaQ}</label>
        <div className="space-y-2">
          {c.vaginaOptions.map(opt => (
            <button key={opt.key} onClick={() => setVaginaFinding(opt.key)} className={btnCls(vaginaFinding === opt.key)}>{opt.label}</button>
          ))}
        </div>
      </Card>
      {vaginaReportStr && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{vaginaReportStr}</p>
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.mullerianAnomalies} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {hasAnyResult && (
        <StickyBar>
          <div className="min-w-0 w-full text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100 block mt-1 leading-tight truncate">
              {stickyLabel || c.reportTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
            <CopyIconButton onClick={handleCopyAll} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
    </div>
  );
}

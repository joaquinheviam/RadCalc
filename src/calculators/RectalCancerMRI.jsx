import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconBookOpen } from '../components/icons/index.js';
import { Card, Accordion, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const btnCls = (active) =>
  `w-full text-left p-2.5 rounded-lg border text-xs transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

function OptionButtons({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button key={opt.key} onClick={() => onChange(opt.key)} className={btnCls(value === opt.key)}>
          <span className="font-medium block">{opt.label}</span>
          {opt.desc && <span className="text-[11px] opacity-80 block mt-0.5">{opt.desc}</span>}
        </button>
      ))}
    </div>
  );
}

// Diagrama didáctico de la subclasificación T3 (a-d) y T4 (a/b), en corte
// transversal simplificado de la pared rectal (mismo criterio visual que
// PectusScheme/SeptateScheme: contornos en currentColor adaptables a ambos
// temas, badges de color fijo para cada hito, leyenda bilingüe fuera del SVG).
// T3a/b (buen pronóstico) en verde, T3c/d (mayor riesgo de recurrencia local)
// en rojo — distinción tomada literalmente de la fuente ("T3 a/b good
// prognosis... T3 c/d higher risk of local recurrence").
function RectalTScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 480 300" className="h-auto w-full max-w-sm text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Luz rectal */}
        <line x1="30" y1="150" x2="55" y2="150" stroke="currentColor" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" className="text-slate-400 dark:text-slate-500" />

        {/* Muscularis propria (banda gruesa) */}
        <rect x="95" y="60" width="16" height="180" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />

        {/* Grasa perirrectal / mesorrecto */}
        <rect x="55" y="30" width="325" height="240" rx="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 dark:text-slate-500" />

        {/* Fascia mesorrectal (MRF), línea discontinua */}
        <line x1="380" y1="30" x2="380" y2="270" stroke="currentColor" strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" />

        {/* Reflexión peritoneal (arriba) */}
        <line x1="111" y1="30" x2="330" y2="30" stroke="currentColor" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />

        {/* Tumor: desde la luz, atravesando la muscular propia */}
        <path
          fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"
          d="M 55,150 C 65,110 90,95 111,100 C 130,106 140,130 150,150 C 140,170 130,194 111,200 C 90,205 65,190 55,150 Z"
        />

        {/* Regla de profundidad T3a-d, a partir del borde externo de la muscular propia (x=111) */}
        <g stroke="#059669" strokeWidth="2.5" strokeLinecap="round">
          <line x1="111" y1="238" x2="114" y2="238" />
        </g>
        <rect x="103" y="248" width="22" height="20" rx="5" fill="#059669" />
        <text x="114" y="262" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">a</text>

        <g stroke="#059669" strokeWidth="2.5" strokeLinecap="round">
          <line x1="111" y1="238" x2="128" y2="238" />
        </g>
        <rect x="130" y="248" width="22" height="20" rx="5" fill="#059669" />
        <text x="141" y="262" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">b</text>

        <g stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
          <line x1="111" y1="238" x2="157" y2="238" />
        </g>
        <rect x="159" y="248" width="22" height="20" rx="5" fill="#dc2626">
          <title>c</title>
        </rect>
        <text x="170" y="262" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">c</text>

        <g stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
          <line x1="111" y1="238" x2="186" y2="238" />
        </g>
        <rect x="188" y="248" width="22" height="20" rx="5" fill="#dc2626">
          <title>d</title>
        </rect>
        <text x="199" y="262" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">d</text>

        {/* T4a: cruza la reflexión peritoneal */}
        <line x1="230" y1="70" x2="230" y2="26" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#rcArrow)" />
        <rect x="210" y="8" width="42" height="20" rx="5" fill="#dc2626" />
        <text x="231" y="22" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">T4a</text>

        {/* T4b: cruza la MRF hacia un órgano/estructura adyacente */}
        <line x1="330" y1="150" x2="420" y2="150" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#rcArrow)" />
        <rect x="422" y="140" width="42" height="20" rx="5" fill="#dc2626" />
        <text x="443" y="154" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">T4b</text>

        <defs>
          <marker id="rcArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

const T_STAGE_KEYS = ['t1t2', 't3a', 't3b', 't3c', 't3d', 't4a', 't4b'];
const T3_KEYS = ['t3a', 't3b', 't3c', 't3d'];
const T3_OR_T4_KEYS = [...T3_KEYS, 't4a', 't4b'];

export default function RectalCancerMRI() {
  const { t } = useLang();
  const c = t.calc.rectalCancer;

  const [mode, setMode] = useState('primary'); // 'primary' | 'restaging'
  const [location, setLocation] = useState(null);
  const [morphology, setMorphology] = useState(null);
  const [mucin, setMucin] = useState(null);
  const [tStage, setTStage] = useState(null);
  const [sphincter, setSphincter] = useState(null);
  const [mrf, setMrf] = useState(null);
  const [emvi, setEmvi] = useState(null);
  const [nodesPrimary, setNodesPrimary] = useState(null); // 'n0'|'n_ge9'|'n_5to9'|'n_lt5'
  const [nodesRestaging, setNodesRestaging] = useState(null); // 'negative'|'positive'
  const [mrTrg, setMrTrg] = useState(null);

  const switchMode = (m) => {
    setMode(m);
    setTStage(null);
    setMrf(null);
    setEmvi(null);
    setNodesPrimary(null);
    setNodesRestaging(null);
    setMrTrg(null);
  };

  const resetAll = () => {
    switchMode('primary');
    setLocation(null);
    setMorphology(null);
    setMucin(null);
    setSphincter(null);
  };

  const tOptions = T_STAGE_KEYS.map((key) => ({ key, label: c.tOpts[key] }));
  const nodesPrimaryOptions = ['n0', 'n_ge9', 'n_5to9', 'n_lt5'].map((key) => ({ key, label: c.nodesPrimaryOpts[key] }));
  const trgOptions = ['1', '2', '3', '4', '5'].map((key) => ({ key, label: c.trgOpts[key], desc: key === '1' ? c.trg1Desc : null }));

  const nodesPositive = mode === 'primary' ? nodesPrimary && nodesPrimary !== 'n0' : nodesRestaging === 'positive';
  const nodesAnswered = mode === 'primary' ? nodesPrimary !== null : nodesRestaging !== null;

  // --- Etapificación primaria: LARC per NCCN ("T3 or T4, or any TN+") y ESMO
  // (T3c/d, recto muy bajo, EMVI+, T3 con MRF comprometida, o T4b). El criterio
  // ESMO de "ganglio lateral comprometido" y "elevador amenazado" no se evalúan
  // aquí porque Fase 1 no definió variables de entrada específicas para ellos.
  const isT3orT4 = tStage && T3_OR_T4_KEYS.includes(tStage);
  const nccnLarc = isT3orT4 || nodesPositive;
  const esmoLarc = tStage === 't3c' || tStage === 't3d' || tStage === 't4b'
    || location === 'lower'
    || emvi === 'yes'
    || (tStage && T3_KEYS.includes(tStage) && mrf === 'involved');

  let primaryVerdict = null;
  if (mode === 'primary' && tStage) {
    if (tStage === 't1t2') {
      primaryVerdict = { key: 'earlyT', tone: 'emerald', text: c.verdictEarlyT };
    } else if (T3_KEYS.slice(0, 2).includes(tStage) && location === 'upper' && nodesAnswered && !nodesPositive) {
      primaryVerdict = { key: 'lowRisk', tone: 'emerald', text: c.verdictLowRiskT3 };
    } else if (nodesAnswered && (nccnLarc || esmoLarc)) {
      primaryVerdict = { key: 'larc', tone: 'amber', text: c.verdictLarc };
    }
  }

  // --- Reetapificación: mrTRG + estado ganglionar orientan Watch & Wait vs cirugía.
  let restagingVerdict = null;
  if (mode === 'restaging' && mrTrg && nodesAnswered) {
    if (mrTrg === '1' && !nodesPositive) {
      restagingVerdict = { key: 'complete', tone: 'emerald', text: c.verdictComplete };
    } else if (mrTrg === '2' && !nodesPositive) {
      restagingVerdict = { key: 'nearComplete', tone: 'emerald', text: c.verdictNearComplete };
    } else if (nodesPositive && (mrTrg === '1' || mrTrg === '2')) {
      restagingVerdict = { key: 'goodTumorNodePos', tone: 'amber', text: c.verdictGoodTumorNodePos };
    } else {
      restagingVerdict = { key: 'incomplete', tone: 'red', text: c.verdictIncomplete };
    }
  }

  const verdict = mode === 'primary' ? primaryVerdict : restagingVerdict;
  const hasInteracted = !!(location || tStage || mrTrg);

  const buildReport = () => {
    const lines = [mode === 'primary' ? c.primaryStaging : c.restaging];
    if (location) lines.push(`${c.locationLbl}: ${c.locOpts.find((o) => o.key === location)?.label}`);
    if (morphology) lines.push(`${c.morphologyLbl}: ${c.morphOpts.find((o) => o.key === morphology)?.label}`);
    if (mucin) lines.push(`${c.mucinLbl}: ${c.mucinOpts.find((o) => o.key === mucin)?.label}`);
    if (tStage) lines.push(`${mode === 'primary' ? c.tStageLbl : c.ytStageLbl}: ${c.tOpts[tStage]}`);
    if (location === 'lower' && sphincter) lines.push(`${c.sphincterLbl}: ${c.sphincterOpts.find((o) => o.key === sphincter)?.label}`);
    if (mrf) lines.push(`${c.mrfLbl}: ${c.mrfOpts.find((o) => o.key === mrf)?.label}`);
    if (emvi) lines.push(`EMVI: ${emvi === 'yes' ? c.yes : c.no}`);
    if (mode === 'primary' && nodesPrimary) lines.push(`${c.nodesLbl}: ${c.nodesPrimaryOpts[nodesPrimary]}`);
    if (mode === 'restaging' && nodesRestaging) lines.push(`${c.nodesLbl}: ${nodesRestaging === 'positive' ? c.nodesRestagingPositive : c.nodesRestagingNegative}`);
    if (mode === 'restaging' && mrTrg) lines.push(`mrTRG: ${c.trgOpts[mrTrg]}`);
    if (verdict) lines.push(`\n${c.conclusion}: ${verdict.text}`);
    return lines.join('\n');
  };

  const handleCopy = () => copyToClipboard(buildReport(), t.common.copiedOk, t.common.copiedErr);

  return (
    <div className={`space-y-4 animate-in fade-in ${hasInteracted ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.modeQ}</label>
        <div className="flex gap-2">
          <button onClick={() => switchMode('primary')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${mode === 'primary' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.primaryStaging}</button>
          <button onClick={() => switchMode('restaging')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${mode === 'restaging' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.restaging}</button>
        </div>
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.locationQ}</label>
        <OptionButtons options={[
          { key: 'upper', label: c.locOpts.find((o) => o.key === 'upper').label },
          { key: 'mid', label: c.locOpts.find((o) => o.key === 'mid').label },
          { key: 'lower', label: c.locOpts.find((o) => o.key === 'lower').label },
        ]} value={location} onChange={setLocation} />
      </Card>

      <Card>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{c.morphologyLbl}</label>
            <div className="space-y-1.5">
              {['polypoid', 'annular', 'partlyAnnular'].map((key) => (
                <button key={key} onClick={() => setMorphology(key)} className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all ${morphology === key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {c.morphOpts.find((o) => o.key === key).label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{c.mucinLbl}</label>
            <div className="space-y-1.5">
              {['none', 'some', 'mostly'].map((key) => (
                <button key={key} onClick={() => setMucin(key)} className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all ${mucin === key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {c.mucinOpts.find((o) => o.key === key).label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Accordion icon={<IconBookOpen size={16} />} title={c.diagramTitle}>
        <RectalTScheme />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-600 mr-1 align-[-1px]"></span>{c.legendGoodPrognosis}</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-600 mr-1 align-[-1px]"></span>{c.legendHigherRisk}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.diagramNote}</p>
      </Accordion>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{mode === 'primary' ? c.tStageQ : c.ytStageQ}</label>
        <OptionButtons options={tOptions} value={tStage} onChange={setTStage} />
      </Card>

      {location === 'lower' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.sphincterQ}</label>
          <OptionButtons options={[
            { key: 'none', label: c.sphincterOpts.find((o) => o.key === 'none').label },
            { key: 'is', label: c.sphincterOpts.find((o) => o.key === 'is').label },
            { key: 'iss', label: c.sphincterOpts.find((o) => o.key === 'iss').label },
            { key: 'es', label: c.sphincterOpts.find((o) => o.key === 'es').label },
          ]} value={sphincter} onChange={setSphincter} />
        </Card>
      )}

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.mrfQ}</label>
        <OptionButtons options={[
          { key: 'clear', label: c.mrfOpts.find((o) => o.key === 'clear').label },
          { key: 'threatened', label: c.mrfOpts.find((o) => o.key === 'threatened').label },
          { key: 'involved', label: c.mrfOpts.find((o) => o.key === 'involved').label },
        ]} value={mrf} onChange={setMrf} />
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.emviQ}</label>
        <div className="flex gap-2">
          <button onClick={() => setEmvi('yes')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${emvi === 'yes' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.yes}</button>
          <button onClick={() => setEmvi('no')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${emvi === 'no' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.no}</button>
        </div>
      </Card>

      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.nodesQ}</label>
        {mode === 'primary' ? (
          <OptionButtons options={nodesPrimaryOptions} value={nodesPrimary} onChange={setNodesPrimary} />
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setNodesRestaging('negative')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${nodesRestaging === 'negative' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.nodesRestagingNegative}</button>
            <button onClick={() => setNodesRestaging('positive')} className={`flex-1 p-2.5 rounded-lg border text-xs transition-all ${nodesRestaging === 'positive' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{c.nodesRestagingPositive}</button>
          </div>
        )}
        {mode === 'restaging' && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{c.nodesRestagingNote}</p>}
      </Card>

      {mode === 'restaging' && (
        <Card>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.mrTrgQ}</label>
          <OptionButtons options={trgOptions} value={mrTrg} onChange={setMrTrg} />
        </Card>
      )}

      {verdict && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <InfoBox tone={verdict.tone}>{verdict.text}</InfoBox>
        </Card>
      )}

      <InfoBox tone="slate">{c.lateralNodesNote}</InfoBox>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.rectalCancer} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasInteracted && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}:</span>
            <span className="text-sm font-bold leading-snug text-slate-800 dark:text-slate-100 block">
              {verdict ? verdict.text : c.pendingVerdict}
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

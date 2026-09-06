import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

// Lista de botones de opción única (patrón de PancreasResect/PancreaticCyst).
function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

// Toggle Sí/No (patrón compartido usado en PancreaticCyst).
function YesNo({ label, value, onChange, yesLabel, noLabel, helpText }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {helpText && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{helpText}</p>}
      <div className="flex gap-2">
        <button onClick={() => onChange(true)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === true ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{yesLabel}</button>
        <button onClick={() => onChange(false)} className={`flex-1 py-2 rounded-lg font-medium border text-sm transition-all ${value === false ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{noLabel}</button>
      </div>
    </div>
  );
}

export default function Cholangiocarcinoma() {
  const { t, lang } = useLang();
  const c = t.calc.cholangiocarcinoma;

  const [location, setLocation] = useState('perihilar'); // 'perihilar' | 'distal'
  const [morphology, setMorphology] = useState('periductal'); // 'periductal' | 'intraductal' | 'mass'
  const [bismuth, setBismuth] = useState('I'); // 'I' | 'II' | 'IIIa' | 'IIIb' | 'IV'
  const [artery, setArtery] = useState('none'); // 'none' | 'abutment' | 'encasement'
  const [vein, setVein] = useState('none'); // 'none' | 'abutment' | 'encasement'
  const [nodes, setNodes] = useState(null); // boolean
  const [metastasis, setMetastasis] = useState(null); // boolean
  const [frlvOk, setFrlvOk] = useState(null); // boolean

  const locationOptions = [
    { key: 'perihilar', label: c.locPerihilar },
    { key: 'distal', label: c.locDistal },
  ];
  const morphologyOptions = [
    { key: 'periductal', label: c.morphInfiltrating },
    { key: 'intraductal', label: c.morphIntraductal },
    { key: 'mass', label: c.morphMass },
  ];
  const bismuthOptions = [
    { key: 'I', label: c.bismuthI },
    { key: 'II', label: c.bismuthII },
    { key: 'IIIa', label: c.bismuthIIIa },
    { key: 'IIIb', label: c.bismuthIIIb },
    { key: 'IV', label: c.bismuthIV },
  ];
  const arteryOptions = [
    { key: 'none', label: c.arteryNone },
    { key: 'abutment', label: c.arteryAbutment },
    { key: 'encasement', label: c.arteryEncasement },
  ];
  const veinOptions = [
    { key: 'none', label: c.veinNone },
    { key: 'abutment', label: c.veinAbutment },
    { key: 'encasement', label: c.veinEncasement },
  ];

  // El veredicto requiere haber contestado linfonodos, metástasis y FRLV
  // además de los ejes de morfología/vascular (que siempre tienen un valor
  // por defecto). Antes de eso no mostramos un resultado.
  const hasAllInputs = nodes !== null && metastasis !== null && frlvOk !== null;

  // Lógica de resecabilidad (KSAR 2019, ver strings.*.js -> usage para citas):
  // Irresecable: metástasis a distancia, encasement/invasión arterial o venosa,
  // FRLV insuficiente, o Bismuth IV en tumor perihiliar.
  // Borderline: abutment (arterial o venoso) sin encasement, sin lo anterior.
  // Resecable: ninguno de los anteriores.
  let status = null; // 'resectable' | 'borderline' | 'unresectable'
  if (hasAllInputs) {
    if (metastasis || !frlvOk || artery === 'encasement' || vein === 'encasement' || (location === 'perihilar' && bismuth === 'IV')) {
      status = 'unresectable';
    } else if (artery === 'abutment' || vein === 'abutment') {
      status = 'borderline';
    } else {
      status = 'resectable';
    }
  }

  const statusTone = status === 'unresectable' ? 'red' : status === 'borderline' ? 'amber' : 'emerald';
  const statusColorClass = status === 'unresectable' ? 'text-red-500' : status === 'borderline' ? 'text-amber-500' : 'text-emerald-500';
  const statusTitle = status === 'unresectable' ? c.unresectableTitle : status === 'borderline' ? c.borderlineTitle : c.resectableTitle;
  const statusDesc = status === 'unresectable' ? c.unresectableDesc : status === 'borderline' ? c.borderlineDesc : c.resectableDesc;

  const handleCopy = () => {
    if (!status) return;
    const locText = location === 'perihilar' ? c.locPerihilar : c.locDistal;
    const morphText = morphology === 'periductal' ? c.morphInfiltrating : morphology === 'intraductal' ? c.morphIntraductal : c.morphMass;
    const artText = artery === 'none' ? c.arteryNone : artery === 'abutment' ? c.arteryAbutment : c.arteryEncasement;
    const veinText = vein === 'none' ? c.veinNone : vein === 'abutment' ? c.veinAbutment : c.veinEncasement;

    const lines = [
      c.reportTitle,
      `${c.findingLocation}: ${locText}`,
      `${c.findingMorphology}: ${morphText}`,
    ];
    if (location === 'perihilar') lines.push(`${c.findingBismuth}: ${c[`bismuth${bismuth}`]}`);
    lines.push(
      `${c.findingArtery}: ${artText}`,
      `${c.findingVein}: ${veinText}`,
      `${c.findingNodes}: ${nodes ? c.nodesYes : c.nodesNo}`,
      `${c.findingMeta}: ${metastasis ? c.metaYes : c.metaNo}`,
      `${c.findingRemnant}: ${frlvOk ? c.remnantOk : c.remnantLow}`,
      '',
      `${statusTitle}`,
      statusDesc,
    );
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  const resetAll = () => {
    setLocation('perihilar'); setMorphology('periductal'); setBismuth('I');
    setArtery('none'); setVein('none'); setNodes(null); setMetastasis(null); setFrlvOk(null);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${status ? 'pb-56' : ''}`}>
      <Card>
        <OptionList label={c.locationLabel} options={locationOptions} value={location} onChange={setLocation} />
      </Card>
      <Card>
        <OptionList label={c.morphologyLabel} options={morphologyOptions} value={morphology} onChange={setMorphology} />
      </Card>
      {location === 'perihilar' && (
        <Card>
          <OptionList label={c.bismuthLabel} options={bismuthOptions} value={bismuth} onChange={setBismuth} />
        </Card>
      )}
      <Card className="space-y-4">
        <OptionList label={c.arteryLabel} options={arteryOptions} value={artery} onChange={setArtery} />
        <OptionList label={c.veinLabel} options={veinOptions} value={vein} onChange={setVein} />
      </Card>
      <Card className="space-y-4">
        <YesNo label={c.nodesLabel} helpText={c.nodesHelp} value={nodes} onChange={setNodes} yesLabel={t.common.yes} noLabel={t.common.no} />
        <YesNo label={c.metastasisLabel} value={metastasis} onChange={setMetastasis} yesLabel={t.common.yes} noLabel={t.common.no} />
        <YesNo label={c.remnantLabel} value={frlvOk} onChange={setFrlvOk} yesLabel={c.remnantOk} noLabel={c.remnantLow} />
      </Card>

      {status && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.resultLabel}</span>
          <span className={`text-2xl font-black ${statusColorClass}`}>{statusTitle}</span>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{statusDesc}</p>
        </Card>
      )}

      <InfoBox tone="slate">{c.mdtNote}</InfoBox>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.cholangiocarcinoma} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {status && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className={`text-3xl font-black block leading-tight ${statusColorClass}`}>{statusTitle}</span>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-snug">{statusDesc}</p>
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

import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

// Botón de dos opciones (Sí/No), estilo reutilizado de otras calculadoras (ej. PancreaticCyst).
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

// Lista de botones de opción única (estilo PancreasResect/LIRADS).
function OptionList({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
      <div className="space-y-2">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${value === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

// Peso de cada criterio en el "espectro de confianza" de cada diagnóstico candidato.
// Fuentes: clase del Dr. Joaquín Hevia M. (agradecimientos Dr. Álvaro Huete G.) y sus citas
// (Kalb 2009, Demos 2002, Cohen-Scali 2003, Lee 2012, Low 2011, Thoeni 2012, Fernandez-del
// Castillo 2003, Spinelli 2004), más el primer de Sekhar (ACS 2018) y sus citas (Correa-Gallego
// 2010, Del Chiaro 2014, Gardner 2013). Solo se pondera positivamente la PRESENCIA de un hallazgo
// (no se penaliza por defecto la ausencia no evaluada); las contradicciones fuertes y bien
// establecidas en la literatura (ej. comunicación ductal para MCN, cápsula para SCA) sí restan.
function buildCandidates(inputs) {
  const { hasAge, hAge, sex, location, pancreatitisHx, architecture, ductComm, multifocal, calcification, centralScar, capsule, lobulatedContour, solidComponent } = inputs;

  const push = (arr, cond, w, key) => { if (cond) arr.push({ w, key }); };

  const items = {};

  // Pseudoquiste — "Paso 1" del algoritmo (siempre se debe descartar primero).
  { const m = [];
    push(m, pancreatitisHx, 4, 'critPseudoPancreatitis');
    push(m, architecture === 'unilocular', 2, 'critPseudoUnilocular');
    push(m, solidComponent === 'none', 1, 'critPseudoNoSolid');
    push(m, capsule, -2, 'critAgainstCapsule');
    push(m, solidComponent !== 'none', -2, 'critAgainstSolid');
    push(m, lobulatedContour, -1, 'critAgainstLobulated');
    items.pseudocyst = m;
  }
  // SCA microquística clásica.
  { const m = [];
    push(m, architecture === 'microcystic', 4, 'critScaMicrocystic');
    push(m, centralScar, 2, 'critScaScar');
    push(m, calcification === 'central', 1, 'critScaCalcCentral');
    push(m, hasAge && hAge > 60, 1, 'critScaAge');
    push(m, solidComponent !== 'none', -3, 'critAgainstSolid');
    push(m, architecture === 'solidCystic', -2, 'critAgainstSolidCystic');
    items.sca = m;
  }
  // SCA oligoquística/macroquística (variante que simula lesión mucinosa).
  { const m = [];
    push(m, lobulatedContour, 3, 'critScaOligoLobulated');
    push(m, architecture === 'oligocystic', 2, 'critScaOligoArch');
    push(m, sex === 'female', 1, 'critScaOligoFemale');
    push(m, hasAge && hAge > 50, 1, 'critScaOligoAge');
    push(m, location === 'head', 1, 'critScaOligoHead');
    push(m, solidComponent === 'none', 1, 'critPseudoNoSolid');
    push(m, capsule, -3, 'critAgainstCapsule');
    push(m, ductComm === 'yes', -2, 'critAgainstDuctComm');
    items.scaOligo = m;
  }
  // MCN (neoplasia quística mucinosa).
  { const m = [];
    push(m, capsule, 3, 'critMcnCapsule');
    push(m, sex === 'female', 2, 'critMcnFemale');
    push(m, location === 'bodytail', 2, 'critMcnBodyTail');
    push(m, architecture === 'oligocystic' || architecture === 'unilocular', 1, 'critMcnArch');
    push(m, hasAge && hAge >= 30 && hAge <= 60, 1, 'critMcnAge');
    push(m, calcification === 'peripheral', 1, 'critMcnCalcPeripheral');
    push(m, solidComponent === 'muralNodule', 1, 'critMcnNodule');
    push(m, ductComm === 'yes', -4, 'critAgainstDuctCommStrong');
    push(m, sex === 'male', -2, 'critAgainstMale');
    push(m, location === 'head', -1, 'critAgainstHeadForMcn');
    items.mcn = m;
  }
  // IPMN de rama secundaria (branch-duct).
  { const m = [];
    push(m, ductComm === 'yes', 4, 'critBdIpmnDuctComm');
    push(m, multifocal, 2, 'critBdIpmnMultifocal');
    push(m, location === 'head', 1, 'critBdIpmnHead');
    push(m, hasAge && hAge > 60, 1, 'critBdIpmnAge');
    push(m, architecture === 'oligocystic' || architecture === 'microcystic', 1, 'critBdIpmnArch');
    push(m, calcification !== 'none', 1, 'critBdIpmnCalc');
    push(m, capsule, -2, 'critAgainstCapsule');
    items.bdIpmn = m;
  }
  // SPN (neoplasia sólida pseudopapilar).
  { const m = [];
    push(m, hasAge && hAge < 40, 3, 'critSpnYoung');
    push(m, sex === 'female', 2, 'critSpnFemale');
    push(m, solidComponent === 'hemorrhagic', 2, 'critSpnHemorrhagic');
    push(m, architecture === 'solidCystic', 1, 'critSpnArch');
    push(m, hasAge && hAge > 60, -2, 'critAgainstOld');
    items.spn = m;
  }
  // TNE quístico (tumor neuroendocrino con degeneración quística).
  { const m = [];
    push(m, solidComponent === 'thickIrregularWall', 3, 'critNetThickWall');
    push(m, architecture === 'solidCystic' || architecture === 'unilocular', 1, 'critNetArch');
    push(m, pancreatitisHx, -2, 'critAgainstPancreatitisHxForNet');
    items.cysticNet = m;
  }

  const score = (m) => m.reduce((s, c) => s + c.w, 0);
  const matched = (m) => m.filter(c => c.w > 0).map(c => c.key);

  return Object.entries(items).map(([key, m]) => ({ key, score: score(m), matched: matched(m) }));
}

export default function PancreaticCystDx() {
  const { t } = useLang();
  const c = t.calc.pancreaticCystDx;

  const [age, setAge] = useState('');
  const [sex, setSex] = useState(null); // 'female' | 'male' | null
  const [location, setLocation] = useState(null); // 'head' | 'bodytail' | null
  const [pancreatitisHx, setPancreatitisHx] = useState(false);
  const [architecture, setArchitecture] = useState(null); // 'unilocular' | 'oligocystic' | 'microcystic' | 'solidCystic' | null
  const [ductComm, setDuctComm] = useState(null); // 'yes' | 'no' | 'unknown' | null
  const [multifocal, setMultifocal] = useState(false);
  const [mainDuctPattern, setMainDuctPattern] = useState('none'); // 'none' | 'focal' | 'diffuse'
  const [chronicPancreatitisParenchyma, setChronicPancreatitisParenchyma] = useState(false);
  const [centralScar, setCentralScar] = useState(false);
  const [capsule, setCapsule] = useState(false);
  const [lobulatedContour, setLobulatedContour] = useState(false);
  const [calcification, setCalcification] = useState('none'); // 'none' | 'central' | 'peripheral'
  const [solidComponent, setSolidComponent] = useState('none'); // 'none' | 'muralNodule' | 'thickIrregularWall' | 'hemorrhagic'

  const hAge = parseFloat(age);
  const hasAge = !isNaN(hAge);

  const architectureOptions = [
    { key: 'unilocular', label: c.archUnilocular },
    { key: 'oligocystic', label: c.archOligocystic },
    { key: 'microcystic', label: c.archMicrocystic },
    { key: 'solidCystic', label: c.archSolidCystic },
  ];
  const ductCommOptions = [
    { key: 'yes', label: c.ductCommYes },
    { key: 'no', label: c.ductCommNo },
    { key: 'unknown', label: c.ductCommUnknown },
  ];
  const mainDuctPatternOptions = [
    { key: 'none', label: c.mainDuctNone },
    { key: 'focal', label: c.mainDuctFocal },
    { key: 'diffuse', label: c.mainDuctDiffuse },
  ];
  const calcificationOptions = [
    { key: 'none', label: c.calcificationNone },
    { key: 'central', label: c.calcificationCentral },
    { key: 'peripheral', label: c.calcificationPeripheral },
  ];
  const solidComponentOptions = [
    { key: 'none', label: c.solidNone },
    { key: 'muralNodule', label: c.solidMuralNodule },
    { key: 'thickIrregularWall', label: c.solidThickWall },
    { key: 'hemorrhagic', label: c.solidHemorrhagic },
  ];
  const locationOptions = [
    { key: 'head', label: c.locationHead },
    { key: 'bodytail', label: c.locationBodyTail },
  ];
  const sexOptions = [
    { key: 'female', label: c.sexFemale },
    { key: 'male', label: c.sexMale },
  ];

  const hasCoreInputs = architecture !== null && ductComm !== null;

  const DX_LABEL = {
    pseudocyst: c.dxPseudocyst, sca: c.dxSca, scaOligo: c.dxScaOligo, mcn: c.dxMcn,
    bdIpmn: c.dxBdIpmn, spn: c.dxSpn, cysticNet: c.dxCysticNet,
  };

  const candidates = hasCoreInputs
    ? buildCandidates({ hasAge, hAge, sex, location, pancreatitisHx, architecture, ductComm, multifocal, calcification, centralScar, capsule, lobulatedContour, solidComponent })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
    : [];

  const tierOf = (score) => score >= 6 ? { tone: 'emerald', label: c.tierHigh } : score >= 3 ? { tone: 'amber', label: c.tierModerate } : { tone: 'slate', label: c.tierLow };

  // Alerta de MCN de bajo grado que simula pseudoquiste (Sekhar 2018): mujer, edad media,
  // cuerpo/cola, con cápsula u oligoquístico, pese al antecedente de pancreatitis.
  const showMcnMimicsPseudocystCaution = hasCoreInputs && candidates[0]?.key === 'pseudocyst' && pancreatitisHx &&
    sex === 'female' && location === 'bodytail' && (capsule || architecture === 'oligocystic');

  // IPMN de conducto principal: dilatación ductal difusa/focal sin lesión quística discreta,
  // una vez descartada razonablemente la pancreatitis crónica como causa alternativa.
  const showMainDuctIpmnAlert = mainDuctPattern !== 'none';

  const topKey = candidates[0]?.key || null;

  const handleCopy = () => {
    const lines = [c.reportTitle];
    if (age !== '') lines.push(c.reportLineAge(age));
    if (sex) lines.push(c.reportLineSex(sex === 'female' ? c.sexFemale : c.sexMale));
    if (location) lines.push(c.reportLineLocation(location === 'head' ? c.locationHead : c.locationBodyTail));
    if (architecture) lines.push(c.reportLineArch(architectureOptions.find(o => o.key === architecture)?.label));
    if (ductComm) lines.push(c.reportLineDuctComm(ductCommOptions.find(o => o.key === ductComm)?.label));
    if (candidates.length > 0) {
      lines.push(c.reportSpectrumTitle);
      candidates.slice(0, 5).forEach(x => lines.push(`- ${DX_LABEL[x.key]} (${tierOf(x.score).label})`));
    } else {
      lines.push(c.reportNoSpectrum);
    }
    if (showMainDuctIpmnAlert) lines.push(c.mainDuctIpmnAlert);
    if (showMcnMimicsPseudocystCaution) lines.push(c.mcnMimicsPseudocystCaution);
    lines.push(c.reportDisclaimer);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  const resetAll = () => {
    setAge(''); setSex(null); setLocation(null); setPancreatitisHx(false); setArchitecture(null);
    setDuctComm(null); setMultifocal(false); setMainDuctPattern('none'); setChronicPancreatitisParenchyma(false);
    setCentralScar(false); setCapsule(false); setLobulatedContour(false); setCalcification('none'); setSolidComponent('none');
  };

  const showResult = hasCoreInputs;

  return (
    <div className={`space-y-4 animate-in fade-in ${showResult ? 'pb-56' : ''}`}>
      <InfoBox tone="slate">{c.introNote}</InfoBox>

      <Card className="space-y-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.sectionClinicalTitle}</p>
        <NumberField label={c.ageLabel} value={age} onChange={setAge} />
        <OptionList label={c.sexLabel} options={sexOptions} value={sex} onChange={setSex} />
        <OptionList label={c.locationLabel} options={locationOptions} value={location} onChange={setLocation} />
        <YesNo label={c.pancreatitisHxLabel} value={pancreatitisHx} onChange={setPancreatitisHx} yesLabel={t.common.yes} noLabel={t.common.no} />
      </Card>

      <Card className="space-y-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.sectionArchTitle}</p>
        <OptionList label={c.archLabel} options={architectureOptions} value={architecture} onChange={setArchitecture} />
        <OptionList label={c.ductCommLabel} options={ductCommOptions} value={ductComm} onChange={setDuctComm} />
        <YesNo label={c.multifocalLabel} value={multifocal} onChange={setMultifocal} yesLabel={t.common.yes} noLabel={t.common.no} />
      </Card>

      <Card className="space-y-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.sectionMorphTitle}</p>
        <YesNo label={c.centralScarLabel} value={centralScar} onChange={setCentralScar} yesLabel={t.common.yes} noLabel={t.common.no} />
        <YesNo label={c.capsuleLabel} value={capsule} onChange={setCapsule} yesLabel={t.common.yes} noLabel={t.common.no} />
        <YesNo label={c.lobulatedContourLabel} value={lobulatedContour} onChange={setLobulatedContour} yesLabel={t.common.yes} noLabel={t.common.no} />
        <OptionList label={c.calcificationLabel} options={calcificationOptions} value={calcification} onChange={setCalcification} />
        <OptionList label={c.solidComponentLabel} options={solidComponentOptions} value={solidComponent} onChange={setSolidComponent} />
      </Card>

      <Card className="space-y-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.sectionMainDuctTitle}</p>
        <OptionList label={c.mainDuctLabel} options={mainDuctPatternOptions} value={mainDuctPattern} onChange={setMainDuctPattern} />
        {mainDuctPattern !== 'none' && (
          <YesNo label={c.chronicPancreatitisParenchymaLabel} value={chronicPancreatitisParenchyma} onChange={setChronicPancreatitisParenchyma} yesLabel={t.common.yes} noLabel={t.common.no} />
        )}
      </Card>

      {showMainDuctIpmnAlert && !chronicPancreatitisParenchyma && (
        <InfoBox tone="red">{c.mainDuctIpmnAlert}</InfoBox>
      )}
      {showMainDuctIpmnAlert && chronicPancreatitisParenchyma && (
        <InfoBox tone="amber">{c.mainDuctChronicPancreatitisNote}</InfoBox>
      )}

      {!hasCoreInputs && (
        <InfoBox tone="amber">{c.needCoreInputsNote}</InfoBox>
      )}

      {hasCoreInputs && candidates.length === 0 && (
        <InfoBox tone="slate">{c.noClearPatternNote}</InfoBox>
      )}

      {hasCoreInputs && candidates.length > 0 && (
        <Card className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.spectrumTitle}</p>
          <div className="space-y-3">
            {candidates.slice(0, 5).map((x) => {
              const tier = tierOf(x.score);
              const toneText = tier.tone === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : tier.tone === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400';
              return (
                <div key={x.key} className="border-t border-slate-100 dark:border-slate-700 pt-3 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{DX_LABEL[x.key]}</span>
                    <span className={`text-xs font-bold uppercase shrink-0 ${toneText}`}>{tier.label}</span>
                  </div>
                  {x.matched.length > 0 && (
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-500 dark:text-slate-400 list-disc pl-4">
                      {x.matched.map((k, i) => <li key={i}>{c[k]}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {showMcnMimicsPseudocystCaution && (
        <InfoBox tone="amber">{c.mcnMimicsPseudocystCaution}</InfoBox>
      )}

      {hasCoreInputs && candidates.length > 0 && (
        <InfoBox tone="slate">{c.continueToAcrNote}</InfoBox>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.pancreaticCystDx} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {showResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.stickyLabel}</span>
            <span className="text-xl font-black block mt-1 leading-tight text-blue-600 dark:text-blue-400">
              {topKey ? DX_LABEL[topKey] : c.noClearPatternShort}
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

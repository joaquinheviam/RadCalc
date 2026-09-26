import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconBookOpen } from '../components/icons/index.js';
import { ItmigCompartmentsScheme } from '../components/schematics/ItmigCompartmentsScheme.jsx';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, Accordion, ZoomableDiagram } from '../components/shared/index.js';

// Masas mediastínicas: diferencial ordenado según compartimento ITMIG, edad,
// sexo, hallazgos de imagen y datos clínicos. Cada regla suma o resta peso a
// un diagnóstico y deja su motivo a la vista ("a favor" / "en contra"); no
// hay puntajes numéricos visibles porque son orientativos, no validados.
// Fuentes de cada regla: clase ITMIG (Hevia), Carter 2017, Taka 2023,
// Koyasu 2024, Mura 2025, Jain 2025, Ackman 2015 (ver REFERENCES.mediastinalMass).

// Hallazgos que se pueden marcar en cada compartimento (claves de strings).
const FINDINGS = {
  prevascular: {
    imaging: ['thyroid', 'fat', 'calcification', 'pureCyst', 'cystSolid', 'homogeneousSolid', 'heterogeneousSolid', 'opposedPhaseDrop', 'lymphadenopathy', 'invasion', 'lungMets'],
    clinical: ['myasthenia', 'bSymptoms', 'bhcg', 'afp', 'markersNegative', 'reboundTrigger', 'treatedLymphoma', 'hypercalcemia', 'knownPrimary'],
  },
  visceral: {
    imaging: ['cystSubcarinal', 'cystEsophageal', 'cystCardiophrenic', 'nodes', 'calcifiedNodes', 'hypervascular', 'esophagealWall'],
    clinical: ['bSymptoms', 'knownPrimary', 'catecholamines'],
  },
  paravertebral: {
    imaging: ['dumbbell', 'fusiformChain', 'calcification', 'csfCyst', 'bilateralLobulated', 'boneDestruction', 'discEndplate'],
    clinical: ['nf1', 'catecholamines', 'hemolyticAnemia', 'fever', 'knownPrimary'],
  },
};

// Reglas: dx afectado, condición, peso (+ a favor / − en contra) y motivo.
// s = { age (número o null), sex ('f'|'m'|null), f: Set de hallazgos }.
const adult40 = (s) => s.age !== null && s.age >= 40;
const under40 = (s) => s.age !== null && s.age < 40;
const under20 = (s) => s.age !== null && s.age < 20;
const child = (s) => s.age !== null && s.age < 10;
const has = (k) => (s) => s.f.has(k);
const male = (s) => s.sex === 'm';
const female = (s) => s.sex === 'f';
const and = (...fns) => (s) => fns.every((fn) => fn(s));
const not = (fn) => (s) => !fn(s);

const RULES = {
  prevascular: [
    // Bocio: continuidad con la tiroides es casi diagnóstica.
    ['goiter', has('thyroid'), 6, 'thyroid'],
    // Timoma: > 40 años, calcificación en masa sólida, paraneoplásicos.
    ['thymoma', adult40, 2, 'age40plus'],
    ['thymoma', under20, -3, 'rareUnder20'],
    ['thymoma', has('calcification'), 2, 'calcification'],
    ['thymoma', has('homogeneousSolid'), 1, 'homogeneousSolid'],
    ['thymoma', has('myasthenia'), 3, 'myasthenia'],
    ['thymoma', has('invasion'), 1, 'invasion'],
    ['thymoma', has('cystSolid'), 1, 'cystSolid'],
    // Masa quística prevascular > 40 años con miastenia: timoma quístico (Jain 2025).
    ['thymoma', and(adult40, has('myasthenia'), (s) => s.f.has('pureCyst') || s.f.has('cystSolid')), 2, 'cysticThymoma'],
    ['thymoma', has('opposedPhaseDrop'), -6, 'opposedPhaseDrop'],
    ['thymoma', (s) => s.f.has('bhcg') || s.f.has('afp'), -3, 'markersUp'],
    // Carcinoma tímico: adulto, adenopatías, metástasis, invasión.
    ['thymicCarcinoma', adult40, 1, 'age40plus'],
    ['thymicCarcinoma', has('lymphadenopathy'), 2, 'lymphadenopathy'],
    ['thymicCarcinoma', has('lungMets'), 2, 'lungMets'],
    ['thymicCarcinoma', has('invasion'), 2, 'invasion'],
    ['thymicCarcinoma', has('heterogeneousSolid'), 1, 'heterogeneousSolid'],
    ['thymicCarcinoma', has('opposedPhaseDrop'), -6, 'opposedPhaseDrop'],
    ['thymicCarcinoma', has('myasthenia'), -1, 'myastheniaRareInCarcinoma'],
    ['thymicCarcinoma', under20, -3, 'rareUnder20'],
    // Linfoma: joven, síntomas B, adenopatías; no calcifica sin tratamiento.
    ['lymphoma', under40, 2, 'under40'],
    ['lymphoma', and(female, (s) => s.age !== null && s.age >= 15 && s.age < 40), 1, 'youngWoman'],
    ['lymphoma', and(male, under20), 1, 'maleUnder20'],
    ['lymphoma', has('bSymptoms'), 3, 'bSymptoms'],
    ['lymphoma', has('lymphadenopathy'), 2, 'lymphadenopathyEncases'],
    ['lymphoma', has('homogeneousSolid'), 1, 'homogeneousSolid'],
    ['lymphoma', has('treatedLymphoma'), 4, 'treatedLymphoma'],
    ['lymphoma', and(has('calcification'), not(has('treatedLymphoma'))), -4, 'calcificationUntreated'],
    ['lymphoma', has('opposedPhaseDrop'), -6, 'opposedPhaseDrop'],
    ['lymphoma', (s) => s.f.has('bhcg') || s.f.has('afp'), -3, 'markersUp'],
    ['lymphoma', has('lungMets'), -2, 'lungMetsNotLymphoma'],
    // Seminoma: hombre < 40 años, masa homogénea; AFP siempre normal.
    ['seminoma', male, 2, 'male'],
    ['seminoma', female, -5, 'femaleGct'],
    ['seminoma', under40, 2, 'under40'],
    ['seminoma', adult40, -3, 'gctOver40'],
    ['seminoma', has('homogeneousSolid'), 1, 'homogeneousSolid'],
    ['seminoma', has('bhcg'), 2, 'bhcgSeminoma'],
    ['seminoma', has('afp'), -5, 'afpExcludesSeminoma'],
    ['seminoma', has('lungMets'), 1, 'lungMets'],
    ['seminoma', has('opposedPhaseDrop'), -6, 'opposedPhaseDrop'],
    // No seminomatoso: hombre < 40, heterogéneo, AFP/β-hCG, metástasis.
    ['nsgct', male, 2, 'male'],
    ['nsgct', female, -5, 'femaleGct'],
    ['nsgct', under40, 2, 'under40'],
    ['nsgct', adult40, -3, 'gctOver40'],
    ['nsgct', has('heterogeneousSolid'), 1, 'heterogeneousSolid'],
    ['nsgct', has('afp'), 5, 'afp'],
    ['nsgct', has('bhcg'), 3, 'bhcg'],
    ['nsgct', has('lungMets'), 2, 'lungMets'],
    ['nsgct', has('markersNegative'), -4, 'markersNegativeNsgct'],
    ['nsgct', has('opposedPhaseDrop'), -6, 'opposedPhaseDrop'],
    // Teratoma maduro: joven, H = M, grasa, calcificación, quístico.
    ['teratoma', under40, 1, 'under40'],
    ['teratoma', adult40, -1, 'teratomaOver40'],
    ['teratoma', and(female, (s) => s.f.has('fat') || s.f.has('calcification') || s.f.has('cystSolid')), 1, 'femaleGctTeratoma'],
    ['teratoma', has('fat'), 4, 'fat'],
    ['teratoma', has('calcification'), 2, 'calcification'],
    ['teratoma', has('cystSolid'), 2, 'cystSolidSepta'],
    ['teratoma', (s) => s.f.has('bhcg') || s.f.has('afp'), -2, 'markersUp'],
    // Timolipoma / lipoma: grasa sin calcio.
    ['thymolipoma', and(has('fat'), not(has('calcification')), not(has('cystSolid'))), 3, 'fatNoCalcium'],
    ['thymolipoma', and(has('fat'), has('myasthenia')), 1, 'myasthenia'],
    // Hiperplasia tímica: caída de señal en fase opuesta, gatillo de rebote.
    ['hyperplasia', has('opposedPhaseDrop'), 6, 'opposedPhaseDropFavors'],
    ['hyperplasia', has('reboundTrigger'), 3, 'reboundTrigger'],
    ['hyperplasia', under40, 1, 'under40'],
    ['hyperplasia', has('myasthenia'), 1, 'myastheniaFollicular'],
    ['hyperplasia', has('calcification'), -3, 'calcification'],
    // Quiste tímico.
    ['thymicCyst', has('pureCyst'), 6, 'pureCyst'],
    ['thymicCyst', has('cystSolid'), -3, 'cystSolidNotSimple'],
    ['thymicCyst', and(adult40, has('myasthenia')), -2, 'cysticThymoma'],
    // Adenoma paratiroideo ectópico.
    ['parathyroid', has('hypercalcemia'), 5, 'hypercalcemia'],
    // Metástasis.
    ['metastasis', has('knownPrimary'), 4, 'knownPrimary'],
    ['metastasis', and(has('knownPrimary'), has('lymphadenopathy')), 1, 'lymphadenopathy'],
  ],
  visceral: [
    ['bronchogenicCyst', has('cystSubcarinal'), 6, 'cystSubcarinal'],
    ['esophagealDuplication', has('cystEsophageal'), 6, 'cystEsophageal'],
    ['esophagealDuplication', and(has('cystEsophageal'), child), 1, 'childDuplication'],
    ['pericardialCyst', has('cystCardiophrenic'), 6, 'cystCardiophrenic'],
    ['lymphomaNodes', and(has('nodes'), has('bSymptoms')), 3, 'bSymptoms'],
    ['lymphomaNodes', and(has('nodes'), under40), 2, 'under40'],
    ['lymphomaNodes', has('calcifiedNodes'), -3, 'calcificationUntreated'],
    ['metastaticNodes', and(has('nodes'), has('knownPrimary')), 4, 'knownPrimary'],
    ['metastaticNodes', and(has('nodes'), adult40), 1, 'age40plus'],
    ['granulomatousNodes', has('calcifiedNodes'), 5, 'calcifiedNodes'],
    ['paraganglioma', has('hypervascular'), 3, 'hypervascular'],
    ['paraganglioma', has('catecholamines'), 4, 'catecholamines'],
    ['castleman', has('hypervascular'), 3, 'hypervascular'],
    ['castleman', and(has('hypervascular'), (s) => s.age !== null && s.age >= 20 && s.age < 50), 1, 'castlemanAge'],
    ['hypervascularMets', and(has('hypervascular'), has('knownPrimary')), 4, 'knownPrimaryHypervascular'],
    ['esophagealTumor', has('esophagealWall'), 5, 'esophagealWall'],
    ['esophagealTumor', and(has('esophagealWall'), (s) => s.age !== null && s.age >= 60), 1, 'age60plus'],
  ],
  paravertebral: [
    ['nerveSheath', has('dumbbell'), 4, 'dumbbell'],
    ['nerveSheath', (s) => s.age !== null && s.age >= 18, 2, 'adultNerveSheath'],
    ['nerveSheath', has('nf1'), 2, 'nf1Neurofibroma'],
    ['nerveSheath', child, -2, 'childSympathetic'],
    ['mpnst', has('boneDestruction'), 2, 'boneDestructionNeurogenic'],
    ['mpnst', and(has('nf1'), has('boneDestruction')), 2, 'nf1'],
    ['neuroblastoma', child, 4, 'child'],
    ['neuroblastoma', and(child, has('calcification')), 2, 'calcificationNeuroblastoma'],
    ['neuroblastoma', has('catecholamines'), 3, 'catecholaminesMibg'],
    ['neuroblastoma', (s) => s.age !== null && s.age >= 18, -4, 'adultNeuroblastoma'],
    ['ganglioneuroma', has('fusiformChain'), 4, 'fusiformChain'],
    ['ganglioneuroma', under40, 1, 'under40'],
    ['ganglioneuroma', has('calcification'), 1, 'calcificationGanglioneuroma'],
    ['meningocele', has('csfCyst'), 6, 'csfCyst'],
    ['meningocele', has('nf1'), 2, 'nf1Meningocele'],
    ['emh', has('bilateralLobulated'), 3, 'bilateralLobulated'],
    ['emh', has('hemolyticAnemia'), 4, 'hemolyticAnemia'],
    ['spondylodiscitis', has('discEndplate'), 4, 'discEndplate'],
    ['spondylodiscitis', has('fever'), 2, 'fever'],
    ['vertebralMets', has('knownPrimary'), 3, 'knownPrimary'],
    ['vertebralMets', and(has('boneDestruction'), not(has('discEndplate'))), 2, 'boneDestruction'],
  ],
};

// Motivos de apoyo (demográficos o clínicos inespecíficos): por sí solos no
// bastan para listar un diagnóstico (p. ej., "hombre" no debe sugerir
// seminoma, ni la miastenia sola una hiperplasia, sin un hallazgo propio).
const DEMOGRAPHIC = new Set(['age40plus', 'age60plus', 'under40', 'youngWoman', 'maleUnder20', 'male', 'child', 'adultNerveSheath', 'castlemanAge', 'myastheniaFollicular']);

function rankDifferential(compartment, s) {
  const byDx = {};
  for (const [dx, when, w, why] of RULES[compartment] || []) {
    if (!when(s)) continue;
    const d = (byDx[dx] ||= { dx, score: 0, pros: [], cons: [] });
    d.score += w;
    (w > 0 ? d.pros : d.cons).push(why);
  }
  return Object.values(byDx)
    .filter((d) => d.score > 0 && d.pros.some((why) => !DEMOGRAPHIC.has(why)))
    .sort((a, b) => b.score - a.score);
}

const segBtn = (active) =>
  `flex-1 py-2 text-sm font-medium rounded-lg transition-all ${active ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`;

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
    >
      {children}
    </button>
  );
}

export default function MediastinalMass() {
  const { t } = useLang();
  const c = t.calc.mediastinalMass;
  const [showPreview, setShowPreview] = useState(false);
  const [age, setAge] = useState('');
  const [sex, setSex] = useState(null); // 'f' | 'm'
  const [compartment, setCompartment] = useState(null);
  const [findings, setFindings] = useState(() => new Set());

  const ageVal = parseFloat(String(age).replace(',', '.'));
  const ageNum = Number.isFinite(ageVal) && ageVal >= 0 && ageVal < 120 ? ageVal : null;
  const chooseCompartment = (k) => { setCompartment(k); setFindings(new Set()); };
  const toggle = (k) => setFindings((prev) => {
    const next = new Set(prev);
    if (next.has(k)) next.delete(k); else next.add(k);
    return next;
  });
  const resetAll = () => { setAge(''); setSex(null); setCompartment(null); setFindings(new Set()); };

  const state = { age: ageNum, sex, f: findings };
  const ranked = compartment ? rankDifferential(compartment, state) : [];
  const top = ranked.slice(0, 4);
  const hasResult = top.length > 0;

  // Notas contextuales según el hallazgo marcado.
  const notes = [];
  if (compartment === 'prevascular') {
    if (findings.has('pureCyst') || findings.has('cystSolid')) notes.push(['emerald', c.noteCysticMri]);
    if (findings.has('calcification')) notes.push(['slate', c.noteCalcification]);
    if (top[0]?.dx === 'thymoma' && !findings.has('lymphadenopathy') && !findings.has('bSymptoms')) notes.push(['amber', c.noteNccn]);
    if (!ageNum || !sex) notes.push(['slate', c.noteDemographics]);
  }
  if (compartment === 'visceral' && ['cystSubcarinal', 'cystEsophageal', 'cystCardiophrenic'].some((k) => findings.has(k))) notes.push(['emerald', c.noteCysticMri]);
  if (compartment === 'paravertebral') notes.push(['slate', c.noteParavertebralMri]);

  const reasonList = (keys) => keys.map((k) => c.reasons[k]).join('; ');
  const getReportText = () => {
    if (!hasResult) return '';
    const findingLabels = [...findings].map((k) => c.findings[k]);
    return c.reportText({
      age: ageNum,
      sex: sex ? c.sexLabels[sex] : null,
      compartment: c.compartments[compartment],
      findings: findingLabels,
      ranked: top.map((d) => ({ dx: c.dx[d.dx], pros: reasonList(d.pros) })),
    });
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const groups = compartment ? FINDINGS[compartment] : null;

  return (
    <div className={`space-y-4 animate-in fade-in ${hasResult ? 'pb-56' : ''}`}>
      <Card className="space-y-4">
        <div className="grid grid-cols-2 gap-3 items-end">
          <NumberField label={c.ageLabel} placeholder="Ej: 45" value={age} onChange={setAge} />
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.sexLabel}</label>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button onClick={() => setSex('f')} className={segBtn(sex === 'f')}>{c.sexLabels.f}</button>
              <button onClick={() => setSex('m')} className={segBtn(sex === 'm')}>{c.sexLabels.m}</button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.compartmentQ}</label>
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(FINDINGS).map((k) => (
              <Chip key={k} active={compartment === k} onClick={() => chooseCompartment(k)}>{c.compartments[k]}</Chip>
            ))}
          </div>
        </div>
      </Card>

      {/* Esquema de compartimentos (Gemini, estilo Carter 2017), integrado sin cambios; resalta el compartimento elegido. */}
      <Accordion icon={<IconBookOpen size={16} />} title={c.diagramTitle}>
        <ZoomableDiagram title={c.diagramTitle} labels={t.common.diagramZoom}>
          <ItmigCompartmentsScheme labels={c.diagramLabels} highlight={compartment} />
        </ZoomableDiagram>
      </Accordion>

      {groups && (
        <Card className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{c.imagingQ}</label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.multiHint}</p>
            <div className="grid grid-cols-1 gap-2">
              {groups.imaging.map((k) => <Chip key={k} active={findings.has(k)} onClick={() => toggle(k)}>{c.findings[k]}</Chip>)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.clinicalQ}</label>
            <div className="grid grid-cols-1 gap-2">
              {groups.clinical.map((k) => <Chip key={k} active={findings.has(k)} onClick={() => toggle(k)}>{c.findings[k]}</Chip>)}
            </div>
          </div>
        </Card>
      )}

      {compartment && !hasResult && (
        <InfoBox tone="slate">{c.noPattern}</InfoBox>
      )}

      {hasResult && (
        <Card className="space-y-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase font-semibold tracking-wide">{c.resultLabel}</span>
          <ol className="space-y-2">
            {top.map((d, i) => (
              <li key={d.dx} className={`rounded-xl border p-3 ${i === 0 ? 'border-blue-300 dark:border-blue-500/40 bg-blue-50/60 dark:bg-blue-500/10' : 'border-slate-100 dark:border-slate-700'}`}>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xs font-bold ${i === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{i + 1}.</span>
                  <span className={`font-bold ${i === 0 ? 'text-base text-slate-800 dark:text-slate-100' : 'text-sm text-slate-700 dark:text-slate-200'}`}>{c.dx[d.dx]}</span>
                  {i === 0 && <span className="ml-auto text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{c.mostLikely}</span>}
                </div>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 leading-snug"><span className="font-semibold">{c.prosLabel}:</span> {reasonList(d.pros)}</p>
                {d.cons.length > 0 && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400 leading-snug"><span className="font-semibold">{c.consLabel}:</span> {reasonList(d.cons)}</p>}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {notes.map(([tone, text]) => <InfoBox key={text} tone={tone}>{text}</InfoBox>)}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.mediastinalMass} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasResult && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.mostLikely}</span>
            <span className="text-lg font-black block leading-tight text-slate-800 dark:text-slate-100 line-clamp-2">{c.dx[top[0].dx]}</span>
          </div>
          <div className="flex items-start gap-5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} caption={t.common.reset} />
            <PreviewIconButton onClick={() => setShowPreview(true)} label={t.common.showReport} caption={t.common.showReportCaption} />
            <CopyIconButton onClick={handleCopy} label={t.common.copyReport} caption={t.common.copy} />
          </div>
        </StickyBar>
      )}
      <ReportPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        closeLabel={t.common.closeAria}
        title={t.common.reportPreviewTitle}
        reportText={getReportText()}
        onCopy={handleCopy}
        copyLabel={t.common.copyReport}
      />
    </div>
  );
}

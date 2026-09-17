import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

const HUNT_HESS_ROMAN = ['I', 'II', 'III', 'IV', 'V'];

function GradeSelector({ label, value, onChange, options, defs, labels }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</h3>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 min-w-[2.5rem] py-2 rounded-lg font-bold border transition-colors ${value === opt ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            {labels ? labels[i] : opt}
          </button>
        ))}
      </div>
      {value !== null && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-snug">{defs[options.indexOf(value)]}</p>}
    </div>
  );
}

export default function SAHGrading() {
  const { t } = useLang();
  const c = t.calc.sahGrading;
  const [fisher, setFisher] = useState(null);
  const [modFisher, setModFisher] = useState(null);
  const [huntHess, setHuntHess] = useState(null);
  const [huntHessModifier, setHuntHessModifier] = useState(false);

  const fisherResult = fisher === null ? null : fisher <= 2 ? c.fisherResultLow : fisher === 3 ? c.fisherResultHigh : c.fisherResultGroup4;
  const modFisherResult = modFisher === null ? null : c.modFisherRisk[modFisher];

  const huntHessEffective = huntHess === null ? null : Math.min(5, huntHess + (huntHessModifier ? 1 : 0));
  const huntHessResult = huntHessEffective === null ? null : huntHessEffective <= 2 ? c.huntHessResultLow : c.huntHessResultHigh;

  const hasAny = fisher !== null || modFisher !== null || huntHess !== null;

  const handleCopy = () => {
    const lines = [];
    if (fisher !== null) lines.push(`${c.fisherResultLabel}: ${fisher} — ${fisherResult}`);
    if (modFisher !== null) lines.push(`${c.modFisherResultLabel}: ${modFisher} — ${modFisherResult}`);
    if (huntHess !== null) {
      lines.push(`${c.huntHessResultLabel}: ${HUNT_HESS_ROMAN[huntHess - 1]}${huntHessModifier ? ` → ${c.huntHessEffectiveLabel}: ${HUNT_HESS_ROMAN[huntHessEffective - 1]}` : ''} — ${huntHessResult}`);
    }
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setFisher(null); setModFisher(null); setHuntHess(null); setHuntHessModifier(false); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAny ? 'pb-56' : ''}`}>
      <Card>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{c.fisherTitle}</p>
        <GradeSelector label={c.fisherResultLabel} value={fisher} onChange={setFisher} options={[1, 2, 3, 4]} defs={c.fisherDefs} />
        {fisherResult && <InfoBox tone={fisher <= 2 ? 'emerald' : fisher === 3 ? 'red' : 'slate'}>{fisherResult}</InfoBox>}
      </Card>

      <Card>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{c.modFisherTitle}</p>
        <GradeSelector label={c.modFisherResultLabel} value={modFisher} onChange={setModFisher} options={[0, 1, 2, 3, 4]} defs={c.modFisherDefs} />
        {modFisherResult && <InfoBox tone={modFisher === 0 ? 'emerald' : modFisher === 4 ? 'red' : 'amber'}>{modFisherResult}</InfoBox>}
      </Card>

      <Card>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{c.huntHessTitle}</p>
        <GradeSelector label={c.huntHessResultLabel} value={huntHess} onChange={setHuntHess} options={[1, 2, 3, 4, 5]} labels={HUNT_HESS_ROMAN} defs={c.huntHessDefs} />
        <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 pt-1">
          <input type="checkbox" checked={huntHessModifier} onChange={() => setHuntHessModifier((v) => !v)} className="w-4 h-4 rounded mt-0.5" />
          <span>{c.huntHessModifierLabel}</span>
        </label>
        {huntHessModifier && <p className="text-xs text-slate-400 dark:text-slate-500">{c.huntHessModifierNote}</p>}
        {huntHess !== null && huntHessModifier && (
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {c.huntHessEffectiveLabel}: {HUNT_HESS_ROMAN[huntHessEffective - 1]}
          </p>
        )}
        {huntHessResult && <InfoBox tone={huntHessEffective <= 2 ? 'emerald' : 'amber'}>{huntHessResult}</InfoBox>}
      </Card>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.sahGrading} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasAny && (
        <StickyBar>
          <div className="min-w-0 text-center text-sm">
            {fisher !== null && <span className="block text-slate-700 dark:text-slate-200 font-bold">Fisher {fisher}</span>}
            {modFisher !== null && <span className="block text-slate-700 dark:text-slate-200 font-bold">Fisher-mod {modFisher}</span>}
            {huntHess !== null && (
              <span className="block text-slate-700 dark:text-slate-200 font-bold">
                Hunt-Hess {HUNT_HESS_ROMAN[huntHess - 1]}{huntHessModifier ? ` → ${HUNT_HESS_ROMAN[huntHessEffective - 1]}` : ''}
              </span>
            )}
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

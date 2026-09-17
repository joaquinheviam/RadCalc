import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function GradeSelector({ label, value, onChange, defs }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</h3>
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((g) => (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${value === g ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            {g}
          </button>
        ))}
      </div>
      {value !== null && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-snug">{defs[value]}</p>}
    </div>
  );
}

function getInterpretation(pvh, dwmh) {
  if (pvh === 3 || dwmh === 3) return 'extensive';
  if (pvh === 2) return 'halo';
  return 'nonspecific';
}

const TONE = { nonspecific: 'emerald', halo: 'amber', extensive: 'red' };

export default function FazekasScale() {
  const { t } = useLang();
  const c = t.calc.fazekasScale;
  const [pvh, setPvh] = useState(null);
  const [dwmh, setDwmh] = useState(null);

  const hasAny = pvh !== null && dwmh !== null;
  const interp = hasAny ? getInterpretation(pvh, dwmh) : null;
  const interpText = { nonspecific: c.interpNonspecific, halo: c.interpHalo, extensive: c.interpExtensive };

  const handleCopy = () => {
    const lines = [
      `${c.pvhLabel}: ${pvh} — ${c.pvhDefs[pvh]}`,
      `${c.dwmhLabel}: ${dwmh} — ${c.dwmhDefs[dwmh]}`,
      interpText[interp],
    ];
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setPvh(null); setDwmh(null); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAny ? 'pb-56' : ''}`}>
      <Card className="space-y-5">
        <GradeSelector label={c.pvhLabel} value={pvh} onChange={setPvh} defs={c.pvhDefs} />
        <GradeSelector label={c.dwmhLabel} value={dwmh} onChange={setDwmh} defs={c.dwmhDefs} />
      </Card>

      {hasAny && <InfoBox tone={TONE[interp]}>{interpText[interp]}</InfoBox>}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.fazekasScale} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasAny && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}:</span>
            <span className="text-lg font-black block leading-tight text-slate-700 dark:text-slate-200">
              {c.pvhShort} {pvh} / {c.dwmhShort} {dwmh}
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

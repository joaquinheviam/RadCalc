import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

export default function PIRADS() {
  const { t, lang } = useLang();
  const c = t.calc.pirads;
  const [zone, setZone] = useState('pz');
  const [dwi, setDwi] = useState(0);
  const [t2, setT2] = useState(0);
  const [dce, setDce] = useState('');
  const [epe, setEpe] = useState('');

  let finalScore = 0;
  if (zone === 'pz') {
    if (dwi > 0) finalScore = (dwi === 3 && dce === '+') ? 4 : dwi;
  } else {
    if (t2 === 2) finalScore = (dwi >= 4) ? 3 : 2;
    else if (t2 === 3) finalScore = (dwi === 5) ? 4 : 3;
    else if (t2 > 0) finalScore = t2;
  }

  const handleCopy = () => {
    if (!finalScore) return;
    const txtZone = zone === 'pz' ? c.pz : c.tz;
    const text = c.reportText(
      txtZone,
      dwi || c.naText,
      t2 || c.naText,
      dce === '+' ? c.dcePos : dce === '-' ? c.dceNeg : c.naText,
      finalScore
    );
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setZone('pz'); setDwi(0); setT2(0); setDce(''); setEpe(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${finalScore > 0 ? 'pb-56' : 'pb-10'}`}>
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex">
        <button
          onClick={() => { setZone('pz'); setDwi(0); setT2(0); setDce(''); }}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${zone === 'pz' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
        >
          {c.pz}
        </button>
        <button
          onClick={() => { setZone('tz'); setDwi(0); setT2(0); setDce(''); }}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${zone === 'tz' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
        >
          {c.tz}
        </button>
      </div>
      <Card className="space-y-6">
        {zone === 'pz' && (
          <>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.dwiDominant}</h3>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={`dwi-${s}`} onClick={() => setDwi(s)} className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${dwi === s ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {dwi > 0 && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.dwiDefs[dwi - 1]}</p>}
            </div>
            {dwi === 3 && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.dceStep}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setDce('-')} className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${dce === '-' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    {c.dceNeg}
                  </button>
                  <button onClick={() => setDce('+')} className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${dce === '+' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    {c.dcePos}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">{c.dceNote}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-snug">{c.dceDef}</p>
              </div>
            )}
          </>
        )}
        {zone === 'tz' && (
          <>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.t2Dominant}</h3>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={`t2-${s}`} onClick={() => setT2(s)} className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${t2 === s ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {t2 > 0 && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.t2Defs[t2 - 1]}</p>}
            </div>
            {(t2 === 2 || t2 === 3) && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{c.dwiStep}</h3>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={`dwitz-${s}`} onClick={() => setDwi(s)} className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${dwi === s ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">{t2 === 2 ? c.dwiNoteT2_2 : c.dwiNote}</p>
                {dwi > 0 && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-snug">{c.dwiDefs[dwi - 1]}</p>}
              </div>
            )}
          </>
        )}
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.epeLabel}</label>
        <div className="space-y-2">
          {c.epeOptions.map(opt => (
            <button key={opt.key} onClick={() => setEpe(epe === opt.key ? '' : opt.key)} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${epe === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              <span className="font-semibold block mb-0.5">{opt.label}</span>
              <span className="text-xs opacity-80">{opt.desc}</span>
            </button>
          ))}
        </div>
        {epe && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">{c.epeCaveat}</p>}
      </Card>
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.pirads} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {finalScore > 0 && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.finalCategory}</span>
            <span className={`text-4xl font-black block mt-1 ${finalScore >= 4 ? 'text-red-500' : finalScore === 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
              PI-RADS {finalScore}
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

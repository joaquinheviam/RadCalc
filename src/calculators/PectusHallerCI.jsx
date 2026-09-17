import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconAlertTriangle, IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';

function PectusScheme() {
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 800 600" className="h-auto w-full max-w-xs text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">
        {/* Silueta cardiaca (referencia anatomica, discontinua) */}
        <path
          className="text-slate-400 dark:text-slate-500"
          fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round"
          d="M 400 290 C 480 290, 540 330, 540 380 C 540 420, 460 430, 420 410 C 380 430, 300 420, 300 380 C 300 330, 350 290, 400 290 Z"
        />
        {/* Contorno de la pared toracica */}
        <path
          fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
          d="M 400 280 C 430 280, 460 150, 520 150 C 650 150, 720 250, 720 350 C 720 440, 600 450, 450 440 C 440 415, 360 415, 350 440 C 200 450, 80 440, 80 350 C 80 250, 150 150, 280 150 C 340 150, 370 280, 400 280 Z"
        />
        {/* Elementos posteriores de la vertebra */}
        <path
          fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
          d="M 350 440 C 310 460, 350 500, 385 500 L 395 540 A 5 5 0 0 0 405 540 L 415 500 C 450 500, 490 460, 450 440"
        />
        {/* Canal medular */}
        <circle cx="400" cy="465" r="14" fill="none" stroke="currentColor" strokeWidth="6" />
        {/* Linea de correccion virtual (nivel de los arcos costales) */}
        <line x1="200" y1="150" x2="600" y2="150" className="text-slate-400 dark:text-slate-500" stroke="currentColor" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" />

        {/* Linea A: diametro transverso */}
        <g stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round">
          <line x1="80" y1="350" x2="720" y2="350" />
          <line x1="80" y1="340" x2="80" y2="360" />
          <line x1="720" y1="340" x2="720" y2="360" />
        </g>
        <rect x="150" y="336" width="28" height="28" rx="6" fill="#0ea5e9" />
        <text x="164" y="356" fill="#ffffff" fontSize="16" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">A</text>

        {/* Linea B: distancia AP minima (deepest depression) */}
        <g stroke="#e11d48" strokeWidth="3" strokeLinecap="round">
          <line x1="390" y1="280" x2="390" y2="421" />
          <line x1="380" y1="280" x2="400" y2="280" />
          <line x1="380" y1="421" x2="400" y2="421" />
        </g>
        <rect x="346" y="336" width="28" height="28" rx="6" fill="#e11d48" />
        <text x="360" y="356" fill="#ffffff" fontSize="16" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">B</text>

        {/* Linea C: distancia AP virtualmente corregida */}
        <g stroke="#d97706" strokeWidth="3" strokeLinecap="round">
          <line x1="420" y1="150" x2="420" y2="421" />
          <line x1="410" y1="150" x2="430" y2="150" />
          <line x1="410" y1="421" x2="430" y2="421" />
        </g>
        <rect x="436" y="236" width="28" height="28" rx="6" fill="#d97706" />
        <text x="450" y="256" fill="#ffffff" fontSize="16" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">C</text>
      </svg>
    </div>
  );
}

export default function PectusHallerCI() {
  const { t } = useLang();
  const c = t.calc.pectusHallerCI;
  const [transverse, setTransverse] = useState('');
  const [apDepth, setApDepth] = useState('');
  const [apCorrected, setApCorrected] = useState('');

  const A = parseFloat(transverse) || 0;
  const B = parseFloat(apDepth) || 0;
  const C = parseFloat(apCorrected) || 0;

  const hasHI = transverse !== '' && apDepth !== '' && A > 0 && B > 0;
  const hi = hasHI ? A / B : 0;
  const hiSignificant = hi >= 3.25;

  const hasCI = apDepth !== '' && apCorrected !== '' && B > 0 && C > 0;
  const ci = hasCI ? ((C - B) / C) * 100 : 0;
  const ciSignificant = ci >= 28;
  const ciBorderline = ci >= 10 && ci < 28;

  const hasAny = hasHI || hasCI;
  const hasBoth = hasHI && hasCI;
  const discordant = hasBoth && hiSignificant !== ciSignificant;
  const discordanceType = discordant ? (hiSignificant && !ciSignificant ? 'broad' : 'narrow') : null;

  const hiVerdictLabel = !hasHI ? '' : hiSignificant ? c.hiSignificant : c.hiNotSignificant;
  const ciVerdictLabel = !hasCI ? '' : ciSignificant ? c.ciSignificant : ciBorderline ? c.ciBorderline : c.ciNotSignificant;

  const handleCopy = () => {
    const lines = [];
    if (hasHI) lines.push(`${c.hiLabel}: ${hi.toFixed(2)} (${hiVerdictLabel})`);
    if (hasCI) lines.push(`${c.ciLabel}: ${ci.toFixed(1)}% (${ciVerdictLabel})`);
    if (discordanceType === 'broad') lines.push(c.discordanceBroad);
    if (discordanceType === 'narrow') lines.push(c.discordanceNarrow);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setTransverse(''); setApDepth(''); setApCorrected(''); };

  return (
    <div className={`space-y-4 animate-in fade-in ${hasAny ? 'pb-56' : ''}`}>
      <Card>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">{c.schemeTitle}</p>
        <PectusScheme />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-500 mr-1 align-[-1px]"></span>{c.schemeLegendA}</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-600 mr-1 align-[-1px]"></span>{c.schemeLegendB}</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-600 mr-1 align-[-1px]"></span>{c.schemeLegendC}</span>
        </div>
      </Card>

      <Card>
        <NumberField label={c.transverseLabel} placeholder={c.transversePh} value={transverse} onChange={setTransverse} />
        <NumberField label={c.apLabel} placeholder={c.apPh} value={apDepth} onChange={setApDepth} />
        <div>
          <NumberField label={c.correctedApLabel} placeholder={c.correctedApPh} value={apCorrected} onChange={setApCorrected} />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{c.correctedApHelp}</p>
        </div>
      </Card>

      {hasHI && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.hiLabel}</span>
          <span className={`text-2xl font-black ${hiSignificant ? 'text-red-500' : 'text-emerald-500'}`}>{hi.toFixed(2)}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">{hiVerdictLabel}</span>
        </Card>
      )}

      {hasHI && !hasCI && (
        <p className="text-xs text-center text-slate-400 dark:text-slate-500 -mt-2">{c.ciPending}</p>
      )}

      {hasCI && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 block mb-1">{c.ciLabel}</span>
          <span className={`text-2xl font-black ${ciSignificant ? 'text-red-500' : ciBorderline ? 'text-amber-500' : 'text-emerald-500'}`}>{ci.toFixed(1)}%</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">{ciVerdictLabel}</span>
        </Card>
      )}

      {discordant && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3 flex gap-2">
          <IconAlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>{discordanceType === 'broad' ? c.discordanceBroadTitle : c.discordanceNarrowTitle}: </strong>
            {discordanceType === 'broad' ? c.discordanceBroad : c.discordanceNarrow}
          </p>
        </div>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.pectusHallerCI} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {hasAny && (
        <StickyBar>
          <div className="min-w-0 text-center">
            {hasHI && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.hiLabel}:</span>
                <span className={`text-3xl font-black flex items-center justify-center gap-2 leading-tight ${hiSignificant ? 'text-red-500' : 'text-emerald-500'}`}>
                  {hiSignificant ? <IconAlertTriangle size={24} /> : <IconCheckCircle size={24} />}
                  {hi.toFixed(2)}
                </span>
              </>
            )}
            {hasCI && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 block mt-2">{c.ciLabel}:</span>
                <span className={`text-3xl font-black flex items-center justify-center gap-2 leading-tight ${ciSignificant ? 'text-red-500' : ciBorderline ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {ciSignificant ? <IconAlertTriangle size={24} /> : <IconCheckCircle size={24} />}
                  {ci.toFixed(1)}%
                </span>
              </>
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

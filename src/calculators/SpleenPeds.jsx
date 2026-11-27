import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';
import { SPLEEN_GROUPS, spleenZ, MAX_SPLEEN } from './logic/spleenPeds.js';
import { spleenBins } from './logic/chartData.js';
import { BandByAgeChart } from '../components/shared/ReferenceChart.jsx';

// Etiquetas del eje de edad en el borde izquierdo de cada grupo de Megremis 2004.
const SPLEEN_TICKS = { m0: '0', m3: '3m', m6: '6m', y1: '1', y2: '2', y4: '4', y6: '6', y8: '8', y10: '10', y12: '12', y14: '14' };

const COLOR = { small: 'text-amber-500', normal: 'text-emerald-500', large: 'text-red-500' };

export default function SpleenPeds() {
  const { t, lang } = useLang();
  const c = t.calc.spleenPeds;
  const ch = t.charts;
  const [showPreview, setShowPreview] = useState(false);
  const [group, setGroup] = useState('');
  const [sex, setSex] = useState('');
  const [len, setLen] = useState('');

  const num = (x, d) => x.toLocaleString(lang === 'es' ? 'es-CL' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const sgn = (z) => { const r = Math.round(z * 100) / 100; return (r >= 0 ? '+' : '−') + num(Math.abs(r), 2); };
  const pctText = (p) => (p < 1 ? '< 1' : p > 99 ? '> 99' : String(Math.round(p)));
  const shown = (v) => (lang === 'es' ? String(v).replace('.', ',') : String(v));
  const r = group && sex && len !== '' ? spleenZ(group, sex, parseFloat(len)) : null;
  const mmWarn = len !== '' && parseFloat(len) > MAX_SPLEEN;
  const who = group && sex ? `${c.ages[group]}, ${c.sex[sex].toLowerCase()}` : '';
  const line = r ? c.resultLine(shown(len), sgn(r.z), pctText(r.pct), c.bands[r.band]) : '';
  const refText = r ? c.refLine(who, num(r.mean, 1), num(r.sd, 2), num(r.mean - 2 * r.sd, 2), num(r.mean + 2 * r.sd, 2), num(r.min, 1), num(r.max, 1), r.n) : '';

  const getReportText = () => (r ? [c.reportTitle(who), line, refText].join('\n') : '');
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => { setGroup(''); setSex(''); setLen(''); };
  const btn = (on) => `flex-1 p-2.5 rounded-lg border text-sm transition-all ${on ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

  return (
    <div className={`space-y-4 animate-in fade-in ${r ? 'pb-56' : ''}`}>
      <Card>
        <label htmlFor="sp-age" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{c.ageLabel}</label>
        <select id="sp-age" value={group} onChange={(e) => setGroup(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">{c.agePlaceholder}</option>
          {SPLEEN_GROUPS.map((k) => <option key={k} value={k}>{c.ages[k]}</option>)}
        </select>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.ageHint}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-4 mb-1.5">{c.sexLabel}</p>
        <div className="flex gap-2" role="group" aria-label={c.sexLabel}>
          {['female', 'male'].map((k) => <button key={k} type="button" aria-pressed={sex === k} onClick={() => setSex(k)} className={btn(sex === k)}>{c.sex[k]}</button>)}
        </div>
        <div className="mt-4">
          <NumberField label={c.lengthLabel} value={len} onChange={setLen} />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.lengthHint}</p>
          {mmWarn && <p role="alert" className="text-xs text-amber-700 dark:text-amber-400 mt-2 leading-snug">{c.mmWarn}</p>}
        </div>
      </Card>
      {r && (
        <Card>
          <p className={`text-sm font-semibold ${COLOR[r.band]}`}>{line}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 leading-snug">{refText}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.pctNote}</p>
        </Card>
      )}
      {r && (
        <Card>
          <BandByAgeChart
            title={ch.spleenTitle(c.sex[sex].toLowerCase())}
            ariaLabel={ch.spleenAria(c.sex[sex].toLowerCase(), c.ages[group], ch.pointText('', shown(len), c.bands[r.band]))}
            bins={spleenBins(sex)}
            selected={group}
            points={[{ value: parseFloat(len) }]}
            ticks={SPLEEN_TICKS}
            endTick="17"
            xLabel={ch.ageAxis}
            yLabel={ch.lengthAxis}
            legendText={{ band: ch.legendBand, mean: ch.legendMean, patient: ch.legendPatient }}
            note={ch.binsNote}
          />
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.spleenPeds} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {r && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${COLOR[r.band]}`}>{c.bandsShort[r.band]}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">Z {sgn(r.z)}</span>
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

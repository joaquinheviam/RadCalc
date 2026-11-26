import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconCheckCircle } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';
import { useCacPercentile } from '../components/shared/CacPercentile.jsx';
import { cacDrsFromAgatston, cacDrsCode, VESSELS } from './logic/cacDrs.js';

export default function CACDRS() {
  const { t } = useLang();
  const c = t.calc.cacdrs;
  const [showPreview, setShowPreview] = useState(false);
  const [method, setMethod] = useState('A');
  const [cac, setCac] = useState('');
  const [visual, setVisual] = useState(null);
  const [vessels, setVessels] = useState({ LM: false, LAD: false, LCX: false, RCA: false });
  const [includeTreatment, setIncludeTreatment] = useState(false);
  const pct = useCacPercentile(cac, method === 'A');

  const cacNum = cac === '' ? NaN : parseFloat(cac);
  const raw = method === 'A' ? (cac === '' ? null : cacDrsFromAgatston(cacNum)) : visual;
  const category = [0, 1, 2, 3].includes(raw) ? raw : null;
  const n = VESSELS.filter((v) => vessels[v]).length;
  const code = category === null ? '' : cacDrsCode(method, category, n);
  const vesselList = VESSELS.filter((v) => vessels[v]).map((v) => c.vessels[v]).join(', ');

  const getReportText = () => {
    if (category === null) return '';
    const lines = [method === 'A' ? c.reportCac(cacNum, t.cacPercentile.inline(pct.pct)) : c.reportVisual(c.visualGrade[category])];
    if (category > 0 && n > 0) lines.push(c.reportVessels(vesselList));
    lines.push(c.reportCategory(code, c.risk[category]));
    if (includeTreatment) lines.push(c.reportTreatment(c.treatment[category]));
    return lines.join('\n');
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };
  const resetAll = () => {
    setMethod('A'); setCac(''); setVisual(null);
    setVessels({ LM: false, LAD: false, LCX: false, RCA: false });
    setIncludeTreatment(false); pct.reset();
  };

  const riskColor = category === null ? '' : category === 0 ? 'text-emerald-500' : category === 1 ? 'text-amber-500' : 'text-red-500';
  const btn = (on) => `p-2.5 rounded-lg border text-xs transition-all ${on ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;

  return (
    <div className={`space-y-4 animate-in fade-in ${category !== null ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.methodLabel}</label>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={c.methodLabel}>
          {['A', 'V'].map((k) => (
            <button key={k} type="button" onClick={() => setMethod(k)} aria-pressed={method === k} className={btn(method === k)}>{c.methods[k]}</button>
          ))}
        </div>
        {method === 'A' ? (
          <div className="mt-3">
            <NumberField label={c.cacLabel} value={cac} onChange={setCac} />
            <ul className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug space-y-0.5">{c.ranges.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        ) : (
          <div className="space-y-2 mt-3" role="group" aria-label={c.methods.V}>
            {c.visualOptions.map((o, i) => (
              <button key={o} type="button" onClick={() => setVisual(i)} aria-pressed={visual === i} className={`w-full text-left ${btn(visual === i)}`}>{o}</button>
            ))}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{c.visualHint}</p>
          </div>
        )}
      </Card>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{c.vesselsLabel}</label>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={c.vesselsLabel}>
          {VESSELS.map((v) => (
            <button key={v} type="button" onClick={() => setVessels((p) => ({ ...p, [v]: !p[v] }))} aria-pressed={vessels[v]} className={`text-left flex items-center gap-1.5 ${btn(vessels[v])}`}>
              {vessels[v] ? <IconCheckCircle size={14} /> : <span className="w-3.5" />} {c.vessels[v]}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.vesselsHint}</p>
        {category > 0 && n === 0 && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 leading-snug">{c.needVessels}</p>}
        {category === 0 && n > 0 && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 leading-snug">{c.zeroVessels}</p>}
      </Card>
      {method === 'A' && <Card>{pct.fields}</Card>}
      {category !== null && (
        <Card>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.treatmentTitle}</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{c.treatment[category]}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.treatmentCaveat}</p>
          <button type="button" onClick={() => setIncludeTreatment((v) => !v)} aria-pressed={includeTreatment} className={`mt-3 w-full text-left flex items-center gap-1.5 ${btn(includeTreatment)}`}>
            {includeTreatment ? <IconCheckCircle size={14} /> : <span className="w-3.5" />} {c.includeTreatment}
          </button>
        </Card>
      )}
      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.cacdrs} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />
      {category !== null && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className={`text-3xl font-black block mt-1 leading-tight ${riskColor}`}>CAC-DRS {code}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{c.riskLabel}: {c.risk[category]}</span>
            {method === 'A' && <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mt-0.5">{c.summaryCac(cacNum, t.cacPercentile.short(pct.pct))}</span>}
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

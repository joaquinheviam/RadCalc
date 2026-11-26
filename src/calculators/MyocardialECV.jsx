import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconInfo } from '../components/icons/index.js';
import { Card, NumberField, StickyBar, ResetIconButton, CopyIconButton, PreviewIconButton, ReportPreviewModal, InfoBox, Accordion, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer } from '../components/shared/index.js';
import { REFERENCE, GOTTBRECHT, ecvCalc, ecvBand } from './logic/ecv.js';
import { useSyntheticHct } from '../components/shared/SyntheticHct.jsx';

const SEQS = ['molli', 'shmolli', 'all'];
const BAND_COLOR = { high: 'text-red-500', normal: 'text-emerald-500', low: 'text-amber-500' };

export default function MyocardialECV() {
  const { t, lang } = useLang();
  const c = t.calc.ecv;
  const [showPreview, setShowPreview] = useState(false);
  const [seq, setSeq] = useState('molli');
  const [vals, setVals] = useState({ myoPre: '', myoPost: '', bloodPre: '', bloodPost: '', hct: '' });
  // Hematocrito medido o sintético (por T1 nativo de la sangre).
  const [hctSource, setHctSource] = useState('measured');
  const syn = useSyntheticHct(vals.bloodPre);

  const num = (x, d) => x.toLocaleString(lang === 'es' ? 'es-CL' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const set = (k) => (v) => setVals((prev) => ({ ...prev, [k]: v }));
  const parsed = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, v === '' ? NaN : parseFloat(v)]));
  if (hctSource === 'synthetic') parsed.hct = syn.value === null ? NaN : syn.value;
  const allFilled = Object.entries(vals).every(([k, v]) => (k === 'hct' && hctSource === 'synthetic') || v !== '');
  const res = ecvCalc(parsed);
  const orderError = allFilled && !res && (parsed.myoPost >= parsed.myoPre || parsed.bloodPost >= parsed.bloodPre);

  const ref = REFERENCE[seq];
  const band = res ? ecvBand(res.ecv, seq) : null;
  const bandInfo = band ? { ...c.bands[band], color: BAND_COLOR[band] } : null;
  const ecvText = res ? num(res.ecv, 1) : '';
  const pct = lang === 'es' ? ' %' : '%';
  const refLine = c.refLine(c.seq[seq], num(ref.range[0], 1), num(ref.range[1], 1), num(ref.mean, 1));

  const resetAll = () => { setVals({ myoPre: '', myoPost: '', bloodPre: '', bloodPost: '', hct: '' }); setSeq('molli'); setHctSource('measured'); syn.reset(); };

  const getReportText = () => {
    if (!res) return '';
    return c.reportText({
      ecv: ecvText, lambda: num(res.lambda, 2), seq: c.seq[seq], bandTitle: bandInfo.title,
      myoPre: vals.myoPre, myoPost: vals.myoPost, bloodPre: vals.bloodPre, bloodPost: vals.bloodPost, refLine,
      hct: hctSource === 'synthetic' ? c.hctSynReport(syn.valueText, syn.modelText) : c.hctMeasuredReport(vals.hct),
    });
  };
  const handleCopy = () => {
    const text = getReportText();
    if (!text) return;
    copyToClipboard(text, t.common.copiedOk, t.common.copiedErr);
  };

  const btn = (active) => `flex-1 p-2.5 rounded-lg border text-sm transition-all ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;
  const ci = ([lo, hi]) => `${num(lo, 1)}–${num(hi, 1)}`;
  const tableRows = [
    ...SEQS.map((k) => ({ key: k, mean: REFERENCE[k].mean, ci: REFERENCE[k].ci, range: REFERENCE[k].range })),
    ...Object.keys(GOTTBRECHT).map((k) => ({ key: k, mean: GOTTBRECHT[k].mean, ci: GOTTBRECHT[k].ci, range: null })),
  ];

  return (
    <div className={`space-y-4 animate-in fade-in ${res ? 'pb-56' : ''}`}>
      <Card>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{c.seqLabel}</label>
        <div className="flex gap-2">
          {SEQS.map((k) => (
            <button key={k} type="button" aria-pressed={seq === k} onClick={() => setSeq(k)} className={btn(seq === k)}>{c.seq[k]}</button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-3">{c.myoTitle}</h3>
        <div className="grid grid-cols-2 gap-3 items-end">
          <NumberField label={c.preLabel} value={vals.myoPre} onChange={set('myoPre')} />
          <NumberField label={c.postLabel} value={vals.myoPost} onChange={set('myoPost')} />
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-4 mb-3">{c.bloodTitle}</h3>
        <div className="grid grid-cols-2 gap-3 items-end">
          <NumberField label={c.preLabel} value={vals.bloodPre} onChange={set('bloodPre')} />
          <NumberField label={c.postLabel} value={vals.bloodPost} onChange={set('bloodPost')} />
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{c.hctSourceLabel}</p>
          <div className="flex gap-2 mb-3" role="group" aria-label={c.hctSourceLabel}>
            {['measured', 'synthetic'].map((k) => (
              <button key={k} type="button" aria-pressed={hctSource === k} onClick={() => setHctSource(k)} className={btn(hctSource === k)}>{c.hctSource[k]}</button>
            ))}
          </div>
          {hctSource === 'measured' ? (
            <>
              <NumberField label={c.hctLabel} value={vals.hct} onChange={set('hct')} />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">{c.hctNote}</p>
            </>
          ) : (
            <>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-3">{c.hctSynNote}</p>
              {syn.fields}
            </>
          )}
        </div>
      </Card>

      {orderError && <InfoBox tone="red">{c.orderError}</InfoBox>}

      {bandInfo && (
        <Card>
          <h3 className={`text-base font-bold ${bandInfo.color}`}>{bandInfo.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.resultTitle}: {ecvText}{pct} · {c.lambdaLabel}: {num(res.lambda, 2)}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{bandInfo.note}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 leading-snug">{refLine}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{c.localNote}</p>
        </Card>
      )}

      <Accordion icon={<IconInfo size={16} />} title={c.tableTitle}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th scope="col" className="pb-2 pr-2 font-medium">{c.tableGroup}</th>
                <th scope="col" className="pb-2 pr-2 font-medium">{c.tableMean}</th>
                <th scope="col" className="pb-2 font-medium">{c.tableRange}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r) => (
                <tr key={r.key} className="border-b border-slate-50 dark:border-slate-700/50 align-top">
                  <th scope="row" className="py-1.5 pr-2 font-medium text-slate-700 dark:text-slate-200">{c.rows[r.key]}</th>
                  <td className="py-1.5 pr-2 text-slate-600 dark:text-slate-300">{num(r.mean, 1)} ({ci(r.ci)})</td>
                  <td className="py-1.5 text-slate-600 dark:text-slate-300">{r.range ? ci(r.range) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-snug">{c.tableNote}</p>
      </Accordion>

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.ecv} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {bandInfo && (
        <StickyBar>
          <div className="min-w-0 text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 block">{c.resultTitle}</span>
            <span className={`text-2xl font-black block mt-1 leading-tight ${bandInfo.color}`}>{ecvText}{pct}</span>
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

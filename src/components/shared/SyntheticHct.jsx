import { useState } from 'react';
import { useLang } from '../../i18n/LangContext.js';
import NumberField from './NumberField.jsx';
import { syntheticHct, MODELS } from '../../calculators/logic/syntheticHct.js';

// Hematocrito sintético por T1 nativo de la sangre. Lo usan la calculadora
// propia (synHct) y la de ECV. Textos en t.synHct. Devuelve los campos (JSX),
// el valor en % (null si faltan datos), los textos para el informe y reset.
export function useSyntheticHct(t1Str) {
  const { t, lang } = useLang();
  const s = t.synHct;
  const [model, setModel] = useState('chenCommon');
  const [field, setField] = useState('');
  const [sex, setSex] = useState('');
  const [pool, setPool] = useState('lv');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const meta = MODELS[model];
  const t1 = t1Str === '' ? NaN : parseFloat(t1Str);
  const frac = syntheticHct({ model, t1, field, sex, pool, a: a === '' ? NaN : parseFloat(a), b: b === '' ? NaN : parseFloat(b) });
  const value = frac === null ? null : frac * 100;
  const outOfRange = value !== null && (value < 20 || value > 65);
  const num = (x, d) => x.toLocaleString(lang === 'es' ? 'es-CL' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const valueText = value === null ? '' : num(value, 1);
  const modelText = s.modelReport({ model, field, sex, pool, a, b });
  const reset = () => { setModel('chenCommon'); setField(''); setSex(''); setPool('lv'); setA(''); setB(''); };

  const btn = (on) => `p-2.5 rounded-lg border text-xs transition-all ${on ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;
  const group = (label, opts, cur, set) => (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label={label}>
        {opts.map(([k, l]) => <button key={k} type="button" onClick={() => set(k)} aria-pressed={cur === k} className={btn(cur === k)}>{l}</button>)}
      </div>
    </div>
  );
  const needsChen = model === 'chenCommon' || model === 'chenSpecific';

  const fields = (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.modelLabel}</p>
        <div className="space-y-2" role="group" aria-label={s.modelLabel}>
          {Object.keys(MODELS).map((k) => (
            <button key={k} type="button" onClick={() => setModel(k)} aria-pressed={model === k} className={`w-full text-left ${btn(model === k)}`}>
              <span className="font-semibold block">{s.models[k].name}</span>
              <span className="block mt-0.5 opacity-80">{s.models[k].desc}</span>
            </button>
          ))}
        </div>
      </div>
      {needsChen && (
        <>
          {group(s.fieldLabel, [['1.5', '1,5 T'], ['3', '3 T']], field, setField)}
          {group(s.sexLabel, [['female', s.sex.female], ['male', s.sex.male]], sex, setSex)}
          {group(s.poolLabel, [['lv', s.pool.lv], ['rv', s.pool.rv]], pool, setPool)}
        </>
      )}
      {model === 'local' && (
        <div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <NumberField label={s.aLabel} value={a} onChange={setA} small />
            <NumberField label={s.bLabel} value={b} onChange={setB} small allowNegative />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{s.localHint}</p>
        </div>
      )}
      {meta.field && <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-snug">{s.fieldOnly(meta.field === '1.5' ? '1,5 T' : '3 T')}</p>}
      {value !== null && <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{s.resultLine(valueText)}</p>}
      {outOfRange && <p className="text-[11px] text-red-500 leading-snug">{s.outOfRange}</p>}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{s.caveat}</p>
    </div>
  );
  return { fields, value, valueText, modelText, reset };
}

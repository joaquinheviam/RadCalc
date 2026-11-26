import { useState } from 'react';
import { useLang } from '../../i18n/LangContext.js';
import NumberField from './NumberField.jsx';
import { cacPercentile, cacSource, groupsFor, DEFAULT_GROUP } from '../../calculators/logic/cacPercentile.js';

// Percentil del score de calcio (Agatston) por edad, sexo y grupo poblacional
// (Javaid 2022 en 30-44 años, MESA en 45-84). Lo usan CAD-RADS y CAC-DRS.
// Textos en t.cacPercentile. Devuelve los campos (JSX), el texto del resultado
// para el informe ('' si falta algún dato) y una función para reiniciar.
export function useCacPercentile(cacStr, enabled = true) {
  const { t } = useLang();
  const s = t.cacPercentile;
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  // Grupo elegido por fuente: el defecto (blanco 30-44, hispano ≥ 45) se aplica en cada una.
  const [group, setGroup] = useState({ javaid: '', mesa: '' });

  const ageNum = age === '' ? null : Number(age);
  const source = Number.isInteger(ageNum) ? cacSource(ageNum) : null;
  const groups = groupsFor(source);
  const groupEff = source ? (group[source] || DEFAULT_GROUP[source]) : '';
  const cacNum = cacStr === '' ? NaN : parseFloat(cacStr);
  const pct = enabled && source && sex && Number.isFinite(cacNum)
    ? cacPercentile({ age: ageNum, sex, group: groupEff, cac: cacNum }) : null;
  const text = pct ? s.result(pct, ageNum, sex) : '';
  const reset = () => { setAge(''); setSex(''); setGroup({ javaid: '', mesa: '' }); };

  const btn = (on) => `p-2.5 rounded-lg border text-xs transition-all ${on ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`;
  const fields = (
    <div className="space-y-2.5">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.title}</p>
      <NumberField label={s.ageLabel} value={age} onChange={setAge} small />
      {age !== '' && !source && <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-snug">{s.ageOut}</p>}
      <div className="grid grid-cols-2 gap-2" role="group" aria-label={s.sexLabel}>
        {['female', 'male'].map((k) => (
          <button key={k} type="button" onClick={() => setSex(k)} aria-pressed={sex === k} className={btn(sex === k)}>{s.sex[k]}</button>
        ))}
      </div>
      {source && (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.groupLabel} ({s.sourceName[source]})</p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label={s.groupLabel}>
            {groups.map((k) => (
              <button key={k} type="button" onClick={() => setGroup((prev) => ({ ...prev, [source]: k }))} aria-pressed={groupEff === k} className={btn(groupEff === k)}>{s.group[k]}</button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">{s.groupHint[source]}</p>
        </div>
      )}
      {text && <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{text}</p>}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{s.caveat}</p>
    </div>
  );
  return { fields, text, pct, reset };
}

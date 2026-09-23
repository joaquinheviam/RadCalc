// `allowNegative`: agrega un botón ± para cambiar el signo del valor. El
// teclado decimal del celular (inputMode="decimal") no trae la tecla "−" en
// iPhone ni en varios Android, así que sin este botón no hay forma de
// ingresar valores negativos (p. ej. densidades en UH bajo 0).
export default function NumberField({ label, value, onChange, placeholder, small, allowNegative }) {
  const handleChange = (raw) => {
    const normalized = raw.replace(',', '.');
    if (normalized === '' || /^-?\d*\.?\d*$/.test(normalized)) {
      onChange(normalized);
    }
  };
  const toggleSign = () => {
    const v = String(value ?? '');
    onChange(v.startsWith('-') ? v.slice(1) : `-${v}`);
  };
  const input = (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={value}
      onChange={e => handleChange(e.target.value)}
      className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg ${small ? 'p-2.5 text-center' : 'p-3 text-lg'} focus:ring-2 focus:ring-blue-500 outline-none`}
    />
  );
  return (
    <div>
      {label && <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</label>}
      {allowNegative ? (
        <div className="flex gap-2">
          {input}
          <button
            type="button"
            onClick={toggleSign}
            aria-label="+/−"
            title="+/−"
            className="shrink-0 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
          >
            ±
          </button>
        </div>
      ) : input}
    </div>
  );
}

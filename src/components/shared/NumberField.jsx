export default function NumberField({ label, value, onChange, placeholder, small }) {
  const handleChange = (raw) => {
    const normalized = raw.replace(',', '.');
    if (normalized === '' || /^-?\d*\.?\d*$/.test(normalized)) {
      onChange(normalized);
    }
  };
  return (
    <div>
      {label && <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</label>}
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={e => handleChange(e.target.value)}
        className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg ${small ? 'p-2.5 text-center' : 'p-3 text-lg'} focus:ring-2 focus:ring-blue-500 outline-none`}
      />
    </div>
  );
}

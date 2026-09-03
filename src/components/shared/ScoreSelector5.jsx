export default function ScoreSelector5({ label, value, onChange, defs }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</h3>
      <div className="flex gap-2">
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => onChange(s)} className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${value === s ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            {s}
          </button>
        ))}
      </div>
      {value > 0 && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-snug">{defs[value - 1]}</p>}
    </div>
  );
}

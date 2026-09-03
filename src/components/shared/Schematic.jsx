export default function Schematic({ children, caption }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 flex flex-col items-center gap-2">
      <div className="w-full max-w-xs text-slate-700 dark:text-slate-200">{children}</div>
      {caption && <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-snug">{caption}</p>}
    </div>
  );
}

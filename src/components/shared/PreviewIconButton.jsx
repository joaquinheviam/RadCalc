import { IconEye } from '../icons/index.js';

export default function PreviewIconButton({ onClick, disabled, label, caption }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`group flex flex-col items-center gap-1 shrink-0 ${disabled ? 'cursor-not-allowed' : ''}`}>
      <span className={`p-4 rounded-full transition-all ${disabled ? 'bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 group-active:scale-95'}`}>
        <IconEye size={22} />
      </span>
      {caption && <span className={`text-[10px] font-medium whitespace-nowrap ${disabled ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>{caption}</span>}
    </button>
  );
}

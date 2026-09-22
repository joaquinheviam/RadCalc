import { IconCopy } from '../icons/index.js';

export default function CopyIconButton({ onClick, disabled, label, caption }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`group flex flex-col items-center gap-1 shrink-0 ${disabled ? 'cursor-not-allowed' : ''}`}>
      <span className={`p-4 rounded-full transition-all ${disabled ? 'bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-600' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 group-active:scale-95'}`}>
        <IconCopy size={22} />
      </span>
      {caption && <span className={`text-[10px] font-medium whitespace-nowrap ${disabled ? 'text-slate-300 dark:text-slate-600' : 'text-blue-600 dark:text-blue-400'}`}>{caption}</span>}
    </button>
  );
}

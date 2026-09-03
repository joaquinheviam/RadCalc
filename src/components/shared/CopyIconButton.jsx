import { IconCopy } from '../icons/index.js';

export default function CopyIconButton({ onClick, disabled, label }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`p-4 rounded-full transition-all shrink-0 ${disabled ? 'bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-600 cursor-not-allowed' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 active:scale-95'}`}>
      <IconCopy size={22} />
    </button>
  );
}

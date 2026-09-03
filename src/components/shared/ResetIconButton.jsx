import { IconRefresh } from '../icons/index.js';

export default function ResetIconButton({ onClick, label }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="p-3 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition-all shrink-0">
      <IconRefresh size={20} />
    </button>
  );
}

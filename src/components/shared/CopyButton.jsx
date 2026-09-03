import { IconCopy } from '../icons/index.js';

export default function CopyButton({ onClick, children }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 py-3 rounded-xl font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-95 transition-all">
      <IconCopy size={18} /> {children}
    </button>
  );
}

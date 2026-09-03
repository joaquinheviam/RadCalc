import { useState } from 'react';
import { IconChevronDown } from '../icons/index.js';

export default function Accordion({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
      >
        <span className="flex items-center gap-2">{icon} {title}</span>
        <IconChevronDown className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="refs-enter px-5 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

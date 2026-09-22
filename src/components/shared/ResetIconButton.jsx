import { IconRefresh } from '../icons/index.js';

// `caption` es opcional: si se entrega, muestra una etiqueta corta debajo del
// ícono (útil sobre todo en celular, donde no hay hover para el `title`).
export default function ResetIconButton({ onClick, label, caption }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="group flex flex-col items-center gap-1 shrink-0">
      <span className="p-4 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full group-hover:bg-slate-200 dark:group-hover:bg-slate-600 group-active:scale-95 transition-all">
        <IconRefresh size={22} />
      </span>
      {caption && <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{caption}</span>}
    </button>
  );
}

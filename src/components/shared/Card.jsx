export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 ${className}`}>
      {children}
    </div>
  );
}

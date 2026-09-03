export default function StickyBar({ children }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg z-40">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {children}
      </div>
    </div>
  );
}

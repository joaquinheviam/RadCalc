// Panel de resultado fijo abajo. Ocupa ~28-30% del alto de la pantalla
// (con un mínimo y un máximo para que no se vea absurdo en pantallas muy
// chicas o muy grandes) y centra el contenido verticalmente: primero el
// resultado (grande, legible) y después los botones de acción.
export default function StickyBar({ children }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] z-40 px-5 pt-5 pb-6 flex flex-col items-center justify-center gap-4"
      style={{ height: '29dvh', minHeight: '210px', maxHeight: '320px' }}
    >
      <div className="max-w-md w-full mx-auto flex flex-col items-center justify-center gap-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

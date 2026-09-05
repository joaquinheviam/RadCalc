// Panel de resultado fijo abajo. Tiene una altura mínima (~28-30% de la
// pantalla, con un piso para que no se vea absurdo en pantallas muy chicas)
// pero crece con el contenido cuando el texto del resultado es más largo
// (p. ej. conclusiones extensas), en vez de recortarlo y forzar scroll
// interno. overflow-y-auto queda solo como resguardo para el caso extremo
// en que el contenido supere el alto máximo.
export default function StickyBar({ children }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] z-40 px-5 pt-5 pb-6 flex flex-col items-center justify-center gap-4"
      style={{ minHeight: '210px', maxHeight: '55dvh' }}
    >
      <div className="max-w-md w-full mx-auto flex flex-col items-center justify-center gap-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

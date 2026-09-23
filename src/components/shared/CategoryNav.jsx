import { useEffect, useRef, useState } from 'react';

// Fila de accesos rápidos por especialidad en la portada. Se desliza en
// horizontal en el celular, queda fija bajo la barra superior al hacer
// scroll y marca la especialidad que se está viendo. Tocar un botón salta a
// esa sección (no filtra: favoritas y búsqueda siguen igual). Cada sección
// del listado debe tener id="cat-<clave>" y un scroll-margin que deje
// espacio para la barra superior y esta fila.
export default function CategoryNav({ categories, ariaLabel }) {
  const [active, setActive] = useState(null);
  const rowRef = useRef(null);
  const chipRefs = useRef({});

  // Especialidad visible: la última sección cuyo inicio ya pasó bajo la fila.
  useEffect(() => {
    const sections = categories.map((cat) => document.getElementById(`cat-${cat.key}`)).filter(Boolean);
    if (!sections.length || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id.replace('cat-', ''));
    }, { rootMargin: '-130px 0px -55% 0px' });
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  // Mantiene visible (centrado) el botón activo dentro de la fila deslizable,
  // sin mover la página en vertical.
  useEffect(() => {
    const row = rowRef.current;
    const chip = active && chipRefs.current[active];
    if (!row || !chip) return;
    row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  const goTo = (key) => {
    const el = document.getElementById(`cat-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(key);
  };

  return (
    <nav aria-label={ariaLabel} className="sticky top-[60px] z-40 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm">
      <div ref={rowRef} className="flex gap-2 overflow-x-auto no-scrollbar md:flex-wrap md:justify-center md:overflow-visible">
        {categories.map((cat) => (
          <button
            key={cat.key}
            ref={(el) => { chipRefs.current[cat.key] = el; }}
            onClick={() => goTo(cat.key)}
            aria-current={active === cat.key ? 'true' : undefined}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors ${
              active === cat.key
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
            }`}
          >
            {cat.label}
            <span className={`text-[10px] font-bold ${active === cat.key ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>{cat.count}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

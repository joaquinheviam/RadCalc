import { useEffect, useRef, useState } from 'react';

// Fila de accesos rápidos por especialidad en la portada. Se desliza en
// horizontal en el celular, queda fija bajo la barra superior al hacer
// scroll y marca la especialidad que se está viendo. Tocar un botón salta a
// esa sección (no filtra: favoritas y búsqueda siguen igual). Cada sección
// del listado debe tener id="cat-<clave>" y un scroll-margin que deje
// espacio para la barra superior y esta fila.
export default function CategoryNav({ categories, ariaLabel }) {
  const [active, setActive] = useState(null);
  // Difuminado en los bordes de la fila (solo celular): indica que hay más
  // botones hacia ese lado; desaparece al llegar al extremo.
  const [fade, setFade] = useState({ left: false, right: false });
  const rowRef = useRef(null);
  const chipRefs = useRef({});

  // Especialidad visible: la última sección cuyo inicio ya pasó bajo la fila.
  useEffect(() => {
    const sections = categories.map((cat) => document.getElementById(`cat-${cat.key}`)).filter(Boolean);
    if (!sections.length || typeof IntersectionObserver === 'undefined') return undefined;
    // Se guarda el estado de todas las secciones (el observador solo informa
    // las que cambian) y se marca la de más arriba dentro de la franja visible.
    const visibleIds = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) visibleIds.add(e.target.id); else visibleIds.delete(e.target.id); });
      const top = sections.filter((s) => visibleIds.has(s.id))
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
      if (top) setActive(top.id.replace('cat-', ''));
    }, { rootMargin: '-110px 0px -55% 0px' });
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

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const update = () => setFade({
      left: row.scrollLeft > 4,
      right: row.scrollLeft + row.clientWidth < row.scrollWidth - 4,
    });
    update();
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { row.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [categories]);

  const goTo = (key) => {
    const el = document.getElementById(`cat-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(key);
  };

  return (
    <nav aria-label={ariaLabel} className="sticky top-[60px] z-40 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm">
      <div className="relative">
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
      <div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent transition-opacity md:hidden ${fade.left ? 'opacity-100' : 'opacity-0'}`} />
      <div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent transition-opacity md:hidden ${fade.right ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </nav>
  );
}

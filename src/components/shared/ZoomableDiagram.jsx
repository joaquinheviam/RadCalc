import { useEffect, useRef, useState } from 'react';
import { IconMaximize, IconX, IconRefresh } from '../icons/index.js';

// Envoltorio reutilizable para cualquier esquema SVG de la app: muestra el
// diagrama tal cual (sin cambios) y le agrega un botón "ampliar" en la
// esquina. Al tocarlo, abre el mismo diagrama en un visor de pantalla
// completa con pellizcar-para-zoom (pinch) y arrastre (pan), implementados
// a mano con la Pointer Events API — sin librerías externas.
//
// Por qué a mano: esta PWA deshabilita el zoom táctil nativo del navegador
// en TODA la app (user-scalable=no en el viewport de index.html, para que
// se sienta como una app y no se haga zoom sin querer sobre botones). Eso
// significa que, sin este componente, no hay ninguna forma de acercar el
// detalle de un esquema en el celular — de ahí el pedido de la usuaria.
// `touch-action: none` en el contenedor del visor le devuelve el control
// del gesto a este código, sin tocar el comportamiento de zoom del resto
// del sitio.
//
// Uso: <ZoomableDiagram title={c.diagramTitle} labels={t.common.diagramZoom}>
//        <MiEsquema ... />
//      </ZoomableDiagram>
// `labels` es el sub-objeto de i18n con expand/close/reset/hint (ver
// t.common.diagramZoom en strings.es.js/en.js) — se pasa una sola vez desde
// cada calculadora, nunca hardcodeado acá.

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;

const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

// Recalcula {scale, tx, ty} para que el punto (anchorX, anchorY) del
// contenedor quede fijo en pantalla al pasar de prevScale a un scale nuevo
// (matemática estándar de "zoom hacia un punto" con transform
// `translate(tx,ty) scale(s)` y transform-origin en 0 0).
const zoomAt = (anchorX, anchorY, prevScale, nextScale, prevTx, prevTy) => {
  const s = clampScale(nextScale);
  const cx = (anchorX - prevTx) / prevScale;
  const cy = (anchorY - prevTy) / prevScale;
  return { scale: s, tx: anchorX - cx * s, ty: anchorY - cy * s };
};

function ZoomStage({ children, resetLabel }) {
  const containerRef = useRef(null);
  const pointers = useRef(new Map());
  const gestureRef = useRef(null);
  const lastTapRef = useRef(0);
  // El estado de React (`transform`) solo maneja el re-render; la fuente de
  // verdad para los cálculos de gesto es `transformRef`, actualizada de
  // forma síncrona en cada cambio. Esto evita leer un valor de `transform`
  // desactualizado cuando varios eventos de puntero llegan agrupados en el
  // mismo ciclo (React agrupa los `setState` de ese ciclo en un solo
  // re-render, así que el closure de `transform` no se actualiza a mitad
  // de una secuencia rápida de pointerdown/pointermove).
  const transformRef = useRef({ scale: MIN_SCALE, tx: 0, ty: 0 });
  const [transform, setTransformState] = useState(transformRef.current);
  const [isGesturing, setIsGesturing] = useState(false);

  const applyTransform = (next) => {
    transformRef.current = next;
    setTransformState(next);
  };

  // Rueda del mouse (desktop): zoom centrado en el cursor. Se agrega con un
  // listener nativo no-pasivo porque React trata `onWheel` como pasivo por
  // defecto, y ahí `preventDefault()` no tiene efecto.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const t = transformRef.current;
      applyTransform(zoomAt(px, py, t.scale, t.scale * factor, t.tx, t.ty));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e) => {
    // setPointerCapture puede lanzar si el pointerId no corresponde a un
    // puntero activo del navegador (no debería pasar con eventos reales,
    // pero se protege igual): sin el try/catch, esa excepción cortaría el
    // resto del handler y el gesto nunca se registraría.
    try { containerRef.current?.setPointerCapture(e.pointerId); } catch { /* noop */ }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointers.current.values());
    const rect = containerRef.current.getBoundingClientRect();
    const t = transformRef.current;

    if (pts.length >= 2) {
      const [a, b] = pts;
      gestureRef.current = {
        type: 'pinch',
        startDist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        startScale: t.scale,
        anchor: { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top },
        startTx: t.tx,
        startTy: t.ty,
      };
      setIsGesturing(true);
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      applyTransform(
        t.scale > MIN_SCALE + 0.01
          ? { scale: MIN_SCALE, tx: 0, ty: 0 }
          : zoomAt(px, py, MIN_SCALE, DOUBLE_TAP_SCALE, 0, 0)
      );
      gestureRef.current = null;
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
    setIsGesturing(true);
    gestureRef.current = { type: 'pan', startX: e.clientX, startY: e.clientY, startTx: t.tx, startTy: t.ty };
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureRef.current;
    if (!g) return;
    const pts = Array.from(pointers.current.values());

    if (g.type === 'pinch' && pts.length >= 2) {
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      applyTransform(zoomAt(g.anchor.x, g.anchor.y, g.startScale, g.startScale * (dist / g.startDist), g.startTx, g.startTy));
    } else if (g.type === 'pan' && pts.length === 1) {
      const t = transformRef.current;
      applyTransform({ ...t, tx: g.startTx + (e.clientX - g.startX), ty: g.startTy + (e.clientY - g.startY) });
    }
  };

  const endPointer = (e) => {
    pointers.current.delete(e.pointerId);
    const pts = Array.from(pointers.current.values());
    if (pts.length === 1) {
      const t = transformRef.current;
      gestureRef.current = { type: 'pan', startX: pts[0].x, startY: pts[0].y, startTx: t.tx, startTy: t.ty };
    } else if (pts.length === 0) {
      gestureRef.current = null;
      setIsGesturing(false);
    }
  };

  const resetZoom = () => applyTransform({ scale: MIN_SCALE, tx: 0, ty: 0 });
  const isZoomed = transform.scale > MIN_SCALE + 0.01;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-h-0 overflow-hidden touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    >
      <div
        className="flex h-full w-full items-center justify-center"
        style={{
          transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          transition: isGesturing ? 'none' : 'transform 0.15s ease-out',
          cursor: isZoomed ? 'grab' : 'default',
        }}
      >
        {children}
      </div>
      {isZoomed && (
        <button
          onClick={resetZoom}
          aria-label={resetLabel}
          title={resetLabel}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-sm active:scale-95 transition-transform"
        >
          <IconRefresh size={18} />
        </button>
      )}
    </div>
  );
}

export default function ZoomableDiagram({ children, title, labels }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className="relative">
        {children}
        <button
          onClick={() => setOpen(true)}
          aria-label={labels.expand}
          title={labels.expand}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/85 dark:bg-slate-900/75 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200/70 dark:border-slate-700/70 hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition-all backdrop-blur-sm"
        >
          <IconMaximize size={16} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true" aria-label={title}>
          <div className="flex items-center justify-between gap-3 px-4 py-3 shrink-0">
            <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label={labels.close}
              title={labels.close}
              className="p-2 rounded-full text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-all shrink-0"
            >
              <IconX size={20} />
            </button>
          </div>
          <ZoomStage resetLabel={labels.reset}>{children}</ZoomStage>
          <p className="shrink-0 text-center text-[11px] text-white/60 px-4 py-2">{labels.hint}</p>
        </div>
      )}
    </>
  );
}

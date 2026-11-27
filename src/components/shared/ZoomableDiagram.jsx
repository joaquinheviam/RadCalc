import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
//
// `legend` (opcional, ReactNode): leyenda del esquema que vive fuera del SVG.
// Se muestra bajo el diagrama dentro del visor.
//
// Ajuste al abrir ("fit"): en el visor el contenido se dibuja con el mismo
// ancho que tiene en la página (así respeta sus `max-w-*` y su proporción) y
// luego se escala para llenar el ancho/alto disponibles. Pellizco, rueda y
// doble toque trabajan encima de ese ajuste (escala 1 = ajustado al visor).

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const MAX_FIT = 3;
const FIT_MARGIN = 0.96;
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

function ZoomStage({ children, resetLabel, contentWidth }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [fit, setFit] = useState(1);

  // Escala de ajuste: el contenido (a su ancho de página) se agranda o achica
  // para caber completo en el visor. Se recalcula si cambia el tamaño del
  // visor (p. ej., al rotar el teléfono) o del contenido.
  useLayoutEffect(() => {
    const box = containerRef.current;
    const content = contentRef.current;
    if (!box || !content) return undefined;
    const measure = () => {
      const w = content.offsetWidth;
      const h = content.offsetHeight;
      const cw = box.clientWidth;
      const ch = box.clientHeight;
      if (!w || !h || !cw || !ch) return;
      setFit(Math.min(MAX_FIT, (cw * FIT_MARGIN) / w, (ch * FIT_MARGIN) / h));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(content);
    return () => ro.disconnect();
  }, [contentWidth]);
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
        <div
          ref={contentRef}
          className="shrink-0"
          style={{
            width: contentWidth ? `${contentWidth}px` : undefined,
            transform: `scale(${fit})`,
            transformOrigin: 'center center',
          }}
        >
          {children}
        </div>
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

export default function ZoomableDiagram({ children, title, labels, legend = null }) {
  const [open, setOpen] = useState(false);
  const inlineRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);

  const openViewer = () => {
    setContentWidth(inlineRef.current?.offsetWidth || 0);
    setOpen(true);
  };

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
      <div className="relative" ref={inlineRef}>
        {children}
        <button
          onClick={openViewer}
          aria-label={labels.expand}
          title={labels.expand}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/85 dark:bg-slate-900/75 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200/70 dark:border-slate-700/70 hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition-all backdrop-blur-sm"
        >
          <IconMaximize size={16} />
        </button>
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        // z-[210]: por encima de los avisos flotantes (UpdateToast «listo para
        // usarse sin conexión» y prompts de instalación/idioma/donación, z-[200]).
        // Portal a body para que ningún ancestro con backdrop-blur lo encierre.
        <div className="fixed inset-0 z-[210] flex flex-col bg-black/90 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true" aria-label={title}>
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
          <ZoomStage resetLabel={labels.reset} contentWidth={contentWidth}>{children}</ZoomStage>
          {legend && (
            <div className="shrink-0 max-h-[35vh] overflow-y-auto mx-3 mt-2 rounded-xl bg-white dark:bg-slate-900 p-3 text-slate-700 dark:text-slate-200">
              {legend}
            </div>
          )}
          <p className="shrink-0 text-center text-[11px] text-white/60 px-4 py-2">{labels.hint}</p>
        </div>,
        document.body
      )}
    </>
  );
}

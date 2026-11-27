import { useLang } from '../../i18n/LangContext.js';
import { niceTicks } from '../../calculators/logic/chartData.js';

// Gráficos de datos de referencia (SVG propio, sin librerías). El SVG escala al
// ancho del contenedor (viewBox de 320 de ancho: a 375 px de pantalla el texto
// de 11 unidades queda en ~10 px). Colores con clases de Tailwind (claro/oscuro).

const W = 320;
const TONE = {
  patient: 'fill-blue-600 dark:fill-blue-400',
};
const TXT = 'fill-slate-500 dark:fill-slate-400';
const TXT_STRONG = 'fill-slate-700 dark:fill-slate-200';
// Halo del color de la tarjeta para que las líneas no tapen el texto.
const HALO = 'stroke-white dark:stroke-slate-800';
const haloStyle = { paintOrder: 'stroke', strokeWidth: 3, strokeLinejoin: 'round' };

function useNum() {
  const { lang } = useLang();
  return (x, d = 0) => x.toLocaleString(lang === 'es' ? 'es-CL' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: d });
}

// Marco común: título, gráfico y leyenda corta.
export default function ReferenceChart({ title, ariaLabel, viewHeight, legend, note, children }) {
  return (
    <figure className="space-y-2">
      {title && <figcaption className="text-xs font-medium text-slate-600 dark:text-slate-300">{title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${viewHeight}`} width="100%" role="img" aria-label={ariaLabel} className="block overflow-visible select-none" style={{ fontSize: 11 }}>
        {children}
      </svg>
      {legend && legend.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400" aria-hidden="true">
          {legend.map((it) => (
            <li key={it.label} className="flex items-center gap-1.5">
              <span className={`inline-block shrink-0 ${it.swatch}`} />
              {it.label}
            </li>
          ))}
        </ul>
      )}
      {note && <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{note}</p>}
    </figure>
  );
}

const SWATCH = {
  band: 'w-3.5 h-2.5 rounded-sm bg-emerald-500/25 dark:bg-emerald-400/25',
  mean: 'w-3.5 h-0.5 bg-emerald-600 dark:bg-emerald-400',
  patient: 'w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400',
  zero: 'w-3.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600',
  patientBand: 'w-3.5 h-2.5 rounded-sm bg-blue-500 dark:bg-blue-400',
  ref: 'w-3.5 h-0 border-t border-dashed border-slate-500',
  target: 'w-3.5 h-0 border-t-2 border-dashed border-emerald-500',
};

/**
 * Banda de referencia por grupo de edad (escalones, un tramo por grupo).
 * bins: [{ key, mean, lo, hi }]; ticks: { [key]: etiqueta en el borde izquierdo };
 * endTick: etiqueta del borde derecho; points: [{ value, tag }].
 */
export function BandByAgeChart({ title, ariaLabel, bins, selected, points, ticks, endTick, xLabel, yLabel, legendText, note }) {
  const num = useNum();
  const H = 214;
  const L = 32;
  const R = 6;
  const T = 8;
  const B = 44;
  const pw = W - L - R;
  const ph = H - T - B;
  const vals = [...bins.flatMap((b) => [b.lo, b.hi]), ...points.map((p) => p.value)];
  const yt = niceTicks(Math.min(...vals), Math.max(...vals), 5);
  const y0 = yt[0];
  const y1 = yt[yt.length - 1];
  const y = (v) => T + ph - ((v - y0) / (y1 - y0)) * ph;
  const bw = pw / bins.length;
  const x = (i) => L + i * bw;
  const si = bins.findIndex((b) => b.key === selected);
  return (
    <ReferenceChart
      title={title}
      ariaLabel={ariaLabel}
      viewHeight={H}
      note={note}
      legend={[
        { label: legendText.band, swatch: SWATCH.band },
        { label: legendText.mean, swatch: SWATCH.mean },
        { label: legendText.patient, swatch: SWATCH.patient },
      ]}
    >
      {si >= 0 && <rect x={x(si)} y={T} width={bw} height={ph} className="fill-blue-500/10 dark:fill-blue-400/15" />}
      {yt.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="0.75" />
          <text x={L - 4} y={y(v) + 3.5} textAnchor="end" className={TXT}>{num(v, 1)}</text>
        </g>
      ))}
      {bins.map((b, i) => (
        <g key={b.key}>
          <rect x={x(i) + 0.5} y={y(b.hi)} width={bw - 1} height={y(b.lo) - y(b.hi)} className="fill-emerald-500/25 dark:fill-emerald-400/25" />
          <line x1={x(i) + 0.5} x2={x(i + 1) - 0.5} y1={y(b.mean)} y2={y(b.mean)} className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.5" />
        </g>
      ))}
      <line x1={L} x2={W - R} y1={T + ph} y2={T + ph} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1" />
      {bins.map((b, i) => ticks[b.key] != null && (
        <g key={b.key}>
          <line x1={x(i)} x2={x(i)} y1={T + ph} y2={T + ph + 4} className="stroke-slate-400 dark:stroke-slate-500" />
          <text x={x(i)} y={T + ph + 15} textAnchor="middle" className={i === si ? TXT_STRONG : TXT}>{ticks[b.key]}</text>
        </g>
      ))}
      {endTick && (
        <g>
          <line x1={x(bins.length)} x2={x(bins.length)} y1={T + ph} y2={T + ph + 4} className="stroke-slate-400 dark:stroke-slate-500" />
          <text x={x(bins.length)} y={T + ph + 15} textAnchor="end" className={TXT}>{endTick}</text>
        </g>
      )}
      <text x={L + pw / 2} y={H - 6} textAnchor="middle" className={TXT}>{xLabel}</text>
      <text x={4} y={T + 2} className={TXT} transform={`rotate(-90 4 ${T + 2})`} textAnchor="end" dy="7">{yLabel}</text>
      {si >= 0 && points.map((p, k) => {
        const cx = x(si) + bw / 2 + (points.length > 1 ? (k === 0 ? -3 : 3) : 0);
        const cy = y(p.value);
        const right = si < bins.length / 2;
        return (
          <g key={k}>
            <circle cx={cx} cy={cy} r="4" className={`${TONE.patient} stroke-white dark:stroke-slate-800`} strokeWidth="1.5" />
            {p.tag && (
              <text x={right ? cx + 7 : cx - 7} y={cy + 3.5} textAnchor={right ? 'start' : 'end'} className={TXT_STRONG} style={{ fontWeight: 600 }}>{p.tag}</text>
            )}
          </g>
        );
      })}
    </ReferenceChart>
  );
}

/**
 * Escala de percentiles del CAC (salida de cacScale). Tramos de igual ancho entre
 * los percentiles conocidos (escala ordinal). labels: textos ya traducidos.
 */
export function PercentileScaleChart({ scale, ariaLabel, title, labels, note }) {
  const num = useNum();
  const L = 8;
  const R = 8;
  const pw = W - L - R;
  const n = scale.bands.length;
  const bw = pw / n;
  const bx = (p) => L + scale.bounds.indexOf(p) * bw;
  const barY = 40;
  const barH = 18;
  const pLabel = (p) => `P${num(p, 1)}`;
  const cutByP = Object.fromEntries(scale.cuts.map((c) => [c.p, c.cac]));
  const hi = scale.bands.filter((b) => b.patient);
  let mx = null;
  if (scale.marker !== null) mx = bx(scale.marker);
  else if (hi.length) mx = (bx(hi[0].from) + bx(hi[hi.length - 1].to)) / 2;
  const anchor = mx === null ? 'middle' : mx < 80 ? 'start' : mx > W - 80 ? 'end' : 'middle';
  const labelX = mx === null ? W / 2 : anchor === 'start' ? L : anchor === 'end' ? W - R : mx;
  const zeroEnd = scale.zeroPct !== null && scale.zeroPct > 0 ? bx(scale.zeroPct) : null;
  const H = zeroEnd !== null ? 104 : 84;
  const legend = mx !== null ? [{ label: labels.patientBand, swatch: SWATCH.patientBand }] : [];
  if (zeroEnd !== null) legend.push({ label: labels.zeroLegend, swatch: SWATCH.zero });
  return (
    <ReferenceChart title={title} ariaLabel={ariaLabel} viewHeight={H} legend={legend} note={note}>
      <text x={labelX} y={12} textAnchor={anchor} className={mx === null ? TXT : 'fill-blue-700 dark:fill-blue-300'} style={{ fontWeight: 600 }}>{labels.patient}</text>
      {mx !== null && <path d={`M${mx - 5} 20 L${mx + 5} 20 L${mx} 27 Z`} className={TONE.patient} />}
      {scale.bands.map((b) => (
        <rect
          key={b.from}
          x={bx(b.from) + 0.5}
          y={barY}
          width={bw - 1}
          height={barH}
          rx="2"
          className={b.patient ? 'fill-blue-500 dark:fill-blue-400' : b.zero ? 'fill-slate-300 dark:fill-slate-600' : 'fill-slate-100 dark:fill-slate-700'}
        />
      ))}
      {scale.marker !== null && <line x1={mx} x2={mx} y1={barY - 4} y2={barY + barH + 4} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="3" />}
      {scale.bounds.slice(1, -1).map((p) => (
        <g key={p}>
          <text x={bx(p)} y={barY - 5} textAnchor="middle" className={cutByP[p] === undefined ? TXT : TXT_STRONG}>{pLabel(p)}</text>
          {cutByP[p] !== undefined && <text x={bx(p)} y={barY + barH + 13} textAnchor="middle" className={TXT_STRONG}>{num(cutByP[p])}</text>}
        </g>
      ))}
      <text x={L} y={barY + barH + 13} textAnchor="start" className={TXT}>{labels.cacRow}</text>
      {zeroEnd !== null && (
        <g>
          <path d={`M${L + 1} ${barY + barH + 19} v4 H${zeroEnd - 1} v-4`} className="stroke-slate-400 dark:stroke-slate-500" fill="none" />
          <text x={zeroEnd - 1 < 80 ? L + 1 : (L + zeroEnd) / 2} y={barY + barH + 35} textAnchor={zeroEnd - 1 < 80 ? 'start' : 'middle'} className={TXT}>{labels.zeroBracket}</text>
        </g>
      )}
    </ReferenceChart>
  );
}

// Separa etiquetas verticalmente para que no se pisen (mín. gap unidades).
function spread(items, gap, minY, maxY) {
  const s = [...items].sort((a, b) => a.y - b.y);
  for (let i = 1; i < s.length; i++) if (s[i].y - s[i - 1].y < gap) s[i].y = s[i - 1].y + gap;
  const over = s.length ? s[s.length - 1].y - maxY : 0;
  if (over > 0) s.forEach((it) => { it.y -= over; });
  for (let i = s.length - 2; i >= 0; i--) if (s[i + 1].y - s[i].y < gap) s[i].y = s[i + 1].y - gap;
  s.forEach((it) => { it.y = Math.max(minY, it.y); });
  return s;
}

/**
 * Curva de UH por fase con marcas de referencia en la fase a la que se aplican.
 * phases: [{ key, label, value|null, refs: [{ value, label, tone: 'ref'|'target'|'warn' }] }]
 */
export function PhaseLineChart({ title, ariaLabel, phases, yLabel, legendText, note }) {
  const num = useNum();
  const H = 220;
  const L = 34;
  const R = 6;
  const T = 14;
  const B = 34;
  const ph = H - T - B;
  const all = phases.flatMap((p) => [p.value, ...p.refs.map((r) => r.value)]).filter((v) => Number.isFinite(v));
  const yt = niceTicks(Math.min(...all), Math.max(...all), 5);
  const y0 = yt[0];
  const y1 = yt[yt.length - 1];
  const y = (v) => T + ph - ((v - y0) / (y1 - y0)) * ph;
  const xs = [L + 46, L + (W - L - R) / 2, W - R - 46];
  const pts = phases.map((p, i) => (Number.isFinite(p.value) ? { x: xs[i], y: y(p.value), v: p.value } : null));
  const line = pts.filter(Boolean);
  const toneCls = {
    ref: 'stroke-slate-500 dark:stroke-slate-400',
    target: 'stroke-emerald-500 dark:stroke-emerald-400',
    warn: 'stroke-amber-500 dark:stroke-amber-400',
  };
  const toneTxt = {
    ref: TXT,
    target: 'fill-emerald-700 dark:fill-emerald-300',
    warn: 'fill-amber-700 dark:fill-amber-300',
  };
  const hasTarget = phases.some((p) => p.refs.some((r) => r.tone === 'target'));
  const legend = [
    { label: legendText.patient, swatch: SWATCH.patient },
    { label: legendText.ref, swatch: SWATCH.ref },
  ];
  if (hasTarget) legend.push({ label: legendText.target, swatch: SWATCH.target });
  return (
    <ReferenceChart title={title} ariaLabel={ariaLabel} viewHeight={H} legend={legend} note={note}>
      {yt.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className={v === 0 ? 'stroke-slate-300 dark:stroke-slate-600' : 'stroke-slate-200 dark:stroke-slate-700'} strokeWidth="0.75" />
          <text x={L - 4} y={y(v) + 3.5} textAnchor="end" className={TXT}>{num(v)}</text>
        </g>
      ))}
      <text x={4} y={T} className={TXT} transform={`rotate(-90 4 ${T})`} textAnchor="end" dy="7">{yLabel}</text>
      {phases.map((p, i) => {
        const x1 = xs[i] - 20;
        const x2 = xs[i] + 20;
        return (
          <g key={p.key}>
            <line x1={xs[i]} x2={xs[i]} y1={T + ph} y2={T + ph + 4} className="stroke-slate-400 dark:stroke-slate-500" />
            <text x={xs[i]} y={T + ph + 16} textAnchor="middle" className={TXT_STRONG}>{p.label}</text>
            {p.refs.map((r) => (
              <line key={r.label} x1={x1} x2={x2} y1={y(r.value)} y2={y(r.value)} className={toneCls[r.tone]} strokeWidth={r.tone === 'target' ? 2 : 1.25} strokeDasharray="4 3" />
            ))}
          </g>
        );
      })}
      <line x1={L} x2={W - R} y1={T + ph} y2={T + ph} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1" />
      {line.length > 1 && (
        <polyline points={line.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" strokeLinejoin="round" />
      )}
      {phases.map((p, i) => {
        // Etiquetas de umbral (sobre la curva, con halo): a la derecha de la marca,
        // salvo en la última fase (a la izquierda).
        const left = i === phases.length - 1;
        const labs = spread(p.refs.map((r) => ({ ...r, y: y(r.value) + 3.5 })), 11, T, T + ph + 3);
        return labs.map((r) => (
          <text key={`${p.key}-${r.label}`} x={left ? xs[i] - 23 : xs[i] + 23} y={r.y} textAnchor={left ? 'end' : 'start'} className={`${toneTxt[r.tone]} ${HALO}`} style={haloStyle}>{r.label}</text>
        ));
      })}
      {line.map((q) => {
        // Valor al lado opuesto de las etiquetas de umbral de su fase.
        const last = q.x === xs[xs.length - 1];
        return (
          <g key={q.x}>
            <circle cx={q.x} cy={q.y} r="4.5" className={`${TONE.patient} stroke-white dark:stroke-slate-800`} strokeWidth="1.5" />
            <text x={last ? q.x + 8 : q.x - 8} y={q.y - 6} textAnchor={last ? 'start' : 'end'} className={`fill-blue-700 dark:fill-blue-300 ${HALO}`} style={{ ...haloStyle, fontWeight: 600 }}>{num(q.v, 1)}</text>
          </g>
        );
      })}
    </ReferenceChart>
  );
}

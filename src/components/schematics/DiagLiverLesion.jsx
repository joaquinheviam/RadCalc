import { SVG_STROKE } from './svgStroke.js';

export default function DiagLiverLesion() {
  return (
    <svg viewBox="0 0 200 120" width="100%">
      <path d="M20 80 Q20 30 70 25 Q120 15 160 40 Q190 55 175 85 Q140 105 80 100 Q30 100 20 80 Z" {...SVG_STROKE} />
      <circle cx="105" cy="60" r="16" {...SVG_STROKE} stroke="#dc2626" />
      <text x="105" y="105" textAnchor="middle" fontSize="9" fill="currentColor">Lesión + realce arterial / lavado</text>
    </svg>
  );
}

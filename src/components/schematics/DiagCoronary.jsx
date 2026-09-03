import { SVG_STROKE } from './svgStroke.js';

export default function DiagCoronary() {
  return (
    <svg viewBox="0 0 200 120" width="100%">
      <circle cx="100" cy="60" r="45" {...SVG_STROKE} />
      <circle cx="100" cy="60" r="27" {...SVG_STROKE} />
      <path d="M100 15 Q60 30 55 60 Q52 85 80 100" {...SVG_STROKE} stroke="#dc2626" strokeWidth="4" />
      <text x="100" y="115" textAnchor="middle" fontSize="9" fill="currentColor">Corte transversal, placa/estenosis</text>
    </svg>
  );
}

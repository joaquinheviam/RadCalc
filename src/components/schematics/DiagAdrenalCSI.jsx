import { SVG_STROKE } from './svgStroke.js';

export default function DiagAdrenalCSI() {
  return (
    <svg viewBox="0 0 200 130" width="100%">
      <circle cx="60" cy="60" r="30" {...SVG_STROKE} />
      <text x="60" y="105" textAnchor="middle" fontSize="10" fill="currentColor">Lesión</text>
      <circle cx="150" cy="60" r="22" {...SVG_STROKE} strokeDasharray="4 3" />
      <text x="150" y="105" textAnchor="middle" fontSize="10" fill="currentColor">Bazo/hígado</text>
      <text x="60" y="35" textAnchor="middle" fontSize="9" fill="currentColor">↓ señal fuera de fase</text>
    </svg>
  );
}

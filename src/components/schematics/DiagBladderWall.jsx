import { SVG_STROKE } from './svgStroke.js';

export default function DiagBladderWall() {
  return (
    <svg viewBox="0 0 200 120" width="100%">
      <path d="M20 100 Q100 20 180 100" {...SVG_STROKE} />
      <path d="M30 96 Q100 30 170 96" {...SVG_STROKE} strokeDasharray="3 2" />
      <ellipse cx="100" cy="65" rx="10" ry="14" {...SVG_STROKE} stroke="#dc2626" />
      <text x="100" y="112" textAnchor="middle" fontSize="9" fill="currentColor">Pared vesical + lesión (T2/DWI/DCE)</text>
    </svg>
  );
}

import { SVG_STROKE } from './svgStroke.js';

export default function DiagPancreas() {
  return (
    <svg viewBox="0 0 200 120" width="100%">
      <path d="M20 70 Q40 40 80 45 Q120 35 160 50 Q180 55 175 70 Q160 80 120 75 Q80 85 40 80 Q20 78 20 70 Z" {...SVG_STROKE} />
      <circle cx="130" cy="58" r="12" {...SVG_STROKE} stroke="#2563eb" />
      <line x1="60" y1="60" x2="150" y2="58" strokeDasharray="2 2" {...SVG_STROKE} />
      <text x="100" y="106" textAnchor="middle" fontSize="9" fill="currentColor">Páncreas + conducto + quiste</text>
    </svg>
  );
}

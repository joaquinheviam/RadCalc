import { SVG_STROKE } from './svgStroke.js';

export default function DiagThymus() {
  return (
    <svg viewBox="0 0 200 120" width="100%">
      <path d="M80 20 Q60 40 65 70 Q68 95 90 100 L90 40 Z" {...SVG_STROKE} />
      <path d="M120 20 Q140 40 135 70 Q132 95 110 100 L110 40 Z" {...SVG_STROKE} />
      <rect x="150" y="45" width="18" height="45" rx="3" {...SVG_STROKE} strokeDasharray="3 2" />
      <text x="159" y="102" textAnchor="middle" fontSize="9" fill="currentColor">músculo ref.</text>
      <text x="100" y="112" textAnchor="middle" fontSize="9" fill="currentColor">Timo (lóbulos)</text>
    </svg>
  );
}

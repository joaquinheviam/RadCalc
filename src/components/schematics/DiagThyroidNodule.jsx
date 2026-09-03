import { SVG_STROKE } from './svgStroke.js';

export default function DiagThyroidNodule() {
  return (
    <svg viewBox="0 0 200 130" width="100%">
      <path d="M60 30 Q30 40 30 70 Q30 100 65 110 L75 100 Q60 90 60 65 Q60 45 80 35 Z" {...SVG_STROKE} />
      <path d="M140 30 Q170 40 170 70 Q170 100 135 110 L125 100 Q140 90 140 65 Q140 45 120 35 Z" {...SVG_STROKE} />
      <ellipse cx="100" cy="68" rx="22" ry="16" {...SVG_STROKE} stroke="#2563eb" />
      <text x="100" y="120" textAnchor="middle" fontSize="9" fill="currentColor">Nódulo tiroideo</text>
    </svg>
  );
}

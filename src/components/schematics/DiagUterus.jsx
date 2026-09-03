import { SVG_STROKE } from './svgStroke.js';

export default function DiagUterus() {
  return (
    <svg viewBox="0 0 200 130" width="100%">
      <path d="M100 20 Q60 20 55 55 Q30 65 30 90 M100 20 Q140 20 145 55 Q170 65 170 90" {...SVG_STROKE} />
      <path d="M70 55 Q100 40 130 55 Q140 90 100 105 Q60 90 70 55 Z" {...SVG_STROKE} />
      <circle cx="88" cy="68" r="10" {...SVG_STROKE} stroke="#2563eb" />
      <text x="100" y="120" textAnchor="middle" fontSize="9" fill="currentColor">Útero / cavidad / mioma</text>
    </svg>
  );
}

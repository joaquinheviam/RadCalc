import { SVG_STROKE } from './svgStroke.js';

export default function DiagRectum() {
  return (
    <svg viewBox="0 0 200 130" width="100%">
      <path d="M100 15 L100 90" {...SVG_STROKE} />
      <ellipse cx="100" cy="100" rx="45" ry="22" {...SVG_STROKE} />
      <circle cx="90" cy="95" r="14" {...SVG_STROKE} stroke="#dc2626" />
      <path d="M55 100 Q100 130 145 100" strokeDasharray="3 2" {...SVG_STROKE} />
      <text x="100" y="16" textAnchor="middle" fontSize="9" fill="currentColor">Recto</text>
      <text x="100" y="124" textAnchor="middle" fontSize="8" fill="currentColor">fascia mesorrectal</text>
    </svg>
  );
}

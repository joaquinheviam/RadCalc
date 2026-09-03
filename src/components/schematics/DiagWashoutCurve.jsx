import { SVG_STROKE } from './svgStroke.js';

export default function DiagWashoutCurve() {
  return (
    <svg viewBox="0 0 200 130" width="100%">
      <line x1="20" y1="110" x2="190" y2="110" {...SVG_STROKE} />
      <line x1="20" y1="110" x2="20" y2="15" {...SVG_STROKE} />
      <text x="4" y="18" fontSize="9" fill="currentColor">UH</text>
      <text x="170" y="124" fontSize="9" fill="currentColor">t</text>
      <path d="M20 95 L55 30 L100 55 L190 78" {...SVG_STROKE} stroke="#2563eb" />
      <circle cx="20" cy="95" r="3" fill="#2563eb" />
      <circle cx="55" cy="30" r="3" fill="#2563eb" />
      <circle cx="100" cy="55" r="3" fill="#2563eb" />
      <circle cx="190" cy="78" r="3" fill="#2563eb" />
      <text x="12" y="106" fontSize="8" fill="currentColor">sin CT</text>
      <text x="45" y="24" fontSize="8" fill="currentColor">portal</text>
      <text x="100" y="48" fontSize="8" fill="currentColor">5-10-15min</text>
    </svg>
  );
}

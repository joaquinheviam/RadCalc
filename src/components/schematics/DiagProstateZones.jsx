import { SVG_STROKE } from './svgStroke.js';

export default function DiagProstateZones() {
  return (
    <svg viewBox="0 0 200 140" width="100%">
      <circle cx="100" cy="75" r="55" {...SVG_STROKE} />
      <circle cx="100" cy="75" r="28" {...SVG_STROKE} strokeDasharray="4 3" />
      <text x="100" y="80" textAnchor="middle" fontSize="9" fill="currentColor">TZ</text>
      <text x="100" y="30" textAnchor="middle" fontSize="9" fill="currentColor">PZ</text>
    </svg>
  );
}

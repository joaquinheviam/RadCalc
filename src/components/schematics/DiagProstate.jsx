import { SVG_STROKE } from './svgStroke.js';

export default function DiagProstate() {
  return (
    <svg viewBox="0 0 200 140" width="100%">
      <ellipse cx="100" cy="70" rx="55" ry="38" {...SVG_STROKE} />
      <line x1="100" y1="32" x2="100" y2="108" strokeDasharray="3 3" {...SVG_STROKE} />
      <line x1="45" y1="70" x2="155" y2="70" strokeDasharray="3 3" {...SVG_STROKE} />
      <text x="100" y="22" textAnchor="middle" fontSize="11" fill="currentColor">LONG</text>
      <text x="168" y="74" textAnchor="middle" fontSize="11" fill="currentColor">TR</text>
      <text x="100" y="128" textAnchor="middle" fontSize="11" fill="currentColor">AP</text>
      <line x1="100" y1="70" x2="100" y2="108" {...SVG_STROKE} strokeDasharray="0" />
    </svg>
  );
}

import { SVG_STROKE } from './svgStroke.js';

export default function DiagDixon() {
  return (
    <svg viewBox="0 0 200 120" width="100%">
      <rect x="20" y="30" width="70" height="60" rx="6" {...SVG_STROKE} />
      <text x="55" y="65" textAnchor="middle" fontSize="12" fill="currentColor">In-phase</text>
      <rect x="110" y="30" width="70" height="60" rx="6" {...SVG_STROKE} />
      <text x="145" y="60" textAnchor="middle" fontSize="12" fill="currentColor">Out-of-</text>
      <text x="145" y="74" textAnchor="middle" fontSize="12" fill="currentColor">phase</text>
      <line x1="90" y1="60" x2="108" y2="60" {...SVG_STROKE} markerEnd="url(#arrow)" />
      <path d="M100 55 L108 60 L100 65 Z" fill="currentColor" />
    </svg>
  );
}

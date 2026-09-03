import { SVG_STROKE } from './svgStroke.js';

export default function DiagKidneyMass() {
  return (
    <svg viewBox="0 0 200 130" width="100%">
      <path d="M70 20 Q40 20 35 50 Q25 65 35 80 Q40 110 70 110 Q100 110 100 75 Q100 40 70 20 Z" {...SVG_STROKE} />
      <circle cx="65" cy="60" r="15" {...SVG_STROKE} stroke="#dc2626" />
      <text x="67" y="122" textAnchor="middle" fontSize="9" fill="currentColor">Riñón + masa exofítica/endofítica</text>
    </svg>
  );
}

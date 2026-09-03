import { SVG_STROKE } from './svgStroke.js';

export default function DiagOvaryMRI() {
  return (
    <svg viewBox="0 0 200 130" width="100%">
      <ellipse cx="100" cy="65" rx="50" ry="40" {...SVG_STROKE} />
      <circle cx="80" cy="55" r="14" {...SVG_STROKE} stroke="#2563eb" />
      <path d="M92 62 Q100 75 112 60" {...SVG_STROKE} stroke="#2563eb" />
      <text x="100" y="118" textAnchor="middle" fontSize="9" fill="currentColor">Componente sólido + curva DCE</text>
    </svg>
  );
}

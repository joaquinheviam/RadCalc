import { SVG_STROKE } from './svgStroke.js';

export default function DiagLungCysts() {
  return (
    <svg viewBox="0 0 200 130" width="100%">
      <path d="M60 20 Q30 40 30 75 Q30 110 70 115 L90 100 L90 30 Z" {...SVG_STROKE} />
      <path d="M140 20 Q170 40 170 75 Q170 110 130 115 L110 100 L110 30 Z" {...SVG_STROKE} />
      {[[55,55,8],[75,80,6],[125,60,7],[145,90,5]].map(([cx,cy,r],i) => <circle key={i} cx={cx} cy={cy} r={r} {...SVG_STROKE} stroke="#2563eb" />)}
      <text x="100" y="126" textAnchor="middle" fontSize="9" fill="currentColor">Quistes: pared / distribución / n°</text>
    </svg>
  );
}

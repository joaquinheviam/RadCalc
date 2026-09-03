import { SVG_STROKE } from './svgStroke.js';

export default function DiagLiverIron() {
  return (
    <svg viewBox="0 0 200 120" width="100%">
      <path d="M30 90 Q20 50 55 35 Q80 15 120 30 Q160 25 175 60 Q180 90 150 95 Q90 105 30 90 Z" {...SVG_STROKE} />
      {[0,1,2,3,4].map(i => <circle key={i} cx={60 + i*22} cy={60 + (i%2)*10} r="2.4" fill="currentColor" />)}
      <text x="100" y="112" textAnchor="middle" fontSize="9" fill="currentColor">R2* ↑ con depósito de hierro</text>
    </svg>
  );
}

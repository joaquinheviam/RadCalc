import React from 'react';

export function ITMIGCompartmentsScheme({ labels, highlight }) {
  // Lógica de opacidad: si no hay selección (null), todas las zonas se ven al 55%.
  // Si hay una zona seleccionada, esta sube al 80% y las demás se atenúan al 15%.
  const getOpacity = (zone) => {
    if (!highlight) return 0.55;
    return highlight === zone ? 0.8 : 0.15;
  };

  // Cada corte es un SVG propio (viewBox 380 × 370), uno bajo el otro: la
  // columna de las calculadoras es angosta incluso en computador, y lado a
  // lado el texto quedaba ilegible. La leyenda va en HTML debajo.
  const svgProps = {
    viewBox: '0 0 380 370',
    className: 'w-full h-auto text-slate-600 dark:text-slate-300',
    xmlns: 'http://www.w3.org/2000/svg',
  };
  const legend = [
    ['prevascular', '#3b82f6'],
    ['visceral', '#22c55e'],
    ['paravertebral', '#f59e0b'],
  ];

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3 space-y-3">
      <div className="space-y-3 max-w-sm mx-auto">
        <svg {...svgProps}>
          {/* ==========================================
              PANEL IZQUIERDO: CORTE AXIAL
          ========================================== */}
          <g transform="translate(0, 0)">
            <text x="190" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">
              {labels.axialTitle}
            </text>

            {/* ZONAS CLÍNICAS (Rellenos de compartimentos - fondo) */}
            <g className="mix-blend-multiply dark:mix-blend-normal">
              {/* Prevascular (Azul) */}
              <path
                d="M 160,45 L 220,45 C 240,70 240,110 235,125 C 215,115 180,110 150,125 C 130,135 125,120 120,115 C 130,80 140,60 160,45 Z"
                fill="#3b82f6"
                opacity={getOpacity('prevascular')}
                style={{ transition: 'opacity 0.3s ease' }}
              />
              {/* Visceral (Verde) */}
              <path
                d="M 120,115 C 140,125 210,115 245,130 C 265,190 260,250 230,295 C 210,295 170,295 150,295 C 130,250 110,190 120,115 Z"
                fill="#22c55e"
                opacity={getOpacity('visceral')}
                style={{ transition: 'opacity 0.3s ease' }}
              />
              {/* Paravertebral (Ámbar) */}
              <path
                d="M 150,295 C 170,295 210,295 230,295 C 250,330 230,365 190,365 C 150,365 130,330 150,295 Z"
                fill="#f59e0b"
                opacity={getOpacity('paravertebral')}
                style={{ transition: 'opacity 0.3s ease' }}
              />
            </g>

            {/* ANATOMÍA NEUTRA (Axial) */}
            <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Pulmón Derecho (izquierda anatómica) */}
              <path d="M 152,48 C 130,62 118,90 115,118 C 108,160 108,200 118,240 C 125,265 138,290 136,335 C 95,340 40,295 40,210 C 40,95 115,45 152,48 Z" />
              {/* Pulmón Izquierdo (derecha anatómica) */}
              <path d="M 228,48 C 250,65 248,100 247,125 C 270,170 272,230 250,285 C 245,300 250,320 245,333 C 290,340 340,295 340,210 C 340,95 265,45 228,48 Z" />

              {/* Esternón */}
              <path d="M 170,40 Q 190,35 210,40 L 205,50 Q 190,45 175,50 Z" fill="currentColor" />

              {/* Vértebra Torácica */}
              <path d="M 170,300 Q 190,295 210,300 L 215,315 L 230,320 L 215,330 L 200,355 L 180,355 L 165,330 L 150,320 L 165,315 Z" fill="currentColor" opacity="0.8" />
              {/* Canal medular */}
              <circle cx="190" cy="320" r="5" fill="none" strokeWidth="2" className="text-slate-50 dark:text-slate-900" />
            </g>

            {/* Grandes Vasos y Tráquea (Tenues) */}
            <g stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-400 dark:text-slate-500" opacity="0.8">
              <circle cx="170" cy="140" r="18" /> {/* Aorta Ascendente */}
              <circle cx="210" cy="150" r="16" /> {/* Arteria Pulmonar */}
              <circle cx="140" cy="155" r="10" /> {/* Vena Cava Superior */}
              <circle cx="155" cy="260" r="12" /> {/* Aorta Descendente */}
              <circle cx="190" cy="200" r="12" /> {/* Tráquea/Bronquios */}
            </g>
          </g>
        </svg>
        <svg {...svgProps}>
          {/* ==========================================
              PANEL DERECHO: CORTE SAGITAL
          ========================================== */}
          <g transform="translate(0, 0)">
            <text x="190" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">
              {labels.sagittalTitle}
            </text>

            {/* ZONAS CLÍNICAS (Rellenos de compartimentos - fondo) */}
            <g className="mix-blend-multiply dark:mix-blend-normal">
              {/* Prevascular (Azul) */}
              <path
                d="M 50,60 L 120,60 C 110,100 100,130 100,180 C 100,220 100,260 80,290 L 60,290 C 65,200 65,130 50,60 Z"
                fill="#3b82f6"
                opacity={getOpacity('prevascular')}
                style={{ transition: 'opacity 0.3s ease' }}
              />
              {/* Visceral (Verde) */}
              {/* El borde posterior es 1cm posterior al margen anterior de la vértebra (margen ant vértebra = X 250, borde compartimento = X 260) */}
              <path
                d="M 120,60 L 260,60 L 260,360 L 200,310 C 170,300 100,280 100,240 C 100,200 100,180 100,180 C 100,130 110,100 120,60 Z"
                fill="#22c55e"
                opacity={getOpacity('visceral')}
                style={{ transition: 'opacity 0.3s ease' }}
              />
              {/* Paravertebral (Ámbar) */}
              <path
                d="M 260,60 L 350,60 L 350,360 L 260,360 Z"
                fill="#f59e0b"
                opacity={getOpacity('paravertebral')}
                style={{ transition: 'opacity 0.3s ease' }}
              />
            </g>

            {/* ANATOMÍA NEUTRA (Sagital) */}
            <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Esternón */}
              <path d="M 50,60 Q 70,150 80,280 L 60,280 Q 50,150 35,60 Z" fill="currentColor" />

              {/* Columna Vertebral */}
              <path d="M 250,50 L 290,50 L 290,360 L 250,360 Z" />
              {/* Discos intervertebrales (líneas divisorias) */}
              <line x1="250" y1="100" x2="290" y2="100" />
              <line x1="250" y1="150" x2="290" y2="150" />
              <line x1="250" y1="200" x2="290" y2="200" />
              <line x1="250" y1="250" x2="290" y2="250" />
              <line x1="250" y1="300" x2="290" y2="300" />

              {/* Diafragma */}
              <path d="M 30,290 Q 150,270 320,370" />
            </g>

            {/* Corazón, Tráquea y Grandes Vasos (Sagital, Tenues) */}
            <g stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-400 dark:text-slate-500" opacity="0.8">
              {/* Perfil del Corazón */}
              <path d="M 100,180 C 100,260 170,290 200,280 C 220,240 200,150 160,130 C 120,120 100,140 100,180 Z" />
              {/* Arco Aórtico */}
              <path d="M 160,130 C 150,90 180,70 200,100 C 210,120 200,160 200,160" />
              {/* Tráquea */}
              <path d="M 160,40 L 180,40 L 170,140 L 150,140 Z" />
            </g>

            {/* Línea ITMIG 1cm (indicador visual sutil) */}
            <line x1="260" y1="50" x2="260" y2="360" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="text-red-500/50 dark:text-red-400/50" />
          </g>
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
        {legend.map(([key, color]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} aria-hidden="true" />
            {labels[key]}
          </span>
        ))}
      </div>
    </div>
  );
}

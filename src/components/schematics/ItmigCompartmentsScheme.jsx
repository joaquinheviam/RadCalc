import React from 'react';

export function ItmigCompartmentsScheme({ labels, highlight }) {
  // Lógica de opacidad: si no hay selección (null), todas las zonas se ven al 45%.
  // Si hay una zona seleccionada, esta sube al 80% y las demás se atenúan al 15%.
  const getOpacity = (zone) => {
    if (!highlight) return 0.45;
    return highlight === zone ? 0.8 : 0.15;
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-slate-50 dark:bg-slate-900/40 p-4 w-full">

      {/* ==========================================
          PANEL 1: CORTE SAGITAL
      ========================================== */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-center text-slate-700 dark:text-slate-200">
          {labels.sagittalTitle}
        </h4>
        <svg viewBox="0 0 400 360" className="w-full h-auto text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">

          {/* ZONAS CLÍNICAS (Fondo) */}
          <g style={{ transition: 'opacity 0.3s ease' }}>
            {/* Prevascular (Morado) */}
            <path
              d="M 50,70 L 140,70 C 130,100 130,130 150,170 C 160,200 155,240 140,265 L 75,250 Q 60,150 50,70 Z"
              fill="#a21caf"
              opacity={getOpacity('prevascular')}
            />
            {/* Visceral (Azul) */}
            <path
              d="M 140,70 L 260,70 L 260,300 C 210,290 160,275 140,265 C 155,240 160,200 150,170 C 130,130 130,100 140,70 Z"
              fill="#3b82f6"
              opacity={getOpacity('visceral')}
            />
            {/* Paravertebral (Amarillo) */}
            <path
              d="M 260,70 L 330,70 L 330,335 C 300,320 280,310 260,300 Z"
              fill="#eab308"
              opacity={getOpacity('paravertebral')}
            />
          </g>

          {/* ANATOMÍA NEUTRA (Sagital) */}
          <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Esternón */}
            <path d="M 50,60 Q 60,150 75,250 L 60,250 Q 45,150 35,60 Z" fill="currentColor" opacity="0.3" />

            {/* Cuerpos vertebrales (Margen anterior en X=250) */}
            <rect x="250" y="80" width="40" height="35" rx="3" fill="currentColor" opacity="0.2" />
            <rect x="250" y="125" width="40" height="35" rx="3" fill="currentColor" opacity="0.2" />
            <rect x="250" y="170" width="40" height="35" rx="3" fill="currentColor" opacity="0.2" />
            <rect x="250" y="215" width="40" height="35" rx="3" fill="currentColor" opacity="0.2" />
            <rect x="250" y="260" width="40" height="35" rx="3" fill="currentColor" opacity="0.2" />

            {/* Perfil del Corazón */}
            <path d="M 150,160 C 145,210 160,255 210,260 C 240,260 250,220 235,170 C 220,140 170,120 150,160 Z" className="text-slate-400 dark:text-slate-500" />
            {/* Arco Aórtico */}
            <path d="M 170,130 C 165,95 190,80 220,95 C 240,110 240,150 240,150" className="text-slate-400 dark:text-slate-500" />
            {/* Tráquea */}
            <path d="M 190,40 L 210,40 L 205,110 L 185,110 Z" className="text-slate-400 dark:text-slate-500" />
            {/* Diafragma */}
            <path d="M 30,270 Q 150,250 330,330" />
          </g>

          {/* Línea Verde (Límite Visceral-Paravertebral en X=260, 1cm tras el margen anterior) */}
          <line x1="260" y1="40" x2="260" y2="340" stroke="#22c55e" strokeWidth="3" strokeDasharray="6 4" />
        </svg>
      </div>

      {/* ==========================================
          PANEL 2: CORTE AXIAL
      ========================================== */}
      <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="text-sm font-bold text-center text-slate-700 dark:text-slate-200">
          {labels.axialTitle}
        </h4>
        <svg viewBox="0 0 400 320" className="w-full h-auto text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg">

          {/* ZONAS CLÍNICAS (Fondo) */}
          <g style={{ transition: 'opacity 0.3s ease' }}>
            {/* Prevascular (Morado) - Envuelve corazón anterior y lateralmente */}
            <path
              d="M 185,50 Q 200,45 215,50 C 270,60 290,110 270,170 C 265,185 255,190 245,190 C 255,170 250,140 250,140 C 250,80 150,80 150,140 C 150,140 145,170 155,190 C 145,190 135,185 130,170 C 110,110 130,60 185,50 Z"
              fill="#a21caf"
              opacity={getOpacity('prevascular')}
            />
            {/* Visceral (Azul) - Contiene corazón, aorta y esófago hasta la línea */}
            <path
              d="M 150,140 C 150,80 250,80 250,140 C 260,180 240,230 240,230 L 160,230 C 160,230 140,180 150,140 Z"
              fill="#3b82f6"
              opacity={getOpacity('visceral')}
            />
            {/* Paravertebral (Amarillo) - Desde la línea hacia posterior */}
            <path
              d="M 160,230 L 240,230 C 250,240 260,260 250,290 C 220,310 180,310 150,290 C 140,260 150,240 160,230 Z"
              fill="#eab308"
              opacity={getOpacity('paravertebral')}
            />
          </g>

          {/* ANATOMÍA NEUTRA (Axial) */}
          <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Esternón */}
            <path d="M 180,30 Q 200,25 220,30 L 215,40 Q 200,35 185,40 Z" fill="currentColor" opacity="0.3" />

            {/* Cuerpo Vertebral y Canal (Margen anterior en Y=215) */}
            <path d="M 175,215 Q 200,210 225,215 L 230,240 L 245,255 L 230,270 L 210,285 L 190,285 L 170,270 L 155,255 L 170,240 Z" fill="currentColor" opacity="0.2" />
            <circle cx="200" cy="255" r="7" className="text-slate-50 dark:text-slate-900" />

            {/* Corazón (Raíces e interior) */}
            <path d="M 200,90 C 240,100 245,135 235,165 L 175,160 C 155,140 160,100 200,90 Z" className="text-slate-400 dark:text-slate-500" />

            {/* Aorta Descendente y Esófago */}
            <circle cx="175" cy="195" r="12" className="text-slate-400 dark:text-slate-500" />
            <circle cx="200" cy="200" r="6" className="text-slate-400 dark:text-slate-500" />

            {/* Pulmones (Líneas pleurales que empujan hacia adentro) */}
            <path d="M 115,50 C 90,70 30,120 30,200 C 30,280 80,300 130,290 C 110,240 130,180 125,160" className="text-slate-300 dark:text-slate-600" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M 285,50 C 310,70 370,120 370,200 C 370,280 320,300 270,290 C 290,240 270,180 275,160" className="text-slate-300 dark:text-slate-600" strokeWidth="1.5" strokeDasharray="4 4" />
          </g>

          {/* Línea Verde (Límite Visceral-Paravertebral en Y=230, 1cm tras el margen anterior) */}
          <line x1="90" y1="230" x2="310" y2="230" stroke="#22c55e" strokeWidth="3" strokeDasharray="6 4" />
        </svg>
      </div>

      {/* ==========================================
          LEYENDA HTML INFERIOR
      ========================================== */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center text-xs text-slate-600 dark:text-slate-300 mt-2">
        <div className="flex items-center gap-1.5">
          <span
            className="block w-3.5 h-3.5 rounded-full transition-opacity duration-300"
            style={{ backgroundColor: '#a21caf', opacity: getOpacity('prevascular') }}
          ></span>
          <span>{labels.prevascular}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="block w-3.5 h-3.5 rounded-full transition-opacity duration-300"
            style={{ backgroundColor: '#3b82f6', opacity: getOpacity('visceral') }}
          ></span>
          <span>{labels.visceral}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="block w-3.5 h-3.5 rounded-full transition-opacity duration-300"
            style={{ backgroundColor: '#eab308', opacity: getOpacity('paravertebral') }}
          ></span>
          <span>{labels.paravertebral}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="block w-5 h-1 bg-[#22c55e]"></span>
          <span>{labels.boundaryLine}</span>
        </div>
      </div>
    </div>
  );
}

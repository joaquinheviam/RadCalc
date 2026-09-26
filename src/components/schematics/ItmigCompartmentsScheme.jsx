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
            {/* Prevascular (Morado): banda retroesternal estrecha que rodea el borde
                anterior del corazón, la aorta ascendente y la vena braquiocefálica */}
            <path
              d="M 50,52 L 73,52 C 71,75 74,95 84,114 C 87,130 88,148 86,162 C 80,185 78,215 84,238 C 88,250 93,257 98,261 L 76,262 Q 60,150 50,52 Z"
              className="fill-[#a21caf] dark:fill-[#e879f9]"
              opacity={getOpacity('prevascular')}
            />
            {/* Visceral (Azul) */}
            <path
              d="M 73,52 L 260,52 L 260,300 C 215,292 150,272 98,261 C 93,257 88,250 84,238 C 78,215 80,185 86,162 C 88,148 87,130 84,114 C 74,95 71,75 73,52 Z"
              fill="#3b82f6"
              opacity={getOpacity('visceral')}
            />
            {/* Paravertebral (Amarillo) */}
            <path
              d="M 260,52 L 330,52 L 330,335 C 300,320 280,310 260,300 Z"
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
            <path d="M 92,168 C 84,215 104,258 162,262 C 207,262 228,225 218,178 C 208,142 124,128 92,168 Z" className="text-slate-400 dark:text-slate-500" />
            {/* Aorta ascendente, cayado y descendente */}
            <path d="M 94,160 C 86,110 110,76 160,74 C 215,74 242,108 242,190" className="text-slate-400 dark:text-slate-500" />
            <path d="M 110,156 C 106,114 124,92 160,90 C 206,90 226,114 226,190" className="text-slate-400 dark:text-slate-500" />
            {/* Vena braquiocefálica (por delante del cayado) */}
            <path d="M 76,42 C 74,70 78,92 88,112" className="text-slate-400 dark:text-slate-500" />
            <path d="M 88,42 C 86,66 90,84 100,102" className="text-slate-400 dark:text-slate-500" />
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
              className="fill-[#a21caf] dark:fill-[#e879f9]"
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

            {/* Aorta descendente (a la derecha de la imagen = izquierda del paciente) y esófago */}
            <circle cx="226" cy="198" r="12" className="text-slate-400 dark:text-slate-500" />
            <circle cx="200" cy="200" r="6" className="text-slate-400 dark:text-slate-500" />

            {/* Pulmones: el borde medial sigue el contorno del mediastino */}
            <path d="M 175,48 C 120,50 30,110 30,200 C 30,280 80,305 140,295 C 138,270 140,245 145,232 C 140,210 130,195 125,185 C 112,160 110,110 128,75 C 140,58 158,50 175,48 Z" className="text-slate-400 dark:text-slate-500" strokeWidth="1.5" />
            <path d="M 225,48 C 280,50 370,110 370,200 C 370,280 320,305 260,295 C 262,270 260,245 255,232 C 260,210 270,195 277,185 C 290,160 292,110 274,75 C 262,58 242,50 225,48 Z" className="text-slate-400 dark:text-slate-500" strokeWidth="1.5" />
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
            className="block w-3.5 h-3.5 rounded-full transition-opacity duration-300 bg-[#a21caf] dark:bg-[#e879f9]"
            style={{ opacity: getOpacity('prevascular') }}
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

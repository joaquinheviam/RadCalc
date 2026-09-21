import { useState } from 'react';
import { useLang } from '../i18n/LangContext.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { REFERENCES } from '../i18n/references.js';
import { IconBookOpen, IconCheckCircle } from '../components/icons/index.js';
import { Card, Accordion, NumberField, StickyBar, ResetIconButton, CopyIconButton, InfoBox, References, UsageNotes, ReportBugLink, DonationButton, CalcDisclaimer, ZoomableDiagram } from '../components/shared/index.js';

function OptionButtons({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex justify-between items-start gap-2 ${
            value === opt.key
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
          }`}
        >
          <span>
            <span className="font-semibold block mb-0.5">{opt.label}</span>
            {opt.desc && <span className="text-xs opacity-80">{opt.desc}</span>}
          </span>
          <span className="text-xs font-bold shrink-0">{opt.badge}</span>
        </button>
      ))}
    </div>
  );
}

// Toggle de dos botones sí/no, mismo lenguaje visual que OptionButtons pero en
// una fila compacta — usado en el carril guiado del T.
function YesNoButtons({ value, onChange, yesLabel, noLabel }) {
  return (
    <div className="flex gap-2">
      {[['yes', yesLabel], ['no', noLabel]].map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 p-3 rounded-xl border text-sm font-semibold transition-all ${
            value === key
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Selección múltiple (checkboxes) para las estructuras invadidas — varias
// pueden aplicar a la vez, el cálculo del T guiado se queda con la de mayor
// categoría.
function CheckButtons({ options, values, onToggle }) {
  return (
    <div className="space-y-1.5">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onToggle(opt.key)}
          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2 ${
            values[opt.key]
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
          }`}
        >
          {values[opt.key] ? <IconCheckCircle size={15} className="shrink-0 mt-0.5" /> : <span className="w-[15px] shrink-0" />}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// Selector de dos carriles para determinar el T: "guiado" (por defecto, arma
// el T a partir de hallazgos radiológicos) o "conozco el T" (selección
// directa de la categoría, comportamiento previo de la calculadora).
function ModeToggle({ value, onChange, guidedLabel, knownLabel }) {
  return (
    <div className="flex gap-1.5 mb-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
      {[['guided', guidedLabel], ['known', knownLabel]].map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
            value === key
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Orden de severidad de las categorías T, usado para tomar el máximo entre
// el T por tamaño y los distintos hallazgos cualitativos (invasión,
// atelectasia, nódulos separados) en el carril guiado.
const T_RANK = { T1a: 1, T1b: 2, T1c: 3, T2a: 4, T2b: 5, T3: 6, T4: 7 };

// Tamaño (mm, diámetro mayor) → categoría T por tamaño, por Tabla 3 de
// Detterbeck et al., Chest 2024;166(4):882-895 (9ª edición IASLC).
function sizeToT(sizeMm) {
  const v = parseFloat(String(sizeMm).replace(',', '.'));
  if (!sizeMm || Number.isNaN(v) || v <= 0) return null;
  if (v <= 10) return 'T1a';
  if (v <= 20) return 'T1b';
  if (v <= 30) return 'T1c';
  if (v <= 40) return 'T2a';
  if (v <= 50) return 'T2b';
  if (v <= 70) return 'T3';
  return 'T4';
}

// Simplified schematic of the main IASLC regional lymph node stations relevant
// to the N descriptor. Not exhaustive (omits 3a/3p, 9, 13, 14) — a didactic
// overview, not a reproduction of the original IASLC figure. Station
// boundaries/grouping per Rusch et al., J Thorac Oncol 2009;4(5):568-577.
function IaslcNodalMap({ labels }) {
  const nodeStroke = 'stroke-slate-700 dark:stroke-slate-300';
  return (
    <div className="flex justify-center rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 600 600" className="h-auto w-full max-w-md" xmlns="http://www.w3.org/2000/svg">
        {/* Vía aérea: tráquea y árbol bronquial */}
        <path
          d="M 260 80 L 340 80 L 340 290 L 430 370 L 520 340
             L 530 370 L 450 405 L 490 510 L 460 525 L 395 425
             L 300 350 L 215 435 L 170 540 L 140 520 L 190 430
             L 100 400 L 110 370 L 200 380 L 260 290 Z"
          className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Anillos traqueales */}
        <path
          d="M 265 110 L 335 110 M 265 140 L 335 140 M 265 170 L 335 170 M 265 200 L 335 200 M 265 230 L 335 230 M 265 260 L 335 260"
          fill="none"
          className="stroke-slate-300 dark:stroke-slate-600"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Estructuras vasculares de referencia (cayado aórtico, AP izquierda) */}
        <g opacity="0.85">
          <path d="M 280,450 C 280,280 320,235 370,235 C 420,235 430,320 430,450 L 390,450 C 390,360 380,330 370,330 C 340,330 320,360 320,450 Z" fill="#fca5a5" stroke="#ef4444" strokeWidth="2" />
          <path d="M 330,375 Q 385,340 450,375 L 440,395 Q 385,360 330,395 Z" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
        </g>

        {/* Líneas y textos de referencia anatómica (límites de estación) */}
        <g className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" strokeDasharray="6 4" opacity="0.8">
          <line x1="30" y1="70" x2="570" y2="70" />
          <line x1="30" y1="150" x2="570" y2="150" />
          <line x1="30" y1="235" x2="570" y2="235" />
          <line x1="30" y1="330" x2="570" y2="330" />
          <line x1="300" y1="358" x2="570" y2="358" />
          <line x1="30" y1="430" x2="570" y2="430" />
        </g>
        <g className="fill-slate-600 dark:fill-slate-300" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="700">
          <text x="35" y="65">{labels.cricoid}</text>
          <text x="35" y="145">{labels.apices}</text>
          <text x="35" y="230">{labels.lbcvInf}</text>
          <text x="565" y="230" textAnchor="end">{labels.archSup}</text>
          <text x="35" y="325">{labels.azygosInf}</text>
          <text x="565" y="325" textAnchor="end">{labels.archInf}</text>
          <text x="565" y="354" textAnchor="end">{labels.lpaSup}</text>
          <text x="35" y="425">{labels.broncInterInf}</text>
          <text x="565" y="425" textAnchor="end">{labels.lllBronc}</text>
        </g>

        {/* Estación 1: supraclaviculares */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#ef4444">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="230" cy="110" r="8" /><circle cx="245" cy="95" r="8" /><circle cx="215" cy="130" r="8" />
          </g>
          <text x="180" y="115">1R</text>
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="370" cy="110" r="8" /><circle cx="355" cy="95" r="8" /><circle cx="385" cy="130" r="8" />
          </g>
          <text x="395" y="115">1L</text>
        </g>

        {/* Estación 2: paratraqueales superiores */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#3b82f6">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="245" cy="180" r="8" /><circle cx="250" cy="210" r="8" />
          </g>
          <text x="210" y="200">2R</text>
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="355" cy="180" r="8" /><circle cx="350" cy="210" r="8" />
          </g>
          <text x="375" y="200">2L</text>
        </g>

        {/* Estación 4: paratraqueales inferiores */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#f97316">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="250" cy="280" r="8" /><circle cx="240" cy="310" r="8" />
          </g>
          <text x="195" y="300">4R</text>
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="350" cy="280" r="8" /><circle cx="360" cy="310" r="8" />
          </g>
          <text x="390" y="300">4L</text>
        </g>

        {/* Estación 5: ventana aortopulmonar */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#d946ef">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="350" cy="343" r="8" /><circle cx="365" cy="343" r="8" />
          </g>
          <text x="325" y="348">5</text>
        </g>

        {/* Estación 6: para-aórticos */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#dc2626">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="410" cy="265" r="8" /><circle cx="420" cy="290" r="8" /><circle cx="415" cy="315" r="8" />
          </g>
          <text x="435" y="295">6</text>
        </g>

        {/* Estación 7: subcarinales — grupo simplificado (10 nodos en vez de 36) */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#a855f7" textAnchor="middle">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="300" cy="365" r="10" />
            <circle cx="286" cy="380" r="10" /><circle cx="314" cy="380" r="10" />
            <circle cx="272" cy="395" r="10" /><circle cx="300" cy="395" r="10" /><circle cx="328" cy="395" r="10" />
            <circle cx="258" cy="410" r="10" /><circle cx="286" cy="410" r="10" /><circle cx="314" cy="410" r="10" /><circle cx="342" cy="410" r="10" />
          </g>
          <text x="300" y="398" fill="#ffffff" fontSize="22" stroke="none">7</text>
        </g>

        {/* Estación 8: paraesofágicos */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#84cc16" textAnchor="middle">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="285" cy="470" r="8" /><circle cx="275" cy="500" r="8" /><circle cx="315" cy="470" r="8" /><circle cx="325" cy="500" r="8" />
          </g>
          <text x="300" y="535">8</text>
        </g>

        {/* Estación 10: hiliares */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#ec4899">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="190" cy="360" r="8" /><circle cx="175" cy="380" r="8" /><circle cx="205" cy="405" r="8" />
          </g>
          <text x="140" y="350">10R</text>
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="410" cy="380" r="8" /><circle cx="425" cy="400" r="8" /><circle cx="395" cy="425" r="8" />
          </g>
          <text x="440" y="380">10L</text>
        </g>

        {/* Estación 11: interlobares */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#22c55e">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="150" cy="450" r="8" /><circle cx="165" cy="470" r="8" /><circle cx="135" cy="480" r="8" /><circle cx="150" cy="495" r="8" />
          </g>
          <text x="90" y="470">11R</text>
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="450" cy="450" r="8" /><circle cx="435" cy="470" r="8" /><circle cx="465" cy="480" r="8" /><circle cx="450" cy="495" r="8" />
          </g>
          <text x="490" y="470">11L</text>
        </g>

        {/* Estación 12: lobares */}
        <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16" fill="#06b6d4">
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="120" cy="515" r="8" /><circle cx="100" cy="545" r="8" />
          </g>
          <text x="60" y="530">12R</text>
          <g className={nodeStroke} strokeWidth="1.5" opacity="0.9">
            <circle cx="480" cy="515" r="8" /><circle cx="500" cy="545" r="8" />
          </g>
          <text x="520" y="530">12L</text>
        </g>
      </svg>
    </div>
  );
}

// Simplified axial-plane cross-sections at three representative levels (upper
// mediastinum, aortic arch, subcarinal/hilar), showing the same IASLC stations
// as IaslcNodalMap plus 3A (prevascular) and 3P (retrotracheal), which are not
// shown on the simplified coronal overview above. Didactic schematic, not a
// reproduction of an actual CT or of the original IASLC figure.
function AxialNodalStations({ labels }) {
  const swatchStroke = 'stroke-slate-800 dark:stroke-slate-200';
  const LegendSwatch = ({ x, fill, label, w = 35 }) => (
    <g transform={`translate(${x}, 0)`}>
      <rect width={w} height="25" fill={fill} opacity="0.85" className={swatchStroke} strokeWidth="1" />
      <text x={w / 2} y="16" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" fill="#ffffff" textAnchor="middle">{label}</text>
    </g>
  );
  // Base anatomy shared by the three panels (chest wall, lungs, vertebra, sternum).
  const BasePanel = () => (
    <>
      <ellipse cx="150" cy="180" rx="140" ry="110" fill="#cbd5e1" />
      <path d="M 150 70 C 50 70 20 150 20 200 C 20 280 130 280 140 200 Z" fill="#0f172a" />
      <path d="M 150 70 C 250 70 280 150 280 200 C 280 280 170 280 160 200 Z" fill="#0f172a" />
      <circle cx="150" cy="275" r="15" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M 100 75 Q 150 65 200 75 L 180 85 Q 150 75 120 85 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
    </>
  );
  return (
    <div className="overflow-x-auto rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 900 380" className="h-auto" style={{ width: '680px' }} xmlns="http://www.w3.org/2000/svg">
        {/* ===== Panel A: upper mediastinum ===== */}
        <g transform="translate(0, 0)">
          <text x="150" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="15" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200">{labels.panelA}</text>
          <BasePanel />
          <path d="M 115 88 Q 150 80 185 88 L 200 120 Q 150 105 100 120 Z" fill="#df9829" opacity="0.85" />
          <path d="M 105 120 L 166 120 L 166 196 L 115 190 Z" fill="#9d1770" opacity="0.85" />
          <path d="M 166 120 L 195 125 L 190 185 L 166 196 Z" fill="#32949c" opacity="0.85" />
          <path d="M 134 196 L 166 196 L 175 235 L 125 235 Z" fill="#c1d93b" opacity="0.85" />
          <circle cx="150" cy="180" r="16" fill="#000000" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="150" cy="215" r="8" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <ellipse cx="110" cy="140" rx="14" ry="18" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="145" cy="120" r="13" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <ellipse cx="180" cy="115" rx="18" ry="14" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="190" cy="150" r="13" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="166" y1="125" x2="166" y2="196" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <g transform="translate(70, 310)">
            <LegendSwatch x={0} fill="#9d1770" label="2R" />
            <LegendSwatch x={40} fill="#32949c" label="2L" />
            <LegendSwatch x={80} fill="#df9829" label="3A" />
            <LegendSwatch x={120} fill="#c1d93b" label="3P" />
          </g>
        </g>

        {/* ===== Panel B: aortic arch level ===== */}
        <g transform="translate(300, 0)">
          <text x="150" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="15" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200">{labels.panelB}</text>
          <BasePanel />
          <path d="M 115 88 Q 150 80 185 88 L 200 120 Q 150 100 100 120 Z" fill="#df9829" opacity="0.85" />
          <path d="M 105 120 L 156 120 L 156 196 L 115 190 Z" fill="#1fcc25" opacity="0.85" />
          <path d="M 156 120 L 195 130 L 180 220 L 156 210 Z" fill="#1d3bc4" opacity="0.85" />
          <path d="M 200 110 Q 250 140 240 210 L 210 210 Z" fill="#de1010" opacity="0.85" />
          <path d="M 124 196 L 156 196 L 165 245 L 125 245 Z" fill="#c1d93b" opacity="0.85" />
          <circle cx="140" cy="180" r="16" fill="#000000" stroke="#cbd5e1" strokeWidth="1.5" />
          <ellipse cx="155" cy="225" rx="8" ry="6" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="170" cy="210" r="8" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M 160 120 C 190 110 230 130 230 180 C 230 240 210 240 180 240 C 170 190 150 160 160 120 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="120" cy="140" r="14" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="156" y1="125" x2="156" y2="196" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <g transform="translate(50, 310)">
            <LegendSwatch x={0} fill="#df9829" label="3A" />
            <LegendSwatch x={40} fill="#c1d93b" label="3P" />
            <LegendSwatch x={80} fill="#1fcc25" label="4R" />
            <LegendSwatch x={120} fill="#1d3bc4" label="4L" />
            <LegendSwatch x={160} fill="#de1010" label="6" />
          </g>
        </g>

        {/* ===== Panel C: subcarinal / hilar level ===== */}
        <g transform="translate(600, 0)">
          <text x="150" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="15" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200">{labels.panelC}</text>
          <BasePanel />
          <path d="M 135 180 L 165 180 L 190 210 L 140 210 Z" fill="#511c8a" opacity="0.85" />
          <path d="M 145 220 L 175 215 L 185 240 L 145 255 Z" fill="#e8c61a" opacity="0.85" />
          <path d="M 75 170 C 60 195 90 220 115 205 C 105 185 90 175 75 170 Z" fill="#0e8a15" opacity="0.85" />
          <path d="M 200 170 C 220 170 245 195 225 215 C 205 210 195 190 200 170 Z" fill="#0e8a15" opacity="0.85" />
          <ellipse cx="120" cy="195" rx="14" ry="10" fill="#000000" stroke="#cbd5e1" strokeWidth="1.5" />
          <ellipse cx="180" cy="195" rx="14" ry="10" fill="#000000" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="160" cy="225" r="8" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="130" cy="120" r="22" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="95" cy="135" r="12" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="170" cy="255" r="16" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M 150 120 C 180 110 200 130 200 160 C 200 180 230 190 220 210 C 200 190 180 170 140 170 C 100 170 80 180 70 175 C 90 150 120 150 150 120 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <g transform="translate(70, 310)">
            <LegendSwatch x={0} fill="#511c8a" label="7" />
            <LegendSwatch x={40} fill="#e8c61a" label="8" />
            <LegendSwatch x={80} fill="#0e8a15" label="10R" />
            <LegendSwatch x={120} fill="#0e8a15" label="10L" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// Non-regional lymph node groups relevant to the M descriptor (per the IASLC
// map, internal mammary, intercostal, pericardiophrenic and pericaval/middle
// diaphragmatic nodes are NOT part of the regional N-station system: their
// involvement is classified as M1b/M1c, not as N disease). Didactic schematic.
function NonRegionalNodes({ labels }) {
  const BasePanel = () => (
    <>
      <ellipse cx="200" cy="180" rx="160" ry="120" fill="#cbd5e1" />
      <path d="M 200 65 C 60 65 30 150 30 200 C 30 280 170 290 180 200 Z" fill="#0f172a" />
      <path d="M 200 65 C 340 65 370 150 370 200 C 370 280 230 290 220 200 Z" fill="#0f172a" />
      <circle cx="200" cy="275" r="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M 120 60 Q 200 50 280 60 L 260 72 Q 200 60 140 72 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
    </>
  );
  return (
    <div className="overflow-x-auto rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3">
      <svg viewBox="0 0 800 380" className="h-auto" style={{ width: '620px' }} xmlns="http://www.w3.org/2000/svg">
        {/* ===== Panel A: internal mammary and intercostal ===== */}
        <g transform="translate(0, 0)">
          <text x="200" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="15" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200">{labels.panelA}</text>
          <BasePanel />
          <path d="M 150 130 C 180 110 250 120 250 170 C 250 230 180 230 150 200 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <ellipse cx="145" cy="85" rx="18" ry="9" fill="#22c55e" opacity="0.7" />
          <ellipse cx="255" cy="85" rx="18" ry="9" fill="#22c55e" opacity="0.7" />
          <ellipse cx="170" cy="255" rx="15" ry="9" transform="rotate(-25 170 255)" fill="#eab308" opacity="0.7" />
          <ellipse cx="230" cy="255" rx="15" ry="9" transform="rotate(25 230 255)" fill="#eab308" opacity="0.7" />
          <g transform="translate(45, 325)">
            <rect width="100" height="25" fill="#22c55e" opacity="0.7" stroke="#166534" strokeWidth="1" />
            <text x="50" y="16" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" fill="#ffffff" textAnchor="middle">{labels.legendMammary}</text>
            <rect x="110" width="100" height="25" fill="#eab308" opacity="0.7" stroke="#854d0e" strokeWidth="1" />
            <text x="160" y="16" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" textAnchor="middle" className="fill-slate-800">{labels.legendIntercostal}</text>
          </g>
        </g>

        {/* ===== Panel B: pericardiophrenic and pericaval ===== */}
        <g transform="translate(400, 0)">
          <text x="200" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="15" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200">{labels.panelB}</text>
          <BasePanel />
          <path d="M 160 85 C 240 85, 290 130, 270 180 C 255 220, 195 240, 150 210 C 125 190, 115 130, 160 85 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="130" cy="190" r="15" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="200" cy="245" r="10" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <ellipse cx="195" cy="83" rx="34" ry="12" transform="rotate(-12 195 83)" fill="#ec4899" opacity="0.75" />
          <ellipse cx="123" cy="178" rx="16" ry="10" transform="rotate(25 123 178)" fill="#0ea5e9" opacity="0.75" />
          <g transform="translate(10, 325)">
            <rect width="115" height="25" fill="#ec4899" opacity="0.75" stroke="#9d174d" strokeWidth="1" />
            <text x="57.5" y="16" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" fill="#ffffff" textAnchor="middle">{labels.legendPericardio}</text>
            <rect x="120" width="105" height="25" fill="#0ea5e9" opacity="0.75" stroke="#0369a1" strokeWidth="1" />
            <text x="172.5" y="16" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="11" fill="#ffffff" textAnchor="middle">{labels.legendPericava}</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

// Ninth edition TNM stage groups (M0 disease). Source: Klug et al., RadioGraphics
// 2024;44(12):e240057, Table 5, and Detterbeck et al., Chest 2024;166(4):882-895,
// Figures 2-4, cross-checked directly against the primary source both papers cite:
// Rami-Porta et al., J Thorac Oncol 2024;19(7):1007-1027 (the actual IASLC Stage
// Group Subcommittee proposal, Figure 2 and Results/abstract).
// Note: Klug et al. (RadioGraphics) Table 5 contains a transcription error for
// T3/N2a, printing IIIB. The primary source (Rami-Porta et al., abstract: "T1N1,
// T1N2a, and T3N2a subgroups are assigned to IIA, IIB, and IIIA stage groups,
// respectively") and Detterbeck et al. (Chest, Figures 2-4) both confirm IIIA,
// which is what this matrix uses.
const STAGE_MATRIX = {
  T1a: { N0: 'IA1', N1: 'IIA', N2a: 'IIB', N2b: 'IIIA', N3: 'IIIB' },
  T1b: { N0: 'IA2', N1: 'IIA', N2a: 'IIB', N2b: 'IIIA', N3: 'IIIB' },
  T1c: { N0: 'IA3', N1: 'IIA', N2a: 'IIB', N2b: 'IIIA', N3: 'IIIB' },
  T2a: { N0: 'IB', N1: 'IIB', N2a: 'IIIA', N2b: 'IIIB', N3: 'IIIB' },
  T2b: { N0: 'IIA', N1: 'IIB', N2a: 'IIIA', N2b: 'IIIB', N3: 'IIIB' },
  T3: { N0: 'IIB', N1: 'IIIA', N2a: 'IIIA', N2b: 'IIIB', N3: 'IIIC' },
  T4: { N0: 'IIIA', N1: 'IIIA', N2a: 'IIIB', N2b: 'IIIB', N3: 'IIIC' },
};

function getStage(t, n, m) {
  if (!t || !m) return null;
  if (t === 'Tis') return '0';
  if (m === 'M1a' || m === 'M1b') return 'IVA';
  if (m === 'M1c1' || m === 'M1c2') return 'IVB';
  // M0 from here on
  if (!n) return null;
  if (t === 'Tx' || t === 'T0') return null; // not staged as anatomic M0 disease
  const baseT = t === 'T1mi' ? 'T1a' : t;
  return STAGE_MATRIX[baseT]?.[n] ?? null;
}

export default function LungCancerTNM9() {
  const { t } = useLang();
  const c = t.calc.lungCancerTNM9;

  // Carril de determinación del T: 'guided' (por defecto, arma el T a partir
  // de hallazgos) o 'known' (selección directa de la categoría T, el
  // comportamiento original de esta calculadora).
  const [tMode, setTMode] = useState('guided');
  const [tKnownVal, setTKnownVal] = useState(null);

  // Estado del carril guiado.
  const [guidedGate, setGuidedGate] = useState(null); // 'lesion' | 'Tx' | 'T0' | 'Tis'
  const [sizeMm, setSizeMm] = useState('');
  const [t1miFlag, setT1miFlag] = useState(null); // 'yes' | 'no'
  const [hasInvasion, setHasInvasion] = useState(null); // 'yes' | 'no'
  const [invasionStructures, setInvasionStructures] = useState({});
  const [hasAtelectasis, setHasAtelectasis] = useState(null); // 'yes' | 'no'
  const [noduleStatus, setNoduleStatus] = useState(null); // 'none' | 'sameLobe' | 'diffLobe' | 'contralateral'

  const [nVal, setNVal] = useState(null);
  const [mVal, setMVal] = useState(null);

  const resetAll = () => {
    setTMode('guided');
    setTKnownVal(null);
    setGuidedGate(null);
    setSizeMm('');
    setT1miFlag(null);
    setHasInvasion(null);
    setInvasionStructures({});
    setHasAtelectasis(null);
    setNoduleStatus(null);
    setNVal(null);
    setMVal(null);
  };

  const tOptions = [
    { key: 'Tx', badge: 'Tx', label: c.optTxLabel, desc: c.optTxDesc },
    { key: 'T0', badge: 'T0', label: c.optT0Label, desc: c.optT0Desc },
    { key: 'Tis', badge: 'Tis', label: c.optTisLabel, desc: c.optTisDesc },
    { key: 'T1mi', badge: 'T1(mi)', label: c.optT1miLabel, desc: c.optT1miDesc },
    { key: 'T1a', badge: 'T1a', label: c.optT1aLabel, desc: c.optT1aDesc },
    { key: 'T1b', badge: 'T1b', label: c.optT1bLabel, desc: c.optT1bDesc },
    { key: 'T1c', badge: 'T1c', label: c.optT1cLabel, desc: c.optT1cDesc },
    { key: 'T2a', badge: 'T2a', label: c.optT2aLabel, desc: c.optT2aDesc },
    { key: 'T2b', badge: 'T2b', label: c.optT2bLabel, desc: c.optT2bDesc },
    { key: 'T3', badge: 'T3', label: c.optT3Label, desc: c.optT3Desc },
    { key: 'T4', badge: 'T4', label: c.optT4Label, desc: c.optT4Desc },
  ];

  // Estructuras de invasión del carril guiado, agrupadas por la categoría T
  // a la que elevan el estadio (Tabla 3, Detterbeck et al., Chest 2024).
  const t2aStructureOptions = [
    { key: 'visceralPleura', label: c.structVisceralPleura },
    { key: 'mainBronchus', label: c.structMainBronchus },
    { key: 'adjacentLobe', label: c.structAdjacentLobe },
  ];
  const t3StructureOptions = [
    { key: 'parietalPleuraChestWall', label: c.structParietalPleuraChestWall },
    { key: 'thoracicNerveRootsGanglion', label: c.structThoracicNerveRootsGanglion },
    { key: 'pericardium', label: c.structPericardium },
    { key: 'phrenicNerve', label: c.structPhrenicNerve },
    { key: 'azygosVein', label: c.structAzygosVein },
  ];
  const t4StructureOptions = [
    { key: 'vertebraSpinal', label: c.structVertebraSpinal },
    { key: 'subclavianBrachial', label: c.structSubclavianBrachial },
    { key: 'thymus', label: c.structThymus },
    { key: 'trachea', label: c.structTrachea },
    { key: 'carina', label: c.structCarina },
    { key: 'recurrentLaryngeal', label: c.structRecurrentLaryngeal },
    { key: 'esophagus', label: c.structEsophagus },
    { key: 'diaphragm', label: c.structDiaphragm },
    { key: 'heartGreatVessels', label: c.structHeartGreatVessels },
  ];
  const allStructureOptions = [...t2aStructureOptions, ...t3StructureOptions, ...t4StructureOptions];
  const structureRank = {};
  t2aStructureOptions.forEach((o) => { structureRank[o.key] = 'T2a'; });
  t3StructureOptions.forEach((o) => { structureRank[o.key] = 'T3'; });
  t4StructureOptions.forEach((o) => { structureRank[o.key] = 'T4'; });

  // ---- Derivación del T guiado a partir de los hallazgos ----
  const sizeT = sizeToT(sizeMm);
  const sizeIsValid = sizeMm !== '' && !Number.isNaN(parseFloat(String(sizeMm).replace(',', '.')));
  const selectedStructureKeys = Object.keys(invasionStructures).filter((k) => invasionStructures[k]);
  let invasionT = null;
  if (hasInvasion === 'yes' && selectedStructureKeys.length) {
    invasionT = selectedStructureKeys.reduce((best, k) => {
      const cat = structureRank[k];
      return !best || T_RANK[cat] > T_RANK[best] ? cat : best;
    }, null);
  }
  const atelectasisT = hasAtelectasis === 'yes' ? 'T2a' : null;
  const noduleT = noduleStatus === 'sameLobe' ? 'T3' : noduleStatus === 'diffLobe' ? 'T4' : null;
  const qualitativeFindingPresent = !!(invasionT || atelectasisT || noduleT);
  // T1mi solo aplica si no hay ningún hallazgo cualitativo que por definición
  // lo contradiga, y el tamaño (si se ingresó) es compatible (≤3 cm).
  const t1miEligible = t1miFlag === 'yes' && !qualitativeFindingPresent && (!sizeIsValid || T_RANK[sizeT] <= T_RANK.T1c);

  let guidedT = null;
  if (guidedGate === 'Tx' || guidedGate === 'T0' || guidedGate === 'Tis') {
    guidedT = guidedGate;
  } else if (guidedGate === 'lesion') {
    if (t1miEligible) {
      guidedT = 'T1mi';
    } else {
      guidedT = [sizeT, invasionT, atelectasisT, noduleT].reduce((best, cur) => {
        if (!cur) return best;
        return !best || T_RANK[cur] > T_RANK[best] ? cur : best;
      }, null);
    }
  }

  const guidedWinningRank = guidedT && guidedT !== 'T1mi' ? T_RANK[guidedT] : null;
  const guidedReasons = [];
  if (guidedT === 'T1mi') {
    guidedReasons.push(c.reasonT1mi);
  } else if (guidedWinningRank) {
    if (sizeT && T_RANK[sizeT] === guidedWinningRank) guidedReasons.push(c.reasonSize);
    if (invasionT && T_RANK[invasionT] === guidedWinningRank) {
      const names = selectedStructureKeys
        .filter((k) => T_RANK[structureRank[k]] === guidedWinningRank)
        .map((k) => allStructureOptions.find((o) => o.key === k)?.label)
        .filter(Boolean)
        .join(', ');
      guidedReasons.push(`${c.reasonInvasionPrefix} ${names}`);
    }
    if (atelectasisT && T_RANK[atelectasisT] === guidedWinningRank) guidedReasons.push(c.reasonAtelectasis);
    if (noduleT && T_RANK[noduleT] === guidedWinningRank) {
      guidedReasons.push(noduleStatus === 'sameLobe' ? c.reasonNoduleSame : c.reasonNoduleDiff);
    }
  }

  const tVal = tMode === 'known' ? tKnownVal : guidedT;

  const nOptions = [
    { key: 'Nx', badge: 'Nx', label: c.optNxLabel, desc: c.optNxDesc },
    { key: 'N0', badge: 'N0', label: c.optN0Label, desc: c.optN0Desc },
    { key: 'N1', badge: 'N1', label: c.optN1Label, desc: c.optN1Desc },
    { key: 'N2a', badge: 'N2a', label: c.optN2aLabel, desc: c.optN2aDesc },
    { key: 'N2b', badge: 'N2b', label: c.optN2bLabel, desc: c.optN2bDesc },
    { key: 'N3', badge: 'N3', label: c.optN3Label, desc: c.optN3Desc },
  ];

  const mOptions = [
    { key: 'M0', badge: 'M0', label: c.optM0Label, desc: c.optM0Desc },
    { key: 'M1a', badge: 'M1a', label: c.optM1aLabel, desc: c.optM1aDesc },
    { key: 'M1b', badge: 'M1b', label: c.optM1bLabel, desc: c.optM1bDesc },
    { key: 'M1c1', badge: 'M1c1', label: c.optM1c1Label, desc: c.optM1c1Desc },
    { key: 'M1c2', badge: 'M1c2', label: c.optM1c2Label, desc: c.optM1c2Desc },
  ];

  const isTis = tVal === 'Tis';
  const needsN = tVal && tVal !== 'Tis' && !(mVal === 'M1a' || mVal === 'M1b' || mVal === 'M1c1' || mVal === 'M1c2');
  const isComplete = !!(tVal && mVal && (isTis || !needsN || nVal));
  const stage = isComplete ? getStage(tVal, nVal, mVal) : null;

  const findLabel = (options, key) => options.find((o) => o.key === key)?.badge || key;

  const getStageColor = (s) => {
    if (!s) return 'text-slate-400';
    if (s === '0' || s.startsWith('I') && !s.startsWith('IV')) return 'text-emerald-500';
    if (s.startsWith('IV')) return 'text-red-500';
    return 'text-amber-500';
  };

  const tnmSummary = () => {
    const parts = [tVal, isTis ? null : nVal, mVal].filter(Boolean);
    return parts.join(' ');
  };

  const handleCopy = () => {
    if (!isComplete) return;
    const lines = [
      c.reportTitle,
      `T: ${tVal} — ${tOptions.find((o) => o.key === tVal)?.label}`,
    ];
    if (tMode === 'guided' && guidedGate === 'lesion' && guidedReasons.length) {
      lines.push(`${c.reportFindingsLabel}: ${guidedReasons.join('; ')}`);
    }
    if (!isTis && nVal) lines.push(`N: ${nVal} — ${nOptions.find((o) => o.key === nVal)?.label}`);
    lines.push(`M: ${mVal} — ${mOptions.find((o) => o.key === mVal)?.label}`);
    lines.push(`${c.resultLabel}: ${stage ? `${c.stageLabel} ${stage}` : c.stageNA}`);
    copyToClipboard(lines.join('\n'), t.common.copiedOk, t.common.copiedErr);
  };

  return (
    <div className={`space-y-4 animate-in fade-in ${isComplete ? 'pb-32' : ''}`}>
      <Card>
        <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3">{c.qT}</h3>
        <ModeToggle value={tMode} onChange={setTMode} guidedLabel={c.tModeGuided} knownLabel={c.tModeKnown} />

        {tMode === 'known' && (
          <OptionButtons options={tOptions} value={tKnownVal} onChange={setTKnownVal} />
        )}

        {tMode === 'guided' && (
          <div className="space-y-4">
            <OptionButtons
              options={[
                { key: 'lesion', label: c.gateLesionLabel, desc: c.gateLesionDesc },
                { key: 'Tx', badge: 'Tx', label: c.optTxLabel, desc: c.optTxDesc },
                { key: 'T0', badge: 'T0', label: c.optT0Label, desc: c.optT0Desc },
                { key: 'Tis', badge: 'Tis', label: c.optTisLabel, desc: c.optTisDesc },
              ]}
              value={guidedGate}
              onChange={setGuidedGate}
            />

            {guidedGate === 'lesion' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">{c.sizeLabel}</label>
                  <NumberField value={sizeMm} onChange={setSizeMm} placeholder="25" />
                </div>

                {(!sizeIsValid || T_RANK[sizeT] <= T_RANK.T1c) && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">{c.t1miQ}</h4>
                    <YesNoButtons value={t1miFlag} onChange={setT1miFlag} yesLabel={t.common.yes} noLabel={t.common.no} />
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{c.t1miHint}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">{c.invasionQ}</h4>
                  <YesNoButtons
                    value={hasInvasion}
                    onChange={(v) => { setHasInvasion(v); if (v === 'no') setInvasionStructures({}); }}
                    yesLabel={t.common.yes}
                    noLabel={t.common.no}
                  />
                </div>

                {hasInvasion === 'yes' && (
                  <div className="space-y-3 pl-3 border-l-2 border-blue-200 dark:border-blue-900">
                    <div>
                      <h5 className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5">{c.structGroupT2a}</h5>
                      <CheckButtons
                        options={t2aStructureOptions}
                        values={invasionStructures}
                        onToggle={(k) => setInvasionStructures((s) => ({ ...s, [k]: !s[k] }))}
                      />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5">{c.structGroupT3}</h5>
                      <CheckButtons
                        options={t3StructureOptions}
                        values={invasionStructures}
                        onToggle={(k) => setInvasionStructures((s) => ({ ...s, [k]: !s[k] }))}
                      />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5">{c.structGroupT4}</h5>
                      <CheckButtons
                        options={t4StructureOptions}
                        values={invasionStructures}
                        onToggle={(k) => setInvasionStructures((s) => ({ ...s, [k]: !s[k] }))}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">{c.atelectasisQ}</h4>
                  <YesNoButtons value={hasAtelectasis} onChange={setHasAtelectasis} yesLabel={t.common.yes} noLabel={t.common.no} />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{c.atelectasisHint}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">{c.noduleQ}</h4>
                  <OptionButtons
                    options={[
                      { key: 'none', label: c.noduleNoneLabel },
                      { key: 'sameLobe', badge: 'T3', label: c.noduleSameLobeLabel },
                      { key: 'diffLobe', badge: 'T4', label: c.noduleDiffLobeLabel },
                      { key: 'contralateral', badge: 'M1a', label: c.noduleContralateralLabel },
                    ]}
                    value={noduleStatus}
                    onChange={setNoduleStatus}
                  />
                  {noduleStatus === 'contralateral' && (
                    <div className="mt-2"><InfoBox tone="slate">{c.noduleContralateralNote}</InfoBox></div>
                  )}
                </div>

                {guidedT && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-900">
                    <span className="text-xs text-blue-600 dark:text-blue-300 block mb-0.5">{c.computedTLabel}</span>
                    <span className="text-xl font-black text-blue-700 dark:text-blue-300">{guidedT}</span>
                    {guidedReasons.length > 0 && (
                      <p className="text-xs text-blue-600/80 dark:text-blue-300/80 mt-1">{c.determinedByPrefix} {guidedReasons.join(' + ')}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {isTis && <InfoBox tone="slate">{c.tisNote}</InfoBox>}

      {!isTis && (
        <Card>
          <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3">{c.qN}</h3>
          <OptionButtons options={nOptions} value={nVal} onChange={setNVal} />
        </Card>
      )}

      {!isTis && (
        <Accordion icon={<IconBookOpen size={16} />} title={c.nodalMapTitle}>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.nodalMapIntro}</p>
          <ZoomableDiagram title={c.nodalMapTitle} labels={t.common.diagramZoom}>
            <IaslcNodalMap labels={c.nodalMapLabels} />
          </ZoomableDiagram>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.nodalMapNote}</p>
        </Accordion>
      )}

      {!isTis && (
        <Accordion icon={<IconBookOpen size={16} />} title={c.axialMapTitle}>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.axialMapIntro}</p>
          <ZoomableDiagram title={c.axialMapTitle} labels={t.common.diagramZoom}>
            <AxialNodalStations labels={c.axialMapLabels} />
          </ZoomableDiagram>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.axialMapNote}</p>
        </Accordion>
      )}

      {!isTis && (
        <Accordion icon={<IconBookOpen size={16} />} title={c.nonRegionalMapTitle}>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.nonRegionalMapIntro}</p>
          <ZoomableDiagram title={c.nonRegionalMapTitle} labels={t.common.diagramZoom}>
            <NonRegionalNodes labels={c.nonRegionalMapLabels} />
          </ZoomableDiagram>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-snug">{c.nonRegionalMapNote}</p>
        </Accordion>
      )}

      <Card>
        <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3">{c.qM}</h3>
        <OptionButtons options={mOptions} value={mVal} onChange={setMVal} />
      </Card>

      {isComplete && (
        <Card className="text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{c.resultLabel}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {[findLabel(tOptions, tVal), isTis ? 'N0' : nVal ? findLabel(nOptions, nVal) : null, findLabel(mOptions, mVal)].filter(Boolean).join(' ')}
          </p>
          <p className={`text-2xl font-black mt-2 ${getStageColor(stage)}`}>
            {stage ? `${c.stageLabel} ${stage}` : c.stageNA}
          </p>

          {(nVal === 'N2a' || nVal === 'N2b') && !isTis && (
            <div className="mt-3 text-left">
              <InfoBox tone="slate">{nVal === 'N2a' ? c.noteN2a : c.noteN2b}</InfoBox>
            </div>
          )}
          {(mVal === 'M1c1' || mVal === 'M1c2') && (
            <div className="mt-2 text-left">
              <InfoBox tone="slate">{mVal === 'M1c1' ? c.noteM1c1 : c.noteM1c2}</InfoBox>
            </div>
          )}
        </Card>
      )}

      <UsageNotes paragraphs={c.usage} />
      <References items={REFERENCES.lungCancerTNM9} />
      <ReportBugLink calcTitle={c.title} />
      <DonationButton />
      <CalcDisclaimer />

      {isComplete && (
        <StickyBar>
          <div className="min-w-0 w-full text-left">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{c.resultLabel}</span>
            <span className={`text-lg font-black truncate leading-tight block ${getStageColor(stage)}`}>
              {stage ? `${c.stageLabel} ${stage}` : c.stageNA} ({tnmSummary()})
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ResetIconButton onClick={resetAll} label={t.common.reset} />
            <CopyIconButton onClick={handleCopy} label={t.common.copyReport} />
          </div>
        </StickyBar>
      )}
    </div>
  );
}

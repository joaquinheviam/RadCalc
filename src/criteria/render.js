// Convierte la ficha de una calculadora (ver src/criteria/<id>.js) en el HTML
// de la sección "Criterios y referencias". Es la única forma de dibujarla:
//   - scripts/prerender-seo.mjs la escribe en el HTML estático de cada ruta
//     (legible sin JavaScript, p. ej. por Microsoft 365 Copilot), y
//   - CriteriaReferences.jsx la muestra dentro de la calculadora en React,
// así que el usuario y un lector sin JS ven exactamente el mismo contenido.
//
// HTML semántico: <details>/<summary> plegable (cerrado por defecto),
// encabezados h2/h3/h4, <dl> y tablas reales. Los atributos data-criteria
// marcan cada parte requerida para que scripts/verify-static.mjs la revise.

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const CHEVRON = '<svg class="shrink-0 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';
const BOOK = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';

const H3 = 'text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2';
const H4 = 'text-xs font-semibold text-slate-700 dark:text-slate-200 mt-3 mb-1.5';
const P = 'leading-relaxed';

function table({ headers, rows }) {
  const th = headers.map((h) => `<th scope="col" class="pb-2 pr-2 font-medium align-bottom">${esc(h)}</th>`).join('');
  const body = rows.map((row) => `<tr class="border-b border-slate-50 dark:border-slate-700/50 align-top">${
    row.map((cell, j) => (j === 0
      ? `<th scope="row" class="py-1.5 pr-2 font-medium text-slate-700 dark:text-slate-200">${esc(cell)}</th>`
      : `<td class="py-1.5 pr-2">${esc(cell)}</td>`)).join('')
  }</tr>`).join('');
  return `<div class="overflow-x-auto"><table class="w-full text-xs text-left border-collapse"><thead><tr class="text-slate-400 border-b border-slate-100 dark:border-slate-700">${th}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function list(items, ordered) {
  const tag = ordered ? 'ol' : 'ul';
  const cls = ordered ? 'list-decimal' : 'list-disc';
  return `<${tag} class="${cls} pl-4 space-y-1">${items.map((it) => `<li>${esc(it)}</li>`).join('')}</${tag}>`;
}

// Bloque genérico: { title, paragraphs, list, ordered, table, after }
function block(b) {
  let out = b.title ? `<h4 class="${H4}">${esc(b.title)}</h4>` : '';
  (b.paragraphs || []).forEach((p) => { out += `<p class="${P}">${esc(p)}</p>`; });
  if (b.list) out += list(b.list, b.ordered);
  if (b.table) out += table(b.table);
  (b.after || []).forEach((p) => { out += `<p class="${P} text-slate-500 dark:text-slate-400">${esc(p)}</p>`; });
  return `<div class="space-y-2">${out}</div>`;
}

function section(key, title, inner, extraAttrs = '') {
  return `<section data-criteria="${key}"${extraAttrs} class="space-y-2"><h3 class="${H3}">${esc(title)}</h3>${inner}</section>`;
}

export function renderCriteriaHtml(spec, L) {
  const parts = [];
  const m = spec.meta;

  // Identificación: sistema, versión, organismo, fecha.
  const dl = [
    ['system', L.system, m.system],
    ['version', L.version, m.version],
    ['organization', L.organization, m.organization],
    ['updated', L.lastUpdated, m.lastUpdated],
  ].filter(([, , v]) => v)
    .map(([k, label, v]) => `<div class="flex gap-2"><dt class="font-medium text-slate-700 dark:text-slate-200 shrink-0">${esc(label)}:</dt><dd data-criteria="${k}">${k === 'updated' ? `<time datetime="${esc(v)}">${esc(v)}</time>` : esc(v)}</dd></div>`)
    .join('');
  parts.push(`<section data-criteria="identification" class="space-y-2"><h3 class="${H3}">${esc(L.identification)}</h3><dl class="space-y-1">${dl}</dl></section>`);

  if (spec.scope.length) {
    parts.push(section('scope', L.scope, spec.scope.map((p) => `<p class="${P}">${esc(p)}</p>`).join(''),
      ` data-exclusions="${spec.exclusionsStated ? 'stated' : 'missing'}"`));
  }

  if (spec.variables.length) {
    parts.push(section('variables', L.variables, table({
      headers: [L.varName, L.varDefinition, L.varValues, L.varUnit],
      rows: spec.variables.map((v) => [v.name, v.definition || '—', v.values.join(' · '), v.unit]),
    })));
  }

  if (spec.rules.length) parts.push(section('rules', L.rules, spec.rules.map(block).join('')));
  if (spec.results.length) parts.push(section('results', L.results, spec.results.map(block).join('')));

  if (spec.references.length) {
    const refs = spec.references.map((r) => `<li class="leading-relaxed">${esc(r.text)}${r.doi
      ? ` <a href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener noreferrer" class="text-sky-600 dark:text-sky-400 underline underline-offset-2">doi:${esc(r.doi)}</a>`
      : ''}</li>`).join('');
    parts.push(section('references', L.references, `<ol class="list-decimal pl-4 space-y-2">${refs}</ol>`));
  }

  return `<section data-criteria-section id="criterios" aria-labelledby="criterios-titulo" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">`
    + `<details class="group">`
    + `<summary class="w-full flex items-center justify-between gap-2 px-5 py-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">`
    + `<span class="flex items-center gap-2">${BOOK} <h2 id="criterios-titulo" class="text-sm font-medium">${esc(L.title)}</h2></span>${CHEVRON}</summary>`
    + `<div class="px-5 pb-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-5 text-xs text-slate-600 dark:text-slate-300">`
    + `<p class="${P} text-slate-500 dark:text-slate-400">${esc(L.intro)}</p>`
    + parts.join('')
    + `</div></details></section>`;
}

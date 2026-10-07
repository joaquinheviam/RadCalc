// Partes comunes de las fichas de "Criterios y referencias": identificación,
// a quién aplica, referencias, fecha y lista de pendientes. Cada
// src/criteria/<id>.js agrega sus variables, reglas y resultados.
import { REFERENCES } from '../i18n/references.js';
import { CRITERIA_META } from './meta.js';
import { LAST_UPDATED } from './lastUpdated.js';

// Fuentes que no son revisadas por pares ni documentos oficiales: no se
// publican en la sección y quedan como pendientes.
const NON_PRIMARY_SOURCE = /radiology ?assistant|radiologyassistant|radiopaedia/i;

const resolve = (c, path) => {
  const [key, idx] = path.split('.');
  return idx === undefined ? c[key] : (c[key] || [])[Number(idx)];
};

export function baseSpec(id, t) {
  const c = t.calc[id];
  const meta = CRITERIA_META[id] || {};
  const pending = [];

  const lastUpdated = LAST_UPDATED[id] || null;
  if (!lastUpdated) pending.push('Sin fecha de última actualización obtenible desde git.');
  ['system', 'version', 'organization'].forEach((k) => {
    if (!meta[k]) pending.push(`Falta ${k === 'system' ? 'el nombre del sistema' : k === 'version' ? 'la versión o año' : 'el organismo responsable'}.`);
  });

  const scope = (meta.scope || []).map((p) => resolve(c, p)).filter(Boolean);
  if (!scope.length) pending.push('Falta el texto de a quién aplica.');
  if (!meta.exclusionsStated) pending.push('Las exclusiones no están explícitas en los textos de la calculadora.');

  const references = [];
  (REFERENCES[id] || []).forEach((r) => {
    const ref = typeof r === 'string' ? { text: r, doi: null } : { text: r.text, doi: r.doi || null };
    if (NON_PRIMARY_SOURCE.test(ref.text)) pending.push(`Referencia omitida por no ser fuente primaria: ${ref.text}`);
    else references.push(ref);
  });
  if (!references.length) pending.push('Sin referencias primarias.');

  return {
    id,
    title: c.title,
    subtitle: c.subtitle,
    meta: { system: meta.system || null, version: meta.version || null, organization: meta.organization || null, lastUpdated },
    scope,
    exclusionsStated: Boolean(meta.exclusionsStated),
    variables: [],
    rules: [],
    results: [],
    references,
    pending,
  };
}

// Agrupa elementos consecutivos con el mismo valor: [{ items: [...], value }].
export function groupRuns(items, valueOf) {
  const runs = [];
  items.forEach((it) => {
    const v = valueOf(it);
    const last = runs[runs.length - 1];
    if (last && last.value === v) last.items.push(it);
    else runs.push({ items: [it], value: v });
  });
  return runs;
}

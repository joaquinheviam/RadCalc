// Notas de una versión de intranet: las entradas del historial clínico desde
// una fecha (AAAA-MM-DD, inclusive); sin fecha, las 5 más recientes.
//   node scripts/intranet-notes.mjs 2026-11-01
import es from '../src/i18n/strings.es.js';

const since = process.argv[2] || '';
const all = es.changelog.entries;
const items = since ? all.filter((e) => e.date >= since) : all.slice(0, 5);
console.log(items.length ? '## Cambios clínicos\n' : 'Sin cambios clínicos nuevos en el historial.');
for (const e of items) console.log(`- **${e.date}**: ${e.text}`);

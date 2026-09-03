// Normaliza texto para el buscador: minúsculas y sin tildes/diacríticos,
// para que "utero"/"útero" o "riñon"/"riñón" encuentren lo mismo.
export function normalizeSearchText(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

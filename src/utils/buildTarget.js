// Versión para intranet (npm run build:intranet, ver docs/INTRANET.md): una
// copia estática para redes sin salida a internet. Vite reemplaza este valor
// al compilar, así que en el sitio público (radiocalc.app) todo lo que depende
// de IS_INTRANET se elimina del código.
export const IS_INTRANET = import.meta.env.VITE_INTRANET === '1';
// Fecha y commit de la compilación, p. ej. "2026-11-23 (4c13b8e)".
export const INTRANET_VERSION = import.meta.env.VITE_INTRANET_VERSION || '';

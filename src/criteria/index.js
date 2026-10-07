// Calculadoras que ya tienen ficha de "Criterios y referencias". La usan el
// prerender, /llms.txt y la verificación. Cada calculadora importa su propia
// ficha directamente (no este índice) para no sumar las demás a su paquete.
import { buildTiradsCriteria } from './tirads.js';
import { buildLiradsCriteria } from './lirads.js';
import { buildLungNoduleCriteria } from './lungNodule.js';

export const CRITERIA_BUILDERS = {
  tirads: buildTiradsCriteria,
  lirads: buildLiradsCriteria,
  lungNodule: buildLungNoduleCriteria,
};

export { renderCriteriaHtml } from './render.js';

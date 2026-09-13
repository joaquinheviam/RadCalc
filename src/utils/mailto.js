export const REPORT_EMAIL = 'drjoaquinhevia@gmail.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/joaqu%C3%ADn-hevia-morel-07421675/';

// type: 'bug' (reportar error) | 'update' (sugerir actualización) | 'suggestion' (sugerencia general)
//     | 'missingCalculator' (pedir un algoritmo/calculadora que no existe, desde el buscador)
export const buildMailto = (calcTitle, lang, type = 'bug') => {
  const page = calcTitle || (lang === 'es' ? '(general del sitio)' : '(general site issue)');
  const templates = {
    es: {
      bug: {
        subject: `RadioCalc Clinical - Reporte de error${calcTitle ? ' (' + calcTitle + ')' : ''}`,
        body: `Hola Dr. Hevia,\n\nEncontré un posible error en la calculadora: ${page}.\n\nDescripción del problema:\n- \n\nValores ingresados (si aplica):\n- \n\nResultado esperado vs. obtenido:\n- \n\nGracias.`,
      },
      update: {
        subject: `RadioCalc Clinical - Sugerencia de actualización${calcTitle ? ' (' + calcTitle + ')' : ''}`,
        body: `Hola Dr. Hevia,\n\nCreo que la calculadora "${page}" podría actualizarse (nueva guía, versión de consenso, referencia más reciente, etc.).\n\nDetalle de la actualización sugerida:\n- \n\nFuente/referencia (si aplica):\n- \n\nGracias.`,
      },
      suggestion: {
        subject: `RadioCalc Clinical - Sugerencia${calcTitle ? ' (' + calcTitle + ')' : ''}`,
        body: `Hola Dr. Hevia,\n\nTengo una sugerencia sobre: ${page}.\n\nDetalle:\n- \n\nGracias.`,
      },
      missingCalculator: {
        subject: `RadioCalc Clinical - Sugerencia de nueva calculadora${calcTitle ? ' (busqué: ' + calcTitle + ')' : ''}`,
        body: `Hola Dr. Hevia,\n\nNo encontré la siguiente calculadora o algoritmo en RadioCalc y me gustaría sugerir su incorporación${calcTitle ? ` (busqué: "${calcTitle}")` : ''}.\n\n1. Nombre de la calculadora o algoritmo:\n- \n\n2. Evidencia bibliográfica o DOI que la respalde:\n- \n\nGracias.`,
      },
    },
    en: {
      bug: {
        subject: `RadioCalc Clinical - Bug report${calcTitle ? ' (' + calcTitle + ')' : ''}`,
        body: `Hi Dr. Hevia,\n\nI found a possible error in the calculator: ${page}.\n\nDescription of the issue:\n- \n\nInput values (if applicable):\n- \n\nExpected vs. obtained result:\n- \n\nThanks.`,
      },
      update: {
        subject: `RadioCalc Clinical - Update suggestion${calcTitle ? ' (' + calcTitle + ')' : ''}`,
        body: `Hi Dr. Hevia,\n\nI think the calculator "${page}" could be updated (new guideline, consensus version, newer reference, etc.).\n\nSuggested update details:\n- \n\nSource/reference (if applicable):\n- \n\nThanks.`,
      },
      suggestion: {
        subject: `RadioCalc Clinical - Suggestion${calcTitle ? ' (' + calcTitle + ')' : ''}`,
        body: `Hi Dr. Hevia,\n\nI have a suggestion about: ${page}.\n\nDetails:\n- \n\nThanks.`,
      },
      missingCalculator: {
        subject: `RadioCalc Clinical - New calculator suggestion${calcTitle ? ' (I searched: ' + calcTitle + ')' : ''}`,
        body: `Hi Dr. Hevia,\n\nI couldn't find the following calculator or algorithm in RadioCalc and would like to suggest adding it${calcTitle ? ` (I searched: "${calcTitle}")` : ''}.\n\n1. Name of the calculator or algorithm:\n- \n\n2. Supporting literature or DOI:\n- \n\nThanks.`,
      },
    },
  };
  const tpl = templates[lang][type] || templates[lang].bug;
  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(tpl.body)}`;
};

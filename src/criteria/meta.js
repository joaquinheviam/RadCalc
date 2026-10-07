// Identificación de cada sistema (nombre, versión, organismo) para la sección
// "Criterios y referencias". No es una regla clínica: son datos que ya están
// en las referencias del repositorio, y `evidence` dice de dónde sale cada uno.
// tests/logic/criteria.test.mjs comprueba que esos textos estén efectivamente
// en REFERENCES.<id>, para no publicar nada que no esté respaldado.
//
//   scope: textos de t.calc.<id> que describen a quién aplica
//          ('subtitle' o 'usage.N'), en ese orden.
//   exclusionsStated: true solo si esos textos nombran exclusiones explícitas.
//   units: unidad de cada variable numérica, por clave.
//
// Lo que falte aquí (p. ej. exclusiones) no se completa de memoria: queda
// como pendiente en la ficha (spec.pending) y en docs/criterios-pendientes.md.
export const CRITERIA_META = {
  tirads: {
    system: 'ACR TI-RADS',
    version: '2017',
    organization: 'American College of Radiology (ACR)',
    evidence: [{ ref: 0, contains: ['ACR Thyroid Imaging, Reporting and Data System (TI-RADS)', 'ACR TI-RADS Committee', '2017'] }],
    scope: ['subtitle', 'usage.2'],
    exclusionsStated: false,
  },
  lirads: {
    system: 'LI-RADS CT/MRI',
    version: 'v2018',
    organization: 'American College of Radiology (ACR)',
    evidence: [
      { ref: 0, contains: ['Liver Imaging Reporting and Data System (LI-RADS) Version 2018'] },
      { ref: 1, contains: ['American College of Radiology', 'CT/MRI LI-RADS v2018 CORE'] },
    ],
    scope: ['usage.0', 'usage.4'],
    exclusionsStated: false,
  },
  lungNodule: {
    system: 'Fleischner Society 2017 / NCCN',
    version: 'Fleischner 2017; NCCN NSCLC v6.2026',
    organization: 'Fleischner Society; National Comprehensive Cancer Network (NCCN)',
    evidence: [
      { ref: 0, contains: ['from the Fleischner Society 2017'] },
      { ref: 1, contains: ['National Comprehensive Cancer Network (NCCN)', 'Non-Small Cell Lung Cancer', 'Version 6.2026'] },
    ],
    scope: ['usage.1'],
    exclusionsStated: true,
  },
};

// Hematocrito sintético a partir del T1 nativo del pool sanguíneo (RM cardíaca).
// T1 en ms; el resultado es una fracción (0-1).
//
// - Chen W, et al. Circ Cardiovasc Imaging 2022;15:e013745 (doi 10.1161/CIRCIMAGING.121.013745),
//   Tabla 2. Philips Ingenia 3 T y 1,5 T, MOLLI 5s(3s)3s; 1101 pacientes.
//   Modelos comunes (Sexo: hombre = 1, mujer = 0; Campo: 1,5 T = 1, 3 T = 0):
//     VI: 816,325 × (1/T1) + 0,024 × Sexo − 0,094 × Campo − 0,027
//     VD: 694,200 × (1/T1) + 0,022 × Sexo − 0,075 × Campo + 0,03
//   Modelos específicos por campo, sexo y cavidad (8 ecuaciones, ver CHEN_SPECIFIC).
// - Liu CY, et al. (MESA) J Am Coll Cardiol 2017;70:3102-9 (doi 10.1016/j.jacc.2017.10.044):
//   1,5 T, MOLLI: 726,19 × (1/T1 sangre nativo) − 0,07.
// - Reiter C, et al. Eur J Radiol 2024;178:111659 (doi 10.1016/j.ejrad.2024.111659):
//   Siemens Magnetom Skyra 3 T, MOLLI 5(3)3, pool del VI en corte medio telesistólico:
//   1355,52 × (1/T1) − 0,310.
// - Ecuación local: a × (1/T1) + b, con los coeficientes calibrados en el propio equipo.

export const CHEN_SPECIFIC = {
  '3': { male: { lv: [1763, -0.5248], rv: [1373, -0.3365] }, female: { lv: [1740, -0.5233], rv: [1574, -0.4504] } },
  '1.5': { male: { lv: [1319, -0.4318], rv: [1137, -0.3212] }, female: { lv: [1048, -0.2630], rv: [897.9, -0.1718] } },
};

// Qué datos necesita cada modelo y en qué campo se derivó (null = ambos).
export const MODELS = {
  chenCommon: { needs: ['field', 'sex', 'pool'], field: null },
  chenSpecific: { needs: ['field', 'sex', 'pool'], field: null },
  mesa: { needs: [], field: '1.5' },
  reiter: { needs: [], field: '3' },
  local: { needs: ['a', 'b'], field: null },
};

const ok = (x) => typeof x === 'number' && Number.isFinite(x);

/**
 * @param {{model:string, t1:number, field?:'1.5'|'3', sex?:'male'|'female', pool?:'lv'|'rv', a?:number, b?:number}} p
 * @returns {number|null} hematocrito sintético como fracción, o null si faltan datos.
 */
export function syntheticHct({ model, t1, field, sex, pool = 'lv', a, b }) {
  if (!ok(t1) || t1 <= 0 || !MODELS[model]) return null;
  const r1 = 1 / t1;
  const needField = model === 'chenCommon' || model === 'chenSpecific';
  if (needField && (!['1.5', '3'].includes(field) || !['male', 'female'].includes(sex) || !['lv', 'rv'].includes(pool))) return null;
  switch (model) {
    case 'chenCommon': {
      const s = sex === 'male' ? 1 : 0;
      const f = field === '1.5' ? 1 : 0;
      return pool === 'lv'
        ? 816.325 * r1 + 0.024 * s - 0.094 * f - 0.027
        : 694.2 * r1 + 0.022 * s - 0.075 * f + 0.03;
    }
    case 'chenSpecific': {
      const [k, c] = CHEN_SPECIFIC[field][sex][pool];
      return k * r1 + c;
    }
    case 'mesa': return 726.19 * r1 - 0.07;
    case 'reiter': return 1355.52 * r1 - 0.31;
    case 'local': return ok(a) && ok(b) ? a * r1 + b : null;
    default: return null;
  }
}

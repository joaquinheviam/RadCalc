# Criterios y referencias: pendientes para revisión

Datos que faltan o que no calzan en el repositorio. **No se completaron de memoria**: los debe revisar el autor contra la fuente primaria.
La lista automática de cada ficha se obtiene con:

```bash
node -e "const {STRINGS}=await import('./src/i18n/strings.js');const {CRITERIA_BUILDERS}=await import('./src/criteria/index.js');for (const [id,b] of Object.entries(CRITERIA_BUILDERS)){console.log(id);b(STRINGS.es).pending.forEach(p=>console.log(' -',p));}"
```

## Piloto (TI-RADS, LI-RADS, nódulo pulmonar)

### ACR TI-RADS (`tirads`)
- **Exclusiones:** los textos no nombran exclusiones explícitas. Solo dicen que el sistema "fue diseñado para nódulos sólidos o predominantemente sólidos" (`usage[2]`), y esa frase conviene revisarla también contra el white paper de 2017.
- **TR2 y 1 punto:** la tabla de manejo (`managementRows`) dice «TR2 = 2 pts», pero la calculadora asigna TR2 a 1–2 puntos (`tiradsCategory`). La sección publica lo que hace la calculadora (1–2). Falta definir cuál es el correcto.

### LI-RADS v2018 (`lirads`)
- **Exclusiones:** no están en los textos de la calculadora.
- **LR-1, LR-2 y LR-NC:** LR-1 figura en las categorías, pero la calculadora no puede entregarla. LR-2 solo se obtiene bajando un nivel por características auxiliares. Los criterios propios de LR-1 y LR-2 no están en el repositorio. LR-NC no existe en la calculadora.
- **Definiciones:** tamaño de la observación, APHE y características adicionales aparecen solo como pregunta, sin definición propia.

### Nódulo pulmonar incidental (`lungNodule`)
- **Redondeo del tamaño:** no está explícito. La calculadora compara el decimal tal cual, así que 8,4 mm cae en «> 8 mm».

## Fuera del piloto

- **Referencias que no son fuente primaria** (Radiology Assistant), que la sección no publicará: `biradsMammo`, `biradsUs`, `lungCysts`, `bosniak`.
- **Fecha de última actualización:** `thoracicglossary` no tiene un bloque `calc.thoracicglossary` reconocible en strings, así que no se obtiene fecha fiable.

## Para un trabajo aparte (no se tocó)

- **`getReportText()` en LI-RADS y Nódulo pulmonar** devuelve `undefined` (`return;`) en vez de `''` cuando no hay resultado. CLAUDE.md pide `''`. Hoy no deja la página en blanco, porque el estado inicial no tiene resultado, pero no cumple la regla.
- **Informe de LI-RADS con LR-TIV o LR-M sin tamaño ingresado:** el texto dice «Tamaño: ≥ 20 mm» y «APHE no periférico: No», aunque no se ingresó tamaño (`size === 0` cae en `c.size3`).

## Fecha de "Última actualización"

- Es la fecha del último commit que modificó la calculadora: su componente, su módulo de lógica, sus bloques `calc.<id>` en strings ES/EN y `REFERENCES.<id>`. No es una fecha de revisión clínica.
- Se ignoran los commits marcados `[sin-cambio-clinico]`.
- Varias calculadoras quedan con fecha 2026-09-21, que corresponde al commit que agregó «Ver informe» a todas.
- Ver `scripts/calc-dates.mjs`.

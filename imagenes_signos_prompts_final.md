# Prompts finales de imagen — signos radiológicos ilustrativos (Tarea 8)

Versión sintetizada a partir de las tres respuestas obtenidas (Gemini, Copilot, ChatGPT) para la Tarea 8 de `gemini_tasks.md`. Verificada línea por línea contra las fichas de hechos originales del archivo. Correcciones aplicadas respecto de los tres borradores:

- **Ítem 5 (signet-ring/Krukenberg):** los tres modelos agregaron la morfología clásica de la célula en anillo de sello (vacuola de mucina que desplaza el núcleo) sin que estuviera en la ficha de hechos original (que solo cubría epidemiología). Es un dato prácticamente definicional del término, pero se deja marcado explícitamente como convención/definición estándar, no como hallazgo de la ficha.
- **Ítem 16 (spoke-wheel/SANT):** se restituyó el hallazgo de *blooming* por susceptibilidad magnética en la cicatriz central en RM, que el borrador de Copilot había omitido en el prompt realista.
- Se adoptó de ChatGPT la cláusula de restricción ("do not add findings not explicitly described") en todos los ítems, y los matices que había preservado mejor (nódulo de Rokitansky no es signo de malignidad; patrón en panal mucinoso es inespecífico entre cistadenoma/borderline/carcinoma).
- Se mantuvo la redacción más natural/concisa de Gemini y Copilot donde no había diferencia de contenido clínico.

Formato: dos prompts en inglés por ítem (ESQUEMÁTICO y REALISTA), pensados para un generador de imágenes de uso general. El ítem 4 queda sin prompt (ficha insuficiente).

---

## 1. Signo del "cheerio" (cheerio sign) — calculadora: `lungCysts`
Contexto: histiocitosis de células de Langerhans pulmonar (PLCH), TC de tórax, fumador activo joven (20-40 años).

**ESQUEMÁTICO:** Clean, original medical atlas-style schematic illustration of pulmonary Langerhans cell histiocytosis on chest CT. Depict an irregular pulmonary nodule, sometimes cavitated, with a central cavitary component shaped like a "cheerio" or doughnut. Distribution predominantly in the upper and middle lung zones, with relative sparing of the lung bases and costophrenic angles. Simplified, diagrammatic, educational style. Do not add findings, measurements, or anatomical details beyond those described.

**REALISTA:** Realistic diagnostic chest CT image, axial slice, lung window, illustrating the "cheerio sign" in a young active smoker (20-40 years) with pulmonary Langerhans cell histiocytosis. Irregular pulmonary nodule with a central cavitated, doughnut-like component. Nodules predominantly in the upper/middle lung zones, with relative sparing of the bases and costophrenic angles. Realistic grayscale CT appearance. Do not add findings, measurements, or reconstructions not explicitly described.

---

## 2. Signo de la "esponja negra" (black sponge sign) — calculadora: `ovarianNeoplasmDx`
Contexto: cistadenofibroma ovárico (hallazgo inespecífico, también visto en otros tumores menos frecuentes), RM pélvica T2.

**ESQUEMÁTICO:** Clean, original atlas-style schematic illustration of an ovarian cystadenofibroma on pelvic MRI. Depict small cystic foci scattered within dark, T2-hypointense solid tissue, producing the "black sponge" appearance. Simplified educational diagram. Do not add enhancement, diffusion findings, or other features not described.

**REALISTA:** Realistic T2-weighted pelvic MRI image illustrating the "black sponge sign" in an ovarian cystadenofibroma. Dark (T2-hypointense) solid tissue containing multiple small scattered cystic foci. Realistic MRI signal appearance, grayscale. Do not add enhancement, diffusion, hemorrhage, or measurements not explicitly described.

---

## 3. Signo de la "anémona de mar" (sea anemone sign) — calculadora: `ovarianNeoplasmDx`
Contexto: tumor borderline seroso (casi diagnóstico de este hallazgo), RM pélvica T2.

**ESQUEMÁTICO:** Clean, original atlas-style schematic illustration of a serous borderline ovarian tumor. Depict papillary projections with T2-hyperintense architecture and internal T2-hypointense branching, producing the "sea anemone" appearance. Simplified, educational diagram. Do not add other findings.

**REALISTA:** Realistic T2-weighted pelvic MRI image of a serous borderline ovarian tumor showing the "sea anemone sign": papillary projections with T2-hyperintense architecture and internally branching T2-hypointense structures. Realistic MRI texture, grayscale. Do not add diffusion, enhancement, or measurements not explicitly described.

---

## 4. Signo del "punto brillante" (bright dot sign) — calculadora: `ovarianNeoplasmDx`
**Ficha insuficiente — no se genera prompt.** La única frase disponible ("se recomienda buscar el signo del 'punto brillante', asociado a AFP elevada en tumor del saco vitelino") no describe la apariencia morfológica, topográfica ni de señal del hallazgo. Generar un prompt requeriría inventar esos datos.

---

## 5. Células en anillo de sello / tumor de Krukenberg (signet-ring cell component) — calculadora: `ovarianNeoplasmDx`
Nota: hallazgo histológico, no radiológico → prompt de fotomicrografía, no de imagen médica. **Convención/definición estándar usada explícitamente** (no está en la ficha original, que solo cubre epidemiología): la morfología en "anillo de sello" es, por definición del término, una vacuola de mucina intracitoplasmática que desplaza el núcleo a la periferia celular.

**ESQUEMÁTICO:** Clean, original histopathology atlas-style schematic drawing illustrating signet-ring cell morphology (by definition: cells with a large intracytoplasmic mucin vacuole displacing the nucleus to the cell periphery) within a mucinous metastatic component, consistent with a Krukenberg tumor. Simplified educational microscopic diagram. Do not add stains, magnification values, or architectural details not described.

**REALISTA:** Realistic light microscopy photomicrograph, hematoxylin and eosin (H&E) stain, of a Krukenberg tumor (ovarian metastasis, most often of gastric or colonic origin). Shows a mucinous component with signet-ring cells (large mucin vacuole displacing the nucleus peripherally, by definition of the term). Realistic histology-slide appearance. Do not add immunohistochemical markers or other findings not described.

---

## 6. Patrón "queso suizo" (Swiss-cheese appearance) — calculadora: `ovarianNeoplasmDx`
Contexto: tumor de células de la granulosa del adulto (asociado a hiperestrogenismo), RM/US pélvica; los componentes quísticos pueden contener hemorragia.

**ESQUEMÁTICO:** Clean, original atlas-style schematic illustration of an adult granulosa cell tumor of the ovary with a classic "Swiss-cheese" appearance: a solid ovarian mass containing multiple cystic spaces, some with hemorrhagic content. Simplified, educational diagram. Do not add other findings.

**REALISTA:** Realistic pelvic MRI or ultrasound-style image of an adult granulosa cell tumor showing the "Swiss-cheese" appearance: multiple cystic spaces within a solid ovarian mass, some containing hemorrhage. Realistic grayscale diagnostic-imaging appearance. Do not add enhancement, measurements, or findings not described.

---

## 7. Nódulo de Rokitansky (Rokitansky nodule) — calculadora: `ovarianNeoplasmDx`
Contexto: teratoma quístico maduro, TC/RM/US pélvica. **Importante:** la ficha aclara explícitamente que este nódulo NO es signo de malignidad.

**ESQUEMÁTICO:** Clean, original atlas-style schematic illustration of a mature cystic ovarian teratoma containing an enhancing Rokitansky nodule projecting into the cystic lesion. Emphasize that this nodule is a characteristic benign component, not a sign of malignancy. Simplified, educational diagram. Do not add fat, calcification, or other findings not described.

**REALISTA:** Realistic contrast-enhanced pelvic CT, MRI, or ultrasound-style image of a mature cystic ovarian teratoma with a distinct enhancing Rokitansky nodule. Do not imply malignant transformation — this nodule is a characteristic benign finding. Do not add other tissue components or measurements not described.

---

## 8. Patrón "T2 oscuro/DWI oscuro" (dark T2/dark DWI pattern) — calculadora: `ovarianNeoplasmDx`
Contexto: fibroma/fibrotecoma ovárico puro, RM pélvica (patrón O-RADS MRI, riesgo de malignidad cercano a cero).

**ESQUEMÁTICO:** Clean, original atlas-style schematic illustration, side by side, of a pure ovarian fibroma/fibrothecoma showing a homogeneous mass with low signal on T2-weighted imaging and low signal on high-b-value DWI (similar to urine/CSF reference signal), with no diffusion restriction. Simplified, educational diagram. Do not add enhancement, necrosis, or other findings not described.

**REALISTA:** Realistic pelvic MRI images, T2-weighted and high-b-value DWI shown side by side, of a pure ovarian fibroma/fibrothecoma: homogeneous mass with low T2 signal and low DWI signal, no diffusion restriction. Realistic MRI appearance. Do not add ADC map, enhancement, or measurements not described.

---

## 9. Lóculos "en panal de abejas" (honeycomb-like locules) — calculadora: `ovarianNeoplasmDx`
Contexto: neoplasia mucinosa ovárica. **Importante:** la apariencia se superpone considerablemente entre cistadenoma, tumor borderline y carcinoma mucinoso — no elegir una entidad específica.

**ESQUEMÁTICO:** Clean, original atlas-style schematic illustration of a mucinous ovarian neoplasm showing multiple small locules arranged in a honeycomb-like pattern. Keep the depiction deliberately nonspecific — do not visually suggest cystadenoma, borderline tumor, or mucinous carcinoma specifically, since the appearance overlaps among these entities. Simplified, educational diagram.

**REALISTA:** Realistic pelvic MRI or CT-style image of a mucinous ovarian neoplasm with multiple small honeycomb-like locules. Preserve the nonspecific nature of the pattern — do not visually distinguish cystadenoma, borderline tumor, or mucinous carcinoma. Do not add enhancement, hemorrhage, or measurements not described.

---

## 10. Signo del "borde recto" (straight-edge sign) — calculadora: `ildClassifier`
Contexto: EPID asociada a enfermedad del tejido conectivo (CTD-ILD), TC de tórax, reconstrucción coronal.

**ESQUEMÁTICO:** Clean, original thoracic radiology atlas-style schematic illustration, coronal chest CT representation, showing a sharp horizontal boundary at the lung bases ("straight-edge sign") in connective-tissue-disease-associated interstitial lung disease. Simplified, educational diagram. Do not add other ILD findings not described.

**REALISTA:** Realistic coronal chest CT reconstruction, lung window, showing the "straight-edge sign": a sharp, distinct horizontal boundary at the lung bases, in CTD-ILD. Realistic grayscale CT appearance. Do not add other fibrosis patterns or measurements not described.

---

## 11. Signo del "panal de abejas exuberante" (exuberant honeycombing sign) — calculadora: `ildClassifier`
Contexto: CTD-ILD, TC de tórax; quistes en panal que ocupan > 70% de las zonas fibróticas.

**ESQUEMÁTICO:** Clean, original thoracic radiology atlas-style schematic illustration of a lung cross-section in CTD-ILD, showing honeycomb cysts densely occupying more than 70% of the fibrotic lung zones ("exuberant honeycombing sign"). Simplified, educational diagram.

**REALISTA:** Realistic axial chest CT image, lung window, showing CTD-ILD with honeycomb cysts occupying more than 70% of the visible fibrotic zones. Realistic grayscale CT appearance. Do not add other fibrosis patterns or measurements not described.

---

## 12. Signo del "lóbulo superior anterior" (anterior upper lobe sign) — calculadora: `ildClassifier`
Contexto: CTD-ILD, TC de tórax; fibrosis en el aspecto anterior de los lóbulos superiores.

**ESQUEMÁTICO:** Clean, original thoracic radiology atlas-style schematic illustration, cross-sectional view of the upper lobes, showing fibrosis concentrated specifically in the anterior aspect of the upper lobes ("anterior upper lobe sign") in CTD-ILD. Simplified, educational diagram.

**REALISTA:** Realistic axial chest CT image through the upper lung zones, lung window, showing fibrosis localized to the anterior aspect of the upper lobes, in CTD-ILD. Realistic grayscale CT appearance. Do not add other distributional patterns not described.

---

## 13. Signo de las "tres densidades" (three-density sign) — calculadora: `ildClassifier`
Contexto: neumonitis por hipersensibilidad fibrótica, TC de tórax; atenuación en mosaico/atrapamiento aéreo extenso que involucra parénquima NO fibrótico.

**ESQUEMÁTICO:** Clean, original thoracic radiology atlas-style schematic illustration of fibrotic hypersensitivity pneumonitis, showing extensive mosaic attenuation and air trapping that clearly extends into non-fibrotic lung parenchyma, creating the "three-density sign". Simplified, educational diagram with clear contrast between attenuation zones.

**REALISTA:** Realistic axial chest CT image, lung window, showing fibrotic hypersensitivity pneumonitis with extensive mosaic attenuation and air trapping involving non-fibrotic lung parenchyma alongside fibrotic regions ("three-density sign"). Realistic grayscale CT appearance.

---

## 14. Signo del halo invertido / signo del atolón (reversed halo sign / atoll sign) — calculadora: `ildClassifier`
Contexto: neumonía organizada (OP), TC de tórax. **Convención de glosario usada explícitamente** (definición clásica y ampliamente establecida, permitida por la ficha): opacidad en vidrio esmerilado central rodeada de un anillo de consolidación más densa.

**ESQUEMÁTICO:** Clean, original thoracic radiology atlas-style schematic illustration of organizing pneumonia, showing patchy consolidations and the classic reversed halo (atoll) sign — using the standard glossary definition as a convention: central ground-glass opacity completely surrounded by a denser ring of consolidation. Simplified, educational diagram.

**REALISTA:** Realistic axial chest CT image, lung window, showing organizing pneumonia with patchy consolidations and the reversed halo (atoll) sign — standard glossary convention: central ground-glass opacity encircled by a denser consolidation ring. Realistic grayscale CT appearance.

---

## 15. Signo del "anillo de servilleta" (napkin-ring sign) — calculadora: `cadrads`
Contexto: placa coronaria de alto riesgo (HRP), angio-TC coronaria. ⚠️ Distinto del napkin-ring sign pulmonar (ítem 14 es un hallazgo diferente, no confundir). **Convención de glosario usada explícitamente** (definición clásica, permitida por la ficha): núcleo central de baja atenuación rodeado de un borde de mayor atenuación, sin estenosis luminal significativa.

**ESQUEMÁTICO:** Clean, original cardiovascular CT atlas-style schematic illustration of a coronary artery cross-section showing a high-risk plaque with the napkin-ring sign — standard glossary convention: central low-attenuation core (< 30 HU) surrounded by a higher-attenuation rim, without significant luminal stenosis. Simplified, educational diagram.

**REALISTA:** Realistic coronary CT angiography image, cross-sectional view of a coronary artery, showing a high-risk plaque with the napkin-ring sign: central low-attenuation core surrounded by a higher-attenuation rim, without significant visible luminal stenosis. Realistic grayscale CT appearance. Do not add calcification or remodeling findings not described.

---

## 16. Patrón "en rueda de carro" (spoke-wheel pattern) — calculadora: `splenicLesion`
Contexto: hamartoma esplénico angiomatoide nodular transformado (SANT), TC/RM con contraste. Incluye el hallazgo de *blooming* por susceptibilidad magnética en RM (restituido — el borrador de Copilot lo había omitido en el prompt realista).

**ESQUEMÁTICO:** Clean, original abdominal radiology atlas-style schematic illustration of a splenic angiomatoid nodular transformed lesion (SANT) showing the "spoke-wheel" pattern: early peripheral enhancement converging on a delayed central scar. Include a visual cue for magnetic susceptibility (blooming artifact) within the central scar as an MRI-specific feature. Simplified, educational diagram.

**REALISTA:** Realistic contrast-enhanced abdominal MRI image (axial, with a susceptibility-weighted sequence element), showing a splenic lesion (SANT) with the "spoke-wheel" pattern: early peripheral enhancement converging toward a central scar, with distinct magnetic susceptibility (blooming) within the central scar. Realistic grayscale MRI appearance.

---

## 17. Patrón microquístico "en panal" con cicatriz estrellada central (microcystic honeycomb pattern with central stellate scar) — calculadoras: `pancreaticCyst` / `pancreaticCystDx`
Contexto: cistadenoma seroso pancreático (SCA), TC/RM con contraste; calcificación central característica.

**ESQUEMÁTICO:** Clean, original pancreatic imaging atlas-style schematic illustration of a serous cystadenoma (SCA) showing a microcystic "honeycomb" pattern of multiple small cystic spaces surrounding a central stellate scar with central calcification. Simplified, educational diagram.

**REALISTA:** Realistic contrast-enhanced abdominal CT or MRI image showing a pancreatic serous cystadenoma (SCA) with a microcystic honeycomb pattern converging on a central stellate scar with central calcification. Realistic grayscale imaging appearance.

---

## 18. Artefacto en "cola de cometa" (comet-tail artifact) — calculadora: `tirads`
Contexto: nódulo tiroideo benigno (contenido coloide), ecografía; indicador de benignidad (0 puntos en TI-RADS).

**ESQUEMÁTICO:** Clean, original thyroid ultrasound atlas-style schematic illustration of a benign thyroid nodule with an echogenic focus producing a prominent comet-tail reverberation artifact extending posteriorly, indicating benign colloid content. Simplified, educational diagram.

**REALISTA:** Realistic thyroid ultrasound image showing a benign thyroid nodule with an echogenic focus and a prominent posterior comet-tail artifact, indicative of colloid content. Realistic grayscale sonographic appearance.

# Configurar el botón de donación con Mercado Pago

Esta guía te lleva paso a paso desde crear tu cuenta de Mercado Pago hasta tener el botón "Ayúdame a mantener esta calculadora clínica gratis y sin publicidad" funcionando en el sitio, cobrando a tu cuenta bancaria de Itaú Empresa. Al igual que en `INSTRUCCIONES.md`, no hace falta programar: solo copiar y pegar.

## Índice

1. [Crear tu cuenta de Mercado Pago para tu negocio](#1-crear-tu-cuenta-de-mercado-pago-para-tu-negocio)
2. [Vincular tu cuenta de Itaú Empresa](#2-vincular-tu-cuenta-de-itaú-empresa)
3. [Crear el link de pago para las donaciones](#3-crear-el-link-de-pago-para-las-donaciones)
4. [Activar el botón en el sitio](#4-activar-el-botón-en-el-sitio)
5. [Probar que todo funciona](#5-probar-que-todo-funciona)
6. [Publicar el cambio](#6-publicar-el-cambio)
7. [Comisiones y tiempos de acreditación](#7-comisiones-y-tiempos-de-acreditación)
8. [Problemas comunes](#8-problemas-comunes)

---

## 1. Crear tu cuenta de Mercado Pago para tu negocio

1. Entra a **https://www.mercadopago.cl** y elige la opción para crear una cuenta como **negocio/empresa** (no como cuenta personal).
2. Completa el formulario con los datos de tu empresa: RUT de la empresa, razón social, dirección y un correo de contacto.
3. Confirma tu correo desde el link que te llega.
4. Mercado Pago te va a pedir que subas documentos para validar la cuenta. Ten a mano:
   - RUT de la empresa.
   - Cédula de identidad (por ambos lados) del representante legal.
   - Certificado de inicio de actividades en el SII (o la escritura/constitución de la empresa, según el tipo de sociedad). Si tu empresa está recién iniciando actividades, sirve el certificado provisorio.
5. Envía los documentos y espera la validación. Normalmente Mercado Pago confirma por correo en un plazo corto una vez que los documentos están correctos y legibles.

> No hace falta ningún trámite especial con Itaú para este paso: Mercado Pago funciona igual con cualquier banco chileno, Itaú incluido. La cuenta bancaria se agrega después, en el paso 2.

## 2. Vincular tu cuenta de Itaú Empresa

1. Ya con la cuenta de Mercado Pago activa, entra a **Tu perfil** (o **Configuración**) y busca la sección para agregar una cuenta bancaria de retiro.
2. Completa los datos de tu cuenta Itaú Empresa: banco (Itaú), tipo de cuenta (cuenta corriente/vista, según corresponda), número de cuenta y el RUT de la empresa.
3. Guarda los cambios. Es posible que Mercado Pago haga una validación (por ejemplo, un pequeño depósito de prueba) antes de dejarla habilitada para retiros.
4. Con esto, el dinero que vayas cobrando puede transferirse a esa cuenta de Itaú sin costo adicional por el traspaso (ver comisiones y tiempos en el paso 7).

## 3. Crear el link de pago para las donaciones

1. Dentro de tu cuenta de Mercado Pago, ve a **Cobrar** → **Links de pago** (a veces aparece como "Tu negocio" → "Links de pago", el menú cambia levemente con el tiempo).
2. Elige **Crear link de pago**.
3. En el tipo de monto, elige **monto a definir por quien paga** (monto abierto) en vez de un monto fijo — así cada persona puede aportar lo que quiera, como corresponde a una donación voluntaria. Si prefieres ofrecer un valor sugerido fijo, también puedes crear un link de monto fijo; incluso puedes crear más de un link (por ejemplo, uno de monto libre y otro con un valor sugerido) y decidir cuál usar.
4. En la descripción, escribe algo simple y claro, por ejemplo: "Donación voluntaria — RadioCalc Clinical".
5. Guarda el link. Mercado Pago te va a mostrar una URL corta (algo como `https://mpago.la/xxxxxxx`). **Copia esa URL completa**, la vas a necesitar en el paso siguiente.

## 4. Activar el botón en el sitio

El botón de donación ya está integrado en toda la app (aparece al final de cada calculadora) y solo permanece oculto mientras no tenga un link configurado. Para activarlo:

1. Abre el archivo `src/utils/donation.js` con el Bloc de notas (o el editor que estés usando).
2. Vas a ver esta línea:
   ```js
   export const DONATION_URL = null; // ej: 'https://mpago.la/1a2b3c4'
   ```
3. Reemplaza `null` por tu link de pago real, entre comillas. Por ejemplo:
   ```js
   export const DONATION_URL = 'https://mpago.la/1a2b3c4';
   ```
4. Guarda el archivo.

Con ese único cambio, el botón aparece automáticamente en toda la app, ya traducido (español e inglés), y abre el link en una pestaña nueva.

## 5. Probar que todo funciona

1. Corre el sitio en tu computadora:
   ```
   npm run dev
   ```
2. Abre cualquier calculadora y baja hasta el final de la página. Deberías ver el botón "Ayúdame a mantener esta calculadora clínica gratis y sin publicidad".
3. Haz clic y confirma que se abre tu link de Mercado Pago en una pestaña nueva, con el monto a definir (o el monto fijo que hayas elegido).
4. Puedes hacer una prueba real de un monto pequeño para confirmar que el dinero llega correctamente a tu cuenta y que después puedes retirarlo a tu cuenta de Itaú.

## 6. Publicar el cambio

Este cambio se publica igual que cualquier otro, siguiendo los pasos que ya conoces de `INSTRUCCIONES.md`:

```
git add .
git commit -m "Activar botón de donación con Mercado Pago"
git push
```

En uno o dos minutos, GitHub Actions publica la nueva versión y el botón queda visible para todos.

## 7. Comisiones y tiempos de acreditación

- Según tu propia cuenta, la comisión que te está cobrando Mercado Pago por venta es **2,24%**. Ese es el número que vale (por sobre cualquier estimación general), pero conviene revisarlo de vez en cuando en la sección de comisiones de tu cuenta, porque puede cambiar según el medio de pago o si Mercado Pago ajusta sus tarifas.
- El dinero queda disponible en tu cuenta de Mercado Pago según el esquema de liberación que elijas (inmediato, o en 14 o 30 días — la liberación inmediata suele tener una comisión algo mayor que las liberaciones diferidas).
- Transferir el saldo desde Mercado Pago a tu cuenta de Itaú (una vez que el dinero ya está disponible) no tiene costo adicional.

## 8. Problemas comunes

**Mercado Pago rechazó mis documentos o pide más información.**
Es habitual que pida una foto más nítida de la cédula o del certificado del SII. Vuelve a subir los documentos asegurándote de que se lean bien los datos, sin reflejos ni recortes.

**El botón de donación no aparece en el sitio.**
Revisa que en `src/utils/donation.js` el link esté entre comillas y que no quedó la palabra `null`. Si editaste el archivo con `npm run dev` abierto, guarda de nuevo y refresca el navegador.

**Quiero cambiar el link más adelante (por ejemplo, si Mercado Pago te da uno nuevo).**
Solo edita de nuevo esa misma línea en `src/utils/donation.js` con el nuevo link y repite el paso 6 para publicar el cambio.

**Ante cualquier duda sobre el estado de tu cuenta, tus cobros o tus retiros**, la fuente más confiable es siempre tu propia cuenta en mercadopago.cl (sección Ayuda) — las condiciones y comisiones pueden cambiar con el tiempo.

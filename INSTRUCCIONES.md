# RadioCalc Clinical — Instrucciones paso a paso

Esta guía está pensada para alguien que **no programa**. Vas a hacer todo copiando y pegando comandos en una terminal. No hace falta entender el código.

Este proyecto es la misma app RadioCalc (las mismas calculadoras, textos, esquemas y referencias) pero reorganizada como un proyecto "de verdad": se puede instalar en el celular como app (funciona sin internet) y se publica gratis en GitHub Pages.

## Índice

1. [Instalar las herramientas necesarias](#1-instalar-las-herramientas-necesarias)
2. [Descargar el proyecto en tu computadora](#2-descargar-el-proyecto-en-tu-computadora)
3. [Probar el sitio en tu computadora (antes de publicarlo)](#3-probar-el-sitio-en-tu-computadora-antes-de-publicarlo)
4. [Subir el proyecto a GitHub](#4-subir-el-proyecto-a-github)
5. [Ajustar el nombre del sitio (base path)](#5-ajustar-el-nombre-del-sitio-base-path)
6. [Activar GitHub Pages](#6-activar-github-pages)
7. [Ver tu sitio publicado](#7-ver-tu-sitio-publicado)
8. [Cómo actualizar el sitio en el futuro](#8-cómo-actualizar-el-sitio-en-el-futuro)
9. [Instalar RadioCalc como app en el celular](#9-instalar-radiocalc-como-app-en-el-celular)
10. [Problemas comunes](#10-problemas-comunes)

---

## 1. Instalar las herramientas necesarias

Necesitás dos programas gratuitos, una sola vez:

### a) Node.js

Node.js es el programa que "arma" el sitio a partir del código.

1. Andá a **https://nodejs.org**.
2. Descargá la versión que dice **LTS** (es la recomendada, la más estable). Elegí la versión para tu sistema operativo (Windows, Mac o Linux).
3. Instalala como cualquier programa (siguiente, siguiente, finalizar).
4. Para comprobar que quedó instalado, abrí una terminal:
   - **Windows**: buscá "Símbolo del sistema" o "PowerShell" en el menú de inicio.
   - **Mac**: buscá "Terminal" con Spotlight (Cmd + Espacio).
5. Escribí este comando y presioná Enter:
   ```
   node -v
   ```
   Si ves algo como `v20.x.x` o `v22.x.x`, está instalado correctamente.

### b) Git

Git es el programa que sube tu proyecto a GitHub.

1. Andá a **https://git-scm.com/downloads** y descargá la versión para tu sistema operativo.
2. Instalalo con las opciones que vienen por defecto (siguiente, siguiente, finalizar).
3. En la terminal, comprobá que quedó instalado:
   ```
   git --version
   ```

### c) Una cuenta de GitHub

Si todavía no tenés una, creala gratis en **https://github.com/signup**.

---

## 2. Descargar el proyecto en tu computadora

1. Descomprimí el archivo `.zip` que te compartí (por ejemplo, en tu carpeta de Documentos o Escritorio). Va a quedar una carpeta llamada `radiocalc-vite`.
2. Abrí la terminal y andá a esa carpeta. Por ejemplo, si la dejaste en el Escritorio:
   ```
   cd Desktop/radiocalc-vite
   ```
   (En Windows puede ser `cd Desktop\radiocalc-vite` o similar, según dónde la hayas puesto.)
3. Instalá las dependencias del proyecto (las "piezas" que arman el sitio). Esto se hace **una sola vez** (y de nuevo si en el futuro cambian las dependencias):
   ```
   npm install
   ```
   Este comando puede tardar uno o dos minutos. Vas a ver que aparece una carpeta nueva llamada `node_modules` — es normal, ahí quedan esas piezas.

---

## 3. Probar el sitio en tu computadora (antes de publicarlo)

Para ver la app funcionando antes de subirla a internet:

```
npm run dev
```

Vas a ver algo como:

```
➜  Local:   http://localhost:5173/radiocalc/
```

Abrí esa dirección en tu navegador (Chrome, Firefox, etc.) y ahí vas a ver RadioCalc funcionando igual que antes: buscador, calculadoras, modo oscuro, cambio de idioma.

Para detener la prueba, volvé a la terminal y presioná `Ctrl + C`.

> Nota: en este modo de prueba (`npm run dev`) el service worker (la parte que permite usar la app sin internet) está desactivado a propósito, para que los cambios se vean al instante mientras trabajás. El modo sin conexión se activa en el sitio ya publicado (o corriendo `npm run build` + `npm run preview`, ver más abajo).

---

## 4. Subir el proyecto a GitHub

1. Andá a **https://github.com/new** para crear un repositorio nuevo.
2. Ponele un nombre corto, por ejemplo `radiocalc`. **Anotá el nombre que elegiste**, porque lo vas a necesitar en el paso 5.
3. Dejalo como **público** (para que GitHub Pages pueda publicarlo gratis) y **no** marques ninguna casilla de "agregar README" (ya tenemos uno).
4. Hacé clic en "Create repository".
5. GitHub te va a mostrar unos comandos bajo el título "…or push an existing repository from the command line". Volvé a tu terminal (en la carpeta `radiocalc-vite`) y ejecutá, uno por uno:
   ```
   git init
   git add .
   git commit -m "Primera versión de RadioCalc"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/radiocalc.git
   git push -u origin main
   ```
   Reemplazá `TU-USUARIO` y `radiocalc` por tu usuario real de GitHub y el nombre que le pusiste al repositorio (GitHub te muestra la línea exacta para copiar, con tus datos ya puestos).
6. Es posible que la primera vez te pida iniciar sesión en GitHub desde la terminal o el navegador. Seguí las indicaciones en pantalla.

---

## 5. Ajustar el nombre del sitio (base path)

GitHub Pages publica tu sitio en una dirección con esta forma:

```
https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/
```

Para que todo funcione (imágenes, buscador, ícono, modo sin conexión), el proyecto necesita saber ese `NOMBRE-DEL-REPOSITORIO` de antemano.

1. Abrí el archivo `vite.config.js` (con el Bloc de notas, TextEdit, o cualquier editor de texto) que está en la carpeta del proyecto.
2. Buscá esta línea, cerca del principio:
   ```js
   const BASE_PATH = '/radiocalc/';
   ```
3. Si le pusiste al repositorio el nombre `radiocalc`, no hay que tocar nada. Si le pusiste otro nombre, cambialo para que coincida exactamente, con las barras `/` al principio y al final. Por ejemplo, si tu repositorio se llama `mis-calculadoras`:
   ```js
   const BASE_PATH = '/mis-calculadoras/';
   ```
4. **Caso especial**: si tu repositorio se llama exactamente `TU-USUARIO.github.io` (el repositorio "personal" de GitHub Pages), usá en cambio:
   ```js
   const BASE_PATH = '/';
   ```
5. Guardá el archivo. Si hiciste algún cambio, subilo a GitHub:
   ```
   git add .
   git commit -m "Ajustar base path"
   git push
   ```

---

## 6. Activar GitHub Pages

1. En GitHub, andá a tu repositorio → pestaña **Settings** (Configuración).
2. En el menú de la izquierda, hacé clic en **Pages**.
3. Donde dice **Source** (Origen), elegí **GitHub Actions** (no "Deploy from a branch").
4. Con eso alcanza. El proyecto ya incluye un archivo (`.github/workflows/deploy.yml`) que le dice a GitHub: "cada vez que suban cambios, compilá el sitio y publicalo solo".
5. Andá a la pestaña **Actions** de tu repositorio. Vas a ver que ya se disparó automáticamente un proceso llamado "Publicar en GitHub Pages" (por el `git push` que hiciste antes). Esperá a que el ícono se ponga en verde con un tilde ✓ (suele tardar uno o dos minutos).

---

## 7. Ver tu sitio publicado

Una vez que el proceso de Actions terminó en verde, tu sitio ya está online en:

```
https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/
```

(La misma dirección que armaste en el paso 5, pero con tu usuario y el nombre real.)

También podés confirmarlo en Settings → Pages: GitHub te muestra ahí el link exacto ("Your site is live at...").

---

## 8. Cómo actualizar el sitio en el futuro

Esta es la parte más simple. Cada vez que quieras cambiar algo (corregir un texto, agregar una calculadora, etc.):

1. Editá los archivos que necesites dentro de la carpeta `radiocalc-vite/src`.
2. (Opcional pero recomendado) Probá los cambios localmente con `npm run dev` antes de publicar.
3. Subí los cambios a GitHub:
   ```
   git add .
   git commit -m "Descripción breve del cambio"
   git push
   ```
4. Listo. GitHub Actions va a compilar y publicar la nueva versión automáticamente (podés ver el progreso en la pestaña "Actions"). En uno o dos minutos el sitio queda actualizado.

Como la app funciona sin conexión (PWA), las personas que ya la tenían abierta van a ver un aviso sutil de **"Nueva versión disponible · Actualizar"** la próxima vez que abran la app con internet — no se les actualiza sola de golpe, para no interrumpirlas en medio de una consulta.

No hace falta repetir `npm install` salvo que el archivo `package.json` haya cambiado (por ejemplo, si en el futuro agregás una librería nueva).

---

## 9. Instalar RadioCalc como app en el celular

Una vez publicado:

- **Android (Chrome)**: abrí el link del sitio, tocá el menú (⋮) y elegí "Instalar aplicación" o "Agregar a pantalla de inicio".
- **iPhone/iPad (Safari)**: abrí el link, tocá el botón de compartir (□ con una flecha) y elegí "Agregar a pantalla de inicio".

Con eso queda un ícono como el de cualquier app, y funciona sin conexión a internet una vez que se abrió por primera vez.

---

## 10. Problemas comunes

**El sitio publicado se ve en blanco, o las calculadoras no cargan.**
Casi siempre es el `BASE_PATH` del paso 5, que no coincide con el nombre real del repositorio. Revisá que sea exactamente `/nombre-del-repositorio/` (con las dos barras).

**El proceso en la pestaña "Actions" aparece en rojo (falló).**
Hacé clic sobre ese proceso para ver el detalle del error. Los motivos más comunes son: no se activó "GitHub Actions" como Source en Settings → Pages (paso 6), o el repositorio quedó como privado en un plan que no permite Pages gratis (hacelo público).

**`npm install` o `npm run dev` dan error de "comando no encontrado".**
Probablemente Node.js no quedó bien instalado, o hay que cerrar y volver a abrir la terminal después de instalarlo.

**Quiero probar el modo sin conexión (PWA) en mi computadora antes de publicar.**
Ejecutá:
```
npm run build
npm run preview
```
Abrí la dirección que te muestra (por ejemplo `http://localhost:4173/radiocalc/`), esperá unos segundos a que cargue, y después probá cortar el wifi: la app va a seguir funcionando.

**Ante cualquier otra duda**, revisá también el archivo `README.md` de este mismo proyecto, que explica cómo está organizado el código y cómo agregar una calculadora nueva.

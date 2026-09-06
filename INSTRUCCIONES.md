# RadioCalc Clinical — Instrucciones paso a paso

Esta guía está pensada para alguien que **no programa**. Todo se hace copiando y pegando comandos en una terminal. No hace falta entender el código.

Este proyecto es la misma app RadioCalc (las mismas calculadoras, textos, esquemas y referencias) pero reorganizada como un proyecto "de verdad": se puede instalar en el celular como app (funciona sin internet) y se publica gratis en GitHub Pages.

## Índice

1. [Instalar las herramientas necesarias](#1-instalar-las-herramientas-necesarias)
2. [Descargar el proyecto en la computadora](#2-descargar-el-proyecto-en-la-computadora)
3. [Probar el sitio en la computadora (antes de publicarlo)](#3-probar-el-sitio-en-la-computadora-antes-de-publicarlo)
4. [Subir el proyecto a GitHub](#4-subir-el-proyecto-a-github)
5. [Ajustar el nombre del sitio (base path)](#5-ajustar-el-nombre-del-sitio-base-path)
6. [Activar GitHub Pages](#6-activar-github-pages)
7. [Ver el sitio publicado](#7-ver-el-sitio-publicado)
8. [Cómo actualizar el sitio en el futuro](#8-cómo-actualizar-el-sitio-en-el-futuro)
9. [Instalar RadioCalc como app en el celular](#9-instalar-radiocalc-como-app-en-el-celular)
10. [Problemas comunes](#10-problemas-comunes)

---

## 1. Instalar las herramientas necesarias

Se necesitan dos programas gratuitos, una sola vez:

### a) Node.js

Node.js es el programa que "arma" el sitio a partir del código.

1. Ingrese a **https://nodejs.org**.
2. Descargue la versión que dice **LTS** (es la recomendada, la más estable), para el sistema operativo correspondiente (Windows, Mac o Linux).
3. Instálela como cualquier programa (siguiente, siguiente, finalizar).
4. Para comprobar que quedó instalada, abra una terminal:
   - **Windows**: busque "Símbolo del sistema" o "PowerShell" en el menú de inicio.
   - **Mac**: busque "Terminal" con Spotlight (Cmd + Espacio).
5. Escriba este comando y presione Enter:
   ```
   node -v
   ```
   Si aparece algo como `v20.x.x` o `v22.x.x`, quedó instalado correctamente.

### b) Git

Git es el programa que sube el proyecto a GitHub.

1. Ingrese a **https://git-scm.com/downloads** y descargue la versión para el sistema operativo correspondiente.
2. Instálelo con las opciones por defecto (siguiente, siguiente, finalizar).
3. En la terminal, compruebe que quedó instalado:
   ```
   git --version
   ```

### c) Una cuenta de GitHub

Si todavía no hay una, se puede crear gratis en **https://github.com/signup**.

---

## 2. Descargar el proyecto en la computadora

1. Descomprima el archivo `.zip` compartido (por ejemplo, en la carpeta de Documentos o Descargas). Va a quedar una carpeta llamada `radiocalc-vite`.
2. Abra la terminal y escriba `cd ` (con un espacio al final, sin presionar Enter todavía). Luego **arrastre la carpeta `radiocalc-vite` desde el explorador de archivos directamente hacia la ventana de la terminal**: la ruta completa se escribe sola. Presione Enter.
   > Este truco de arrastrar la carpeta evita tener que escribir la ruta a mano, que cambia según dónde se haya guardado el proyecto en cada computadora.
3. Instale las dependencias del proyecto (las "piezas" que arman el sitio). Esto se hace **una sola vez** (y de nuevo solo si en el futuro cambian las dependencias):
   ```
   npm install
   ```
   Este comando puede tardar uno o dos minutos. Va a aparecer una carpeta nueva llamada `node_modules` — es normal, ahí quedan esas piezas.

---

## 3. Probar el sitio en la computadora (antes de publicarlo)

Para ver la app funcionando antes de subirla a internet:

```
npm run dev
```

Va a aparecer algo como:

```
➜  Local:   http://localhost:5173/radiocalc/
```

Abra esa dirección en el navegador (Chrome, Firefox, etc.) y ahí se ve RadioCalc funcionando igual que antes: buscador, calculadoras, modo oscuro, cambio de idioma.

Para detener la prueba, vuelva a la terminal y presione `Ctrl + C`.

> Nota: en este modo de prueba (`npm run dev`) el service worker (la parte que permite usar la app sin internet) está desactivado a propósito, para que los cambios se vean al instante mientras se trabaja. El modo sin conexión se activa en el sitio ya publicado (o corriendo `npm run build` + `npm run preview`, ver sección 10).

---

## 4. Subir el proyecto a GitHub

1. Ingrese a **https://github.com/new** para crear un repositorio nuevo.
2. Póngale un nombre corto, por ejemplo `radiocalc`. **Anote el nombre elegido**, porque se necesita en el paso 5.
3. Déjelo como **público** (para que GitHub Pages pueda publicarlo gratis) y **no** marque ninguna casilla de "agregar README" (ya hay uno).
4. Haga clic en "Create repository".
5. Si es la **primera vez que se usa Git** en esta computadora, hay que indicarle quién es (una sola vez, sirve para todos los proyectos futuros). Ejecute estas dos líneas, con el email real de GitHub:
   ```
   git config --global user.email "tu-email@ejemplo.com"
   git config --global user.name "Tu Nombre"
   ```
6. GitHub muestra unos comandos bajo el título "…or push an existing repository from the command line". Vuelva a la terminal (dentro de la carpeta `radiocalc-vite`) y ejecute los siguientes comandos **de a uno, presionando Enter después de cada línea** (si se pegan las seis líneas juntas de una sola vez, algunas terminales las juntan en un solo renglón y da error):
   ```
   git init
   git add .
   git commit -m "Primera versión de RadioCalc"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/radiocalc.git
   git push -u origin main
   ```
   Reemplace `TU-USUARIO` y `radiocalc` por el usuario real de GitHub y el nombre elegido para el repositorio (GitHub muestra la línea exacta para copiar, con esos datos ya puestos).
   > Si la carpeta descomprimida ya traía una carpeta oculta `.git` (por ejemplo, por haber sido descargada desde otro repositorio previamente), `git init` no la reemplaza y puede aparecer el error `fatal: refusing to merge unrelated histories` al hacer `git push`. Si eso ocurre, lo más simple es borrar esa carpeta oculta `.git` antes de empezar este paso y repetir desde `git init`.
7. Es posible que la primera vez GitHub pida iniciar sesión desde la terminal o el navegador. Ver el punto sobre autenticación en la sección 10 si en vez de una ventana del navegador aparece un pedido de contraseña en la terminal.

---

## 5. Ajustar el nombre del sitio (base path)

GitHub Pages publica el sitio en una dirección con esta forma (dentro de una "subcarpeta" con el nombre del repositorio):

```
https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/
```

Para que todo funcione ahí (imágenes, buscador, ícono, modo sin conexión), el proyecto necesita conocer ese `NOMBRE-DEL-REPOSITORIO` en el momento de compilarse. Esto ya está resuelto automáticamente:

- `vite.config.js` usa `/` (la raíz) por defecto — funciona tal cual para Vercel, Netlify, un dominio propio, o un repositorio "personal" `TU-USUARIO.github.io`.
- El archivo `.github/workflows/deploy.yml` le indica a GitHub Actions, **solo durante la publicación en GitHub Pages**, que use `/NOMBRE-DEL-REPOSITORIO/` en su lugar (sin tocar `vite.config.js`).

**Lo único que hay que revisar** es que ese nombre, dentro de `.github/workflows/deploy.yml`, coincida exactamente (mayúsculas incluidas) con el nombre real del repositorio en GitHub:

1. Abra `.github/workflows/deploy.yml` con un editor de texto simple (Bloc de notas en Windows, TextEdit en Mac).
2. Busque esta línea:
   ```yaml
   VITE_BASE_PATH: /RadCalc/
   ```
3. Si el repositorio se llama distinto, cambie `RadCalc` por el nombre real, respetando mayúsculas/minúsculas, con las barras `/` al principio y al final.
4. Guarde el archivo.
   > Atención en Windows: el Bloc de notas a veces guarda el archivo como `deploy.yml.txt` en vez de `deploy.yml` (agrega la extensión sin avisar). Si eso pasa, GitHub Actions no va a encontrar el archivo y el deploy falla sin un error claro. Al guardar, verifique en "Guardar como" que el tipo de archivo sea "Todos los archivos" y que el nombre termine exactamente en `.yml`.
5. Si se hizo algún cambio, súbalo a GitHub:
   ```
   git add .
   git commit -m "Ajustar base path"
   git push
   ```

> Si en el futuro este mismo proyecto se publica en otro lado además de GitHub Pages (Vercel, Netlify, etc.), no hace falta tocar nada: al no definirse `VITE_BASE_PATH` en esos otros servicios, usan automáticamente `/`, que es lo correcto porque esos servicios publican en la raíz del dominio.

---

## 6. Activar GitHub Pages

1. En GitHub, vaya al repositorio → pestaña **Settings** (Configuración).
2. En el menú de la izquierda, haga clic en **Pages**.
3. Donde dice **Source** (Origen), elija **GitHub Actions** (no "Deploy from a branch").
4. Con eso alcanza. El proyecto ya incluye un archivo (`.github/workflows/deploy.yml`) que le indica a GitHub: "cada vez que se suban cambios, compilar el sitio y publicarlo automáticamente".
5. Vaya a la pestaña **Actions** del repositorio. Ahí se ve que ya se disparó automáticamente un proceso llamado "Publicar en GitHub Pages" (por el `git push` anterior). Espere a que el ícono se ponga en verde con un tilde ✓ (suele tardar uno o dos minutos).

---

## 7. Ver el sitio publicado

Una vez que el proceso de Actions terminó en verde, el sitio ya está online en:

```
https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/
```

(La misma dirección armada en el paso 5, pero con el usuario y el nombre reales.)

También se puede confirmar en Settings → Pages: GitHub muestra ahí el link exacto ("Your site is live at...").

---

## 8. Cómo actualizar el sitio en el futuro

Esta es la parte más simple. Cada vez que se quiera cambiar algo (corregir un texto, agregar una calculadora, etc.):

1. Edite los archivos necesarios dentro de la carpeta `radiocalc-vite/src`.
2. (Opcional pero recomendado) Pruebe los cambios localmente con `npm run dev` antes de publicar.
3. Suba los cambios a GitHub:
   ```
   git add .
   git commit -m "Descripción breve del cambio"
   git push
   ```
4. Listo. GitHub Actions va a compilar y publicar la nueva versión automáticamente (se puede ver el progreso en la pestaña "Actions"). En uno o dos minutos el sitio queda actualizado.

Como la app funciona sin conexión (PWA), quienes ya la tenían abierta van a ver un aviso sutil de **"Nueva versión disponible · Actualizar"** la próxima vez que abran la app con internet — no se actualiza sola de golpe, para no interrumpir en medio de una consulta. Si después de subir un cambio el sitio se sigue viendo igual que antes, ver la nota sobre caché de la PWA en la sección 10.

No hace falta repetir `npm install` salvo que el archivo `package.json` haya cambiado (por ejemplo, si en el futuro se agrega una librería nueva).

---

## 9. Instalar RadioCalc como app en el celular

Una vez publicado:

- **Android (Chrome)**: abra el link del sitio, toque el menú (⋮) y elija "Instalar aplicación" o "Agregar a pantalla de inicio".
- **iPhone/iPad (Safari)**: abra el link, toque el botón de compartir (□ con una flecha) y elija "Agregar a pantalla de inicio".

Con eso queda un ícono como el de cualquier app, y funciona sin conexión a internet una vez que se abrió por primera vez.

---

## 10. Problemas comunes

**`git push` pide contraseña y da error "Support for password authentication was removed".**
GitHub ya no acepta la contraseña habitual de la cuenta en la terminal. Al ejecutar `git push` debería abrirse una ventana del navegador para autorizar el acceso; si no aparece y la terminal pide una contraseña directamente, hay que generar un "Personal Access Token" (PAT) en GitHub (Settings → Developer settings → Personal access tokens) y usar ese código en lugar de la contraseña.

**El sitio publicado se ve en blanco, o las calculadoras no cargan.**
Casi siempre es el `BASE_PATH` del paso 5, que no coincide con el nombre real del repositorio. Revise que sea exactamente `/nombre-del-repositorio/` (con las dos barras).

**Se subieron los cambios pero en el celular o el navegador se sigue viendo la versión anterior.**
Al ser una PWA, la app guarda una copia en caché para que cargue al instante, incluso sin internet. Busque el aviso flotante "Nueva versión disponible · Actualizar" y tóquelo; si no aparece, cierre la app o la pestaña por completo y vuelva a abrirla con internet. En la computadora también se puede forzar la recarga con `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac).

**El proceso en la pestaña "Actions" aparece en rojo (falló).**
Haga clic sobre ese proceso para ver el detalle del error. Los motivos más comunes son: no se activó "GitHub Actions" como Source en Settings → Pages (paso 6), el repositorio quedó como privado en un plan que no permite Pages gratis (hacerlo público), o el archivo `.github/workflows/deploy.yml` quedó guardado con una extensión distinta a `.yml` (ver nota en el paso 5).

**`npm install` o `npm run dev` dan error de "comando no encontrado".**
Probablemente Node.js no quedó bien instalado, o hay que cerrar y volver a abrir la terminal después de instalarlo.

**`git commit` dice "Author identity unknown" / "Please tell me who you are".**
Es la primera vez que se usa Git en esta computadora y todavía no se indicó el nombre y el email. Ejecute una sola vez:
```
git config --global user.email "tu-email@ejemplo.com"
git config --global user.name "Tu Nombre"
```
y vuelva a correr el `git commit`.

**Aparece el error `fatal: not a git repository (or any of the parent directories)`.**
Ocurre cuando se ejecutan comandos de Git desde una terminal que no está ubicada dentro de la carpeta del proyecto (por ejemplo, después de cerrar y volver a abrir la terminal). Vuelva a entrar a la carpeta con `cd ` y arrastrando la carpeta `radiocalc-vite`, como en el paso 2, y reintente el comando.

**Al pegar los comandos de `git init` / `git add` / etc. da error de "unknown switch" o parece que se ejecutó todo junto.**
Se pegaron varias líneas de una sola vez y la terminal las juntó en un solo renglón. Solución: pegue o escriba **una línea por vez**, presionando Enter después de cada una, en vez de pegar el bloque completo.

**Se quiere probar el modo sin conexión (PWA) en la computadora antes de publicar.**
Ejecute:
```
npm run build
npm run preview
```
Abra la dirección que se muestra (por ejemplo `http://localhost:4173/radiocalc/`), espere unos segundos a que cargue, y después pruebe cortar el wifi: la app va a seguir funcionando.

**Ante cualquier otra duda**, revisar también el archivo `README.md` de este mismo proyecto, que explica cómo está organizado el código y cómo agregar una calculadora nueva.

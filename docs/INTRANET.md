# RadioCalc Clinical: instalación en intranet

Autor: Dr. Joaquín Hevia M. (drjoaquinhevia@gmail.com) - https://radiocalc.app

## 1. Primera opción: enlace directo a radiocalc.app

Si los computadores pueden abrir https://radiocalc.app (o TI puede autorizar
solo ese dominio), POR FAVOR USAR UN ENLACE DIRECTO y no instalar esta copia.
Así siempre se ve la versión vigente y las correcciones llegan solas.

La copia local es para redes que no pueden llegar a ese dominio.

## 2. Instalar la copia local

1. Descomprimir el ZIP y copiar la carpeta `radiocalc` completa al servidor web.
   Puede quedar en cualquier ruta, por ejemplo /radiocalc/.
2. Abrir esa dirección terminada en "/" (http://servidor/radiocalc/).
3. Enlazarla desde la app o sitio del servicio, en una pestaña nueva.

- Son archivos estáticos: no necesita base de datos, backend ni internet.
- Funciona con HTTP o HTTPS; no funciona abriendo index.html con doble clic.
- No requiere reglas de reescritura: las rutas usan # (por ejemplo
  /radiocalc/#/es/calc/tirads/ abre directo TI-RADS).
- Navegadores: Chrome o Edge actualizados. No sirve Internet Explorer.
- El servidor debe entregar los .js como text/javascript.
- Conviene servir index.html con "Cache-Control: no-cache", para que los
  equipos tomen la versión nueva apenas se reemplaza.
- Si se usa un iframe, que sea del mismo dominio; si no, copiar el informe
  puede fallar.
- Los cálculos se hacen en el navegador; la copia no trae analítica.

## 3. Actualizar

1. Borrar la carpeta `radiocalc` anterior y copiar la nueva completa (no mezclar).
2. Recargar y confirmar que la franja superior muestre la nueva versión.

La copia NO se actualiza sola. Las versiones marcadas [URGENTE] corrigen
contenido clínico: instalarlas lo antes posible o retirar el acceso mientras tanto.

## 4. Recibir avisos de versiones nuevas

En https://github.com/joaquinheviam/RadCalc (con una cuenta de GitHub):
Watch -> Custom -> Releases -> Apply. Con las notificaciones por correo activas,
GitHub avisa de cada versión, con el ZIP y los cambios clínicos.
Sin cuenta: suscribirse por RSS a
https://github.com/joaquinheviam/RadCalc/releases.atom

## 5. Lo que se pide mantener

Usar la carpeta completa y sin modificar: fórmulas, textos, referencias, logo,
autoría, agradecimientos y advertencia de uso. Es material de apoyo y no
reemplaza el juicio clínico. Errores o dudas: drjoaquinhevia@gmail.com

## 6. Para quien mantiene RadioCalc

- Compilar en el computador: `npm run build:intranet` (queda en dist-intranet/).
- Publicar y avisar: GitHub -> Actions -> "Publicar versión intranet" -> Run
  workflow (rama main). Elegir "Corrección urgente" si corrige contenido clínico.

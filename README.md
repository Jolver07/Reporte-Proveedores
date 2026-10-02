# Reporte de compras por proveedor (con datos compartidos)

Tú cargas el Excel de **Seguimiento de Solpeds** una vez y queda guardado en Cloudflare. Cualquier persona que abra el enlace ve el reporte al instante, sin cargar nada, con filtros por fecha, vistas por proveedor / forma de pago / OC, y opciones para copiar o exportar a Excel.

> **GitHub Pages no sirve para esta versión**: solo publica páginas estáticas y no puede guardar datos. GitHub se usa para alojar el código y Cloudflare para publicarlo.

## Cómo funciona

| Quién | Enlace | Qué ve |
|---|---|---|
| Visitante | `https://reporte-compras.pages.dev` | El reporte con los últimos datos publicados. No ve ningún botón de carga. |
| Administrador | `https://reporte-compras.pages.dev/?admin` | Botón **Actualizar datos**: carga el Excel, escribe la clave de carga y queda publicado. |

- El Excel se procesa en el navegador del administrador. A Cloudflare solo se sube el resumen por OC (unos 2–3 MB), no el archivo original.
- Cada carga **reemplaza** los datos anteriores.
- Sin la clave de carga nadie puede modificar los datos, aunque conozca el enlace `?admin`.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La aplicación (HTML, CSS y JS en un solo archivo). |
| `functions/api/data.js` | Función de Cloudflare que guarda (`PUT`) y entrega (`GET`) los datos. |
| `_headers`, `robots.txt` | Cabeceras de seguridad y bloqueo de buscadores. |
| `.gitignore` | Evita subir archivos `.xlsx` / `.csv` al repositorio. |

## Puesta en marcha (una sola vez)

### 1. Sube el código a GitHub
Crea un repositorio (privado o público: el código no contiene datos) y sube todos los archivos, **incluida la carpeta `functions`**.

### 2. Crea el proyecto en Cloudflare Pages
**Workers & Pages → Create → Pages → Connect to Git**, elige el repositorio.
Framework preset: **None** · Build command: vacío · Build output directory: `/`. Luego **Save and Deploy**.

> La subida por arrastre ("Upload assets") **no** ejecuta la carpeta `functions`. Usa la conexión con Git, o Wrangler:
> `npx wrangler pages deploy . --project-name=reporte-compras`

### 3. Crea el almacén de datos (KV)
**Storage & Databases → KV → Create a namespace**, nombre: `reporte-compras-datos`.

### 4. Enlaza el KV al proyecto
En el proyecto de Pages: **Settings → Bindings → Add → KV namespace**.
Variable name: `REPORTE` (exactamente así) · KV namespace: `reporte-compras-datos`.
Hazlo en **Production** (y en **Preview** si usarás versiones de prueba).

### 5. Define la clave de carga
**Settings → Variables and Secrets → Add**.
Type: **Secret** · Variable name: `UPLOAD_TOKEN` · Value: una clave larga que solo tú conozcas (20 caracteres o más, mezclando letras y números).

### 6. Vuelve a desplegar
Los enlaces y secretos se aplican en el siguiente despliegue: **Deployments → … → Retry deployment**, o haz cualquier commit.

### 7. Publica los primeros datos
Abre `https://TU-PROYECTO.pages.dev/?admin`, pulsa **Elegir archivo**, carga el Excel y escribe la clave. Al terminar verás "actualizado dd/mm/aaaa hh:mm". Desde ese momento, el enlace sin `?admin` muestra el reporte a cualquiera.

## Actualizar los datos
Entra a `/?admin`, pulsa **Actualizar datos** y carga el nuevo Excel. La clave se recuerda mientras la pestaña esté abierta.

## Restringir quién puede ver el reporte
Como ahora los datos quedan guardados en línea, **conviene proteger el sitio con Cloudflare Access**: Zero Trust → Access → Applications → Self-hosted, dominios `TU-PROYECTO.pages.dev` y `*.TU-PROYECTO.pages.dev`, política *Allow* para los correos autorizados. Access protege también la ruta `/api/data`, así que nadie sin acceso puede descargar los datos directamente.

## Columnas que necesita el Excel
Obligatorias: `OC ERP`, `Fecha OC`, `Proveedor`, `Término de pago`, `Estado`, `Subtotal`, `P.U. Final`, `Cant. Ingreso`.
Opcionales: `Compañía`, `Categoría`, `Convenio`, `Cotización`, `Comprador(a)`.

## Costos
Con el plan gratuito de Cloudflare: Pages sin límite de visitas, Functions hasta 100 000 solicitudes al día, KV hasta 100 000 lecturas y 1 000 escrituras al día, y Access gratis hasta 50 usuarios. Para un reporte interno sobra. (Verifica los límites vigentes en cloudflare.com, pueden cambiar.)

## Solución de problemas

| Mensaje | Causa |
|---|---|
| "No se pudo obtener el reporte" | La carpeta `functions` no se desplegó (se usó "Upload assets") o el sitio se abrió como archivo local. |
| "Falta enlazar el KV namespace REPORTE" | Paso 4 incompleto, o falta redesplegar (paso 6). |
| "Falta configurar el secreto UPLOAD_TOKEN" | Paso 5 incompleto, o falta redesplegar. |
| "Clave incorrecta" | La clave escrita no coincide con `UPLOAD_TOKEN`. |

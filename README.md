# Reporte de compras por proveedor

Página estática que lee el Excel de **Seguimiento de Solpeds** y muestra, por proveedor, los dólares en orden de compra (subtotal) frente a los dólares ejecutados (P.U. final × cantidad ingresada a bodega), con forma de pago, filtros por fecha OC y exportación a Excel.

El archivo se procesa **en el navegador de quien lo abre**: no se sube a GitHub, Cloudflare ni a ningún servidor. La página publicada no contiene datos.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La aplicación completa (HTML, CSS y JS en un solo archivo). |
| `_headers` | Cabeceras de seguridad para Cloudflare Pages. |
| `robots.txt` | Evita que buscadores indexen la página. |
| `.gitignore` | Impide subir por error archivos `.xlsx` / `.csv` al repositorio. |

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser privado si tu plan lo permite para Pages; si no, público: la página no contiene datos).
2. Sube los archivos de esta carpeta: **Add file → Upload files**, arrastra todo y confirma con **Commit changes**.
   Por consola:
   ```bash
   git init
   git add .
   git commit -m "Reporte de compras por proveedor"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/reporte-compras.git
   git push -u origin main
   ```
3. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`, **Save**.
4. En uno o dos minutos la página queda en `https://TU_USUARIO.github.io/reporte-compras/`.

## Publicar en Cloudflare Pages

**Opción A — conectado a GitHub (se actualiza solo con cada cambio):**

1. En el panel de Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
2. Elige el repositorio creado arriba.
3. Configuración de build: *Framework preset* **None**, *Build command* vacío, *Build output directory* `/`.
4. **Save and Deploy**. Quedará en `https://reporte-compras.pages.dev`.

**Opción B — subida directa, sin GitHub:**

1. **Workers & Pages → Create → Pages → Upload assets**.
2. Ponle nombre al proyecto y arrastra esta carpeta (o un `.zip` con los archivos).
3. **Deploy site**.

O por consola con Wrangler:
```bash
npx wrangler pages deploy . --project-name=reporte-compras
```

### Restringir el acceso (recomendado)

Aunque la página no guarda datos, puedes limitar quién la abre con **Cloudflare Zero Trust → Access → Applications → Add an application → Self-hosted**, apuntando al dominio `*.pages.dev` del proyecto y permitiendo solo correos de tu empresa (por ejemplo `@naturisa.com`). Es gratis hasta 50 usuarios.

## Uso

1. Abre la página y arrastra el Excel exportado del sistema (o pulsa **Elegir archivo**).
2. Filtra por rango de fechas OC, compañía, forma de pago, categoría, convenio, comprador o estado.
3. Cambia la agrupación: **Por proveedor**, **Proveedor y forma de pago** (con subtotales) o **Por negociación (OC)**.
4. **Copiar tabla** para pegar en Excel con Ctrl+V (elige punto o coma decimal según tu Excel), o **Exportar a Excel** para descargar un `.xlsx` con los filtros anotados.

### Columnas que necesita el archivo

Obligatorias: `OC ERP`, `Fecha OC`, `Proveedor`, `Término de pago`, `Estado`, `Subtotal`, `P.U. Final`, `Cant. Ingreso`.
Opcionales: `Compañía`, `Categoría`, `Convenio`, `Cotización`, `Comprador(a)`.
Los nombres se reconocen sin importar mayúsculas, tildes o puntos. Se aceptan `.xlsx`, `.xls`, `.xlsm` y `.csv`.

## Requisitos

Navegador moderno (Chrome, Edge, Firefox, Safari) con internet para cargar la librería SheetJS desde cdnjs. Un archivo de ~25 MB tarda unos 15–25 segundos en procesarse.

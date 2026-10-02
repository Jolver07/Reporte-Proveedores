# Reporte de compras por proveedor — versión Cloudflare Worker

Tú cargas el Excel de Seguimiento de Solpeds una vez y queda guardado. Cualquiera que abra el enlace ve el reporte sin cargar nada.

- Visitantes: `https://reporte-proveedores.jolvera-dbb.workers.dev`
- Administrador: `https://reporte-proveedores.jolvera-dbb.workers.dev/?admin`

## Estructura del repositorio

```
wrangler.jsonc        configuración del Worker (datos, página y logs)
src/worker.js         guarda y entrega los datos (/api/data)
public/index.html     la página del reporte
public/_headers       cabeceras de seguridad
public/robots.txt     bloqueo de buscadores
.gitignore            evita subir archivos Excel/CSV
```

## Puesta en marcha

1. **Crea el almacén de datos.** Cloudflare → Storage & Databases → KV → Create a namespace → nombre `reporte-compras-datos`. Copia el **ID** que aparece en la lista.
2. **Pega el ID** en `wrangler.jsonc`, reemplazando `PEGA_AQUI_EL_ID_DEL_KV`. (El ID no es secreto.)
3. **Reemplaza los archivos del repositorio** por los de esta carpeta. Borra la carpeta `functions/` y el `index.html` de la raíz si existen: ahora la página vive en `public/`.
4. **Haz commit.** Cloudflare redespliega solo. Revisa en el Worker → Deployments que termine sin errores.
5. **Crea la clave de carga.** Worker → Settings → Variables and Secrets → Add → Type **Secret** → nombre `UPLOAD_TOKEN` → tu clave. Los secretos no se borran con los siguientes despliegues.
6. **Publica.** Abre `/?admin`, carga el Excel y escribe la clave. Debe aparecer "actualizado dd/mm/aaaa hh:mm". Si aparece "sin publicar", revisa el mensaje que salió abajo.
7. **Comprueba.** Abre `/api/data`: debe mostrar un texto largo que empieza con `{"d":`. Luego abre el enlace sin `?admin`. Si alguien la abrió antes de publicar, espera 1 minuto y recarga con Ctrl+F5 (KV tarda hasta 60 s en reflejar cambios).

## Por qué el binding va en wrangler.jsonc y no en el panel
Cada despliegue desde GitHub aplica lo que dice `wrangler.jsonc`. Si agregas el KV solo desde el panel, el siguiente commit lo quitaría. La clave sí va en el panel porque es un secreto y los secretos se conservan.

## Restringir el acceso
Cloudflare Zero Trust → Access → Applications → Self-hosted, dominio `reporte-proveedores.jolvera-dbb.workers.dev`, política *Allow* para los correos autorizados. Protege también `/api/data`.

## Solución de problemas

| Lo que ves | Causa |
|---|---|
| "No se pudo obtener el reporte" | El despliegue falló o `src/worker.js` no está en el repositorio. Revisa Deployments. |
| "Falta enlazar el KV namespace REPORTE" | Falta el paso 2, o el ID quedó mal pegado. |
| "Falta configurar el secreto UPLOAD_TOKEN" | Falta el paso 5. |
| "Clave incorrecta" | La clave no coincide con `UPLOAD_TOKEN` (revisa espacios). |
| El despliegue falla con "KV namespace not found" | El ID en `wrangler.jsonc` no corresponde a un namespace de tu cuenta. |

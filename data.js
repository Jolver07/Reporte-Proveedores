// Cloudflare Pages Function: guarda y entrega los datos del reporte.
// Requiere en el proyecto de Pages:
//   - un KV namespace enlazado con el nombre de variable REPORTE
//   - un secreto UPLOAD_TOKEN con la clave de carga
const KEY = 'reporte';
const MAX_BYTES = 24 * 1024 * 1024; // límite de KV: 25 MiB por valor

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

// Comparación en tiempo constante para no filtrar la clave por tiempos de respuesta
function sameText(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function onRequestGet({ env }) {
  if (!env.REPORTE) return json({ error: 'Falta enlazar el KV namespace REPORTE.' }, 500);
  const value = await env.REPORTE.get(KEY);
  if (!value) return json({ error: 'Todavía no hay datos publicados.' }, 404);
  return new Response(value, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function onRequestPut({ request, env }) {
  if (!env.REPORTE) return json({ error: 'Falta enlazar el KV namespace REPORTE.' }, 500);
  if (!env.UPLOAD_TOKEN) return json({ error: 'Falta configurar el secreto UPLOAD_TOKEN.' }, 500);

  const auth = request.headers.get('authorization') || '';
  if (!sameText(auth, 'Bearer ' + env.UPLOAD_TOKEN)) return json({ error: 'Clave incorrecta.' }, 401);

  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ error: 'Los datos superan 24 MB.' }, 413);

  let data;
  try { data = JSON.parse(text); } catch { return json({ error: 'El contenido no es JSON válido.' }, 400); }
  if (!data || typeof data.d !== 'object' || !Array.isArray(data.r) || !data.r.length) {
    return json({ error: 'El contenido no tiene el formato del reporte.' }, 400);
  }

  const uploadedAt = new Date().toISOString();
  data.meta = { name: String(data.meta?.name || 'Reporte').slice(0, 200), rows: data.r.length, uploadedAt };
  await env.REPORTE.put(KEY, JSON.stringify(data));
  return json({ ok: true, rows: data.r.length, uploadedAt });
}

export async function onRequest() {
  return json({ error: 'Método no permitido.' }, 405);
}

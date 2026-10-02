// Worker del reporte de compras por proveedor.
// - /api/data  GET: entrega los datos guardados en KV.
//              PUT: guarda nuevos datos (requiere la clave UPLOAD_TOKEN).
// - Todo lo demás: archivos de la carpeta public/ (index.html, etc.).
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

async function getData(env) {
  const value = await env.REPORTE.get(KEY);
  if (!value) return json({ error: 'Todavía no hay datos publicados.' }, 404);
  return new Response(value, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function putData(request, env) {
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/data') {
      if (!env.REPORTE) return json({ error: 'Falta enlazar el KV namespace REPORTE.' }, 500);
      if (request.method === 'GET') return getData(env);
      if (request.method === 'PUT') return putData(request, env);
      return json({ error: 'Método no permitido.' }, 405);
    }
    return env.ASSETS.fetch(request);
  },
};

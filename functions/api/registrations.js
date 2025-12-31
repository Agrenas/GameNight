export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "invalid_date" }, 400);

  const { results } = await env.DB.prepare(
    "SELECT name, created_at FROM registrations WHERE date = ? ORDER BY created_at ASC"
  ).bind(date).all();

  return json({ date, registrations: results });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const date = (body.date || "").trim();
  const name = (body.name || "").trim().replace(/\s+/g, " ");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "invalid_date" }, 400);
  if (name.length < 2 || name.length > 60) return json({ error: "invalid_name" }, 400);

  // (Optional) naive duplicate prevention: same name for same date
  const exists = await env.DB.prepare(
    "SELECT 1 FROM registrations WHERE date = ? AND lower(name) = lower(?) LIMIT 1"
  ).bind(date, name).first();

  if (exists) return json({ ok: true, already: true });

  await env.DB.prepare(
    "INSERT INTO registrations (date, name) VALUES (?, ?)"
  ).bind(date, name).run();

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

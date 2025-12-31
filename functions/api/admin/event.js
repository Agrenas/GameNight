export async function onRequestPost({ request, env }) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || "";
  if (token !== env.ADMIN_TOKEN) return json({ error: "unauthorized" }, 401);

  const body = await request.json().catch(() => ({}));
  const date = (body.date || "").trim();
  const notes = (body.notes || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "invalid_date" }, 400);

  // Ensure event exists
  await env.DB.prepare(
    "INSERT INTO events (date, notes) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET notes = excluded.notes"
  ).bind(date, notes).run();

  // Set active event
  await env.DB.prepare(
    "UPDATE active_event SET date = ?, updated_at = datetime('now') WHERE id = 1"
  ).bind(date).run();

  return json({ ok: true, date, notes });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

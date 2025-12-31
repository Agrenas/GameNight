export async function onRequestGet({ env }) {
  const row = await env.DB.prepare(
    "SELECT date FROM active_event WHERE id = 1"
  ).first();

  const date = row?.date || "2026-01-16";
  const evt = await env.DB.prepare(
    "SELECT date, notes FROM events WHERE date = ?"
  ).bind(date).first();

  return json({ date, notes: evt?.notes || "" });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

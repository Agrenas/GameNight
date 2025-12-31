export async function onRequestPost({ request, env }) {
  const { viewer_id, suggestion_id, value } = await request.json().catch(() => ({}));

  const vid = String(viewer_id || "").trim();
  const sid = Number(suggestion_id);
  const v = Number(value);

  if (!vid || vid.length > 80) return json({ error: "invalid_viewer" }, 400);
  if (!Number.isInteger(sid) || sid <= 0) return json({ error: "invalid_suggestion" }, 400);
  if (![-1,0,1].includes(v)) return json({ error: "invalid_value" }, 400);

  // Upsert vote
  await env.DB.prepare(`
    INSERT INTO votes (suggestion_id, viewer_id, value)
    VALUES (?, ?, ?)
    ON CONFLICT(suggestion_id, viewer_id) DO UPDATE SET value = excluded.value
  `).bind(sid, vid, v).run();

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

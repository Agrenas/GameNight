export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "invalid_date" }, 400);

  // Aggregate votes: sum(value)
  const { results } = await env.DB.prepare(`
    SELECT s.*,
      COALESCE(SUM(v.value), 0) AS score
    FROM suggestions s
    LEFT JOIN votes v ON v.suggestion_id = s.id
    WHERE s.date = ?
    GROUP BY s.id
    ORDER BY score DESC, s.created_at DESC
  `).bind(date).all();

  return json({ date, suggestions: results });
}

export async function onRequestPost({ request, env }) {
  const b = await request.json().catch(() => ({}));

  const date = (b.date || "").trim();
  const title = (b.title || "").trim();
  const difficulty = Number(b.difficulty);
  const needsHost = b.needs_host ? 1 : 0;
  const playersNoHost = (b.players_no_host || "").trim();
  const gameType = (b.game_type || "").trim();
  const description = (b.description || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "invalid_date" }, 400);
  if (title.length < 2 || title.length > 80) return json({ error: "invalid_title" }, 400);
  if (![1,2,3].includes(difficulty)) return json({ error: "invalid_difficulty" }, 400);
  if (!playersNoHost || playersNoHost.length > 20) return json({ error: "invalid_players" }, 400);
  if (!["coop","comp"].includes(gameType)) return json({ error: "invalid_type" }, 400);
  if (description.length < 3 || description.length > 280) return json({ error: "invalid_description" }, 400);

  // Optional: prevent duplicate title per date
  const dup = await env.DB.prepare(
    "SELECT 1 FROM suggestions WHERE date = ? AND lower(title) = lower(?) LIMIT 1"
  ).bind(date, title).first();

  if (dup) return json({ ok: true, duplicate: true });

  const res = await env.DB.prepare(`
    INSERT INTO suggestions (date, title, difficulty, needs_host, players_no_host, game_type, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(date, title, difficulty, needsHost, playersNoHost, gameType, description).run();

  return json({ ok: true, id: res.meta.last_row_id });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

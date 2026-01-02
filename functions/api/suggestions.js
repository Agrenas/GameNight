import { json, badRequest, normalize, requireAdmin } from "./_util.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, title, difficulty, host, players, game_type, description, score, created_at " +
      "FROM suggestions ORDER BY score DESC, created_at DESC"
  ).all();

  // match your frontend naming (desc)
  const rows = results.map((r) => ({
    id: r.id,
    title: r.title,
    difficulty: r.difficulty,
    host: r.host,
    players: r.players,
    type: r.game_type,
    desc: r.description || "",
    score: r.score,
    createdAt: r.created_at,
  }));

  return json({ rows });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));

  const id = String(body.id || "").trim();
  const title = String(body.title || "").trim();
  const difficulty = Number(body.difficulty);
  const host = String(body.host || "").trim();
  const players = String(body.players || "").trim();
  const type = String(body.type || "").trim();
  const desc = String(body.desc || "").trim();

  if (!id) return badRequest("missing_id", 400);
  if (title.length < 2) return badRequest("invalid_title", 400);
  if (!Number.isFinite(difficulty)) return badRequest("invalid_difficulty", 400);
  if (!host) return badRequest("invalid_host", 400);
  if (!players) return badRequest("invalid_players", 400);
  if (!type) return badRequest("invalid_type", 400);

  const titleNorm = normalize(title);

  try {
    await env.DB.prepare(
      "INSERT INTO suggestions (id, title, title_norm, difficulty, host, players, game_type, description) " +
        "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
    )
      .bind(id, title, titleNorm, difficulty, host, players, type, desc)
      .run();
  } catch {
    return badRequest("game_exists", 409);
  }

  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  if (!requireAdmin(request, env)) return badRequest("unauthorized", 401);

  await env.DB.prepare("DELETE FROM suggestions").run();
  return json({ ok: true });
}

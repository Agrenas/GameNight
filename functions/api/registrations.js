import { json, badRequest, isValidDate, normalize, requireAdmin } from "./_util.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const date = (url.searchParams.get("date") || "").trim();

  if (!isValidDate(date)) return badRequest("invalid_date", 400);

  const { results } = await env.DB.prepare(
    "SELECT name, created_at AS ts FROM registrations WHERE event_date = ?1 ORDER BY id ASC"
  )
    .bind(date)
    .all();

  return json({ date, registrations: results });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const date = (body.date || "").trim();
  const name = String(body.name || "").trim().replace(/\s+/g, " ");

  if (!isValidDate(date)) return badRequest("invalid_date", 400);
  if (name.length < 2 || name.length > 60) return badRequest("invalid_name", 400);

  const nameNorm = normalize(name);

  try {
    await env.DB.prepare(
      "INSERT INTO registrations (event_date, name, name_norm) VALUES (?1, ?2, ?3)"
    )
      .bind(date, name, nameNorm)
      .run();
  } catch {
    // UNIQUE(event_date, name_norm)
    return badRequest("already_registered", 409);
  }

  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  if (!requireAdmin(request, env)) return badRequest("unauthorized", 401);

  const url = new URL(request.url);
  const date = (url.searchParams.get("date") || "").trim();
  if (!isValidDate(date)) return badRequest("invalid_date", 400);

  await env.DB.prepare("DELETE FROM registrations WHERE event_date = ?1").bind(date).run();
  return json({ ok: true });
}

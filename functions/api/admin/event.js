import { json, badRequest, isValidDate, requireAdmin } from "../_util.js";

export async function onRequestPost({ request, env }) {
  if (!requireAdmin(request, env)) return badRequest("unauthorized", 401);

  const body = await request.json().catch(() => ({}));
  const date = (body.date || "").trim();
  const notes = (body.notes || "").trim();

  if (!isValidDate(date)) return badRequest("invalid_date", 400);

  await env.DB.prepare(
    "INSERT INTO event_settings (id, event_date, notes) VALUES (1, ?1, ?2) " +
      "ON CONFLICT(id) DO UPDATE SET event_date = excluded.event_date, notes = excluded.notes"
  )
    .bind(date, notes)
    .run();

  return json({ ok: true, date, notes });
}

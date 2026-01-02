import { json, badRequest } from "./_util.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  const delta = Number(body.delta);

  if (!id) return badRequest("missing_id", 400);
  if (![1, -1].includes(delta)) return badRequest("invalid_delta", 400);

  const res = await env.DB.prepare(
    "UPDATE suggestions SET score = score + ?1 WHERE id = ?2"
  )
    .bind(delta, id)
    .run();

  // If id not found, rowsWritten might be 0
  if (res?.meta?.changes === 0) return badRequest("not_found", 404);

  return json({ ok: true });
}

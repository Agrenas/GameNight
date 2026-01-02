import { json } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const row = await env.DB.prepare(
      "SELECT event_date AS date, notes FROM event_settings WHERE id = 1"
    ).first();

    return json(row || { date: "2026-01-16", notes: "" });
  } catch (e) {
    // Never throw 1101 again — return a JSON error instead
    return json({ error: String(e?.message || e) }, 500);
  }
}

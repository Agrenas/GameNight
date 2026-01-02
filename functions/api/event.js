import { json } from "./_util.js";

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare(
    "SELECT event_date AS date, notes FROM event_settings WHERE id = 1"
  ).first();

  return json(row || { date: "2026-01-16", notes: "" });
}

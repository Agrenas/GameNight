export async function onRequestGet({ env }) {
  try {
    // Sanity check binding exists
    if (!env.DB) {
      return new Response(JSON.stringify({ error: "env.DB is missing (D1 not bound?)" }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    // Try a trivial query first (helps isolate DB vs SQL/table issue)
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();

    const row = await env.DB.prepare(
      "SELECT event_date AS date, notes FROM event_settings WHERE id = 1"
    ).first();

    return new Response(JSON.stringify({ ok: true, tables: tables.results, event: row }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: String(e?.message || e),
        stack: e?.stack || null,
      }),
      { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }
    );
  }
}

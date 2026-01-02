export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

export function badRequest(code, status = 400) {
  return json({ error: code }, status);
}

export function normalize(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date || "").trim());
}

/**
 * Accept either:
 * - Authorization: Bearer <token>   (matches what your repo already uses)
 * - X-Admin-Token: <token>          (optional alternate)
 */
export function requireAdmin(request, env) {
  const bearer = request.headers.get("authorization") || "";
  const tokenA = bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : "";
  const tokenB = (request.headers.get("x-admin-token") || "").trim();
  const token = tokenA || tokenB;
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

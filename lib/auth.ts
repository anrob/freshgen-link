import { createHash, timingSafeEqual } from "node:crypto";

// Hash both sides before comparing so timingSafeEqual never throws on length
// mismatch and the comparison stays constant-time.
const digest = (s: string) => createHash("sha256").update(s).digest();
const safeEq = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

/**
 * A request is authorized when the URL path segment OR an Authorization: Bearer
 * header matches MCP_SECRET. The path form is the primary scheme (it works in
 * every MCP client — the URL itself is the credential); the header is a
 * fallback for clients that prefer it (use any path segment, e.g. /mcp/-).
 */
export function authorized(pathSecret: string | undefined, req: Request): boolean {
  const expected = process.env.MCP_SECRET;
  if (!expected) return false;
  if (pathSecret && safeEq(decodeURIComponent(pathSecret), expected)) return true;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return !!bearer && safeEq(bearer, expected);
}

/** Path-only check for the dashboard (no header fallback — it's a browser URL). */
export function pathAuthorized(pathSecret: string | undefined): boolean {
  const expected = process.env.MCP_SECRET;
  if (!expected || !pathSecret) return false;
  return safeEq(decodeURIComponent(pathSecret), expected);
}

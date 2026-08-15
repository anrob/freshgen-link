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

/**
 * Token for the Kie completion-webhook path. Derived from MCP_SECRET (no new
 * env var to configure) but distinct from it, so the URL we hand to Kie never
 * contains the real secret that guards the MCP endpoint and dashboard.
 */
export function callbackToken(): string | undefined {
  const secret = process.env.MCP_SECRET;
  if (!secret) return undefined;
  return createHash("sha256").update(`${secret}:kie-callback`).digest("hex").slice(0, 32);
}

/** Verifies a Kie callback path token. */
export function callbackAuthorized(pathToken: string | undefined): boolean {
  const expected = callbackToken();
  return !!expected && !!pathToken && safeEq(decodeURIComponent(pathToken), expected);
}

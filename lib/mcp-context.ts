// Resolves per-request MCP context: which GHL location a call should save
// media into (if any), and whether it should run "instant" (return a taskId
// right away) or "inline" (wait for the render) — see lib/mcp-handler.ts.
//
// Two ways a caller supplies the location:
//   - explicitly, via `pathLocationId` — used when the caller already has it
//     from Next's own route params (already parsed + validated by
//     app/mcp/[secret]/[locationId]/route.ts).
//   - parsed out of the URL path itself — the only option available inside
//     the createMcpHandler factory, which is a module-level singleton shared
//     by both route files and only ever sees `requestInfo.url` from the SDK.
// Either way `?mode=instant` is always read straight off the URL's query
// string.

export type McpContext = { locationId?: string; mode: "inline" | "instant" };

// Loose match for GHL's location (sub-account) id shape — just enough to
// reject obviously-wrong URL path segments (typos, stray punctuation) with a
// 404 rather than an opaque downstream failure.
export const LOCATION_ID_RE = /^[A-Za-z0-9_-]{6,64}$/;

export function isValidLocationId(id: string): boolean {
  return LOCATION_ID_RE.test(id);
}

// Path shape: /mcp/<secret>/<locationId>. Anything else (no third segment)
// means there is no path location — the caller falls back to env config.
function locationFromPath(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  const mcpIdx = segments.indexOf("mcp");
  if (mcpIdx === -1 || segments.length <= mcpIdx + 2) return undefined;
  const raw = segments[mcpIdx + 2];
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function parseMcpContext(url: string, pathLocationId?: string): McpContext {
  let mode: McpContext["mode"] = "inline";
  let parsedLocation: string | undefined;
  try {
    const parsed = new URL(url);
    mode = parsed.searchParams.get("mode") === "instant" ? "instant" : "inline";
    parsedLocation = locationFromPath(parsed.pathname);
  } catch {
    // Malformed/relative URL — nothing to parse; fall back to inline/no
    // location below rather than throwing (this must never break a request).
  }
  const raw = pathLocationId ?? parsedLocation;
  const locationId = raw && isValidLocationId(raw) ? raw : undefined;
  return { locationId, mode };
}

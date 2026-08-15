import { handleMcp } from "@/lib/mcp-handler";
import { isValidLocationId } from "@/lib/mcp-context";

// Per-location MCP URL: one deployment, many GHL sub-accounts. Media
// generated through this URL saves into `locationId`'s Media Library instead
// of the env-configured default (requires an agency-level GHL_PIT, or one
// scoped to that sub-account). See docs/GHL-SETUP.md.
async function guarded(
  req: Request,
  ctx: { params: Promise<{ secret: string; locationId: string }> }
) {
  const { secret, locationId } = await ctx.params;
  // Malformed location segment is a routing problem, not an auth one — 404
  // it before even checking the secret, same as any other route that just
  // doesn't exist. (A wrong-but-valid-shaped secret still gets 401 below.)
  let decoded: string;
  try {
    decoded = decodeURIComponent(locationId);
  } catch {
    return new Response("Not Found", { status: 404 });
  }
  if (!isValidLocationId(decoded)) {
    return new Response("Not Found", { status: 404 });
  }
  return handleMcp(req, { secret, locationId: decoded });
}

export { guarded as GET, guarded as POST, guarded as DELETE };
export const maxDuration = 300;
export const runtime = "nodejs";

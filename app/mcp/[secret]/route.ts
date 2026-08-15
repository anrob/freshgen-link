import { handleMcp } from "@/lib/mcp-handler";

// Standard MCP URL: no path location, so save_to_media_library (and
// auto-save) fall back to whatever env GHL_LOCATION_ID is set — see
// app/mcp/[secret]/[locationId]/route.ts for the per-sub-account variant.
// All the actual auth/normalization/registration logic lives in
// lib/mcp-handler.ts, shared by both routes.
async function guarded(
  req: Request,
  ctx: { params: Promise<{ secret: string }> }
) {
  const { secret } = await ctx.params;
  return handleMcp(req, { secret });
}

export { guarded as GET, guarded as POST, guarded as DELETE };
export const maxDuration = 300;
export const runtime = "nodejs";

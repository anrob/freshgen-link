import { handleMcp } from "@/lib/mcp-handler";

// The MCP URL: save_to_media_library (and auto-save) use whatever env
// GHL_LOCATION_ID is set. All the actual auth/normalization/registration
// logic lives in lib/mcp-handler.ts.
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

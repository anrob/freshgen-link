import { createMcpHandler } from "mcp-handler";
import { registerAll } from "@/lib/tools";
import { authorized } from "@/lib/auth";

const handler = createMcpHandler((server) => registerAll(server), {
  serverInfo: {
    name: `${process.env.BRAND_NAME || "FreshGen"} Link`,
    version: "1.0.0",
  },
});

async function guarded(
  req: Request,
  ctx: { params: Promise<{ secret: string }> }
) {
  const { secret } = await ctx.params;
  if (!authorized(secret, req)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return handler(req);
}

export { guarded as GET, guarded as POST, guarded as DELETE };
export const maxDuration = 300;
export const runtime = "nodejs";

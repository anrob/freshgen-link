import { pathAuthorized } from "@/lib/auth";
import { generateFrame } from "@/lib/tools";
import { USD_PER_CREDIT } from "@/lib/kie";
import { brandName } from "@/lib/license";

export const maxDuration = 120;
export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ secret: string }> }
) {
  const { secret } = await ctx.params;
  if (!pathAuthorized(secret)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const brand = await brandName();
    const frame = await generateFrame({
      prompt: `Editorial magazine cover for "${brand}", bold serif typography, single bright orange accent object, clean off-white background, test print`,
      aspectRatio: "1:1",
      waitMs: 100_000,
    });
    if (!frame.url) {
      return Response.json(
        { error: "Still rendering after 100s — Kie is slow right now. Try again in a minute." },
        { status: 504 }
      );
    }
    return Response.json({
      url: frame.url,
      costUsd: frame.credits != null ? frame.credits * USD_PER_CREDIT : undefined,
    });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

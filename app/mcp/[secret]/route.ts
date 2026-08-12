import { createMcpHandler } from "mcp-handler";
import { registerAll } from "@/lib/tools";
import { authorized } from "@/lib/auth";

const handler = createMcpHandler((server) => registerAll(server), {
  serverInfo: {
    name: `${process.env.BRAND_NAME || "FreshGen"} Link`,
    version: "1.0.0",
  },
});

// Some MCP clients (GHL's among the suspects) send tools/call arguments as a
// JSON string or null instead of an object, which fails schema validation with
// -32602. Normalize those shapes before the handler sees them, and log the
// incoming shape (tool name + type only — never argument values).
function normalizeMessage(msg: unknown): unknown {
  if (!msg || typeof msg !== "object") return msg;
  const m = msg as { method?: string; params?: { name?: string; arguments?: unknown } };
  if (m.method === "tools/call" && m.params) {
    const a = m.params.arguments;
    const shape = Array.isArray(a) ? "array" : a === null ? "null" : typeof a;
    console.log(`[mcp] tools/call ${m.params.name ?? "?"} argShape=${shape}`);
    if (typeof a === "string") {
      try {
        m.params.arguments = a.trim() ? JSON.parse(a) : {};
        console.log(`[mcp] normalized stringified arguments for ${m.params.name}`);
      } catch {
        // leave as-is; the handler will report invalid params
      }
    } else if (a === null || a === undefined) {
      m.params.arguments = {};
    }
  }
  return msg;
}

async function normalizeBody(req: Request): Promise<Request> {
  if (req.method !== "POST") return req;
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return req;
  }
  try {
    const body = JSON.parse(raw);
    const fixed = Array.isArray(body) ? body.map(normalizeMessage) : normalizeMessage(body);
    const headers = new Headers(req.headers);
    headers.delete("content-length");
    return new Request(req.url, { method: req.method, headers, body: JSON.stringify(fixed) });
  } catch {
    // Not JSON — rebuild the request with the original body untouched.
    const headers = new Headers(req.headers);
    headers.delete("content-length");
    return new Request(req.url, { method: req.method, headers, body: raw });
  }
}

async function guarded(
  req: Request,
  ctx: { params: Promise<{ secret: string }> }
) {
  const { secret } = await ctx.params;
  if (!authorized(secret, req)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return handler(await normalizeBody(req));
}

export { guarded as GET, guarded as POST, guarded as DELETE };
export const maxDuration = 300;
export const runtime = "nodejs";

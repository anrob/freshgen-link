import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { registerAll } from "@/lib/tools";
import { authorized } from "@/lib/auth";

// Native SSE framing (event: message / data: {...}) — this is the shape
// GoHighLevel's own first-party MCP server uses and the only one their
// client stack is proven against. Anthropic's hosted connector accepts it
// too. Do NOT flatten to plain JSON (tried; it isn't the compat issue).
const handler = createMcpHandler(() => {
  const server = new McpServer({
    name: `${process.env.BRAND_NAME || "FreshGen"} Link`,
    version: "1.0.0",
  });
  registerAll(server);
  return server;
});

// Client-quirk normalization, verified against live GHL traffic:
// - tools/call arguments arrive as null (GHL) or a JSON string (others) →
//   coerce to an object so schema validation doesn't 400 the call.
// - missing "jsonrpc" field → inject it.
// Every message is logged (method + tool + argument SHAPE only — never
// prompt/argument values) so production logs tell the whole story.
function normalizeMessage(msg: unknown, accept: string, ua: string): unknown {
  if (!msg || typeof msg !== "object") return msg;
  const m = msg as {
    jsonrpc?: string;
    method?: string;
    params?: { name?: string; arguments?: unknown };
  };
  if (!m.jsonrpc) m.jsonrpc = "2.0";
  let detail = "";
  if (m.method === "tools/call" && m.params) {
    const a = m.params.arguments;
    const shape = Array.isArray(a) ? "array" : a === null ? "null" : typeof a;
    detail = ` tool=${m.params.name ?? "?"} argShape=${shape}`;
    if (typeof a === "string") {
      try {
        m.params.arguments = a.trim() ? JSON.parse(a) : {};
      } catch {
        // leave as-is; the handler will report invalid params
      }
    } else if (a === null || a === undefined) {
      m.params.arguments = {};
    }
  }
  console.log(`[mcp] ${m.method ?? "?"}${detail} accept="${accept}" ua="${ua.slice(0, 60)}"`);
  return msg;
}

async function normalizeRequest(req: Request): Promise<Request> {
  const headers = new Headers(req.headers);
  // The SDK rejects requests whose Accept header lacks either literal type
  // (wildcards don't count) with a 406 the client reads as a hard failure.
  // The URL secret already authenticated the caller — force the header.
  headers.set("accept", "application/json, text/event-stream");
  headers.delete("content-length");

  if (req.method !== "POST") {
    return new Request(req.url, { method: req.method, headers });
  }
  const accept = req.headers.get("accept") ?? "(none)";
  const ua = req.headers.get("user-agent") ?? "(none)";
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return new Request(req.url, { method: req.method, headers });
  }
  try {
    const body = JSON.parse(raw);
    const fixed = Array.isArray(body)
      ? body.map((m) => normalizeMessage(m, accept, ua))
      : normalizeMessage(body, accept, ua);
    return new Request(req.url, { method: req.method, headers, body: JSON.stringify(fixed) });
  } catch {
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
  const res = await handler.fetch(await normalizeRequest(req));
  console.log(`[mcp] -> ${res.status} ${res.headers.get("content-type") ?? ""}`);
  return res;
}

export { guarded as GET, guarded as POST, guarded as DELETE };
export const maxDuration = 300;
export const runtime = "nodejs";

import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { registerAll } from "@/lib/tools";
import { authorized } from "@/lib/auth";

// responseMode "json": answer POSTs with a plain application/json body instead
// of SSE framing. Spec-legal for every MCP client (they all must accept it),
// and required in practice by GoHighLevel's tool runtime, whose response
// parser chokes on event-stream framing (verified live 2026-08-12).
const handler = createMcpHandler(
  () => {
    const server = new McpServer({
      name: `${process.env.BRAND_NAME || "FreshGen"} Link`,
      version: "1.0.0",
    });
    registerAll(server);
    return server;
  },
  { responseMode: "json" }
);

// Some MCP clients (GHL confirmed) send tools/call arguments as null — and
// others send a JSON string — instead of an object, which fails schema
// validation with -32602. Normalize those shapes before the handler sees
// them, and log the incoming shape (tool name + type only — never values).
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
  const headers = new Headers(req.headers);
  headers.delete("content-length");
  try {
    const body = JSON.parse(raw);
    const fixed = Array.isArray(body) ? body.map(normalizeMessage) : normalizeMessage(body);
    return new Request(req.url, { method: req.method, headers, body: JSON.stringify(fixed) });
  } catch {
    return new Request(req.url, { method: req.method, headers, body: raw });
  }
}

// responseMode "json" only applies to 2026-era clients; the SDK's 2025-legacy
// fallback (which GHL negotiates) always frames responses as SSE. This server
// emits exactly one JSON-RPC message per POST and no notifications, so
// flattening the stream into a plain application/json body is lossless — and
// it's what GHL's response parser requires.
async function sseToJson(res: Response): Promise<Response> {
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/event-stream")) return res;
  const text = await res.text();
  const events = text
    .split(/\n\n/)
    .map((block) =>
      block
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trimStart())
        .join("\n")
    )
    .filter(Boolean);
  const last = events[events.length - 1];
  if (!last) return new Response(null, { status: 202 });
  return new Response(last, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}

async function guarded(
  req: Request,
  ctx: { params: Promise<{ secret: string }> }
) {
  const { secret } = await ctx.params;
  if (!authorized(secret, req)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const res = await handler.fetch(await normalizeBody(req));
  return sseToJson(res);
}

export { guarded as GET, guarded as POST, guarded as DELETE };
export const maxDuration = 300;
export const runtime = "nodejs";

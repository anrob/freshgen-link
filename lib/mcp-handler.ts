import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { registerTools } from "@/lib/tools";
import { authorized } from "@/lib/auth";
import { parseMcpContext } from "@/lib/mcp-context";
import { BRAND, currentTier } from "@/lib/license";

// Native SSE framing (event: message / data: {...}) — this is the shape
// GoHighLevel's own first-party MCP server uses and the only one their
// client stack is proven against. Anthropic's hosted connector accepts it
// too. Do NOT flatten to plain JSON (tried; it isn't the compat issue).
//
// The factory only ever receives what the SDK hands it
// ({ era, authInfo, requestInfo }), so per-request context (inline vs
// instant, and any location hint) is parsed straight out of requestInfo.url
// rather than threaded in as a closure — normalizeRequest below rebuilds the
// Request but always preserves the original URL, so this is safe.
//
// The factory is async because the tool set depends on the license tier
// (Lite vs Full) — a cached verdict after the first request, so this costs
// nothing on warm instances.
const handler = createMcpHandler(async ({ requestInfo }) => {
  const tier = await currentTier();
  const server = new McpServer({
    name: `${BRAND} Link`,
    version: "1.1.0",
  });
  const ctx = parseMcpContext(requestInfo?.url ?? "");
  registerTools(server, ctx, tier);
  return server;
});

// Client-quirk normalization, verified against live GHL traffic:
// - tools/call arguments arrive as null (GHL) or a JSON string (others) →
//   coerce to an object so schema validation doesn't 400 the call.
// - missing "jsonrpc" field → inject it.
// Every message is logged (method + tool + argument SHAPE only — never
// prompt/argument values), plus the resolved location/mode, so production
// logs tell the whole story.
function normalizeMessage(msg: unknown, accept: string, ua: string, ctxLabel: string): unknown {
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
  console.log(
    `[mcp] ${m.method ?? "?"}${detail} ${ctxLabel} accept="${accept}" ua="${ua.slice(0, 60)}"`
  );
  return msg;
}

async function normalizeRequest(req: Request, pathLocationId?: string): Promise<Request> {
  const headers = new Headers(req.headers);
  // The SDK rejects requests whose Accept header lacks either literal type
  // (wildcards don't count) with a 406 the client reads as a hard failure.
  // The URL secret already authenticated the caller — force the header.
  headers.set("accept", "application/json, text/event-stream");
  headers.delete("content-length");

  // Resolved once here (not inside the factory) purely so the log line below
  // can carry it — the factory re-derives the same thing independently from
  // requestInfo.url when it actually registers tools (see above).
  const ctx = parseMcpContext(req.url, pathLocationId);
  const loc = ctx.locationId ?? (process.env.GHL_LOCATION_ID ? "env" : "none");
  const ctxLabel = `loc=${loc} mode=${ctx.mode}`;

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
      ? body.map((m) => normalizeMessage(m, accept, ua, ctxLabel))
      : normalizeMessage(body, accept, ua, ctxLabel);
    return new Request(req.url, { method: req.method, headers, body: JSON.stringify(fixed) });
  } catch {
    return new Request(req.url, { method: req.method, headers, body: raw });
  }
}

/**
 * Entrypoint for the MCP route. `secret` is the path segment right after
 * /mcp/; `locationId` is an optional already-validated location hint from the
 * caller — passed through so the request log line reflects it without
 * re-parsing the URL a second time.
 */
export async function handleMcp(
  req: Request,
  opts: { secret: string; locationId?: string }
): Promise<Response> {
  if (!authorized(opts.secret, req)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const res = await handler.fetch(await normalizeRequest(req, opts.locationId));
  console.log(`[mcp] -> ${res.status} ${res.headers.get("content-type") ?? ""}`);
  return res;
}

# Bug report: Ask AI custom MCP — tool calls abandoned ~1s after dispatch; retries never transmitted

**Product area:** Ask AI → Connectors → "+ Add custom MCP" (released ~Aug 11, 2026)
**Reporter:** Larry Scott (agency account) — happy to provide account/location IDs and exact conversation timestamps privately.
**Server involved:** self-hosted MCP server (Streamable HTTP, stateless, spec 2025-03-26-compatible responses) on Vercel.

## Summary

Custom MCP connectors added via Ask AI discover tools correctly, but **every `tools/call` fails from the agent's perspective** (agent reports "400 errors" on all tools). Server-side packet evidence shows the calls arrive well-formed and are answered `HTTP 200` in **under 1 second**, but the Ask AI runtime abandons the exchange roughly **1–1.5 s after dispatch** and its subsequent retries are **never transmitted** (a fresh `initialize` + `tools/list` handshake occurs, then no `tools/call` follows). The identical server works end-to-end on other production MCP clients.

## Server-side capture of a representative attempt (Aug 14 2026, ~00:40 EDT)

All requests from UA `node`, `Accept: application/json, text/event-stream`, HTTP statuses as returned by us:

```
t+0.0s  POST initialize                       -> 200
t+0.5s  POST notifications/initialized        -> 202
t+0.6s  GET  (SSE stream attempt)             -> 405   (stateless server; spec-permitted)
t+0.7s  POST tools/list                       -> 200
t+2.6s  POST tools/call generate_image        -> 200   (answered in <1s, single SSE event,
                                                        text-only content, isError absent)
t+3.5s  POST initialize        ← runtime re-handshakes ~1s after the call
t+3.6s  POST notifications/initialized        -> 202
t+3.7s  POST tools/list                       -> 200
        …no further tools/call is ever received.
```

The agent-visible transcript for the same turn claims it "tried three more models and a credit check" — none of those calls reach the server. Same pattern captured on **six separate attempts** across Aug 12–14 (first at Aug 12 09:28 AM EDT), across: two different connector installs (removed/re-added), two different server URLs, and two different connector names.

## What we ruled out (server side)

- **Response framing:** single-event SSE (`event: message` / `data: {…}`), byte-shaped like services.leadconnectorhq.com/mcp responses. (Plain `application/json` bodies were also tried — no change.)
- **Result contents:** text-only content blocks, no `structuredContent`, no `resource_link`, no `outputSchema`/`title` in tool definitions (2025-03-26-era shapes only). Errors are `HTTP 200 + isError:true`.
- **Latency:** all tools answer in 350–900 ms warm (task-id pattern for generation; a keep-warm ping eliminates cold starts).
- **Request quirks we accommodate:** `arguments: null` (your runtime sends this — we normalize it), any `Accept` header, missing `jsonrpc` field.
- **Auth:** none required (secret is embedded in the URL) — your runtime's requests reach the handler authenticated.

## The same server works on other production MCP clients

- **Anthropic Messages API hosted MCP connector** (`mcp_servers`, beta `mcp-client-2025-04-04`): full `tools/call` round-trips succeed, including multi-tool turns.
- **Claude custom connector (claude.ai):** added by URL, permissions granted, generation round-trips succeed.
- **Claude Code / raw JSON-RPC over curl:** all methods succeed.

## Questions

1. What does your internal trace (`mcp_trace_id` / `request_id`) show for our failing `tools/call` exchanges? Where does the reported "400" originate — the Ask AI runtime, or an upstream conversion layer?
2. Is there an undocumented per-tool-call timeout in the Ask AI custom-MCP runtime? If so, what is it, so third-party servers can design for it?
3. Why does the post-failure re-handshake never transmit its `tools/call`? (This makes agent-level retries no-ops.)
4. Do catalog connectors (Notion, etc.) use a different execution path than "+ Add custom MCP" servers in Ask AI?

We can reproduce on demand and provide server logs with millisecond timestamps for any window you name.

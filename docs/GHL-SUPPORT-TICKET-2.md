<!-- ───────────────────────────────────────────────────────────────────────────
     INTERNAL — DELETE THIS BLOCK BEFORE SENDING.
     • Do NOT paste the MCP server URL anywhere in this ticket. The auth secret
       is embedded in the path. Timestamps + behavior are enough.
     • Offer account/location IDs privately if they ask.
     • Reference the previously resolved Ask AI ticket — same team, shows a
       track record.
     ─────────────────────────────────────────────────────────────────────── -->

# Bug report: Agent Studio Superagent retries billable MCP tool calls with no idempotency, no backoff, and no abort control

**Product area:** Agent Studio → Superagent → custom MCP connector
**Related:** follows the Ask AI custom-MCP `tools/call` issue reported Aug 14, 2026 (resolved — thank you). This is a **different surface** exhibiting a **different failure**.
**Reporter:** Larry Scott (agency account) — happy to provide account/location IDs and exact conversation timestamps privately.
**Server involved:** self-hosted MCP server (Streamable HTTP, stateless) on Vercel. Tools invoke a paid third-party generation API; **each successful invocation costs real money.**

## Summary

A **single user request** to a Superagent caused the runtime to invoke one billable MCP tool (`generate_image`) **at least 12 times in under five minutes.** Every invocation before we intervened started a separate paid job on our upstream provider and was billed.

Two properties of the retry loop make this materially worse than a normal timeout:

1. **The retry cadence tracks tool latency, not a fixed backoff.** While the tool was doing real work (~30 s per call), retries arrived every ~35 s. The moment the tool began returning instantly, retries accelerated to **every ~5 s**. The loop is bounded only by how fast the server answers — there is no backoff and no apparent cap.
2. **There was no way to stop it from the UI.** The only remedy available to us was **revoking the upstream API key** — which is a nuclear option: it simultaneously takes down Ask AI, Workflow AI Agents, and every other integration on that account.

## Server-side capture (2026-08-15, times UTC; EDT = UTC−4)

Each row is one `tools/call generate_image` received from your runtime (UA `node`). All were answered `HTTP 200`.

```
04:53:32   tools/call generate_image  -> 200   image generated · BILLED     (Δ —   )
04:54:07   tools/call generate_image  -> 200   image generated · BILLED     (Δ 35s)
04:54:42   tools/call generate_image  -> 200   image generated · BILLED     (Δ 35s)
04:55:18   tools/call generate_image  -> 200   image generated · BILLED     (Δ 36s)
04:55:53   tools/call generate_image  -> 200   image generated · BILLED     (Δ 35s)
04:56:27   tools/call generate_image  -> 200   image generated · BILLED     (Δ 34s)
   ── upstream API key revoked here, by us, to stop the loop ──
04:57:02   tools/call generate_image  -> 200   isError (upstream 401)       (Δ 35s)
04:57:07   tools/call generate_image  -> 200   isError (upstream 401)       (Δ  5s)
04:57:11   tools/call generate_image  -> 200   isError (upstream 401)       (Δ  4s)
04:57:20   tools/call generate_image  -> 200   isError (upstream 401)       (Δ  9s)
```

**Note the acceleration.** Rows 1–6 are ~35 s apart because each call was performing a real ~30 s render. Rows 7–10 are 4–9 s apart because the tool began failing instantly. The retry loop consumed capacity as fast as we could return responses.

Completion webhooks confirm **two additional billed generations immediately prior to 04:53:32** (fired 04:53:02 and 04:53:26), placing the true invocation count at **≥12**. The table shows only what was inside the log window we retrieved.

Each invocation carried a **fresh `initialize` + `notifications/initialized` handshake** — i.e. every retry presented as a brand-new session with nothing linking it to the prior attempt.

## Impact

- **12+ paid jobs from one user request.** In our case images at ~$0.04 each (~$0.30). **The same loop against video generation — which our server also exposes, at $0.25–$1.20 per clip and 2–5 minutes per render — would have produced $3–$15 from a single prompt, and run considerably longer before anyone noticed.**
- **Side effects compound, not just charges.** Our server auto-archives finished media to the GoHighLevel Media Library. The retry storm wrote **6 unwanted files** into the customer's Media Storage. Any connector with write side effects (CRM records, outbound sends, file writes) would duplicate those the same way.
- **This is not specific to our server.** It applies to **every paid MCP connector**, including the commercial image/video connectors in your own catalog. Any of them invoked from Superagent is exposed to duplicate billing from one user turn.

## What we believe is happening

Superagent appears to enforce a tool-call timeout **shorter than the tool's execution time**, treat the timeout as a failure, and reissue the call — with no request identity carried across attempts, so the server cannot recognize attempt N as a duplicate of attempt 1. Our server never learns the caller abandoned the exchange; it completes the work and bills for it.

We can and will move long-running work behind an async task-ID pattern on our side. **That does not address the core defect:** any tool that is slower than the timeout, for any reason (cold start, upstream latency, a large request), gets silently multi-billed, and the customer has no way to interrupt it.

## Requests

1. **Idempotency.** Include a stable request/turn identifier in the `tools/call` envelope that is **preserved across retries of the same logical call**, so servers can deduplicate rather than re-execute. This alone neutralizes the entire class of problem.
2. **A cap and a backoff.** Bound automatic retries of a single tool call, and space them independently of how fast the server responds.
3. **A user-facing abort.** Any control that stops a running Superagent turn without revoking upstream credentials.
4. **Publish per-surface tool-call timeouts.** Ask AI, Workflow AI Agents, and Agent Studio Superagent appear to allow materially different budgets. None are documented. Third-party servers cannot design around unpublished limits.

## Questions

1. What is the tool-call timeout for Agent Studio Superagent, and how does it differ from Ask AI and Workflow AI Agents?
2. Is there a retry cap for a failed/timed-out MCP tool call? Is there any backoff between attempts? (Observed behavior suggests neither.)
3. Is any request/turn identifier available in the tool-call payload today that survives retries? If not, is one on the roadmap?
4. Does Superagent execute custom MCP connectors through a different path than Ask AI? The Ask AI issue we reported on Aug 14 was resolved — did that fix apply to Superagent as well?
5. How are billable connectors in your own catalog protected against this today?

We can reproduce on demand and provide server logs with millisecond timestamps for any window you name.

// In-flight request de-duplication.
//
// WHY: agent runtimes (GoHighLevel's Superagent, verified 2026-08-15) enforce a
// tool-call timeout shorter than a render, treat the timeout as a failure, and
// automatically reissue the call with no request identity attached. Each retry
// would otherwise start a NEW paid job. One user request produced 12+ billed
// generations before the API key was pulled — the only stop control available.
//
// So: an identical request inside WINDOW_MS attaches to the work ALREADY
// RUNNING instead of starting more. A retry storm then costs exactly one
// generation and every attempt still gets a correct answer.
//
// We hold the in-flight PROMISE, not just the finished id, because retries
// routinely arrive mid-render — for video the first attempt may still be
// generating its start frame when the second call lands, and there is no task
// id yet to hand back.
//
// Scope: module memory, so per warm instance. Vercel Fluid Compute reuses
// instances across concurrent requests, which is exactly where retry storms
// land, so this catches the real-world case without any external store.
//
// Trade-off: two DELIBERATE identical requests inside the window collapse into
// one. Image models are stochastic and the natural way to get variations is to
// vary the prompt, so this is worth it against duplicate billing.

import { createHash } from "node:crypto";

const WINDOW_MS = 90_000;
const MAX_ENTRIES = 200;

type Entry = { promise: Promise<string>; at: number };
const entries = new Map<string, Entry>();

function prune(now: number) {
  for (const [k, v] of entries) {
    if (now - v.at > WINDOW_MS) entries.delete(k);
  }
  if (entries.size > MAX_ENTRIES) {
    const oldest = [...entries].sort((a, b) => a[1].at - b[1].at);
    for (const [k] of oldest.slice(0, entries.size - MAX_ENTRIES)) entries.delete(k);
  }
}

/** Stable key for a request. Pass every parameter that affects the output. */
export function requestKey(parts: Record<string, unknown>): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 32);
}

/**
 * Runs `create` unless an identical request is already in flight (or finished
 * within the window), in which case its task id is reused.
 *
 * A failed `create` is evicted immediately so a genuine retry can still work —
 * we only ever want to suppress duplicate *billing*, never duplicate recovery.
 */
export async function dedupedTask(
  key: string,
  create: () => Promise<string>
): Promise<{ taskId: string; reused: boolean }> {
  const now = Date.now();
  prune(now);

  const hit = entries.get(key);
  if (hit && now - hit.at <= WINDOW_MS) {
    try {
      return { taskId: await hit.promise, reused: true };
    } catch {
      entries.delete(key); // the original attempt failed — fall through and retry
    }
  }

  const promise = create();
  entries.set(key, { promise, at: Date.now() });
  try {
    return { taskId: await promise, reused: false };
  } catch (err) {
    entries.delete(key);
    throw err;
  }
}

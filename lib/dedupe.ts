// Request de-duplication — two layers.
//
// WHY: agent runtimes (GoHighLevel's Superagent, verified 2026-08-15) enforce a
// tool-call timeout shorter than a render, treat the timeout as a failure, and
// automatically reissue the call with no request identity attached. Each retry
// would otherwise start a NEW paid job. One user request produced 12+ billed
// generations before the API key was pulled — the only stop control available.
//
// So: an identical request inside WINDOW_MS attaches to the work ALREADY
// RUNNING (or just finished) instead of starting more. A retry storm then costs
// exactly one generation and every attempt still gets a correct answer.
//
// Layer 1 — module memory (this instance): holds the in-flight PROMISE, not
//   just the finished id, because retries routinely arrive mid-render — for
//   video the first attempt may still be generating its start frame when the
//   second call lands, and there is no task id yet to hand back.
//
// Layer 2 — Vercel Runtime Cache (shared across function instances in the
//   region, no provisioning): retries 5–60s apart frequently land on a DIFFERENT
//   warm instance than the original, where layer 1 knows nothing. Verified
//   live 2026-08-16: three simultaneous calls hit three instances and produced
//   three tasks with layer 1 alone. The cache closes that gap for anything that
//   isn't literally simultaneous — a race of a few hundred ms between two cold
//   instances can still double up; that is the accepted residual, since real
//   retry cadences are seconds apart. Best-effort: if the cache is unavailable
//   (local dev, outage) we degrade to layer 1 only and never fail the request.
//
// Trade-off: two DELIBERATE identical requests inside the window collapse into
// one. Image models are stochastic and the natural way to get variations is to
// vary the prompt, so this is worth it against duplicate billing.

import { createHash } from "node:crypto";
import { getCache } from "@vercel/functions";

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

// Shared-cache helpers. Every call is wrapped so a cache problem can only ever
// cost us de-duplication, never the generation itself.
async function sharedGet(key: string): Promise<string | undefined> {
  try {
    const v = await getCache({ namespace: "dedupe" }).get(key);
    return typeof v === "string" && v ? v : undefined;
  } catch {
    return undefined;
  }
}
async function sharedSet(key: string, taskId: string): Promise<void> {
  try {
    await getCache({ namespace: "dedupe" }).set(key, taskId, {
      ttl: Math.ceil(WINDOW_MS / 1000),
      name: "generation-dedupe",
    });
  } catch {
    // best-effort
  }
}

/**
 * Runs `create` unless an identical request is already in flight on this
 * instance, or was created recently anywhere in the region, in which case its
 * task id is reused.
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

  // Layer 1: same instance, possibly still in flight.
  const hit = entries.get(key);
  if (hit && now - hit.at <= WINDOW_MS) {
    try {
      return { taskId: await hit.promise, reused: true };
    } catch {
      entries.delete(key); // the original attempt failed — fall through and retry
    }
  }

  // Layer 2: another instance already created it.
  const shared = await sharedGet(key);
  if (shared) {
    entries.set(key, { promise: Promise.resolve(shared), at: Date.now() });
    return { taskId: shared, reused: true };
  }

  const promise = create();
  entries.set(key, { promise, at: Date.now() });
  try {
    const taskId = await promise;
    await sharedSet(key, taskId);
    return { taskId, reused: false };
  } catch (err) {
    entries.delete(key);
    throw err;
  }
}

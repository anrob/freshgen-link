// Kie completion webhook → auto-save to the GHL Media Library.
//
// Kie POSTs here when a task finishes (we pass callBackUrl on creation, only
// when GHL is configured). The payload is treated as a NOTIFICATION only: we
// take the taskId from it and re-query Kie's recordInfo for the authoritative
// state and result URLs. That way a forged POST can't make us fetch/save an
// attacker-chosen URL — the worst it can do is make us re-check a real task.
//
// This removes the dependency on GHL's agent ever polling check_status:
// finished media lands in the Media Library even if the agent goes silent.

import { callbackAuthorized } from "@/lib/auth";
import { ghlEnabled, ghlSaveMedia } from "@/lib/ghl";
import { kieGetStatus } from "@/lib/kie";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  if (!callbackAuthorized(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let taskId: string | undefined;
  try {
    const body = (await req.json()) as {
      data?: { taskId?: unknown; state?: unknown };
      taskId?: unknown;
    };
    const raw = body?.data?.taskId ?? body?.taskId;
    if (typeof raw === "string" && raw.trim()) taskId = raw.trim();
    console.log(
      `[callback] received taskId=${taskId ?? "?"} state=${String(body?.data?.state ?? "?")}`
    );
  } catch {
    // fall through — no taskId
  }
  if (!taskId) return new Response("Missing taskId", { status: 400 });
  if (!ghlEnabled()) return Response.json({ ok: true, saved: 0, reason: "ghl not configured" });

  try {
    const status = await kieGetStatus(taskId);
    if (status.state !== "success" || status.resultUrls.length === 0) {
      console.log(`[callback] task ${taskId} state=${status.state} — nothing to save`);
      return Response.json({ ok: true, saved: 0, state: status.state });
    }

    let saved = 0;
    const failures: string[] = [];
    for (const [i, url] of status.resultUrls.entries()) {
      try {
        const ext = url.split("?")[0].split(".").pop() || "png";
        const suffix = status.resultUrls.length > 1 ? `-${i + 1}` : "";
        await ghlSaveMedia(url, `freshgen-${taskId.slice(0, 12)}${suffix}.${ext}`);
        saved++;
      } catch (err) {
        failures.push((err as Error).message.slice(0, 200));
      }
    }
    console.log(
      `[callback] task ${taskId}: saved ${saved}/${status.resultUrls.length} to GHL` +
        (failures.length ? ` — failures: ${failures.join(" | ")}` : "")
    );
    // Always 200: Kie retries help only for transient faults, and the common
    // permanent ones (file too large) would just retry-spam the logs.
    return Response.json({ ok: failures.length === 0, saved, failures });
  } catch (err) {
    console.log(`[callback] task ${taskId} error: ${(err as Error).message.slice(0, 200)}`);
    return Response.json({ ok: false, error: "processing failed" }, { status: 200 });
  }
}

export const maxDuration = 300;
export const runtime = "nodejs";

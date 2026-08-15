// All MCP tool registrations. Tool names + descriptions are the product's UI:
// GHL shows them as a checkbox list during setup, and the GHL agent reads them
// as instructions at runtime — keep them instructive and cost-honest.

import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  KIE_MODELS,
  USD_PER_CREDIT,
  getImageModel,
  kieCreateTask,
  kieGetStatus,
  normalizeResolution,
} from "./kie";
import {
  VIDEO_MODELS,
  estimateVideoCost,
  getVideoModel,
  kieCreateVideoTask,
} from "./kie-video";
import { ghlEnabled, ghlSaveMedia } from "./ghl";
import { kieCallbackUrl } from "./callback";
import { failResult, mediaResult, pendingResult, usd } from "./results";

// ── Tunables (adjust after the live-GHL milestone) ──────────────────────────
// INLINE_WAIT_MS > 1 → generate_image waits for the render and returns the
// finished image in one call (GHL holds tool calls open since their 2026-08
// runtime fix). Set INLINE_WAIT_MS=1 in env to fall back to instant-return
// (taskId only) if a client starts killing long tool calls again.
const INLINE_WAIT_MS = Number(process.env.INLINE_WAIT_MS) || 45_000;
const POLL_MS = 3_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Poll a Kie task until it leaves the pending states or the budget runs out.
async function pollTask(taskId: string, budgetMs: number) {
  const deadline = Date.now() + budgetMs;
  let status = await kieGetStatus(taskId);
  while (status.state !== "success" && status.state !== "fail" && Date.now() < deadline) {
    await sleep(POLL_MS);
    status = await kieGetStatus(taskId);
  }
  return status;
}

const imageModelIds = KIE_MODELS.map((m) => m.id);
const videoModelIds = VIDEO_MODELS.map((m) => m.id);

// ── Forgiving input coercion ────────────────────────────────────────────────
// Agent-driven clients (GHL's included) routinely send "2k" for "2K", numbers
// for string durations, "16x9" for "16:9", or model names with stray case.
// A strict schema turns each of those into an instant opaque failure the
// agent cannot recover from — so normalize aggressively and fall back to
// defaults instead of rejecting.

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

const looseImageResolution = z.preprocess((v) => {
  const s = str(v)?.toUpperCase();
  return s && ["1K", "2K", "4K"].includes(s) ? s : undefined;
}, z.enum(["1K", "2K", "4K"]).optional());

const looseVideoResolution = z.preprocess((v) => {
  const s = str(v)?.toLowerCase();
  if (!s) return undefined;
  const map: Record<string, string> = { "480p": "480p", "720p": "720p", "1080p": "1080p", "4k": "4K" };
  return map[s];
}, z.enum(["480p", "720p", "1080p", "4K"]).optional());

const looseAspectRatio = (fallback: string) =>
  z.preprocess((v) => {
    const s = str(v)?.replace(/[x/]/g, ":");
    return s && /^\d{1,2}:\d{1,2}$/.test(s) ? s : fallback;
  }, z.string());

const looseDuration = z.preprocess(
  (v) => (v == null ? undefined : String(v).trim() || undefined),
  z.string().optional()
);

const looseModel = z.preprocess(
  (v) => str(v)?.toLowerCase(),
  z.string().optional()
);

const looseUrlList = z.preprocess(
  (v) => (typeof v === "string" ? [v] : v),
  z.array(z.string()).max(4).optional()
);

// Note appended to results when we silently corrected the agent's input.
function fallbackNote(requested: string | undefined, resolvedId: string, kind: "image" | "video"): string | null {
  if (!requested || requested === resolvedId) return null;
  return `Note: unknown ${kind} model "${requested}" — used "${resolvedId}" instead. Valid ids: ${(kind === "image" ? imageModelIds : videoModelIds).join(", ")}.`;
}

const NOT_AUTH =
  "This is a parameter/model issue — the Kie.ai API key and credits are fine. Do NOT advise reconnecting the connector. Retry with adjusted parameters (e.g. omit resolution, or use the default model).";

// Generate a start frame for a video (or the test image). Shared helper.
export async function generateFrame(opts: {
  prompt: string;
  aspectRatio: string;
  waitMs?: number;
}): Promise<{ url?: string; taskId: string; credits?: number }> {
  const model = getImageModel("gpt-image-2");
  const taskId = await kieCreateTask({
    model: model.slug,
    prompt: opts.prompt,
    aspectRatio: opts.aspectRatio,
    resolution: normalizeResolution(model.id, opts.aspectRatio, "1K"),
    resolutionParam: model.resolutionParam,
  });
  const status = await pollTask(taskId, opts.waitMs ?? INLINE_WAIT_MS);
  if (status.state === "fail") {
    throw new Error(status.error || "Frame generation failed");
  }
  return { url: status.resultUrls[0], taskId, credits: status.credits };
}

export function registerAll(server: McpServer) {
  const inline = INLINE_WAIT_MS > 1;
  const autoSave = ghlEnabled();
  const autoSaveNote = autoSave
    ? " Finished media is also saved automatically into the GHL Media Library (permanent copy) — mention that to the user."
    : "";

  // ── generate_image ────────────────────────────────────────────────────────
  server.registerTool(
    "generate_image",
    {
      description: inline
        ? `Generate an AI image from a text prompt using the connected Kie.ai account. Costs real money: about $0.02–$0.09 per image depending on model. This call WAITS for the render and usually returns the finished image directly (typically 15–45 seconds — do not abandon it early). If it returns a taskId instead of an image (an unusually slow render), call check_status with that taskId after 30 seconds to get the image URL. When you have the URL, share it as both a markdown image and a plain link; it expires in ~14 days.${autoSaveNote} For multiple images, call this tool once per image.`
        : "Start generating an AI image from a text prompt using the connected Kie.ai account. Costs real money: about $0.02–$0.09 per image depending on model. This tool returns a taskId IMMEDIATELY — it never returns the finished image. You MUST call check_status with that taskId after 30–60 seconds to get the image URL; if still processing, wait and check again. Tell the user the image is being generated. When you get the URL, share it as both a markdown image and a plain link; it expires in ~14 days, so suggest downloading it (or use save_to_media_library if available). For multiple images, call this tool once per image." +
          autoSaveNote,
      inputSchema: z.object({
        prompt: z
          .string()
          .min(1)
          .max(5000)
          .describe(
            "What to generate, described in detail: subject, style, lighting, composition, any text to render"
          ),
        model: looseModel.describe(
          "One of: gpt-image-2 = best for text, logos, typography (default, ~$0.04). nano-banana-pro = best photorealism and likeness (~$0.09). nano-banana = cheapest drafts (~$0.02). nano-banana-2 = fast all-round (~$0.04). seedream-4 = stylized art (~$0.03). imagen-4 = clean commercial looks, no reference images (~$0.03). Unknown values fall back to gpt-image-2"
        ),
        aspectRatio: looseAspectRatio("1:1").describe(
          "e.g. 16:9 for banners/heroes, 9:16 for stories/reels, 4:5 for feed posts, 1:1 for square (default)"
        ),
        resolution: looseImageResolution.describe(
          "1K, 2K or 4K — higher costs more. Invalid combos (e.g. 4K at 1:1 on gpt-image-2) and unknown values are auto-corrected, never rejected"
        ),
        referenceImageUrls: looseUrlList.describe(
          "Up to 4 image URLs to use as subject/style reference (e.g. a product photo or logo). Not supported by imagen-4 or nano-banana-2"
        ),
      }),
    },
    async (input) => {
      try {
        const model = getImageModel(input.model ?? "gpt-image-2");
        const note = fallbackNote(input.model, model.id, "image");
        const refs = model.supportsReference ? input.referenceImageUrls ?? [] : [];
        const droppedRefs =
          !model.supportsReference && (input.referenceImageUrls?.length ?? 0) > 0;
        const taskId = await kieCreateTask({
          model: refs.length ? model.refSlug ?? model.slug : model.slug,
          prompt: input.prompt,
          imageUrls: refs.length ? refs : undefined,
          imageParam: model.refImageParam,
          aspectRatio: input.aspectRatio,
          resolution: normalizeResolution(model.id, input.aspectRatio, input.resolution),
          resolutionParam: model.resolutionParam,
          callBackUrl: kieCallbackUrl(),
        });

        // INLINE_WAIT_MS <= 1 → answer with the taskId only, no status check.
        // GHL's runtime abandons tool calls after ~1.5s, so every millisecond
        // of the first response counts; check_status carries the rest.
        const status =
          INLINE_WAIT_MS > 1
            ? await pollTask(taskId, INLINE_WAIT_MS)
            : ({ state: "waiting", resultUrls: [], raw: null } as Awaited<
                ReturnType<typeof pollTask>
              >);

        if (status.state === "fail") {
          const msg = status.error || "unknown error";
          const hint = /credit|balance|insufficient/i.test(msg)
            ? "The Kie.ai account is out of credits — top up at https://kie.ai, then retry."
            : NOT_AUTH;
          return failResult(`Image generation failed: ${msg}. ${hint}`, {
            taskId,
            model: model.id,
          });
        }
        if (status.state !== "success" || !status.resultUrls[0]) {
          return pendingResult({
            kind: "image",
            taskId,
            model: model.id,
            text: `${note ? `${note}\n\n` : ""}Image generation started on ${model.label} (state: ${status.state}). Task ID: ${taskId}. Call check_status with this taskId in 30–60 seconds to get the image URL. Tell the user the image is being generated.`,
          });
        }
        const result = await mediaResult({
          kind: "image",
          url: status.resultUrls[0],
          prompt: input.prompt,
          model: model.id,
          taskId,
          credits: status.credits,
        });
        if (droppedRefs) {
          result.content.unshift({
            type: "text",
            text: `Note: ${model.id} does not support reference images — they were ignored.`,
          });
        }
        if (note) {
          result.content.unshift({ type: "text", text: note });
        }
        return result;
      } catch (err) {
        return failResult(`Image generation error: ${(err as Error).message}. ${NOT_AUTH}`);
      }
    }
  );

  // ── generate_video ────────────────────────────────────────────────────────
  server.registerTool(
    "generate_video",
    {
      description:
        "Start rendering a short AI video clip (5–10 seconds) from a text prompt. If startImageUrl is provided, that exact image is animated; otherwise a start frame is generated first (adds ~$0.04 and ~30s). IMPORTANT: this tool only STARTS the render — it returns a taskId immediately, never the finished video. You MUST call check_status with that taskId after 2–3 minutes to get the video URL; if it is still processing, wait and check again. Always tell the user: the video is rendering, roughly how long to wait, and the estimated cost from this result (typically $0.25–$1.20 per clip, real money from the connected Kie.ai account)." +
        (ghlEnabled()
          ? " The finished clip is ALSO saved automatically into the GHL Media Library — tell the user it will appear in Media Storage in a few minutes even if they don't ask again."
          : ""),
      inputSchema: z.object({
        prompt: z
          .string()
          .min(1)
          .max(2500)
          .describe(
            "The motion and scene: what happens, camera movement, mood. Max 2500 characters"
          ),
        model: looseModel.describe(
          "One of: kling-2-1-std = fast and cheapest (~$0.13 per 5s, default). kling-3-0 = flagship quality, up to 4K, end-frame support (~$0.42+ per 5s). kling-2-6 = native audio (~$0.50). seedance-2 = cinematic (~$1.20+ per 5s). wan-2-6 = HD budget. grok-imagine = longer cheap clips. Unknown values fall back to kling-2-1-std"
        ),
        startImageUrl: z
          .string()
          .optional()
          .describe(
            "Animate this exact image (e.g. a generate_image result or a product photo URL). Omit to auto-generate a start frame from the prompt"
          ),
        duration: looseDuration.describe(
          "Clip length in seconds: 5 or 10 (grok-imagine: 6 or 10). Defaults to 5. Out-of-range values are clamped, never rejected"
        ),
        resolution: looseVideoResolution.describe(
          "480p, 720p, 1080p or 4K — clamped to what the chosen model supports; higher costs more. Unknown values are ignored"
        ),
        aspectRatio: looseAspectRatio("16:9").describe(
          "Used for the auto-generated start frame and passed to models that accept it. Default 16:9"
        ),
      }),
    },
    async (input) => {
      try {
        const model = getVideoModel(input.model ?? "kling-2-1-std");
        const note = fallbackNote(input.model, model.id, "video");

        // Clamp duration/resolution to the model's supported values.
        const duration =
          input.duration && model.durations.includes(input.duration)
            ? input.duration
            : model.defaultDuration;
        const resolution =
          input.resolution && model.resolutions?.includes(input.resolution)
            ? input.resolution
            : undefined;

        // 1) Start frame.
        let startUrl = input.startImageUrl;
        if (!startUrl) {
          const frame = await generateFrame({
            prompt: input.prompt,
            aspectRatio: input.aspectRatio,
          });
          if (!frame.url) {
            return pendingResult({
              kind: "image",
              taskId: frame.taskId,
              model: "gpt-image-2",
              text: `The start frame is still rendering. Call check_status with taskId ${frame.taskId}; when it returns an image URL, call generate_video again with startImageUrl set to that URL.`,
            });
          }
          startUrl = frame.url;
        }

        // 2) Fire the video task — never wait for it.
        const taskId = await kieCreateVideoTask({
          model: model.id,
          prompt: input.prompt,
          startFrameUrl: startUrl,
          duration,
          resolution,
          aspectRatio: input.aspectRatio,
          callBackUrl: kieCallbackUrl(),
        });
        const estimate = estimateVideoCost(model.id, duration, resolution);
        const estText = estimate != null ? ` Estimated cost ≈ $${estimate.toFixed(2)} (actual cost is reported when finished).` : "";
        const autoSaveText = ghlEnabled()
          ? " When it finishes it is saved automatically into the GHL Media Library — tell the user it will appear in Media Storage in a few minutes."
          : "";
        return pendingResult({
          kind: "video",
          taskId,
          model: model.id,
          estimateUsd: estimate,
          text: `${note ? `${note}\n\n` : ""}Video render started on ${model.label} (${duration}s).${estText} Task ID: ${taskId}. It takes 2–5 minutes — call check_status with this taskId in 2–3 minutes. Tell the user the video is rendering.${autoSaveText}`,
        });
      } catch (err) {
        return failResult(`Video generation error: ${(err as Error).message}. ${NOT_AUTH}`);
      }
    }
  );

  // ── check_status ──────────────────────────────────────────────────────────
  server.registerTool(
    "check_status",
    {
      description:
        "Check whether an image or video generation is finished, using the taskId returned by generate_image or generate_video. If finished, this returns the media URL and the real cost — share both with the user (the URL expires in ~14 days). If still processing, wait 1–2 minutes and call again; video clips typically take 2–5 minutes total. If it failed, the error message says why (e.g. insufficient credits or a blocked prompt).",
      inputSchema: z.object({
        taskId: z
          .string()
          .describe("The taskId from a previous generate_image or generate_video result"),
      }),
    },
    async ({ taskId }) => {
      try {
        const status = await kieGetStatus(taskId);
        if (status.state === "fail") {
          const msg = status.error || "unknown error";
          const hint = /credit|balance|insufficient/i.test(msg)
            ? "The Kie.ai account is out of credits — top up at https://kie.ai, then retry."
            : NOT_AUTH;
          return failResult(`Generation failed: ${msg}. ${hint}`, { taskId });
        }
        const url = status.resultUrls[0];
        if (status.state !== "success" || !url) {
          return pendingResult({
            taskId,
            text: `Still ${status.state}. Check again in a minute or two.`,
          });
        }
        const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
        return await mediaResult({
          kind: isVideo ? "video" : "image",
          url,
          prompt: "",
          model: "kie",
          taskId,
          credits: status.credits,
        });
      } catch (err) {
        return failResult(`Status check error: ${(err as Error).message}`);
      }
    }
  );

  // ── check_credits ─────────────────────────────────────────────────────────
  server.registerTool(
    "check_credits",
    {
      description:
        "Check the remaining Kie.ai credit balance on the connected account, in both credits and US dollars. Use this when the user asks about balance or spend, before large batches, or after a generation fails with an insufficient-credit error. Credits are topped up at kie.ai. Free to call.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const { kieGetCredits } = await import("./kie");
        const credits = await kieGetCredits();
        const dollars = credits * USD_PER_CREDIT;
        return {
          content: [
            {
              type: "text" as const,
              text: `Balance: ${credits.toLocaleString()} credits ≈ $${dollars.toFixed(2)} (1 credit = $0.005). Top up at https://kie.ai`,
            },
          ],
        };
      } catch (err) {
        return failResult(`Could not fetch credits: ${(err as Error).message}`);
      }
    }
  );

  // ── list_models ───────────────────────────────────────────────────────────
  server.registerTool(
    "list_models",
    {
      description:
        "List every available image and video model: what each is best at, approximate price, and supported options (resolutions, durations, reference-image support). Instant and free — call this when the user asks what is possible, which model to pick, or what things cost.",
      inputSchema: z.object({
        kind: z
          .enum(["image", "video"])
          .optional()
          .describe("Filter to just image or just video models"),
      }),
    },
    async ({ kind }) => {
      const parts: string[] = [];
      if (kind !== "video") {
        parts.push(
          "## Image models\n\n| Model | Best for | Price | Options |\n|---|---|---|---|\n" +
            KIE_MODELS.map(
              (m) =>
                `| ${m.id} | ${m.bestFor} | ${m.priceNote} | ${[
                  m.resolutions?.length ? m.resolutions.join("/") : "auto res",
                  m.supportsReference ? "reference images ✓" : "no reference images",
                ].join(" · ")} |`
            ).join("\n")
        );
      }
      if (kind !== "image") {
        parts.push(
          "## Video models\n\n| Model | Best for | Price | Options |\n|---|---|---|---|\n" +
            VIDEO_MODELS.map(
              (m) =>
                `| ${m.id} | ${m.bestFor} | ${m.priceNote} | ${[
                  `${m.durations.join("/")}s`,
                  m.resolutions?.length ? m.resolutions.join("/") : "fixed res",
                  m.supportsEndFrame ? "end frame ✓" : "start frame only",
                ].join(" · ")} |`
            ).join("\n")
        );
      }
      parts.push(
        "Prices are estimates — every generation reports its real cost. 1 credit = $0.005."
      );
      return {
        content: [{ type: "text" as const, text: parts.join("\n\n") }],
      };
    }
  );

  // ── save_to_media_library (only when GHL vars are configured) ─────────────
  if (ghlEnabled()) {
    server.registerTool(
      "save_to_media_library",
      {
        description:
          "Save any image or video URL into this GoHighLevel account's Media Library so it never expires (generated URLs die after about 14 days). NOTE: finished generations are already saved there automatically — use this tool only to save an external/arbitrary URL, or to re-save something under a specific filename. Returns a permanent GHL-hosted URL — prefer sharing that permanent URL with the user, and use it in funnels, emails, and social posts.",
        inputSchema: z.object({
          url: z.string().describe("The media URL from a finished generation"),
          name: z
            .string()
            .optional()
            .describe("Filename to save as, e.g. 'hero-banner.png'"),
        }),
      },
      async ({ url, name }) => {
        try {
          const saved = await ghlSaveMedia(url, name);
          const permanent = saved.ghlUrl;
          return {
            content: [
              {
                type: "text" as const,
                text: permanent
                  ? `Saved to the GHL Media Library.\n\nPermanent URL: ${permanent}\n\nUse this URL going forward — it never expires.`
                  : `Saved to the GHL Media Library (file id: ${saved.fileId ?? "unknown"}). Open Media Storage in GHL to use it.`,
              },
            ],
          };
        } catch (err) {
          return failResult(`Save to media library failed: ${(err as Error).message}`);
        }
      }
    );
  }
}

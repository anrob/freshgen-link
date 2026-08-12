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
import { failResult, mediaResult, pendingResult, usd } from "./results";

// ── Tunables (adjust after the live-GHL milestone) ──────────────────────────
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

const imageModelIds = KIE_MODELS.map((m) => m.id) as [string, ...string[]];
const videoModelIds = VIDEO_MODELS.map((m) => m.id) as [string, ...string[]];

const mediaOutput = z.object({
  state: z.enum(["success", "pending", "fail"]),
  kind: z.enum(["image", "video"]).optional(),
  url: z.string().optional(),
  taskId: z.string().optional(),
  model: z.string().optional(),
  credits: z.number().optional(),
  costUsd: z.number().optional(),
  estimatedCostUsd: z.number().optional(),
});

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
  // ── generate_image ────────────────────────────────────────────────────────
  server.registerTool(
    "generate_image",
    {
      title: "Generate image",
      description:
        "Generate an AI image from a text prompt using the connected Kie.ai account. Costs real money: about $0.02–$0.09 per image depending on model. Usually returns the finished image URL within 45 seconds — share it with the user as both a markdown image and a plain link. The URL expires in about 14 days, so remind the user to download it (or use save_to_media_library if that tool is available). If the result says it is still generating, call check_status with the returned taskId after 30–60 seconds. For multiple images, call this tool once per image.",
      inputSchema: z.object({
        prompt: z
          .string()
          .min(1)
          .max(5000)
          .describe(
            "What to generate, described in detail: subject, style, lighting, composition, any text to render"
          ),
        model: z
          .enum(imageModelIds)
          .default("gpt-image-2")
          .describe(
            "gpt-image-2 = best for text, logos, typography (default, ~$0.04). nano-banana-pro = best photorealism and likeness (~$0.09). nano-banana = cheapest drafts (~$0.02). nano-banana-2 = fast all-round (~$0.04). seedream-4 = stylized art (~$0.03). imagen-4 = clean commercial looks, no reference images (~$0.03)"
          ),
        aspectRatio: z
          .string()
          .default("1:1")
          .describe(
            "e.g. 16:9 for banners/heroes, 9:16 for stories/reels, 4:5 for feed posts, 1:1 for square"
          ),
        resolution: z
          .enum(["1K", "2K", "4K"])
          .optional()
          .describe(
            "Higher costs more. Invalid combos (e.g. 4K at 1:1 on gpt-image-2) are auto-corrected to the nearest valid tier"
          ),
        referenceImageUrls: z
          .array(z.string())
          .max(4)
          .optional()
          .describe(
            "Up to 4 image URLs to use as subject/style reference (e.g. a product photo or logo). Not supported by imagen-4 or nano-banana-2"
          ),
      }),
      outputSchema: mediaOutput,
    },
    async (input) => {
      try {
        const model = getImageModel(input.model);
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
        });

        const status = await pollTask(taskId, INLINE_WAIT_MS);

        if (status.state === "fail") {
          return failResult(
            `Image generation failed: ${status.error || "unknown error"}. Check credits with check_credits, or try a different prompt/model.`,
            { taskId, model: model.id }
          );
        }
        if (status.state !== "success" || !status.resultUrls[0]) {
          return pendingResult({
            kind: "image",
            taskId,
            model: model.id,
            text: `Still generating (state: ${status.state}). Task ID: ${taskId}. Call check_status with this taskId in 30–60 seconds to get the image.`,
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
        return result;
      } catch (err) {
        return failResult(`Image generation error: ${(err as Error).message}`);
      }
    }
  );

  // ── generate_video ────────────────────────────────────────────────────────
  server.registerTool(
    "generate_video",
    {
      title: "Generate video",
      description:
        "Start rendering a short AI video clip (5–10 seconds) from a text prompt. If startImageUrl is provided, that exact image is animated; otherwise a start frame is generated first (adds ~$0.04 and ~30s). IMPORTANT: this tool only STARTS the render — it returns a taskId immediately, never the finished video. You MUST call check_status with that taskId after 2–3 minutes to get the video URL; if it is still processing, wait and check again. Always tell the user: the video is rendering, roughly how long to wait, and the estimated cost from this result (typically $0.25–$1.20 per clip, real money from the connected Kie.ai account).",
      inputSchema: z.object({
        prompt: z
          .string()
          .min(1)
          .max(2500)
          .describe(
            "The motion and scene: what happens, camera movement, mood. Max 2500 characters"
          ),
        model: z
          .enum(videoModelIds)
          .default("kling-2-1-std")
          .describe(
            "kling-2-1-std = fast and cheapest (~$0.13 per 5s, default). kling-3-0 = flagship quality, up to 4K, end-frame support (~$0.42+ per 5s). kling-2-6 = native audio (~$0.50). seedance-2 = cinematic (~$1.20+ per 5s). wan-2-6 = HD budget. grok-imagine = longer cheap clips"
          ),
        startImageUrl: z
          .string()
          .optional()
          .describe(
            "Animate this exact image (e.g. a generate_image result or a product photo URL). Omit to auto-generate a start frame from the prompt"
          ),
        duration: z
          .enum(["5", "6", "10"])
          .default("5")
          .describe("Clip length in seconds. Cost scales with duration"),
        resolution: z
          .enum(["480p", "720p", "1080p", "4K"])
          .optional()
          .describe("Clamped to what the chosen model supports; higher costs more"),
        aspectRatio: z
          .string()
          .default("16:9")
          .describe(
            "Used for the auto-generated start frame and passed to models that accept it"
          ),
      }),
      outputSchema: mediaOutput,
    },
    async (input) => {
      try {
        const model = getVideoModel(input.model);

        // Clamp duration/resolution to the model's supported values.
        const duration = model.durations.includes(input.duration)
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
        });
        const estimate = estimateVideoCost(model.id, duration, resolution);
        const estText = estimate != null ? ` Estimated cost ≈ $${estimate.toFixed(2)} (actual cost is reported when finished).` : "";
        return pendingResult({
          kind: "video",
          taskId,
          model: model.id,
          estimateUsd: estimate,
          text: `Video render started on ${model.label} (${duration}s).${estText} Task ID: ${taskId}. It takes 2–5 minutes — call check_status with this taskId in 2–3 minutes. Tell the user the video is rendering.`,
        });
      } catch (err) {
        return failResult(`Video generation error: ${(err as Error).message}`);
      }
    }
  );

  // ── check_status ──────────────────────────────────────────────────────────
  server.registerTool(
    "check_status",
    {
      title: "Check generation status",
      description:
        "Check whether an image or video generation is finished, using the taskId returned by generate_image or generate_video. If finished, this returns the media URL and the real cost — share both with the user (the URL expires in ~14 days). If still processing, wait 1–2 minutes and call again; video clips typically take 2–5 minutes total. If it failed, the error message says why (e.g. insufficient credits or a blocked prompt).",
      inputSchema: z.object({
        taskId: z
          .string()
          .describe("The taskId from a previous generate_image or generate_video result"),
      }),
      outputSchema: mediaOutput,
    },
    async ({ taskId }) => {
      try {
        const status = await kieGetStatus(taskId);
        if (status.state === "fail") {
          return failResult(
            `Generation failed: ${status.error || "unknown error"}.`,
            { taskId }
          );
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
      title: "Check credit balance",
      description:
        "Check the remaining Kie.ai credit balance on the connected account, in both credits and US dollars. Use this when the user asks about balance or spend, before large batches, or after a generation fails with an insufficient-credit error. Credits are topped up at kie.ai. Free to call.",
      inputSchema: z.object({}),
      outputSchema: z.object({ credits: z.number(), usd: z.number() }),
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
          structuredContent: { credits, usd: Number(dollars.toFixed(2)) },
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
      title: "List available models",
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
        structuredContent: {
          imageModels: KIE_MODELS.map((m) => ({
            id: m.id,
            bestFor: m.bestFor,
            price: m.priceNote,
            resolutions: m.resolutions ?? null,
            supportsReference: m.supportsReference,
          })),
          videoModels: VIDEO_MODELS.map((m) => ({
            id: m.id,
            bestFor: m.bestFor,
            price: m.priceNote,
            durations: m.durations,
            resolutions: m.resolutions ?? null,
            supportsEndFrame: m.supportsEndFrame,
          })),
        },
      };
    }
  );

  // ── save_to_media_library (only when GHL vars are configured) ─────────────
  if (ghlEnabled()) {
    server.registerTool(
      "save_to_media_library",
      {
        title: "Save to GHL Media Library",
        description:
          "Save a generated image or video into this GoHighLevel account's Media Library so it never expires (generated URLs die after about 14 days). Pass the media URL from a finished generation. Returns a permanent GHL-hosted URL — prefer sharing that permanent URL with the user, and use it in funnels, emails, and social posts.",
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
            structuredContent: {
              state: "success",
              ghlUrl: permanent ?? null,
              fileId: saved.fileId ?? null,
            },
          };
        } catch (err) {
          return failResult(`Save to media library failed: ${(err as Error).message}`);
        }
      }
    );
  }
}

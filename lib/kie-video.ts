// Kie AI video models — start-frame → video generation over the same unified
// jobs API as lib/kie.ts (createTask / recordInfo), so polling reuses kieGetStatus.
// Ported from FreshGen Studio (live-verified slugs + param names).
//
// NOTE: Kie's per-model slugs and input field names are NOT consistent. If the
// live API rejects a request, correct the `slug` / `*Param` fields here —
// nothing else in the pipeline needs to change.

import { kieGetStatus, type KieStatus } from "./kie";

const KIE_BASE = "https://api.kie.ai";

export type VideoModel = {
  id: string;
  label: string;
  // Kie createTask model slug for image-to-video.
  slug: string;
  // How the start/end frames are passed to this model:
  //  - "array": BOTH frames go into one ordered array field (framesParam),
  //    index 0 = start, index 1 = end. Kling 3.0 works this way.
  //  - "split": start in startParam, optional end in endParam (older Kling).
  frameMode: "array" | "split";
  framesParam?: string; // array mode
  startParam?: string; // split mode
  startIsArray?: boolean; // split mode — start field expects an array
  endParam?: string; // split mode — undefined → no end frame
  supportsEndFrame: boolean;
  // Selectable clip durations in seconds (sent to Kie as strings).
  durations: string[];
  defaultDuration: string;
  // Selectable output resolutions (labels). Two ways a model takes them:
  //  - modeForResolution: maps the label → a Kie `mode` value (Kling 3.0).
  //  - resolutionParam: the label is sent verbatim under this field name
  //    (Seedance/Wan/Grok use `resolution`). resolutionValueMap remaps a label
  //    to the model's exact API value when they differ (e.g. "4K" → "4k").
  // Omit all for models with no resolution control.
  resolutions?: string[];
  defaultResolution?: string;
  modeForResolution?: Record<string, string>;
  resolutionParam?: string;
  resolutionValueMap?: Record<string, string>;
  // Send duration as a JSON number instead of a string (Seedance wants an int).
  durationIsNumber?: boolean;
  // Fixed extra input fields this model needs (mode is derived per-resolution).
  extraInput?: Record<string, unknown>;
  // Max prompt length this model accepts (chars). Defaults to 2500.
  maxPromptChars?: number;
  // Shown in list_models and on the landing page.
  bestFor: string;
  priceNote: string;
};

export const VIDEO_MODELS: VideoModel[] = [
  {
    id: "kling-2-1-std",
    label: "Kling 2.1 Standard",
    // Single start frame as a `image_url` string. No end frame. Fast/cheap.
    slug: "kling/v2-1-standard",
    frameMode: "split",
    startParam: "image_url",
    startIsArray: false,
    supportsEndFrame: false,
    durations: ["5", "10"],
    defaultDuration: "5",
    bestFor: "fast, cheap clips — the default",
    priceNote: "≈ $0.13 / 5s (measured)",
  },
  {
    id: "kling-3-0",
    label: "Kling 3.0",
    // Verified vs Kie docs (docs.kie.ai/market/kling/kling-3-0): both frames are
    // passed in the `image_urls` array — [firstFrame, lastFrame].
    slug: "kling-3.0/video",
    frameMode: "array",
    framesParam: "image_urls",
    supportsEndFrame: true,
    durations: ["5", "10"],
    defaultDuration: "5",
    // Kling 3.0 controls resolution via `mode`: std ≈ 720p, pro ≈ 1080p, 4K.
    resolutions: ["720p", "1080p", "4K"],
    defaultResolution: "720p",
    modeForResolution: { "720p": "std", "1080p": "pro", "4K": "4K" },
    // multi_shots:false → single-shot mode (image_urls = [start] or [start, end]).
    extraInput: { multi_shots: false, sound: false, aspect_ratio: "16:9" },
    bestFor: "flagship quality, up to 4K, supports an end frame",
    priceNote: "≈ 720p $0.42 · 1080p $0.56 / 5s",
  },
  {
    id: "kling-2-6",
    label: "Kling 2.6 (audio)",
    // Single start frame (image_urls max 1) + native sound. No end frame.
    slug: "kling-2.6/image-to-video",
    frameMode: "array",
    framesParam: "image_urls",
    supportsEndFrame: false,
    durations: ["5", "10"],
    defaultDuration: "5",
    extraInput: { sound: true },
    bestFor: "clips with native audio",
    priceNote: "≈ $0.50 / 5s",
  },
  {
    id: "seedance-2",
    label: "Seedance 2.0",
    // ByteDance flagship i2v. Split frame fields, duration as an INTEGER,
    // resolution sent verbatim ("4K" → "4k"). aspect_ratio:"adaptive" lets it
    // match the start frame, so aspect flows through the frame automatically.
    // Verified vs docs.kie.ai/market/bytedance/seedance-2.
    slug: "bytedance/seedance-2",
    frameMode: "split",
    startParam: "first_frame_url",
    startIsArray: false,
    endParam: "last_frame_url",
    supportsEndFrame: true,
    durations: ["5", "10"],
    defaultDuration: "5",
    durationIsNumber: true,
    resolutions: ["720p", "1080p", "4K"],
    defaultResolution: "720p",
    resolutionParam: "resolution",
    resolutionValueMap: { "4K": "4k" },
    extraInput: { aspect_ratio: "adaptive", generate_audio: false },
    bestFor: "cinematic motion, start+end frames",
    priceNote: "≈ $1.20 / 5s at 720p",
  },
  {
    id: "wan-2-6",
    label: "Wan 2.6",
    // Single start frame in image_urls (max 1). resolution verbatim. No end
    // frame. Verified vs docs.kie.ai/market/wan/2-6-image-to-video.
    slug: "wan/2-6-image-to-video",
    frameMode: "array",
    framesParam: "image_urls",
    supportsEndFrame: false,
    durations: ["5", "10"],
    defaultDuration: "5",
    resolutions: ["720p", "1080p"],
    defaultResolution: "1080p",
    resolutionParam: "resolution",
    bestFor: "HD on a budget",
    priceNote: "≈ $0.50–0.75 / 5s",
  },
  {
    id: "grok-imagine",
    label: "Grok Imagine",
    // Start frame in image_urls. Longer clips (min 6s). resolution 480p/720p.
    // Verified vs docs.kie.ai/market/grok-imagine/image-to-video.
    slug: "grok-imagine/image-to-video",
    frameMode: "array",
    framesParam: "image_urls",
    supportsEndFrame: false,
    durations: ["6", "10"],
    defaultDuration: "6",
    resolutions: ["480p", "720p"],
    defaultResolution: "480p",
    resolutionParam: "resolution",
    extraInput: { mode: "normal" },
    bestFor: "longer cheap clips (6–10s)",
    priceNote: "≈ $0.30 / 6s",
  },
];

export function getVideoModel(id: string): VideoModel {
  return VIDEO_MODELS.find((m) => m.id === id) ?? VIDEO_MODELS[0];
}

// Rough USD cost per SECOND of clip, for the pre-run cost estimate. Kie has no
// quote API and pricing moves, so these are ballpark estimates — TUNE HERE if a
// real bill differs. `perRes` keys match the model's resolution labels; `flat`
// is used for models with no resolution control. Real cost per task comes back
// as creditsConsumed and is always preferred in results.
const VIDEO_COST_PER_SEC: Record<string, { flat?: number; perRes?: Record<string, number> }> = {
  "kling-3-0": { perRes: { "720p": 0.084, "1080p": 0.112, "4K": 0.17 } },
  "kling-2-6": { flat: 0.1 },
  // Measured live 2026-08: 25 credits for a 5s clip = $0.025/sec.
  "kling-2-1-std": { flat: 0.025 },
  "seedance-2": { perRes: { "720p": 0.24, "1080p": 0.36, "4K": 0.6 } },
  "wan-2-6": { perRes: { "720p": 0.1, "1080p": 0.15 } },
  "grok-imagine": { perRes: { "480p": 0.05, "720p": 0.07 } },
};

/**
 * Ballpark USD cost of a single clip: per-second rate × duration. Returns null
 * when we have no rate for the model. Always an estimate — Kie doesn't expose
 * a quote API.
 */
export function estimateVideoCost(
  modelId: string,
  duration: string,
  resolution?: string
): number | null {
  const p = VIDEO_COST_PER_SEC[modelId];
  const secs = Number(duration) || 0;
  if (!p || !secs) return null;
  const res = resolution ?? getVideoModel(modelId).defaultResolution ?? "";
  const perSec = p.perRes ? p.perRes[res] ?? Object.values(p.perRes)[0] : p.flat;
  if (perSec == null) return null;
  return perSec * secs;
}

export type CreateVideoTaskInput = {
  model: string; // VideoModel id
  prompt: string;
  startFrameUrl: string;
  endFrameUrl?: string;
  duration: string;
  resolution?: string; // label, e.g. "720p" / "1080p"
  // Overrides a fixed extraInput aspect_ratio (Kling 3.0 hardcodes "16:9").
  // Models with aspect_ratio:"adaptive" (Seedance) keep it — the aspect flows
  // through the start frame instead.
  aspectRatio?: string;
};

// Create a Kie image-to-video task and return its taskId. Poll it with
// kieGetStatus (the result url lands in resultUrls, same as images).
export async function kieCreateVideoTask(input: CreateVideoTaskInput): Promise<string> {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY missing");

  const model = getVideoModel(input.model);
  const hasEnd = Boolean(input.endFrameUrl && model.supportsEndFrame);

  // Kling (and most Kie video models) reject prompts over 2500 chars with a 422.
  // Cap defensively.
  const maxChars = model.maxPromptChars ?? 2500;
  const prompt =
    input.prompt.length > maxChars ? input.prompt.slice(0, maxChars).trimEnd() : input.prompt;

  const inputObj: Record<string, unknown> = {
    prompt,
    duration: model.durationIsNumber ? Number(input.duration) : input.duration,
    ...(model.extraInput ?? {}),
  };

  if (
    input.aspectRatio &&
    typeof inputObj.aspect_ratio === "string" &&
    inputObj.aspect_ratio !== "adaptive"
  ) {
    inputObj.aspect_ratio = input.aspectRatio;
  }

  // Resolution is sent one of two ways (per model):
  if (model.defaultResolution) {
    const resLabel = input.resolution ?? model.defaultResolution;
    if (model.modeForResolution) {
      // Mapped to a Kie `mode` value (Kling 3.0: std/pro/4K).
      inputObj.mode =
        model.modeForResolution[resLabel] ?? model.modeForResolution[model.defaultResolution];
    } else if (model.resolutionParam) {
      // Sent verbatim under the model's field name (remapped if needed).
      inputObj[model.resolutionParam] = model.resolutionValueMap?.[resLabel] ?? resLabel;
    }
  }

  if (model.frameMode === "array") {
    // Both frames in one ordered array: [start] or [start, end].
    const frames = [input.startFrameUrl];
    if (hasEnd) frames.push(input.endFrameUrl as string);
    inputObj[model.framesParam ?? "image_urls"] = frames;
  } else {
    // Split fields: start in startParam, end in endParam.
    const startKey = model.startParam ?? "image_url";
    inputObj[startKey] = model.startIsArray ? [input.startFrameUrl] : input.startFrameUrl;
    if (hasEnd && model.endParam) inputObj[model.endParam] = input.endFrameUrl;
  }

  const body = { model: model.slug, input: inputObj };

  const res = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kie createTask (video) ${res.status}: ${text}`);
  }
  const json = await res.json();
  const taskId = json?.data?.taskId ?? json?.taskId;
  if (!taskId)
    throw new Error(`Kie createTask (video): no taskId in ${JSON.stringify(json)}`);
  return taskId as string;
}

export type { KieStatus };
export { kieGetStatus };

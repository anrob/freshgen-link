// Kie AI client — image generation over the unified jobs API.
// Docs: https://docs.kie.ai
// Ported from FreshGen Studio (live-verified model slugs + param names).

const KIE_BASE = "https://api.kie.ai";

export type KieModel = {
  id: string;
  label: string;
  // Kie model slug for text-to-image (verified against the live API)
  slug: string;
  // Slug to use when reference images are attached (defaults to slug)
  refSlug?: string;
  // JSON field name the model expects for reference images when refs are attached.
  // Verified per-model against Kie docs — they are NOT consistent.
  refImageParam?: string;
  supportsReference: boolean;
  // Resolution tiers this model exposes, and the JSON field they're sent under.
  // The field name is NOT consistent across models (verified vs Kie docs):
  //   gpt-image-2 / nano-banana-pro → "resolution"
  //   seedream-4                    → "image_resolution"
  // Models with no resolution control omit both.
  resolutions?: string[];
  resolutionParam?: string;
  // Shown in list_models and on the landing page. Prices are estimates ("≈") —
  // Kie has no quote API; real cost per task comes back as creditsConsumed.
  bestFor: string;
  priceNote: string;
};

// The resolution tiers actually available for a model + aspect combo. Two GPT
// Image 2 quirks on Kie:
//   - no 4K at 1:1
//   - 4:5 and 5:4 are TEMPORARILY blocked above 1K (2K/4K → HTTP 422 "Sorry,
//     generation for 4:5 and 5:4 aspect ratios is temporarily unavailable").
//     Verified live against Kie; other models (nano-banana-pro, seedream-4) are
//     NOT affected. Remove the 4:5/5:4 clamp once Kie restores those tiers.
export function availableResolutions(modelId: string, aspectRatio: string): string[] {
  const model = KIE_MODELS.find((m) => m.id === modelId);
  let res = model?.resolutions ?? [];
  if (modelId === "gpt-image-2") {
    if (aspectRatio === "1:1") res = res.filter((r) => r !== "4K");
    if (aspectRatio === "4:5" || aspectRatio === "5:4") res = res.filter((r) => r === "1K");
  }
  return res;
}

// The valid resolution tier for a model + aspect combo. Keeps the requested
// choice if still available, else the model's lowest tier. Returns undefined
// for models without resolution control.
export function normalizeResolution(
  modelId: string,
  aspectRatio: string,
  stored?: string
): string | undefined {
  const res = availableResolutions(modelId, aspectRatio);
  if (res.length === 0) return undefined;
  return res.includes(stored ?? "") ? stored : res[0];
}

export const KIE_MODELS: KieModel[] = [
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    slug: "gpt-image-2-text-to-image",
    refSlug: "gpt-image-2-image-to-image",
    refImageParam: "input_urls",
    supportsReference: true,
    resolutions: ["1K", "2K", "4K"],
    resolutionParam: "resolution",
    bestFor: "text, logos, typography, signs, menus — anything with words in it",
    priceNote: "≈ $0.04 / image (1K)",
  },
  {
    id: "nano-banana-pro",
    label: "Nano Banana Pro (Gemini 3)",
    slug: "nano-banana-pro",
    // Reference images go under "image_input" for Nano Banana Pro — NOT
    // "image_urls" (verified vs Kie docs). Wrong field = images silently ignored.
    refImageParam: "image_input",
    supportsReference: true,
    resolutions: ["1K", "2K", "4K"],
    resolutionParam: "resolution",
    bestFor: "photorealism, people, product shots with a reference image",
    priceNote: "≈ $0.09 / image (1K)",
  },
  {
    id: "nano-banana",
    label: "Nano Banana (Gemini 2.5)",
    slug: "google/nano-banana",
    refImageParam: "image_urls",
    supportsReference: true,
    bestFor: "cheap drafts and quick concepts",
    priceNote: "≈ $0.02 / image",
  },
  {
    id: "nano-banana-2",
    label: "Nano Banana 2",
    slug: "nano-banana-2",
    supportsReference: false,
    bestFor: "fast all-round quality at a low price",
    priceNote: "≈ $0.04 / image (1K)",
  },
  {
    id: "seedream-4",
    label: "Seedream 4.0",
    slug: "bytedance/seedream-v4-text-to-image",
    refImageParam: "image_urls",
    supportsReference: true,
    resolutions: ["1K", "2K", "4K"],
    resolutionParam: "image_resolution",
    bestFor: "stylized art, illustration, bold color",
    priceNote: "≈ $0.03 / image",
  },
  {
    id: "imagen-4",
    label: "Imagen 4",
    slug: "google/imagen4",
    supportsReference: false,
    bestFor: "clean commercial photography looks (no reference images)",
    priceNote: "≈ $0.03 / image",
  },
];

export function getImageModel(id: string): KieModel {
  return KIE_MODELS.find((m) => m.id === id) ?? KIE_MODELS[0];
}

export type CreateTaskInput = {
  model: string;
  prompt: string;
  imageUrls?: string[];
  // Field name to pass the reference images under (model-specific)
  imageParam?: string;
  aspectRatio?: string;
  size?: string;
  // Resolution tier (e.g. "1K"/"2K"/"4K") + the model-specific field name it
  // is sent under. Both must be set for the resolution to be applied.
  resolution?: string;
  resolutionParam?: string;
  // Kie POSTs the task result here when it completes (top-level field,
  // verified vs Kie docs). Payload mirrors recordInfo.
  callBackUrl?: string;
};

export async function kieCreateTask(input: CreateTaskInput): Promise<string> {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY missing");

  const imageParam = input.imageParam || "image_urls";
  const body: Record<string, unknown> = {
    model: input.model,
    ...(input.callBackUrl ? { callBackUrl: input.callBackUrl } : {}),
    input: {
      prompt: input.prompt,
      ...(input.imageUrls?.length ? { [imageParam]: input.imageUrls } : {}),
      ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
      ...(input.size ? { image_size: input.size } : {}),
      ...(input.resolution && input.resolutionParam
        ? { [input.resolutionParam]: input.resolution }
        : {}),
      output_format: "png",
    },
  };

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
    throw new Error(`Kie createTask ${res.status}: ${text}`);
  }
  const json = await res.json();
  const taskId = json?.data?.taskId ?? json?.taskId;
  if (!taskId) throw new Error(`Kie createTask: no taskId in ${JSON.stringify(json)}`);
  return taskId as string;
}

export type KieStatus = {
  state: "waiting" | "queuing" | "generating" | "success" | "fail";
  resultUrls: string[];
  // Real credits charged for the task, when Kie reports it (creditsConsumed).
  credits?: number;
  error?: string;
  raw: unknown;
};

export async function kieGetStatus(taskId: string): Promise<KieStatus> {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY missing");

  const res = await fetch(
    `${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kie recordInfo ${res.status}: ${text}`);
  }
  const json = await res.json();
  const data = json?.data ?? json;
  const stateRaw = String(data?.state ?? data?.status ?? "waiting").toLowerCase();
  const state =
    stateRaw === "success" || stateRaw === "completed" || stateRaw === "succeeded"
      ? "success"
      : stateRaw === "fail" || stateRaw === "failed" || stateRaw === "error"
      ? "fail"
      : stateRaw === "generating" || stateRaw === "running"
      ? "generating"
      : stateRaw === "queuing" || stateRaw === "pending"
      ? "queuing"
      : "waiting";

  let resultUrls: string[] = [];
  const resultJson = data?.resultJson ?? data?.result ?? data?.output;
  if (resultJson) {
    try {
      const parsed = typeof resultJson === "string" ? JSON.parse(resultJson) : resultJson;
      resultUrls =
        parsed?.resultUrls ??
        parsed?.images ??
        parsed?.image_urls ??
        (parsed?.url ? [parsed.url] : []);
      if (!resultUrls) resultUrls = [];
      if (typeof resultUrls === "string") resultUrls = [resultUrls];
    } catch {
      // ignore
    }
  }

  const creditsRaw = data?.creditsConsumed ?? data?.costCredits;
  const credits = Number(creditsRaw);

  return {
    state,
    resultUrls: Array.isArray(resultUrls) ? resultUrls : [],
    credits: Number.isFinite(credits) && credits > 0 ? credits : undefined,
    error: data?.failMsg ?? data?.error,
    raw: json,
  };
}

// Remaining account credits. Kie returns { code, msg, data } where data is the
// integer balance (a single number — no plan/quota max is exposed).
// Docs: https://docs.kie.ai/common-api/get-account-credits
export async function kieGetCredits(): Promise<number> {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY missing");

  const res = await fetch(`${KIE_BASE}/api/v1/chat/credit`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kie credit ${res.status}: ${text}`);
  }
  const json = await res.json();
  const data = json?.data;
  const credits = typeof data === "number" ? data : Number(data);
  if (!Number.isFinite(credits)) {
    throw new Error(`Kie credit: unexpected response ${JSON.stringify(json)}`);
  }
  return credits;
}

export const USD_PER_CREDIT = 0.005;

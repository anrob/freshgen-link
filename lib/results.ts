// Tool-result builder. GHL's (and most chat clients') inline rendering of MCP
// media is inconsistent, so every success result carries, in order:
//   1. a text block with a markdown image AND a bare URL (most portable)
//   2. a resource_link block (spec-native)
//   3. a base64 image block, only for images under MAX_BASE64_BYTES
// plus structuredContent for automations. Video is never base64'd.

import type { CallToolResult } from "@modelcontextprotocol/server";
import { USD_PER_CREDIT } from "./kie";

export const MAX_BASE64_BYTES = 900_000; // stay far under Vercel's 4.5MB response cap
const FETCH_TIMEOUT_MS = 8_000;

export type MediaResultInput = {
  kind: "image" | "video";
  url: string;
  prompt: string;
  model: string;
  taskId: string;
  credits?: number;
};

type Content = CallToolResult["content"][number];

export function usd(credits?: number): string | undefined {
  if (credits == null) return undefined;
  return `$${(credits * USD_PER_CREDIT).toFixed(3).replace(/0$/, "")}`;
}

// Fetch the image and return base64 only if it's small enough. Any failure or
// slow response → undefined (the block is simply omitted). Doubles as a URL
// liveness check for the preview; the text/link blocks stand on their own.
async function smallImageBase64(
  url: string
): Promise<{ data: string; mimeType: string } | undefined> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return undefined;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > MAX_BASE64_BYTES) return undefined;
    const mimeType = res.headers.get("content-type")?.split(";")[0] || "image/png";
    if (!mimeType.startsWith("image/")) return undefined;
    return { data: Buffer.from(buf).toString("base64"), mimeType };
  } catch {
    return undefined;
  }
}

export async function mediaResult(input: MediaResultInput): Promise<CallToolResult> {
  const { kind, url, prompt, model, taskId, credits } = input;
  const cost = usd(credits);
  const snippet = prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt;
  const isImage = kind === "image";

  const lines = [
    isImage ? "Image generated." : "Video ready.",
    "",
    ...(isImage ? [`![${snippet.replace(/[\[\]]/g, "")}](${url})`, ""] : []),
    `Direct URL: ${url}`,
    `Model: ${model}${cost ? ` · Cost: ${cost} (${credits} credits)` : ""}`,
    `This URL expires in ~14 days — download it or save it to the media library now.`,
  ];

  const content: Content[] = [
    { type: "text", text: lines.join("\n") },
    {
      type: "resource_link",
      uri: url,
      name: `${model} ${kind}`,
      mimeType: isImage ? "image/png" : "video/mp4",
      annotations: { audience: ["user"], priority: 0.9 },
    },
  ];

  if (isImage) {
    const b64 = await smallImageBase64(url);
    if (b64) {
      content.push({
        type: "image",
        data: b64.data,
        mimeType: b64.mimeType,
        annotations: { audience: ["user"], priority: 0.9 },
      });
    }
  }

  return {
    content,
    structuredContent: {
      state: "success" as const,
      kind,
      url,
      model,
      taskId,
      ...(credits != null ? { credits, costUsd: credits * USD_PER_CREDIT } : {}),
    },
  };
}

export function pendingResult(input: {
  kind?: "image" | "video";
  taskId: string;
  model?: string;
  state?: string;
  text: string;
  estimateUsd?: number | null;
}): CallToolResult {
  return {
    content: [{ type: "text", text: input.text }],
    structuredContent: {
      state: "pending" as const,
      taskId: input.taskId,
      ...(input.kind ? { kind: input.kind } : {}),
      ...(input.model ? { model: input.model } : {}),
      ...(input.estimateUsd != null ? { estimatedCostUsd: input.estimateUsd } : {}),
    },
  };
}

export function failResult(
  message: string,
  extra?: Record<string, unknown>
): CallToolResult {
  return {
    content: [{ type: "text", text: message }],
    structuredContent: { state: "fail" as const, ...extra },
    isError: true,
  };
}

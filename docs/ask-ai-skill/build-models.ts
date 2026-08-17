/**
 * Generate one Ask AI skill per model: docs/ask-ai-skill/models/<model-id>/SKILL.md
 * Also writes the Lite edition of the gpt-image-2 skill to
 * docs/ask-ai-skill/lite/gpt-image-2/SKILL.md — same file minus the BRAND block,
 * video references and the model parameter (a Lite server has none of those).
 *
 * Imports the REAL model definitions from lib/kie.ts and lib/kie-video.ts, so
 * ids, prices, resolutions, durations and reference-image support can never
 * drift from what the server actually accepts. Shared sections (what FreshGen
 * is, prompt writing, sizes, BRAND, money/retry/delivery rules) are lifted
 * verbatim from the master SKILL.md — same approach as build-commands.py.
 * Only the per-model prompting tips below are hand-written.
 *
 * Usage (from repo root):  npx tsx docs/ask-ai-skill/build-models.ts
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KIE_MODELS } from "../../lib/kie";
import { VIDEO_MODELS } from "../../lib/kie-video";

const HERE = dirname(fileURLToPath(import.meta.url));
const MASTER = readFileSync(join(HERE, "SKILL.md"), "utf8");
const OUT = join(HERE, "models");

// ── Shared sections from the master ────────────────────────────────────────
const body = MASTER.replace(/^---\n[\s\S]*?\n---\n/, "");
const sections = new Map<number, { title: string; text: string }>();
for (const m of body.matchAll(/^## (\d+)\. (.+?)\n([\s\S]*?)(?=^## \d+\. |(?![\s\S]))/gm)) {
  sections.set(Number(m[1]), { title: m[2].trim(), text: m[3].trim() });
}
const sec = (n: number) => {
  const s = sections.get(n)!;
  return `## ${s.title}\n\n${s.text}`;
};

// ── Hand-written prompting tips (the only non-derived content) ─────────────
const IMAGE_TIPS: Record<string, string> = {
  "gpt-image-2": `- Put the exact words you want rendered in quotes: \`a chalkboard menu that reads "Tacos $3 · Horchata $2"\`. Say where the text sits and how it should feel (hand-lettered, clean sans-serif, neon, embossed).
- Best pick for menus, signs, posters, packaging, UI mockups, thumbnails with titles, and logos with wordmarks.
- \`--ref <url>\` switches to image-to-image: use it to restyle, extend, or edit an existing image while keeping its layout.
- Resolution: \`1K\` for social, \`2K\` for print/hero; \`4K\` is not available at \`1:1\`, and \`4:5\`/\`5:4\` cap at \`1K\` — the tool clamps automatically.
- Weak spots: photoreal human faces and heavy photographic realism — use \`nano-banana-pro\` for those.`,
  "nano-banana-pro": `- The photorealism and likeness model. Pass up to 4 \`--ref\` images of the person or product to keep faces and products consistent across a set.
- Write like a photographer: lens and framing ("85mm portrait, shallow depth of field"), light ("soft window light from the left", "golden hour"), surface and material detail.
- The most expensive image model — use it for hero shots, headshots, product photography, and anything a client will look at closely; draft with \`nano-banana\` first.
- Text inside the image is a weakness — if words matter, use \`gpt-image-2\`.`,
  "nano-banana": `- The cheapest model — use it to explore concepts, make thumbnails, and iterate on composition before spending on a final render.
- Supports \`--ref\` images, so you can rough out a likeness or product placement cheaply, then re-run the winner on \`nano-banana-pro\`.
- Fixed resolution (no \`--res\` flag). Don't rely on it for fine text or fine detail.`,
  "nano-banana-2": `- Fast, low-cost, good all-rounder — the sensible default when the request has no text in the image and no reference photo.
- No reference images and no \`--res\` flag; if either is needed, pick another model.
- Great for quick social visuals, blog headers, and concept boards.`,
  "seedream-4": `- The stylized/illustration model. Name the art style explicitly: "flat vector illustration", "editorial line drawing", "watercolor", "anime cel shading", "bold risograph poster".
- Loves color direction — give it a palette ("mustard, teal and cream") and it will commit.
- Supports \`--ref\` images and \`1K/2K/4K\`; \`2K\` is a good default for anything printed.
- Not for photorealism or legible text.`,
  "imagen-4": `- Clean, commercial photography look — studio product shots, lifestyle scenes, stock-style imagery with a polished finish.
- No reference images: describe the product/scene fully in words (material, color, lighting setup, backdrop, camera angle).
- Fixed resolution. Prefer it when you want a "brand catalogue" feel without providing photos.`,
};

const VIDEO_TIPS: Record<string, string> = {
  "kling-2-1-std": `- The default: fastest and cheapest. Describe ONE clear motion and ONE camera move ("steam rises, slow push-in"), keep the subject count low, and let the start image carry the look.
- Best for social clips, product spins, and quick animations of a hero image.`,
  "kling-3-0": `- Flagship quality with 720p/1080p/4K output. Use it when the client will judge the footage closely — hero videos, ads, website loops.
- Give it cinematic direction: shot type, camera movement, pacing, light changes. It rewards specificity.
- Quote the cost before starting — it's several times the default model.`,
  "kling-2-6": `- Generates the clip WITH sound. Describe the ambience you want in the prompt ("café chatter, espresso machine hiss, soft jazz") — keep it to atmosphere, not scripted dialogue.
- Good for reels and product teasers where a silent clip would feel flat.
- Costs more than the default; say so before running.`,
  "seedance-2": `- The cinematic model — the most expensive video option; always confirm the price first.
- Speak in film language: "slow crane up", "rack focus from foreground to subject", "handheld drift", "anamorphic feel". 720p/1080p/4K.
- Reserve it for brand films and premium spots, not everyday social clips.`,
  "wan-2-6": `- HD (720p/1080p) at a mid price. Reliable for simple, smooth motions — pans across a scene, gentle subject movement, background life.
- Keep prompts simple; complex multi-subject action is not its strength.`,
  "grok-imagine": `- Longer, cheap clips: 6 or 10 seconds at 480p/720p. Good for background loops, ambient b-roll, and long social filler.
- Keep the prompt to one continuous motion; don't expect fine detail at 480p.`,
};

// Human, FUNCTIONAL titles. Ask AI auto-titles uploaded skills from content with a
// functional phrase and drops proper nouns ("gpt-image-2" became "Image
// Generation Assistant"), so each headline must be a distinct functional phrase
// with the model name in parentheses, or every image-model skill collides.
const IMAGE_TITLES: Record<string, string> = {
  "gpt-image-2": "Text and Logo Image Generator",
  "nano-banana-pro": "Photorealistic Image Generator",
  "nano-banana": "Cheap Draft Image Generator",
  "nano-banana-2": "Fast All-Round Image Generator",
  "seedream-4": "Illustration and Stylized Art Generator",
  "imagen-4": "Commercial Photo Look Generator",
};
const VIDEO_TITLES: Record<string, string> = {
  "kling-2-1-std": "Fast Cheap Video Generator",
  "kling-3-0": "Flagship 4K Video Generator",
  "kling-2-6": "Video with Audio Generator",
  "seedance-2": "Cinematic Video Generator",
  "wan-2-6": "Budget HD Video Generator",
  "grok-imagine": "Long Cheap Video Generator",
};

// ── Assemble ───────────────────────────────────────────────────────────────
type Out = { id: string; words: number };
const outputs: Out[] = [];

function write(id: string, fm: string, text: string, base = OUT, label = id) {
  const dir = join(base, id);
  mkdirSync(dir, { recursive: true });
  const full = `${fm}\n${text.trimEnd()}\n`;
  writeFileSync(join(dir, "SKILL.md"), full);
  outputs.push({ id: label, words: text.split(/\s+/).length });
}

// Lite = the gpt-image-2 skill with everything a Lite server can't do cut out:
// no BRAND block (brand is an Agency feature), no video, no model picker.
function liteify(text: string): string {
  return text
    // Whole BRAND block section (up to the next H2).
    .replace(/## BRAND block[\s\S]*?(?=\n## )/, "")
    .replace(/ Prepend the BRAND block style unless the user says otherwise\./, "")
    // Lite generate_image has no `model` field.
    .replace(/call `generate_image` with `model: "gpt-image-2"` and `prompt`/, "call `generate_image` with `prompt`")
    // Video references.
    .replace(/\n- \*Real-estate listing video\.\*[^\n]*/, "")
    .replace(/\n\nFor video versions of the above[^\n]*/, "")
    .replace(/FreshGen gives you six tools — `generate_image`, `generate_video`, `check_status`, `check_credits`, `list_models`, and `save_to_media_library` — that call Kie\.ai's image and video models directly from this chat\./, "FreshGen Link Lite gives you four tools — `generate_image` (GPT Image 2 only), `check_status`, `check_credits` and `list_models`, plus `save_to_media_library` when a Media Library connection is configured — that call Kie.ai's GPT Image 2 model directly from this chat. There is no video and no other image model on Lite: if the user asks for either, say so and mention that FreshGen Link Full (\$47 one-time) adds them — https://iamjustfresh.gumroad.com/l/freshgen-link.")
    .replace(/finished images and video are also copied/, "finished images are also copied")
    .replace(/- Every `generate_image` and `generate_video` call is real money/, "- Every `generate_image` call is real money")
    .replace(/\n- For video, quote the estimated cost[^\n]*/, "")
    .replace(/more than 4 images or more than 2 videos in one turn/, "more than 4 images in one turn")
    .replace(/\n- `generate_video` never returns the finished clip[^\n]*/, "")
    .replace(/ \(video: 1–2 more minutes\)/, "");
}

for (const m of KIE_MODELS) {
  const flags = [
    "[--ar 16:9 / 1:1 / 9:16 / 4:5]",
    m.resolutions ? `[--res ${m.resolutions.join(" / ")}]` : null,
    m.supportsReference ? "[--ref <url>]" : null,
  ].filter(Boolean).join(" ");
  const fm = `---
name: ${m.id}
description: ${IMAGE_TITLES[m.id] ?? m.label} (${m.label}) — FreshGen image model skill. Generate an image with the ${m.label} model (\`${m.id}\`), best for ${m.bestFor}. Use when the user types /${m.id}, names this model, or the request clearly fits it. Real money (${m.priceNote.replace(/^≈ ?/, "about ")}), billed to the connected Kie.ai account.
---
`;
  const text = `# ${IMAGE_TITLES[m.id] ?? m.label} (${m.label})

**${IMAGE_TITLES[m.id] ?? m.label}** — the FreshGen skill for the ${m.label} model, best for ${m.bestFor}. Slash command: \`/${m.id}\`.

## The \`/${m.id}\` command

Signature: \`/${m.id} <prompt> ${flags}\`

When a message begins with this command (or names this model), call \`generate_image\` with \`model: "${m.id}"\` and \`prompt\` = the user's prompt. Map flags to parameters: \`--ar\` → \`aspectRatio\` (default \`1:1\`)${m.resolutions ? `, \`--res\` → \`resolution\` (${m.resolutions.join("/")}; default \`1K\`)` : ""}${m.supportsReference ? ", `--ref` → `referenceImageUrls` (repeat up to 4 times)" : ""}. ${m.supportsReference ? "" : "This model does NOT accept reference images — if the user provides one, say so and suggest `nano-banana-pro` or `gpt-image-2` instead. "}${m.resolutions ? "" : "This model renders at a fixed resolution — there is no `--res` flag. "}Prepend the BRAND block style unless the user says otherwise.

## About this model

| | |
|---|---|
| Model id | \`${m.id}\` |
| Best for | ${m.bestFor} |
| Approx. cost | ${m.priceNote} |
| Resolutions | ${m.resolutions ? m.resolutions.join(", ") : "fixed"} |
| Reference images | ${m.supportsReference ? "yes, up to 4" : "no"} |

## Prompting tips for ${m.label}

${IMAGE_TIPS[m.id] ?? "- Describe subject, setting, style, lighting, composition and mood."}

${sec(3)}

${sec(5)}

${sec(6)}

${sec(1)}

${sec(7)}

${sec(8)}

${sec(9)}
`;
  write(m.id, fm, text);
  if (m.id === "gpt-image-2") {
    write(m.id, fm, liteify(text), join(HERE, "lite"), "lite/gpt-image-2");
  }
}

for (const v of VIDEO_MODELS) {
  const flags = [
    "[--from <imageUrl>]",
    `[--sec ${v.durations.join(" / ")}]`,
    v.resolutions ? `[--res ${v.resolutions.join(" / ")}]` : null,
    "[--ar 16:9 / 9:16 / 1:1]",
  ].filter(Boolean).join(" ");
  const fm = `---
name: ${v.id}
description: ${VIDEO_TITLES[v.id] ?? v.label} (${v.label}) — FreshGen video model skill. Render a short video with the ${v.label} model (\`${v.id}\`), best for ${v.bestFor}. Use when the user types /${v.id}, names this model, or the request clearly fits it. Real money (${v.priceNote.replace(/^≈ ?/, "about ")}), billed to the connected Kie.ai account; quote the cost before starting.
---
`;
  const text = `# ${VIDEO_TITLES[v.id] ?? v.label} (${v.label})

**${VIDEO_TITLES[v.id] ?? v.label}** — the FreshGen skill for the ${v.label} video model, best for ${v.bestFor}. Slash command: \`/${v.id}\`.

## The \`/${v.id}\` command

Signature: \`/${v.id} <prompt> ${flags}\`

When a message begins with this command (or names this model): first state the estimated cost for the chosen duration${v.resolutions ? " and resolution" : ""} (see below), then call \`generate_video\` with \`model: "${v.id}"\` and \`prompt\` = the user's prompt. Map flags: \`--from\` → \`startImageUrl\` (animate that exact image; omit to auto-generate a start frame, which adds ~$0.04 and ~30s), \`--sec\` → \`duration\` (${v.durations.join(" or ")}; default \`${v.defaultDuration}\`)${v.resolutions ? `, \`--res\` → \`resolution\` (${v.resolutions.join("/")})` : ""}, \`--ar\` → \`aspectRatio\` (default \`16:9\`). The tool only STARTS the render and returns a task id — tell the user it takes 2–5 minutes, and only call \`check_status\` once, after 2–3 minutes, if they ask. Finished clips auto-save to the GHL Media Library when that is configured.

## About this model

| | |
|---|---|
| Model id | \`${v.id}\` |
| Best for | ${v.bestFor} |
| Approx. cost | ${v.priceNote} |
| Durations | ${v.durations.join(", ")} seconds (default ${v.defaultDuration}) |
| Resolutions | ${v.resolutions ? v.resolutions.join(", ") : "fixed"} |

## Prompting tips for ${v.label}

${VIDEO_TIPS[v.id] ?? "- Describe one clear motion and one camera move."}

${sec(6)}

${sec(1)}

${sec(7)}

${sec(8)}

${sec(9)}
`;
  write(v.id, fm, text);
}

for (const o of outputs) console.log(`models/${o.id}/SKILL.md  ${o.words} words`);

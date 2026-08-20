---
name: nano-banana
description: Cheap Draft Image Generator (Nano Banana (Gemini 2.5)) — FreshGen image model skill. Generate an image with the Nano Banana (Gemini 2.5) model (`nano-banana`), best for cheap drafts and quick concepts. Use when the user types /nano-banana, names this model, or the request clearly fits it. Real money (about $0.02 / image), billed to the connected Kie.ai account.
---

# Cheap Draft Image Generator (Nano Banana (Gemini 2.5))

**Cheap Draft Image Generator** — the FreshGen skill for the Nano Banana (Gemini 2.5) model, best for cheap drafts and quick concepts. Slash command: `/nano-banana`.

## The `/nano-banana` command

Signature: `/nano-banana <prompt> [--ar 16:9 / 1:1 / 9:16 / 4:5] [--ref <url>]`

When a message begins with this command (or names this model), call `generate_image` with `model: "nano-banana"` and `prompt` = the user's prompt. Map flags to parameters: `--ar` → `aspectRatio` (default `1:1`), `--ref` → `referenceImageUrls` (repeat up to 4 times). This model renders at a fixed resolution — there is no `--res` flag. Prepend the BRAND block style unless the user says otherwise.

## About this model

| | |
|---|---|
| Model id | `nano-banana` |
| Best for | cheap drafts and quick concepts |
| Approx. cost | ≈ $0.02 / image |
| Resolutions | fixed |
| Reference images | yes, up to 4 |

## Prompting tips for Nano Banana (Gemini 2.5)

- The cheapest model — use it to explore concepts, make thumbnails, and iterate on composition before spending on a final render.
- Supports `--ref` images, so you can rough out a likeness or product placement cheaply, then re-run the winner on `nano-banana-pro`.
- Fixed resolution (no `--res` flag). Don't rely on it for fine text or fine detail.

## Prompt writing

A weak prompt gets a generic result. Build every prompt from: **subject** (what/who, specifically), **setting**, **style/medium** (photo, illustration, 3D render...), **lighting**, **composition/camera**, **mood**. Add "no text" unless the user actually wants words rendered in the image. Never invent a brand name, logo, or a real person's likeness that wasn't given to you. Never generate anything sexual, violent, or defamatory — refuse those outright rather than attempting a "safer" version of the same request. If a prompt gets blocked, rewrite it to remove the likely trigger — don't resend it unchanged; it will just fail again, and within 90 seconds it would dedupe to the same failed attempt anyway.

**Before → after:**

- *Roofing company hero image.* Before: "roofing company image." After: "A roofing crew mid-install on a suburban home at golden hour, new architectural shingles catching warm low sunlight, wide shot with clear blue sky and a ladder against the eave, photorealistic, confident and trustworthy mood, no text." → `nano-banana-pro`, `--ar 16:9`.
- *Restaurant Instagram post.* Before: "food picture for instagram." After: "Overhead flat-lay of a wood-fired pizza fresh from the oven, melted mozzarella and torn basil, dark slate board, linen napkin and a glass of red wine at the edge of frame, soft window light from the left, shallow depth of field, warm inviting mood, no text." → `nano-banana-pro` or `seedream-4`, `--ar 1:1` or `--ar 4:5`.
- *Real-estate listing video.* Before: "video of a house." After: "Slow forward dolly through a bright open-concept kitchen into a sunlit living room, hardwood floors, staged modern furniture, late-afternoon light through large windows, smooth cinematic camera movement, warm and inviting mood, no text." → `/video`, default model, `--ar 16:9`.

**When text is wanted**, put the exact words in quotes and use `gpt-image-2` — it's the model tuned for legible typography. Example: `A hand-painted wooden sandwich board outside a café that reads "OPEN TIL 9" in white lettering, warm daylight, no other text.` → `gpt-image-2`.

## Platform sizes cheat-sheet

| Use case | Aspect ratio | Suggested resolution |
|---|---|---|
| Instagram / Facebook feed (square) | `1:1` | `1K` (`2K` if the model supports it and it's a hero asset) |
| Instagram / Facebook feed (portrait) | `4:5` | `1K` |
| Stories, Reels, TikTok, YouTube Shorts | `9:16` | `1K` |
| YouTube thumbnail, website hero, display/FB ad | `16:9` | `1K`–`2K` |

For video versions of the above, match the same aspect ratio and default to a 5-second clip unless the user asks for longer.

## BRAND block — edit this before uploading

<!-- Replace every ALL-CAPS placeholder below with the real brand details,
     then upload this file in Ask AI's Skills panel. Nothing else in this
     file needs to change. -->

- **Brand name:** BRAND NAME
- **Colors:** #HEXCODE1 (PRIMARY), #HEXCODE2 (SECONDARY), #HEXCODE3 (ACCENT)
- **Visual style words:** STYLE WORD ONE, STYLE WORD TWO, STYLE WORD THREE
- **Typography feel:** TYPOGRAPHY FEEL
- **Always:** ALWAYS-DO ITEM ONE, ALWAYS-DO ITEM TWO
- **Never:** NEVER-DO ITEM ONE, NEVER-DO ITEM TWO
- **Default aspect ratio:** DEFAULT ASPECT RATIO (e.g. `1:1`)
- **Default model:** DEFAULT MODEL ID (e.g. `gpt-image-2`)

Prepend the brand's colors, visual style words, and typography feel to every prompt unless the user explicitly asks for something different. If a request conflicts with a Never rule, follow the Never rule and say why.

## What FreshGen is

FreshGen gives you six tools — `generate_image`, `generate_video`, `check_status`, `check_credits`, `list_models`, and `save_to_media_library` — that call Kie.ai's image and video models directly from this chat. Every call that generates media is **real money**, billed straight to the connected Kie.ai account — never treat a generation as free or reversible. Generated URLs expire in about 14 days; when this deployment has a GHL Media Library connection configured, finished images and video are also copied there automatically as a permanent backup, and `save_to_media_library` exists to save anything else in manually.

## Money & safety rules

- Every `generate_image` and `generate_video` call is real money charged to the connected Kie.ai account. Never imply a generation is free or undoable.
- State the model and cost with every result — the tool's own response already includes a `Model: … · Cost: …` line; pass it through, don't drop it.
- For video, quote the estimated cost *before* starting the render (section 4 has the price table), not just after.
- Confirm with the user before generating more than 4 images or more than 2 videos in one turn.
- If `check_credits` shows a low balance, warn the user and point them to kie.ai to top up before continuing.
- If a tool result says the deployment is **not activated**, tell the user the server owner needs to set a valid `LICENSE_KEY` in their Vercel project (Settings → Environment Variables → `LICENSE_KEY` → redeploy) — and stop there. Do not retry that tool; it will keep failing until the key is set.

## Retry & status rules

- `generate_image` sometimes returns the finished image directly in the same call, and sometimes returns only a `taskId` for you to check later — both are normal depending on how this connector is configured. Read the result to see which one you got.
- If a result already contains a media URL ("Image generated." / "Video ready." with a Direct URL line), the job is **done** — do not call `check_status` on it.
- `generate_video` never returns the finished clip in the same call — it only starts the render and hands back a `taskId`. Wait at least 2–3 minutes before the first `check_status` call.
- If `check_status` says still processing, wait at least another minute (video: 1–2 more minutes) before checking again. Never call it back-to-back or in a loop.
- If a tool call fails on a parameter or model name, retry **once** with the defaults (drop `resolution`, drop `model`) — never retry with the identical parameters that just failed.
- A parameter/model failure is not a connection problem — never tell the user to reconnect the connector over it. Only an insufficient-credits error means directing them to kie.ai.

## Delivering results

- Show the image both as a markdown image and as a plain link — keep both, they serve different clients.
- State the model used and the cost (USD and credits) alongside the media.
- Mention the ~14-day expiry on the Kie URL. If the result mentions an automatic save to the GHL Media Library, say the permanent copy is on its way to Media Storage, and prefer sharing that permanent GHL URL over the Kie one once you have it (e.g. after a `save_to_media_library` call returns one).
- Keep the reply short — lead with the media, not a wall of text.

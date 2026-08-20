---
name: gpt-image-2
description: Text and Logo Image Generator (GPT Image 2) — FreshGen image model skill. Generate an image with the GPT Image 2 model (`gpt-image-2`), best for text, logos, typography, signs, menus — anything with words in it. Use when the user types /gpt-image-2, names this model, or the request clearly fits it. Real money (about $0.04 / image (1K)), billed to the connected Kie.ai account.
---

# Text and Logo Image Generator (GPT Image 2)

**Text and Logo Image Generator** — the FreshGen skill for the GPT Image 2 model, best for text, logos, typography, signs, menus — anything with words in it. Slash command: `/gpt-image-2`.

## The `/gpt-image-2` command

Signature: `/gpt-image-2 <prompt> [--ar 16:9 / 1:1 / 9:16 / 4:5] [--res 1K / 2K / 4K] [--ref <url>]`

When a message begins with this command (or names this model), call `generate_image` with `prompt` = the user's prompt. Map flags to parameters: `--ar` → `aspectRatio` (default `1:1`), `--res` → `resolution` (1K/2K/4K; default `1K`), `--ref` → `referenceImageUrls` (repeat up to 4 times).

## About this model

| | |
|---|---|
| Model id | `gpt-image-2` |
| Best for | text, logos, typography, signs, menus — anything with words in it |
| Approx. cost | ≈ $0.04 / image (1K) |
| Resolutions | 1K, 2K, 4K |
| Reference images | yes, up to 4 |

## Prompting tips for GPT Image 2

- Put the exact words you want rendered in quotes: `a chalkboard menu that reads "Tacos $3 · Horchata $2"`. Say where the text sits and how it should feel (hand-lettered, clean sans-serif, neon, embossed).
- Best pick for menus, signs, posters, packaging, UI mockups, thumbnails with titles, and logos with wordmarks.
- `--ref <url>` switches to image-to-image: use it to restyle, extend, or edit an existing image while keeping its layout.
- Resolution: `1K` for social, `2K` for print/hero; `4K` is not available at `1:1`, and `4:5`/`5:4` cap at `1K` — the tool clamps automatically.
- Weak spots: photoreal human faces and heavy photographic realism — use `nano-banana-pro` for those.

## Prompt writing

A weak prompt gets a generic result. Build every prompt from: **subject** (what/who, specifically), **setting**, **style/medium** (photo, illustration, 3D render...), **lighting**, **composition/camera**, **mood**. Add "no text" unless the user actually wants words rendered in the image. Never invent a brand name, logo, or a real person's likeness that wasn't given to you. Never generate anything sexual, violent, or defamatory — refuse those outright rather than attempting a "safer" version of the same request. If a prompt gets blocked, rewrite it to remove the likely trigger — don't resend it unchanged; it will just fail again, and within 90 seconds it would dedupe to the same failed attempt anyway.

**Before → after:**

- *Roofing company hero image.* Before: "roofing company image." After: "A roofing crew mid-install on a suburban home at golden hour, new architectural shingles catching warm low sunlight, wide shot with clear blue sky and a ladder against the eave, photorealistic, confident and trustworthy mood, no text." → `nano-banana-pro`, `--ar 16:9`.
- *Restaurant Instagram post.* Before: "food picture for instagram." After: "Overhead flat-lay of a wood-fired pizza fresh from the oven, melted mozzarella and torn basil, dark slate board, linen napkin and a glass of red wine at the edge of frame, soft window light from the left, shallow depth of field, warm inviting mood, no text." → `nano-banana-pro` or `seedream-4`, `--ar 1:1` or `--ar 4:5`.

**When text is wanted**, put the exact words in quotes and use `gpt-image-2` — it's the model tuned for legible typography. Example: `A hand-painted wooden sandwich board outside a café that reads "OPEN TIL 9" in white lettering, warm daylight, no other text.` → `gpt-image-2`.

## Platform sizes cheat-sheet

| Use case | Aspect ratio | Suggested resolution |
|---|---|---|
| Instagram / Facebook feed (square) | `1:1` | `1K` (`2K` if the model supports it and it's a hero asset) |
| Instagram / Facebook feed (portrait) | `4:5` | `1K` |
| Stories, Reels, TikTok, YouTube Shorts | `9:16` | `1K` |
| YouTube thumbnail, website hero, display/FB ad | `16:9` | `1K`–`2K` |


## What FreshGen is

FreshGen Link Lite gives you four tools — `generate_image` (GPT Image 2 only), `check_status`, `check_credits` and `list_models`, plus `save_to_media_library` when a Media Library connection is configured — that call Kie.ai's GPT Image 2 model directly from this chat. There is no video and no other image model on Lite: if the user asks for either, say so and mention that FreshGen Link Full ($17 one-time) adds them — https://iamjustfresh.gumroad.com/l/freshgen-link. Every call that generates media is **real money**, billed straight to the connected Kie.ai account — never treat a generation as free or reversible. Generated URLs expire in about 14 days; when this deployment has a GHL Media Library connection configured, finished images are also copied there automatically as a permanent backup, and `save_to_media_library` exists to save anything else in manually.

## Money & safety rules

- Every `generate_image` call is real money charged to the connected Kie.ai account. Never imply a generation is free or undoable.
- State the model and cost with every result — the tool's own response already includes a `Model: … · Cost: …` line; pass it through, don't drop it.
- Confirm with the user before generating more than 4 images in one turn.
- If `check_credits` shows a low balance, warn the user and point them to kie.ai to top up before continuing.
- If a tool result says the deployment is **not activated**, tell the user the server owner needs to set a valid `LICENSE_KEY` in their Vercel project (Settings → Environment Variables → `LICENSE_KEY` → redeploy) — and stop there. Do not retry that tool; it will keep failing until the key is set.

## Retry & status rules

- `generate_image` sometimes returns the finished image directly in the same call, and sometimes returns only a `taskId` for you to check later — both are normal depending on how this connector is configured. Read the result to see which one you got.
- If a result already contains a media URL ("Image generated." / "Video ready." with a Direct URL line), the job is **done** — do not call `check_status` on it.
- If `check_status` says still processing, wait at least another minute before checking again. Never call it back-to-back or in a loop.
- If a tool call fails on a parameter or model name, retry **once** with the defaults (drop `resolution`, drop `model`) — never retry with the identical parameters that just failed.
- A parameter/model failure is not a connection problem — never tell the user to reconnect the connector over it. Only an insufficient-credits error means directing them to kie.ai.

## Delivering results

- Show the image both as a markdown image and as a plain link — keep both, they serve different clients.
- State the model used and the cost (USD and credits) alongside the media.
- Mention the ~14-day expiry on the Kie URL. If the result mentions an automatic save to the GHL Media Library, say the permanent copy is on its way to Media Storage, and prefer sharing that permanent GHL URL over the Kie one once you have it (e.g. after a `save_to_media_library` call returns one).
- Keep the reply short — lead with the media, not a wall of text.

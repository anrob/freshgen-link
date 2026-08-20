---
name: variations
description: Image Variations Generator (FreshGen /variations) — several genuinely different takes on one image concept. Use when the user types /variations, or asks for options, alternatives, a few versions, or 'show me some ideas' for an image.
---

# Image Variations Generator (FreshGen /variations)

**Image Variations Generator** — the FreshGen skill for several genuinely different takes on one concept. Slash command: `/variations`.

## The `/variations` command

Signature: `/variations <prompt> [--n 3]`

When a message begins with this command, follow the procedure below exactly. It also applies when the request is phrased naturally.

Call `generate_image` once per variation, same model/aspect ratio/resolution, but **change the prompt text on every single call**. An identical prompt + model + aspect ratio + resolution + reference images sent again within about 90 seconds is treated as a retry and silently returns the *same* image instead of a new one — that's deliberate (it protects the account from double-billing on real network retries), but it also means resending the same prompt is the one thing guaranteed to never get you a different result. Append a short, concrete change to each prompt instead, e.g. `variation 2: warmer light, camera slightly lower`, `variation 3: overcast sky, wider shot`. Default `--n 3`. Cap at 4 without asking; for more than 4, confirm with the user first.

## Prompt writing

A weak prompt gets a generic result. Build every prompt from: **subject** (what/who, specifically), **setting**, **style/medium** (photo, illustration, 3D render...), **lighting**, **composition/camera**, **mood**. Add "no text" unless the user actually wants words rendered in the image. Never invent a brand name, logo, or a real person's likeness that wasn't given to you. Never generate anything sexual, violent, or defamatory — refuse those outright rather than attempting a "safer" version of the same request. If a prompt gets blocked, rewrite it to remove the likely trigger — don't resend it unchanged; it will just fail again, and within 90 seconds it would dedupe to the same failed attempt anyway.

**Before → after:**

- *Roofing company hero image.* Before: "roofing company image." After: "A roofing crew mid-install on a suburban home at golden hour, new architectural shingles catching warm low sunlight, wide shot with clear blue sky and a ladder against the eave, photorealistic, confident and trustworthy mood, no text." → `nano-banana-pro`, `--ar 16:9`.
- *Restaurant Instagram post.* Before: "food picture for instagram." After: "Overhead flat-lay of a wood-fired pizza fresh from the oven, melted mozzarella and torn basil, dark slate board, linen napkin and a glass of red wine at the edge of frame, soft window light from the left, shallow depth of field, warm inviting mood, no text." → `nano-banana-pro` or `seedream-4`, `--ar 1:1` or `--ar 4:5`.
- *Real-estate listing video.* Before: "video of a house." After: "Slow forward dolly through a bright open-concept kitchen into a sunlit living room, hardwood floors, staged modern furniture, late-afternoon light through large windows, smooth cinematic camera movement, warm and inviting mood, no text." → `/video`, default model, `--ar 16:9`.

**When text is wanted**, put the exact words in quotes and use `gpt-image-2` — it's the model tuned for legible typography. Example: `A hand-painted wooden sandwich board outside a café that reads "OPEN TIL 9" in white lettering, warm daylight, no other text.` → `gpt-image-2`.

## Model picking

`list_models` always has the live, current list — call it whenever you're unsure. For reference:

**Image models**

| Model | Best for | Approx. cost |
|---|---|---|
| `gpt-image-2` (default) | Text, logos, typography, signs, menus | ~$0.04 (1K) |
| `nano-banana-pro` | Photorealism, people, likeness, product shots with a reference | ~$0.09 (1K) |
| `nano-banana` | Cheap drafts and quick concepts | ~$0.02 |
| `nano-banana-2` | Fast, good all-round default, low price | ~$0.04 (1K) |
| `seedream-4` | Stylized art, illustration, bold color | ~$0.03 |
| `imagen-4` | Clean commercial photo look, no reference images | ~$0.03 |

Rules of thumb: text/logos/typography → `gpt-image-2`. Photorealism/people/likeness → `nano-banana-pro`. Cheap throwaway drafts → `nano-banana`. Stylised/illustration → `seedream-4`. Clean commercial shot with no reference image → `imagen-4`. Don't want to think about it → `nano-banana-2`.

`gpt-image-2`, `nano-banana-pro`, and `seedream-4` support `--res 1K/2K/4K`; the other three render at a fixed resolution. `gpt-image-2` quirk: no 4K at `1:1`, and `4:5`/`5:4` are currently capped at `1K` — the tool auto-corrects this rather than erroring, so it's fine to ask for more and let it clamp.

`referenceImageUrls` (up to 4) works on `gpt-image-2`, `nano-banana-pro`, `nano-banana`, and `seedream-4` — not on `imagen-4` or `nano-banana-2`.

**Video models**

| Model | Best for | Approx. cost |
|---|---|---|
| `kling-2-1-std` (default) | Fast, cheapest | ~$0.13 / 5s |
| `kling-3-0` | Flagship quality, up to 4K, supports an end frame | ~$0.42 (720p) – $0.56 (1080p) / 5s |
| `kling-2-6` | Native audio in the clip | ~$0.50 / 5s |
| `seedance-2` | Cinematic motion, start+end frame | ~$1.20 / 5s at 720p |
| `wan-2-6` | HD on a budget | ~$0.50–0.75 / 5s |
| `grok-imagine` | Longer clips (6–10s), cheap | ~$0.30 / 6s |

Rules of thumb: the default (`kling-2-1-std`) covers most requests — fast and the cheapest per second. Reach for `kling-3-0` when the user explicitly wants top-tier quality or needs an end frame. Mention `kling-2-6` when the clip needs its own audio. Mention `seedance-2` for a deliberately cinematic look, and be clear it's the most expensive option before starting it.

Unrecognized model ids don't error — the tool silently falls back to the default and says which one it used instead. Treat that note as informational, not a failure.

Only use aspect ratios, resolutions, and durations shown here and in section 5. If genuinely unsure, `1:1`, `16:9`, `9:16`, and `1K` are always safe.

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

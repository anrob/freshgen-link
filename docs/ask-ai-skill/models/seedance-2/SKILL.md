---
name: seedance-2
description: Cinematic Video Generator (Seedance 2.0) — FreshGen video model skill. Render a short video with the Seedance 2.0 model (`seedance-2`), best for cinematic motion, start+end frames. Use when the user types /seedance-2, names this model, or the request clearly fits it. Real money (about $1.20 / 5s at 720p), billed to the connected Kie.ai account; quote the cost before starting.
---

# Cinematic Video Generator (Seedance 2.0)

**Cinematic Video Generator** — the FreshGen skill for the Seedance 2.0 video model, best for cinematic motion, start+end frames. Slash command: `/seedance-2`.

## The `/seedance-2` command

Signature: `/seedance-2 <prompt> [--from <imageUrl>] [--sec 5 / 10] [--res 720p / 1080p / 4K] [--ar 16:9 / 9:16 / 1:1]`

When a message begins with this command (or names this model): first state the estimated cost for the chosen duration and resolution (see below), then call `generate_video` with `model: "seedance-2"` and `prompt` = the user's prompt. Map flags: `--from` → `startImageUrl` (animate that exact image; omit to auto-generate a start frame, which adds ~$0.04 and ~30s), `--sec` → `duration` (5 or 10; default `5`), `--res` → `resolution` (720p/1080p/4K), `--ar` → `aspectRatio` (default `16:9`). The tool only STARTS the render and returns a task id — tell the user it takes 2–5 minutes, and only call `check_status` once, after 2–3 minutes, if they ask. Finished clips auto-save to the GHL Media Library when that is configured.

## About this model

| | |
|---|---|
| Model id | `seedance-2` |
| Best for | cinematic motion, start+end frames |
| Approx. cost | ≈ $1.20 / 5s at 720p |
| Durations | 5, 10 seconds (default 5) |
| Resolutions | 720p, 1080p, 4K |

## Prompting tips for Seedance 2.0

- The cinematic model — the most expensive video option; always confirm the price first.
- Speak in film language: "slow crane up", "rack focus from foreground to subject", "handheld drift", "anamorphic feel". 720p/1080p/4K.
- Reserve it for brand films and premium spots, not everyday social clips.

## BRAND block — the agency/buyer edits this before uploading

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

---
name: kling-2-1-std
description: Fast Cheap Video Generator (Kling 2.1 Standard) — FreshGen video model skill. Render a short video with the Kling 2.1 Standard model (`kling-2-1-std`), best for fast, cheap clips — the default. Use when the user types /kling-2-1-std, names this model, or the request clearly fits it. Real money (about $0.13 / 5s (measured)), billed to the connected Kie.ai account; quote the cost before starting.
---

# Fast Cheap Video Generator (Kling 2.1 Standard)

**Fast Cheap Video Generator** — the FreshGen skill for the Kling 2.1 Standard video model, best for fast, cheap clips — the default. Slash command: `/kling-2-1-std`.

## The `/kling-2-1-std` command

Signature: `/kling-2-1-std <prompt> [--from <imageUrl>] [--sec 5 / 10] [--ar 16:9 / 9:16 / 1:1]`

When a message begins with this command (or names this model): first state the estimated cost for the chosen duration (see below), then call `generate_video` with `model: "kling-2-1-std"` and `prompt` = the user's prompt. Map flags: `--from` → `startImageUrl` (animate that exact image; omit to auto-generate a start frame, which adds ~$0.04 and ~30s), `--sec` → `duration` (5 or 10; default `5`), `--ar` → `aspectRatio` (default `16:9`). The tool only STARTS the render and returns a task id — tell the user it takes 2–5 minutes, and only call `check_status` once, after 2–3 minutes, if they ask. Finished clips auto-save to the GHL Media Library when that is configured.

## About this model

| | |
|---|---|
| Model id | `kling-2-1-std` |
| Best for | fast, cheap clips — the default |
| Approx. cost | ≈ $0.13 / 5s (measured) |
| Durations | 5, 10 seconds (default 5) |
| Resolutions | fixed |

## Prompting tips for Kling 2.1 Standard

- The default: fastest and cheapest. Describe ONE clear motion and ONE camera move ("steam rises, slow push-in"), keep the subject count low, and let the start image carry the look.
- Best for social clips, product spins, and quick animations of a hero image.

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

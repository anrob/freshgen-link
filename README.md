# FreshGen Link

FreshGen Link is a self-hosted MCP server that plugs Kie.ai's image and video generation straight into GoHighLevel's AI tools — Ask AI and Workflow AI Agents. You deploy it to your own Vercel account in one click, connect your own Kie.ai API key, and every generation is billed by Kie.ai at Kie's own price, straight to your wallet. No subscription, no per-seat fee, nothing added on top.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fanrob%2Ffreshgen-link&env=LICENSE_KEY,KIE_API_KEY,MCP_SECRET&envDescription=Your%20license%20key%20from%20purchase%2C%20your%20Kie.ai%20API%20key%2C%20and%20a%20long%20random%20secret%20that%20becomes%20part%20of%20your%20private%20URL&envLink=https%3A%2F%2Fkie.ai%2Fapi-key&project-name=freshgen-link&repository-name=freshgen-link)

**Contents:** [Lite vs Full](#lite-vs-full) · [What you get](#what-you-get) · [Before you deploy](#before-you-deploy) · [After deploying](#after-deploying) · [Connect to GoHighLevel](#connect-to-gohighlevel) · [Ask AI skill](#ask-ai-skill-optional-recommended) · [Environment variables](#environment-variables) · [Getting updates](#getting-updates) · [Works outside GHL too](#works-outside-ghl-too) · [Which model should I use](#which-model-should-i-use) · [What it costs to run](#what-it-costs-to-run) · [Your media expires](#your-media-expires) · [A note on security](#a-note-on-security) · [FAQ](#faq) · [Troubleshooting](#troubleshooting) · [Running it locally](#running-it-locally-optional) · [Support](#support) · [License](#license)

## Quick start

1. **Deploy** — click the button above, paste your license key, your Kie.ai key, and a made-up secret.
2. **Connect** — copy your MCP URL from the dashboard, paste it into GHL's Ask AI connectors.
3. **Generate** — ask your GHL AI agent for an image or video. That's the whole loop.

Everything below is the detail behind those three steps.

## Lite vs Full

Same repo, same deploy button, same setup. **Your license key decides the edition** — the server checks it against Gumroad on start and turns on the matching features.

| | **Lite** — free | **Full** — $17 one-time |
|---|---|---|
| Get it | [freshgen-link-lite](https://iamjustfresh.gumroad.com/l/freshgen-link-lite) | [freshgen-link](https://iamjustfresh.gumroad.com/l/freshgen-link) |
| Image generation | GPT Image 2 only (~$0.04/image — best model for anything with words in it) | 6 image models — GPT Image 2, Nano Banana Pro, Nano Banana, Nano Banana 2, Seedream 4, Imagen 4 |
| Video generation | — | 6 video models — Kling 2.1/2.6/3.0, Seedance 2, Wan 2.6, Grok Imagine |
| GHL surfaces | Ask AI · Workflow AI Agents | Same |
| Auto-save to GHL Media Library | Yes, one location | Yes, one location |
| Ask AI skills | the `gpt-image-2` skill | all 23 (commands + models) |
| Tools your GHL agent sees | `generate_image`, `check_status`, `check_credits`, `list_models` (+ `save_to_media_library`) | + `generate_video` |

**Upgrading** from Lite to Full is: buy it, paste the new key into `LICENSE_KEY` in Vercel, redeploy. Same URL — the extra features switch on, nothing in GHL needs reconnecting.

## What you get

- **Five tools your GHL AI agent can call right away:** `generate_image`, `generate_video`, `check_status`, `check_credits`, `list_models`. (Lite: everything except `generate_video`, and images run on GPT Image 2 — see [Lite vs Full](#lite-vs-full).)
- **Automatic saves to your GHL Media Library** once you connect a GHL Private Integration Token — every finished image and video gets copied into your permanent Media Library on its own, no extra step. (A sixth tool, `save_to_media_library`, also appears for saving arbitrary URLs manually.)
- **A private dashboard** with a copy-URL button, your live Kie.ai credit balance, a one-click test image, and a walkthrough for connecting to GHL.
- **Works in Ask AI and Workflow AI Agents** — the same URL in both.

## Before you deploy

You need four things:

- **Your license key.** Emailed to you when you got FreshGen Link (Lite or Full) — looks like `85DE7B55-4A6E4E5A-8E5A0FDF-1BE4E0FC`. One key covers one deployment, and the key decides the edition. Generation stays switched off until it's set.
- **A Kie.ai account and API key.** Grab one at [kie.ai/api-key](https://kie.ai/api-key) — takes about two minutes.
- **A few dollars of prepaid Kie.ai credit.** Images start around $0.02, video from about $0.13 a clip. $10 covers a lot of testing.
- **A free GitHub account.** The deploy button clones this repo straight into your own GitHub, then deploys that copy to Vercel. If you don't have GitHub yet, Vercel will prompt you to sign up — free, takes a minute.

You'll also set an `MCP_SECRET` during deploy. In plain words:

- It's just a long random string — 30+ characters. Mash your keyboard, or use a password generator. Nothing to remember or look up later.
- It becomes part of your private server's URL: `https://your-app.vercel.app/mcp/<MCP_SECRET>`
- Treat that URL like a password. Anyone who has it can generate images and video on your Kie.ai account. Don't post it anywhere public — not in a support ticket, not in a screen-recording, not in a Slack channel.

## After deploying

The build takes about 3 minutes. Once it's done, open your dashboard:

```
https://your-app.vercel.app/s/<your-secret>
```

(Same secret you set above.) The dashboard gives you:

- **A copy-URL button** — grabs your exact MCP URL, ready to paste into GHL.
- **Your live Kie.ai credit balance** — in credits and dollars, updated on load.
- **A $0.04 test-image button** — the fastest way to confirm your Kie.ai key actually works, before you touch GHL at all.
- **A connection walkthrough** for whichever GHL surface you're using.

Bookmark the dashboard now. It's not linked anywhere on the public landing page — the URL itself is the only way in.

## Connect to GoHighLevel

Fastest path — connect through **Ask AI**:

1. In GoHighLevel, open **Ask AI**.
2. Click the **+** icon → **Manage Connectors**.
3. Click **+ Add custom MCP**.
4. Name it — "FreshGen" or your own brand — and paste your MCP server URL.
5. Click **Add MCP**. Leave Advanced alone.

Two fields, done. Your GHL AI agent can now generate images and video on request.

Want it inside a Workflow AI Agent for automations instead? Click-by-click steps for both connection paths live in **[docs/GHL-SETUP.md](docs/GHL-SETUP.md)**.

## Ask AI skill (optional, recommended)

A packaged Agent Skill that teaches Ask AI exactly how and when to use these tools — which command to run, which model fits the request, and the money and retry rules that keep it from double-billing. It adds `/image`, `/adset`, `/video`, `/animate`, `/variations`, `/status`, `/credits`, `/models`, `/save`, `/brand`, and `/help` commands, plus a BRAND block you fill in once so every generation matches your colors, style, and voice automatically.

Two ways to install — pick one:

- **One skill (simplest):** download [`docs/ask-ai-skill/SKILL.md`](docs/ask-ai-skill/SKILL.md), edit the BRAND block near the bottom, upload it in Ask AI's Skills panel. Ask AI shows one slash-menu entry per skill, so you pick the FreshGen chip and type the command after it: `/FreshGen /adset summer roofing promo`.
- **One skill per command (real `/image`, `/adset`, `/video`… in the slash menu):** upload each `SKILL.md` from [`docs/ask-ai-skill/commands/`](docs/ask-ai-skill/commands/) as its own skill (11 files). Name each skill after its command so the menu reads `/image`, `/adset`, etc. Edit the BRAND block in the five generating commands (`image`, `variations`, `adset`, `video`, `animate`) — they're identical, so paste the same block into each.
- **One skill per model (optional):** [`docs/ask-ai-skill/models/`](docs/ask-ai-skill/models/) has a skill for each of the twelve models — `/gpt-image-2`, `/nano-banana-pro`, `/kling-3-0`, and so on. Each locks the model, exposes only the flags that model supports, and carries prompting tips written for it. Upload the ones your team will actually use.

**Naming:** Ask AI may auto-name an uploaded skill from its content (you might see "Image Generation Assistant" instead of `gpt-image-2`). Each file now leads with its intended name to steer that — but if a skill still shows a generic name, open **Manage Skills** in Ask AI and rename it to the command (`image`, `gpt-image-2`, …). The name is what shows in the slash menu.

`freshgen-ask-ai-skills.zip` in the same folder has all 23 command + model skills. Everything is generated from the same master and the server's own model definitions, so the rules and prices are identical either way.

**On Lite,** there is one skill: [`docs/ask-ai-skill/lite/gpt-image-2/SKILL.md`](docs/ask-ai-skill/lite/gpt-image-2/SKILL.md) — the `/gpt-image-2` command without the BRAND block or video rules (a Lite server has neither). Your Lite dashboard links straight to it. The other 22 skills call tools a Lite server doesn't have.

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `LICENSE_KEY` | Yes | Your license key — it decides the edition (Lite / Full). Generation is disabled without it. |
| `KIE_API_KEY` | Yes | Your Kie.ai API key. Every generation bills to this account. |
| `MCP_SECRET` | Yes | 30+ random characters. Becomes part of your private MCP and dashboard URLs. |
| `GHL_PIT` | No | GoHighLevel Private Integration Token. Enables automatic Media Library saves plus the `save_to_media_library` tool once `GHL_LOCATION_ID` below is set. |
| `GHL_LOCATION_ID` | No | The GHL location (sub-account) generated media gets saved into. |

Change any of these anytime in Vercel: your project → **Settings → Environment Variables**, then redeploy for the change to take effect.

## Getting updates

The deploy button copied this repo into **your own GitHub account**, and Vercel builds from that copy. New features and fixes land here first — to pull them into yours:

1. Open your copy on GitHub (`github.com/<you>/freshgen-link`).
2. Click **Sync fork → Update branch** (top of the file list).
3. Vercel notices the new commit and redeploys on its own — about 3 minutes.

Your env vars, license and URL don't change. Tier upgrades don't need this at all — those are just a new key. Syncing is only for new code (a new model, a fix, a feature that wasn't there when you deployed).

## Works outside GHL too

FreshGen Link is a standard MCP server, so anything that speaks MCP can use the same URL — same Kie.ai key, same billing, and finished media still auto-saves to your GHL Media Library because that happens on the server.

| Client | How to connect |
|---|---|
| **Claude Desktop / claude.ai** | Settings → Connectors → **Add custom connector** → paste your standard MCP URL. Needs a paid Claude plan (Pro, Max, or Team). |
| **Claude Code** | `claude mcp add --transport http freshgen https://your-app.vercel.app/mcp/<secret>` |
| **Cursor, ChatGPT connectors, other MCP clients** | Add a remote MCP server by URL; transport is Streamable HTTP, no auth header — the secret is in the URL. |

The [Ask AI skill files](#ask-ai-skill-optional-recommended) are the open Agent Skills format, so they work in Claude too — drop a `SKILL.md` into Claude Code's skills folder or upload it in claude.ai and `/adset`, `/gpt-image-2` and friends work there as well.

One caution: it's the same secret URL everywhere. Anyone who has it can spend your Kie.ai balance — don't paste it into shared Claude projects or team workspaces you don't control.

## Which model should I use

`list_models` always has the live, authoritative list — ask your GHL agent "what models are available?" anytime. For reference:

**Image models**

| Model | Best for | Price |
|---|---|---|
| `gpt-image-2` (default) | Text, logos, typography | ~$0.04 |
| `nano-banana-pro` | Best photorealism and likeness | ~$0.09 |
| `nano-banana` | Cheapest drafts | ~$0.02 |
| `nano-banana-2` | Fast, all-round | ~$0.04 |
| `seedream-4` | Stylized art | ~$0.03 |
| `imagen-4` | Clean commercial looks (no reference images) | ~$0.03 |

**Video models**

| Model | Best for | Price |
|---|---|---|
| `kling-2-1-std` (default) | Fast and cheapest | ~$0.13 per 5s (measured) |
| `kling-3-0` | Flagship quality, up to 4K, end-frame support | ~$0.42+ per 5s |
| `kling-2-6` | Native audio | ~$0.50 per 5s |
| `seedance-2` | Cinematic | ~$1.20+ per 5s |
| `wan-2-6` | HD on a budget | varies |
| `grok-imagine` | Longer clips, cheap | varies |

You don't have to pick one — describe what you want and the default model handles most requests well. Mention a model by name if you want a specific look.

## What it costs to run

Two bills, and only one of them is usually real money.

**Kie.ai — pay per generation, straight from your own wallet:**

| | Price |
|---|---|
| Image | **$0.02 – $0.09**, depending on model |
| Video (5-second clip) | **$0.25 – $1.20**, depending on model |

1 credit = $0.005. Every generation reports its real cost when it finishes — check your balance anytime with the `check_credits` tool or the dashboard.

**Vercel — hosting:**

Free tier runs this fine, technically. But read the fine print: **Vercel's Hobby plan terms restrict it to non-commercial use.** Running this for a client, or as part of a paid agency service, counts as commercial use — that means **Vercel Pro, $20/mo**, to stay inside the terms. If it's purely for your own business, Hobby is probably fine — but check Vercel's terms yourself if you're not sure which side of that line you're on.

## Your media expires

Kie.ai generation URLs **die after about 14 days.** That's normal — it's how Kie keeps hosting cheap, not a bug.

Two ways to keep what you make:

- **Download it.** Works with zero setup.
- **Auto-save to your GHL Media Library.** Set `GHL_PIT` and `GHL_LOCATION_ID` in your Vercel project's environment variables and every finished generation is copied into your GHL Media Library **automatically** the moment it completes — images and video both, even if nobody asks for it again in chat. Create the PIT in GHL: **Settings → Private Integrations → New**, with the "View/Edit Media" scopes.

## A note on security

There's no login, no password field, no OAuth screen anywhere in this setup — and that's intentional, not a shortcut. Your `MCP_SECRET` inside the URL **is** the credential. Anyone who has the full URL can call the tools on your Kie.ai account; anyone who doesn't have it can't even find the endpoint to try it against. Guard the URL the way you'd guard a password: don't paste it into public channels, screenshots, or support tickets.

## FAQ

**Is my API key safe?**

Yes. It lives in your own Vercel project's environment variables — your Vercel account, nobody else's. Nobody, including Fresh, ever sees it.

**Why is the code public if I'm paying for this?**

The Vercel deploy button requires a public GitHub repo — that's a Vercel limitation, not a choice made here. Readable isn't the same as free: the code is source-available under a paid license (see [LICENSE](LICENSE)), and a valid license key is required to run it. What you're paying for is the packaged product — the one-click deploy, the dashboard, the docs, and support when something breaks.

**What happens if my license key is missing or invalid?**

The server still connects to GoHighLevel and the informational tools (`list_models`, `check_credits`) keep working, but `generate_image`, `generate_video`, and `save_to_media_library` return an "not activated" message instead of running. Add a valid `LICENSE_KEY` in Vercel and redeploy. Your dashboard shows activation status at a glance.

**What's the difference between Lite and Full?**

Lite is free and does one thing: images on GPT Image 2, saved to one GHL location. Full ($17 one-time) adds video and five more image models. Same repo, same deploy — the key decides. Table in [Lite vs Full](#lite-vs-full).

**How do I upgrade?**

Buy Full, paste the new key into `LICENSE_KEY` in Vercel, redeploy. Your MCP URL doesn't change, so nothing in GHL needs reconnecting — the extra tools just show up.

**My video didn't come back — is something broken?**

No — video takes **2 to 5 minutes** to render. `generate_video` starts the job and hands your GHL agent a task ID; it isn't supposed to return the finished clip immediately. Ask the agent to check again in a couple of minutes ("is my video ready yet?") — or, if you've connected a GHL Private Integration Token, just open **Media Storage**: the finished clip lands there automatically without anyone asking.

**Do I need to know how to code?**

No. You click the deploy button, paste three values, and copy a URL into GHL. If you can fill out a form, you can set this up.

**Can I run more than one?**

Yes. One deployment = one location. Need a second location, or a client with their own `KIE_API_KEY` and separate billing? Deploy it again under a different Vercel project name with a different `MCP_SECRET`, and it's fully independent.

**Is this only for images and video?**

Yes, on purpose. FreshGen Link does one thing — AI image and video generation through Kie.ai — and does it well. It isn't a general-purpose AI toolbox.

## Troubleshooting

| Problem | Fix |
|---|---|
| **401 error** connecting in GHL | Your secret doesn't match, or there's a trailing space in the pasted URL. Re-copy the URL from your dashboard rather than retyping it. |
| **Tools not showing up** in GHL | Remove the MCP connection and re-add it — the tool list can be cached from the first connection attempt. |
| **"Insufficient credits" error** | Your prepaid Kie.ai balance ran out. Top up at [kie.ai](https://kie.ai). |
| **Dashboard shows 404** | Wrong secret in the URL. Double-check `https://your-app.vercel.app/s/<secret>` matches your `MCP_SECRET` exactly, no extra characters. |
| **MCP URL unreachable from GHL** | In Vercel, go to your project → **Settings → Deployment Protection**. It must be **OFF** for production — if it's on, Vercel blocks GHL's servers before they ever reach your MCP endpoint. |
| **Deploy fails on Vercel** | Almost always a missing required env var. Check `LICENSE_KEY`, `KIE_API_KEY` and `MCP_SECRET` are all set, then redeploy. |
| **"Not activated" from every generation tool** | `LICENSE_KEY` is missing, mistyped, or the purchase was refunded. Re-copy it from your purchase email, set it in Vercel, and redeploy. |
| **Test image button does nothing** | Check `check_credits` first — a $0 balance can fail quietly. Top up and try again. |
| **"Test Connection" times out** in GHL | The first request after idle can be slow (Vercel cold start). Wait 10 seconds and try again. |
| **Everything worked, then suddenly stopped** | Check `check_credits` — the most common cause of a sudden stop is simply running out of balance. |
| **Media saved to the wrong sub-account** | `GHL_LOCATION_ID` points at the wrong location. Fix it in Vercel → Settings → Environment Variables and redeploy. |

## Running it locally (optional)

Most buyers don't need this — the deploy button is the intended path, and it's the only path that comes with support. If you want to poke at the code before deploying, or you're comfortable running it yourself:

```
git clone <your-fork-url>
cd freshgen-link
npm install
cp .env.example .env.local   # fill in KIE_API_KEY and MCP_SECRET
npm run dev
```

Runs on `http://localhost:3000` by default. Requires Node 20+.

## Support

Something not working, and it isn't listed above? Reach out to whoever you bought this from — that's the "support" part of what you paid for.

## License

Source-available, not open source. You may run and modify it for your own business (including white-labeling it) with a valid license key; you may not redistribute it or strip out the license check. Full terms in [LICENSE](LICENSE).

## Trademarks

GoHighLevel and HighLevel are trademarks of HighLevel Inc. FreshGen Link is an independent product and is not affiliated with, endorsed by, or sponsored by HighLevel. Kie.ai and Vercel are trademarks of their respective owners.

## Terms and privacy

By purchasing, deploying, or using FreshGen Link you agree to the [Terms of Service](docs/legal/TERMS.md) and acknowledge the [Privacy Policy](docs/legal/PRIVACY.md). Both are also served by every deployment at `/terms.html` and `/privacy.html`. Short version: the software is provided as is, you operate your own copy on your own accounts, generation costs are billed by Kie.ai to you, and we never see your prompts, media, or keys.

---

That covers everything from first deploy to first generation. Bookmark this file, or better, bookmark your dashboard — it's the fastest place to check that everything's still healthy.

# FreshGen Link

FreshGen Link is a self-hosted MCP server that plugs Kie.ai's image and video generation straight into GoHighLevel's AI tools — Ask AI, Workflow AI Agents, and Agent Studio Superagents. You deploy it to your own Vercel account in one click, connect your own Kie.ai API key, and every generation bills at Kie's raw price straight to your wallet. No subscription, no per-seat fee, no middleman markup.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fanrob%2Ffreshgen-link&env=LICENSE_KEY,KIE_API_KEY,MCP_SECRET&envDescription=Your%20license%20key%20from%20purchase%2C%20your%20Kie.ai%20API%20key%2C%20and%20a%20long%20random%20secret%20that%20becomes%20part%20of%20your%20private%20URL&envLink=https%3A%2F%2Fkie.ai%2Fapi-key&project-name=freshgen-link&repository-name=freshgen-link)

**Contents:** [What you get](#what-you-get) · [Before you deploy](#before-you-deploy) · [After deploying](#after-deploying) · [Connect to GoHighLevel](#connect-to-gohighlevel) · [Ask AI skill](#ask-ai-skill-optional-recommended) · [Environment variables](#environment-variables) · [Multiple sub-accounts (agencies)](#multiple-sub-accounts-agencies) · [Which URL for which GHL surface](#which-url-for-which-ghl-surface) · [Which model should I use](#which-model-should-i-use) · [What it costs to run](#what-it-costs-to-run) · [Your media expires](#your-media-expires) · [A note on security](#a-note-on-security) · [FAQ](#faq) · [Troubleshooting](#troubleshooting) · [Running it locally](#running-it-locally-optional) · [Support](#support) · [License](#license)

## Quick start

1. **Deploy** — click the button above, paste your license key, your Kie.ai key, and a made-up secret.
2. **Connect** — copy your MCP URL from the dashboard, paste it into GHL's Ask AI connectors.
3. **Generate** — ask your GHL AI agent for an image or video. That's the whole loop.

Everything below is the detail behind those three steps.

## What you get

- **Five tools your GHL AI agent can call right away:** `generate_image`, `generate_video`, `check_status`, `check_credits`, `list_models`.
- **Automatic saves to your GHL Media Library** once you connect a GHL Private Integration Token — every finished image and video gets copied into your permanent Media Library on its own, no extra step. (A sixth tool, `save_to_media_library`, also appears for saving arbitrary URLs manually.)
- **A private dashboard** with a copy-URL button, your live Kie.ai credit balance, a one-click test image, and a walkthrough for connecting to GHL.
- **Works everywhere GHL accepts an MCP connector:** Ask AI, Workflow AI Agents, and Agent Studio Superagents.

## Before you deploy

You need four things:

- **Your license key.** Emailed to you when you bought FreshGen Link — looks like `85DE7B55-4A6E4E5A-8E5A0FDF-1BE4E0FC`. One key covers one deployment. Generation stays switched off until it's set.
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

Want it inside a Workflow AI Agent for automations, or a custom Agent Studio Superagent instead? Full click-by-click steps for all three connection paths live in **[docs/GHL-SETUP.md](docs/GHL-SETUP.md)**.

## Ask AI skill (optional, recommended)

A packaged Agent Skill that teaches Ask AI exactly how and when to use these tools — which command to run, which model fits the request, and the money and retry rules that keep it from double-billing. It adds `/image`, `/adset`, `/video`, `/animate`, `/variations`, `/status`, `/credits`, `/models`, `/save`, `/brand`, and `/help` commands, plus a BRAND block you fill in once so every generation matches your colors, style, and voice automatically.

Two ways to install — pick one:

- **One skill (simplest):** download [`docs/ask-ai-skill/SKILL.md`](docs/ask-ai-skill/SKILL.md), edit the BRAND block near the bottom, upload it in Ask AI's Skills panel. Ask AI shows one slash-menu entry per skill, so you pick the FreshGen chip and type the command after it: `/FreshGen /adset summer roofing promo`.
- **One skill per command (real `/image`, `/adset`, `/video`… in the slash menu):** upload each `SKILL.md` from [`docs/ask-ai-skill/commands/`](docs/ask-ai-skill/commands/) as its own skill (11 files, or grab `freshgen-ask-ai-commands.zip` from the same folder). Name each skill after its command so the menu reads `/image`, `/adset`, etc. Edit the BRAND block in the five generating commands (`image`, `variations`, `adset`, `video`, `animate`) — they're identical, so paste the same block into each.

Both are generated from the same master, so the rules are identical either way.

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `LICENSE_KEY` | Yes | Your purchase license key. Generation is disabled without it. |
| `KIE_API_KEY` | Yes | Your Kie.ai API key. Every generation bills to this account. |
| `MCP_SECRET` | Yes | 30+ random characters. Becomes part of your private MCP and dashboard URLs. |
| `BRAND_NAME` | No | White-labels the landing page, dashboard, and GHL-facing name. Defaults to "FreshGen". |
| `GHL_PIT` | No | GoHighLevel Private Integration Token. Enables automatic Media Library saves plus the `save_to_media_library` tool once a location is available — either `GHL_LOCATION_ID` below or a per-location URL. |
| `GHL_LOCATION_ID` | No | The **default** GHL location (sub-account) generated media gets saved into. Optional if you use per-location URLs — see [Multiple sub-accounts (agencies)](#multiple-sub-accounts-agencies). |

Change any of these anytime in Vercel: your project → **Settings → Environment Variables**, then redeploy for the change to take effect.

## Multiple sub-accounts (agencies)

One deployment can serve every sub-account you manage — you don't need a separate Vercel project per client.

- **Default URL** — `https://your-app.vercel.app/mcp/<secret>` — saves to whatever `GHL_LOCATION_ID` you've set (or nowhere, if you've left it unset).
- **Per-location URL** — `https://your-app.vercel.app/mcp/<secret>/<locationId>` — saves straight into that Location ID's Media Library instead. Paste any sub-account's Location ID in and it just works.
- **Instant mode** — add `?mode=instant` to either URL to make `generate_image` return a task id immediately instead of waiting for the render. Use it for Agent Studio Superagent — see [Which URL for which GHL surface](#which-url-for-which-ghl-surface) below.

This needs an **agency-level Private Integration Token** — a `GHL_PIT` that has access to every sub-account you plan to point a URL at, not just one location's own PIT. Create it at **Agency Settings → Private Integrations → New**, with the "View/Edit Media" scopes, authorized against the sub-accounts you'll use.

Your dashboard has a **Per-location & Superagent URLs** builder that generates these URLs for you — paste a Location ID, tick Instant mode if you need it, copy the result. Find a Location ID in GHL: **Settings → Business Profile** (Location ID).

Only deploy a second, fully separate copy of FreshGen Link if a client needs their own `KIE_API_KEY` or separate billing — otherwise one deployment plus per-location URLs covers it.

## Which URL for which GHL surface

| GHL surface | URL to use | Why |
|---|---|---|
| Ask AI | Standard URL | Holds the tool call open — you get the finished image back inline. |
| Workflow AI Agent | Standard URL | Same — the workflow step holds open for the render. |
| Agent Studio Superagent | **Instant-mode URL** (`?mode=instant`) | Superagent times out tool calls around 30 seconds and retries them. Instant mode returns a task id immediately instead of getting killed mid-render — the agent (or the auto-save) picks up the finished media afterward. |

Not sure which you're using? If you followed [Connect to GoHighLevel](#connect-to-gohighlevel) Path 1 or 2 above, you want the standard URL. Superagent is its own path — click-by-click steps are in [docs/GHL-SETUP.md](docs/GHL-SETUP.md).

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
- **Auto-save to your GHL Media Library.** Set `GHL_PIT` in your Vercel project's environment variables — plus either `GHL_LOCATION_ID`, or a per-location URL (see [Multiple sub-accounts (agencies)](#multiple-sub-accounts-agencies)) — and every finished generation is copied into your GHL Media Library **automatically** the moment it completes — images and video both, even if nobody asks for it again in chat. Create the PIT in GHL: **Settings → Private Integrations → New**, with the "View/Edit Media" scopes.

## A note on security

There's no login, no password field, no OAuth screen anywhere in this setup — and that's intentional, not a shortcut. Your `MCP_SECRET` inside the URL **is** the credential. Anyone who has the full URL can call the tools on your Kie.ai account; anyone who doesn't have it can't even find the endpoint to try it against. Guard the URL the way you'd guard a password: don't paste it into public channels, screenshots, or support tickets.

## FAQ

**Is my API key safe?**

Yes. It lives in your own Vercel project's environment variables — your Vercel account, nobody else's. Nobody, including Fresh, ever sees it.

**Why is the code public if I'm paying for this?**

The Vercel deploy button requires a public GitHub repo — that's a Vercel limitation, not a choice made here. Readable isn't the same as free: the code is source-available under a paid license (see [LICENSE](LICENSE)), and a valid license key is required to run it. What you're paying for is the packaged product — the one-click deploy, the dashboard, the docs, and support when something breaks.

**What happens if my license key is missing or invalid?**

The server still connects to GoHighLevel and the informational tools (`list_models`, `check_credits`) keep working, but `generate_image`, `generate_video`, and `save_to_media_library` return an "not activated" message instead of running. Add a valid `LICENSE_KEY` in Vercel and redeploy. Your dashboard shows activation status at a glance.

**Can I white-label it?**

Yes — set the `BRAND_NAME` environment variable and it replaces "FreshGen" on the landing page, the dashboard, and inside GHL. Full white-label with a custom accent color is offered as a higher tier — ask if you want that.

**My video didn't come back — is something broken?**

No — video takes **2 to 5 minutes** to render. `generate_video` starts the job and hands your GHL agent a task ID; it isn't supposed to return the finished clip immediately. Ask the agent to check again in a couple of minutes ("is my video ready yet?") — or, if you've connected a GHL Private Integration Token, just open **Media Storage**: the finished clip lands there automatically without anyone asking.

**Do I need to know how to code?**

No. You click the deploy button, paste three values, and copy a URL into GHL. If you can fill out a form, you can set this up.

**Can I run more than one?**

You mostly don't need to. One deployment can serve every GHL sub-account you manage — see [Multiple sub-accounts (agencies)](#multiple-sub-accounts-agencies) for the per-location URL pattern. Only deploy a second, fully separate copy if a client needs their own `KIE_API_KEY` or separate billing — deploy it again under a different Vercel project name with a different `MCP_SECRET`, and it's fully independent.

**Is this only for images and video?**

Yes, on purpose. FreshGen Link does one thing — AI image and video generation through Kie.ai — and does it well. It isn't a general-purpose AI toolbox.

## Troubleshooting

| Problem | Fix |
|---|---|
| **401 error** connecting in GHL | Your secret doesn't match, or there's a trailing space in the pasted URL. Re-copy the URL from your dashboard rather than retyping it. |
| **Tools not showing up** in GHL | Remove the MCP connection and re-add it. GHL sometimes caches the tool list from the first connection attempt. |
| **"Insufficient credits" error** | Your prepaid Kie.ai balance ran out. Top up at [kie.ai](https://kie.ai). |
| **Dashboard shows 404** | Wrong secret in the URL. Double-check `https://your-app.vercel.app/s/<secret>` matches your `MCP_SECRET` exactly, no extra characters. |
| **MCP URL unreachable from GHL** | In Vercel, go to your project → **Settings → Deployment Protection**. It must be **OFF** for production — if it's on, Vercel blocks GHL's servers before they ever reach your MCP endpoint. |
| **Deploy fails on Vercel** | Almost always a missing required env var. Check `LICENSE_KEY`, `KIE_API_KEY` and `MCP_SECRET` are all set, then redeploy. |
| **"Not activated" from every generation tool** | `LICENSE_KEY` is missing, mistyped, or the purchase was refunded. Re-copy it from your purchase email, set it in Vercel, and redeploy. |
| **Test image button does nothing** | Check `check_credits` first — a $0 balance can fail quietly. Top up and try again. |
| **"Test Connection" times out** in GHL | The first request after idle can be slow (cold start). Wait 10 seconds and try again before assuming it's broken. |
| **Everything worked, then suddenly stopped** | Check `check_credits` — the most common cause of a sudden stop is simply running out of balance. |
| **Media saved to the wrong sub-account** | The URL you connected has the wrong (or no) Location ID in it. Build the correct one in your dashboard's **Per-location & Superagent URLs** section and reconnect with that URL. |
| **Superagent says the tool timed out and retries** | You're using the standard URL. Switch to the instant-mode URL (`?mode=instant`) — see [Which URL for which GHL surface](#which-url-for-which-ghl-surface). |

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

---

That covers everything from first deploy to first generation. Bookmark this file, or better, bookmark your dashboard — it's the fastest place to check that everything's still healthy.

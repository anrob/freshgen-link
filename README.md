# FreshGen Link

FreshGen Link is a self-hosted MCP server that plugs Kie.ai's image and video generation straight into GoHighLevel's AI tools — Ask AI, Workflow AI Agents, and Agent Studio Superagents. You deploy it to your own Vercel account in one click, connect your own Kie.ai API key, and every generation bills at Kie's raw price straight to your wallet. No subscription, no per-seat fee, no middleman markup.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fanrob%2Ffreshgen-link&env=KIE_API_KEY,MCP_SECRET&envDescription=Your%20Kie.ai%20API%20key%2C%20plus%20a%20long%20random%20secret%20that%20becomes%20part%20of%20your%20private%20URL&envLink=https%3A%2F%2Fkie.ai%2Fapi-key&project-name=freshgen-link&repository-name=freshgen-link)

**Contents:** [What you get](#what-you-get) · [Before you deploy](#before-you-deploy) · [After deploying](#after-deploying) · [Connect to GoHighLevel](#connect-to-gohighlevel) · [Environment variables](#environment-variables) · [Which model should I use](#which-model-should-i-use) · [What it costs to run](#what-it-costs-to-run) · [Your media expires](#your-media-expires) · [A note on security](#a-note-on-security) · [FAQ](#faq) · [Troubleshooting](#troubleshooting) · [Running it locally](#running-it-locally-optional) · [Support](#support) · [License](#license)

## Quick start

1. **Deploy** — click the button above, paste your Kie.ai key and a made-up secret.
2. **Connect** — copy your MCP URL from the dashboard, paste it into GHL's Ask AI connectors.
3. **Generate** — ask your GHL AI agent for an image or video. That's the whole loop.

Everything below is the detail behind those three steps.

## What you get

- **Five tools your GHL AI agent can call right away:** `generate_image`, `generate_video`, `check_status`, `check_credits`, `list_models`.
- **Automatic saves to your GHL Media Library** once you connect a GHL Private Integration Token — every finished image and video gets copied into your permanent Media Library on its own, no extra step. (A sixth tool, `save_to_media_library`, also appears for saving arbitrary URLs manually.)
- **A private dashboard** with a copy-URL button, your live Kie.ai credit balance, a one-click test image, and a walkthrough for connecting to GHL.
- **Works everywhere GHL accepts an MCP connector:** Ask AI, Workflow AI Agents, and Agent Studio Superagents.

## Before you deploy

You need three things:

- **A Kie.ai account and API key.** Grab one at [kie.ai/api-key](https://kie.ai/api-key) — takes about two minutes.
- **A few dollars of prepaid Kie.ai credit.** Images start around $0.02, video around $0.25 a clip. $10 covers a lot of testing.
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

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `KIE_API_KEY` | Yes | Your Kie.ai API key. Every generation bills to this account. |
| `MCP_SECRET` | Yes | 30+ random characters. Becomes part of your private MCP and dashboard URLs. |
| `BRAND_NAME` | No | White-labels the landing page, dashboard, and GHL-facing name. Defaults to "FreshGen". |
| `GHL_PIT` | No | GoHighLevel Private Integration Token. Set together with `GHL_LOCATION_ID` to enable automatic Media Library saves plus the `save_to_media_library` tool. |
| `GHL_LOCATION_ID` | No | The GHL location (sub-account) generated media gets saved into. |

Change any of these anytime in Vercel: your project → **Settings → Environment Variables**, then redeploy for the change to take effect.

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
| `kling-2-1-std` (default) | Fast and cheapest | ~$0.25 per 5s |
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
- **Auto-save to your GHL Media Library.** Set `GHL_PIT` and `GHL_LOCATION_ID` in your Vercel project's environment variables, and every finished generation is copied into your GHL Media Library **automatically** the moment it completes — images and video both, even if nobody asks for it again in chat. Create the PIT in GHL: **Settings → Private Integrations → New**, with the "View/Edit Media" scopes.

## A note on security

There's no login, no password field, no OAuth screen anywhere in this setup — and that's intentional, not a shortcut. Your `MCP_SECRET` inside the URL **is** the credential. Anyone who has the full URL can call the tools on your Kie.ai account; anyone who doesn't have it can't even find the endpoint to try it against. Guard the URL the way you'd guard a password: don't paste it into public channels, screenshots, or support tickets.

## FAQ

**Is my API key safe?**

Yes. It lives in your own Vercel project's environment variables — your Vercel account, nobody else's. Nobody, including Fresh, ever sees it.

**Why is the code public if I'm paying for this?**

The Vercel deploy button requires a public GitHub repo — that's a Vercel limitation, not a choice made here. What you're actually paying for is the packaged product: the one-click deploy, the dashboard, the docs, and support when something breaks. The code being readable doesn't mean the product is free to assemble yourself.

**Can I white-label it?**

Yes — set the `BRAND_NAME` environment variable and it replaces "FreshGen" on the landing page, the dashboard, and inside GHL. Full white-label with a custom accent color is offered as a higher tier — ask if you want that.

**My video didn't come back — is something broken?**

No — video takes **2 to 5 minutes** to render. `generate_video` starts the job and hands your GHL agent a task ID; it isn't supposed to return the finished clip immediately. Ask the agent to check again in a couple of minutes ("is my video ready yet?") — or, if you've connected a GHL Private Integration Token, just open **Media Storage**: the finished clip lands there automatically without anyone asking.

**Do I need to know how to code?**

No. You click the deploy button, paste two values, and copy a URL into GHL. If you can fill out a form, you can set this up.

**Can I run more than one?**

Yes — deploy it again under a different Vercel project name with a different `MCP_SECRET` for a second brand, client, or location. Each deployment is fully independent, with its own key, secret, and billing.

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
| **Deploy fails on Vercel** | Almost always a missing required env var. Check `KIE_API_KEY` and `MCP_SECRET` are both set, then redeploy. |
| **Test image button does nothing** | Check `check_credits` first — a $0 balance can fail quietly. Top up and try again. |
| **"Test Connection" times out** in GHL | The first request after idle can be slow (cold start). Wait 10 seconds and try again before assuming it's broken. |
| **Everything worked, then suddenly stopped** | Check `check_credits` — the most common cause of a sudden stop is simply running out of balance. |

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

MIT. Do whatever you want with the code — see [LICENSE](LICENSE).

---

That covers everything from first deploy to first generation. Bookmark this file, or better, bookmark your dashboard — it's the fastest place to check that everything's still healthy.

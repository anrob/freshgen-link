# Selling FreshGen Link

Internal notes for Fresh — pricing math, positioning, tiers, and scripts. Not for the buyer.

## Where this comes up

- A GHL agency owner posts in a Facebook group asking about AI image tools for client sites or ads.
- Someone complains about Agent Studio credit costs, or running out of AI credits mid-month.
- A prospect on a discovery call is already doing manual image/video work for clients and hasn't automated it.
- Anyone asks "does GHL have an AI image generator" — yes, and it's expensive; this is the cheaper alternative.

## Opening line

"You know GHL's built-in AI image and video generation? You're paying reseller markup on that. This is the same idea, except it's your own server, your own API key, and you pay Kie.ai's raw price — about a tenth of the cost on video."

**Text/DM version:** "Quick one — GHL's AI image/video generator marks up what it charges you pretty hard. There's a way to run the same thing through your own server at Kie.ai's raw price instead, about 10x cheaper on video. Want me to send a 60-second video showing it?"

## The math

GHL's native Agent Studio generation is expensive — it's a resold markup on top of the underlying model cost, not the cost of the model itself.

| | GHL native (Agent Studio) | FreshGen Link (via Kie.ai) |
|---|---|---|
| Image | $0.04 – $0.12 each | **$0.02 – $0.09** each |
| Video | $0.15 – $0.40 **per second** | **~$0.025/sec** measured (kling default, ~$0.13 for 5s) |
| 10-second video | **$1.50 – $4.00** | **~$0.25** |

Headline: **video runs about 10x cheaper** through FreshGen Link than GHL's cheapest native option. Images run 2–4x cheaper. The gap exists because GHL's price is a reseller markup on top of a model provider — FreshGen Link removes the reseller and bills the client's own wallet at Kie.ai's raw, wholesale rate.

At real volume, that gap turns into actual money:

| Monthly usage | GHL native | FreshGen Link | Saved |
|---|---|---|---|
| 100 images | $4 – $12 | $2 – $9 | up to ~$10 |
| 20 ten-second video clips | $30 – $80 | ~$5 | **$25 – $75** |

## Who this is for

GHL agency owners already generating (or wanting to generate) images or video for clients inside GHL. Best-fit signals:

- Already running client work through Workflow AI Agents or Ask AI.
- Doing enough volume that per-generation savings add up — an agency running a handful of images a month won't feel this the way one running weekly ad creative or content batches will.
- Comfortable clicking a deploy button and following a README — or willing to pay for the Done-for-you tier if not.

**Who NOT to pitch this to, at least not yet:**

- Agency owners who've never touched GHL's Workflow or Ask AI features — they need the GHL basics first, not this.
- Anyone allergic to "one more thing to manage" — if Vercel and GitHub sound like a headache no matter how simple, that's a Tier 2 conversation or a pass, not a Tier 1 sale.
- Solo operators doing one image a month by hand in Canva — the savings won't outweigh the setup for them yet.

## Positioning

GHL's connector catalog already lists Higgsfield and OpenArt. Don't pretend they don't exist — sell against what's actually different:

- **Higgsfield / OpenArt:** their subscription, their OAuth account, their pricing, their rules. The client is renting access.
- **FreshGen Link:** the client's own server, their own Kie.ai key, at-cost pricing forever, white-labelable under their own brand if they want it.

Nobody else is selling "you own the server, you own the key" for GHL AI media generation right now. That gap is the whole pitch.

## Tiers

**Tier 0 — Lite, free** (added 2026-08-16)
Same repo, same deploy button. A free Gumroad product (`freshgen-link-lite`, product id `qFp7GEt7epSSVWVnIWGDVA==`) mints a Lite key; the server sees which product the key belongs to and turns on the Lite tool set: `generate_image` on GPT Image 2 only, one GHL location, no video, no white-label. Everything else (dashboard, test button, auto-save, Ask AI skills) works.

Why it exists: it's the thing you can post in a GHL Facebook group without it reading as promo. "Built this for my own sub-accounts, it's free if you want it" gets comments, sign-ups, feedback and an email list. Every Lite deployment says "FreshGen" (BRAND_NAME is ignored), the dashboard has an Upgrade card, `list_models` shows what's locked, and the `generate_image` description tells the GHL agent Full exists — so the upsell is inside the product, not in your DMs.

Upgrade path: buy Full → paste the new key into `LICENSE_KEY` → redeploy. Same MCP URL, nothing to reconnect. The seller dashboard (`/s/<secret>/sales`) shows Lite sign-ups next to Full sales.

**Tier 1 — Self-serve Full, $47 (founder pricing — raise to $97 after three testimonials)**
Deploy link + docs. They click Deploy, follow the README, connect it themselves. You're selling the packaging, not your time. Delivery: instant, the moment they pay.

**Tier 2 — Done-for-you install, $X**
You deploy it and connect it on a screen-share. Includes moving them to Vercel Pro so they're not quietly violating Hobby's commercial-use terms. For agency owners who don't want to touch Vercel or GitHub at all. Delivery: one call.

**Tier 3 — White-label, $X (top tier)**
Everything in Tier 2, plus `BRAND_NAME` set to their brand and an accent-color pass so it reads as their own product end to end — landing page, dashboard, all of it. Best pitched to agencies reselling this downstream to their own clients.

**Lead with Lite (Tier 0)** in groups and anywhere you'd feel like you're "selling" — it's a free thing you made, not a pitch. **Lead with Tier 1** in a DM with someone who already has the problem. Upgrade conversations to Tier 2 or 3 tend to happen naturally once someone has seen it work and doesn't want to DIY the Vercel/GitHub part, or wants their own brand on it.

## Objection scripts

**"The code is public — anyone can just copy it."**
Sure, and anyone can read a cookbook too. You're not paying for secrecy — you're paying for someone who already built it, tested it, and packaged it so it deploys in three minutes instead of three days, plus support when it breaks.

**"Vercel Hobby is free, why would I pay for Pro?"**
It's free for personal, non-commercial use — that's Vercel's own terms, not mine. The moment you're running this for a client or as part of a paid service, that's commercial use. It's a $20/mo line item to stay clean, and it's already included if they go Done-for-you.

**"Why not just use Higgsfield from the catalog?"**
You can — it's a fine tool. But it's their subscription, their account, their pricing, and none of it belongs to you. This is yours: your server, your API key, at-cost pricing, your brand on it if you want. Different thing entirely.

**"Is this going to break every time GHL changes something?"**
The three connection paths — Ask AI, Workflow, Superagent — are all standard GHL MCP connectors, not a hack bolted onto the side. If GHL changes how MCP connectors work, that's a platform-wide change GHL has to support either way. This ships fixes like any other tool would.

## 60-second Loom script

1. **Click Deploy.** Show the button, one click, that's it.
2. **Sign into GitHub + Vercel.** Have both open already before recording — skip the wait.
3. **Paste your Kie.ai key, make up a secret.** Point out it's just a random string, nothing to remember.
4. **Wait ~2 minutes for the build.** Cut here, or talk over it — mention the connector catalog, the pricing, whatever's relevant to the prospect.
5. **Open the `/s/<secret>` dashboard, hit the test button.** Show the $0.04 test image landing in real time.
6. **Copy the URL, paste into GHL → Ask AI → + Add custom MCP, generate an image live.** End on the finished image showing up inside GHL chat.

Keep it moving. No dead air, no explaining what MCP stands for. Show the outcome, not the mechanism. Send it cold in a DM with the opening line above as the message — don't over-explain in text and let the video do the convincing.

## Seller dashboard

URL: `/s/<secret>/sales` — same secret as the regular `/s/<secret>` control room. The page only renders when `GUMROAD_ACCESS_TOKEN` is set on the deployment; every buyer's copy is missing that env var, so the route 404s for them (same not-your-page treatment as a wrong secret). This is deliberate — **never mention this section in buyer-facing docs, and never add `GUMROAD_ACCESS_TOKEN` to `.env.example`.** It only ever gets set on Fresh's own Vercel project.

**Creating the token:** Gumroad → Settings → Advanced → Applications → New application. Name it anything (e.g. "FreshGen Link seller dashboard"). Redirect URI can be `http://localhost` — Gumroad requires something there but it's never actually used for this flow. Generate access token, copy it, then Vercel → this project → Settings → Environment Variables → `GUMROAD_ACCESS_TOKEN` → redeploy.

**What it shows:** every sale of this product — date, email, amount paid, a masked license key, and a derived status (Active / Disabled / Refunded / Chargeback / Disputed). Summary tiles for total sales, revenue, refunds/chargebacks, and active keys. Per-row Disable/Enable buttons that call Gumroad directly, no need to leave the page.

**Key-sharing playbook:** buyer looks like they're passing their license key around → hit Disable on that row → contact them. Their deployment doesn't fail closed instantly — FreshGen Link caches a verified license for `RECHECK_MS` (6 hours, see `lib/license.ts`) per warm Vercel instance, so it can take up to ~6h for a Disable to actually show up as "not activated" on their end. If it's a false alarm or they clear it up, hit Enable — same ~6h lag before their deployment recognizes it's active again.

## Quick reference

- Images: **$0.02–$0.09** (FreshGen) vs **$0.04–$0.12** (GHL native)
- Video: **~$0.025/sec measured** (FreshGen) vs **$0.15–$0.40/sec** (GHL native)
- Vercel Hobby = free but non-commercial only; Pro = $20/mo, included from Tier 2 up
- Four tiers: Lite (free), Self-serve Full, Done-for-you, White-label
- The whole pitch in one line: your server, your key, at-cost pricing, no lock-in

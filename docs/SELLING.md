# Selling FreshGen Link

Internal notes for Fresh — pricing math, positioning, tiers, and scripts. Not for the buyer.

Use this whenever a GHL agency owner is already paying for AI image/video generation inside GHL, is curious about AI tools for client work, or asks some version of "why not just use what's built in."

## The math

GHL's native Agent Studio generation is expensive — it's a resold markup on top of the underlying model cost, not the cost of the model itself.

| | GHL native (Agent Studio) | FreshGen Link (via Kie.ai) |
|---|---|---|
| Image | $0.04 – $0.12 each | **$0.02 – $0.09** each |
| Video | $0.15 – $0.40 **per second** | **~$0.05/sec** (kling default, ~$0.25 for 5s) |
| 10-second video | **$1.50 – $4.00** | **~$0.50** |

Headline: **video runs about 10x cheaper** through FreshGen Link than GHL's cheapest native option. Images run 2–4x cheaper. The gap exists because GHL's price is a reseller markup on top of a model provider — FreshGen Link removes the reseller and bills the client's own wallet at Kie.ai's raw, wholesale rate.

## Who this is for

GHL agency owners already generating (or wanting to generate) images or video for clients inside GHL. Best-fit signals:

- Already running client work through Workflow AI Agents or Ask AI.
- Doing enough volume that per-generation savings add up — an agency running a handful of images a month won't feel this the way one running weekly ad creative or content batches will.
- Comfortable clicking a deploy button and following a README — or willing to pay for the Done-for-you tier if not.

## Positioning

GHL's connector catalog already lists Higgsfield and OpenArt. Don't pretend they don't exist — sell against what's actually different:

- **Higgsfield / OpenArt:** their subscription, their OAuth account, their pricing, their rules. The client is renting access.
- **FreshGen Link:** the client's own server, their own Kie.ai key, at-cost pricing forever, white-labelable under their own brand if they want it.

Nobody else is selling "you own the server, you own the key" for GHL AI media generation right now. That gap is the whole pitch.

## Tiers

**Tier 1 — Self-serve, $X**
Deploy link + docs. They click Deploy, follow the README, connect it themselves. You're selling the packaging, not your time. Delivery: instant, the moment they pay.

**Tier 2 — Done-for-you install, $X**
You deploy it and connect it on a screen-share. Includes moving them to Vercel Pro so they're not quietly violating Hobby's commercial-use terms. For agency owners who don't want to touch Vercel or GitHub at all. Delivery: one call.

**Tier 3 — White-label, $X (top tier)**
Everything in Tier 2, plus `BRAND_NAME` set to their brand and an accent-color pass so it reads as their own product end to end — landing page, dashboard, all of it. Best pitched to agencies reselling this downstream to their own clients.

## Objection scripts

**"The code is public — anyone can just copy it."**
Sure, and anyone can read a cookbook too. You're not paying for secrecy — you're paying for someone who already built it, tested it, and packaged it so it deploys in three minutes instead of three days, plus support when it breaks.

**"Vercel Hobby is free, why would I pay for Pro?"**
It's free for personal, non-commercial use — that's Vercel's own terms, not mine. The moment you're running this for a client or as part of a paid service, that's commercial use. It's a $20/mo line item to stay clean, and it's already included if they go Done-for-you.

**"Why not just use Higgsfield from the catalog?"**
You can — it's a fine tool. But it's their subscription, their account, their pricing, and none of it belongs to you. This is yours: your server, your API key, at-cost pricing, your brand on it if you want. Different thing entirely.

## 60-second Loom script

1. **Click Deploy.** Show the button, one click, that's it.
2. **Sign into GitHub + Vercel.** Have both open already before recording — skip the wait.
3. **Paste your Kie.ai key, make up a secret.** Point out it's just a random string, nothing to remember.
4. **Wait ~2 minutes for the build.** Cut here, or talk over it — mention the connector catalog, the pricing, whatever's relevant to the prospect.
5. **Open the `/s/<secret>` dashboard, hit the test button.** Show the $0.04 test image landing in real time.
6. **Copy the URL, paste into GHL → Ask AI → + Add custom MCP, generate an image live.** End on the finished image showing up inside GHL chat.

Keep it moving. No dead air, no explaining what MCP stands for. Show the outcome, not the mechanism. This is the video to send cold in a DM — most conversions come from watching it, not from reading the README first.

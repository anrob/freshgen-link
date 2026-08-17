# Gumroad listing copy — FreshGen Link (Lite / Full / Agency)

Three products, one repo. The HTML descriptions and post-purchase content pages live in `docs/gumroad/` and are applied with the Gumroad CLI (logged in as Fresh):

```
gumroad products update <id> --description "$(cat docs/gumroad/<tier>-description.html)"
gumroad products content set <id> docs/gumroad/<tier>-content.json --yes
```

| Tier | Product id | Slug | Price |
|---|---|---|---|
| Full | `J7GddYMuxwoHag0VPEHI7g==` | `freshgen-link` | $47 |
| Lite | `qFp7GEt7epSSVWVnIWGDVA==` | `freshgen-link-lite` | free |
| Agency | `TtEQhFkX2y4RAnS2Kf5irw==` | `freshgen-link-agency` | $147 |

**Not offered right now:** anything Agent Studio / Superagent — keep it out of every listing.

---

# Full — $47

Field names match Gumroad's product editor. Source of truth for the description is `docs/gumroad/full-description.html`.

---

## Product tab

**Name**
```
FreshGen Link
```
(Currently lowercase "freshgen link" — capitalise it. This is the name on the receipt, the library, and Discover.)

**URL slug** — replace the auto-generated `wtasw`
```
freshgen-link
```
Gives you `iamjustfresh.gumroad.com/l/freshgen-link`, which is linkable in a DM without looking like spam.

**Call to action**
```
Get instant access
```

**Summary** (one line, shows under the title)
```
AI image and video generation inside GoHighLevel — your own server, your own API key, at cost.
```

**Description** — `docs/gumroad/full-description.html` (plain text):

```
GoHighLevel's built-in AI image and video generation is resold to you at a markup. You're paying a middleman for models you could be buying direct.

FreshGen Link cuts the middleman out. It's an MCP connector you deploy to your own Vercel account in about five minutes. You connect your own Kie.ai API key, and every image and video bills at Kie's raw wholesale price — straight to your own wallet. No subscription. No per-seat fee. No markup.

WHAT YOU ACTUALLY PAY TO GENERATE

Image — GHL native: $0.04–$0.12 · FreshGen Link: $0.02–$0.09
10-second video — GHL native: $1.50–$4.00 · FreshGen Link: about $0.25

Video runs roughly 10x cheaper. If you're making twenty 10-second clips a month, that's the difference between $30–$80 and about $5.

WHAT YOU GET

• Five tools your GHL AI agent can call straight away — generate_image, generate_video, check_status, check_credits, list_models
• Works in Ask AI and Workflow AI Agents — the same URL in both
• Finished media saves itself into your GHL Media Library automatically, so nothing expires on you
• A private dashboard — live credit balance, copy-URL button, one-click test image, and connection walkthroughs
• Twelve image and video models: GPT Image 2, Nano Banana Pro, Seedream 4, Imagen 4, Kling 2.1/2.6/3.0, Seedance 2, Wan 2.6, Grok Imagine and more
• All 23 Ask AI skills — /image, /adset, /video, /animate, /variations and one per model
• Works outside GHL too — it's a standard MCP server, so the same URL works in Claude Desktop, Claude Code and Cursor, and finished media still lands in your GHL Media Library

WHAT YOU NEED

• A free GitHub account and a Vercel account — the deploy button walks you through both
• A Kie.ai API key and a few dollars of prepaid credit ($10 covers a lot of testing)
• No coding. You click Deploy, paste three values, and copy one URL into GoHighLevel.

STRAIGHT ANSWERS

• You pay Kie.ai directly for what you generate. This product does not resell you credits and never touches your key — it lives in your own Vercel account.
• Vercel's free tier runs this fine, but their Hobby plan terms are non-commercial. Running it for clients means Vercel Pro at $20/mo.
• One license key covers one deployment, one GHL location.
• Run an agency? FreshGen Link Agency ($147) serves every sub-account from one deployment and takes your brand: https://iamjustfresh.gumroad.com/l/freshgen-link-agency
• Not sure yet? FreshGen Link Lite is free — images on GPT Image 2 only — and your Lite key swaps for a Full one whenever you're ready: https://iamjustfresh.gumroad.com/l/freshgen-link-lite
• Images and video only, on purpose. This isn't a general-purpose AI toolbox.
```

**Additional details** (each is a "+ Add detail" row — label / value)
```
Setup time        About 5 minutes
Coding required   None
Works with        Ask AI · Workflow AI Agents
Models included   12 image + video
License           1 deployment · 1 location
Support           Direct from the builder
```

---

## Content tab — THE IMPORTANT ONE

1. Under **"Customize the buyer's experience"**, turn ON:
   **Generate a unique license key per sale**

   Nothing else in the product works without this. It's what mints the key each
   buyer pastes into `LICENSE_KEY` at deploy time.

2. Content the buyer sees after purchase:

```
Your license key is at the top of this page and in your receipt email. You'll paste it in during setup — keep it somewhere safe.

STEP 1 — Deploy it
Click the deploy button in the README:
https://github.com/anrob/freshgen-link

It copies the project into your own GitHub and deploys it to your own Vercel account. Vercel will ask you for three values:

  LICENSE_KEY   the key at the top of this page
  KIE_API_KEY   your key from https://kie.ai/api-key
  MCP_SECRET    30+ random characters you make up (mash the keyboard)

Build takes about three minutes.

STEP 2 — Check it works
Open your private dashboard:

  https://YOUR-APP.vercel.app/s/YOUR-MCP-SECRET

You'll see your Kie.ai balance and a test-image button. Hit it. If an image comes back, everything's wired up.

STEP 3 — Connect it to GoHighLevel
In GHL: Ask AI → the + icon → Manage Connectors → + Add custom MCP.
Name it whatever you like, paste your MCP URL from the dashboard, click Add MCP.

Then ask your agent for an image.

Full docs, including Workflow AI Agents setup, are in the README and docs/GHL-SETUP.md.

Something broken? Reply to your receipt email and I'll sort it out.
```

---

## Receipt tab

**Message on the receipt**
```
Your license key is in this email — you'll need it during setup.

Everything you need is on the product page: the deploy button, the three values to paste, and the GoHighLevel connection steps. Setup runs about five minutes and needs no coding.

Stuck at any point, just reply to this email.
```

---

## Before you can publish

- **Connect a payout method** — the yellow banner at the top. Gumroad won't let you publish for sale until this is done.
- **Cover image** — 1280x720 minimum. A screenshot of the dashboard with a generated image visible sells this better than any graphic.
- **Thumbnail** — 600x600 square.

---

## Pricing note

$47 is set. Defensible as a launch price with no social proof yet, and it pays for
itself in the buyer's first month on video alone.

Worth knowing what you're leaving on the table: by your own math in SELLING.md, an
agency running twenty 10-second clips a month saves $25–$75 **every month**. A
one-time $47 is a rounding error against that. $97 is closer to the value, and the
buyer still breaks even in month two.

Suggestion: launch at $47, treat it as founder pricing, say so on the page, and
raise it to $97 once you have three testimonials.

---

# Lite — free

Created 2026-08-16 via the Gumroad CLI, published the same night; live at https://iamjustfresh.gumroad.com/l/freshgen-link-lite. Description source: `docs/gumroad/lite-description.html`; content page: `docs/gumroad/lite-content.json`. Product id `qFp7GEt7epSSVWVnIWGDVA==`, slug `freshgen-link-lite` → https://iamjustfresh.gumroad.com/l/freshgen-link-lite. The server already recognises this product id as the Lite tier (`lib/license.ts`).

## Already set (via CLI)

- Name `FreshGen Link Lite`, price $0, category Other, tags gohighlevel / ai / mcp
- Summary: *Free AI image generation inside GoHighLevel — your own server, your own Kie.ai key, GPT Image 2 at cost.*
- Description (the "WHAT LITE DOES / WHAT FULL ADDS / STRAIGHT ANSWERS" copy — see `gumroad products view qFp7GEt7epSSVWVnIWGDVA==`)
- Receipt message

## Still to do in the Gumroad UI (three clicks, then publish)

1. **Content tab → "Generate a unique license key per sale" → ON.** Without this, Lite buyers get no key and can't activate. (The CLI has no flag for it.)
2. **Content tab → paste the post-purchase page.** Either run
   ```
   gumroad products content set 'qFp7GEt7epSSVWVnIWGDVA==' docs/gumroad/lite-content.json --yes
   ```
   from the repo root (it's the Full page's content re-worded for Lite, with the license-key block on top), or paste the plain text below by hand.
3. **Cover + thumbnail** — reuse the Full ones or a Lite variant. `gumroad products covers add qFp7GEt7epSSVWVnIWGDVA== --image ./cover.png` / `gumroad products thumbnail set qFp7GEt7epSSVWVnIWGDVA== --image ./thumb.png`.
4. **Publish:** `gumroad products publish qFp7GEt7epSSVWVnIWGDVA==`
5. **Test it:** grab it yourself for $0, take the key, run a local server with `LICENSE_KEY=<lite key>` (or a second Vercel project) and confirm the dashboard says **Lite** and GHL sees four tools, no `generate_video`.

**Post-purchase content (plain text)**

```
Your license key is at the top of this page and in your receipt email. You'll paste it in during setup — keep it somewhere safe. This is a Lite key: images on GPT Image 2. If you upgrade to Full later, you just swap the key.

STEP 1 — Deploy it
Click the deploy button in the README: https://github.com/anrob/freshgen-link
It copies the project into your own GitHub and deploys it to your own Vercel account. Vercel will ask you for three values:
  LICENSE_KEY — the key at the top of this page
  KIE_API_KEY — your key from https://kie.ai/api-key
  MCP_SECRET — 30+ random characters you make up (mash the keyboard)
Build takes about three minutes.

STEP 2 — Check it works
Open your private dashboard: https://YOUR-APP.vercel.app/s/YOUR-MCP-SECRET
You'll see your Kie.ai balance and a test-image button. Hit it. If an image comes back, everything's wired up.

STEP 3 — Connect it to GoHighLevel
In GHL: Ask AI → the + icon → Manage Connectors → + Add custom MCP. Name it whatever you like, paste your MCP URL from the dashboard, click Add MCP. Then ask your agent for an image.

WANT VIDEO AND MORE MODELS? EVERY SUB-ACCOUNT AND YOUR BRAND?
Full ($47, one-time) adds video and five more image models: https://iamjustfresh.gumroad.com/l/freshgen-link
Agency ($147, one-time) adds every sub-account from one deployment plus your brand on it: https://iamjustfresh.gumroad.com/l/freshgen-link-agency
Either way: paste the new key into LICENSE_KEY, redeploy, and the extra tools show up in GHL on their own.

Full docs, including Workflow AI Agents setup, are in the README and docs/GHL-SETUP.md.
Something broken? Reply to your receipt email and I'll sort it out.
```


## Listing images (uploaded 2026-08-16)

Generated with GPT Image 2 through the prod server itself, using the Full cover/thumbnail as reference images. Local copies live in `docs/gumroad-assets/` (gitignored — 5 MB of PNGs); the permanent copies are on Gumroad's CDN:

| | Cover (2048×1152) | Thumbnail (square) |
|---|---|---|
| Full | https://public-files.gumroad.com/r64y0xi08wnmq4y0cagm69z1os1p | https://public-files.gumroad.com/03n420sntl5mop80upevqzuzk3zz |
| Lite | https://public-files.gumroad.com/l1lq5dev672sqvk6c2l73ppuclld | https://public-files.gumroad.com/obsousaz0toror0v5s9e2vkgjkc9 |
| Agency | https://public-files.gumroad.com/relxq4rvwnbbzd53um75x1y0e5yc | https://public-files.gumroad.com/badhpjrcztl7xhqqxh7en7ek9ktl |

Re-upload if ever needed: `gumroad products covers add <id> --image <file>` · `gumroad products thumbnail set <id> --image <file>`.

---

# Agency — $147

Created 2026-08-16 as a **draft** via the Gumroad CLI. Product id `TtEQhFkX2y4RAnS2Kf5irw==`, slug `freshgen-link-agency` → https://iamjustfresh.gumroad.com/l/freshgen-link-agency. The server already recognises this product id as the Agency tier (`lib/license.ts`).

**Already set (via CLI):** name, $147, summary (*AI image and video generation inside GoHighLevel for every sub-account you manage — one deployment, your own key, your own brand.*), description (`docs/gumroad/agency-description.html`), receipt, tags.

**Still to do in the Gumroad UI — same drill as Lite:**

1. Content tab → **"Generate a unique license key per sale" → ON.**
2. Post-purchase page: `gumroad products content set 'TtEQhFkX2y4RAnS2Kf5irw==' docs/gumroad/agency-content.json --yes` (steps 1–3 as Full, plus Step 4 per-location URLs + agency PIT and Step 5 brand).
3. ~~Cover + thumbnail~~ — done 2026-08-16 (see Listing images above).
4. `gumroad products publish 'TtEQhFkX2y4RAnS2Kf5irw=='`
5. Test: buy it with a 100%-off code, run a server with the key, confirm the dashboard says **Agency**, shows Per-location URLs + Your brand, and `BRAND_NAME` takes effect.

**Additional details rows**
```
Setup time        About 5 minutes
Coding required   None
Works with        Ask AI · Workflow AI Agents
Sub-accounts      Unlimited from one deployment
Brand             White-label + per-client brand block
Models included   12 image + video
License           1 deployment · every sub-account
Support           Direct from the builder
```

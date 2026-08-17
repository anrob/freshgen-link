# Launch kit — posting Lite in the GHL Facebook groups

Internal, for Fresh. The whole job here is one click: **post**. Everything below exists to make that click small.

Ground rules that keep it from getting taken down:
- **Don't pitch. Show.** The post is "I built a free thing, here's it working." No price, no "DM me to buy", no Full mention in the body. Full lives inside the product (dashboard upgrade card, `list_models`, the Gumroad page).
- **Read the pinned rules first.** Most GHL groups ban self-promo in the feed but allow "here's what I built" posts, or have a promo day / a weekly thread. If it says promo Fridays, wait for Friday.
- **Link in the first comment, not the body.** Facebook downranks link posts and mods read a body link as promo.
- **If you're not sure, DM a mod first** (script below). A "no" from one mod in a DM is the cheapest rep you will ever take.
- **Attach the 20-second screen recording.** Video of it working inside GHL does the selling so the words don't have to.

---

## Pre-flight (do once, ~30 min)

1. Gumroad: tick "generate license key" on Lite, publish it, buy it yourself for $0, confirm the key activates a Lite dashboard. (Steps in `docs/GUMROAD-LISTING.md`.)
2. Repo public — the deploy button is dead until then: `gh repo edit anrob/freshgen-link --visibility public`
3. Record the demo (shot list at the bottom). 20–30 seconds, no voice needed.
4. Pick 3 groups. Read each one's pinned rules. Note promo days.

---

## The post (Lite, "I built this")

> built a free thing for GHL people. sharing in case it's useful.
>
> my sub-accounts kept needing images (hero shots, ad creative, logos with text in them) and GHL's built-in generation was charging me markup for models I could buy direct. so I built a small connector that plugs GPT Image 2 straight into Ask AI. you type "make me a 16:9 hero image for a roofing page" and it comes back in the chat. it can save straight into your Media Library too.
>
> - runs on your own Vercel account (one click, about 5 min)
> - your own Kie.ai key — around 4 cents an image, no subscription
> - works in Ask AI and Workflow AI Agents
> - no code
>
> it's free. link's in the first comment. if it breaks for you, tell me and I'll fix it.
>
> *(attach: the 20-second screen recording)*

**First comment (post it immediately after):**

> here you go → https://iamjustfresh.gumroad.com/l/freshgen-link-lite
> setup is 3 values pasted into Vercel + 1 URL pasted into GHL. docs are on the page.

**Shorter version** (for stricter groups, or as a reply when someone asks "any AI image tool for GHL?"):

> I built one for my own sub-accounts and made it free — plugs GPT Image 2 into Ask AI, runs on your own Vercel + your own Kie.ai key (~4¢ an image). works in Workflow AI Agents too. happy to send the link if you want it.

---

## Mod DM (send before posting if the rules are unclear)

> hey [name] — quick check before I post. I built a free connector that puts AI image generation into Ask AI (own server, own API key, no subscription). it's genuinely free, not a lead magnet for a course or anything. is a "here's what I built, link in comments" post OK in the group, or is there a better thread/day for it? happy to do whatever you prefer.

If they say no: "no worries, thanks for the quick answer" — and post it in the next group. That's it.

---

## Canned replies

Keep them short. Match their energy. Answer, then stop.

**"Is it actually free / what's the catch?"**
> yeah actually free. it does one thing — images on GPT Image 2 — and does it well. there's a paid version with video + more models ($47) and an agency one that covers all your sub-accounts ($147), but you don't need either to use this. the only cost is your own Kie.ai usage, ~4¢ an image.

**"How do I install it? I don't code."**
> no code. click the deploy button, paste 3 values (your license key from the free page, your Kie.ai key, a made-up password), wait 3 minutes, copy one URL into Ask AI → Manage Connectors → Add custom MCP. the page walks you through it. if you get stuck, message me and I'll get you through it.

**"Is this allowed / against GHL's ToS?"**
> it's a standard MCP connector — the same mechanism GHL built for connecting outside tools to Ask AI and Workflows. nothing is hacked or scraped. it's just your own server on the other end instead of a catalog app.

**"Why not just use Higgsfield / OpenArt from the catalog?"**
> those are fine. difference is they're their subscription, their account, their pricing. this is your server and your key at Kie's raw price, and it's free. use whichever fits.

**"Does it do video?"**
> not the free one — that's images only on purpose. Full ($47) does video (Kling, Seedance etc — about 10x cheaper than GHL native) plus 5 more image models. same install, you just swap the key: https://iamjustfresh.gumroad.com/l/freshgen-link

**"Is my API key safe?"**
> it lives in your own Vercel project's env vars. nobody — including me — ever sees it. the code is on GitHub if you want to check.

**"Can I white-label / put my brand on it?" / "I run multiple sub-accounts"**
> that's the Agency version ($147) — one deployment covers every sub-account (each gets its own URL, media lands in the right Media Library) and it takes your brand name everywhere: https://iamjustfresh.gumroad.com/l/freshgen-link-agency

**"Does it work in Workflows?"**
> yes — Ask AI and Workflow AI Agents, same URL in both. (Agent Studio isn't offered right now.)

**"The code's public, why would anyone pay for the paid version?"**
> because they're paying for it to be built, tested and packaged so it deploys in 3 minutes instead of 3 days, plus me when it breaks. same reason people buy cookbooks.

**"What about Vercel costs?"**
> free tier runs it fine. Vercel's hobby plan says non-commercial though, so if you're running it for clients that's their $20/mo pro plan. that's Vercel's rule, not mine.

**Someone's snarky ("it's just an MCP wrapper", "lol another AI tool"):**
> yep, that's exactly what it is — a small one that does one thing. it saved me money so I shared it. no worries if it's not for you.
> *(then stop. do not keep replying to that thread.)*

**Someone says it broke:**
> ugh, sorry — DM me what you saw (screenshot of the dashboard is perfect) and I'll fix it today.
> *(this is the best comment you can get. it's a real user.)*

---

## What happens next (the part the fear is about)

- **Post gets removed.** Nothing else happens. Read the reason if they give one, adjust, post it in the next group. Cost: $0.
- **Zero comments in 24 hours.** Normal for a first post in a big group. Post it in the other two groups. Repost in the first one in 7–10 days with a different opener (e.g. show a specific result: "made this whole ad set for a client inside Ask AI in 4 minutes").
- **One person signs up.** That's a win. Watch `/s/<secret>/sales` — the Lite sign-ups tile is the scoreboard.
- **Someone asks for video / multiple sub-accounts / their brand on it.** That's the upgrade conversation happening by itself. Video → Full link; sub-accounts or brand → Agency link. Don't oversell.

The rep isn't "sell". The rep is "post, then survive whatever happens." Every one of these outcomes is survivable, and three of the four are good.

---

## Demo recording — shot list (20–30s, no voice)

Record with QuickTime (⌘⇧5) or Loom. 4x speed on the wait.

1. **0–4s** — GHL Ask AI open, connector already added. Type: `make me a 16:9 hero image for a roofing landing page, bold headline "FREE ROOF INSPECTION"`, hit enter.
2. **4–14s** — speed through the wait (or cut). Image appears inline in the chat.
3. **14–20s** — click Media Library. The image is sitting there.
4. **20–24s** — (optional) end card: "free · your own server · link in comments".

Export as MP4. Attach it to the post directly (native video > YouTube link — reach is better and no one has to leave FB).

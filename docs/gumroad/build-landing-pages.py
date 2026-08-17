#!/usr/bin/env python3
"""Build the Lite and Agency Gumroad custom landing pages from the Full page's
head/CSS. Run from the repo root. Writes docs/gumroad-landing-lite.html and
docs/gumroad-landing-agency.html; also patches one stale FAQ line on Full."""
import re

FULL = "docs/gumroad-landing.html"
src = open(FULL).read()
head, _ = src.split("<body>", 1)

# Full: the "several clients" FAQ now has a real answer.
src2 = src.replace(
    "<div class=\"details-body\"><p>One license key covers one deployment. Running it for several brands or clients? Message me.</p></div>",
    "<div class=\"details-body\"><p>One Full license covers one deployment, one GHL location. Running clients? <a href=\"https://iamjustfresh.gumroad.com/l/freshgen-link-agency\">FreshGen Link Agency</a> ($147) serves every sub-account from one deployment and takes your brand.</p></div>",
)
if src2 != src:
    open(FULL, "w").write(src2)
    print("full: FAQ line updated")

FOOTER = """<footer class="site-footer">
  <div class="container footer-inner">
    <p>Built by Fresh</p>
    <p><a href="https://github.com/anrob/freshgen-link" target="_blank" rel="noreferrer">Full docs &amp; README on GitHub</a></p>
    <p><a href="https://freshgen-link.vercel.app/terms.html" target="_blank" rel="noreferrer">Terms of Service</a> &middot; <a href="https://freshgen-link.vercel.app/privacy.html" target="_blank" rel="noreferrer">Privacy Policy</a> &mdash; by getting it you agree to the Terms.</p>
    <p>Something broken? Reply to your receipt email.</p>
  </div>
</footer>

<!-- No JS on purpose (Gumroad's sandbox). -->

</body>
</html>
"""

STEPS = """        <ol class="steps">
          <li class="step">
            <div>
              <h3>Deploy</h3>
              <p>Click the deploy button, sign into GitHub and Vercel &mdash; both free &mdash; and paste three values: your license key, your Kie.ai API key, and a random secret you make up. The build takes about three minutes.</p>
            </div>
          </li>
          <li class="step">
            <div>
              <h3>Prove it works</h3>
              <p>Open your private dashboard and hit the test-image button. If an image comes back, your Kie.ai key is wired up correctly &mdash; before you touch GoHighLevel at all.</p>
            </div>
          </li>
          <li class="step">
            <div>
              <h3>Connect to GHL</h3>
              <p>In GoHighLevel: Ask AI &rarr; the + icon &rarr; Manage Connectors &rarr; + Add custom MCP. Paste your MCP URL, click Add MCP, then ask your agent for an image.</p>
            </div>
          </li>
        </ol>"""

def diagram(mid_label, mid_sub, caption):
    return f"""        <div class="diagram-wrap" aria-hidden="true">
          <div class="diagram">
            <div class="diagram-box">GoHighLevel</div>
            <div class="diagram-arrow"></div>
            <div class="diagram-box diagram-box-strong">{mid_label}<span class="diagram-muted">{mid_sub}</span></div>
            <div class="diagram-caption">{caption}</div>
            <div class="diagram-arrow"></div>
            <div class="diagram-box">Kie.ai</div>
          </div>
        </div>"""

# ───────────────────────────── LITE ─────────────────────────────
lite_body = f"""<body>
<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
  <div class="container masthead">
    <div class="masthead-left">
      <div class="wordmark">FreshGen Link <span style="color:var(--accent)">Lite</span></div>
      <p class="kicker">Free &middot; for GoHighLevel</p>
    </div>
    <div class="masthead-buy">
      <span class="price-tag">Free<span class="price-tag-note">no card</span></span>
      <button type="button" class="btn" data-gumroad-action="buy">Get it free</button>
    </div>
  </div>
</header>

<main id="main">

  <section class="section hero">
    <div class="container">
      <h1>Free AI images, inside your GoHighLevel.</h1>
      <p class="sub">FreshGen Link Lite is a small connector you deploy to your own Vercel account. Connect your own Kie.ai key, paste one URL into Ask AI, and your GHL agent makes images with GPT Image 2 &mdash; the best model there is for anything with words in it &mdash; at Kie's raw price. About four cents an image. No subscription, no markup, free forever.</p>
      <div class="hero-actions">
        <button type="button" class="btn btn-lg" data-gumroad-action="buy">Get it free &mdash; no card needed</button>
        <p class="quiet-line">Gumroad will show a &ldquo;name a fair price&rdquo; box &mdash; leave it at 0. Deploy &rarr; paste three values &rarr; paste one URL into GoHighLevel. About five minutes, no code.</p>
      </div>
    </div>
  </section>

  <section class="section features" aria-labelledby="features-h2">
    <div class="container">
      <p class="kicker">What Lite does</p>
      <h2 id="features-h2">One thing, done well.</h2>

      <dl class="feature-grid">
        <div class="feature">
          <dt>Images on GPT Image 2</dt>
          <dd>Logos, signs, menus, ad text, product shots, hero images &mdash; anything with words in it. About $0.04 an image, billed by Kie.ai to your own wallet.</dd>
        </div>
        <div class="feature">
          <dt>Works in Ask AI and Workflows</dt>
          <dd>Ask AI for on-demand images, Workflow AI Agents for automations &mdash; the same URL in both.</dd>
        </div>
        <div class="feature">
          <dt>Auto-saves to your Media Library</dt>
          <dd>Finished images copy themselves into your GHL Media Library automatically, so nothing expires on you. Optional &mdash; one token.</dd>
        </div>
        <div class="feature">
          <dt>A private dashboard</dt>
          <dd>Live Kie.ai balance, a copy-URL button, a one-click test image, and the connection walkthrough.</dd>
        </div>
        <div class="feature">
          <dt>The <code>/gpt-image-2</code> skill</dt>
          <dd>One Ask AI skill file: a slash command with flags for aspect ratio, resolution and reference images, plus prompt rules written for this model.</dd>
        </div>
        <div class="feature">
          <dt>Yours, not rented</dt>
          <dd>Your Vercel account, your Kie.ai key, your URL. Nobody &mdash; including us &mdash; ever sees your key or your generations.</dd>
        </div>
      </dl>
    </div>
  </section>

  <section class="section how" aria-labelledby="how-h2">
    <div class="container">
      <p class="kicker">How it works</p>
      <h2 id="how-h2">Three steps. About five minutes.</h2>

      <div class="how-grid">
{STEPS}
{diagram("FreshGen Link Lite", "(your Vercel)", "your key &middot; your wallet")}
      </div>
    </div>
  </section>

  <section class="section faq" aria-labelledby="faq-h2">
    <div class="container">
      <p class="kicker">FAQ</p>
      <h2 id="faq-h2">Straight answers</h2>

      <div class="faq-list">
        <details>
          <summary>Is it actually free? What's the catch?</summary>
          <div class="details-body"><p>Actually free. It does one thing &mdash; images on GPT Image 2 &mdash; and does it well. The only cost is your own Kie.ai usage, about $0.04 an image, billed by Kie.ai to you.</p></div>
        </details>
        <details>
          <summary>Why is it free?</summary>
          <div class="details-body"><p>I built it for my own sub-accounts. The image half costs me nothing to give away, and I'd rather you find out it works than take my word for it.</p></div>
        </details>
        <details>
          <summary>Do I need to know how to code?</summary>
          <div class="details-body"><p>No. Click the deploy button, paste three values (your license key from this page, your Kie.ai key, a made-up password), wait three minutes, copy one URL into Ask AI. If you can fill out a form, you can set this up.</p></div>
        </details>
        <details>
          <summary>Is my API key safe?</summary>
          <div class="details-body"><p>It lives in your own Vercel project's environment variables. Nobody &mdash; including us &mdash; ever sees it. The code is on GitHub if you want to check.</p></div>
        </details>
        <details>
          <summary>Is this allowed by GoHighLevel?</summary>
          <div class="details-body"><p>It's a standard MCP connector &mdash; the same mechanism GHL built for connecting outside tools to Ask AI and Workflows. Nothing is hacked or scraped; it's just your own server on the other end instead of a catalog app.</p></div>
        </details>
        <details>
          <summary>What does Vercel cost?</summary>
          <div class="details-body"><p>Vercel's free tier runs this fine. Their Hobby plan terms are non-commercial, though &mdash; running it for clients means Vercel Pro at $20/month. That's Vercel's rule, not ours.</p></div>
        </details>
      </div>
    </div>
  </section>

  <section class="section pricing" aria-labelledby="pricing-h2">
    <div class="container">
      <p class="kicker">Get it</p>
      <h2 id="pricing-h2">Free. One key, one deployment.</h2>

      <div class="price-block">
        <div class="price-display">$0</div>
        <div class="price-meta">
          <p class="price-label">No card. No trial clock.</p>
          <p>Your license key arrives by email the moment you click.</p>
        </div>
      </div>

      <div class="pricing-details">
        <h3>What you need</h3>
        <ul>
          <li>A free GitHub account and a Vercel account &mdash; the deploy button walks you through both.</li>
          <li>A <a href="https://kie.ai" target="_blank" rel="noreferrer">Kie.ai</a> API key and a few dollars of prepaid credit &mdash; $5 is about 125 images.</li>
          <li>No coding. Click Deploy, paste your values, copy one URL into GoHighLevel.</li>
        </ul>
        <p class="honesty-line">Gumroad shows a &ldquo;name a fair price&rdquo; box on free products. Leave it at 0 &mdash; or tip if you feel like it. Either way you get the same key.</p>
      </div>

      <button type="button" class="btn btn-lg" data-gumroad-action="buy">Get FreshGen Link Lite &mdash; free</button>

      <p class="fine-print">Source-available license. Your server, your key, at-cost pricing. Kie.ai usage is billed by Kie.ai to your own account.</p>
    </div>
  </section>

</main>

""" + FOOTER

# ───────────────────────────── AGENCY ─────────────────────────────
agency_body = f"""<body>
<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
  <div class="container masthead">
    <div class="masthead-left">
      <div class="wordmark">FreshGen Link <span style="color:var(--accent)">Agency</span></div>
      <p class="kicker">For agencies running clients in GoHighLevel</p>
    </div>
    <div class="masthead-buy">
      <span class="price-tag"><span data-gumroad-field="price">$147</span><span class="price-tag-note">one-time</span></span>
      <button type="button" class="btn" data-gumroad-action="buy">Buy Agency</button>
    </div>
  </div>
</header>

<main id="main">

  <section class="section hero">
    <div class="container">
      <h1>Every sub-account. One deployment. Your brand.</h1>
      <p class="sub">FreshGen Link Agency is the full FreshGen Link &mdash; every image and video model at Kie's raw price, on your own server &mdash; plus the two things an agency actually needs: a URL for every sub-account you manage, and your name on it instead of ours.</p>
      <div class="hero-actions">
        <button type="button" class="btn btn-lg" data-gumroad-action="buy">Get Agency &mdash; <span data-gumroad-field="price">$147</span></button>
        <p class="quiet-line">One deployment, one Kie.ai key, one bill &mdash; every client's media lands in their own Media Library. About ten minutes to set up, no code.</p>
      </div>
    </div>
  </section>

  <section class="section math" aria-labelledby="math-h2">
    <div class="container">
      <p class="kicker">The math</p>
      <h2 id="math-h2">GHL's markup, times every client.</h2>
      <p class="sub-note">GHL's native generation is a reseller markup on the same model providers &mdash; and you pay it per sub-account. Agency removes the reseller for all of them at once and bills one Kie.ai wallet at the raw rate.</p>

      <div class="table-wrap">
        <table class="price-table">
          <thead>
            <tr>
              <th scope="col">What you're generating</th>
              <th scope="col">GHL native</th>
              <th scope="col">FreshGen Link Agency</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Image</td>
              <td class="price">$0.04 &ndash; $0.12</td>
              <td class="price">$0.02 &ndash; $0.09</td>
            </tr>
            <tr>
              <td>10-second video</td>
              <td class="price">$1.50 &ndash; $4.00</td>
              <td class="price">about $0.25</td>
            </tr>
            <tr>
              <td>Five clients &mdash; 20 clips each, monthly</td>
              <td class="price">$150 &ndash; $400</td>
              <td class="price">about $25</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="table-caption">The $147 is one client's worth of GHL-native video markup. Once.</p>
    </div>
  </section>

  <section class="section features" aria-labelledby="features-h2">
    <div class="container">
      <p class="kicker">What Agency adds</p>
      <h2 id="features-h2">Built for the person with twelve sub-accounts.</h2>

      <dl class="feature-grid">
        <div class="feature">
          <dt>Every sub-account, one deployment</dt>
          <dd>Paste a sub-account's Location ID into the dashboard and it hands you that sub-account's own MCP URL. Media generated through it saves into that sub-account's Media Library &mdash; automatically.</dd>
        </div>
        <div class="feature">
          <dt>Your brand on it</dt>
          <dd>Set one value and &ldquo;FreshGen&rdquo; becomes your name on the landing page, the dashboard and the server name GoHighLevel shows.</dd>
        </div>
        <div class="feature">
          <dt>A brand block per client</dt>
          <dd>The dashboard's Your brand section has a paste-ready block for the Ask AI skills &mdash; colors, style, voice &mdash; so each client's generations match their look without anyone typing it each time.</dd>
        </div>
        <div class="feature">
          <dt>Everything in Full</dt>
          <dd>Six image models, six video models, auto-save to the Media Library, all 23 Ask AI skills, works in Ask AI and Workflow AI Agents, and outside GHL in Claude and Cursor too.</dd>
        </div>
        <div class="feature">
          <dt>One key, one bill</dt>
          <dd>Every client runs on your Kie.ai wallet at cost. Check the balance from any sub-account with <code>check_credits</code>.</dd>
        </div>
        <div class="feature">
          <dt>Yours, not rented</dt>
          <dd>Your Vercel account, your key, your URLs. Nobody &mdash; including us &mdash; ever sees your key, your clients or their generations.</dd>
        </div>
      </dl>
    </div>
  </section>

  <section class="section how" aria-labelledby="how-h2">
    <div class="container">
      <p class="kicker">How it works</p>
      <h2 id="how-h2">Three steps, then one URL per client.</h2>

      <div class="how-grid">
{STEPS}
{diagram("FreshGen Link Agency", "(your Vercel &middot; your brand)", "one key &middot; every sub-account")}
      </div>
      <p class="sub-note" style="margin-top:26px">Then, per client: create an agency-level Private Integration Token in GHL once, paste each sub-account's Location ID into your dashboard, and connect that sub-account with its own URL. The docs show exactly where to click.</p>
    </div>
  </section>

  <section class="section faq" aria-labelledby="faq-h2">
    <div class="container">
      <p class="kicker">FAQ</p>
      <h2 id="faq-h2">Straight answers</h2>

      <div class="faq-list">
        <details>
          <summary>I'm already on Full (or Lite). How do I upgrade?</summary>
          <div class="details-body"><p>Buy Agency, paste the new key into <code>LICENSE_KEY</code> in Vercel, redeploy. Same URL &mdash; nothing in GHL needs reconnecting. The per-location builder and Your brand section appear on your dashboard on their own.</p></div>
        </details>
        <details>
          <summary>How does one deployment save into different clients' Media Libraries?</summary>
          <div class="details-body"><p>Each sub-account gets a URL with its Location ID in it. Anything generated through that URL is saved into that sub-account's Media Library. It needs an agency-level GHL Private Integration Token with access to those sub-accounts &mdash; created once, in Agency Settings.</p></div>
        </details>
        <details>
          <summary>What exactly does white-label change?</summary>
          <div class="details-body"><p>The name. Set <code>BRAND_NAME</code> and it replaces &ldquo;FreshGen&rdquo; on the landing page, the dashboard and the connector name your team sees inside GoHighLevel. Your clients never see our name.</p></div>
        </details>
        <details>
          <summary>Do you resell me Kie.ai credits?</summary>
          <div class="details-body"><p>No. You pay Kie.ai directly for what every client generates. This never touches your key &mdash; it lives in your own Vercel account.</p></div>
        </details>
        <details>
          <summary>Is Vercel's free tier enough?</summary>
          <div class="details-body"><p>Technically yes, but Vercel's Hobby plan terms are non-commercial and this is client work. Budget Vercel Pro at $20/month to stay inside their terms.</p></div>
        </details>
        <details>
          <summary>Do I need to know how to code?</summary>
          <div class="details-body"><p>No. Click Deploy, paste three values, copy one URL per sub-account into GHL. If you can fill out a form, you can set this up.</p></div>
        </details>
      </div>
    </div>
  </section>

  <section class="section pricing" aria-labelledby="pricing-h2">
    <div class="container">
      <p class="kicker">Pricing</p>
      <h2 id="pricing-h2">One license. Every sub-account.</h2>

      <div class="price-block">
        <div class="price-display" data-gumroad-field="price">$147</div>
        <div class="price-meta">
          <p class="price-label">One-time. Founder pricing.</p>
          <p>Pays for itself with one client's first month of video.</p>
        </div>
      </div>

      <div class="pricing-details">
        <h3>What you need</h3>
        <ul>
          <li>A free GitHub account and a Vercel account &mdash; the deploy button walks you through both.</li>
          <li>A <a href="https://kie.ai" target="_blank" rel="noreferrer">Kie.ai</a> API key and prepaid credit.</li>
          <li>An agency-level GHL Private Integration Token, so one deployment can save into every sub-account's Media Library &mdash; the docs show exactly where to click.</li>
          <li>No coding. Click Deploy, paste your values, copy one URL per sub-account into GoHighLevel.</li>
        </ul>
        <p class="honesty-line">Vercel's Hobby plan is free but non-commercial. Running this for clients means Vercel Pro, $20/month, to stay inside the terms.</p>
      </div>

      <button type="button" class="btn btn-lg" data-gumroad-action="buy">Buy FreshGen Link Agency &mdash; <span data-gumroad-field="price">$147</span></button>

      <p class="fine-print">Source-available license. One key covers one deployment and every sub-account it serves. Kie.ai usage is billed by Kie.ai to your own account. Not sure yet? <a href="https://iamjustfresh.gumroad.com/l/freshgen-link-lite">Lite is free</a>; single-location is <a href="https://iamjustfresh.gumroad.com/l/freshgen-link">Full, $47</a>.</p>
    </div>
  </section>

</main>

""" + FOOTER

open("docs/gumroad-landing-lite.html", "w").write(head + lite_body)
open("docs/gumroad-landing-agency.html", "w").write(head + agency_body)
print("wrote lite + agency pages")

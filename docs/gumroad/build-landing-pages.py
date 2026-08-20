#!/usr/bin/env python3
"""Build the Lite Gumroad custom landing page from the Full page's head/CSS.
Run from the repo root. Writes docs/gumroad-landing-lite.html."""

FULL = "docs/gumroad-landing.html"
src = open(FULL).read()
head, _ = src.split("<body>", 1)

FOOTER = """<footer class="site-footer">
  <div class="container footer-inner">
    <p>Built by Fresh</p>
    <p><a href="https://github.com/anrob/freshgen-link" target="_blank" rel="noreferrer">Full docs &amp; README on GitHub</a></p>
    <p><a href="https://freshgen-link.vercel.app/terms.html" target="_blank" rel="noreferrer">Terms of Service</a> &middot; <a href="https://freshgen-link.vercel.app/privacy.html" target="_blank" rel="noreferrer">Privacy Policy</a> &mdash; by getting it you agree to the Terms.</p>
    <p>Something broken? Reply to your receipt email.</p>
    <p class="trademark">GoHighLevel and HighLevel are trademarks of HighLevel Inc. FreshGen Link is an independent product and is not affiliated with, endorsed by, or sponsored by HighLevel. Kie.ai is a trademark of its owner.</p>
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
      <p class="sub">FreshGen Link Lite is a small connector you deploy to your own Vercel account. Connect your own Kie.ai key, paste one URL into Ask AI, and your GHL agent makes images with GPT Image 2 &mdash; the best model there is for anything with words in it &mdash; billed by Kie.ai at Kie's own price. About four cents an image. No subscription, nothing added on top, free forever.</p>
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
          <div class="details-body"><p>Yes &mdash; it uses GoHighLevel's own custom MCP connector feature, the supported way to add outside tools to Ask AI and Workflow AI Agents. Your server on one end, GoHighLevel's connector on the other.</p></div>
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

open("docs/gumroad-landing-lite.html", "w").write(head + lite_body)
print("wrote lite page")

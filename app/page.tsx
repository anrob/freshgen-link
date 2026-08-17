import { TIER_FEATURES, brandFor, currentTier } from "@/lib/license";
import { gumroadSellerEnabled } from "@/lib/gumroad";

// The root of every deployment. Deliberately small: it is not a sales page
// (Gumroad is) and it is not the dashboard (/s/<secret> is). It just tells a
// visitor what this server is and, if they own it, where to go.
export const dynamic = "force-dynamic";

const GUMROAD = {
  lite: { url: "https://iamjustfresh.gumroad.com/l/freshgen-link-lite", label: "FreshGen Link Lite — free" },
  full: { url: "https://iamjustfresh.gumroad.com/l/freshgen-link", label: "FreshGen Link — $47 one-time" },
  agency: { url: "https://iamjustfresh.gumroad.com/l/freshgen-link-agency", label: "FreshGen Link Agency — $147 one-time" },
} as const;

export default async function Landing() {
  const tier = await currentTier();
  const f = TIER_FEATURES[tier];
  const brand = brandFor(tier);
  // A white-labelled (Agency) deployment shouldn't advertise FreshGen to the
  // agency's own visitors; an un-branded one may point people at its own tier.
  // The seller's own deployment (the only one with a Gumroad token) lists all
  // three, since its public URL is the one that ends up in docs and links.
  const whiteLabelled = brand !== "FreshGen";
  const seller = gumroadSellerEnabled();
  const getLinks = seller
    ? [GUMROAD.lite, GUMROAD.full, GUMROAD.agency]
    : whiteLabelled
      ? []
      : [GUMROAD[tier]];

  return (
    <div className="container">
      <header className="masthead">
        <div className="wordmark">
          {brand} <em>Link</em>
        </div>
        <div className="masthead-note">AI media server for GoHighLevel</div>
      </header>

      <section className="section hero" style={{ padding: "52px 48px 44px" }}>
        <div className="kicker">Self-hosted · MCP · Your own Kie.ai key</div>
        <h1 style={{ fontSize: "clamp(30px, 4.5vw, 46px)" }}>
          This is a {brand} Link server.
        </h1>
        <p className="sub">
          A private MCP connector that gives GoHighLevel&apos;s Ask AI and Workflow AI
          Agents image{f.video ? " and video" : ""} generation through its owner&apos;s own
          Kie.ai account, billed at Kie&apos;s price. It runs on the owner&apos;s Vercel —
          this page is just its front door. There is nothing to download here.
        </p>
      </section>

      <section className="section">
        <div className="card">
          <h3>Own this server?</h3>
          <p style={{ fontSize: 15 }}>
            Your dashboard is at <code>/s/&lt;your-secret&gt;</code> — the{" "}
            <code>MCP_SECRET</code> you set when deploying. It has your MCP URL, your
            Kie.ai balance, a test button and the GoHighLevel connection steps. It is
            never linked from this page on purpose; bookmark it.
          </p>
        </div>

        {getLinks.length > 0 && (
          <div className="card">
            <h3>Want one of your own?</h3>
            <p style={{ fontSize: 15 }}>
              FreshGen Link deploys to your own Vercel account in about five minutes —
              no code, your own Kie.ai key, your own private URL.
            </p>
            <p style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {getLinks.map((g, i) => (
                <a
                  key={g.url}
                  className={i === 0 ? "btn" : "btn ghost"}
                  href={g.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {g.label}
                </a>
              ))}
            </p>
          </div>
        )}

        <div className="card">
          <h3>Docs</h3>
          <p style={{ fontSize: 15, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href="https://github.com/anrob/freshgen-link#readme" rel="noreferrer">
              README &amp; setup guide
            </a>
            <a href="/terms.html">Terms</a>
            <a href="/privacy.html">Privacy</a>
          </p>
        </div>
      </section>

      <footer className="footer" style={{ flexDirection: "column", gap: 8 }}>
        <span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>{brand} Link · powered by Kie.ai · runs on Vercel</span>
          <a href="https://kie.ai" rel="noreferrer">Get a Kie.ai key</a>
          <a href="/terms.html">Terms</a>
          <a href="/privacy.html">Privacy</a>
        </span>
        <span style={{ fontSize: 12 }}>
          GoHighLevel and HighLevel are trademarks of HighLevel Inc. {brand} Link is an
          independent product and is not affiliated with, endorsed by, or sponsored by
          HighLevel. Kie.ai is a trademark of its owner.
        </span>
      </footer>
    </div>
  );
}

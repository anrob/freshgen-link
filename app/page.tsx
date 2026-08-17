import { KIE_MODELS } from "@/lib/kie";
import { VIDEO_MODELS } from "@/lib/kie-video";
import { AGENCY_PRICE, AGENCY_URL, UPGRADE_PRICE, UPGRADE_URL, brandFor, currentTier } from "@/lib/license";
import { LITE_IMAGE_MODEL } from "@/lib/tools";

// Rendered per request (not at build) so the tier comes from the deployment's
// live license verdict, and a build never depends on reaching Gumroad.
export const dynamic = "force-dynamic";

export default async function Landing() {
  const tier = await currentTier();
  const lite = tier === "lite";
  const brand = brandFor(tier);
  const imageModels = lite ? KIE_MODELS.filter((m) => m.id === LITE_IMAGE_MODEL) : KIE_MODELS;
  return (
    <div className="container">
      <header className="masthead">
        <div className="wordmark">
          {brand} <em>Link</em>
        </div>
        <div className="masthead-note">
          AI media server for GoHighLevel{lite ? " · Lite" : ""}
        </div>
      </header>

      <section className="section hero">
        <div className="kicker">Self-hosted · Your API key · MCP</div>
        <h1>
          {lite
            ? "AI images, inside your GoHighLevel."
            : "AI images and video, inside your GoHighLevel."}
        </h1>
        <p className="sub">
          {lite
            ? "Your own server. Your own Kie.ai key. About four cents an image on GPT Image 2 — no per-seat subscription, no middleman markup."
            : "Your own server. Your own Kie.ai key. Pennies per image, a quarter per video clip — no per-seat subscription, no middleman markup."}
        </p>
        <p style={{ marginTop: 22 }}>
          <a className="btn" href="#how">
            How it works
          </a>
        </p>
      </section>

      <section className="section">
        <div className="three-up">
          <div>
            <h3>Own your key</h3>
            <p>
              Generations bill straight to your prepaid Kie.ai wallet at cost.
              No reselling, no markup, no monthly seat fee.
            </p>
          </div>
          <div>
            <h3>One-click deploy</h3>
            <p>
              Lives in your Vercel account, deployed from a button in about
              three minutes. You own the whole thing.
            </p>
          </div>
          <div>
            <h3>Works where you work in GHL</h3>
            <p>
              Ask AI for on-demand images, Workflow AI Agents for automations —
              the same URL in both.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="kicker">How it works</div>
        <div className="steps">
          <div className="step">
            <div>
              <h3>Deploy your server</h3>
              <p>
                Click the deploy button, paste your Kie.ai API key, make up a
                secret. Vercel builds your private server.
              </p>
            </div>
          </div>
          <div className="step">
            <div>
              <h3>Paste your link into GoHighLevel</h3>
              <p>
                Ask AI → Connectors → <strong>+ Add custom MCP</strong> → name
                it, paste your link. That&apos;s the whole setup.
              </p>
            </div>
          </div>
          <div className="step">
            <div>
              <h3>Ask your AI for an image</h3>
              <p>
                &ldquo;Make me a 16:9 hero image for a roofing landing
                page&rdquo; — done in under a minute, saved to your Media
                Library if you want.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="kicker">Models &amp; prices</div>
        <table className="price-table">
          <thead>
            <tr>
              <th>Image model</th>
              <th>Best for</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {imageModels.map((m) => (
              <tr key={m.id}>
                <td>{m.label}</td>
                <td>{m.bestFor}</td>
                <td className="price">{m.priceNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {lite ? (
          <p className="caption" style={{ marginTop: 16 }}>
            This is the Lite edition — one image model, no video. Full (
            {UPGRADE_PRICE}) adds {KIE_MODELS.length - 1} more image models and{" "}
            {VIDEO_MODELS.length} video models:{" "}
            <a href={UPGRADE_URL} rel="noreferrer">
              {UPGRADE_URL.replace(/^https?:\/\//, "")}
            </a>
            . Agency ({AGENCY_PRICE}) adds every sub-account and white-label:{" "}
            <a href={AGENCY_URL} rel="noreferrer">
              {AGENCY_URL.replace(/^https?:\/\//, "")}
            </a>
          </p>
        ) : (
          <table className="price-table" style={{ marginTop: 28 }}>
            <thead>
              <tr>
                <th>Video model</th>
                <th>Best for</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {VIDEO_MODELS.map((m) => (
                <tr key={m.id}>
                  <td>{m.label}</td>
                  <td>{m.bestFor}</td>
                  <td className="price">{m.priceNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="caption" style={{ marginTop: 12, fontSize: 13, color: "var(--muted)" }}>
          Prices are estimates billed by Kie.ai to your own wallet (1 credit =
          $0.005). Every result reports its real cost.
        </p>
      </section>

      <section className="section">
        <div className="card">
          <h3>Already deployed?</h3>
          <p style={{ fontSize: 15 }}>
            Your private dashboard is at{" "}
            <code>/s/&lt;your-secret&gt;</code> — the <code>MCP_SECRET</code>{" "}
            you set when deploying. Bookmark it. It is never linked from this
            page.
          </p>
        </div>
      </section>

      <footer className="footer">
        <span>
          {brand} Link · powered by Kie.ai · runs on your Vercel
        </span>
        <span style={{ display: "flex", gap: 16 }}>
          <a href="https://kie.ai" rel="noreferrer">
            Get a Kie.ai key
          </a>
          <a href="/terms.html">Terms</a>
          <a href="/privacy.html">Privacy</a>
        </span>
      </footer>
    </div>
  );
}

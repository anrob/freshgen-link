import { KIE_MODELS } from "@/lib/kie";
import { VIDEO_MODELS } from "@/lib/kie-video";

const brand = process.env.BRAND_NAME || "FreshGen";

export default function Landing() {
  return (
    <div className="container">
      <header className="masthead">
        <div className="wordmark">
          {brand} <em>Link</em>
        </div>
        <div className="masthead-note">AI media server for GoHighLevel</div>
      </header>

      <section className="section hero">
        <div className="kicker">Self-hosted · Your API key · MCP</div>
        <h1>AI images and video, inside your GoHighLevel.</h1>
        <p className="sub">
          Your own server. Your own Kie.ai key. Pennies per image, a quarter per
          video clip — no per-seat subscription, no middleman markup.
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
            <h3>Works everywhere in GHL</h3>
            <p>
              Ask AI, Workflow AI Agents, Agent Studio Superagents — anywhere
              GoHighLevel accepts an MCP connector.
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
            {KIE_MODELS.map((m) => (
              <tr key={m.id}>
                <td>{m.label}</td>
                <td>{m.bestFor}</td>
                <td className="price">{m.priceNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <span>
          <a href="https://kie.ai" rel="noreferrer">
            Get a Kie.ai key
          </a>
        </span>
      </footer>
    </div>
  );
}

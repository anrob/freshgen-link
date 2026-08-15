import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { pathAuthorized } from "@/lib/auth";
import { kieGetCredits, USD_PER_CREDIT } from "@/lib/kie";
import CopyField from "@/components/CopyField";
import RefreshButton from "@/components/RefreshButton";
import TestImageButton from "@/components/TestImageButton";
import { ghlEnabled } from "@/lib/ghl";
import { licenseStatus } from "@/lib/license";

export const dynamic = "force-dynamic";

const brand = process.env.BRAND_NAME || "FreshGen";

function CheckRow({
  ok,
  optional,
  label,
  fix,
}: {
  ok: boolean;
  optional?: boolean;
  label: React.ReactNode;
  fix?: string;
}) {
  return (
    <div className="check-row">
      <span className={`dot ${ok ? "ok" : optional ? "off" : "bad"}`} />
      <div>
        <div>{label}</div>
        {!ok && fix && <div className="fix">{fix}</div>}
      </div>
    </div>
  );
}

export default async function Dashboard({
  params,
}: {
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;
  if (!pathAuthorized(secret)) notFound();

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const mcpUrl = `${proto}://${host}/mcp/${secret}`;

  const license = await licenseStatus();

  let credits: number | null = null;
  let creditsError = "";
  if (process.env.KIE_API_KEY) {
    try {
      credits = await kieGetCredits();
    } catch (err) {
      creditsError = (err as Error).message;
    }
  }

  const envFix =
    "Vercel → your project → Settings → Environment Variables → add it → Deployments → Redeploy.";

  return (
    <div className="container">
      <header className="masthead">
        <div className="wordmark">
          {brand} <em>Control Room</em>
        </div>
        <div className="masthead-note">{host}</div>
      </header>

      {!license.ok && (
        <section className="section">
          <div className="card" style={{ borderColor: "#b42318" }}>
            <div className="kicker" style={{ color: "#b42318" }}>
              Not activated
            </div>
            <p style={{ margin: "8px 0 0" }}>
              Image and video generation is disabled on this deployment.
              {license.reason ? ` ${license.reason}` : ""}
            </p>
            <p className="caption" style={{ marginTop: 12 }}>
              Add your license key in Vercel → your project →{" "}
              <strong>Settings → Environment Variables</strong> →{" "}
              <code>LICENSE_KEY</code>, then <strong>redeploy</strong>. Your key
              was emailed to you on purchase.
            </p>
          </div>
        </section>
      )}

      <section className="section">
        <div className="kicker">Setup status</div>
        <div className="card">
          <CheckRow
            ok={license.ok}
            label={
              <>
                <code>LICENSE_KEY</code> —{" "}
                {license.ok
                  ? license.degraded
                    ? "active (could not reach Gumroad — running on trust)"
                    : "active"
                  : "not activated"}
              </>
            }
            fix={`Paste the license key from your purchase email. ${envFix}`}
          />
          <CheckRow
            ok={Boolean(process.env.KIE_API_KEY)}
            label={
              <>
                <code>KIE_API_KEY</code> — your Kie.ai key
              </>
            }
            fix={`Get a key at kie.ai/api-key, then: ${envFix}`}
          />
          <CheckRow
            ok={Boolean(process.env.MCP_SECRET)}
            label={
              <>
                <code>MCP_SECRET</code> — your private URL key
              </>
            }
            fix={envFix}
          />
          <CheckRow
            ok={Boolean(process.env.BRAND_NAME)}
            optional
            label={
              <>
                <code>BRAND_NAME</code> — white-label name{" "}
                {process.env.BRAND_NAME ? `(currently "${process.env.BRAND_NAME}")` : "(optional)"}
              </>
            }
          />
          <CheckRow
            ok={ghlEnabled()}
            optional
            label={
              <>
                Media Library tool — {ghlEnabled() ? "active" : "inactive (optional)"}
              </>
            }
            fix={`Set GHL_PIT and GHL_LOCATION_ID to enable save_to_media_library. ${envFix}`}
          />
        </div>
      </section>

      <section className="section">
        <div className="kicker">Your MCP URL</div>
        <div className="card">
          <CopyField value={mcpUrl} />
          <p className="caption">
            Transport: HTTP (Streamable) · Auth: None — the link itself is the
            key. Treat it like a password.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="kicker">Kie.ai balance</div>
        <div className="card">
          {credits != null ? (
            <>
              <div className="stat">${(credits * USD_PER_CREDIT).toFixed(2)}</div>
              <div className="stat-sub">
                {credits.toLocaleString()} credits · 1 credit = $0.005
              </div>
            </>
          ) : (
            <p className="error-text">
              {process.env.KIE_API_KEY
                ? `Key rejected by Kie — check KIE_API_KEY. (${creditsError.slice(0, 120)})`
                : "Set KIE_API_KEY to see your balance."}
            </p>
          )}
          <p style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <RefreshButton />
            <a className="btn ghost" href="https://kie.ai" target="_blank" rel="noreferrer">
              Top up at kie.ai
            </a>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="kicker">Prove it works</div>
        <div className="card">
          <TestImageButton />
        </div>
      </section>

      <section className="section">
        <div className="kicker">Connect to GoHighLevel</div>

        <details open>
          <summary>
            Ask AI <span className="pill">Fastest</span>
          </summary>
          <div className="details-body">
            <ol>
              <li>Copy your URL above.</li>
              <li>
                In GHL, open <strong>Ask AI</strong> → <strong>Connectors</strong>{" "}
                (plus icon → Manage Connectors).
              </li>
              <li>
                Click <strong>+ Add custom MCP</strong>.
              </li>
              <li>
                Name: <strong>{brand}</strong> · MCP server URL: paste your URL.
              </li>
              <li>
                Click <strong>Add MCP</strong>. Leave Advanced alone. Done — ask
                it for an image.
              </li>
            </ol>
          </div>
        </details>

        <details>
          <summary>Workflow AI Agent</summary>
          <div className="details-body">
            <ol>
              <li>
                Open a Workflow → add an <strong>AI Agent</strong> action.
              </li>
              <li>
                <strong>Add Tools</strong> → <strong>MCP</strong> tab →{" "}
                <strong>Add Connection</strong>.
              </li>
              <li>
                Connection name: <strong>{brand}</strong> · Server URL: paste
                your URL.
              </li>
              <li>
                Transport: <strong>HTTP Streamable</strong> · Authentication:{" "}
                <strong>None</strong>.
              </li>
              <li>
                <strong>Test Connection</strong> → tick every tool → Save.
              </li>
            </ol>
          </div>
        </details>

        <details>
          <summary>Agent Studio Superagent → Ask AI</summary>
          <div className="details-body">
            <ol>
              <li>
                Agent Studio → your Superagent → <strong>+ Add app</strong> →{" "}
                <strong>+ Add custom MCP</strong>.
              </li>
              <li>
                Server name: <strong>{brand}</strong> · Server URL: paste your
                URL → <strong>Add MCP</strong>.
              </li>
              <li>Enable the tools, then publish the agent to Production.</li>
              <li>
                Optional: <strong>Settings → Ask AI → Agent Mapping</strong> to
                surface it inside Ask AI.
              </li>
            </ol>
            <div className="note">
              Agent Mapping into Ask AI requires GHL&apos;s $97/mo Unlimited AI
              Employee plan.
            </div>
          </div>
        </details>
      </section>

      <footer className="footer">
        <span>{brand} Link v1.0.0</span>
        <span>
          <a href="https://github.com/anrob/freshgen-link" rel="noreferrer">
            Docs
          </a>
        </span>
      </footer>
    </div>
  );
}

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { pathAuthorized } from "@/lib/auth";
import { kieGetCredits, USD_PER_CREDIT } from "@/lib/kie";
import CopyField from "@/components/CopyField";
import RefreshButton from "@/components/RefreshButton";
import TestImageButton from "@/components/TestImageButton";
import {
  BRAND,
  TIER_FEATURES,
  UPGRADE_PRICE,
  UPGRADE_URL,
  licenseStatus,
} from "@/lib/license";

export const dynamic = "force-dynamic";

const REPO = "https://github.com/anrob/freshgen-link";
const LITE_SKILL_URL = `${REPO}/blob/main/docs/ask-ai-skill/lite/gpt-image-2/SKILL.md`;

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
  const tier = license.tier;
  const f = TIER_FEATURES[tier];
  const brand = BRAND;
  // The upgrade card only makes sense on an activated deployment — an
  // unlicensed one reads as the most permissive tier and just needs its key.
  const lite = license.ok && tier === "lite";

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
          {license.ok && (
            <span className="pill" style={{ marginLeft: 12, verticalAlign: "middle" }}>
              {f.label}
            </span>
          )}
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
                  ? `${f.label} license ${
                      license.degraded
                        ? "(could not reach Gumroad — running on trust)"
                        : "active"
                    }`
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
            ok={Boolean(process.env.GHL_PIT)}
            optional
            label={
              <>
                Media Library auto-save —{" "}
                {process.env.GHL_PIT
                  ? process.env.GHL_LOCATION_ID
                    ? "active"
                    : "GHL_PIT set but no GHL_LOCATION_ID — set one to save"
                  : "inactive (optional)"}
              </>
            }
            fix={`Set GHL_PIT and GHL_LOCATION_ID. ${envFix}`}
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

      {lite && (
        <section className="section">
          <div className="kicker">Upgrade</div>
          <div className="card">
            <p>
              You&apos;re running <strong>Lite</strong>: images on GPT Image 2,
              one location.
            </p>
            <div style={{ marginTop: 14 }}>
              <h3>Full — {UPGRADE_PRICE}</h3>
              <p>
                <strong>Video</strong> (Kling 2.1/2.6/3.0, Seedance 2, Wan 2.6,
                Grok Imagine — from about $0.13 a clip) plus{" "}
                <strong>five more image models</strong> (Nano Banana Pro, Nano
                Banana, Nano Banana 2, Seedream 4, Imagen 4) and all 23 Ask AI
                skills.
              </p>
              <p style={{ marginTop: 10 }}>
                <a className="btn" href={UPGRADE_URL} target="_blank" rel="noreferrer">
                  Get Full — {UPGRADE_PRICE}
                </a>
              </p>
            </div>
            <p className="caption" style={{ marginTop: 14 }}>
              After buying: paste the new key into <code>LICENSE_KEY</code> in
              Vercel and redeploy. The extra tools show up in GHL by themselves —
              no reconnecting.
            </p>
          </div>
        </section>
      )}

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
      </section>

      <section className="section">
        <div className="kicker">Ask AI skill (optional, recommended)</div>
        <div className="card">
          {lite ? (
            <>
              <p>
                One skill file that teaches Ask AI how to use GPT Image 2 well —
                adds the <code>/gpt-image-2</code> slash command with{" "}
                <code>--ar</code>, <code>--res</code> and <code>--ref</code> flags,
                and prompt rules written for this model.
              </p>
              <ol style={{ margin: "12px 0 0 18px", lineHeight: 1.7 }}>
                <li>Open the skill file below and download it (the Raw button).</li>
                <li>
                  In GHL: <strong>Ask AI</strong> → <strong>Skills</strong> →
                  upload it. If GHL renames it, open <strong>Manage Skills</strong>{" "}
                  and rename it <code>gpt-image-2</code>.
                </li>
                <li>
                  Type <code>/gpt-image-2 a hero image for a roofing page --ar 16:9</code>.
                </li>
              </ol>
              <p style={{ marginTop: 16 }}>
                <a className="btn" href={LITE_SKILL_URL} target="_blank" rel="noreferrer">
                  Get the gpt-image-2 skill
                </a>
              </p>
            </>
          ) : (
            <>
              <p>
                Skill files that teach Ask AI when and how to use these tools —
                and add slash commands like <code>/image</code>, <code>/adset</code>{" "}
                and <code>/video</code>, plus one skill per model (<code>/gpt-image-2</code>,{" "}
                <code>/nano-banana-pro</code>, <code>/kling-3-0</code>…).
              </p>
              <p style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a className="btn" href="/ask-ai-skill.html">
                  Read the guide
                </a>
                <a
                  className="btn ghost"
                  href={`${REPO}/tree/main/docs/ask-ai-skill`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get the skill files
                </a>
              </p>
            </>
          )}
        </div>
      </section>

      <footer className="footer">
        <span>
          {brand} Link v1.2.0{license.ok ? ` · ${f.label}` : ""}
        </span>
        <span style={{ display: "flex", gap: 16 }}>
          {!lite && <a href="/ask-ai-skill.html">Skill guide</a>}
          <a href="/terms.html">Terms</a>
          <a href="/privacy.html">Privacy</a>
          {process.env.GUMROAD_ACCESS_TOKEN && (
            <a href={`/s/${secret}/sales`}>Sales</a>
          )}
          <a href={REPO} rel="noreferrer">
            Docs
          </a>
        </span>
      </footer>
    </div>
  );
}

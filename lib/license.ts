// License activation via Gumroad.
//
// Every buyer gets a unique key at checkout and pastes it into LICENSE_KEY at
// deploy time. On a cold start we verify it against Gumroad and cache the
// verdict in module memory for RECHECK_MS (Vercel keeps warm instances around,
// so in practice this is one ~200ms call every few hours).
//
// Gumroad's verify endpoint needs NO API token — it is keyed on product id +
// license key alone. That is deliberate on their side and useful here: the
// buyer's deployment talks to Gumroad directly and carries no credential of
// ours.
//
// FAIL-OPEN POLICY: if Gumroad is unreachable we keep serving. A paying agency
// losing image generation because Gumroad had an outage is a far worse outcome
// than an unlicensed deployment working during a rare window. Piracy here is
// bounded by the buyer's own Kie.ai wallet — they pay for their own usage
// either way; the license is what pays for the packaging and support.

const GUMROAD_PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID || "J7GddYMuxwoHag0VPEHI7g==";
const VERIFY_URL = "https://api.gumroad.com/v2/licenses/verify";
const RECHECK_MS = 6 * 60 * 60 * 1000; // 6 hours
const TIMEOUT_MS = 6_000;

export type LicenseState = {
  ok: boolean;
  /** Short reason shown to the buyer when ok is false. */
  reason?: string;
  /** True when we allowed the request through despite not reaching Gumroad. */
  degraded?: boolean;
  checkedAt: number;
};

let cached: LicenseState | null = null;

// NOTE: deliberately NO env-var bypass (e.g. LICENSE_REQUIRED=false). This
// source is public — a one-setting kill switch would be trivially discoverable
// and shareable, which is a far lower bar than forking and editing the code.
// Every deployment, including the author's own, runs a real license key.

export async function licenseStatus(): Promise<LicenseState> {
  const key = process.env.LICENSE_KEY?.trim();
  if (!key) {
    return {
      ok: false,
      reason: "No LICENSE_KEY is set on this deployment.",
      checkedAt: Date.now(),
    };
  }

  if (cached && Date.now() - cached.checkedAt < RECHECK_MS) return cached;

  try {
    const body = new URLSearchParams({
      product_id: GUMROAD_PRODUCT_ID,
      license_key: key,
      // Leave the uses counter meaningful: cold starts would otherwise inflate
      // it into noise, destroying its value as a key-sharing signal.
      increment_uses_count: "false",
    });
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = (await res.json()) as {
      success?: boolean;
      message?: string;
      purchase?: Record<string, unknown>;
    };

    if (!json?.success) {
      cached = {
        ok: false,
        reason: json?.message || "This license key was not recognised.",
        checkedAt: Date.now(),
      };
      return cached;
    }

    // A valid key can still belong to a purchase that was reversed.
    const p = json.purchase ?? {};
    const dead =
      p.refunded === true ||
      p.chargebacked === true ||
      p.disputed === true ||
      Boolean(p.subscription_cancelled_at) ||
      Boolean(p.subscription_failed_at);
    cached = dead
      ? {
          ok: false,
          reason: "This license is no longer active (refunded or cancelled).",
          checkedAt: Date.now(),
        }
      : { ok: true, checkedAt: Date.now() };
    return cached;
  } catch (err) {
    // Could not reach Gumroad — fail open (see policy note above).
    console.log(`[license] verify unreachable, failing open: ${(err as Error).message}`);
    const state: LicenseState = {
      ok: true,
      degraded: true,
      checkedAt: Date.now() - (RECHECK_MS - 5 * 60 * 1000), // retry in ~5 min
    };
    cached = state;
    return state;
  }
}

/** Message returned by every gated tool when the deployment isn't activated. */
export function notActivatedMessage(reason?: string): string {
  return [
    `This ${process.env.BRAND_NAME || "FreshGen"} deployment is not activated.`,
    reason ? `Reason: ${reason}` : "",
    "",
    "The owner needs to set a valid LICENSE_KEY in their Vercel project:",
    "Settings → Environment Variables → LICENSE_KEY → then redeploy.",
    "",
    "Do NOT retry this tool — it will keep failing until the key is set. Tell the user the server needs activating.",
  ]
    .filter(Boolean)
    .join("\n");
}

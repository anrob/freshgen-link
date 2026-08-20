// License activation via Gumroad — and the tier that comes with it.
//
// Every buyer gets a unique key at checkout and pastes it into LICENSE_KEY at
// deploy time. On a cold start we verify it against Gumroad and cache the
// verdict in module memory for RECHECK_MS (Vercel keeps warm instances around,
// so in practice this is one ~200ms call every few hours).
//
// TWO PRODUCTS, ONE REPO. The same deploy button serves both of them:
//   - a key from the free product     → tier "lite"   (generate_image on GPT
//     Image 2 only, no video)
//   - a key from the $17 product      → tier "full"   (every model + video)
// A key is verified against each product in turn; the first that recognises
// it decides the tier. Upgrading is therefore just "paste the new key,
// redeploy" — no code or config change.
//
// Gumroad's verify endpoint needs NO API token — it is keyed on product id +
// license key alone. That is deliberate on their side and useful here: the
// buyer's deployment talks to Gumroad directly and carries no credential of
// ours.
//
// FAIL-OPEN POLICY: if Gumroad is unreachable we keep serving. A paying
// customer losing image generation because Gumroad had an outage is a far
// worse outcome than an unlicensed deployment working during a rare window.
// Piracy here is bounded by the buyer's own Kie.ai wallet — they pay for
// their own usage either way; the license is what pays for the packaging and
// support.

export const GUMROAD_PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID || "J7GddYMuxwoHag0VPEHI7g==";
export const GUMROAD_LITE_PRODUCT_ID =
  process.env.GUMROAD_LITE_PRODUCT_ID || "qFp7GEt7epSSVWVnIWGDVA==";
/** Where a Lite deployment sends people to unlock Full. */
export const UPGRADE_URL = "https://iamjustfresh.gumroad.com/l/freshgen-link";
export const UPGRADE_PRICE = "$17 one-time";

/** The product's display name, everywhere it shows one. */
export const BRAND = "FreshGen";

const VERIFY_URL = "https://api.gumroad.com/v2/licenses/verify";
const RECHECK_MS = 6 * 60 * 60 * 1000; // 6 hours
const TIMEOUT_MS = 6_000;

export type Tier = "lite" | "full";

// Order matters for fail-open + unlicensed defaults: the most permissive tier
// is what we assume when we can't know — a paying customer must never be
// silently downgraded by a Gumroad outage (see policy note above).
export const MOST_PERMISSIVE_TIER: Tier = "full";

export type LicenseState = {
  ok: boolean;
  /** Which product the key belongs to. Only meaningful when ok is true. */
  tier: Tier;
  /** Short reason shown to the buyer when ok is false. */
  reason?: string;
  /** True when we allowed the request through despite not reaching Gumroad. */
  degraded?: boolean;
  checkedAt: number;
};

// Ordered: the first product that recognises the key wins.
const PRODUCTS: { id: string; tier: Tier }[] = [
  { id: GUMROAD_PRODUCT_ID, tier: "full" },
  { id: GUMROAD_LITE_PRODUCT_ID, tier: "lite" },
];

export function productIdForTier(tier: Tier): string {
  return PRODUCTS.find((p) => p.tier === tier)?.id ?? GUMROAD_PRODUCT_ID;
}

/** Feature switches per tier — the single place the ladder is defined. */
export const TIER_FEATURES: Record<Tier, { video: boolean; allImageModels: boolean; allSkills: boolean; label: string }> = {
  lite: { video: false, allImageModels: false, allSkills: false, label: "Lite" },
  full: { video: true,  allImageModels: true,  allSkills: true,  label: "Full" },
};

let cached: LicenseState | null = null;

// NOTE: deliberately NO env-var bypass (e.g. LICENSE_REQUIRED=false). This
// source is public — a one-setting kill switch would be trivially discoverable
// and shareable, which is a far lower bar than forking and editing the code.
// Every deployment, including the author's own, runs a real license key.

type VerifyJson = {
  success?: boolean;
  message?: string;
  purchase?: Record<string, unknown>;
};

async function verifyAgainst(productId: string, key: string): Promise<VerifyJson> {
  const body = new URLSearchParams({
    product_id: productId,
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
  return (await res.json()) as VerifyJson;
}

export async function licenseStatus(): Promise<LicenseState> {
  const key = process.env.LICENSE_KEY?.trim();
  if (!key) {
    return {
      ok: false,
      tier: MOST_PERMISSIVE_TIER,
      reason: "No LICENSE_KEY is set on this deployment.",
      checkedAt: Date.now(),
    };
  }

  if (cached && Date.now() - cached.checkedAt < RECHECK_MS) return cached;

  try {
    let lastMessage: string | undefined;
    for (const product of PRODUCTS) {
      const json = await verifyAgainst(product.id, key);
      if (!json?.success) {
        // "That license does not exist for the provided product." → try the
        // next product. Any other message is still just "not this one".
        lastMessage = json?.message;
        continue;
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
            tier: product.tier,
            reason: "This license is no longer active (refunded or cancelled).",
            checkedAt: Date.now(),
          }
        : { ok: true, tier: product.tier, checkedAt: Date.now() };
      return cached;
    }

    cached = {
      ok: false,
      tier: MOST_PERMISSIVE_TIER,
      reason: lastMessage || "This license key was not recognised.",
      checkedAt: Date.now(),
    };
    return cached;
  } catch (err) {
    // Could not reach Gumroad — fail open (see policy note above). Keep the
    // last known tier if we have one; a paying customer must never be silently
    // downgraded by an outage.
    console.log(`[license] verify unreachable, failing open: ${(err as Error).message}`);
    const state: LicenseState = {
      ok: true,
      tier: cached?.tier ?? MOST_PERMISSIVE_TIER,
      degraded: true,
      checkedAt: Date.now() - (RECHECK_MS - 5 * 60 * 1000), // retry in ~5 min
    };
    cached = state;
    return state;
  }
}

/** The tier this deployment runs at. Unlicensed deployments read as the most
 *  permissive tier so the tool list (gated at call time anyway) shows what
 *  activation unlocks. */
export async function currentTier(): Promise<Tier> {
  return (await licenseStatus()).tier;
}

/** Message returned by every gated tool when the deployment isn't activated. */
export function notActivatedMessage(reason?: string): string {
  return [
    `This ${BRAND} deployment is not activated.`,
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

/** One-liner appended to Lite tool output where an upsell is natural. */
export function upgradeNote(): string {
  return `This is FreshGen Link Lite (GPT Image 2 only). Full (${UPGRADE_PRICE}) adds video and five more image models: ${UPGRADE_URL}`;
}

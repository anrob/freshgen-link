// Gumroad SELLER API — powers the private /s/<secret>/sales dashboard only.
//
// Distinct from lib/license.ts, which calls the PUBLIC /licenses/verify
// endpoint (no token, callable by any buyer's deployment). Everything in this
// file needs GUMROAD_ACCESS_TOKEN, a credential only the seller (Fresh) sets
// on his own Vercel project — buyers never have it, so gumroadSellerEnabled()
// is what keeps the sales page inert on every buyer's copy of this repo.
//
// Gumroad's field names/shapes drift between products and API versions, so
// every read is defensive: optional chaining, coerced types, never throw on
// a missing field. See normalizeSale().

import { productIdForTier, type Tier } from "@/lib/license";

const GUMROAD_BASE = "https://api.gumroad.com/v2";
const TIMEOUT_MS = 8_000;
const MAX_PAGES = 20; // hard stop against a runaway page_key loop

export function gumroadSellerEnabled(): boolean {
  return Boolean(process.env.GUMROAD_ACCESS_TOKEN);
}

export type Sale = {
  id: string;
  /** Which product the sale belongs to — Full (paid) or Lite (free sign-up). */
  tier: Tier;
  email: string;
  createdAt: string;
  priceCents: number;
  priceDisplay: string;
  licenseKey: string;
  refunded: boolean;
  chargebacked: boolean;
  disputed: boolean;
};

/** Thrown by listSales() so the page can tell a bad token (401) from any other failure. */
export class GumroadError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GumroadError";
    this.status = status;
  }
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// raw is a single element of Gumroad's `sales` array — typed unknown because
// we don't trust its shape. Every field degrades to a safe placeholder
// instead of throwing.
function normalizeSale(raw: unknown, tier: Tier): Sale {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const priceCents = Number(r.price);
  const cents = Number.isFinite(priceCents) ? priceCents : 0;
  return {
    id: String(r.id ?? ""),
    tier,
    email: String(r.email ?? ""),
    createdAt: String(r.created_at ?? ""),
    priceCents: cents,
    priceDisplay: r.formatted_display_price ? String(r.formatted_display_price) : formatCents(cents),
    licenseKey: String(r.license_key ?? ""),
    refunded: Boolean(r.refunded),
    chargebacked: Boolean(r.chargebacked),
    disputed: Boolean(r.disputed),
  };
}

/** Sales of one tier's product. */
export async function listSales(tier: Tier = "full"): Promise<Sale[]> {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) throw new GumroadError(0, "GUMROAD_ACCESS_TOKEN is not set on this deployment.");

  const sales: Sale[] = [];
  let pageKey: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const query = new URLSearchParams({ access_token: token, product_id: productIdForTier(tier) });
    if (pageKey) query.set("page_key", pageKey);

    let res: Response;
    try {
      res = await fetch(`${GUMROAD_BASE}/sales?${query.toString()}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      throw new GumroadError(0, `Could not reach Gumroad: ${(err as Error).message}`);
    }

    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
      sales?: unknown;
      next_page_key?: string;
    };

    if (!res.ok || !json?.success) {
      throw new GumroadError(res.status, json?.message || `Gumroad sales request failed (HTTP ${res.status}).`);
    }

    const rawSales = Array.isArray(json.sales) ? json.sales : [];
    for (const raw of rawSales) sales.push(normalizeSale(raw, tier));

    pageKey = json.next_page_key ? String(json.next_page_key) : undefined;
    if (!pageKey) break;
  }

  return sales;
}

/** Full sales and Lite sign-ups, fetched in parallel and merged. */
export async function listAllSales(): Promise<Sale[]> {
  const [full, lite] = await Promise.all([listSales("full"), listSales("lite")]);
  return [...full, ...lite];
}

export type LicenseActionResult = { ok: boolean; message?: string };

async function setLicenseEnabled(licenseKey: string, enabled: boolean, tier: Tier): Promise<LicenseActionResult> {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) return { ok: false, message: "GUMROAD_ACCESS_TOKEN is not set on this deployment." };

  try {
    const body = new URLSearchParams({
      access_token: token,
      product_id: productIdForTier(tier),
      license_key: licenseKey,
    });
    const res = await fetch(`${GUMROAD_BASE}/licenses/${enabled ? "enable" : "disable"}`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
    if (!res.ok || json?.success === false) {
      return { ok: false, message: json?.message || `Gumroad rejected the request (HTTP ${res.status}).` };
    }
    return { ok: true, message: json?.message };
  } catch (err) {
    // Network/timeout — surface what went wrong, never the token or the key.
    return { ok: false, message: `Could not reach Gumroad: ${(err as Error).message}` };
  }
}

export function disableLicense(licenseKey: string, tier: Tier = "full"): Promise<LicenseActionResult> {
  return setLicenseEnabled(licenseKey, false, tier);
}

export function enableLicense(licenseKey: string, tier: Tier = "full"): Promise<LicenseActionResult> {
  return setLicenseEnabled(licenseKey, true, tier);
}

export type VerifyResult = {
  ok: boolean;
  message?: string;
  refunded?: boolean;
  chargebacked?: boolean;
  disabled?: boolean;
};

// Same public endpoint lib/license.ts uses (no token needed) — called here on
// the seller's behalf to check a buyer's current key status for the table.
export async function verifyLicense(licenseKey: string, tier: Tier = "full"): Promise<VerifyResult> {
  try {
    const body = new URLSearchParams({
      product_id: productIdForTier(tier),
      license_key: licenseKey,
      increment_uses_count: "false",
    });
    const res = await fetch(`${GUMROAD_BASE}/licenses/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
      purchase?: Record<string, unknown>;
    };
    const ok = Boolean(json?.success);
    const message = json?.message ? String(json.message) : undefined;
    const purchase = json?.purchase ?? {};
    return {
      ok,
      message,
      refunded: Boolean(purchase.refunded),
      chargebacked: Boolean(purchase.chargebacked),
      disabled: !ok && /disabled/i.test(message ?? ""),
    };
  } catch (err) {
    return { ok: false, message: `Could not reach Gumroad: ${(err as Error).message}` };
  }
}

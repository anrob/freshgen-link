"use server";

// Server Actions for the seller-only sales dashboard. The page that renders
// these forms is already gated by pathAuthorized + gumroadSellerEnabled, but
// a Server Action is a public endpoint in its own right (it can be POSTed to
// directly, bypassing the page) — so every action re-checks both, plus the
// license key shape, before touching Gumroad. Never trust the client.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pathAuthorized } from "@/lib/auth";
import {
  disableLicense,
  enableLicense,
  gumroadSellerEnabled,
  type LicenseActionResult,
} from "@/lib/gumroad";
import type { Tier } from "@/lib/license";

const LICENSE_KEY_RE = /^[A-Z0-9-]{20,60}$/i;

async function run(
  formData: FormData,
  action: (key: string, tier: Tier) => Promise<LicenseActionResult>,
  verb: "disable" | "enable"
) {
  const secret = String(formData.get("secret") ?? "");
  const licenseKey = String(formData.get("licenseKey") ?? "");
  // Which Gumroad product the key belongs to. Anything but "lite" is Full —
  // an unexpected value can't reach a third product, only the paid one.
  const tier: Tier = formData.get("tier") === "lite" ? "lite" : "full";
  const path = `/s/${encodeURIComponent(secret)}/sales`;

  if (!pathAuthorized(secret) || !gumroadSellerEnabled()) {
    redirect(`${path}?ok=0&msg=${encodeURIComponent("Not authorized.")}`);
  }
  if (!LICENSE_KEY_RE.test(licenseKey)) {
    redirect(`${path}?ok=0&msg=${encodeURIComponent("Malformed license key.")}`);
  }

  const result = await action(licenseKey, tier);
  if (!result.ok) {
    redirect(`${path}?ok=0&msg=${encodeURIComponent(result.message || `Could not ${verb} that key.`)}`);
  }

  revalidatePath(path, "page");
  redirect(`${path}?ok=1&msg=${encodeURIComponent(`License ${verb}d.`)}`);
}

export async function disableLicenseAction(formData: FormData) {
  await run(formData, disableLicense, "disable");
}

export async function enableLicenseAction(formData: FormData) {
  await run(formData, enableLicense, "enable");
}

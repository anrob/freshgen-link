// Builds the completion-webhook URL handed to Kie on task creation. Only
// meaningful when GHL auto-save is possible for this request (PIT set, and
// either an explicit per-request location or the env default) — without that
// there is nothing useful to do on completion, so tasks are created with no
// callback and behavior is unchanged.

import { callbackToken } from "./auth";
import { ghlEnabled } from "./ghl";

export function kieCallbackUrl(locationId?: string): string | undefined {
  if (!ghlEnabled(locationId)) return undefined;
  const token = callbackToken();
  // PUBLIC_URL overrides for custom domains / local tunnels; otherwise Vercel's
  // system env gives the production hostname (bare, no protocol).
  const host =
    process.env.PUBLIC_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);
  if (!token || !host) return undefined;
  const base = `${host}/api/kie-callback/${token}`;
  // Only stamp ?loc= when a path location was actually in play — falling
  // back to the env default needs no hint, the callback route falls back to
  // the same env var itself when the query param is absent.
  return locationId ? `${base}?loc=${encodeURIComponent(locationId)}` : base;
}

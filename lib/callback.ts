// Builds the completion-webhook URL handed to Kie on task creation. Only
// meaningful when GHL auto-save is possible (PIT + location configured) —
// without that there is nothing useful to do on completion, so tasks are
// created with no callback and behavior is unchanged.

import { callbackToken } from "./auth";
import { ghlEnabled } from "./ghl";

export function kieCallbackUrl(): string | undefined {
  if (!ghlEnabled()) return undefined;
  const token = callbackToken();
  // PUBLIC_URL overrides for custom domains / local tunnels; otherwise Vercel's
  // system env gives the production hostname (bare, no protocol).
  const host =
    process.env.PUBLIC_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);
  if (!token || !host) return undefined;
  return `${host}/api/kie-callback/${token}`;
}

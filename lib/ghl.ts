// GoHighLevel Media Library upload. Enabled when GHL_PIT (Private
// Integration Token) is set AND a location is resolvable — either the
// env-configured default (GHL_LOCATION_ID) or a per-request one passed down
// from a /mcp/<secret>/<locationId> URL (see lib/mcp-context.ts). One
// deployment can therefore save into many different sub-accounts' Media
// Libraries, as long as GHL_PIT has access to all of them (agency-level PIT).
//
// Always downloads the bytes and multipart-uploads them so GHL stores a REAL
// copy. (GHL's hosted:true mode only bookmarks the external URL — verified
// live — which would still die when the Kie URL expires in ~14 days.)

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const MAX_DOWNLOAD_BYTES = 20_000_000;

export function ghlEnabled(locationId?: string): boolean {
  return Boolean(process.env.GHL_PIT && (locationId ?? process.env.GHL_LOCATION_ID));
}

type GhlUpload = { fileId?: string; ghlUrl?: string; raw: unknown };

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.GHL_PIT}`,
    Version: GHL_VERSION,
    Accept: "application/json",
  };
}

async function parseUpload(res: Response): Promise<GhlUpload> {
  const json = await res.json().catch(() => ({}));
  const data = (json as Record<string, unknown>) ?? {};
  const fileId = (data.fileId ?? data._id ?? data.id) as string | undefined;
  const ghlUrl = (data.url ?? data.fileUrl) as string | undefined;
  return { fileId, ghlUrl, raw: json };
}

export async function ghlSaveMedia(
  url: string,
  name?: string,
  locationId?: string
): Promise<GhlUpload> {
  const resolvedLocationId = locationId ?? process.env.GHL_LOCATION_ID;
  if (!resolvedLocationId) {
    throw new Error(
      "No GHL location to save into — set GHL_LOCATION_ID, or use a /mcp/<secret>/<locationId> URL."
    );
  }
  const fileName =
    name || `freshgen-${Date.now()}.${url.split("?")[0].split(".").pop() || "png"}`;

  const file = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!file.ok) {
    throw new Error(
      `The source URL could not be downloaded (${file.status}). The generated URL may have expired — regenerate and save again promptly.`
    );
  }
  const buf = await file.arrayBuffer();
  if (buf.byteLength > MAX_DOWNLOAD_BYTES) {
    throw new Error(
      `File too large to relay (${Math.round(buf.byteLength / 1e6)}MB, max 20MB). Download it manually.`
    );
  }
  const blob = new Blob([buf], {
    type: file.headers.get("content-type") || "application/octet-stream",
  });
  const form = new FormData();
  form.set("file", blob, fileName);
  form.set("name", fileName);
  form.set("altType", "location");
  form.set("altId", resolvedLocationId);

  const res = await fetch(`${GHL_BASE}/medias/upload-file`, {
    method: "POST",
    headers: headers(),
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL upload failed ${res.status}: ${text.slice(0, 300)}`);
  }
  return parseUpload(res);
}

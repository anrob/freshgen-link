"use client";

import { useMemo, useState } from "react";
import CopyField from "./CopyField";
import { LOCATION_ID_RE } from "@/lib/mcp-context";

export default function LocationUrlBuilder({
  baseUrl,
  secret,
}: {
  baseUrl: string;
  secret: string;
}) {
  const [locationId, setLocationId] = useState("");
  const [instant, setInstant] = useState(false);

  const trimmed = locationId.trim();
  const valid = trimmed.length === 0 || LOCATION_ID_RE.test(trimmed);

  const url = useMemo(() => {
    const path = LOCATION_ID_RE.test(trimmed) ? `/mcp/${secret}/${trimmed}` : `/mcp/${secret}`;
    return `${baseUrl}${path}${instant ? "?mode=instant" : ""}`;
  }, [baseUrl, secret, trimmed, instant]);

  return (
    <div>
      <label className="field-label" htmlFor="location-id-input">
        GHL Location ID
      </label>
      <input
        id="location-id-input"
        className="text-input"
        placeholder="e.g. ve9EPM4z8h8vShlRW1KT"
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
        spellCheck={false}
      />
      {!valid && (
        <p className="error-text" style={{ marginTop: 6 }}>
          Location IDs are 6–64 letters, numbers, underscores or hyphens.
        </p>
      )}
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={instant}
          onChange={(e) => setInstant(e.target.checked)}
        />
        Instant mode (use for Agent Studio Superagent)
      </label>
      <div style={{ marginTop: 14 }}>
        <CopyField value={url} />
        <p className="caption">
          {LOCATION_ID_RE.test(trimmed)
            ? "Saves into this Location ID's Media Library."
            : "No Location ID entered yet — this is your default URL."}
        </p>
      </div>
    </div>
  );
}

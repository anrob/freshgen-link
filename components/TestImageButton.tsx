"use client";

import { useState } from "react";

type Phase = "idle" | "confirm" | "running" | "done" | "error";

export default function TestImageButton() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{ url: string; costUsd?: number } | null>(null);
  const [error, setError] = useState("");

  async function run() {
    setPhase("running");
    setError("");
    try {
      const res = await fetch("./test", { method: "POST" });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
      setResult(json);
      setPhase("done");
    } catch (err) {
      setError((err as Error).message);
      setPhase("error");
    }
  }

  return (
    <div>
      {phase === "idle" && (
        <button className="btn" onClick={() => setPhase("confirm")}>
          Generate test image · ~$0.04
        </button>
      )}
      {phase === "confirm" && (
        <button className="btn danger-arm" onClick={run}>
          Confirm — this spends ~$0.04
        </button>
      )}
      {phase === "running" && (
        <button className="btn" disabled>
          Rendering… up to 60s
        </button>
      )}
      {(phase === "done" || phase === "error") && (
        <button className="btn ghost" onClick={() => setPhase("confirm")}>
          Run again
        </button>
      )}
      {phase === "error" && <p className="error-text" style={{ marginTop: 10 }}>{error}</p>}
      {phase === "done" && result && (
        <div className="test-result">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Test generation" />
          <p className="caption">
            Your server works{result.costUsd ? ` — real cost $${result.costUsd.toFixed(2)}` : ""}.
            GHL will get results just like this.
          </p>
        </div>
      )}
    </div>
  );
}

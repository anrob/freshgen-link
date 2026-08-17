"use client";

import { useState } from "react";

export default function CopyField({ value, multiline }: { value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className={`copy-field${multiline ? " multiline" : ""}`}>
      {multiline ? (
        <textarea
          readOnly
          value={value}
          rows={value.split("\n").length}
          onFocus={(e) => e.currentTarget.select()}
        />
      ) : (
        <input readOnly value={value} onFocus={(e) => e.currentTarget.select()} />
      )}
      <button
        className="btn"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

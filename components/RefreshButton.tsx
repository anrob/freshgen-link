"use client";

import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  return (
    <button className="btn ghost" onClick={() => router.refresh()}>
      Refresh
    </button>
  );
}

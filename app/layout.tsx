import type { Metadata } from "next";
import "./globals.css";
import { brandFor, currentTier } from "@/lib/license";

// No next/font/google here on purpose. It downloads the font at BUILD time,
// and a transient Google Fonts hiccup makes the whole Vercel build fail —
// seen live 2026-08-16 ("Failed to fetch `Fraunces` from Google Fonts"). For a
// product whose whole pitch is a one-click deploy that just works, a build
// with a network dependency is the wrong trade. Fonts load at RUNTIME via the
// <link> below instead — if that request ever fails, globals.css falls back
// to system faces and nothing else is affected.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,500..700,0..100&family=DM+Sans:opsz,wght@9..40,400..700&display=swap";

// Async because white-label (BRAND_NAME) is a Full feature — Lite
// deployments read "FreshGen" everywhere, including the tab title.
export async function generateMetadata(): Promise<Metadata> {
  const tier = await currentTier();
  const brand = brandFor(tier);
  return {
    title: `${brand} Link — AI images${tier === "lite" ? "" : " & video"} inside GoHighLevel`,
    description: `Self-hosted AI media server for GoHighLevel. Your own server, your own API key, pennies per image.`,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}

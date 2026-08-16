import type { Metadata } from "next";
import "./globals.css";

// No next/font/google here on purpose. It downloads the font at BUILD time,
// and a transient Google Fonts hiccup makes the whole Vercel build fail —
// seen live 2026-08-16 ("Failed to fetch `Fraunces` from Google Fonts"). For a
// product whose whole pitch is a one-click deploy that just works, a build
// with a network dependency is the wrong trade. --font-display is a system
// serif stack in globals.css instead (same one the Gumroad landing page uses).

const brand = process.env.BRAND_NAME || "FreshGen";

export const metadata: Metadata = {
  title: `${brand} Link — AI images & video inside GoHighLevel`,
  description: `Self-hosted AI media server for GoHighLevel. Your own server, your own API key, pennies per image.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

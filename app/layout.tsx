import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const brand = process.env.BRAND_NAME || "FreshGen";

export const metadata: Metadata = {
  title: `${brand} Link — AI images & video inside GoHighLevel`,
  description: `Self-hosted AI media server for GoHighLevel. Your own server, your own API key, pennies per image.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={fraunces.variable}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartPilot Watch — Don't just watch the market. Know what changed.",
  description:
    "SmartPilot Watch turns your watchlist into a market intelligence system—showing what meaningfully changed, why it matters, and what deserves your attention.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#050811] text-[#cbd5e1]">{children}</body>
    </html>
  );
}

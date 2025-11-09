import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import logger from "@/lib/logger";

/**
 * ============================================================
 * Signal-Lane — Root Application Layout (Updated with Sticky Footer)
 * ============================================================
 *
 * Ensures that the footer is always visible at the bottom of the viewport
 * without requiring scrolling, even when page content is short.
 */

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Signal-Lane — Real-Time Global Chat",
    template: "%s | Signal-Lane",
  },
  description:
    "Signal-Lane is a secure, real-time global chat platform built with Next.js, TypeScript, Socket.IO, and Prisma.",
  metadataBase: new URL("https://signal-lane.app"),
  openGraph: {
    title: "Signal-Lane — Real-Time Global Chat",
    description:
      "Chat instantly with anyone worldwide. Built with Next.js, Prisma, and Socket.IO.",
    url: "https://signal-lane.app",
    siteName: "Signal-Lane",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Signal-Lane Global Chat",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Signal-Lane — Real-Time Global Chat",
    description:
      "Signal-Lane lets you chat securely with anyone in real-time.",
    creator: "@SignalLane",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  themeColor: "#0f172a",
  colorScheme: "dark",
};

/**
 * Root layout with sticky footer and full viewport height.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (typeof logger?.debug === "function") {
    logger.debug("Rendering RootLayout");
  }

  return (
    <html lang="en" className="h-full bg-slate-900">
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-slate-900 text-slate-50 antialiased`}
      >
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Instant Fulfillment Intelligence · Instant Service Field Notes",
  description: "Regional intelligence for instant retail, last-mile logistics and on-demand delivery teams.",
  openGraph: {
    title: "Instant Fulfillment Intelligence · Instant Service Field Notes",
    description: "Regional intelligence for instant retail, last-mile logistics and on-demand delivery teams.",
    type: "website",
  images: [{ url: "/og.png", width: 1200, height: 630, alt: "Instant Fulfillment Intelligence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instant Fulfillment Intelligence · Instant Service Field Notes",
    description: "Regional intelligence for instant retail, last-mile logistics and on-demand delivery teams.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

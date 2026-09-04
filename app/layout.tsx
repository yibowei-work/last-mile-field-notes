import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "即时履约情报台 · Instant Service Field Notes",
  description: "面向即时零售、尾程物流与同城配送团队的区域情报工作台。",
  openGraph: {
    title: "即时履约情报台 · Instant Service Field Notes",
    description: "面向即时零售、尾程物流与同城配送团队的区域情报工作台。",
    type: "website",
  images: [{ url: "/og.png", width: 1200, height: 630, alt: "即时履约情报台" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "即时履约情报台 · Instant Service Field Notes",
    description: "面向即时零售、尾程物流与同城配送团队的区域情报工作台。",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}

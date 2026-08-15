import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "D4 Leaderboard",
  description: "Pangu D4 排行榜",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}

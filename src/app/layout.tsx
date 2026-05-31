import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RemoveBG - Free AI Background Remover | 一键智能抠图",
  description:
    "Free online AI background remover. Remove image backgrounds in seconds with AI. 100% private - all processing happens in your browser. No signup required. 免费在线AI智能抠图工具，无需上传服务器，浏览器本地处理保护隐私。",
  keywords: [
    "background remover",
    "remove background",
    "AI抠图",
    "智能抠图",
    "transparent background",
    "free background remover",
    "online image editor",
  ],
  openGraph: {
    title: "RemoveBG - Free AI Background Remover",
    description:
      "Remove image backgrounds in seconds with AI. 100% free, 100% private.",
    type: "website",
    url: "https://tyr1105.github.io/bg-remove/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

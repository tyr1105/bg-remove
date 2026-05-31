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
    "background removal tool",
    "photo editor",
    "image cutout",
    "remove bg",
    "erase background",
  ],
  authors: [{ name: "tyr1105" }],
  openGraph: {
    title: "RemoveBG - Free AI Background Remover",
    description:
      "Remove image backgrounds in seconds with AI. 100% free, 100% private. No upload needed.",
    type: "website",
    url: "https://tyr1105.github.io/bg-remove/",
    images: [
      {
        url: "https://tyr1105.github.io/bg-remove/og-image.png",
        width: 1200,
        height: 630,
        alt: "RemoveBG - Free AI Background Remover",
      },
    ],
    siteName: "RemoveBG",
  },
  twitter: {
    card: "summary_large_image",
    title: "RemoveBG - Free AI Background Remover",
    description:
      "Remove image backgrounds in seconds with AI. 100% free, 100% private.",
    images: ["https://tyr1105.github.io/bg-remove/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://tyr1105.github.io/bg-remove/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "RemoveBG - Free AI Background Remover",
    description:
      "Free online AI background remover. Remove image backgrounds in seconds. 100% private - all processing in browser. No signup required.",
    url: "https://tyr1105.github.io/bg-remove/",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "AI background removal",
      "Foreground removal",
      "Custom background colors",
      "Browser-side processing",
      "PNG download",
      "Drag and drop upload",
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

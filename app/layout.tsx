import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Bowling Simulator | مُحاكي البولينج الذكي",
  description: "World-class interactive 3D bowling simulator with physics engine, engineering analytics, and smart technology. محاكي البولينج ثلاثي الأبعاد مع تحليل هندسي متقدم.",
  keywords: ["bowling", "simulator", "3D", "physics", "engineering", "smart technology"],
  authors: [{ name: "Smart Bowling Team" }],
  openGraph: {
    title: "Smart Bowling Simulator",
    description: "Interactive 3D bowling simulation with real-time physics and engineering analytics",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

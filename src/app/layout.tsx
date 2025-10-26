import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RapidWorks - Your Idea, Live in 2 Weeks",
  description: "Get your MVP free of charge, only pay when you are amazed by the result. Expert coaching, rapid development, and funding guidance.",
  keywords: ["MVP development", "startup", "rapid prototyping", "business coaching", "funding"],
  openGraph: {
    title: "RapidWorks - Your Idea, Live in 2 Weeks",
    description: "Get your MVP free of charge, only pay when you are amazed by the result.",
    images: ["/opengraphimage.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/opengraphimage.png" />
        <link rel="apple-touch-icon" href="/opengraphimage.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

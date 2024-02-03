import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

let url = "https://ui.shadcn.com";
let ogImage = "https://ui.shadcn.com/og.jpg";
let name = "meow";
let description = "Your personal virtual wardrobe";

export const metadata: Metadata = {
  title: "Attires.ai",
  description: description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: url,
    title: name,
    description: description,
    siteName: name,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: name,
    description: description,
    images: [ogImage],
    creator: "@shadcn",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}

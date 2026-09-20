import type { Metadata } from "next";
import "./globals.css";
import { CustomerAuthProvider } from "@/context/customer-auth-context";

export const metadata: Metadata = {
  metadataBase: new URL("https://energymaxgroup.in"),
  title: {
    default: "EnergyMax Group | Global Wellness, Health & Sustainable Success",
    template: "%s | EnergyMax Group",
  },
  description: "EnergyMax Group is an international health and wellness enterprise empowering individuals through advanced probiotic science, gut health ecology, and financial prosperity.",
  keywords: [
    "EnergyMax",
    "EnergyMax Group",
    "Maxilin Probiotics",
    "Gut Health",
    "Global Wellness",
    "Direct Selling Ecosystem",
    "Microbial Ecology",
  ],
  authors: [{ name: "EnergyMax Group LLC" }],
  creator: "EnergyMax Group",
  publisher: "EnergyMax Group LLC",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://energymaxgroup.in",
    siteName: "EnergyMax Group",
    title: "EnergyMax Group | Empowering Global Wellness",
    description: "Discover advanced probiotic solutions and sustainable lifestyle partnership opportunities with EnergyMax Group.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EnergyMax Group Global Wellness",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EnergyMax Group | Global Wellness",
    description: "Empowering people to achieve personal health, happiness, and financial prosperity.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes when available (e.g., Google Search Console)
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand-ivory text-brand-charcoal antialiased selection:bg-brand-green selection:text-white">
        <CustomerAuthProvider>
        {children}
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getApiUrl } from "@/utils/getApiUrl";

export const metadata = {
  title: {
    default: "Sharee Mela | Online Shopping in Bangladesh",
    template: "%s | Sharee Mela",
  },
  description: "Discover exquisite traditional, Jamdani, Silk, and designer sarees at Sharee Mela.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sharee-mela.vercel.app"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import Providers from "@/components/Providers";
import MainLayout from "@/layouts/MainLayout";

export default function RootLayout({ children }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {apiUrl && (
          <>
            <link rel="preconnect" href={apiUrl} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={apiUrl} />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

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

export async function generateMetadata() {
  const defaultMetadata = {
    title: {
      default: "Sharee Mela | Online Shopping",
      template: "%s | Sharee Mela",
    },
    description: "Discover exquisite traditional, Jamdani, Silk, and designer sarees at Sharee Mela.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    alternates: {
      canonical: "/",
    },
  };

  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/settings`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: { Connection: "close" },
      signal: AbortSignal.timeout(15000),
    });
    
    if (res.ok) {
      const data = await res.json();
      const logoVersion = data?.logo ? `?v=${encodeURIComponent(data.logo.slice(-12))}` : "";
      defaultMetadata.icons = {
        icon: `${apiUrl}/settings/logo${logoVersion}`,
        shortcut: `${apiUrl}/settings/logo${logoVersion}`,
        apple: `${apiUrl}/settings/logo${logoVersion}`,
      };
      if (data?.siteName) {
        defaultMetadata.title = {
          default: `${data.siteName} | Online Shopping in Bangladesh`,
          template: `%s | ${data.siteName}`,
        };
      }
    }
  } catch (error) {
    console.warn("Could not fetch metadata settings: backend is offline or unreachable.");
  }

  return defaultMetadata;
}

import Providers from "@/components/Providers";
import MainLayout from "@/layouts/MainLayout";

export default function RootLayout({ children }) {
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
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

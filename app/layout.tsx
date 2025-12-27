import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";
import I18nProvider from "@/components/I18nProvider";
import MobileWarning from "@/components/MobileWarning";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Telangana Road Safety Month",
  description: "Join Road Safety Month—learn, act, and lead by example.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Google Analytics Measurement ID - can be overridden with NEXT_PUBLIC_GA_MEASUREMENT_ID env var
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-YRNQ80952L';

  return (
    <html lang="en">
      {/* Google tag (gtag.js) */}
      {gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `}
          </Script>
        </>
      )}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> 
        <I18nProvider>
          <div className="min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <MobileWarning />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}

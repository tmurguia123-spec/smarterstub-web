import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SmarterStub | Live event search with an SEO-first frontend",
  description:
    "SmarterStub is migrating to a crawlable Next.js frontend for live event search, event pages, and alert signup.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "SmarterStub",
    description:
      "Live event search, event details, and alert signup on an SEO-friendly frontend.",
    url: siteUrl,
    siteName: "SmarterStub",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-[var(--font-body)] text-slate-950 antialiased">
        <div className="relative">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

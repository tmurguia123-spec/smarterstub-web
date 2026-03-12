import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "SmarterStub | Search Once, Compare Everywhere",
  description:
    "SmarterStub helps fans compare ticket prices across top marketplaces and spot the best all-in deal fast."
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

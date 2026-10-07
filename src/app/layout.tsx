import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import Script from "next/script";
import { PnHeader } from "@/components/PnHeader";
import { PrefsSync } from "@/components/PrefsSync";
import { SiteFooter } from "@/components/SiteFooter";
import { AUTH_DISABLED } from "@/lib/guest";
import { supabaseConfigured } from "@/lib/supabase/env";
import "./pn.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "OpsPulse", template: "%s · OpsPulse" },
  description: "News that matters for your MBA interviews and group discussions, with the interview angle on every story.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf6" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

// Runs before the page paints: use the saved choice, otherwise follow the device (light or dark).
const themeInit = `(function(){try{var t=localStorage.getItem("pn-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const authOn = supabaseConfigured && !AUTH_DISABLED;
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInit }} />
        <PnHeader authOn={authOn} />
        {authOn ? <PrefsSync /> : null}
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

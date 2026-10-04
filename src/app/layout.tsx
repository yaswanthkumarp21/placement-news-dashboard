import type { Metadata, Viewport } from "next";
import { PnHeader } from "@/components/PnHeader";
import "./pn.css";

export const metadata: Metadata = {
  title: { default: "Placement News", template: "%s · Placement News" },
  description: "News that matters for your MBA interviews and group discussions, with the interview angle on every story.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PnHeader />
        {children}
      </body>
    </html>
  );
}

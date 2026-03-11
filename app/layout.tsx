import "./globals.css";
import type { ReactNode } from "react";
import SitePresenceTracker from "@/components/site-presence-tracker";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <SitePresenceTracker />
        {children}
      </body>
    </html>
  );
}
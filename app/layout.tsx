import "./globals.css";
import type { ReactNode } from "react";
import StaffFaqBot from "@/components/staff-faq-bot";
import GlobalSiteBackground from "@/components/global-site-background";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="relative min-h-screen bg-transparent text-white">
        <GlobalSiteBackground />
        {children}
        <StaffFaqBot />
      </body>
    </html>
  );
}
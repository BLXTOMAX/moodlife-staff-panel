"use client";

import "./globals.css";
import type { ReactNode } from "react";
import StaffFaqBot from "@/components/staff-faq-bot";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}

        {/* Bot FAQ staff */}
        <StaffFaqBot />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoodLifeRP Panel",
  description: "Panel staff MoodLifeRP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-[#05070b] text-white">
        <div className="pointer-events-none fixed left-5 top-5 z-50 opacity-95">
          
        </div>

        {children}
      </body>
    </html>
  );
}
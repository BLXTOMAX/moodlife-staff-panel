import type { ReactNode } from "react";
import AnimatedBackground from "./animated-background";
import Sidebar from "@/components/sidebar";
import HelpBot from "@/components/help-bot";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>

      <HelpBot />
    </div>
  );
}


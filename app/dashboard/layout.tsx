"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission, getSessionEmail, isOwner } from "@/lib/access";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const email = getSessionEmail();

      if (!email) {
        router.replace("/login");
        return;
      }

      if (isOwner(email)) {
        setAllowed(true);
        return;
      }

      const canAccess = await hasPermission(pathname);

      if (!canAccess) {
        router.replace("/login");
        return;
      }

      setAllowed(true);
    };

    checkAccess();
  }, [pathname, router]);

  if (allowed === null) {
    return <div className="p-6 text-white">Chargement...</div>;
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen flex">
      {/* TA SIDEBAR ICI */}
      {/* TON FOND / WRAPPER ICI */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
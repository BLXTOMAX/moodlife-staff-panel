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

      const allowed = await hasPermission(pathname);

      if (!allowed) {
        router.replace("/dashboard/info");
        return;
      }

      setAllowed(true);
    };

    checkAccess();
  }, [pathname, router]);

  if (allowed === null) {
    return <div className="p-6 text-white">Chargement...</div>;
  }

  return <>{children}</>;
}
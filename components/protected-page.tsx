"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPermission, getSessionEmail, isOwner } from "@/lib/access";

export default function ProtectedPage({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const email = getSessionEmail();

      if (!email) {
        router.replace("/login");
        return;
      }

      if (isOwner(email) || (await hasPermission(permission))) {
        setAllowed(true);
        return;
      }

      setAllowed(false);
      router.replace("/dashboard");
    };

    checkAccess();
  }, [permission, router]);

  if (allowed === null) {
    return <div className="p-6 text-white/70">Vérification des accès...</div>;
  }

  if (!allowed) return null;

  return <>{children}</>;
}
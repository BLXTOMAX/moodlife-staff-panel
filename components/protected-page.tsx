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
    let mounted = true;

    const checkAccess = async () => {
      const email = getSessionEmail();

      if (!email) {
  if (mounted) setAllowed(false);
  router.replace("/login");
  return;
}

      const owner = isOwner(email);
      const permitted = owner || (await hasPermission(permission));

      if (!mounted) return;

      if (permitted) {
        setAllowed(true);
      } else {
        setAllowed(false);
        router.replace("/dashboard");
      }
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [permission, router]);

  if (allowed === null) {
    return <div className="p-6 text-white/70">Vérification des accès...</div>;
  }

  if (!allowed) {
    return <div className="p-6 text-white/70">Redirection...</div>;
  }

  return <>{children}</>;
}
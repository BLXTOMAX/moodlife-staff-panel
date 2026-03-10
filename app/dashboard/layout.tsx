"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSessionEmail, isOwner } from "@/lib/access";
import { supabase } from "@/lib/supabase";

type PermissionItem = {
  href: string;
  label: string;
};

const ALL_ITEMS: PermissionItem[] = [
  { href: "/dashboard/info", label: "Info serveur" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/regles-staff", label: "Règles Staff" },
  { href: "/dashboard/commandes-staff", label: "Commandes Staff" },
  { href: "/dashboard/license", label: "License" },
  { href: "/dashboard/mail", label: "Mail Suicide RP" },
  { href: "/dashboard/absence-staff", label: "Absence Staff" },
  { href: "/dashboard/espace-sa-gerant", label: "Espace S-A / Gérant-Staff" },
  { href: "/dashboard/deban-non-autorise", label: "Deban Non Autorisé" },
  { href: "/dashboard/mail-acces", label: "Mail accès" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);

  useEffect(() => {
    const checkAccess = async () => {
      const email = getSessionEmail();

      if (!email) {
        setAllowed(false);
        router.replace("/login");
        return;
      }

      if (isOwner(email)) {
        setAllowedPaths(ALL_ITEMS.map((item) => item.href));
        setAllowed(true);
        return;
      }

      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("email", email);

      if (error) {
        console.error("Erreur récupération permissions layout :", error);
        setAllowed(false);
        router.replace("/login");
        return;
      }

      const permissions = (data || []).map((item) => item.permission);
      setAllowedPaths(permissions);

      if (pathname === "/dashboard") {
        if (permissions.length > 0) {
          setAllowed(false);
          router.replace(permissions[0]);
          return;
        }

        setAllowed(false);
        router.replace("/login");
        return;
      }

      if (!permissions.includes(pathname)) {
        setAllowed(false);

        if (permissions.length > 0) {
          router.replace(permissions[0]);
        } else {
          router.replace("/login");
        }

        return;
      }

      setAllowed(true);
    };

    checkAccess();
  }, [pathname, router]);

  const visibleItems = useMemo(() => {
    return ALL_ITEMS.filter((item) => allowedPaths.includes(item.href));
  }, [allowedPaths]);

  const handleLogout = () => {
    localStorage.removeItem("moodlife-session-email");
    localStorage.removeItem("moodlife-email");
    localStorage.removeItem("moodlife-session");
    router.replace("/login");
  };

  if (allowed === null) {
    return <div className="min-h-screen bg-black p-6 text-white">Chargement...</div>;
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="w-[260px] border-r border-yellow-400/10 bg-black/80 p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-yellow-400">M</h1>
            <h2 className="mt-4 text-3xl font-black text-yellow-400">Panel Staff</h2>
            <p className="mt-2 text-sm text-white/60">Gestion interne du staff</p>
          </div>

          <nav className="space-y-2">
            {visibleItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-yellow-400 text-black font-bold"
                      : "text-white/85 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 w-full rounded-xl bg-red-900/60 px-4 py-3 text-sm text-red-100 transition hover:bg-red-800/70"
          >
            Se déconnecter
          </button>
        </aside>

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
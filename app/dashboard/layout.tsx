"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSessionEmail, isOwner } from "@/lib/access";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import SitePresenceTracker from "@/components/site-presence-tracker";
import StaffFaqBot from "@/components/staff-faq-bot";

const ALL_ITEMS = [
  "/dashboard/info",
  "/dashboard",
  "/dashboard/regles-staff",
  "/dashboard/commandes-staff",
  "/dashboard/license",
  "/dashboard/mail",
  "/dashboard/absence-staff",
  "/dashboard/espace-sa-gerant",
  "/dashboard/deban-non-autorise",
  "/dashboard/mail-acces",
];

const ALWAYS_ALLOWED = ["/dashboard", "/dashboard/info"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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

      if (isOwner(email)) {
        if (mounted) setAllowed(true);
        return;
      }

      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("email", email);

      if (error) {
        console.error("Erreur récupération permissions layout :", error);
        if (mounted) setAllowed(false);
        router.replace("/login");
        return;
      }

      const dbPermissions = (data || []).map((item) => item.permission);
      const permissions = Array.from(
        new Set([...ALWAYS_ALLOWED, ...dbPermissions])
      );

      if (!mounted) return;

      if (pathname === "/dashboard") {
        setAllowed(true);
        return;
      }

      if (!ALL_ITEMS.includes(pathname)) {
        setAllowed(true);
        return;
      }

      if (!permissions.includes(pathname)) {
        setAllowed(false);
        router.replace("/dashboard");
        return;
      }

      setAllowed(true);
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-transparent p-6 text-white">
        Chargement...
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-transparent p-6 text-white">
        Redirection...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <SitePresenceTracker />

      <div className="min-h-screen bg-transparent xl:flex">
  <Sidebar />

  <main className="min-w-0 flex-1 w-full overflow-x-hidden bg-transparent p-4 md:p-6">
    {children}
  </main>
</div>

      <StaffFaqBot />
    </div>
  );
}
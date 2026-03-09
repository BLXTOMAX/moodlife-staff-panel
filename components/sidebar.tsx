"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { hasPermission, getSessionEmail, isOwner } from "@/lib/access";
import { useRouter } from "next/navigation";

type SidebarLink = {
  href: string;
  label: string;
  always?: boolean;
};

const links: SidebarLink[] = [
  { href: "/dashboard/info", label: "Info serveur", always: true },
  { href: "/dashboard", label: "Dashboard", always: true },
  { href: "/dashboard/regles-staff", label: "Règles Staff" },
  { href: "/dashboard/commandes-staff", label: "Commandes Staff" },
  { href: "/dashboard/license", label: "License" },
  { href: "/dashboard/mail", label: "Mail Suicide RP" },
  { href: "/dashboard/deban-non-autorise", label: "Deban Non Autorisé" },
  { href: "/dashboard/absence-staff", label: "Absence Staff" },
  { href: "/dashboard/espace-sa-gerant", label: "Espace S-A / Gérant-Staff" },
  { href: "/dashboard/mail-acces", label: "Mail accès" },
];

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const [mounted, setMounted] = useState(false);
  const [visibleLinks, setVisibleLinks] = useState<SidebarLink[]>(
    links.filter((link) => link.always)
  );

  useEffect(() => {
    setMounted(true);

    const sessionEmail = getSessionEmail();
    const owner = isOwner(sessionEmail);

    const filtered = links.filter((link) => {
      if (link.always) return true;
      if (owner) return true;
      return hasPermission(link.href);
    });

    setVisibleLinks(filtered);
  }, []);

  return (
    <aside className="w-[280px] border-r border-white/5 bg-black/40 p-5">
      <div className="panel-card mb-8 p-4 text-center">
        <Image
          src="/logo-moodlife.png"
          alt="MoodLifeRP"
          width={60}
          height={60}
          className="mx-auto drop-shadow-[0_0_12px_rgba(255,215,0,0.35)]"
          priority
        />

        <h1 className="mt-3 text-3xl font-black text-yellow-400">
          Panel Staff
        </h1>

        <p className="mt-1 text-sm text-zinc-400">Gestion interne du staff</p>
      </div>

      <nav className="space-y-2">
        {(mounted ? visibleLinks : links.filter((link) => link.always)).map(
          (link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-2xl px-4 py-3 text-zinc-300 transition hover:bg-yellow-400/10 hover:text-yellow-300"
            >
              {link.label}
            </Link>
          )
        )}
      </nav>
      <div className="mt-8">
  <button
    onClick={handleLogout}
    className="w-full rounded-2xl bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500/20"
  >
    Se déconnecter
  </button>
</div>
    </aside>
  );
}
"use client";
console.log("SIDEBAR LOADED");

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Info,
  Shield,
  ScrollText,
  FileBadge,
  Mail,
  Ban,
  Users,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: "principal" | "staff";
};

const links: SidebarLink[] = [
  {
    href: "/dashboard/info",
    label: "Info serveur",
    icon: Info,
    section: "principal",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "principal",
  },
  {
    href: "/dashboard/regles-staff",
    label: "Règles Staff",
    icon: ScrollText,
    section: "staff",
  },
  {
    href: "/dashboard/commandes-staff",
    label: "Commandes Staff",
    icon: Shield,
    section: "staff",
  },
  {
    href: "/dashboard/license",
    label: "License",
    icon: FileBadge,
    section: "staff",
  },
  {
    href: "/dashboard/mail",
    label: "Mail Suicide RP",
    icon: Mail,
    section: "staff",
  },
  {
    href: "/dashboard/absence-staff",
    label: "Absence Staff",
    icon: Users,
    section: "staff",
  },
  {
    href: "/dashboard/espace-sa-gerant",
    label: "Espace S-A / Gérant-Staff",
    icon: Shield,
    section: "staff",
  },
  {
    href: "/dashboard/deban-non-autorise",
    label: "Deban Non Autorisé",
    icon: Ban,
    section: "staff",
  },
  {
    href: "/dashboard/mail-acces",
    label: "Mail accès",
    icon: Mail,
    section: "staff",
  },
];

function SidebarSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: SidebarLink[];
  pathname: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 px-2">
        <div className="h-px flex-1 bg-gradient-to-r from-yellow-400/25 to-transparent" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-300/60">
          {title}
        </p>
      </div>

      <nav className="space-y-2">
        {items.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                isActive
                  ? "border-yellow-400/35 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black shadow-[0_10px_28px_rgba(250,204,21,0.22)]"
                  : "border-white/6 bg-white/[0.02] text-white/78 hover:border-yellow-400/15 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {!isActive && (
                <div className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-transparent transition group-hover:bg-yellow-400/50" />
              )}

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                  isActive
                    ? "border-black/10 bg-black/10 text-black"
                    : "border-yellow-400/10 bg-yellow-400/5 text-yellow-300/80 group-hover:border-yellow-400/20 group-hover:bg-yellow-400/10 group-hover:text-yellow-300"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-semibold ${
                    isActive ? "text-black" : "text-white/88"
                  }`}
                >
                  {link.label}
                </p>
              </div>

              <ChevronRight
                className={`h-4 w-4 transition ${
                  isActive
                    ? "text-black/70"
                    : "text-white/25 group-hover:translate-x-0.5 group-hover:text-yellow-300/70"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const principalLinks = links.filter((link) => link.section === "principal");
  const staffLinks = links.filter((link) => link.section === "staff");

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Erreur logout :", error);
    } finally {
      localStorage.removeItem("moodlife-session-email");
      localStorage.removeItem("moodlife-email");
      localStorage.removeItem("moodlife-session");
      router.replace("/login");
    }
  };

  return (
    <aside className="hidden w-[320px] shrink-0 border-r border-yellow-400/10 bg-[#050505] xl:flex xl:flex-col">
      <div className="relative border-b border-yellow-400/10 px-5 py-5">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative overflow-hidden rounded-[28px] border border-yellow-400/15 bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-black p-5 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.12),transparent_30%)]" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400 text-3xl font-black text-black shadow-[0_8px_20px_rgba(250,204,21,0.18)]">
              M
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/15 bg-yellow-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-yellow-300">
                <Sparkles className="h-3 w-3" />
                MoodLife
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-yellow-400">
                Panel Staff
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Gestion interne du staff
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-7">
          <SidebarSection
            title="Navigation"
            items={principalLinks}
            pathname={pathname}
          />

          <SidebarSection
            title="Outils staff"
            items={staffLinks}
            pathname={pathname}
          />
        </div>
      </div>

      <div className="border-t border-yellow-400/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-900/70 to-red-800/60 px-4 py-3.5 text-sm font-semibold text-red-50 transition hover:from-red-800/80 hover:to-red-700/70"
        >
          <LogOut className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
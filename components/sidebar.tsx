"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Info,
  Shield,
  ScrollText,
  FileBadge,
  Mail,
  Ban,
  Users,
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

export default function Sidebar() {
  const pathname = usePathname();

  const principalLinks = links.filter((link) => link.section === "principal");
  const staffLinks = links.filter((link) => link.section === "staff");

  return (
    <aside className="hidden w-[290px] shrink-0 border-r border-yellow-400/10 bg-[#070707] xl:flex xl:flex-col">
      <div className="border-b border-yellow-400/10 px-6 py-6">
        <div className="rounded-2xl border border-yellow-400/15 bg-gradient-to-br from-yellow-400/10 to-transparent p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/80">
            MoodLife
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">Panel Staff</h2>
          <p className="mt-2 text-sm text-white/55">
            Gestion interne du staff
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-300/55">
              Navigation
            </p>

            <nav className="mt-3 space-y-1.5">
              {principalLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-400 text-black shadow-[0_10px_25px_rgba(250,204,21,0.18)]"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-black"
                          : "text-yellow-300/80 group-hover:text-yellow-300"
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-300/55">
              Outils staff
            </p>

            <nav className="mt-3 space-y-1.5">
              {staffLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-400 text-black shadow-[0_10px_25px_rgba(250,204,21,0.18)]"
                        : "text-white/78 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-black"
                          : "text-yellow-300/75 group-hover:text-yellow-300"
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
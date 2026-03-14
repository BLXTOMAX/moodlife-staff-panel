"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSessionEmail, isOwner } from "@/lib/access";
import { supabase } from "@/lib/supabase";
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
  Menu,
  X,
} from "lucide-react";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: "principal" | "staff";
};

const ALWAYS_ALLOWED = ["/dashboard/info", "/dashboard"];

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

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function SidebarSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: SidebarLink[];
  pathname: string;
  onNavigate?: () => void;
}) {
  if (items.length === 0) return null;

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
              onClick={onNavigate}
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

  const [permissions, setPermissions] = useState<string[]>(ALWAYS_ALLOWED);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadPermissions() {
      const rawEmail = getSessionEmail();
      const email = normalize(rawEmail || "");

      if (!email) {
        if (mounted) {
          setPermissions(ALWAYS_ALLOWED);
          setLoadingPermissions(false);
        }
        return;
      }

      if (isOwner(email)) {
        if (mounted) {
          setPermissions(
            Array.from(new Set([...ALWAYS_ALLOWED, ...links.map((item) => item.href)]))
          );
          setLoadingPermissions(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("email", email);

      if (error) {
        console.error("Erreur chargement permissions sidebar :", error);
        if (mounted) {
          setPermissions(ALWAYS_ALLOWED);
          setLoadingPermissions(false);
        }
        return;
      }

      const dbPermissions = (data || [])
        .map((item) => item.permission)
        .filter(Boolean);

      const merged = Array.from(new Set([...ALWAYS_ALLOWED, ...dbPermissions]));

      if (mounted) {
        setPermissions(merged);
        setLoadingPermissions(false);
      }
    }

    loadPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleLinks = useMemo(() => {
    return links.filter((link) => permissions.includes(link.href));
  }, [permissions]);

  const principalLinks = visibleLinks.filter(
    (link) => link.section === "principal"
  );
  const staffLinks = visibleLinks.filter((link) => link.section === "staff");

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
    <>
      {/* Barre mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-yellow-400/10 bg-black/90 px-4 py-3 backdrop-blur xl:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-yellow-400/20 bg-[#0b0b0b] p-1">
            <Image
              src="/logo-moodlife.png"
              alt="MoodLife"
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-yellow-300">Panel Staff</p>
            <p className="text-xs text-white/45">Navigation mobile</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full w-[88%] max-w-[340px] border-r border-yellow-400/10 bg-black/95 p-4 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-lg font-black text-yellow-300">Panel Staff</p>
                <p className="text-xs text-white/45">Menu</p>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/75"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingPermissions ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-white/55">
                Chargement des accès...
              </div>
            ) : (
              <div className="space-y-7">
                <SidebarSection
                  title="Navigation"
                  items={principalLinks}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />

                <SidebarSection
                  title="Outils staff"
                  items={staffLinks}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-900/70 to-red-800/60 px-4 py-3.5 text-sm font-semibold text-red-50 transition hover:from-red-800/80 hover:to-red-700/70"
                >
                  <LogOut className="h-4 w-4 transition group-hover:-translate-x-0.5" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Sidebar desktop */}
      <aside className="hidden w-[320px] shrink-0 border-r border-yellow-400/10 bg-black/85 xl:flex xl:flex-col">
        <div className="relative border-b border-yellow-400/10 px-5 py-5">
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-yellow-400/8 blur-2xl" />

          <div className="relative overflow-hidden rounded-[28px] border border-yellow-400/15 bg-gradient-to-br from-[#121212]/90 via-[#0a0a0a]/85 to-black/90 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.12),transparent_30%)]" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-yellow-400/20 bg-[#0b0b0b] p-1 shadow-[0_8px_20px_rgba(250,204,21,0.18)]">
                <Image
                  src="/logo-moodlife.png"
                  alt="MoodLife"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
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
          {loadingPermissions ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-white/55">
              Chargement des accès...
            </div>
          ) : (
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
          )}
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
    </>
  );
}
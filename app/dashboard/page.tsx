"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  EyeOff,
  Grid3X3,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSessionEmail, isOwner } from "@/lib/access";

const ALWAYS_ALLOWED_PERMISSIONS = ["/dashboard", "/dashboard/info"] as const;

const CATEGORIES = [
  {
    title: "Info serveur",
    href: "/dashboard/info",
    description: "Retrouve les informations générales et utiles du serveur.",
  },
  {
    title: "Espace S-A / Gérant-Staff",
    href: "/dashboard/espace-sa-gerant",
    description:
      "Accès aux ressources et contenus réservés à la gestion staff.",
  },
  {
    title: "Règles Staff",
    href: "/dashboard/regles-staff",
    description: "Consulte rapidement les règles internes de l’équipe staff.",
  },
  {
    title: "Mail Suicide RP",
    href: "/dashboard/mail",
    description: "Accès à l’espace mail et aux informations associées.",
  },
  {
    title: "Commandes Staff",
    href: "/dashboard/commandes-staff",
    description:
      "Liste des commandes utiles pour la modération et la gestion.",
  },
  {
    title: "License",
    href: "/dashboard/license",
    description:
      "Retrouve les informations et vérifications liées aux licenses.",
  },
  {
    title: "Deban Non Autorisé",
    href: "/dashboard/deban-non-autorise",
    description:
      "Section dédiée au suivi et au traitement des debans non autorisés.",
  },
  {
    title: "Absence Staff",
    href: "/dashboard/absence-staff",
    description: "Déclare ou consulte les absences du staff.",
  },
  {
    title: "Mail accès",
    href: "/dashboard/mail-acces",
    description:
      "Gère les permissions des comptes et les accès aux catégories du panel.",
  },
] as const;

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
  glowClassName?: string;
};

const StatCard = memo(function StatCard({
  label,
  value,
  helper,
  valueClassName = "text-white",
  glowClassName = "from-yellow-500/20 via-yellow-300/10 to-transparent",
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-yellow-400/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-yellow-300/20">
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${glowClassName} opacity-80 blur-2xl transition group-hover:opacity-100`}
      />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-300/85">
          {label}
        </p>
        <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
        <p className="mt-2 text-sm leading-6 text-white/55">{helper}</p>
      </div>
    </div>
  );
});

type CategoryCardProps = {
  title: string;
  href: string;
  description: string;
  allowed: boolean;
};

const CategoryCard = memo(function CategoryCard({
  title,
  href,
  description,
  allowed,
}: CategoryCardProps) {
  if (allowed) {
    return (
      <Link
        href={href}
        className="group relative overflow-hidden rounded-[30px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(21,21,21,0.98),rgba(16,16,16,0.95))] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.30)] transition duration-300 hover:-translate-y-1 hover:border-yellow-400/35 hover:shadow-[0_18px_38px_rgba(0,0,0,0.40)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_30%)] opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-yellow-400/10 blur-2xl opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 opacity-80" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-300">
              Accessible
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
              {title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/62">
              {description}
            </p>
          </div>

          <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300 transition group-hover:scale-105 group-hover:bg-yellow-400/15">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="relative mt-6 h-px w-full bg-gradient-to-r from-yellow-400/30 via-yellow-300/10 to-transparent" />

        <div className="relative mt-4 flex items-center justify-between text-xs text-white/45">
          <span>Ouvrir la catégorie</span>
          <span className="text-yellow-300/85">Accès autorisé</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,15,0.95),rgba(10,10,10,0.90))] p-5 shadow-[0_8px_22px_rgba(0,0,0,0.22)] transition duration-300 hover:border-white/15">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.02),transparent)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex rounded-full border border-red-400/15 bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-300">
            Verrouillé
          </div>

          <h2 className="mt-4 text-xl font-black text-white/88">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/42">{description}</p>
        </div>

        <div className="rounded-full border border-red-400/20 bg-red-500/10 p-2 text-red-300">
          <Lock className="h-4 w-4" />
        </div>
      </div>

      <div className="relative mt-5 rounded-2xl border border-red-400/15 bg-red-500/[0.05] px-4 py-3">
        <div className="flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-red-300" />
          <p className="text-sm font-semibold text-red-300">
            Accès non autorisé
          </p>
        </div>
        <p className="mt-1 text-xs leading-5 text-white/45">
          Demande l’autorisation à un responsable pour accéder à cette
          catégorie.
        </p>
      </div>
    </div>
  );
});

export default function DashboardPage() {
  const [sessionEmail, setSessionEmail] = useState("");
  const [owner, setOwner] = useState(false);
  const [permissions, setPermissions] = useState<string[]>(
    [...ALWAYS_ALLOWED_PERMISSIONS]
  );
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPermissions() {
      try {
        const email = getSessionEmail() || "";
        const isUserOwner = isOwner(email);

        if (cancelled) return;

        setSessionEmail(email);
        setOwner(isUserOwner);

        if (!email) {
          setPermissions([...ALWAYS_ALLOWED_PERMISSIONS]);
          return;
        }

        const { data, error } = await supabase
          .from("user_permissions")
          .select("permission")
          .eq("email", email);

        if (cancelled) return;

        if (error) {
          console.error("Erreur chargement permissions :", error);
          setPermissions([...ALWAYS_ALLOWED_PERMISSIONS]);
          return;
        }

        const dbPermissions = (data ?? []).map((item) => item.permission);

        setPermissions([...new Set([...ALWAYS_ALLOWED_PERMISSIONS, ...dbPermissions])]);
      } catch (error) {
        if (!cancelled) {
          console.error("Erreur dashboard permissions :", error);
          setPermissions([...ALWAYS_ALLOWED_PERMISSIONS]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPermissions(false);
        }
      }
    }

    loadPermissions();

    return () => {
      cancelled = true;
    };
  }, []);

  const permissionSet = useMemo(() => new Set(permissions), [permissions]);

  const allowedCount = useMemo(() => {
    if (owner) return CATEGORIES.length;
    return CATEGORIES.reduce(
      (count, category) => count + (permissionSet.has(category.href) ? 1 : 0),
      0
    );
  }, [owner, permissionSet]);

  const lockedCount = CATEGORIES.length - allowedCount;

  const categoryCards = useMemo(() => {
    return CATEGORIES.map((category) => (
      <CategoryCard
        key={category.href}
        title={category.title}
        href={category.href}
        description={category.description}
        allowed={owner || permissionSet.has(category.href)}
      />
    ));
  }, [owner, permissionSet]);

  if (loadingPermissions) {
    return (
      <div className="rounded-[28px] border border-yellow-400/10 bg-[#101010]/85 p-6 text-white/70 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
        Chargement du dashboard...
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[34px] border border-yellow-400/15 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.08),transparent_24%),linear-gradient(135deg,rgba(10,10,10,0.98),rgba(0,0,0,0.94),rgba(17,17,17,0.98))] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.03),transparent)]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-yellow-300">
            <Sparkles className="h-3.5 w-3.5" />
            Dashboard
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] md:text-5xl">
            Accès rapide
          </h1>

          <div className="mt-4 h-px w-48 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
            Retrouve ici toutes les catégories du panel staff selon les accès
            attribués à ton compte. Les sections autorisées sont disponibles
            immédiatement, les autres restent verrouillées.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              {owner ? "Compte propriétaire" : "Compte staff actif"}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-300">
              <Grid3X3 className="h-4 w-4" />
              {allowedCount} catégorie{allowedCount > 1 ? "s" : ""} accessible
              {allowedCount > 1 ? "s" : ""}
            </div>
          </div>

          {sessionEmail ? (
            <p className="mt-4 text-xs text-white/40">{sessionEmail}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Catégories disponibles"
          value={String(allowedCount)}
          helper="Nombre de sections actuellement ouvertes sur ton compte."
          valueClassName="text-yellow-300"
          glowClassName="from-yellow-400/20 via-amber-300/10 to-transparent"
        />
        <StatCard
          label="Sections verrouillées"
          value={String(lockedCount)}
          helper="Zones visibles mais encore protégées par permissions."
          valueClassName="text-red-300"
          glowClassName="from-red-500/15 via-yellow-300/10 to-transparent"
        />
        <StatCard
          label="Accès de base"
          value="Dashboard + Info"
          helper="Les accès minimums actifs sur chaque compte créé."
          valueClassName="text-white"
          glowClassName="from-white/10 via-yellow-200/5 to-transparent"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categoryCards}
      </div>
    </section>
  );
}
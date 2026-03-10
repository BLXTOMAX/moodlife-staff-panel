"use client";

import Link from "next/link";
import { Lock, Sparkles, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSessionEmail, isOwner } from "@/lib/access";

const ALWAYS_ALLOWED_PERMISSIONS = ["/dashboard", "/dashboard/info"];

const categories = [
  {
    title: "Info serveur",
    href: "/dashboard/info",
    description: "Retrouve les informations générales et utiles du serveur.",
  },
  {
    title: "Espace S-A / Gérant-Staff",
    href: "/dashboard/espace-sa-gerant",
    description: "Accès aux ressources et contenus réservés à la gestion staff.",
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
    description: "Liste des commandes utiles pour la modération et la gestion.",
  },
  {
    title: "License",
    href: "/dashboard/license",
    description: "Retrouve les informations et vérifications liées aux licenses.",
  },
  {
    title: "Deban Non Autorisé",
    href: "/dashboard/deban-non-autorise",
    description: "Section dédiée au suivi et au traitement des debans non autorisés.",
  },
  {
    title: "Absence Staff",
    href: "/dashboard/absence-staff",
    description: "Déclare ou consulte les absences du staff.",
  },
  {
    title: "Mail accès",
    href: "/dashboard/mail-acces",
    description: "Gère les permissions des comptes et les accès aux catégories du panel.",
  },
];

function StatCard({
  label,
  value,
  helper,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-yellow-400/10 blur-2xl" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-300/85">
        {label}
      </p>
      <p className={`relative mt-3 text-3xl font-black ${valueClassName}`}>
        {value}
      </p>
      <p className="relative mt-2 text-sm leading-6 text-white/55">{helper}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [sessionEmail, setSessionEmail] = useState("");
  const [owner, setOwner] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    const email = getSessionEmail() || "";
    setSessionEmail(email);
    setOwner(isOwner(email));
  }, []);

  useEffect(() => {
    async function loadPermissions() {
      try {
        if (!sessionEmail) {
          setPermissions(ALWAYS_ALLOWED_PERMISSIONS);
          return;
        }

        const { data, error } = await supabase
          .from("user_permissions")
          .select("permission")
          .eq("email", sessionEmail);

        if (error) {
          console.error("Erreur chargement permissions :", error);
          setPermissions(ALWAYS_ALLOWED_PERMISSIONS);
          return;
        }

        const dbPermissions = (data || []).map((p) => p.permission);

        setPermissions([
          ...new Set([...ALWAYS_ALLOWED_PERMISSIONS, ...dbPermissions]),
        ]);
      } catch (err) {
        console.error("Erreur dashboard permissions :", err);
        setPermissions(ALWAYS_ALLOWED_PERMISSIONS);
      } finally {
        setLoadingPermissions(false);
      }
    }

    loadPermissions();
  }, [sessionEmail]);

  if (loadingPermissions) {
    return (
      <div className="p-6 text-white/70">
        Chargement du dashboard...
      </div>
    );
  }

  const allowedCount = categories.filter(
    (category) => owner || permissions.includes(category.href)
  ).length;

  const lockedCount = categories.length - allowedCount;

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[34px] border border-yellow-400/15 bg-gradient-to-br from-[#0b0b0b] via-black to-[#111111] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,215,0,0.08),transparent_25%)]" />
        <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-yellow-300">
            <Sparkles className="h-3.5 w-3.5" />
            Dashboard
          </div>

          <h1 className="mt-5 text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            Accès rapide
          </h1>

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
              {allowedCount} catégorie{allowedCount > 1 ? "s" : ""} accessible
              {allowedCount > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Catégories disponibles"
          value={String(allowedCount)}
          helper="Nombre de sections actuellement ouvertes sur ton compte."
          valueClassName="text-yellow-300"
        />
        <StatCard
          label="Sections verrouillées"
          value={String(lockedCount)}
          helper="Zones visibles mais encore protégées par permissions."
          valueClassName="text-red-300"
        />
        <StatCard
          label="Accès de base"
          value="Dashboard + Info"
          helper="Les accès minimums actifs sur chaque compte créé."
          valueClassName="text-white"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const allowed = owner || permissions.includes(category.href);

          if (allowed) {
            return (
              <Link
                key={category.href}
                href={category.href}
                className="group relative overflow-hidden rounded-[30px] border border-yellow-400/15 bg-gradient-to-br from-[#151515] to-[#101010] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.30)] transition duration-300 hover:-translate-y-1 hover:border-yellow-400/35 hover:shadow-[0_18px_38px_rgba(0,0,0,0.40)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.10),transparent_30%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-yellow-400/10 blur-2xl opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-300">
                      Accessible
                    </div>

                    <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
                      {category.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-white/62">
                      {category.description}
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
            <div
              key={category.href}
              className="rounded-[30px] border border-white/10 bg-[#0f0f0f]/80 p-5 opacity-80 shadow-[0_8px_22px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white/85">
                    {category.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/40">
                    {category.description}
                  </p>
                </div>

                <div className="rounded-full border border-red-400/20 bg-red-500/10 p-2 text-red-300">
                  <Lock className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-red-400/15 bg-red-500/[0.05] px-4 py-3">
                <p className="text-sm font-semibold text-red-300">
                  Accès non autorisé
                </p>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Demande l’autorisation à un responsable pour accéder à cette
                  catégorie.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
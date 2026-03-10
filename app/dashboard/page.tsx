"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
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

export default function DashboardPage() {
  const sessionEmail = getSessionEmail();
  const owner = isOwner(sessionEmail);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-yellow-400/12 bg-[#080a0e]/88 p-8 shadow-[0_0_35px_rgba(255,215,0,0.05)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.32em] text-yellow-400">
          Dashboard staff
        </p>

        <h1 className="mt-4 text-4xl font-black md:text-6xl">
          Accès rapide au panel{" "}
          <span className="text-yellow-400">MoodLife RP</span>
        </h1>

        <p className="mt-5 max-w-3xl leading-8 text-white/72">
          Bienvenue dans l’espace interne du staff. Retrouvez ici toutes les
          catégories importantes du panel pour accéder rapidement aux ressources,
          règles, commandes et outils de gestion.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((item) => {
          const allowed =
  owner || permissions.includes(item.href) || loadingPermissions;

          return (
            <div
              key={item.title}
              className={`rounded-[26px] border p-6 transition duration-300 ${
                allowed
                  ? "group border-yellow-400/15 bg-[#0d0f12]/88 shadow-[0_0_24px_rgba(255,215,0,0.04)] hover:-translate-y-1 hover:border-yellow-400/35 hover:bg-[#15171b] hover:shadow-[0_0_30px_rgba(255,215,0,0.10)]"
                  : "border-white/10 bg-[#0d0f12]/70 opacity-70"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.28em] text-yellow-400/90">
                Catégorie
              </p>

              <div className="mt-3 flex items-start justify-between gap-3">
                <h2
                  className={`text-2xl font-bold ${
                    allowed ? "text-white group-hover:text-yellow-300" : "text-white/85"
                  }`}
                >
                  {item.title}
                </h2>

                {!allowed && (
                  <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-400/15 bg-red-500/10 px-3 py-1 text-xs text-red-300">
                    <Lock className="h-3.5 w-3.5" />
                    Accès restreint
                  </div>
                )}
              </div>

              <p className="mt-4 text-sm leading-7 text-white/68">
                {item.description}
              </p>

              <div className="mt-6">
                {allowed ? (
                  <Link
                    href={item.href}
                    className="inline-flex rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_18px_rgba(255,215,0,0.18)] transition duration-300 hover:scale-[1.03] hover:bg-yellow-300 hover:shadow-[0_0_24px_rgba(255,215,0,0.26)]"
                  >
                    Ouvrir la catégorie
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/45"
                  >
                    Accès non autorisé
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
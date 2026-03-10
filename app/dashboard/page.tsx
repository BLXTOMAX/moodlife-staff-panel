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
    return <div className="p-6 text-white/70">Chargement du dashboard...</div>;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-yellow-400/15 bg-gradient-to-r from-black/80 via-black/70 to-black/40 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
          Dashboard
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          Accès rapide
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75">
          Retrouve ici toutes les catégories du panel staff selon les accès attribués à ton compte.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const allowed = owner || permissions.includes(category.href);

          if (allowed) {
            return (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-[28px] border border-yellow-400/15 bg-[#151515]/92 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.28)] transition hover:border-yellow-400/30 hover:bg-[#1a1a1a]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {category.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          }

          return (
            <div
              key={category.href}
              className="rounded-[28px] border border-white/10 bg-[#0f0f0f]/80 p-5 opacity-80 shadow-[0_8px_22px_rgba(0,0,0,0.22)]"
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
                  Demande l’autorisation à un responsable pour accéder à cette catégorie.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
"use client";

import { Lock, Shield, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSessionEmail } from "@/lib/access";
import { supabase } from "@/lib/supabase";

const ESPACE_SA_GERANT_PERMISSION = "/dashboard/espace-sa-gerant";
const EMPTY_MESSAGE = "";

function normalize(text: string) {
  return text.toLowerCase().trim();
}

export default function EspaceSAGerantPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [canViewPage, setCanViewPage] = useState(false);
  const [sessionEmail, setSessionEmail] = useState(EMPTY_MESSAGE);
  const [message, setMessage] = useState(EMPTY_MESSAGE);

  const normalizedSessionEmail = useMemo(
    () => normalize(sessionEmail),
    [sessionEmail]
  );

  useEffect(() => {
    let ignore = false;

    async function initPage() {
      try {
        setMessage(EMPTY_MESSAGE);

        const currentSessionEmail = normalize(getSessionEmail() || EMPTY_MESSAGE);
        if (ignore) return;

        setSessionEmail(currentSessionEmail);

        if (!currentSessionEmail) {
          if (!ignore) {
            setCanViewPage(false);
            setMessage("Aucune session détectée.");
          }
          return;
        }

        const { data, error } = await supabase
          .from("user_permissions")
          .select("permission")
          .eq("email", currentSessionEmail);

        if (error) {
          console.error("Erreur récupération permissions espace SA :", error);

          if (!ignore) {
            setCanViewPage(false);
            setMessage("Impossible de vérifier les permissions.");
          }
          return;
        }

        const userPermissions = (data ?? []).map((item) => item.permission);
        const hasGerantAccess = userPermissions.includes(
          ESPACE_SA_GERANT_PERMISSION
        );

        if (ignore) return;
        setCanViewPage(hasGerantAccess);

        if (!hasGerantAccess) {
          setMessage("Tu n’as pas accès à cette catégorie.");
        }
      } catch (error) {
        if (ignore) return;
        console.error("Erreur initialisation espace SA :", error);
        setCanViewPage(false);
        setMessage("Impossible de charger la page.");
      } finally {
        if (!ignore) setIsLoaded(true);
      }
    }

    initPage();

    return () => {
      ignore = true;
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-sm text-white/70">
        Chargement...
      </div>
    );
  }

  if (!canViewPage) {
    return (
      <div className="rounded-[30px] border border-red-500/20 bg-[linear-gradient(135deg,rgba(239,68,68,0.12),rgba(0,0,0,0.18))] p-6 shadow-[0_10px_24px_rgba(127,29,29,0.16)]">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 shrink-0 text-red-300" />
          <div>
            <h2 className="text-lg font-bold text-white">Accès refusé</h2>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Cette page est réservée uniquement aux personnes ayant accès à la
              catégorie{" "}
              <span className="font-semibold">
                Espace S-A / Gérant-Staff
              </span>
              .
            </p>

            {message ? (
              <p className="mt-3 text-sm text-red-200/80">{message}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-yellow-400/15 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_28%),linear-gradient(135deg,rgba(0,0,0,0.95),rgba(17,17,17,0.82),rgba(10,10,10,0.96))] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/15 bg-yellow-400/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.8)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
              Espace SA
            </p>
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Espace S-A / Gérant-Staff
          </h1>

          <div className="mt-4 h-px w-44 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82">
            Bienvenue dans l’espace réservé aux gérants staff.
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-[24px] border border-yellow-400/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-yellow-500/20 via-yellow-300/10 to-transparent opacity-80 blur-2xl" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
              Statut
            </p>
            <p className="mt-3 text-3xl font-black text-emerald-300">Actif</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Ton accès à l’espace gérant staff est bien autorisé.
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[24px] border border-yellow-400/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-white/10 via-yellow-200/5 to-transparent opacity-80 blur-2xl" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
              Session
            </p>
            <p className="mt-3 truncate text-lg font-black text-white">
              {normalizedSessionEmail || "Inconnue"}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Email actuellement utilisé pour vérifier les permissions.
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[24px] border border-yellow-400/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-yellow-400/20 via-amber-300/10 to-transparent opacity-80 blur-2xl" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
              Zone
            </p>
            <p className="mt-3 text-3xl font-black text-yellow-200">SA GS</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Espace distinct de la page Mail Suicide RP.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[30px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/10 p-3 text-yellow-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Zone protégée
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Tableau de bord gérant staff
              </h2>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-white/70">
            Cette page est maintenant indépendante du module des mails. Tu peux
            y ajouter ensuite ton vrai contenu SA / Gérant-Staff sans risquer
            d’afficher la liste des mails par erreur.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">
              Page corrigée avec succès.
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              La route <span className="font-semibold text-yellow-200">/dashboard/espace-sa-gerant</span>{" "}
              affiche désormais une vraie page dédiée.
            </p>
          </div>
        </div>

        <div className="rounded-[30px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/10 p-3 text-yellow-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Infos
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Accès validé
              </h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-yellow-300" />
                <p className="text-sm text-white/80">
                  Réservé aux personnes autorisées
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-yellow-300" />
                <p className="text-sm text-white/80">
                  Vérification par permission dashboard
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <p className="text-sm text-white/80">
                  Plus aucun affichage du module mail ici
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
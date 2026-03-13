"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, Clock3, TriangleAlert, ShieldBan } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSessionEmail } from "@/lib/access";

// Adapte ces imports selon tes vrais chemins de fichiers
import HeuresStaffPage from "@/app/dashboard/heures-staff/page";
import RemonteesPage from "@/app/dashboard/remontees/page";
import BLStaffPage from "@/app/dashboard/bl-staff/page";

const ESPACE_SA_GERANT_PERMISSION = "/dashboard/espace-sa-gerant";
const EMPTY_MESSAGE = "";

type TabId = "heures" | "remontees" | "bl";

function normalize(text: string) {
  return text.toLowerCase().trim();
}

const tabs: Array<{
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: "heures",
    label: "Heures / Reports",
    icon: Clock3,
    description: "Gestion des heures, reports, semaines et payes.",
  },
  {
    id: "remontees",
    label: "Remontées staff",
    icon: TriangleAlert,
    description: "Suivi des remontées positives et négatives.",
  },
  {
    id: "bl",
    label: "BL staff",
    icon: ShieldBan,
    description: "Blacklist staff et historique des ajouts.",
  },
];

export default function EspaceSAGerantPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [canViewPage, setCanViewPage] = useState(false);
  const [sessionEmail, setSessionEmail] = useState(EMPTY_MESSAGE);
  const [message, setMessage] = useState(EMPTY_MESSAGE);
  const [activeTab, setActiveTab] = useState<TabId>("heures");

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

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

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
            Zone réservée à la gestion gérant staff avec tes 3 onglets internes.
          </p>

          <p className="mt-3 text-xs text-white/45">
            Session : {normalizedSessionEmail || "inconnue"}
          </p>
        </div>
      </section>

      <section className="rounded-[30px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-start gap-3 rounded-[22px] border px-4 py-4 text-left transition ${
                  isActive
                    ? "border-yellow-400/30 bg-yellow-400/10 shadow-[0_10px_24px_rgba(250,204,21,0.10)]"
                    : "border-white/8 bg-black/20 hover:border-yellow-400/20 hover:bg-black/30"
                }`}
              >
                <div
                  className={`rounded-2xl p-3 ${
                    isActive
                      ? "bg-yellow-400/15 text-yellow-300"
                      : "bg-white/5 text-white/65"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold ${
                      isActive ? "text-yellow-200" : "text-white"
                    }`}
                  >
                    {tab.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[30px] border border-yellow-400/10 bg-black/10">
        <div className="border-b border-yellow-400/10 px-6 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/70">
            Onglet actif
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">
            {activeTabMeta.label}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {activeTabMeta.description}
          </p>
        </div>

        <div>
          {activeTab === "heures" ? <HeuresStaffPage /> : null}
          {activeTab === "remontees" ? <RemonteesPage /> : null}
          {activeTab === "bl" ? <BLStaffPage /> : null}
        </div>
      </section>
    </div>
  );
}
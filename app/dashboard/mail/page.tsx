"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Plus,
  Search,
  ExternalLink,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSessionEmail } from "@/lib/access";

type MailEntry = {
  id: number;
  email: string;
  created_at: string;
  created_by: string | null;
};

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/1-do2eDUT2NaGm6M2Dfeo3emzioXC9_ZUI1AR73dPf6Q/edit?ts=6997074b#response=ACYDBNjJJSdt9HPUf-cnAgsjnAJcB3y5-tdsSEcTZ-pYDCKpuOjp4irIDPPe0Ua4E_gSAsU";

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatCard({
  title,
  value,
  valueClassName = "text-yellow-300",
  description,
  glowClassName = "from-yellow-500/20 via-yellow-300/10 to-transparent",
}: {
  title: string;
  value: string | number;
  valueClassName?: string;
  description: string;
  glowClassName?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-yellow-400/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.30)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-yellow-300/20">
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${glowClassName} opacity-80 blur-2xl transition group-hover:opacity-100`}
      />
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
          {title}
        </p>
        <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
        <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
      </div>
    </div>
  );
}

export default function MailPage() {
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<MailEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [canManageAll, setCanManageAll] = useState(false);

  async function loadEntries() {
    try {
      const { data, error } = await supabase
        .from("suicide_rp_mails")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement mails :", error);
        setMessage("Impossible de charger les adresses mail.");
        return;
      }

      setEntries((data || []) as MailEntry[]);
    } catch (error) {
      console.error("Erreur chargement mails :", error);
      setMessage("Erreur serveur.");
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    const current = getSessionEmail() || "";
    setSessionEmail(current);
  }, []);

  useEffect(() => {
    async function loadManagePermission() {
      if (!sessionEmail) return;

      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("email", sessionEmail);

      if (error) {
        console.error("Erreur permission mail-acces :", error);
        return;
      }

      const permissions = (data || []).map((item) => item.permission);
      setCanManageAll(permissions.includes("/dashboard/mail-acces"));
    }

    loadManagePermission();
  }, [sessionEmail]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage("Merci de renseigner une adresse mail.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setMessage("Merci d’entrer une adresse mail valide.");
      return;
    }

    const { error } = await supabase
      .from("suicide_rp_mails")
      .insert([{ email: cleanEmail, created_by: sessionEmail || null }]);

    if (error) {
      console.error("Erreur ajout mail :", error);

      if (error.message?.toLowerCase().includes("duplicate")) {
        setMessage("Cette adresse mail est déjà enregistrée.");
      } else {
        setMessage("Impossible d’enregistrer cette adresse mail.");
      }
      return;
    }

    setEmail("");
    setMessage("Adresse mail enregistrée avec succès.");
    await loadEntries();
  }

  async function handleDelete(entry: MailEntry) {
    const canDelete =
      canManageAll ||
      (entry.created_by &&
        sessionEmail &&
        entry.created_by.toLowerCase() === sessionEmail.toLowerCase());

    if (!canDelete) {
      setMessage("Tu ne peux supprimer que les mails que tu as ajoutés.");
      return;
    }

    const { error } = await supabase
      .from("suicide_rp_mails")
      .delete()
      .eq("id", entry.id);

    if (error) {
      console.error("Erreur suppression mail :", error);
      setMessage("Impossible de supprimer cette adresse mail.");
      return;
    }

    setMessage("Adresse mail supprimée. L’accès au Google Form est retiré.");
    await loadEntries();
  }

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;

    return entries.filter((entry) =>
      normalize(entry.email).includes(normalize(search))
    );
  }, [entries, search]);

  const hasAccess = useMemo(() => {
  if (!sessionEmail) return false;
  return entries.some(
    (entry) => entry.email.toLowerCase() === sessionEmail.toLowerCase()
  );
}, [entries, sessionEmail]);

  const stats = useMemo(() => {
    return {
      total: entries.length,
      visible: filteredEntries.length,
      access: hasAccess ? "Actif" : "Bloqué",
    };
  }, [entries.length, filteredEntries.length, hasAccess]);

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
              Suicide RP
            </p>
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Accès au formulaire Suicide RP
          </h1>

          <div className="mt-4 h-px w-44 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82">
            Pour accéder au Google Form de Suicide RP, l’adresse mail doit être
            enregistrée. Cette liste est maintenant synchronisée pour tout le
            staff.
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          title="Mails enregistrés"
          value={stats.total}
          valueClassName="text-white"
          description="Nombre total d’adresses actuellement autorisées."
          glowClassName="from-white/10 via-yellow-200/5 to-transparent"
        />
        <StatCard
          title="Résultats visibles"
          value={stats.visible}
          valueClassName="text-yellow-200"
          description="Nombre d’adresses affichées selon la recherche."
          glowClassName="from-yellow-400/20 via-amber-300/10 to-transparent"
        />
        <StatCard
          title="Accès Form"
          value={stats.access}
          valueClassName={hasAccess ? "text-emerald-300" : "text-red-300"}
          description="Le formulaire est accessible seulement si au moins un mail est enregistré."
          glowClassName={
            hasAccess
              ? "from-emerald-400/15 via-yellow-300/10 to-transparent"
              : "from-red-500/15 via-yellow-300/10 to-transparent"
          }
        />
      </div>

      <div className="rounded-[28px] border border-red-500/20 bg-[linear-gradient(135deg,rgba(239,68,68,0.12),rgba(0,0,0,0.18))] p-5 shadow-[0_10px_24px_rgba(127,29,29,0.16)]">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 shrink-0 text-red-300" />
          <p className="text-sm leading-6 text-white/82">
            L’adresse mail est obligatoire pour accéder au Google Form. Toute
            suppression du mail enlève automatiquement l’accès.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden rounded-[30px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="relative mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
              Ajout
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Ajouter une adresse mail
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Enregistre une adresse mail pour autoriser l’accès au formulaire
              Suicide RP.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                Adresse mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@gmail.com"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(250,204,21,0.08)]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#fde047,#facc15,#f59e0b)] px-5 py-3 font-bold text-black shadow-[0_12px_24px_rgba(250,204,21,0.18)] transition hover:-translate-y-0.5 hover:brightness-105"
            >
              <Plus size={16} />
              Enregistrer le mail
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {message}
            </div>
          )}

          {hasAccess ? (
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-yellow-400/15 bg-yellow-400/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-400/15 hover:text-yellow-200"
            >
              <ExternalLink size={16} />
              Ouvrir le Google Form
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/35 opacity-70"
            >
              <ExternalLink size={16} />
              Ouvrir le Google Form
            </button>
          )}

          {!hasAccess && (
            <p className="mt-3 text-xs leading-5 text-yellow-200/75">
              Ajoute au moins une adresse mail pour débloquer l’accès au formulaire.
            </p>
          )}
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Liste
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Mails enregistrés
              </h2>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Rechercher un mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/35 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(250,204,21,0.08)]"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {!isLoaded ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                Chargement...
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                Aucun mail enregistré.
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const canDelete =
                  canManageAll ||
                  (entry.created_by &&
                    sessionEmail &&
                    entry.created_by.toLowerCase() ===
                      sessionEmail.toLowerCase());

                return (
                  <div
                    key={entry.id}
                    className="group relative overflow-hidden rounded-[26px] border border-yellow-400/12 bg-[#151515]/92 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition duration-300 hover:border-yellow-300/20 hover:bg-[#171717]/95"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 opacity-80" />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/10 p-3 text-yellow-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          <Mail className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-lg font-bold text-white">
                            {entry.email}
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            Ajouté le {formatDate(entry.created_at)}
                          </p>
                          <p className="mt-1 text-xs text-white/40">
                            Ajouté par : {entry.created_by || "inconnu"}
                          </p>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(entry)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
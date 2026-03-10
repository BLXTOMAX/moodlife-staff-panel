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

type MailEntry = {
  id: number;
  email: string;
  created_at: string;
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
}: {
  title: string;
  value: string | number;
  valueClassName?: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
        {title}
      </p>
      <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}

export default function MailPage() {
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<MailEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState("");

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
      .insert([{ email: cleanEmail }]);

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

  async function handleDelete(id: number) {
    const { error } = await supabase
      .from("suicide_rp_mails")
      .delete()
      .eq("id", id);

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

  const hasAccess = entries.length > 0;

  const stats = useMemo(() => {
    return {
      total: entries.length,
      visible: filteredEntries.length,
      access: hasAccess ? "Actif" : "Bloqué",
    };
  }, [entries.length, filteredEntries.length, hasAccess]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-yellow-400/15 bg-gradient-to-r from-black/80 via-black/70 to-black/40 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
            Suicide RP
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Accès au formulaire Suicide RP
          </h1>

          <div className="mt-4 h-px w-44 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82">
            Pour accéder au Google Form de Suicide RP, l’adresse mail doit être
            enregistrée. Cette liste est maintenant synchronisée pour tout le staff.
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          title="Mails enregistrés"
          value={stats.total}
          valueClassName="text-white"
          description="Nombre total d’adresses actuellement autorisées."
        />
        <StatCard
          title="Résultats visibles"
          value={stats.visible}
          valueClassName="text-sky-300"
          description="Nombre d’adresses affichées selon la recherche."
        />
        <StatCard
          title="Accès Form"
          value={stats.access}
          valueClassName={hasAccess ? "text-emerald-300" : "text-red-300"}
          description="Le formulaire est accessible seulement si au moins un mail est enregistré."
        />
      </div>

      <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-5 shadow-[0_10px_24px_rgba(127,29,29,0.16)]">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 shrink-0 text-red-300" />
          <p className="text-sm leading-6 text-white/82">
            L’adresse mail est obligatoire pour accéder au Google Form. Toute
            suppression du mail enlève automatiquement l’accès.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mb-5">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                Adresse mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@gmail.com"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105"
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

          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-yellow-400/15 bg-yellow-400/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-400/15"
          >
            <ExternalLink size={16} />
            Ouvrir le Google Form
          </a>
        </div>

        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                className="w-full rounded-2xl border border-white/10 bg-black/35 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
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
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[26px] border border-yellow-400/12 bg-[#151515]/92 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/10 p-3 text-yellow-300">
                        <Mail className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-lg font-bold text-white">
                          {entry.email}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          Ajouté le {formatDate(entry.created_at)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
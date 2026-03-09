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

type MailEntry = {
  id: number;
  email: string;
  createdAt: string;
};

const STORAGE_KEY = "moodlife-suicide-mails";
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Erreur lecture localStorage :", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error("Erreur écriture localStorage :", error);
    }
  }, [entries, isLoaded]);

  function handleSubmit(e: React.FormEvent) {
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

    const alreadyExists = entries.some(
      (entry) => entry.email.toLowerCase() === cleanEmail
    );

    if (alreadyExists) {
      setMessage("Cette adresse mail est déjà enregistrée.");
      return;
    }

    const newEntry: MailEntry = {
      id: Date.now(),
      email: cleanEmail,
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setEmail("");
    setMessage("Adresse mail enregistrée avec succès.");
  }

  function handleDelete(id: number) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    setMessage("Adresse mail supprimée. L’accès au Google Form est retiré.");
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
            enregistrée. Si elle est supprimée, l’accès au formulaire est retiré.
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

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/25 p-4">
            <p className="text-sm text-white/60">Accès Google Form</p>

            <button
              disabled={!hasAccess}
              onClick={() => window.open(GOOGLE_FORM_URL, "_blank")}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bold transition ${
                hasAccess
                  ? "bg-emerald-500 text-black hover:brightness-105"
                  : "cursor-not-allowed bg-zinc-700 text-zinc-300"
              }`}
            >
              <ExternalLink size={16} />
              {hasAccess
                ? "Accéder au Google Form"
                : "Accès bloqué tant qu’aucun mail n’est enregistré"}
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Historique
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Mails enregistrés
              </h2>
            </div>

            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/60">
              {filteredEntries.length} mail
              {filteredEntries.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />

            <input
              type="text"
              placeholder="Rechercher un mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/35 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
            />
          </div>

          <div className="mt-5 space-y-3">
            {!isLoaded ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
                Chargement...
              </div>
            ) : filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[24px] border border-white/10 bg-black/25 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition hover:border-yellow-400/20 hover:bg-black/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="mt-0.5 shrink-0 text-yellow-400" />
                        <p className="break-all text-sm font-medium text-white">
                          {entry.email}
                        </p>
                      </div>

                      <p className="mt-2 text-xs text-white/45">
                        Ajouté le {formatDate(entry.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/15"
                    >
                      <Trash2 size={14} />
                      Enlever
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
                Aucun mail enregistré.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
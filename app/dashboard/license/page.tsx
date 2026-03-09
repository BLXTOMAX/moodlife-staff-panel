"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Plus, Search, Shield, User, Wallet } from "lucide-react";

type LicenseEntry = {
  id: number;
  license: string;
  boutiqueId: string;
  discordName: string;
  createdAt: string;
};

const STORAGE_KEY = "moodliferp-license-entries";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function StatCard({
  label,
  value,
  description,
  valueClassName = "text-white",
}: {
  label: string;
  value: string | number;
  description: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[24px] border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}

export default function LicensePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  const [form, setForm] = useState({
    license: "",
    boutiqueId: "",
    discordName: "",
  });

  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<LicenseEntry[]>([]);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(STORAGE_KEY);

      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.license.trim() ||
      !form.boutiqueId.trim() ||
      !form.discordName.trim()
    ) {
      return;
    }

    const newEntry: LicenseEntry = {
      id: Date.now(),
      license: form.license.trim(),
      boutiqueId: form.boutiqueId.trim(),
      discordName: form.discordName.trim(),
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [newEntry, ...prev]);

    setForm({
      license: "",
      boutiqueId: "",
      discordName: "",
    });
  }

  function handleDelete(id: number) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;

    const q = normalize(search);

    return entries.filter((entry) =>
      normalize(
        `${entry.license} ${entry.boutiqueId} ${entry.discordName}`
      ).includes(q)
    );
  }, [entries, search]);

  const stats = useMemo(() => {
    return {
      total: entries.length,
      visible: filteredEntries.length,
      loaded: isLoaded ? "Active" : "Chargement",
    };
  }, [entries.length, filteredEntries.length, isLoaded]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-yellow-400/15 bg-gradient-to-r from-black/80 via-black/70 to-black/40 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
            License
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Gestion des licences
          </h1>

          <div className="mt-4 h-px w-40 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/82">
            Ajoutez une licence, un ID boutique et un nom Discord. Les entrées
            restent enregistrées après actualisation de la page.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Entrées"
          value={stats.total}
          description="Nombre total de licences enregistrées."
        />
        <StatCard
          label="Résultats visibles"
          value={stats.visible}
          description="Résultats affichés selon votre recherche."
          valueClassName="text-sky-300"
        />
        <StatCard
          label="Sauvegarde"
          value={stats.loaded}
          description="Les données sont conservées localement après actualisation."
          valueClassName={isLoaded ? "text-emerald-300" : "text-yellow-300"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-yellow-300">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Formulaire
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Ajouter une licence
              </h2>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.06] p-4 text-sm leading-6 text-white/78">
            Merci de remplir correctement les trois champs avant validation.
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                <Shield className="h-4 w-4 text-yellow-300" />
                Licence
              </label>
              <input
                type="text"
                name="license"
                value={form.license}
                onChange={handleChange}
                placeholder="Ex : license:xxxxxxxxxxxxxxxx"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                <Wallet className="h-4 w-4 text-yellow-300" />
                ID boutique
              </label>
              <input
                type="text"
                name="boutiqueId"
                value={form.boutiqueId}
                onChange={handleChange}
                placeholder="Ex : 45821"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                <User className="h-4 w-4 text-yellow-300" />
                Nom Discord
              </label>
              <input
                type="text"
                name="discordName"
                value={form.discordName}
                onChange={handleChange}
                placeholder="Ex : Pariss_"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              Ajouter à la liste
            </button>
          </form>
        </div>

        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Liste
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Licences enregistrées
              </h2>
            </div>

            <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/65">
              {filteredEntries.length} entrée
              {filteredEntries.length > 1 ? "s" : ""}
            </div>
          </div>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              placeholder="Rechercher une licence, un ID boutique, un nom Discord..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-yellow-400/15 bg-[#0b0b0b]/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/35 focus:bg-[#111111]"
            />
          </div>

          <div className="mt-5 space-y-3">
            {!isLoaded ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                Chargement...
              </div>
            ) : filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[24px] border border-yellow-400/15 bg-[#151515]/92 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.28)] transition duration-300 hover:border-yellow-400/30 hover:bg-[#1b1b1b]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 shrink-0 text-yellow-300" />
                        <p className="text-sm font-semibold text-white">
                          {entry.discordName}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-300/80">
                            Licence
                          </p>
                          <p className="mt-2 break-all text-sm leading-6 text-white/85">
                            {entry.license}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-yellow-300/80">
                            ID boutique
                          </p>
                          <p className="mt-2 text-sm text-white/85">
                            {entry.boutiqueId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                      <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/55">
                        {formatDate(entry.createdAt)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/15"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                Aucune entrée trouvée.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
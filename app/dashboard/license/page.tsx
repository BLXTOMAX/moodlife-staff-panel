"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Shield, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSessionEmail } from "@/lib/access";

type LicenseEntry = {
  id: number;
  license: string;
  boutique_id: string;
  discord_name: string;
  email: string | null;
  created_at: string;
  created_by: string | null;
};

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
  label,
  value,
  description,
  valueClassName = "text-yellow-300",
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
  const [form, setForm] = useState({
    license: "",
    boutiqueId: "",
    discordName: "",
    email: "",
  });
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<LicenseEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [canManageAll, setCanManageAll] = useState(false);

  async function loadEntries(
    currentSessionEmail?: string,
    currentCanManageAll?: boolean
  ) {
    try {
      const email = (currentSessionEmail ?? sessionEmail ?? "").trim();
      const canSeeAll = currentCanManageAll ?? canManageAll;

      let query = supabase
        .from("license_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!canSeeAll) {
        if (!email) {
          setEntries([]);
          setIsLoaded(true);
          return;
        }

        query = query.or(
          `created_by.eq.${email},email.eq.${email}`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erreur chargement licences :", error);
        setMessage("Impossible de charger les licences.");
        return;
      }

      setEntries((data || []) as LicenseEntry[]);
    } catch (error) {
      console.error("Erreur chargement licences :", error);
      setMessage("Erreur serveur.");
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    const email = getSessionEmail() || "";
    setSessionEmail(email);
  }, []);

  useEffect(() => {
    async function loadManagePermission() {
      if (!sessionEmail) {
        setCanManageAll(false);
        await loadEntries("", false);
        return;
      }

      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("email", sessionEmail);

      if (error) {
        console.error("Erreur permission mail access :", error);
        setCanManageAll(false);
        await loadEntries(sessionEmail, false);
        return;
      }

      const permissions = (data || []).map((item) => item.permission);
      const hasMailAccess =
        permissions.includes("Mail Access") ||
        permissions.includes("Mail Accès") ||
        permissions.includes("/dashboard/mail-acces");

      setCanManageAll(hasMailAccess);
      await loadEntries(sessionEmail, hasMailAccess);
    }

    loadManagePermission();
  }, [sessionEmail]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (
      !form.license.trim() ||
      !form.boutiqueId.trim() ||
      !form.discordName.trim() ||
      !form.email.trim()
    ) {
      setMessage("Merci de remplir les 4 champs.");
      return;
    }

    const payload = {
      license: form.license.trim(),
      boutique_id: form.boutiqueId.trim(),
      discord_name: form.discordName.trim(),
      email: form.email.trim().toLowerCase(),
      created_by: sessionEmail || null,
    };

    const { error } = await supabase.from("license_entries").insert([payload]);

    if (error) {
      console.error("Erreur ajout licence :", error);
      setMessage("Impossible d’ajouter la licence.");
      return;
    }

    setForm({
      license: "",
      boutiqueId: "",
      discordName: "",
      email: "",
    });

    setMessage("Licence ajoutée avec succès.");
    await loadEntries();
  }

  async function handleDelete(entry: LicenseEntry) {
    const canDelete =
      canManageAll ||
      (entry.created_by &&
        sessionEmail &&
        entry.created_by.toLowerCase() === sessionEmail.toLowerCase()) ||
      (entry.email &&
        sessionEmail &&
        entry.email.toLowerCase() === sessionEmail.toLowerCase());

    if (!canDelete) {
      setMessage("Tu ne peux supprimer que tes propres licences.");
      return;
    }

    const { error } = await supabase
      .from("license_entries")
      .delete()
      .eq("id", entry.id);

    if (error) {
      console.error("Erreur suppression licence :", error);
      setMessage("Impossible de supprimer la licence.");
      return;
    }

    setMessage("Licence supprimée.");
    await loadEntries();
  }

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;

    const q = normalize(search);

    return entries.filter((entry) =>
      normalize(
        `${entry.license} ${entry.boutique_id} ${entry.discord_name} ${entry.email || ""}`
      ).includes(q)
    );
  }, [entries, search]);

  const stats = useMemo(() => {
    return {
      total: entries.length,
      visible: filteredEntries.length,
      loaded: isLoaded ? "Synchronisée" : "Chargement",
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
            Ajoutez une licence, un ID boutique, un nom Discord et un mail.
            Seule la personne concernée ou les personnes avec la permission
            Mail Access pourront voir les entrées.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Entrées"
          value={stats.total}
          description="Nombre total de licences visibles pour ton compte."
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
          description="Les données sont filtrées selon les permissions."
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
            Merci de remplir correctement les 4 champs avant validation.
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
                placeholder="license:xxxxxxxx"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                ID boutique
              </label>
              <input
                type="text"
                name="boutiqueId"
                value={form.boutiqueId}
                onChange={handleChange}
                placeholder="Boutique ID"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                Nom Discord
              </label>
              <input
                type="text"
                name="discordName"
                value={form.discordName}
                onChange={handleChange}
                placeholder="Pseudo Discord"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                Mail
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="mail@exemple.com"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105"
            >
              <Plus size={16} />
              Enregistrer la licence
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {message}
            </div>
          )}
        </div>

        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Historique
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Licences enregistrées
              </h2>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Rechercher..."
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
                Aucune licence trouvée.
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const canDelete =
                  canManageAll ||
                  (entry.created_by &&
                    sessionEmail &&
                    entry.created_by.toLowerCase() ===
                      sessionEmail.toLowerCase()) ||
                  (entry.email &&
                    sessionEmail &&
                    entry.email.toLowerCase() === sessionEmail.toLowerCase());

                return (
                  <div
                    key={entry.id}
                    className="rounded-[26px] border border-yellow-400/12 bg-[#151515]/92 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                            Licence
                          </p>
                          <p className="mt-1 break-all text-lg font-bold text-white">
                            {entry.license}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                              ID boutique
                            </p>
                            <p className="mt-1 text-sm text-white/85">
                              {entry.boutique_id}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                              Discord
                            </p>
                            <p className="mt-1 text-sm text-white/85">
                              {entry.discord_name}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                              Mail
                            </p>
                            <p className="mt-1 text-sm text-white/85">
                              {entry.email || "Non renseigné"}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-white/40">
                          Ajouté par : {entry.created_by || "inconnu"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/65">
                          {formatDate(entry.created_at)}
                        </span>

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
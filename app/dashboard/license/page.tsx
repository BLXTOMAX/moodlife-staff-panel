"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
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

type FormState = {
  license: string;
  boutiqueId: string;
  discordName: string;
  email: string;
};

const INITIAL_FORM: FormState = {
  license: "",
  boutiqueId: "",
  discordName: "",
  email: "",
};

const MAIL_ACCESS_PERMISSIONS = new Set([
  "Mail Access",
  "Mail Accès",
  "/dashboard/mail-acces",
]);

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

function canDeleteEntry(
  entry: LicenseEntry,
  sessionEmail: string,
  canManageAll: boolean
) {
  if (canManageAll) return true;

  const normalizedSessionEmail = sessionEmail.toLowerCase();

  return Boolean(
    (entry.created_by &&
      normalizedSessionEmail &&
      entry.created_by.toLowerCase() === normalizedSessionEmail) ||
      (entry.email &&
        normalizedSessionEmail &&
        entry.email.toLowerCase() === normalizedSessionEmail)
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  description: string;
  valueClassName?: string;
};

const StatCard = memo(function StatCard({
  label,
  value,
  description,
  valueClassName = "text-yellow-300",
}: StatCardProps) {
  return (
    <div className="rounded-[24px] border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.30)] backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
});

type LicenseCardProps = {
  entry: LicenseEntry;
  canDelete: boolean;
  onDelete: (entry: LicenseEntry) => void;
  isDeleting: boolean;
};

const LicenseCard = memo(function LicenseCard({
  entry,
  canDelete,
  onDelete,
  isDeleting,
}: LicenseCardProps) {
  const formattedDate = useMemo(() => formatDate(entry.created_at), [entry.created_at]);

  return (
    <div className="rounded-[26px] border border-yellow-400/12 bg-[#151515]/92 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.28)]">
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
              <p className="mt-1 text-sm text-white/85">{entry.boutique_id}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                Discord
              </p>
              <p className="mt-1 text-sm text-white/85">{entry.discord_name}</p>
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
            {formattedDate}
          </span>

          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete(entry)}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={16} />
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export default function LicensePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<LicenseEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [canManageAll, setCanManageAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const normalizedSessionEmail = useMemo(
    () => sessionEmail.trim().toLowerCase(),
    [sessionEmail]
  );

  const loadEntries = useCallback(
    async (email: string, canSeeAll: boolean) => {
      try {
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

          query = query.or(`created_by.eq.${email},email.eq.${email}`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erreur chargement licences :", error);
          setMessage("Impossible de charger les licences.");
          return;
        }

        setEntries((data ?? []) as LicenseEntry[]);
      } catch (error) {
        console.error("Erreur chargement licences :", error);
        setMessage("Erreur serveur.");
      } finally {
        setIsLoaded(true);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function initPage() {
      try {
        const email = (getSessionEmail() || "").trim();

        if (cancelled) return;
        setSessionEmail(email);

        if (!email) {
          setCanManageAll(false);
          await loadEntries("", false);
          return;
        }

        const { data, error } = await supabase
          .from("user_permissions")
          .select("permission")
          .eq("email", email);

        if (cancelled) return;

        if (error) {
          console.error("Erreur permission mail access :", error);
          setCanManageAll(false);
          await loadEntries(email, false);
          return;
        }

        const hasMailAccess = (data ?? []).some((item) =>
          MAIL_ACCESS_PERMISSIONS.has(item.permission)
        );

        setCanManageAll(hasMailAccess);
        await loadEntries(email, hasMailAccess);
      } catch (error) {
        if (!cancelled) {
          console.error("Erreur initialisation licences :", error);
          setCanManageAll(false);
          setMessage("Impossible de charger la page.");
          setIsLoaded(true);
        }
      }
    }

    initPage();

    return () => {
      cancelled = true;
    };
  }, [loadEntries]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setMessage("");

      const license = form.license.trim();
      const boutiqueId = form.boutiqueId.trim();
      const discordName = form.discordName.trim();
      const email = form.email.trim().toLowerCase();

      if (!license || !boutiqueId || !discordName || !email) {
        setMessage("Merci de remplir les 4 champs.");
        return;
      }

      setIsSubmitting(true);

      try {
        const payload = {
          license,
          boutique_id: boutiqueId,
          discord_name: discordName,
          email,
          created_by: sessionEmail || null,
        };

        const { error } = await supabase.from("license_entries").insert([payload]);

        if (error) {
          console.error("Erreur ajout licence :", error);
          setMessage("Impossible d’ajouter la licence.");
          return;
        }

        setForm(INITIAL_FORM);
        setMessage("Licence ajoutée avec succès.");
        await loadEntries(sessionEmail, canManageAll);
      } catch (error) {
        console.error("Erreur ajout licence :", error);
        setMessage("Erreur serveur pendant l’ajout.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, sessionEmail, canManageAll, loadEntries]
  );

  const handleDelete = useCallback(
    async (entry: LicenseEntry) => {
      const allowed = canDeleteEntry(entry, normalizedSessionEmail, canManageAll);

      if (!allowed) {
        setMessage("Tu ne peux supprimer que tes propres licences.");
        return;
      }

      setDeletingId(entry.id);

      try {
        const { error } = await supabase
          .from("license_entries")
          .delete()
          .eq("id", entry.id);

        if (error) {
          console.error("Erreur suppression licence :", error);
          setMessage("Impossible de supprimer la licence.");
          return;
        }

        setEntries((prev) => prev.filter((item) => item.id !== entry.id));
        setMessage("Licence supprimée.");
      } catch (error) {
        console.error("Erreur suppression licence :", error);
        setMessage("Erreur serveur pendant la suppression.");
      } finally {
        setDeletingId(null);
      }
    },
    [canManageAll, normalizedSessionEmail]
  );

  const filteredEntries = useMemo(() => {
    const q = normalize(search);

    if (!q) return entries;

    return entries.filter((entry) =>
      normalize(
        `${entry.license} ${entry.boutique_id} ${entry.discord_name} ${entry.email ?? ""}`
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

  const mappedEntries = useMemo(() => {
    return filteredEntries.map((entry) => ({
      entry,
      canDelete: canDeleteEntry(entry, normalizedSessionEmail, canManageAll),
    }));
  }, [filteredEntries, normalizedSessionEmail, canManageAll]);

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
        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm">
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus size={16} />
              {isSubmitting ? "Enregistrement..." : "Enregistrer la licence"}
            </button>
          </form>

          {message ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {message}
            </div>
          ) : null}
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
            ) : mappedEntries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                Aucune licence trouvée.
              </div>
            ) : (
              mappedEntries.map(({ entry, canDelete }) => (
                <LicenseCard
                  key={entry.id}
                  entry={entry}
                  canDelete={canDelete}
                  onDelete={handleDelete}
                  isDeleting={deletingId === entry.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  ExternalLink,
  Mail,
  Plus,
  Search,
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

type StatCardProps = {
  title: string;
  value: string | number;
  valueClassName?: string;
  description: string;
  glowClassName?: string;
};

type MailCardProps = {
  entry: MailEntry;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (entry: MailEntry) => void;
};

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/1-do2eDUT2NaGm6M2Dfeo3emzioXC9_ZUI1AR73dPf6Q/edit?ts=6997074b#response=ACYDBNjJJSdt9HPUf-cnAgsjnAJcB3y5-tdsSEcTZ-pYDCKpuOjp4irIDPPe0Ua4E_gSAsU";
const MAIL_ACCESS_PERMISSION = "/dashboard/mail-acces";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_MESSAGE = "";

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function canDeleteEntry(
  entry: MailEntry,
  sessionEmail: string,
  canManageAll: boolean
) {
  if (canManageAll) return true;
  if (!sessionEmail || !entry.created_by) return false;

  return normalize(entry.created_by) === normalize(sessionEmail);
}

const StatCard = memo(function StatCard({
  title,
  value,
  valueClassName = "text-yellow-300",
  description,
  glowClassName = "from-yellow-500/20 via-yellow-300/10 to-transparent",
}: StatCardProps) {
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
});

const MailCard = memo(function MailCard({
  entry,
  canDelete,
  isDeleting,
  onDelete,
}: MailCardProps) {
  const formattedDate = useMemo(() => formatDate(entry.created_at), [entry.created_at]);

  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-yellow-400/12 bg-[#151515]/92 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition duration-300 hover:border-yellow-300/20 hover:bg-[#171717]/95">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 opacity-80" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex items-center gap-3">
          <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/10 p-3 text-yellow-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Mail className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-white">{entry.email}</p>
            <p className="mt-1 text-xs text-white/45">Ajouté le {formattedDate}</p>
            <p className="mt-1 truncate text-xs text-white/40">
              Ajouté par : {entry.created_by || "inconnu"}
            </p>
          </div>
        </div>

        {canDelete ? (
          <button
            type="button"
            onClick={() => onDelete(entry)}
            disabled={isDeleting}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={16} />
            {isDeleting ? "Suppression..." : "Supprimer"}
          </button>
        ) : null}
      </div>
    </div>
  );
});

export default function MailPage() {
  const [email, setEmail] = useState(EMPTY_MESSAGE);
  const [search, setSearch] = useState(EMPTY_MESSAGE);
  const [entries, setEntries] = useState<MailEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState(EMPTY_MESSAGE);
  const [sessionEmail, setSessionEmail] = useState(EMPTY_MESSAGE);
  const [canManageAll, setCanManageAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const normalizedSessionEmail = useMemo(() => normalize(sessionEmail), [sessionEmail]);
  const normalizedSearch = useMemo(() => normalize(search), [search]);

  const loadEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from("suicide_rp_mails")
      .select("id, email, created_at, created_by")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as MailEntry[];
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initPage() {
      try {
        setMessage(EMPTY_MESSAGE);

        const currentSessionEmail = (getSessionEmail() || EMPTY_MESSAGE).trim();
        if (ignore) return;

        setSessionEmail(currentSessionEmail);

        let hasManageAll = false;

        if (currentSessionEmail) {
          const { data, error } = await supabase
            .from("user_permissions")
            .select("permission")
            .eq("email", currentSessionEmail);

          if (!ignore && !error) {
            hasManageAll = (data ?? []).some(
              (item) => item.permission === MAIL_ACCESS_PERMISSION
            );
          }

          if (!ignore && error) {
            console.error("Erreur permission mail-acces :", error);
          }
        }

        if (ignore) return;
        setCanManageAll(hasManageAll);

        const rows = await loadEntries();
        if (ignore) return;
        setEntries(rows);
      } catch (error) {
        if (ignore) return;
        console.error("Erreur initialisation mails :", error);
        setMessage("Impossible de charger les adresses mail.");
      } finally {
        if (!ignore) setIsLoaded(true);
      }
    }

    initPage();

    return () => {
      ignore = true;
    };
  }, [loadEntries]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setMessage(EMPTY_MESSAGE);

      const cleanEmail = normalize(email);

      if (!cleanEmail) {
        setMessage("Merci de renseigner une adresse mail.");
        return;
      }

      if (!EMAIL_REGEX.test(cleanEmail)) {
        setMessage("Merci d’entrer une adresse mail valide.");
        return;
      }

      const alreadyExists = entries.some((entry) => normalize(entry.email) === cleanEmail);
      if (alreadyExists) {
        setMessage("Cette adresse mail est déjà enregistrée.");
        return;
      }

      setIsSubmitting(true);

      try {
        const { data, error } = await supabase
          .from("suicide_rp_mails")
          .insert([
            {
              email: cleanEmail,
              created_by: normalizedSessionEmail || null,
            },
          ])
          .select("id, email, created_at, created_by")
          .single();

        if (error) throw error;

        setEntries((prev) => [data as MailEntry, ...prev]);
        setEmail(EMPTY_MESSAGE);
        setMessage("Adresse mail enregistrée avec succès.");
      } catch (error: any) {
        console.error("Erreur ajout mail :", error);

        const errorMessage = String(error?.message || EMPTY_MESSAGE).toLowerCase();
        if (errorMessage.includes("duplicate") || errorMessage.includes("unique")) {
          setMessage("Cette adresse mail est déjà enregistrée.");
        } else {
          setMessage("Impossible d’enregistrer cette adresse mail.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, entries, normalizedSessionEmail]
  );

  const handleDelete = useCallback(
    async (entry: MailEntry) => {
      const allowed = canDeleteEntry(entry, normalizedSessionEmail, canManageAll);

      if (!allowed) {
        setMessage("Tu ne peux supprimer que les mails que tu as ajoutés.");
        return;
      }

      setMessage(EMPTY_MESSAGE);
      setDeletingId(entry.id);

      try {
        const { error } = await supabase
          .from("suicide_rp_mails")
          .delete()
          .eq("id", entry.id);

        if (error) throw error;

        setEntries((prev) => prev.filter((item) => item.id !== entry.id));
        setMessage("Adresse mail supprimée. L’accès au Google Form est retiré.");
      } catch (error) {
        console.error("Erreur suppression mail :", error);
        setMessage("Impossible de supprimer cette adresse mail.");
      } finally {
        setDeletingId(null);
      }
    },
    [canManageAll, normalizedSessionEmail]
  );

  const filteredEntries = useMemo(() => {
    if (!normalizedSearch) return entries;

    return entries.filter(
      (entry) =>
        normalize(entry.email).includes(normalizedSearch) ||
        normalize(entry.created_by || EMPTY_MESSAGE).includes(normalizedSearch)
    );
  }, [entries, normalizedSearch]);

  const hasAccess = useMemo(() => {
    if (!normalizedSessionEmail) return false;

    return entries.some((entry) => normalize(entry.email) === normalizedSessionEmail);
  }, [entries, normalizedSessionEmail]);

  const stats = useMemo(
    () => ({
      total: entries.length,
      visible: filteredEntries.length,
      access: hasAccess ? "Actif" : "Bloqué",
    }),
    [entries.length, filteredEntries.length, hasAccess]
  );

  const mappedEntries = useMemo(
    () =>
      filteredEntries.map((entry) => ({
        entry,
        canDelete: canDeleteEntry(entry, normalizedSessionEmail, canManageAll),
      })),
    [filteredEntries, normalizedSessionEmail, canManageAll]
  );

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
            Pour accéder au Google Form de Suicide RP, l’adresse mail doit être enregistrée.
            Cette liste est synchronisée pour tout le staff.
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
          description="Le formulaire est accessible seulement si ton mail est dans la liste."
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
            L’adresse mail est obligatoire pour accéder au Google Form. Toute suppression du mail
            enlève automatiquement l’accès.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden rounded-[30px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="relative mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">Ajout</p>
            <h2 className="mt-2 text-2xl font-black text-white">Ajouter une adresse mail</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Enregistre une adresse mail pour autoriser l’accès au formulaire Suicide RP.
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
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(250,204,21,0.08)]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#fde047,#facc15,#f59e0b)] px-5 py-3 font-bold text-black shadow-[0_12px_24px_rgba(250,204,21,0.18)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus size={16} />
              {isSubmitting ? "Enregistrement..." : "Enregistrer le mail"}
            </button>
          </form>

          {message ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {message}
            </div>
          ) : null}

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

          {!hasAccess ? (
            <p className="mt-3 text-xs leading-5 text-yellow-200/75">
              Ajoute ton adresse mail dans la liste pour débloquer l’accès au formulaire.
            </p>
          ) : null}
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">Liste</p>
              <h2 className="mt-1 text-2xl font-black text-white">Mails enregistrés</h2>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Rechercher un mail ou un auteur..."
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
            ) : mappedEntries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                {normalizedSearch ? "Aucun résultat pour cette recherche." : "Aucun mail enregistré."}
              </div>
            ) : (
              mappedEntries.map(({ entry, canDelete }) => (
                <MailCard
                  key={entry.id}
                  entry={entry}
                  canDelete={canDelete}
                  isDeleting={deletingId === entry.id}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

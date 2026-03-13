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
import { supabase } from "@/lib/supabase";

type AbsenceStatus = "En attente" | "Validée" | "Refusée";

type Absence = {
  id: string;
  staffName: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: AbsenceStatus;
};

type AbsenceRow = {
  id: string;
  staff_name: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: AbsenceStatus;
  created_at?: string;
};

type HeuresStaffRow = {
  id: number;
  semaine: string;
  staff: string;
  lundi: string;
  mardi: string;
  mercredi: string;
  jeudi: string;
  vendredi: string;
  samedi: string;
  dimanche: string;
};

type FormState = {
  staffName: string;
  reason: string;
  startDate: string;
  endDate: string;
};

const SESSION_STORAGE_KEY = "moodlife-session-email";

const DAY_FIELD_BY_INDEX = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
] as const;

const INITIAL_FORM: FormState = {
  staffName: "",
  reason: "",
  startDate: "",
  endDate: "",
};

function formatDate(date: string) {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("fr-FR");
}

function normalizeStaffName(value: string) {
  return (value || "").trim().toLowerCase();
}

function toLocalDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function eachDateBetween(start: string, end: string) {
  const dates: Date[] = [];
  const current = toLocalDateOnly(start);
  const last = toLocalDateOnly(end);

  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function parseWeekLabelRange(label: string, fallbackYear: number) {
  const match = (label || "")
    .trim()
    .match(/^(\d{2})\/(\d{2})\s+au\s+(\d{2})\/(\d{2})$/i);

  if (!match) return null;

  const startDay = Number(match[1]);
  const startMonth = Number(match[2]);
  const endDay = Number(match[3]);
  const endMonth = Number(match[4]);

  const startYear = fallbackYear;
  let endYear = fallbackYear;

  if (endMonth < startMonth) {
    endYear = fallbackYear + 1;
  }

  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  return { start, end };
}

function findWeekLabelForDate(weekLabels: string[], targetDate: Date) {
  const targetYear = targetDate.getFullYear();

  for (const label of weekLabels) {
    const parsedCurrentYear = parseWeekLabelRange(label, targetYear);
    if (
      parsedCurrentYear &&
      targetDate >= parsedCurrentYear.start &&
      targetDate <= parsedCurrentYear.end
    ) {
      return label;
    }

    const parsedPreviousYear = parseWeekLabelRange(label, targetYear - 1);
    if (
      parsedPreviousYear &&
      targetDate >= parsedPreviousYear.start &&
      targetDate <= parsedPreviousYear.end
    ) {
      return label;
    }

    const parsedNextYear = parseWeekLabelRange(label, targetYear + 1);
    if (
      parsedNextYear &&
      targetDate >= parsedNextYear.start &&
      targetDate <= parsedNextYear.end
    ) {
      return label;
    }
  }

  return null;
}

function mapAbsenceRow(row: AbsenceRow): Absence {
  return {
    id: row.id,
    staffName: row.staff_name,
    reason: row.reason,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
  };
}

function getStatusClasses(status: AbsenceStatus) {
  switch (status) {
    case "Validée":
      return "border-emerald-400/25 bg-emerald-500/15 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]";
    case "Refusée":
      return "border-rose-400/25 bg-rose-500/15 text-rose-200 shadow-[0_0_0_1px_rgba(244,63,94,0.08)]";
    default:
      return "border-amber-300/25 bg-amber-400/15 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]";
  }
}

function getStatusDot(status: AbsenceStatus) {
  switch (status) {
    case "Validée":
      return "bg-emerald-300";
    case "Refusée":
      return "bg-rose-300";
    default:
      return "bg-amber-300";
  }
}

async function syncAbsenceToHeures(absence: Absence, mode: "apply" | "remove") {
  const { data: heuresRows, error } = await supabase
    .from("heures_staff")
    .select(
      "id, semaine, staff, lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche"
    );

  if (error) {
    console.error("Erreur lecture heures_staff :", error);
    return;
  }

  const allRows = (heuresRows || []) as HeuresStaffRow[];

  const matchingStaffRows = allRows.filter(
    (row) =>
      normalizeStaffName(row.staff) === normalizeStaffName(absence.staffName)
  );

  if (matchingStaffRows.length === 0) {
    console.warn(
      "Aucune ligne heures_staff trouvée pour le staff :",
      absence.staffName
    );
    return;
  }

  const distinctWeekLabels = Array.from(
    new Set(
      matchingStaffRows.map((row) => (row.semaine || "").trim()).filter(Boolean)
    )
  );

  const rowByWeekLabel = new Map<string, HeuresStaffRow>();
  for (const row of matchingStaffRows) {
    rowByWeekLabel.set((row.semaine || "").trim(), row);
  }

  const updatesByRowId = new Map<number, Partial<HeuresStaffRow>>();

  for (const date of eachDateBetween(absence.startDate, absence.endDate)) {
    const weekLabel = findWeekLabelForDate(distinctWeekLabels, date);
    if (!weekLabel) continue;

    const rowForWeek = rowByWeekLabel.get(weekLabel);
    if (!rowForWeek) continue;

    const dayField = DAY_FIELD_BY_INDEX[date.getDay()];
    const currentValue = String(rowForWeek[dayField] || "").trim().toLowerCase();

    if (mode === "apply") {
      if (currentValue === "imprévu") continue;
      const currentUpdate = updatesByRowId.get(rowForWeek.id) || {};
      currentUpdate[dayField] = "Imprévu";
      updatesByRowId.set(rowForWeek.id, currentUpdate);
    } else {
      if (currentValue !== "imprévu") continue;
      const currentUpdate = updatesByRowId.get(rowForWeek.id) || {};
      currentUpdate[dayField] = "";
      updatesByRowId.set(rowForWeek.id, currentUpdate);
    }
  }

  await Promise.all(
    Array.from(updatesByRowId.entries()).map(async ([rowId, fieldsToUpdate]) => {
      const { error: updateError } = await supabase
        .from("heures_staff")
        .update(fieldsToUpdate)
        .eq("id", rowId);

      if (updateError) {
        console.error(`Erreur mise à jour heures_staff ligne ${rowId} :`, updateError);
      }
    })
  );
}

const StatCard = memo(function StatCard({
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
    <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.32)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${glowClassName} opacity-80 blur-2xl transition group-hover:opacity-100`}
      />
      <div className="relative">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
          {title}
        </p>
        <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
        <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
      </div>
    </div>
  );
});

const AbsenceCard = memo(function AbsenceCard({
  absence,
  canValidateAbsences,
  canDeleteAbsences,
  onValidate,
  onRefuse,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  absence: Absence;
  canValidateAbsences: boolean;
  canDeleteAbsences: boolean;
  onValidate: (absence: Absence) => void;
  onRefuse: (absence: Absence) => void;
  onDelete: (absence: Absence) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.20)] transition duration-300 hover:-translate-y-0.5 hover:border-yellow-300/20">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 opacity-80" />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-yellow-400/5 via-fuchsia-400/5 to-cyan-400/5 opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-bold text-white">{absence.staffName}</p>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/50">
              Staff
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-white/70">{absence.reason}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-cyan-100">
              Du {formatDate(absence.startDate)}
            </span>
            <span className="rounded-full border border-fuchsia-300/15 bg-fuchsia-400/10 px-3 py-1 text-fuchsia-100">
              Au {formatDate(absence.endDate)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
              absence.status
            )}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${getStatusDot(absence.status)}`}
            />
            {absence.status}
          </span>

          {canValidateAbsences && absence.status === "En attente" ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onValidate(absence)}
                disabled={isUpdating}
                className="rounded-xl border border-emerald-400/15 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "..." : "Valider"}
              </button>

              <button
                type="button"
                onClick={() => onRefuse(absence)}
                disabled={isUpdating}
                className="rounded-xl border border-rose-400/15 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "..." : "Refuser"}
              </button>
            </div>
          ) : null}

          {canDeleteAbsences ? (
            <button
              type="button"
              onClick={() => onDelete(absence)}
              disabled={isDeleting}
              className="rounded-xl border border-red-400/15 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export default function AbsenceStaffPage() {
  const [canValidateAbsences, setCanValidateAbsences] = useState(false);
  const [canDeleteAbsences, setCanDeleteAbsences] = useState(false);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAbsences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("absences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement absences :", error);
        return;
      }

      setAbsences(((data || []) as AbsenceRow[]).map(mapAbsenceRow));
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initPage() {
      try {
        const sessionEmail = localStorage.getItem(SESSION_STORAGE_KEY);

        if (!sessionEmail) {
          if (!cancelled) {
            setCanValidateAbsences(false);
            setCanDeleteAbsences(false);
          }
          await loadAbsences();
          return;
        }

        const { data: permissionRows, error: permissionError } = await supabase
          .from("user_permissions")
          .select("permission")
          .eq("email", sessionEmail);

        if (!cancelled) {
          if (permissionError) {
            console.error("Erreur lecture permissions absence :", permissionError);
            setCanValidateAbsences(false);
            setCanDeleteAbsences(false);
          } else {
            const permissions = (permissionRows || []).map((row) => row.permission);
            const hasMailAccess = permissions.includes("Mail Accès");
            const hasAbsenceValidation = permissions.includes("absence-validation");
            const allowed = hasMailAccess || hasAbsenceValidation;

            setCanValidateAbsences(allowed);
            setCanDeleteAbsences(allowed);
          }
        }

        await loadAbsences();
      } catch (error) {
        console.error("Erreur initialisation absence :", error);
        if (!cancelled) {
          setCanValidateAbsences(false);
          setCanDeleteAbsences(false);
        }
      }
    }

    initPage();

    return () => {
      cancelled = true;
    };
  }, [loadAbsences]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!form.staffName || !form.reason || !form.startDate || !form.endDate) {
        alert("Remplis tous les champs.");
        return;
      }

      if (new Date(form.endDate) < new Date(form.startDate)) {
        alert("La date de fin ne peut pas être avant la date de début.");
        return;
      }

      setIsSubmitting(true);

      try {
        const sessionEmail = localStorage.getItem(SESSION_STORAGE_KEY);

        const payload = {
          staff_name: form.staffName,
          reason: form.reason,
          start_date: form.startDate,
          end_date: form.endDate,
          status: "En attente" as AbsenceStatus,
          created_by_email: sessionEmail,
        };

        const { data, error } = await supabase
          .from("absences")
          .insert(payload)
          .select("*")
          .single();

        if (error) {
          console.error("Erreur création absence :", error);
          alert("Erreur lors de la création de l'absence.");
          return;
        }

        setForm(INITIAL_FORM);
        setAbsences((prev) => [mapAbsenceRow(data as AbsenceRow), ...prev]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form]
  );

  const updateAbsenceStatus = useCallback(
    async (absence: Absence, status: "Validée" | "Refusée") => {
      setUpdatingId(absence.id);

      try {
        const { error } = await supabase
          .from("absences")
          .update({ status })
          .eq("id", absence.id);

        if (error) {
          console.error("Erreur validation absence :", error);
          alert("Erreur lors de la mise à jour du statut.");
          return;
        }

        if (status === "Validée") {
          await syncAbsenceToHeures(absence, "apply");
        }

        setAbsences((prev) =>
          prev.map((item) =>
            item.id === absence.id ? { ...item, status } : item
          )
        );
      } finally {
        setUpdatingId(null);
      }
    },
    []
  );

  const deleteAbsence = useCallback(
    async (absence: Absence) => {
      if (!canDeleteAbsences) {
        alert("Tu n'as pas la permission pour supprimer une absence.");
        return;
      }

      const confirmed = window.confirm(
        `Supprimer l'absence de ${absence.staffName} du ${formatDate(
          absence.startDate
        )} au ${formatDate(absence.endDate)} ?`
      );

      if (!confirmed) return;

      setDeletingId(absence.id);

      try {
        if (absence.status === "Validée") {
          await syncAbsenceToHeures(absence, "remove");
        }

        const { error } = await supabase
          .from("absences")
          .delete()
          .eq("id", absence.id);

        if (error) {
          console.error("Erreur suppression absence :", error);
          alert("Erreur lors de la suppression de l'absence.");
          return;
        }

        setAbsences((prev) => prev.filter((item) => item.id !== absence.id));
      } finally {
        setDeletingId(null);
      }
    },
    [canDeleteAbsences]
  );

  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, Absence[]>();

    for (const absence of absences) {
      const date = new Date(absence.startDate);
      const monthLabel = date.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });

      if (!groups.has(monthLabel)) groups.set(monthLabel, []);
      groups.get(monthLabel)!.push(absence);
    }

    return Array.from(groups.entries());
  }, [absences]);

  const stats = useMemo(() => {
    const pending = absences.filter((a) => a.status === "En attente").length;
    const validated = absences.filter((a) => a.status === "Validée").length;
    const refused = absences.filter((a) => a.status === "Refusée").length;

    return {
      total: absences.length,
      pending,
      validated,
      refused,
    };
  }, [absences]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(135deg,rgba(0,0,0,0.95),rgba(17,17,17,0.82),rgba(9,9,11,0.96))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.48)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.03),transparent,rgba(255,255,255,0.02))]" />
        <div className="absolute -left-14 top-0 h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-fuchsia-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-400/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.9)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-yellow-200">
              Absence Staff
            </p>
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)] md:text-5xl">
            Gestion des absences
          </h1>

          <div className="mt-4 h-px w-52 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/78 md:text-[15px]">
            Les absences doivent concerner une ou plusieurs journées complètes,
            jamais une soirée ou un après-midi.
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          title="Total"
          value={stats.total}
          valueClassName="text-white"
          description="Nombre total d’absences enregistrées."
          glowClassName="from-white/10 via-slate-300/5 to-transparent"
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          valueClassName="text-amber-200"
          description="Demandes encore en attente de traitement."
          glowClassName="from-amber-400/20 via-yellow-300/10 to-transparent"
        />
        <StatCard
          title="Validées"
          value={stats.validated}
          valueClassName="text-emerald-200"
          description="Absences déjà approuvées."
          glowClassName="from-emerald-400/20 via-green-300/10 to-transparent"
        />
        <StatCard
          title="Refusées"
          value={stats.refused}
          valueClassName="text-rose-200"
          description="Absences refusées."
          glowClassName="from-rose-400/20 via-pink-300/10 to-transparent"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-fuchsia-400/10 blur-3xl" />

          <div className="relative mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-200/80">
              Déclaration
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Déclarer une absence
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Remplis les informations du staff concerné ainsi que la période
              complète de son absence.
            </p>
          </div>

          <div className="relative mb-5 rounded-2xl border border-amber-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.14),rgba(244,114,182,0.08))] p-4 text-sm leading-6 text-amber-100 shadow-[0_10px_22px_rgba(0,0,0,0.18)]">
            <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/90">
              Important
            </span>
            <p>
              Le nom du staff doit être écrit{" "}
              <span className="font-bold">exactement pareil que sur Discord</span>{" "}
              pour que l’absence validée puisse remplir automatiquement{" "}
              <span className="font-bold">Heures staff</span>.
            </p>
            <p className="mt-2 text-amber-100/85">
              Exemple : <span className="font-bold">[A] Tom</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                Nom du staff
              </label>
              <input
                type="text"
                name="staffName"
                value={form.staffName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-300/40 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(250,204,21,0.08)]"
                placeholder="Ex : [A] Tom"
              />
              <p className="mt-2 text-xs leading-5 text-yellow-200/70">
                Mets exactement le même nom que sur Discord, avec les crochets
                et le grade si besoin.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                Pourquoi il est absent
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={5}
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-fuchsia-300/35 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(217,70,239,0.08)]"
                placeholder="Explique la raison..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Date de début
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-300/35 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Date de fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-300/35 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#facc15,#f59e0b,#fb7185)] px-5 py-3 text-sm font-black text-black shadow-[0_14px_28px_rgba(250,204,21,0.18)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
            >
              <span className="transition group-hover:translate-x-0.5">
                {isSubmitting ? "Envoi..." : "Envoyer l’absence"}
              </span>
            </button>
          </form>
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <div className="absolute right-10 top-0 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-fuchsia-400/10 blur-3xl" />

          <div className="relative mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-200/80">
              Historique
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Calendrier / Absences enregistrées
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Retrouve les absences classées par mois avec leur statut et leur
              période.
            </p>
          </div>

          <div className="relative space-y-6">
            {!isLoaded ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-8 text-center text-sm text-white/60">
                Chargement...
              </div>
            ) : groupedByMonth.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-8 text-center text-sm text-white/60">
                <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
                Aucune absence enregistrée.
              </div>
            ) : (
              groupedByMonth.map(([month, items]) => (
                <div key={month}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 bg-clip-text text-sm font-black uppercase tracking-[0.22em] text-transparent">
                      {month}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      {items.length} absence{items.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((absence) => (
                      <AbsenceCard
                        key={absence.id}
                        absence={absence}
                        canValidateAbsences={canValidateAbsences}
                        canDeleteAbsences={canDeleteAbsences}
                        onValidate={(item) => updateAbsenceStatus(item, "Validée")}
                        onRefuse={(item) => updateAbsenceStatus(item, "Refusée")}
                        onDelete={deleteAbsence}
                        isUpdating={updatingId === absence.id}
                        isDeleting={deletingId === absence.id}
                      />
                    ))}
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
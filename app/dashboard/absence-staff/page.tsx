"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Absence = {
  id: string;
  staffName: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: "En attente" | "Validée" | "Refusée";
};

const ACCESS_STORAGE_KEY = "moodlife-user-access";
const SESSION_STORAGE_KEY = "moodlife-session-email";

function formatDate(date: string) {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("fr-FR");
}

function getStatusClasses(status: Absence["status"]) {
  switch (status) {
    case "Validée":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    case "Refusée":
      return "border-red-400/20 bg-red-500/10 text-red-300";
    default:
      return "border-yellow-400/20 bg-yellow-500/10 text-yellow-300";
  }
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

export default function AbsenceStaffPage() {
  const [canValidateAbsences, setCanValidateAbsences] = useState(false);

  const [form, setForm] = useState({
    staffName: "",
    reason: "",
    startDate: "",
    endDate: "",
  });

  const [absences, setAbsences] = useState<Absence[]>([]);

  useEffect(() => {
  try {
    const sessionEmail = localStorage.getItem(SESSION_STORAGE_KEY);
    const savedAccess = localStorage.getItem(ACCESS_STORAGE_KEY);

    console.log("sessionEmail =", sessionEmail);
    console.log("savedAccess =", savedAccess);

    if (!sessionEmail || !savedAccess) {
      setCanValidateAbsences(false);
      return;
    }

    const accessMap = JSON.parse(savedAccess) as Record<string, string[]>;
    const permissions = accessMap[sessionEmail] ?? [];

    console.log("permissions =", permissions);

    setCanValidateAbsences(permissions.includes("absence-validation"));
  } catch (error) {
    console.error("Erreur lecture permissions absence :", error);
    setCanValidateAbsences(false);
  }
}, []);

  useEffect(() => {
  async function loadAbsences() {
    const { data, error } = await supabase
      .from("absences")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement absences :", error);
      return;
    }

    setAbsences(
      (data || []).map((a) => ({
        id: a.id,
        staffName: a.staff_name,
        reason: a.reason,
        startDate: a.start_date,
        endDate: a.end_date,
        status: a.status,
      }))
    );
  }

  loadAbsences();
}, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.staffName || !form.reason || !form.startDate || !form.endDate) {
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      alert("La date de fin ne peut pas être avant la date de début.");
      return;
    }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!form.staffName || !form.reason || !form.startDate || !form.endDate) {
    return;
  }

  if (new Date(form.endDate) < new Date(form.startDate)) {
    alert("La date de fin ne peut pas être avant la date de début.");
    return;
  }

  const { error } = await supabase.from("absences").insert({
    staff_name: form.staffName,
    reason: form.reason,
    start_date: form.startDate,
    end_date: form.endDate,
    status: "En attente",
    created_by_email: localStorage.getItem("moodlife-session-email"),
  });

  if (error) {
    console.error("Erreur création absence :", error);
    alert("Erreur lors de la création de l'absence");
    return;
  }

  location.reload();
}

location.reload();

    setForm({
      staffName: "",
      reason: "",
      startDate: "",
      endDate: "",
    });
  }

  async function updateAbsenceStatus(
  id: string,
  status: "Validée" | "Refusée"
) {
  const { error } = await supabase
    .from("absences")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Erreur validation absence:", error);
    return;
  }

  location.reload();
}

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Absence[]> = {};

    for (const absence of absences) {
      const date = new Date(absence.startDate);
      const monthLabel = date.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthLabel]) groups[monthLabel] = [];
      groups[monthLabel].push(absence);
    }

    return groups;
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
      <section className="relative overflow-hidden rounded-[32px] border border-yellow-400/15 bg-gradient-to-r from-black/80 via-black/70 to-black/40 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
            Absence Staff
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Gestion des absences
          </h1>

          <div className="mt-4 h-px w-44 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82">
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
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          valueClassName="text-yellow-300"
          description="Demandes encore en attente de traitement."
        />
        <StatCard
          title="Validées"
          value={stats.validated}
          valueClassName="text-emerald-300"
          description="Absences déjà approuvées."
        />
        <StatCard
          title="Refusées"
          value={stats.refused}
          valueClassName="text-red-300"
          description="Absences refusées."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
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

          <div className="mb-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-200">
            Important : ce formulaire concerne uniquement des journées complètes.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                Nom du staff
              </label>
              <input
                type="text"
                name="staffName"
                value={form.staffName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
                placeholder="Ex : Pariss"
              />
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
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/45"
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
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-yellow-400/30 focus:bg-black/45"
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
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-yellow-400/30 focus:bg-black/45"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:brightness-105 md:w-auto"
            >
              Envoyer l’absence
            </button>
          </form>
        </div>

        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
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

          <div className="space-y-6">
            {Object.entries(groupedByMonth).map(([month, items]) => (
              <div key={month}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-[0.22em] text-yellow-300">
                    {month}
                  </h3>
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/55">
                    {items.length} absence{items.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((absence) => (
                    <div
                      key={absence.id}
                      className="rounded-[24px] border border-white/10 bg-black/25 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition hover:border-yellow-400/20 hover:bg-black/30"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-white">
                            {absence.staffName}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-white/70">
                            {absence.reason}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                              Du {formatDate(absence.startDate)}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                              Au {formatDate(absence.endDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                              absence.status
                            )}`}
                          >
                            {absence.status}
                          </span>

                          {canValidateAbsences &&
                            absence.status === "En attente" && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateAbsenceStatus(absence.id, "Validée")
                                  }
                                  className="rounded-xl bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/30"
                                >
                                  Valider
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateAbsenceStatus(absence.id, "Refusée")
                                  }
                                  className="rounded-xl bg-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/30"
                                >
                                  Refuser
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {absences.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-white/60">
                Aucune absence enregistrée.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
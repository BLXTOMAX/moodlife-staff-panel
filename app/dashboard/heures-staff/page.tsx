"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  ChevronDown,
  CopyPlus,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Users,
} from "lucide-react";

type DayKey = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

type StaffRole =
  | "Gérant-Staff"
  | "Super-Administrateur"
  | "Administrateur"
  | "Modérateur";

type StaffRow = {
  id: number;
  name: string;
  role: StaffRole;
  hours: Record<DayKey, string>;
  reports: Record<DayKey, number>;
};

type WeekRecord = {
  id: string;
  label: string;
  rows: StaffRow[];
  nextId: number;
  createdAt: string;
};

type HoursStorage = {
  weeks: WeekRecord[];
  activeWeekId: string | null;
};

const STORAGE_KEY = "moodlife-staff-weeks";

const DAY_KEYS: DayKey[] = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const DAY_LABELS: Record<DayKey, string> = {
  lun: "Lun",
  mar: "Mar",
  mer: "Mer",
  jeu: "Jeu",
  ven: "Ven",
  sam: "Sam",
  dim: "Dim",
};

const ROLES: StaffRole[] = [
  "Gérant-Staff",
  "Super-Administrateur",
  "Administrateur",
  "Modérateur",
];

const DEFAULT_HOURS: Record<DayKey, string> = {
  lun: "",
  mar: "",
  mer: "",
  jeu: "",
  ven: "",
  sam: "",
  dim: "",
};

const DEFAULT_REPORTS: Record<DayKey, number> = {
  lun: 0,
  mar: 0,
  mer: 0,
  jeu: 0,
  ven: 0,
  sam: 0,
  dim: 0,
};

function parseHourToMinutes(value: string) {
  const clean = value.trim().toLowerCase();
  if (!clean || clean === "0" || clean === "imprévu" || clean === "imprevu") {
    return 0;
  }

  const match = clean.match(/^(\d{1,2})[:h](\d{1,2})$/);
  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  }

  const asNumber = Number(clean.replace(",", "."));
  if (!Number.isNaN(asNumber)) {
    return Math.round(asNumber * 60);
  }

  return 0;
}

function formatMinutes(total: number) {
  const safe = Math.max(0, total);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

function emptyRow(id: number): StaffRow {
  return {
    id,
    name: "",
    role: "Modérateur",
    hours: { ...DEFAULT_HOURS },
    reports: { ...DEFAULT_REPORTS },
  };
}

function createWeekFromLabel(label: string): WeekRecord {
  return {
    id: crypto.randomUUID(),
    label,
    rows: [],
    nextId: 1,
    createdAt: new Date().toISOString(),
  };
}

function StatCard({
  title,
  value,
  subtitle,
  valueClassName = "text-white",
}: {
  title: string;
  value: string;
  subtitle: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-3xl border border-yellow-400/15 bg-[#090909] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/80">
        {title}
      </p>
      <p className={`mt-4 text-4xl font-black ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{subtitle}</p>
    </div>
  );
}

function hoursForRow(row: StaffRow) {
  return DAY_KEYS.reduce((sum, day) => sum + parseHourToMinutes(row.hours[day]), 0);
}

function reportsForRow(row: StaffRow) {
  return DAY_KEYS.reduce((sum, day) => sum + (Number(row.reports[day]) || 0), 0);
}

export default function HeuresStaffPage() {
  const [storage, setStorage] = useState<HoursStorage>({
    weeks: [],
    activeWeekId: null,
  });
  const [weekMenuOpen, setWeekMenuOpen] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialWeek = createWeekFromLabel("Semaine du 01/01 au 07/01");
      setStorage({
        weeks: [initialWeek],
        activeWeekId: initialWeek.id,
      });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as HoursStorage;
      if (!parsed.weeks?.length) {
        const initialWeek = createWeekFromLabel("Semaine du 01/01 au 07/01");
        setStorage({
          weeks: [initialWeek],
          activeWeekId: initialWeek.id,
        });
        return;
      }

      setStorage({
        weeks: parsed.weeks,
        activeWeekId: parsed.activeWeekId ?? parsed.weeks[0].id,
      });
    } catch {
      const initialWeek = createWeekFromLabel("Semaine du 01/01 au 07/01");
      setStorage({
        weeks: [initialWeek],
        activeWeekId: initialWeek.id,
      });
    }
  }, []);

  useEffect(() => {
    if (!storage.weeks.length) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  }, [storage]);

  const activeWeek = useMemo(
    () => storage.weeks.find((week) => week.id === storage.activeWeekId) ?? null,
    [storage]
  );

  const groupedRows = useMemo(() => {
    const base = Object.fromEntries(ROLES.map((role) => [role, [] as StaffRow[]])) as Record<
      StaffRole,
      StaffRow[]
    >;

    if (!activeWeek) return base;

    for (const row of activeWeek.rows) {
      base[row.role].push(row);
    }

    return base;
  }, [activeWeek]);

  const stats = useMemo(() => {
    const rows = activeWeek?.rows ?? [];
    const staffCount = rows.length;
    const totalReports = rows.reduce((sum, row) => sum + reportsForRow(row), 0);
    const totalMinutes = rows.reduce((sum, row) => sum + hoursForRow(row), 0);
    const eligibleCount = rows.filter((row) => hoursForRow(row) >= 600).length;

    return {
      staffCount,
      totalReports,
      totalMinutes,
      eligibleCount,
    };
  }, [activeWeek]);

  function updateStorage(updater: (current: HoursStorage) => HoursStorage) {
    setStorage((current) => updater(current));
  }

  function createWeek() {
    const label = window.prompt(
      "Nom de la semaine ?\nExemple : Semaine du 14/02 au 21/02"
    );

    if (!label?.trim()) return;

    const newWeek = createWeekFromLabel(label.trim());

    updateStorage((current) => ({
      weeks: [newWeek, ...current.weeks],
      activeWeekId: newWeek.id,
    }));

    setWeekMenuOpen(false);
  }

  function duplicateActiveWeek() {
    if (!activeWeek) return;

    const label = window.prompt(
      "Nom de la nouvelle semaine copiée ?",
      `${activeWeek.label} (copie)`
    );

    if (!label?.trim()) return;

    const newWeek: WeekRecord = {
      id: crypto.randomUUID(),
      label: label.trim(),
      rows: activeWeek.rows.map((row) => ({
        ...row,
        hours: { ...row.hours },
        reports: { ...row.reports },
      })),
      nextId: activeWeek.nextId,
      createdAt: new Date().toISOString(),
    };

    updateStorage((current) => ({
      weeks: [newWeek, ...current.weeks],
      activeWeekId: newWeek.id,
    }));

    setWeekMenuOpen(false);
  }

  function deleteActiveWeek() {
    if (!activeWeek) return;
    if (storage.weeks.length <= 1) {
      window.alert("Il faut conserver au moins une semaine.");
      return;
    }

    const confirmed = window.confirm(
      `Supprimer définitivement "${activeWeek.label}" ?`
    );
    if (!confirmed) return;

    const remaining = storage.weeks.filter((week) => week.id !== activeWeek.id);

    updateStorage(() => ({
      weeks: remaining,
      activeWeekId: remaining[0]?.id ?? null,
    }));
  }

  function addStaffRow() {
    if (!activeWeek) return;

    updateStorage((current) => ({
      ...current,
      weeks: current.weeks.map((week) =>
        week.id !== activeWeek.id
          ? week
          : {
              ...week,
              rows: [...week.rows, emptyRow(week.nextId)],
              nextId: week.nextId + 1,
            }
      ),
    }));
  }

  function clearActiveWeek() {
    if (!activeWeek) return;
    const confirmed = window.confirm(
      `Vider toutes les lignes de "${activeWeek.label}" ?`
    );
    if (!confirmed) return;

    updateStorage((current) => ({
      ...current,
      weeks: current.weeks.map((week) =>
        week.id !== activeWeek.id
          ? week
          : {
              ...week,
              rows: [],
              nextId: 1,
            }
      ),
    }));
  }

  function updateRow(rowId: number, updater: (row: StaffRow) => StaffRow) {
    if (!activeWeek) return;

    updateStorage((current) => ({
      ...current,
      weeks: current.weeks.map((week) =>
        week.id !== activeWeek.id
          ? week
          : {
              ...week,
              rows: week.rows.map((row) => (row.id === rowId ? updater(row) : row)),
            }
      ),
    }));
  }

  function removeRow(rowId: number) {
    if (!activeWeek) return;

    updateStorage((current) => ({
      ...current,
      weeks: current.weeks.map((week) =>
        week.id !== activeWeek.id
          ? week
          : {
              ...week,
              rows: week.rows.filter((row) => row.id !== rowId),
            }
      ),
    }));
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-yellow-400/15 bg-gradient-to-r from-[#080808] via-[#090909] to-[#110f05] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-300">
              <CalendarRange className="h-3.5 w-3.5" />
              Gestion staff
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Heures Staff
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 md:text-[15px]">
              Gère plusieurs semaines, saisis les heures au format <span className="text-yellow-300">2:30</span>,
              mets <span className="text-red-300">0</span> pour une absence et{" "}
              <span className="text-sky-300">Imprévu</span> si besoin. Chaque
              semaine est sauvegardée séparément.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={addStaffRow}
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-95"
            >
              <Plus className="h-4 w-4" />
              Ajouter un staff
            </button>

            <button
              onClick={clearActiveWeek}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-3 font-semibold text-red-200 transition hover:bg-red-500/15"
            >
              <Trash2 className="h-4 w-4" />
              Tout vider
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <div className="rounded-3xl border border-yellow-400/15 bg-[#0a0a0a] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/80">
            Semaines
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Gestion hebdomadaire
          </h2>

          <div className="relative mt-5">
            <button
              onClick={() => setWeekMenuOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-300/70">
                  Semaine active
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {activeWeek?.label ?? "Aucune semaine"}
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 text-white/50 transition ${weekMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {weekMenuOpen ? (
              <div className="absolute z-20 mt-3 w-full rounded-2xl border border-white/10 bg-[#111111] p-3 shadow-2xl">
                <div className="space-y-2">
                  {storage.weeks.map((week) => (
                    <button
                      key={week.id}
                      onClick={() => {
                        updateStorage((current) => ({
                          ...current,
                          activeWeekId: week.id,
                        }));
                        setWeekMenuOpen(false);
                      }}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                        week.id === activeWeek?.id
                          ? "border-yellow-400/25 bg-yellow-400/10 text-yellow-200"
                          : "border-white/10 bg-black/20 text-white/75 hover:bg-white/[0.03]"
                      }`}
                    >
                      {week.label}
                    </button>
                  ))}
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <button
                    onClick={createWeek}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-3 text-sm font-semibold text-yellow-200"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle semaine
                  </button>

                  <button
                    onClick={duplicateActiveWeek}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-3 text-sm font-semibold text-sky-200"
                  >
                    <CopyPlus className="h-4 w-4" />
                    Dupliquer
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-yellow-300/70">
                Sauvegarde
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                <Save className="h-4 w-4 text-emerald-300" />
                Automatique dans le navigateur
              </p>
            </div>

            <button
              onClick={deleteActiveWeek}
              className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-left transition hover:bg-red-500/15"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-red-200/80">
                Suppression
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-red-200">
                <RotateCcw className="h-4 w-4" />
                Supprimer la semaine active
              </p>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <StatCard
            title="Staffs"
            value={String(stats.staffCount)}
            subtitle="Nombre total de lignes staff actuellement enregistrées."
          />
          <StatCard
            title="Reports"
            value={String(stats.totalReports)}
            subtitle="Total général des reports renseignés sur toute la semaine."
            valueClassName="text-sky-300"
          />
          <StatCard
            title="Heures totales"
            value={formatMinutes(stats.totalMinutes)}
            subtitle="Temps cumulé de tous les staffs sur la semaine active."
            valueClassName="text-white"
          />
          <StatCard
            title="Règle coins"
            value={`${stats.eligibleCount}`}
            subtitle="Nombre de staffs à 10h ou plus sur la semaine."
            valueClassName="text-pink-300"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-yellow-400/15 bg-[#090909] shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Tableau des heures et reports</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Gère les heures jour par jour, les reports et le grade de chaque
                staff. Les semaines restent séparées pour garder un historique propre.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">
              <Users className="h-3.5 w-3.5" />
              {activeWeek?.label ?? "Aucune semaine"}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1700px] w-full">
            <thead className="bg-black/35">
              <tr className="text-left text-sm text-white/85">
                <th className="px-4 py-4 font-semibold text-yellow-300">Staff</th>
                <th className="px-4 py-4 font-semibold">Grade</th>
                {DAY_KEYS.map((day) => (
                  <th key={day} className="px-4 py-4 font-semibold">
                    {DAY_LABELS[day]}
                  </th>
                ))}
                {DAY_KEYS.map((day) => (
                  <th key={`r-${day}`} className="px-4 py-4 font-semibold text-sky-300">
                    R {DAY_LABELS[day]}
                  </th>
                ))}
                <th className="px-4 py-4 font-semibold">Total h</th>
                <th className="px-4 py-4 font-semibold">Reports</th>
                <th className="px-4 py-4 font-semibold">Coins</th>
                <th className="px-4 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {ROLES.map((role) => {
                const rows = groupedRows[role];

                return (
                  <tbody key={role}>
                    <tr className="border-y border-yellow-400/10 bg-gradient-to-r from-yellow-400/8 to-transparent">
                      <td
                        colSpan={19}
                        className="px-4 py-4 text-sm font-black uppercase tracking-[0.28em] text-yellow-300"
                      >
                        {role}
                      </td>
                    </tr>

                    {rows.length === 0 ? (
                      <tr className="border-b border-white/5">
                        <td colSpan={19} className="px-4 py-6 text-center text-sm text-white/35">
                          Aucun staff dans cette catégorie.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => {
                        const totalMinutes = hoursForRow(row);
                        const totalReports = reportsForRow(row);
                        const hasCoins = totalMinutes >= 600;

                        return (
                          <tr key={row.id} className="border-b border-white/5 align-top">
                            <td className="px-4 py-4">
                              <input
                                value={row.name}
                                onChange={(e) =>
                                  updateRow(row.id, (current) => ({
                                    ...current,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Nom du staff"
                                className="w-[190px] rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25"
                              />
                            </td>

                            <td className="px-4 py-4">
                              <select
                                value={row.role}
                                onChange={(e) =>
                                  updateRow(row.id, (current) => ({
                                    ...current,
                                    role: e.target.value as StaffRole,
                                  }))
                                }
                                className="w-[210px] rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                              >
                                {ROLES.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {DAY_KEYS.map((day) => (
                              <td key={`${row.id}-${day}`} className="px-4 py-4">
                                <input
                                  value={row.hours[day]}
                                  onChange={(e) =>
                                    updateRow(row.id, (current) => ({
                                      ...current,
                                      hours: {
                                        ...current.hours,
                                        [day]: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="2:30"
                                  className="w-[85px] rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25"
                                />
                              </td>
                            ))}

                            {DAY_KEYS.map((day) => (
                              <td key={`${row.id}-r-${day}`} className="px-4 py-4">
                                <input
                                  type="number"
                                  min={0}
                                  value={row.reports[day]}
                                  onChange={(e) =>
                                    updateRow(row.id, (current) => ({
                                      ...current,
                                      reports: {
                                        ...current.reports,
                                        [day]: Number(e.target.value) || 0,
                                      },
                                    }))
                                  }
                                  className="w-[70px] rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                                />
                              </td>
                            ))}

                            <td className="px-4 py-4 text-sm font-semibold text-white">
                              {formatMinutes(totalMinutes)}
                            </td>

                            <td className="px-4 py-4 text-sm font-semibold text-sky-300">
                              {totalReports}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                  hasCoins
                                    ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                                    : "border-red-400/25 bg-red-500/10 text-red-300"
                                }`}
                              >
                                {hasCoins ? "Attribuable" : "< 10h"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <button
                                onClick={() => removeRow(row.id)}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
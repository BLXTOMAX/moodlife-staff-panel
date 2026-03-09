"use client";

import { useEffect, useMemo, useState } from "react";

type StaffRole =
  | "Helper"
  | "Modérateur"
  | "Administrateur"
  | "Super-Administrateur"
  | "Gérant-Staff";

type DayEntry = "" | "0" | "Imprévu" | string;

type StaffRow = {
  id: number;
  name: string;
  role: StaffRole;
  days: DayEntry[];
  reportsDays: number[];
};

const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const STORAGE_KEY = "moodlife-heures-staff";

const roleCoins: Record<StaffRole, number> = {
  Helper: 600,
  "Modérateur": 800,
  Administrateur: 1000,
  "Super-Administrateur": 1500,
  "Gérant-Staff": 1800,
};

const roleColors: Record<StaffRole, string> = {
  Helper: "text-orange-300",
  "Modérateur": "text-green-400",
  Administrateur: "text-sky-400",
  "Super-Administrateur": "text-fuchsia-400",
  "Gérant-Staff": "text-zinc-200",
};

function isTimeFormat(value: string) {
  return /^(\d{1,2}):([0-5]\d)$/.test(value.trim());
}

function timeToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function getRowMinutes(days: DayEntry[]) {
  return days.reduce((acc, value) => {
    if (isTimeFormat(value)) {
      return acc + timeToMinutes(value);
    }
    return acc;
  }, 0);
}

function getReportsTotal(reports: number[]) {
  return reports.reduce((acc, r) => acc + r, 0);
}

function getCoinsLabel(role: StaffRole, totalMinutes: number) {
  if (totalMinutes < 600) {
    return "Pas assez d'heure staff";
  }
  return String(roleCoins[role]);
}

function normalizeCellValue(value: string): DayEntry {
  const trimmed = value.trim();

  if (trimmed === "") return "";
  if (trimmed === "0") return "0";
  if (
    trimmed.toLowerCase() === "imprevu" ||
    trimmed.toLowerCase() === "imprévu"
  ) {
    return "Imprévu";
  }
  if (isTimeFormat(trimmed)) return trimmed;

  return trimmed;
}

function getCellTextClass(value: DayEntry) {
  if (value === "0") return "text-red-400 font-bold";
  if (value === "Imprévu") return "text-blue-400 font-semibold";
  if (isTimeFormat(value)) return "text-white font-semibold";
  if (value === "") return "text-zinc-600";
  return "text-zinc-300";
}

export default function HeuresStaffPage() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  try {
    const parsed = JSON.parse(saved) as {
      rows: StaffRow[];
      nextId: number;
    };

    if (parsed.rows) setRows(parsed.rows);
    if (parsed.nextId) setNextId(parsed.nextId);
  } catch (error) {
    console.error("Erreur chargement heures staff :", error);
  }
}, []);

useEffect(() => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      rows,
      nextId,
    })
  );
}, [rows, nextId]);

  const groupedRows = useMemo(() => {
    const order: StaffRole[] = [
      "Gérant-Staff",
      "Super-Administrateur",
      "Administrateur",
      "Modérateur",
      "Helper",
    ];

    return order.map((role) => ({
      role,
      rows: rows.filter((row) => row.role === role),
    }));
  }, [rows]);

  const totalReports = useMemo(
    () => rows.reduce((acc, row) => acc + getReportsTotal(row.reportsDays), 0),
    [rows]
  );

  function addStaff() {
    setRows((prev) => [
      ...prev,
      {
        id: nextId,
        name: "",
        role: "Helper",
        days: ["", "", "", "", "", "", ""],
        reportsDays: [0, 0, 0, 0, 0, 0, 0],
      },
    ]);
    setNextId((prev) => prev + 1);
  }

  function removeStaff(id: number) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function updateName(id: number, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, name: value } : row))
    );
  }

  function updateRole(id: number, value: StaffRole) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, role: value } : row))
    );
  }

  function updateReportDay(id: number, dayIndex: number, value: string) {
    const parsed = Number(value);

    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const newReports = [...row.reportsDays];
        newReports[dayIndex] = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;

        return {
          ...row,
          reportsDays: newReports,
        };
      })
    );
  }

  function updateDay(id: number, dayIndex: number, value: string) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updatedDays = [...row.days];
        updatedDays[dayIndex] = normalizeCellValue(value);

        return {
          ...row,
          days: updatedDays,
        };
      })
    );
  }

  return (
    <div className="space-y-6">
      <div className="panel-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-400/70">
              Gestion staff
            </p>
            <h1 className="mt-3 text-4xl font-black text-white">
              Heures Staff
            </h1>
            <p className="mt-3 text-zinc-400">
              Ajoute tes staffs, choisis leur grade, remplis les heures et les
              reports jour par jour.
            </p>
          </div>

          <div className="flex gap-3">
  <button
    type="button"
    onClick={addStaff}
    className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105"
  >
    + Ajouter un staff
  </button>

  <button
    type="button"
    onClick={() => {
      setRows([]);
      setNextId(1);
      localStorage.removeItem("moodlife-heures-staff");
    }}
    className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/15"
  >
    Tout vider
  </button>
</div>
        </div>
      </div>

      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[2100px] w-full table-fixed border-collapse">
            <thead className="bg-zinc-900/80">
              <tr className="border-b border-white/10">
                <th className="w-[260px] px-4 py-4 text-left text-sm font-bold text-yellow-400">
                  Staff
                </th>

                {dayLabels.map((day) => (
                  <th
                    key={`hour-${day}`}
                    className="w-[105px] px-3 py-4 text-center text-sm font-bold text-zinc-300"
                  >
                    {day}
                  </th>
                ))}

                {dayLabels.map((day) => (
                  <th
                    key={`report-${day}`}
                    className="w-[105px] px-3 py-4 text-center text-sm font-bold text-cyan-300"
                  >
                    R {day}
                  </th>
                ))}

                <th className="w-[120px] px-3 py-4 text-center text-sm font-bold text-orange-300">
                  Total H
                </th>

                <th className="w-[140px] px-3 py-4 text-center text-sm font-bold text-cyan-300">
                  Total reports
                </th>

                <th className="w-[220px] px-3 py-4 text-center text-sm font-bold text-pink-300">
                  Coins
                </th>

                <th className="w-[110px] px-3 py-4 text-center text-sm font-bold text-zinc-400">
                  Action
                </th>
              </tr>
            </thead>

            {groupedRows.map((group) => (
              <tbody key={group.role}>
                <tr className="border-b border-white/10 bg-zinc-800/70">
                  <td
                    colSpan={18}
                    className="px-4 py-3 text-sm font-black uppercase tracking-[0.25em] text-yellow-300"
                  >
                    {group.role}
                  </td>
                </tr>

                {group.rows.length === 0 ? (
                  <tr className="border-b border-white/5">
                    <td
                      colSpan={18}
                      className="px-4 py-6 text-center text-zinc-500"
                    >
                      Aucun staff dans cette catégorie.
                    </td>
                  </tr>
                ) : (
                  group.rows.map((row) => {
                    const totalMinutes = getRowMinutes(row.days);
                    const totalLabel = formatMinutes(totalMinutes);
                    const reportsTotal = getReportsTotal(row.reportsDays);
                    const coinsLabel = getCoinsLabel(row.role, totalMinutes);

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-white/5 align-top transition hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <input
                              value={row.name}
                              onChange={(e) => updateName(row.id, e.target.value)}
                              placeholder="Pseudo staff"
                              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30"
                            />

                            <select
                              value={row.role}
                              onChange={(e) =>
                                updateRole(row.id, e.target.value as StaffRole)
                              }
                              className={`w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-yellow-400/30 ${roleColors[row.role]}`}
                            >
                              <option value="Helper">Helper</option>
                              <option value="Modérateur">Modérateur</option>
                              <option value="Administrateur">Administrateur</option>
                              <option value="Super-Administrateur">
                                Super-Administrateur
                              </option>
                              <option value="Gérant-Staff">Gérant-Staff</option>
                            </select>
                          </div>
                        </td>

                        {row.days.map((value, dayIndex) => (
                          <td key={`day-${row.id}-${dayIndex}`} className="px-3 py-4 text-center">
                            <input
                              value={value}
                              onChange={(e) =>
                                updateDay(row.id, dayIndex, e.target.value)
                              }
                              placeholder="2:30 / 0"
                              className={`w-full rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-center text-sm outline-none focus:border-yellow-400/30 ${getCellTextClass(
                                value
                              )}`}
                            />
                          </td>
                        ))}

                        {row.reportsDays.map((value, dayIndex) => (
                          <td key={`report-${row.id}-${dayIndex}`} className="px-3 py-4 text-center">
                            <input
                              type="number"
                              min={0}
                              value={value}
                              onChange={(e) =>
                                updateReportDay(row.id, dayIndex, e.target.value)
                              }
                              className="w-full rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-center text-sm font-semibold text-cyan-200 outline-none focus:border-cyan-400/30"
                            />
                          </td>
                        ))}

                        <td className="bg-orange-900/40 px-3 py-4 text-center font-bold text-orange-200">
                          {totalLabel}
                        </td>

                        <td className="bg-cyan-900/30 px-3 py-4 text-center font-bold text-cyan-200">
                          {reportsTotal}
                        </td>

                        <td className="bg-pink-900/30 px-3 py-4 text-center font-bold">
                          {coinsLabel === "Pas assez d'heure staff" ? (
                            <span className="text-red-300">{coinsLabel}</span>
                          ) : (
                            <span className="text-pink-200">{coinsLabel}</span>
                          )}
                        </td>

                        <td className="px-3 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeStaff(row.id)}
                            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                          >
                            Suppr.
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            ))}

            <tfoot>
              <tr className="border-t border-white/10 bg-zinc-900/70">
                <td className="px-4 py-4 text-left text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
                  Total général
                </td>

                {dayLabels.map((day) => (
                  <td key={`footer-hour-${day}`} className="px-3 py-4 text-center text-zinc-600">
                    —
                  </td>
                ))}

                {dayLabels.map((day) => (
                  <td key={`footer-report-${day}`} className="px-3 py-4 text-center text-zinc-600">
                    —
                  </td>
                ))}

                <td className="px-3 py-4 text-center text-zinc-500">—</td>

                <td className="px-3 py-4 text-center font-black text-cyan-300">
                  {totalReports}
                </td>

                <td className="px-3 py-4 text-center text-zinc-500">—</td>
                <td className="px-3 py-4 text-center text-zinc-500">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Règle coins</h2>
          <p className="mt-2 text-sm text-zinc-400">
            En dessous de 10h au total, la colonne coins affiche
            <span className="ml-1 text-red-300">Pas assez d&apos;heure staff</span>.
          </p>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Format heures</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p className="text-white">Heure : 2:30</p>
            <p className="text-red-400">Absence : 0</p>
            <p className="text-blue-400">Absence signalée : Imprévu</p>
          </div>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Reports</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Les reports se remplissent jour par jour, comme les heures.
            Le total reports de chaque staff est calculé automatiquement.
          </p>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Barème coins</h2>
          <div className="mt-3 space-y-2 text-sm text-zinc-300">
            <p>Helper : 600</p>
            <p>Modérateur : 800</p>
            <p>Administrateur : 1000</p>
            <p>Super-Administrateur : 1500</p>
            <p>Gérant-Staff : 1800</p>
          </div>
        </div>
      </div>
    </div>
  );
}
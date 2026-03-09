"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/protected-page";

type Tab = "heures" | "remontees" | "bl";

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

type RemonteeType = "Erreur" | "Point positif";
type PrevenuType = "Oui" | "Non";

type RemonteeRow = {
  id: number;
  staffRemonte: string;
  type: RemonteeType;
  description: string;
  prevenu: PrevenuType;
  auteur: string;
  date: string;
};

type BLStaffRow = {
  id: number;
  pseudo: string;
  discord: string;
  commentaire: string;
  date: string;
  ajoutePar: string;
};

const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const HEURES_STORAGE_KEY = "moodlife-heures-staff";
const REMONTEES_STORAGE_KEY = "moodlife-remontees-staff";
const BL_STORAGE_KEY = "moodlife-bl-staff";

const roleCoins: Record<StaffRole, number> = {
  Helper: 0,
  "Modérateur": 600,
  Administrateur: 800,
  "Super-Administrateur": 1200,
  "Gérant-Staff": 1500,
};

const roleColors: Record<StaffRole, string> = {
  Helper: "text-orange-300",
  "Modérateur": "text-green-400",
  Administrateur: "text-sky-400",
  "Super-Administrateur": "text-fuchsia-400",
  "Gérant-Staff": "text-zinc-100",
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

function hasBonusTag(name: string) {
  const upper = name.toUpperCase();
  return (
    upper.includes("[R-L]") ||
    upper.includes("[R-I]") ||
    upper.includes("[R-E]")
  );
}

function getCoinsLabel(role: StaffRole, totalMinutes: number, name: string) {
  if (totalMinutes < 600) {
    return "Pas assez d'heure staff";
  }

  let coins = roleCoins[role];

  if (hasBonusTag(name)) {
    coins += 200;
  }

  return String(coins);
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
  if (value === "") return "text-zinc-500";
  return "text-zinc-300";
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
  description?: string;
}) {
  return (
    <div className="rounded-[24px] border border-yellow-400/15 bg-[#111111]/85 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
        {title}
      </p>
      <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
      ) : null}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-300/80">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
            {description}
          </p>
        </div>

        {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </div>
    </div>
  );
}

export default function EspaceSAGerantPage() {
  const [activeTab, setActiveTab] = useState<Tab>("heures");

  const [rows, setRows] = useState<StaffRow[]>([]);
  const [nextId, setNextId] = useState(1);

  const [remonteesRows, setRemonteesRows] = useState<RemonteeRow[]>([]);
  const [remonteesNextId, setRemonteesNextId] = useState(1);

  const [blRows, setBlRows] = useState<BLStaffRow[]>([]);
  const [blNextId, setBlNextId] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem(HEURES_STORAGE_KEY);
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
      HEURES_STORAGE_KEY,
      JSON.stringify({
        rows,
        nextId,
      })
    );
  }, [rows, nextId]);

  useEffect(() => {
    const saved = localStorage.getItem(REMONTEES_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        rows: RemonteeRow[];
        nextId: number;
      };

      if (parsed.rows) setRemonteesRows(parsed.rows);
      if (parsed.nextId) setRemonteesNextId(parsed.nextId);
    } catch (error) {
      console.error("Erreur chargement remontées :", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      REMONTEES_STORAGE_KEY,
      JSON.stringify({
        rows: remonteesRows,
        nextId: remonteesNextId,
      })
    );
  }, [remonteesRows, remonteesNextId]);

  useEffect(() => {
    const saved = localStorage.getItem(BL_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        rows: BLStaffRow[];
        nextId: number;
      };

      if (parsed.rows) setBlRows(parsed.rows);
      if (parsed.nextId) setBlNextId(parsed.nextId);
    } catch (error) {
      console.error("Erreur chargement BL staff :", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      BL_STORAGE_KEY,
      JSON.stringify({
        rows: blRows,
        nextId: blNextId,
      })
    );
  }, [blRows, blNextId]);

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

  const totalStaff = useMemo(() => rows.length, [rows]);

  const remonteesStats = useMemo(() => {
    const erreurs = remonteesRows.filter((row) => row.type === "Erreur").length;
    const positifs = remonteesRows.filter(
      (row) => row.type === "Point positif"
    ).length;
    const prevenus = remonteesRows.filter((row) => row.prevenu === "Oui").length;

    return { erreurs, positifs, prevenus };
  }, [remonteesRows]);

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

  function clearHeuresAll() {
    setRows([]);
    setNextId(1);
    localStorage.removeItem(HEURES_STORAGE_KEY);
  }

  function addRemonteeRow() {
    setRemonteesRows((prev) => [
      ...prev,
      {
        id: remonteesNextId,
        staffRemonte: "",
        type: "Erreur",
        description: "",
        prevenu: "Non",
        auteur: "",
        date: "",
      },
    ]);
    setRemonteesNextId((prev) => prev + 1);
  }

  function removeRemonteeRow(id: number) {
    setRemonteesRows((prev) => prev.filter((row) => row.id !== id));
  }

  function updateRemonteeRow<K extends keyof RemonteeRow>(
    id: number,
    field: K,
    value: RemonteeRow[K]
  ) {
    setRemonteesRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  }

  function clearRemonteesAll() {
    setRemonteesRows([]);
    setRemonteesNextId(1);
    localStorage.removeItem(REMONTEES_STORAGE_KEY);
  }

  function addBLRow() {
    setBlRows((prev) => [
      ...prev,
      {
        id: blNextId,
        pseudo: "",
        discord: "",
        commentaire: "",
        date: "",
        ajoutePar: "",
      },
    ]);
    setBlNextId((prev) => prev + 1);
  }

  function removeBLRow(id: number) {
    setBlRows((prev) => prev.filter((row) => row.id !== id));
  }

  function updateBLRow<K extends keyof BLStaffRow>(
    id: number,
    field: K,
    value: BLStaffRow[K]
  ) {
    setBlRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  }

  function clearBLAll() {
    setBlRows([]);
    setBlNextId(1);
    localStorage.removeItem(BL_STORAGE_KEY);
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-yellow-400/15 bg-gradient-to-r from-black/80 via-black/70 to-black/40 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
            Espace privé
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Espace S-A / Gérant-Staff
          </h1>

          <div className="mt-4 h-px w-44 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82">
            Regroupe les outils sensibles : heures staff, remontées
            hebdomadaires et blacklist staff, avec une interface plus claire et
            plus simple à gérer.
          </p>
        </div>
      </section>

      <div className="rounded-[28px] border border-yellow-400/15 bg-[#111111]/88 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setActiveTab("heures")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              activeTab === "heures"
                ? "bg-yellow-400 text-black shadow-[0_8px_24px_rgba(250,204,21,0.25)]"
                : "border border-white/10 bg-black/40 text-zinc-300 hover:bg-white/5"
            }`}
          >
            Heures Staff
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("remontees")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              activeTab === "remontees"
                ? "bg-yellow-400 text-black shadow-[0_8px_24px_rgba(250,204,21,0.25)]"
                : "border border-white/10 bg-black/40 text-zinc-300 hover:bg-white/5"
            }`}
          >
            Remontées
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bl")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              activeTab === "bl"
                ? "bg-yellow-400 text-black shadow-[0_8px_24px_rgba(250,204,21,0.25)]"
                : "border border-white/10 bg-black/40 text-zinc-300 hover:bg-white/5"
            }`}
          >
            BL Staff
          </button>
        </div>
      </div>

      {activeTab === "heures" && (
        <div className="space-y-6">
          <SectionHeader
            eyebrow="Gestion staff"
            title="Heures Staff"
            description="Ajoute tes staffs, choisis leur grade, remplis les heures et les reports jour par jour."
            actions={
              <>
                <button
                  type="button"
                  onClick={addStaff}
                  className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105 sm:w-auto"
                >
                  + Ajouter un staff
                </button>

                <button
                  type="button"
                  onClick={clearHeuresAll}
                  className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/15 sm:w-auto"
                >
                  Tout vider
                </button>
              </>
            }
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard
              title="Staffs"
              value={totalStaff}
              valueClassName="text-white"
              description="Nombre total de lignes staff actuellement enregistrées."
            />
            <StatCard
              title="Reports"
              value={totalReports}
              valueClassName="text-cyan-300"
              description="Total général des reports renseignés sur toute la semaine."
            />
            <StatCard
              title="Règle coins"
              value="10h min"
              valueClassName="text-pink-300"
              description="En dessous de 10 heures au total, aucun coin n’est attribué."
            />
          </div>

          <div className="overflow-hidden rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-sm font-semibold text-white">Tableau des heures et reports</p>
              <p className="mt-1 text-sm text-white/55">
                Remplis les heures au format <span className="text-white">2:30</span>, mets{" "}
                <span className="text-red-300">0</span> pour une absence et{" "}
                <span className="text-blue-300">Imprévu</span> si besoin.
              </p>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="min-w-[2100px] border-collapse">
                <thead className="bg-black/50">
                  <tr className="border-b border-white/10">
                    <th className="w-[260px] px-4 py-4 text-left text-sm font-bold text-yellow-300">
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
                    <tr className="border-b border-white/10 bg-yellow-400/[0.06]">
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
                        const coinsLabel = getCoinsLabel(row.role, totalMinutes, row.name);

                        return (
                          <tr
                            key={row.id}
                            className="border-b border-white/5 align-top transition hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <input
                                  value={row.name}
                                  onChange={(e) =>
                                    updateName(row.id, e.target.value)
                                  }
                                  placeholder="Pseudo staff"
                                  className="w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-400/30"
                                />

                                <select
                                  value={row.role}
                                  onChange={(e) =>
                                    updateRole(
                                      row.id,
                                      e.target.value as StaffRole
                                    )
                                  }
                                  className={`w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm outline-none focus:border-yellow-400/30 ${roleColors[row.role]}`}
                                >
                                  <option value="Helper">Helper</option>
                                  <option value="Modérateur">Modérateur</option>
                                  <option value="Administrateur">
                                    Administrateur
                                  </option>
                                  <option value="Super-Administrateur">
                                    Super-Administrateur
                                  </option>
                                  <option value="Gérant-Staff">
                                    Gérant-Staff
                                  </option>
                                </select>
                              </div>
                            </td>

                            {row.days.map((value, dayIndex) => (
                              <td
                                key={`day-${row.id}-${dayIndex}`}
                                className="px-3 py-4 text-center"
                              >
                                <input
                                  value={value}
                                  onChange={(e) =>
                                    updateDay(row.id, dayIndex, e.target.value)
                                  }
                                  placeholder="2:30 / 0"
                                  className={`w-full rounded-xl border border-white/10 bg-black/35 px-2 py-2.5 text-center text-sm outline-none placeholder:text-white/25 focus:border-yellow-400/30 ${getCellTextClass(
                                    value
                                  )}`}
                                />
                              </td>
                            ))}

                            {row.reportsDays.map((value, dayIndex) => (
                              <td
                                key={`report-${row.id}-${dayIndex}`}
                                className="px-3 py-4 text-center"
                              >
                                <input
                                  type="number"
                                  min={0}
                                  value={value}
                                  onChange={(e) =>
                                    updateReportDay(
                                      row.id,
                                      dayIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-white/10 bg-black/35 px-2 py-2.5 text-center text-sm font-semibold text-cyan-200 outline-none focus:border-cyan-400/30"
                                />
                              </td>
                            ))}

                            <td className="bg-orange-900/30 px-3 py-4 text-center font-bold text-orange-200">
                              {totalLabel}
                            </td>

                            <td className="bg-cyan-900/25 px-3 py-4 text-center font-bold text-cyan-200">
                              {reportsTotal}
                            </td>

                            <td className="bg-pink-900/25 px-3 py-4 text-center font-bold">
                              {coinsLabel === "Pas assez d'heure staff" ? (
                                <span className="text-red-300">
                                  {coinsLabel}
                                </span>
                              ) : (
                                <span className="text-pink-200">
                                  {coinsLabel}
                                </span>
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
                  <tr className="border-t border-white/10 bg-black/45">
                    <td className="px-4 py-4 text-left text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
                      Total général
                    </td>

                    {dayLabels.map((day) => (
                      <td
                        key={`footer-hour-${day}`}
                        className="px-3 py-4 text-center text-zinc-600"
                      >
                        —
                      </td>
                    ))}

                    {dayLabels.map((day) => (
                      <td
                        key={`footer-report-${day}`}
                        className="px-3 py-4 text-center text-zinc-600"
                      >
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
            <StatCard
              title="Format heures"
              value="2:30"
              valueClassName="text-white"
              description="Format attendu pour renseigner une durée de staff."
            />
            <StatCard
              title="Absence"
              value="0"
              valueClassName="text-red-300"
              description="À utiliser lorsqu’un staff n’a fait aucune heure."
            />
            <StatCard
              title="Absence signalée"
              value="Imprévu"
              valueClassName="text-blue-300"
              description="À utiliser lorsqu’une absence a été signalée."
            />
            <StatCard
  title="Barème coins"
  value="0 → 1500"
  valueClassName="text-pink-300"
  description="Bonus +200 si le pseudo contient [R-L], [R-I] ou [R-E], à partir de 10h."
/>
          </div>
        </div>
      )}

      {activeTab === "remontees" && (
        <div className="space-y-6">
          <SectionHeader
            eyebrow="Gestion staff"
            title="Remontées hebdomadaires"
            description="Ajoute les erreurs et points positifs remontés sur les staffs."
            actions={
              <>
                <button
                  type="button"
                  onClick={addRemonteeRow}
                  className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105"
                >
                  + Ajouter une remontée
                </button>

                <button
                  type="button"
                  onClick={clearRemonteesAll}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/15"
                >
                  Tout vider
                </button>
              </>
            }
          />

          <div className="grid gap-4 lg:grid-cols-4">
            <StatCard
              title="Total remontées"
              value={remonteesRows.length}
              valueClassName="text-yellow-300"
            />
            <StatCard
              title="Erreurs"
              value={remonteesStats.erreurs}
              valueClassName="text-red-300"
            />
            <StatCard
              title="Points positifs"
              value={remonteesStats.positifs}
              valueClassName="text-emerald-300"
            />
            <StatCard
              title="Staff prévenus"
              value={remonteesStats.prevenus}
              valueClassName="text-sky-300"
            />
          </div>

          <div className="overflow-hidden rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="min-w-[1400px] border-collapse">
                <thead className="bg-black/50">
                  <tr className="border-b border-white/10">
                    <th className="w-[220px] px-4 py-4 text-left text-sm font-bold text-yellow-300">
                      Staff remonté
                    </th>
                    <th className="w-[170px] px-4 py-4 text-center text-sm font-bold text-zinc-300">
                      Type
                    </th>
                    <th className="w-[520px] px-4 py-4 text-left text-sm font-bold text-zinc-300">
                      Description
                    </th>
                    <th className="w-[140px] px-4 py-4 text-center text-sm font-bold text-zinc-300">
                      Prévenu
                    </th>
                    <th className="w-[200px] px-4 py-4 text-left text-sm font-bold text-zinc-300">
                      Staff qui remonte
                    </th>
                    <th className="w-[170px] px-4 py-4 text-center text-sm font-bold text-zinc-300">
                      Date
                    </th>
                    <th className="w-[120px] px-4 py-4 text-center text-sm font-bold text-zinc-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {remonteesRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-zinc-500"
                      >
                        Aucune remontée pour le moment.
                      </td>
                    </tr>
                  ) : (
                    remonteesRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/5 align-top transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-4">
                          <input
                            value={row.staffRemonte}
                            onChange={(e) =>
                              updateRemonteeRow(
                                row.id,
                                "staffRemonte",
                                e.target.value
                              )
                            }
                            placeholder="Pseudo du staff"
                            className="w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-400/30"
                          />
                        </td>

                        <td className="px-4 py-4 text-center">
                          <select
                            value={row.type}
                            onChange={(e) =>
                              updateRemonteeRow(
                                row.id,
                                "type",
                                e.target.value as RemonteeType
                              )
                            }
                            className={`w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm outline-none focus:border-yellow-400/30 ${
                              row.type === "Erreur"
                                ? "text-red-300"
                                : "text-emerald-300"
                            }`}
                          >
                            <option value="Erreur">Erreur</option>
                            <option value="Point positif">
                              Point positif
                            </option>
                          </select>
                        </td>

                        <td className="px-4 py-4">
                          <textarea
                            value={row.description}
                            onChange={(e) =>
                              updateRemonteeRow(
                                row.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Description détaillée"
                            rows={3}
                            className="w-full resize-none rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-400/30"
                          />
                        </td>

                        <td className="px-4 py-4 text-center">
                          <select
                            value={row.prevenu}
                            onChange={(e) =>
                              updateRemonteeRow(
                                row.id,
                                "prevenu",
                                e.target.value as PrevenuType
                              )
                            }
                            className={`w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm outline-none focus:border-yellow-400/30 ${
                              row.prevenu === "Oui"
                                ? "text-emerald-300"
                                : "text-red-300"
                            }`}
                          >
                            <option value="Oui">Oui</option>
                            <option value="Non">Non</option>
                          </select>
                        </td>

                        <td className="px-4 py-4">
                          <input
                            value={row.auteur}
                            onChange={(e) =>
                              updateRemonteeRow(
                                row.id,
                                "auteur",
                                e.target.value
                              )
                            }
                            placeholder="Auteur de la remontée"
                            className="w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-400/30"
                          />
                        </td>

                        <td className="px-4 py-4 text-center">
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) =>
                              updateRemonteeRow(row.id, "date", e.target.value)
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-400/30"
                          />
                        </td>

                        <td className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeRemonteeRow(row.id)}
                            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                          >
                            Suppr.
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "bl" && (
        <div className="space-y-6">
          <SectionHeader
            eyebrow="Gestion staff"
            title="BL Staff"
            description="Liste les staffs blacklistés avec leur pseudo, Discord, commentaire, date et auteur de l’ajout."
            actions={
              <>
                <button
                  type="button"
                  onClick={addBLRow}
                  className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105"
                >
                  + Ajouter une entrée
                </button>

                <button
                  type="button"
                  onClick={clearBLAll}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/15"
                >
                  Tout vider
                </button>
              </>
            }
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard
              title="Entrées BL"
              value={blRows.length}
              valueClassName="text-yellow-300"
            />
            <StatCard
              title="Sauvegarde"
              value="Active"
              valueClassName="text-emerald-300"
              description="Les données restent enregistrées après un refresh."
            />
            <StatCard
              title="Utilisation"
              value="Historique"
              valueClassName="text-sky-300"
              description="Permet de garder un suivi propre des blacklist staff."
            />
          </div>

          <div className="overflow-hidden rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="min-w-[1400px] border-collapse">
                <thead className="bg-black/50">
                  <tr className="border-b border-white/10">
                    <th className="w-[220px] px-4 py-4 text-left text-sm font-bold text-yellow-300">
                      Pseudo
                    </th>
                    <th className="w-[260px] px-4 py-4 text-left text-sm font-bold text-zinc-300">
                      Discord
                    </th>
                    <th className="w-[520px] px-4 py-4 text-left text-sm font-bold text-zinc-300">
                      Commentaire
                    </th>
                    <th className="w-[180px] px-4 py-4 text-center text-sm font-bold text-zinc-300">
                      Date
                    </th>
                    <th className="w-[220px] px-4 py-4 text-left text-sm font-bold text-zinc-300">
                      Staff qui ajoute
                    </th>
                    <th className="w-[120px] px-4 py-4 text-center text-sm font-bold text-zinc-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {blRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-zinc-500"
                      >
                        Aucune entrée BL pour le moment.
                      </td>
                    </tr>
                  ) : (
                    blRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/5 align-top transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-4">
                          <input
                            value={row.pseudo}
                            onChange={(e) =>
                              updateBLRow(row.id, "pseudo", e.target.value)
                            }
                            placeholder="Pseudo"
                            className="w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-400/30"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <input
                            value={row.discord}
                            onChange={(e) =>
                              updateBLRow(row.id, "discord", e.target.value)
                            }
                            placeholder="ID Discord ou pseudo Discord"
                            className="w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-400/30"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <textarea
                            value={row.commentaire}
                            onChange={(e) =>
                              updateBLRow(row.id, "commentaire", e.target.value)
                            }
                            placeholder="Commentaire"
                            rows={3}
                            className="w-full resize-none rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-400/30"
                          />
                        </td>

                        <td className="px-4 py-4 text-center">
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) =>
                              updateBLRow(row.id, "date", e.target.value)
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-400/30"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <input
                            value={row.ajoutePar}
                            onChange={(e) =>
                              updateBLRow(row.id, "ajoutePar", e.target.value)
                            }
                            placeholder="Staff qui ajoute"
                            className="w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-yellow-400/30"
                          />
                        </td>

                        <td className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeBLRow(row.id)}
                            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                          >
                            Suppr.
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
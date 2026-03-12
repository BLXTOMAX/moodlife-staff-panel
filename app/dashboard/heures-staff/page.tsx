"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

type HeuresRow = {
  id: number;
  semaine: string;
  staff: string;
  role: string;
  lundi: string;
  mardi: string;
  mercredi: string;
  jeudi: string;
  vendredi: string;
  samedi: string;
  dimanche: string;
  reports_lundi: string;
  reports_mardi: string;
  reports_mercredi: string;
  reports_jeudi: string;
  reports_vendredi: string;
  reports_samedi: string;
  reports_dimanche: string;
  total_reports: number;
  total_heures: string;
  paye: number;
  auteur: string;
  isNew?: boolean;
};

const DAY_CONFIG = [
  {
    key: "dimanche" as keyof HeuresRow,
    reportKey: "reports_dimanche" as keyof HeuresRow,
    label: "DIMANCHE",
    short: "DIM",
  },
  {
    key: "lundi" as keyof HeuresRow,
    reportKey: "reports_lundi" as keyof HeuresRow,
    label: "LUNDI",
    short: "LUN",
  },
  {
    key: "mardi" as keyof HeuresRow,
    reportKey: "reports_mardi" as keyof HeuresRow,
    label: "MARDI",
    short: "MAR",
  },
  {
    key: "mercredi" as keyof HeuresRow,
    reportKey: "reports_mercredi" as keyof HeuresRow,
    label: "MERCREDI",
    short: "MER",
  },
  {
    key: "jeudi" as keyof HeuresRow,
    reportKey: "reports_jeudi" as keyof HeuresRow,
    label: "JEUDI",
    short: "JEU",
  },
  {
    key: "vendredi" as keyof HeuresRow,
    reportKey: "reports_vendredi" as keyof HeuresRow,
    label: "VENDREDI",
    short: "VEN",
  },
  {
    key: "samedi" as keyof HeuresRow,
    reportKey: "reports_samedi" as keyof HeuresRow,
    label: "SAMEDI",
    short: "SAM",
  },
] as const;

const HOUR_DAYS: Array<keyof HeuresRow> = DAY_CONFIG.map((day) => day.key);
const REPORT_DAYS: Array<keyof HeuresRow> = DAY_CONFIG.map((day) => day.reportKey);

const ROLE_ORDER = [
  "Helpeur",
  "Modérateur",
  "Administrateur",
  "Super-Administrateur",
  "Gérant-Staff",
] as const;

export default function HeuresStaffPage() {
  const [rows, setRows] = useState<HeuresRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [createdWeeks, setCreatedWeeks] = useState<string[]>([]);
  const [showRanking, setShowRanking] = useState(false);
  const [openRole, setOpenRole] = useState<string | null>("Modérateur");
  const [focusedStaffByRole, setFocusedStaffByRole] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    loadRows();

    const channel = supabase
      .channel("heures_staff_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "heures_staff" },
        () => {
          loadRows(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadRows(showLoader = true) {
    if (showLoader) setLoading(true);

    const { data, error } = await supabase
      .from("heures_staff")
      .select("*")
      .order("role", { ascending: true })
      .order("staff", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Erreur chargement heures_staff :", error);
      if (showLoader) setLoading(false);
      return;
    }

    const cleanedRows = ((data || []) as HeuresRow[]).map((row) => ({
      ...row,
      isNew: false,
    }));

    setRows(cleanedRows);

    const weekValues = Array.from(
      new Set(cleanedRows.map((row) => (row.semaine || "").trim()).filter(Boolean))
    );

    if (!selectedWeek) {
      setSelectedWeek(weekValues[0] || getDefaultWeekLabel());
    }

    if (showLoader) setLoading(false);
  }

  function getAllWeeks() {
    const dbWeeks = rows.map((row) => (row.semaine || "").trim()).filter(Boolean);
    return Array.from(new Set([...createdWeeks, ...dbWeeks]));
  }

  function buildEmptyRow(role = "Modérateur", week?: string): HeuresRow {
    return {
      id: -Date.now() - Math.floor(Math.random() * 1000),
      semaine: week || selectedWeek || getDefaultWeekLabel(),
      staff: "",
      role,
      lundi: "",
      mardi: "",
      mercredi: "",
      jeudi: "",
      vendredi: "",
      samedi: "",
      dimanche: "",
      reports_lundi: "",
      reports_mardi: "",
      reports_mercredi: "",
      reports_jeudi: "",
      reports_vendredi: "",
      reports_samedi: "",
      reports_dimanche: "",
      total_reports: 0,
      total_heures: "0h00",
      paye: 0,
      auteur: "",
      isNew: true,
    };
  }

  function rowToPayload(row: HeuresRow, weekOverride?: string) {
    const totalMinutes = computeTotalMinutes(row);
    const totalFormatted = formatMinutes(totalMinutes);
    const totalReports = computeTotalReports(row);
    const paye = computePaye(row.role, row.staff, totalMinutes);

    return {
      semaine: weekOverride || row.semaine || selectedWeek || getDefaultWeekLabel(),
      staff: row.staff || "",
      role: row.role || "Modérateur",
      lundi: row.lundi || "",
      mardi: row.mardi || "",
      mercredi: row.mercredi || "",
      jeudi: row.jeudi || "",
      vendredi: row.vendredi || "",
      samedi: row.samedi || "",
      dimanche: row.dimanche || "",
      reports_lundi: row.reports_lundi || "",
      reports_mardi: row.reports_mardi || "",
      reports_mercredi: row.reports_mercredi || "",
      reports_jeudi: row.reports_jeudi || "",
      reports_vendredi: row.reports_vendredi || "",
      reports_samedi: row.reports_samedi || "",
      reports_dimanche: row.reports_dimanche || "",
      total_reports: totalReports,
      total_heures: totalFormatted,
      paye,
      auteur: row.auteur || "",
    };
  }

  async function addRow(role = "Modérateur") {
    const temp = buildEmptyRow(role, activeWeek);
    const payload = rowToPayload(temp, activeWeek);

    const { error } = await supabase.from("heures_staff").insert(payload);

    if (error) {
      console.error("Erreur ajout ligne :", error);
      return;
    }

    setOpenRole(role);
    await loadRows(false);
  }

  function getLatestStaffTemplates() {
    const source = [...rows]
      .filter((row) => (row.staff || "").trim())
      .sort((a, b) => b.id - a.id);

    const seen = new Set<string>();
    const templates: HeuresRow[] = [];

    for (const row of source) {
      const key = `${normalizeRole(row.role)}__${row.staff.trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      templates.push(row);
    }

    return templates.sort((a, b) => {
      const roleA = ROLE_ORDER.indexOf(normalizeRole(a.role) as (typeof ROLE_ORDER)[number]);
      const roleB = ROLE_ORDER.indexOf(normalizeRole(b.role) as (typeof ROLE_ORDER)[number]);
      if (roleA !== roleB) return roleA - roleB;
      return (a.staff || "").localeCompare(b.staff || "", "fr");
    });
  }

  async function createWeek() {
    const suggested = getNextWeekLabelFromActive(activeWeek);
    const value = window.prompt(
      "Nom de la nouvelle semaine ?\nExemple : 08/03 au 14/03",
      suggested
    );

    if (!value) return;

    const trimmed = value.trim();
    if (!trimmed) return;

    const allWeeks = getAllWeeks();
    if (!allWeeks.includes(trimmed)) {
      setCreatedWeeks((prev) => [...prev, trimmed]);
    }

    const existingRowsForWeek = rows.filter(
      (row) => (row.semaine || "").trim() === trimmed
    );

    if (existingRowsForWeek.length === 0) {
      const templates = getLatestStaffTemplates();

      if (templates.length > 0) {
        const inserts = templates.map((template) =>
          rowToPayload(
            {
              ...buildEmptyRow(template.role, trimmed),
              staff: template.staff || "",
              role: normalizeRole(template.role),
            },
            trimmed
          )
        );

        const { error } = await supabase.from("heures_staff").insert(inserts);

        if (error) {
          console.error("Erreur création semaine :", error);
        }
      }
    }

    setSelectedWeek(trimmed);
    await loadRows(false);
  }

  async function clearCurrentWeek() {
    const ok = window.confirm(
      `Tu veux vraiment effacer la semaine "${activeWeek}" ?`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("heures_staff")
      .delete()
      .eq("semaine", activeWeek);

    if (error) {
      console.error("Erreur suppression semaine :", error);
      return;
    }

    await loadRows(false);
  }

  async function deleteRow(id: number) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    if (row.id > 0) {
      const { error } = await supabase.from("heures_staff").delete().eq("id", id);
      if (error) {
        console.error(`Erreur suppression ligne ${id} :`, error);
        return;
      }
    }

    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRow(id: number, field: keyof HeuresRow, value: string | number) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const nextRow: HeuresRow = {
          ...row,
          [field]: value,
        } as HeuresRow;

        const totalMinutes = computeTotalMinutes(nextRow);
        const totalFormatted = formatMinutes(totalMinutes);
        const totalReports = computeTotalReports(nextRow);
        const paye = computePaye(nextRow.role, nextRow.staff, totalMinutes);

        return {
          ...nextRow,
          total_heures: totalFormatted,
          total_reports: totalReports,
          paye,
        };
      })
    );
  }

  async function saveAllRows() {
    setSavingAll(true);

    for (const row of rows) {
      const payload = rowToPayload(row);

      if (row.isNew || row.id <= 0) {
        const { error } = await supabase.from("heures_staff").insert(payload);
        if (error) {
          console.error("Erreur insert nouvelle ligne :", error);
        }
      } else {
        const { error } = await supabase
          .from("heures_staff")
          .update(payload)
          .eq("id", row.id);

        if (error) {
          console.error(`Erreur update ligne ${row.id} :`, error);
        }
      }
    }

    setSavingAll(false);
    await loadRows(false);
  }

  const weeks = useMemo(() => {
    const all = Array.from(
      new Set([
        ...createdWeeks,
        ...rows.map((row) => (row.semaine || "").trim()).filter(Boolean),
      ])
    ).sort(compareWeekLabels);

    return all.length > 0 ? all : [getDefaultWeekLabel()];
  }, [rows, createdWeeks]);

  const activeWeek = selectedWeek || weeks[0] || getDefaultWeekLabel();

  const visibleRows = useMemo(
    () => rows.filter((row) => (row.semaine || "").trim() === activeWeek),
    [rows, activeWeek]
  );

  const totalStaff = visibleRows.length;
  const totalMinutes = useMemo(
    () => visibleRows.reduce((acc, row) => acc + computeTotalMinutes(row), 0),
    [visibleRows]
  );
  const totalReportsGlobal = useMemo(
    () => visibleRows.reduce((acc, row) => acc + computeTotalReports(row), 0),
    [visibleRows]
  );

  const groupedRows = useMemo(() => {
    const map = new Map<string, HeuresRow[]>();

    for (const role of ROLE_ORDER) {
      map.set(role, []);
    }

    for (const row of visibleRows) {
      const role = normalizeRole(row.role);
      if (!map.has(role)) map.set(role, []);
      map.get(role)!.push(row);
    }

    for (const [role, list] of map.entries()) {
      map.set(
        role,
        [...list].sort((a, b) =>
          (a.staff || "").localeCompare(b.staff || "", "fr")
        )
      );
    }

    return map;
  }, [visibleRows]);

  const rankingHours = useMemo(() => {
    return [...visibleRows]
      .map((row) => ({
        staff: row.staff || "Sans nom",
        role: normalizeRole(row.role),
        totalMinutes: computeTotalMinutes(row),
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 10);
  }, [visibleRows]);

  const rankingReports = useMemo(() => {
    return [...visibleRows]
      .map((row) => ({
        staff: row.staff || "Sans nom",
        role: normalizeRole(row.role),
        totalReports: computeTotalReports(row),
      }))
      .sort((a, b) => b.totalReports - a.totalReports)
      .slice(0, 10);
  }, [visibleRows]);

  const weekDates = useMemo(() => buildWeekDateLabels(activeWeek), [activeWeek]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative overflow-hidden border-b border-yellow-500/15 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_28%),linear-gradient(135deg,rgba(0,0,0,0.98),rgba(20,20,20,0.92),rgba(10,10,10,0.98))]">
        <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 px-6 py-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/15 bg-yellow-400/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.9)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-300">
                Gestion staff
              </p>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold text-white">
              Tableau des heures et reports
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-white/72">
              Gère les heures, les reports, les semaines, le classement et la paye
              automatique.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={activeWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-300 outline-none"
            >
              {weeks.map((week) => (
                <option key={week} value={week} className="bg-black text-white">
                  {week}
                </option>
              ))}
            </select>

            <button
              onClick={createWeek}
              className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 font-bold text-yellow-300 transition hover:bg-yellow-500/20"
            >
              + Nouvelle semaine
            </button>

            <button
              onClick={() => addRow("Modérateur")}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:scale-[1.02]"
            >
              + Ajouter une ligne
            </button>

            <button
              onClick={saveAllRows}
              disabled={savingAll}
              className="rounded-2xl bg-green-500 px-5 py-3 font-bold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingAll ? "Sauvegarde..." : "💾 Sauvegarder tout"}
            </button>

            <button
              onClick={clearCurrentWeek}
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/20"
            >
              Effacer la semaine
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-4">
        <StatCard title="Staff" value={String(totalStaff)} tone="yellow" />
        <StatCard
          title="Heures totales"
          value={formatMinutes(totalMinutes)}
          tone="green"
        />
        <StatCard
          title="Reports totaux"
          value={String(totalReportsGlobal)}
          tone="blue"
        />
        <StatCard title="Semaine" value={activeWeek} tone="purple" />
      </div>

      <div className="px-6 pb-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowRanking((prev) => !prev)}
            className="rounded-xl border border-yellow-500/20 bg-[#0b0b0b] px-4 py-2 text-sm font-semibold text-gray-300 transition hover:border-yellow-500/40 hover:text-yellow-300"
          >
            {showRanking ? "Masquer le classement" : "Voir le classement"}
          </button>
        </div>
      </div>

      {showRanking && (
        <div className="grid gap-4 px-6 pb-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-yellow-500/20 bg-[#050505] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-yellow-300">
                Classement heures
              </h3>
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                semaine sélectionnée
              </span>
            </div>

            {rankingHours.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune donnée.</p>
            ) : (
              <div className="space-y-2">
                {rankingHours.map((item, index) => (
                  <div
                    key={`${item.staff}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-green-500/10 bg-green-950/10 px-4 py-3"
                  >
                    <div>
                      <p className="font-bold text-white">
                        #{index + 1} {item.staff}
                      </p>
                      <p className="text-xs text-gray-400">{item.role}</p>
                    </div>
                    <div className="font-extrabold text-green-300">
                      {formatMinutes(item.totalMinutes)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-yellow-500/20 bg-[#050505] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-yellow-300">
                Classement reports
              </h3>
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                semaine sélectionnée
              </span>
            </div>

            {rankingReports.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune donnée.</p>
            ) : (
              <div className="space-y-2">
                {rankingReports.map((item, index) => (
                  <div
                    key={`${item.staff}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-blue-500/10 bg-blue-950/10 px-4 py-3"
                  >
                    <div>
                      <p className="font-bold text-white">
                        #{index + 1} {item.staff}
                      </p>
                      <p className="text-xs text-gray-400">{item.role}</p>
                    </div>
                    <div className="font-extrabold text-blue-300">
                      {item.totalReports}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4 px-6 pb-10">
        {loading ? (
          <div className="rounded-2xl border border-yellow-500/20 bg-[#050505] px-4 py-10 text-sm text-gray-400">
            Chargement...
          </div>
        ) : (
          ROLE_ORDER.map((role) => {
            const group = groupedRows.get(role) || [];
            const isOpen = openRole === role;
            const focusedStaff = focusedStaffByRole[role] || null;

            const displayedGroup = focusedStaff
              ? group.filter(
                  (row) =>
                    (row.staff || "").trim().toLowerCase() ===
                    focusedStaff.trim().toLowerCase()
                )
              : group;

            return (
              <div
                key={role}
                className="overflow-hidden rounded-[26px] border border-yellow-500/20 bg-[#050505] shadow-[0_0_40px_rgba(255,200,0,0.08)]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenRole((prev) => (prev === role ? null : role))
                  }
                  className="relative flex w-full flex-col gap-4 border-b border-yellow-500/15 bg-[linear-gradient(135deg,rgba(36,24,0,0.95),rgba(14,14,14,0.98))] px-5 py-5 text-left transition hover:bg-[linear-gradient(135deg,rgba(46,31,0,0.95),rgba(16,16,16,0.98))] lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 opacity-80" />

                  <div>
                    <h2 className="text-xl font-extrabold uppercase tracking-[0.25em] text-yellow-300">
                      {role}
                    </h2>
                    <p className="mt-1 text-sm text-gray-300">
                      {group.length} staff{group.length > 1 ? "s" : ""} dans cette
                      catégorie
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addRow(role);
                      }}
                      className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-300 transition hover:bg-yellow-500/20"
                    >
                      + Ajouter dans {role}
                    </button>

                    <div
                      className={`rounded-full border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300 transition-all duration-500 ease-in-out ${
                        isOpen ? "rotate-180 scale-105" : "rotate-0 scale-100"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    {group.length > 0 && (
                      <div className="border-b border-yellow-500/10 bg-[#080808] px-5 py-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFocusedStaffByRole((prev) => ({
                                ...prev,
                                [role]: null,
                              }))
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                              !focusedStaff
                                ? "border-yellow-400/30 bg-yellow-400/12 text-yellow-300"
                                : "border-white/10 bg-white/[0.03] text-white/65 hover:border-yellow-400/20 hover:text-yellow-200"
                            }`}
                          >
                            Voir tous
                          </button>

                          {group.map((row) => {
                            const staffName = row.staff?.trim() || "Sans nom";
                            const isActive =
                              focusedStaff?.trim().toLowerCase() ===
                              staffName.toLowerCase();

                            return (
                              <button
                                key={`${role}-${row.id}`}
                                type="button"
                                onClick={() =>
                                  setFocusedStaffByRole((prev) => ({
                                    ...prev,
                                    [role]: staffName,
                                  }))
                                }
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                  isActive
                                    ? "border-green-400/30 bg-green-500/10 text-green-300"
                                    : "border-white/10 bg-white/[0.03] text-white/70 hover:border-yellow-400/20 hover:text-yellow-200"
                                }`}
                              >
                                {staffName}
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-xs text-white/45">
                          Clique sur un staff pour l’isoler dans la catégorie {role}.
                        </p>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <div className="min-w-[2450px]">
                        <div className="grid grid-cols-[320px_170px_repeat(7,125px)_repeat(7,90px)_120px_130px_130px_120px] gap-3 border-b border-yellow-500/10 bg-[#0b0b0b] px-4 py-4 text-xs font-bold uppercase text-yellow-300">
                          <div>Nom du staff</div>
                          <div>Semaine</div>

                          {DAY_CONFIG.map((day) => (
                            <div key={day.key} className="leading-4">
                              <div>{day.label}</div>
                              <div className="mt-1 text-[10px] font-medium normal-case text-white/45">
                                {weekDates[day.key] || "--/--"}
                              </div>
                            </div>
                          ))}

                          <div>R dim</div>
                          <div>R lun</div>
                          <div>R mar</div>
                          <div>R mer</div>
                          <div>R jeu</div>
                          <div>R ven</div>
                          <div>R sam</div>

                          <div>Total rep</div>
                          <div>Total h</div>
                          <div>Paye</div>
                          <div>Auteur</div>
                          <div>Action</div>
                        </div>

                        {displayedGroup.length === 0 ? (
                          <div className="px-4 py-8 text-sm text-gray-500">
                            {focusedStaff
                              ? `Aucun résultat pour ${focusedStaff} dans cette catégorie.`
                              : "Aucun staff dans cette catégorie pour cette semaine."}
                          </div>
                        ) : (
                          <div className="divide-y divide-yellow-500/10">
                            {displayedGroup.map((row) => {
                              const totalMinutesRow = computeTotalMinutes(row);
                              const totalReportsRow = computeTotalReports(row);
                              const paye = computePaye(
                                row.role,
                                row.staff,
                                totalMinutesRow
                              );

                              return (
                                <div
                                  key={row.id}
                                  className="grid grid-cols-[320px_170px_repeat(7,125px)_repeat(7,90px)_120px_130px_130px_120px] gap-3 px-4 py-4"
                                >
                                  <div className="space-y-2">
                                    <input
                                      value={row.staff || ""}
                                      onChange={(e) =>
                                        updateRow(row.id, "staff", e.target.value)
                                      }
                                      placeholder="Nom du staff"
                                      className={`${inputClass} border-yellow-500/30`}
                                    />

                                    {row.staff?.trim() && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setFocusedStaffByRole((prev) => ({
                                            ...prev,
                                            [role]: row.staff.trim(),
                                          }))
                                        }
                                        className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
                                      >
                                        Isoler
                                      </button>
                                    )}
                                  </div>

                                  <input
                                    value={row.semaine || ""}
                                    onChange={(e) =>
                                      updateRow(row.id, "semaine", e.target.value)
                                    }
                                    placeholder={activeWeek}
                                    className={`${inputClass} border-yellow-500/30`}
                                  />

                                  {HOUR_DAYS.map((day) => {
                                    const dayValue = String(row[day] || "");
                                    const lowerValue = dayValue.trim().toLowerCase();
                                    const isImprevu =
                                      lowerValue === "imprévu" ||
                                      lowerValue === "imprevu";
                                    const isZeroHour = isZeroHourValue(dayValue);
                                    const totalDayMinutes =
                                      parseDurationToMinutes(dayValue);
                                    const isLessThanOneHour =
                                      !isImprevu &&
                                      !isZeroHour &&
                                      totalDayMinutes > 0 &&
                                      totalDayMinutes < 60;

                                    return (
                                      <input
                                        key={String(day)}
                                        value={dayValue}
                                        onChange={(e) =>
                                          updateRow(row.id, day, e.target.value)
                                        }
                                        placeholder="2h30"
                                        className={
                                          isImprevu
                                            ? `${inputClass} border-blue-400/40 bg-blue-500/10 font-bold text-blue-200 shadow-[0_0_0_1px_rgba(96,165,250,0.08)]`
                                            : isZeroHour
                                            ? `${inputClass} border-red-400/40 bg-red-500/10 font-bold text-red-200 shadow-[0_0_0_1px_rgba(248,113,113,0.08)]`
                                            : isLessThanOneHour
                                            ? `${inputClass} border-yellow-400/40 bg-yellow-500/10 font-bold text-yellow-200 shadow-[0_0_0_1px_rgba(250,204,21,0.08)]`
                                            : `${inputClass} border-green-500/30 bg-green-950/10`
                                        }
                                      />
                                    );
                                  })}

                                  {REPORT_DAYS.map((day) => (
                                    <input
                                      key={String(day)}
                                      value={String(row[day] || "")}
                                      onChange={(e) =>
                                        updateRow(row.id, day, e.target.value)
                                      }
                                      placeholder="0"
                                      className={`${inputClass} border-blue-500/30 bg-blue-950/10`}
                                    />
                                  ))}

                                  <div className="flex items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 font-extrabold text-blue-300">
                                    {totalReportsRow}
                                  </div>

                                  <div className="flex items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 font-extrabold text-yellow-300">
                                    {formatMinutes(totalMinutesRow)}
                                  </div>

                                  <div
                                    className={`flex items-center justify-center rounded-xl border px-4 py-3 font-extrabold ${
                                      paye > 0
                                        ? "border-green-500/30 bg-green-500/15 text-green-300"
                                        : "border-red-500/30 bg-red-500/15 text-red-300"
                                    }`}
                                  >
                                    {paye}
                                  </div>

                                  <input
                                    value={row.auteur || ""}
                                    onChange={(e) =>
                                      updateRow(row.id, "auteur", e.target.value)
                                    }
                                    placeholder="Auteur"
                                    className={`${inputClass} border-purple-500/30 bg-purple-950/10`}
                                  />

                                  <div>
                                    <button
                                      onClick={() => deleteRow(row.id)}
                                      className="rounded-xl border border-red-700/60 bg-red-950/50 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-900/60"
                                    >
                                      Suppr.
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function getDefaultWeekLabel() {
  const today = new Date();
  const sunday = startOfWeekSunday(today);
  const saturday = addDays(sunday, 6);
  return `${formatDateShort(sunday)} au ${formatDateShort(saturday)}`;
}

function normalizeRole(role: string) {
  const r = (role || "").toLowerCase().trim();
  if (r.includes("gérant")) return "Gérant-Staff";
  if (r.includes("gerant")) return "Gérant-Staff";
  if (r.includes("super")) return "Super-Administrateur";
  if (r.includes("admin")) return "Administrateur";
  if (r.includes("mod")) return "Modérateur";
  if (r.includes("help")) return "Helpeur";
  return "Modérateur";
}

function computeTotalMinutes(row: HeuresRow) {
  return HOUR_DAYS.reduce(
    (acc, day) => acc + parseDurationToMinutes(String(row[day] || "")),
    0
  );
}

function computeTotalReports(row: HeuresRow) {
  return REPORT_DAYS.reduce((acc, day) => {
    const n = Number(String(row[day] || "").replace(",", "."));
    return acc + (Number.isNaN(n) ? 0 : n);
  }, 0);
}

function parseDurationToMinutes(value: string) {
  const raw = (value || "").trim().toLowerCase();
  if (!raw) return 0;

  if (
    raw === "/" ||
    raw === "0" ||
    raw === "imprevu" ||
    raw === "imprévu" ||
    raw === "abs" ||
    raw === "absence"
  ) {
    return 0;
  }

  const colon = raw.match(/^(\d{1,2})\s*:\s*(\d{1,2})$/);
  if (colon) return Number(colon[1]) * 60 + Number(colon[2]);

  const withH = raw.match(/^(\d{1,2})\s*h\s*(\d{0,2})$/);
  if (withH) return Number(withH[1] || "0") * 60 + Number(withH[2] || "0");

  const minOnly = raw.match(/^(\d{1,3})\s*min$/);
  if (minOnly) return Number(minOnly[1] || "0");

  const decimal = Number(raw.replace(",", "."));
  if (!Number.isNaN(decimal)) return Math.round(decimal * 60);

  return 0;
}

function formatMinutes(totalMinutes: number) {
  const mins = Math.max(0, totalMinutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function computePaye(role: string, staffName: string, totalMinutes: number) {
  if (totalMinutes < 600) return 0;

  const normalizedRole = normalizeRole(role);
  let base = 0;

  if (normalizedRole === "Modérateur") base = 600;
  if (normalizedRole === "Administrateur") base = 800;
  if (normalizedRole === "Super-Administrateur") base = 1200;
  if (normalizedRole === "Gérant-Staff") base = 1500;
  if (normalizedRole === "Helpeur") base = 0;

  const upperName = (staffName || "").toUpperCase();
  const hasBonus =
    upperName.includes("[R-L]") ||
    upperName.includes("[R-I]") ||
    upperName.includes("[R-E]");

  return base + (hasBonus ? 200 : 0);
}

function parseWeekLabel(label: string) {
  const match = (label || "")
    .trim()
    .match(/^(\d{2})\/(\d{2})\s+au\s+(\d{2})\/(\d{2})$/i);

  if (!match) return null;

  const startDay = Number(match[1]);
  const startMonth = Number(match[2]);
  const endDay = Number(match[3]);
  const endMonth = Number(match[4]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const candidates: Array<{ start: Date; end: Date }> = [];

  for (let year = currentYear - 1; year <= currentYear + 2; year += 1) {
    let startYear = year;
    let endYear = year;

    if (endMonth < startMonth) {
      endYear = year + 1;
    }

    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (diffDays === 6) {
      candidates.push({ start, end });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const diffA = Math.abs(a.start.getTime() - now.getTime());
    const diffB = Math.abs(b.start.getTime() - now.getTime());
    return diffA - diffB;
  });

  return candidates[0];
}

function buildWeekDateLabels(label: string) {
  const parsed = parseWeekLabel(label);

  const empty = {
    dimanche: "",
    lundi: "",
    mardi: "",
    mercredi: "",
    jeudi: "",
    vendredi: "",
    samedi: "",
  };

  if (!parsed) return empty;

  const datesByDay = { ...empty };
  const current = new Date(parsed.start);

  for (let i = 0; i < 7; i += 1) {
    const dayIndex = current.getDay();
    const formatted = formatDateShort(current);

    if (dayIndex === 0) datesByDay.dimanche = formatted;
    if (dayIndex === 1) datesByDay.lundi = formatted;
    if (dayIndex === 2) datesByDay.mardi = formatted;
    if (dayIndex === 3) datesByDay.mercredi = formatted;
    if (dayIndex === 4) datesByDay.jeudi = formatted;
    if (dayIndex === 5) datesByDay.vendredi = formatted;
    if (dayIndex === 6) datesByDay.samedi = formatted;

    current.setDate(current.getDate() + 1);
  }

  return datesByDay;
}

function getNextWeekLabelFromActive(activeWeek: string) {
  const parsed = parseWeekLabel(activeWeek);
  if (!parsed) return getDefaultWeekLabel();

  const nextStart = addDays(parsed.start, 7);
  const nextEnd = addDays(parsed.end, 7);

  return `${formatDateShort(nextStart)} au ${formatDateShort(nextEnd)}`;
}

function compareWeekLabels(a: string, b: string) {
  const parsedA = parseWeekLabel(a);
  const parsedB = parseWeekLabel(b);

  if (!parsedA && !parsedB) return a.localeCompare(b, "fr");
  if (!parsedA) return 1;
  if (!parsedB) return -1;

  return parsedA.start.getTime() - parsedB.start.getTime();
}

function startOfWeekSunday(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateShort(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function isZeroHourValue(value: string) {
  const raw = (value || "").trim().toLowerCase().replace(/\s+/g, "");
  return raw === "00h00" || raw === "0h00" || raw === "00:00" || raw === "0:00";
}

function StatCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "yellow" | "green" | "blue" | "purple";
}) {
  const tones = {
    yellow:
      "border-yellow-500/20 from-[#080808] via-[#221600] to-[#080808] text-yellow-300",
    green:
      "border-green-500/20 from-[#080808] via-[#0d1c12] to-[#080808] text-green-300",
    blue:
      "border-blue-500/20 from-[#080808] via-[#0b1630] to-[#080808] text-blue-300",
    purple:
      "border-purple-500/20 from-[#080808] via-[#1a1030] to-[#080808] text-purple-300",
  };

  return (
    <div
      className={`rounded-[24px] border bg-gradient-to-r p-5 shadow-[0_10px_28px_rgba(0,0,0,0.28)] ${tones[tone]}`}
    >
      <p className="text-sm font-semibold text-gray-300">{title}</p>
      <p className="mt-3 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/60";
"use client";

import { useEffect, useMemo, useState } from "react";
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
  reports: string;
  total_heures: string;
  paye: number;
  auteur: string;
};

const DAYS: Array<keyof HeuresRow> = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

const ROLE_ORDER = [
  "Helpeur",
  "Modérateur",
  "Administrateur",
  "Super-Administrateur",
  "Gérant-Staff",
];

export default function HeuresStaffPage() {
  const [rows, setRows] = useState<HeuresRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRows();

    const channel = supabase
      .channel("heures-staff-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "heures_staff" },
        async () => {
          await loadRows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("heures_staff")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erreur chargement heures_staff :", error);
      setLoading(false);
      return;
    }

    setRows((data || []) as HeuresRow[]);
    setLoading(false);
  }

  async function addRow(role = "Modérateur") {
    const { error } = await supabase.from("heures_staff").insert({
      semaine: "",
      staff: "",
      role,
      lundi: "",
      mardi: "",
      mercredi: "",
      jeudi: "",
      vendredi: "",
      samedi: "",
      dimanche: "",
      reports: "0",
      total_heures: "0h00",
      paye: 0,
      auteur: "",
    });

    if (error) {
      console.error("Erreur ajout heures staff :", error);
    }
  }

  async function deleteRow(id: number) {
    const previous = rows;
    setRows((prev) => prev.filter((row) => row.id !== id));

    const { error } = await supabase.from("heures_staff").delete().eq("id", id);

    if (error) {
      console.error("Erreur suppression heures staff :", error);
      setRows(previous);
    }
  }

  async function updateRow(
    id: number,
    field: keyof HeuresRow,
    value: string | number
  ) {
    const currentRow = rows.find((r) => r.id === id);
    if (!currentRow) return;

    const nextRow: HeuresRow = {
      ...currentRow,
      [field]: value,
    } as HeuresRow;

    const totalMinutes = computeTotalMinutes(nextRow);
    const totalFormatted = formatMinutes(totalMinutes);
    const paye = computePaye(nextRow.role, nextRow.staff, totalMinutes);

    const payload = {
      [field]: value,
      total_heures: totalFormatted,
      paye,
    };

    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              total_heures: totalFormatted,
              paye,
            }
          : row
      )
    );

    const { error } = await supabase
      .from("heures_staff")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Erreur update heures staff :", error);
      await loadRows();
    }
  }

  async function clearAll() {
    const ok = window.confirm("Tu veux vraiment vider toutes les heures staff ?");
    if (!ok) return;

    const { error } = await supabase.from("heures_staff").delete().neq("id", 0);
    if (error) {
      console.error("Erreur clear heures staff :", error);
    }
  }

  const totalStaff = rows.length;
  const totalMinutes = useMemo(
    () => rows.reduce((acc, row) => acc + computeTotalMinutes(row), 0),
    [rows]
  );
  const totalReports = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const n = Number(String(row.reports || "0").replace(",", "."));
        return acc + (Number.isNaN(n) ? 0 : n);
      }, 0),
    [rows]
  );

  const semaineAffichee =
    rows.find((r) => (r.semaine || "").trim())?.semaine || "01/01 au 07/01";

  const groupedRows = useMemo(() => {
    const map = new Map<string, HeuresRow[]>();

    for (const role of ROLE_ORDER) {
      map.set(role, []);
    }

    for (const row of rows) {
      const role = normalizeRole(row.role);
      if (!map.has(role)) map.set(role, []);
      map.get(role)!.push(row);
    }

    return map;
  }, [rows]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-yellow-500/15 bg-gradient-to-r from-black via-[#1a1200] to-black">
        <div className="flex flex-col gap-5 px-6 py-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500/80">
              Gestion staff
            </p>
            <h1 className="text-4xl font-extrabold">Tableau des heures et reports</h1>
            <p className="mt-3 max-w-4xl text-sm text-gray-400">
              Gère les heures jour par jour, les reports, le rôle du staff et la
              paye automatique. Si le total est inférieur à 10h, la paye reste à 0.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400">
              Semaine du {semaineAffichee}
            </div>

            <button
              onClick={() => addRow("Modérateur")}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:opacity-90"
            >
              + Ajouter une ligne
            </button>

            <button
              onClick={clearAll}
              className="rounded-2xl border border-red-800 bg-red-950/60 px-5 py-3 font-bold text-red-300 transition hover:bg-red-900/60"
            >
              Tout vider
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
        <StatCard title="Staff" value={String(totalStaff)} />
        <StatCard title="Heures totales" value={formatMinutes(totalMinutes)} />
        <StatCard title="Reports totaux" value={String(totalReports)} />
      </div>

      <div className="space-y-6 px-6 pb-10">
        {loading ? (
          <div className="rounded-2xl border border-yellow-500/20 bg-[#050505] px-4 py-10 text-sm text-gray-400">
            Chargement...
          </div>
        ) : (
          ROLE_ORDER.map((role) => {
            const group = groupedRows.get(role) || [];

            return (
              <div
                key={role}
                className="overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#050505] shadow-[0_0_40px_rgba(255,200,0,0.05)]"
              >
                <div className="flex flex-col gap-4 border-b border-yellow-500/15 bg-gradient-to-r from-[#120d00] to-[#060606] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold uppercase tracking-[0.25em] text-yellow-400">
                      {role}
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                      {group.length} staff{group.length > 1 ? "s" : ""} dans cette catégorie
                    </p>
                  </div>

                  <button
                    onClick={() => addRow(role)}
                    className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-300 transition hover:bg-yellow-500/20"
                  >
                    + Ajouter dans {role}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[1700px]">
                    <div className="grid grid-cols-[260px_170px_repeat(7,110px)_120px_130px_130px_120px] gap-3 border-b border-yellow-500/10 px-4 py-4 text-sm font-bold uppercase text-yellow-400">
                      <div>Nom du staff</div>
                      <div>Semaine</div>
                      <div>Lundi</div>
                      <div>Mardi</div>
                      <div>Mercredi</div>
                      <div>Jeudi</div>
                      <div>Vendredi</div>
                      <div>Samedi</div>
                      <div>Dimanche</div>
                      <div>Reports</div>
                      <div>Total heures</div>
                      <div>Paye staff</div>
                      <div>Auteur</div>
                      <div>Action</div>
                    </div>

                    {group.length === 0 ? (
                      <div className="px-4 py-8 text-sm text-gray-500">
                        Aucun staff dans cette catégorie.
                      </div>
                    ) : (
                      <div className="divide-y divide-yellow-500/10">
                        {group.map((row) => {
                          const totalMinutesRow = computeTotalMinutes(row);
                          const paye = computePaye(row.role, row.staff, totalMinutesRow);

                          return (
                            <div
                              key={row.id}
                              className="grid grid-cols-[260px_170px_repeat(7,110px)_120px_130px_130px_120px] gap-3 px-4 py-4"
                            >
                              <input
                                value={row.staff || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "staff", e.target.value)
                                }
                                placeholder="Nom du staff"
                                className={inputClass}
                              />

                              <input
                                value={row.semaine || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "semaine", e.target.value)
                                }
                                placeholder="01/03 au 15/03"
                                className={inputClass}
                              />

                              <input
                                value={row.lundi || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "lundi", e.target.value)
                                }
                                placeholder="2h30"
                                className={inputClass}
                              />
                              <input
                                value={row.mardi || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "mardi", e.target.value)
                                }
                                placeholder="0"
                                className={inputClass}
                              />
                              <input
                                value={row.mercredi || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "mercredi", e.target.value)
                                }
                                placeholder="1h20"
                                className={inputClass}
                              />
                              <input
                                value={row.jeudi || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "jeudi", e.target.value)
                                }
                                placeholder="IMPREVU"
                                className={inputClass}
                              />
                              <input
                                value={row.vendredi || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "vendredi", e.target.value)
                                }
                                placeholder="3h10"
                                className={inputClass}
                              />
                              <input
                                value={row.samedi || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "samedi", e.target.value)
                                }
                                placeholder="4h00"
                                className={inputClass}
                              />
                              <input
                                value={row.dimanche || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "dimanche", e.target.value)
                                }
                                placeholder="0"
                                className={inputClass}
                              />

                              <input
                                value={row.reports || ""}
                                onChange={(e) =>
                                  updateRow(row.id, "reports", e.target.value)
                                }
                                placeholder="0"
                                className={inputClass}
                              />

                              <div className="flex items-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 font-bold text-yellow-300">
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
                                className={inputClass}
                              />

                              <button
                                onClick={() => deleteRow(row.id)}
                                className="rounded-xl border border-red-700/60 bg-red-950/50 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-900/60"
                              >
                                Suppr.
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
  return DAYS.reduce((acc, day) => acc + parseDurationToMinutes(String(row[day] || "")), 0);
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
  if (colon) {
    const h = Number(colon[1]);
    const m = Number(colon[2]);
    return h * 60 + m;
  }

  const withH = raw.match(/^(\d{1,2})\s*h\s*(\d{0,2})$/);
  if (withH) {
    const h = Number(withH[1] || "0");
    const m = Number(withH[2] || "0");
    return h * 60 + m;
  }

  const minOnly = raw.match(/^(\d{1,3})\s*min$/);
  if (minOnly) {
    return Number(minOnly[1] || "0");
  }

  const decimal = Number(raw.replace(",", "."));
  if (!Number.isNaN(decimal)) {
    return Math.round(decimal * 60);
  }

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

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-[#080808] via-[#120d00] to-[#080808] p-5">
      <p className="text-sm font-semibold text-gray-300">{title}</p>
      <p className="mt-3 text-4xl font-extrabold text-yellow-400">{value}</p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-yellow-500/20 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/60";
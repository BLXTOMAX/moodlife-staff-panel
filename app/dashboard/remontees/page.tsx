"use client";

import { useEffect, useMemo, useState } from "react";

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

const STORAGE_KEY = "moodlife-remontees-staff";

const inputClassName =
  "w-full rounded-xl border border-yellow-500/20 bg-yellow-500/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-400/60 focus:bg-yellow-500/[0.05]";

export default function RemonteesPage() {
  const [rows, setRows] = useState<RemonteeRow[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        rows?: RemonteeRow[];
        nextId?: number;
      };

      setRows(parsed.rows ?? []);
      setNextId(parsed.nextId ?? 1);
    } catch (error) {
      console.error("Erreur chargement remontées :", error);
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

  const stats = useMemo(() => {
    const erreurs = rows.filter((row) => row.type === "Erreur").length;
    const positifs = rows.filter((row) => row.type === "Point positif").length;
    const prevenus = rows.filter((row) => row.prevenu === "Oui").length;

    return {
      erreurs,
      positifs,
      prevenus,
    };
  }, [rows]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: nextId,
        staffRemonte: "",
        type: "Erreur",
        description: "",
        prevenu: "Non",
        auteur: "",
        date: "",
      },
    ]);
    setNextId((prev) => prev + 1);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function updateRow<K extends keyof RemonteeRow>(
    id: number,
    field: K,
    value: RemonteeRow[K]
  ) {
    setRows((prev) =>
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

  function clearAll() {
    setRows([]);
    setNextId(1);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="relative min-h-screen overflow-hidden space-y-8 bg-[radial-gradient(circle_at_top,rgba(255,200,0,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,200,0,0.10),transparent_32%),linear-gradient(180deg,rgba(255,215,0,0.03),rgba(0,0,0,0))]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,200,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,200,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="panel-card p-6 border border-yellow-400/20 bg-yellow-500/[0.03] shadow-[0_0_30px_rgba(255,200,0,0.08)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-400/70">
              Gestion staff
            </p>
            <h1 className="mt-3 text-4xl font-black text-white">
              Remontées Staff
            </h1>
            <p className="mt-3 max-w-3xl text-zinc-300">
              Suivi des erreurs et points positifs remontés sur les staffs.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={addRow}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105"
            >
              + Ajouter une remontée
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/20"
            >
              Tout vider
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          title="Total remontées"
          value={String(rows.length)}
          valueColor="text-yellow-300"
        />
        <StatCard
          title="Erreurs"
          value={String(stats.erreurs)}
          valueColor="text-red-300"
        />
        <StatCard
          title="Points positifs"
          value={String(stats.positifs)}
          valueColor="text-emerald-300"
        />
        <StatCard
          title="Staff prévenus"
          value={String(stats.prevenus)}
          valueColor="text-sky-300"
        />
      </div>

      <div className="panel-card overflow-hidden border border-yellow-400/15 bg-yellow-500/[0.025] shadow-[0_0_30px_rgba(255,200,0,0.05)] backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1450px] border-collapse">
            <thead className="bg-yellow-500/[0.04]">
              <tr className="border-b border-yellow-500/20">
                <th className="w-[260px] px-4 py-4 text-left text-sm font-bold uppercase tracking-wide text-zinc-200">
                  Staff remonté
                </th>
                <th className="w-[180px] px-4 py-4 text-center text-sm font-bold uppercase tracking-wide text-zinc-200">
                  Type
                </th>
                <th className="w-[520px] px-4 py-4 text-left text-sm font-bold uppercase tracking-wide text-zinc-200">
                  Description
                </th>
                <th className="w-[160px] px-4 py-4 text-center text-sm font-bold uppercase tracking-wide text-zinc-200">
                  Prévenu
                </th>
                <th className="w-[260px] px-4 py-4 text-left text-sm font-bold uppercase tracking-wide text-zinc-200">
                  Auteur
                </th>
                <th className="w-[180px] px-4 py-4 text-center text-sm font-bold uppercase tracking-wide text-zinc-200">
                  Date
                </th>
                <th className="w-[120px] px-4 py-4 text-center text-sm font-bold uppercase tracking-wide text-zinc-200">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-14 text-center text-zinc-400"
                  >
                    Aucune remontée pour le moment.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-yellow-500/15 align-top transition hover:bg-yellow-500/[0.04]"
                  >
                    <td className="px-4 py-4">
                      <input
                        value={row.staffRemonte}
                        onChange={(e) =>
                          updateRow(row.id, "staffRemonte", e.target.value)
                        }
                        placeholder="Pseudo du staff"
                        className={inputClassName}
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <select
                        value={row.type}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "type",
                            e.target.value as RemonteeType
                          )
                        }
                        className={`w-full rounded-xl border px-3 py-2 text-sm font-medium outline-none transition ${
                          row.type === "Erreur"
                            ? "border-red-500/25 bg-red-500/10 text-red-300 focus:border-red-400/50"
                            : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 focus:border-emerald-400/50"
                        }`}
                      >
                        <option value="Erreur">Erreur</option>
                        <option value="Point positif">Point positif</option>
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <textarea
                        value={row.description}
                        onChange={(e) =>
                          updateRow(row.id, "description", e.target.value)
                        }
                        placeholder="Description détaillée"
                        rows={3}
                        className={`${inputClassName} resize-none`}
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <select
                        value={row.prevenu}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "prevenu",
                            e.target.value as PrevenuType
                          )
                        }
                        className={`w-full rounded-xl border px-3 py-2 text-sm font-medium outline-none transition ${
                          row.prevenu === "Oui"
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 focus:border-emerald-400/50"
                            : "border-red-500/25 bg-red-500/10 text-red-300 focus:border-red-400/50"
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
                          updateRow(row.id, "auteur", e.target.value)
                        }
                        placeholder="Staff qui remonte"
                        className={inputClassName}
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) =>
                          updateRow(row.id, "date", e.target.value)
                        }
                        className={inputClassName}
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
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
  );
}

function StatCard({
  title,
  value,
  valueColor,
}: {
  title: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="panel-card p-5 border border-yellow-400/15 bg-yellow-500/[0.025] hover:border-yellow-300/30 transition">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className={`mt-3 text-3xl font-black ${valueColor}`}>{value}</p>
    </div>
  );
}
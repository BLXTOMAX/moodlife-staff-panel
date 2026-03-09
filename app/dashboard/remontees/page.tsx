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

export default function RemonteesPage() {
  const [rows, setRows] = useState<RemonteeRow[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        rows: RemonteeRow[];
        nextId: number;
      };

      if (parsed.rows) setRows(parsed.rows);
      if (parsed.nextId) setNextId(parsed.nextId);
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

    return { erreurs, positifs, prevenus };
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
    <div className="space-y-6">
      <div className="panel-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-yellow-400/70">
              Gestion staff
            </p>
            <h1 className="mt-3 text-4xl font-black text-white">
              Remontées hebdomadaires
            </h1>
            <p className="mt-3 text-zinc-400">
              Ajoute les erreurs et points positifs remontés sur les staffs,
              avec description, statut prévenu, auteur et date.
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
              className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/15"
            >
              Tout vider
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Total remontées</h2>
          <p className="mt-3 text-3xl font-black text-yellow-300">
            {rows.length}
          </p>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Erreurs</h2>
          <p className="mt-3 text-3xl font-black text-red-300">
            {stats.erreurs}
          </p>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Points positifs</h2>
          <p className="mt-3 text-3xl font-black text-emerald-300">
            {stats.positifs}
          </p>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Staff prévenus</h2>
          <p className="mt-3 text-3xl font-black text-sky-300">
            {stats.prevenus}
          </p>
        </div>
      </div>

      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] border-collapse">
            <thead className="bg-zinc-900/80">
              <tr className="border-b border-white/10">
                <th className="w-[220px] px-4 py-4 text-left text-sm font-bold text-yellow-400">
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
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-zinc-500"
                  >
                    Aucune remontée pour le moment.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 align-top transition hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-4">
                      <input
                        value={row.staffRemonte}
                        onChange={(e) =>
                          updateRow(row.id, "staffRemonte", e.target.value)
                        }
                        placeholder="Pseudo du staff"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30"
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
                        className={`w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-yellow-400/30 ${
                          row.type === "Erreur"
                            ? "text-red-300"
                            : "text-emerald-300"
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
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30"
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
                        className={`w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-yellow-400/30 ${
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
                          updateRow(row.id, "auteur", e.target.value)
                        }
                        placeholder="Auteur de la remontée"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30"
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) =>
                          updateRow(row.id, "date", e.target.value)
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30"
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Types disponibles</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p className="text-red-300">Erreur</p>
            <p className="text-emerald-300">Point positif</p>
          </div>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Prévenu</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Permet de savoir si le staff concerné a déjà été averti ou non.
          </p>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Sauvegarde</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Les remontées restent enregistrées même après un refresh de la page.
          </p>
        </div>
      </div>
    </div>
  );
}
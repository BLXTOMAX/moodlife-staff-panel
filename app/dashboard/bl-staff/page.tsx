"use client";

import { useEffect, useMemo, useState } from "react";

type BLStaffRow = {
  id: number;
  pseudo: string;
  discord: string;
  commentaire: string;
  date: string;
  ajoutePar: string;
};

const STORAGE_KEY = "moodlife-bl-staff";

export default function BLStaffPage() {
  const [rows, setRows] = useState<BLStaffRow[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        rows: BLStaffRow[];
        nextId: number;
      };

      if (parsed.rows) setRows(parsed.rows);
      if (parsed.nextId) setNextId(parsed.nextId);
    } catch (error) {
      console.error("Erreur chargement BL staff :", error);
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

  const totalEntries = useMemo(() => rows.length, [rows]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: nextId,
        pseudo: "",
        discord: "",
        commentaire: "",
        date: "",
        ajoutePar: "",
      },
    ]);
    setNextId((prev) => prev + 1);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function updateRow<K extends keyof BLStaffRow>(
    id: number,
    field: K,
    value: BLStaffRow[K]
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
            <h1 className="mt-3 text-4xl font-black text-white">BL Staff</h1>
            <p className="mt-3 text-zinc-400">
              Liste les staffs blacklistés avec leur pseudo, Discord,
              commentaire, date et auteur de l’ajout.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={addRow}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105"
            >
              + Ajouter une entrée
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Entrées BL</h2>
          <p className="mt-3 text-3xl font-black text-yellow-300">
            {totalEntries}
          </p>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Sauvegarde</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Les données restent enregistrées après un refresh de la page.
          </p>
        </div>

        <div className="panel-card p-5">
          <h2 className="text-lg font-bold text-white">Utilisation</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Utilise cette page pour garder un historique propre des BL staff.
          </p>
        </div>
      </div>

      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] border-collapse">
            <thead className="bg-zinc-900/80">
              <tr className="border-b border-white/10">
                <th className="w-[220px] px-4 py-4 text-left text-sm font-bold text-yellow-400">
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
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-zinc-500"
                  >
                    Aucune entrée BL pour le moment.
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
                        value={row.pseudo}
                        onChange={(e) =>
                          updateRow(row.id, "pseudo", e.target.value)
                        }
                        placeholder="Pseudo"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <input
                        value={row.discord}
                        onChange={(e) =>
                          updateRow(row.id, "discord", e.target.value)
                        }
                        placeholder="ID Discord ou pseudo Discord"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <textarea
                        value={row.commentaire}
                        onChange={(e) =>
                          updateRow(row.id, "commentaire", e.target.value)
                        }
                        placeholder="Commentaire"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/30"
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

                    <td className="px-4 py-4">
                      <input
                        value={row.ajoutePar}
                        onChange={(e) =>
                          updateRow(row.id, "ajoutePar", e.target.value)
                        }
                        placeholder="Staff qui ajoute"
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
    </div>
  );
}
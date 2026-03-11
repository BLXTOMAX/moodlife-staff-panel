"use client";

import { useEffect, useMemo, useState } from "react";

/* ----------------------------- Types ----------------------------- */

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

/* ---------------------------- Constants ---------------------------- */

const STORAGE_KEY = "moodlife-remontees-staff";

const EMPTY_ROW = (id: number): RemonteeRow => ({
  id,
  staffRemonte: "",
  type: "Erreur",
  description: "",
  prevenu: "Non",
  auteur: "",
  date: "",
});

/* ----------------------------- Component ----------------------------- */

export default function RemonteesPage() {
  const [rows, setRows] = useState<RemonteeRow[]>([]);
  const [nextId, setNextId] = useState(1);

  /* --------------------------- Load storage --------------------------- */

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (parsed.rows) setRows(parsed.rows);
      if (parsed.nextId) setNextId(parsed.nextId);
    } catch (err) {
      console.error("Erreur chargement remontées :", err);
    }
  }, []);

  /* --------------------------- Save storage --------------------------- */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rows,
        nextId,
      })
    );
  }, [rows, nextId]);

  /* ----------------------------- Stats ----------------------------- */

  const stats = useMemo(() => {
    const erreurs = rows.filter((r) => r.type === "Erreur").length;
    const positifs = rows.filter((r) => r.type === "Point positif").length;
    const prevenus = rows.filter((r) => r.prevenu === "Oui").length;

    return {
      erreurs,
      positifs,
      prevenus,
    };
  }, [rows]);

  /* ----------------------------- Actions ----------------------------- */

  function addRow() {
    setRows((prev) => [...prev, EMPTY_ROW(nextId)]);
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

  /* ----------------------------- Render ----------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
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
              Ajoute les erreurs et points positifs remontés sur les staffs.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={addRow}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:brightness-105"
            >
              + Ajouter une remontée
            </button>

            <button
              onClick={clearAll}
              className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/15"
            >
              Tout vider
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Stat title="Total remontées" value={rows.length} color="text-yellow-300" />
        <Stat title="Erreurs" value={stats.erreurs} color="text-red-300" />
        <Stat
          title="Points positifs"
          value={stats.positifs}
          color="text-emerald-300"
        />
        <Stat
          title="Staff prévenus"
          value={stats.prevenus}
          color="text-sky-300"
        />
      </div>

      {/* Table */}
      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] border-collapse">
            <thead className="bg-zinc-900/80">
              <tr className="border-b border-white/10">
                <Th>Staff remonté</Th>
                <Th center>Type</Th>
                <Th>Description</Th>
                <Th center>Prévenu</Th>
                <Th>Staff qui remonte</Th>
                <Th center>Date</Th>
                <Th center>Action</Th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-500">
                    Aucune remontée pour le moment.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    {/* Staff */}
                    <td className="px-4 py-4">
                      <Input
                        value={row.staffRemonte}
                        placeholder="Pseudo du staff"
                        onChange={(v) =>
                          updateRow(row.id, "staffRemonte", v)
                        }
                      />
                    </td>

                    {/* Type */}
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
                        className={`input ${
                          row.type === "Erreur"
                            ? "text-red-300"
                            : "text-emerald-300"
                        }`}
                      >
                        <option value="Erreur">Erreur</option>
                        <option value="Point positif">Point positif</option>
                      </select>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-4">
                      <textarea
                        value={row.description}
                        rows={3}
                        placeholder="Description détaillée"
                        onChange={(e) =>
                          updateRow(row.id, "description", e.target.value)
                        }
                        className="input resize-none"
                      />
                    </td>

                    {/* Prévenu */}
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
                        className={`input ${
                          row.prevenu === "Oui"
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                      </select>
                    </td>

                    {/* Auteur */}
                    <td className="px-4 py-4">
                      <Input
                        value={row.auteur}
                        placeholder="Auteur de la remontée"
                        onChange={(v) => updateRow(row.id, "auteur", v)}
                      />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) =>
                          updateRow(row.id, "date", e.target.value)
                        }
                        className="input"
                      />
                    </td>

                    {/* Delete */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/15"
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

/* ----------------------------- UI helpers ----------------------------- */

function Stat({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="panel-card p-5">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className={`mt-3 text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function Th({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <th
      className={`px-4 py-4 text-sm font-bold text-zinc-300 ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Input({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="input w-full"
    />
  );
}
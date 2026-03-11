"use client";
// TEST HEURES STAFF 123
import { useEffect, useState } from "react";

type StaffRow = {
  id: number;
  name: string;
  hours: number;
};

type Week = {
  id: string;
  label: string;
  rows: StaffRow[];
  nextId: number;
};

const STORAGE_KEY = "moodlife-staff-weeks";

export default function HeuresStaffPage() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null);

  const activeWeek = weeks.find((w) => w.id === activeWeekId);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    setWeeks(parsed.weeks || []);
    setActiveWeekId(parsed.activeWeekId || null);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ weeks, activeWeekId })
    );
  }, [weeks, activeWeekId]);

  function createWeek() {
    const label = prompt(
      "Nom de la semaine (ex : Semaine du 14/02 au 21/02)"
    );

    if (!label) return;

    const newWeek: Week = {
      id: crypto.randomUUID(),
      label,
      rows: [],
      nextId: 1,
    };

    setWeeks((prev) => [...prev, newWeek]);
    setActiveWeekId(newWeek.id);
  }

  function addRow() {
    if (!activeWeek) return;

    const updatedWeeks = weeks.map((w) => {
      if (w.id !== activeWeek.id) return w;

      return {
        ...w,
        rows: [
          ...w.rows,
          {
            id: w.nextId,
            name: "",
            hours: 0,
          },
        ],
        nextId: w.nextId + 1,
      };
    });

    setWeeks(updatedWeeks);
  }

  function updateRow(
    id: number,
    field: "name" | "hours",
    value: string | number
  ) {
    if (!activeWeek) return;

    const updatedWeeks = weeks.map((w) => {
      if (w.id !== activeWeek.id) return w;

      return {
        ...w,
        rows: w.rows.map((r) =>
          r.id === id ? { ...r, [field]: value } : r
        ),
      };
    });

    setWeeks(updatedWeeks);
  }

  function removeRow(id: number) {
    if (!activeWeek) return;

    const updatedWeeks = weeks.map((w) => {
      if (w.id !== activeWeek.id) return w;

      return {
        ...w,
        rows: w.rows.filter((r) => r.id !== id),
      };
    });

    setWeeks(updatedWeeks);
  }

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-white">
        Heures Staff
      </h1>

      <div className="flex gap-3">

        <select
          value={activeWeekId ?? ""}
          onChange={(e) => setActiveWeekId(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white"
        >
          <option value="">Choisir une semaine</option>

          {weeks.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}

        </select>

        <button
          onClick={createWeek}
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold"
        >
          + Nouvelle semaine
        </button>

      </div>

      {activeWeek && (
        <div className="space-y-4">

          <button
            onClick={addRow}
            className="bg-green-500 px-4 py-2 rounded-lg font-bold"
          >
            Ajouter un staff
          </button>

          <table className="w-full border border-white/10 rounded-xl overflow-hidden">

            <thead className="bg-black/40">
              <tr>
                <th className="p-3 text-left">Staff</th>
                <th className="p-3 text-left">Heures</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {activeWeek.rows.map((row) => (

                <tr key={row.id} className="border-t border-white/10">

                  <td className="p-3">

                    <input
                      value={row.name}
                      onChange={(e) =>
                        updateRow(row.id, "name", e.target.value)
                      }
                      className="bg-black/40 border border-white/10 rounded px-2 py-1 w-full"
                    />

                  </td>

                  <td className="p-3">

                    <input
                      type="number"
                      value={row.hours}
                      onChange={(e) =>
                        updateRow(
                          row.id,
                          "hours",
                          Number(e.target.value)
                        )
                      }
                      className="bg-black/40 border border-white/10 rounded px-2 py-1 w-full"
                    />

                  </td>

                  <td className="p-3">

                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-red-400"
                    >
                      Supprimer
                    </button>

                  </td>

                </tr>

              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}
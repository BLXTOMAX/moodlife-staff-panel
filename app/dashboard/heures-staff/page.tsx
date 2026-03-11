"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Row = {
  id: number;
  semaine: string;
  staff: string;
  heures: string;
  reports: string;
  auteur: string;
};

export default function HeuresStaffPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    const { data, error } = await supabase
      .from("heures_staff")
      .select("*")
      .order("id");

    if (error) {
      console.error(error);
      return;
    }

    setRows(data || []);
  }

  async function addRow() {
    const { data, error } = await supabase
      .from("heures_staff")
      .insert({
        semaine: "",
        staff: "",
        heures: "",
        reports: "",
        auteur: "",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setRows((prev) => [...prev, data]);
  }

  async function updateRow(id: number, field: string, value: string) {
    await supabase
      .from("heures_staff")
      .update({ [field]: value })
      .eq("id", id);

    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  }

  async function removeRow(id: number) {
    await supabase
      .from("heures_staff")
      .delete()
      .eq("id", id);

    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Heures Staff</h1>

        <button
          onClick={addRow}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg"
        >
          + Ajouter une ligne
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-6 gap-3">
            <input
              value={row.staff}
              onChange={(e) =>
                updateRow(row.id, "staff", e.target.value)
              }
              className="input"
              placeholder="Pseudo staff"
            />

            <input
              value={row.heures}
              onChange={(e) =>
                updateRow(row.id, "heures", e.target.value)
              }
              className="input"
              placeholder="Heures"
            />

            <input
              value={row.semaine}
              onChange={(e) =>
                updateRow(row.id, "semaine", e.target.value)
              }
              className="input"
              placeholder="Semaine"
            />

            <input
              value={row.reports}
              onChange={(e) =>
                updateRow(row.id, "reports", e.target.value)
              }
              className="input"
              placeholder="Reports"
            />

            <input
              value={row.auteur}
              onChange={(e) =>
                updateRow(row.id, "auteur", e.target.value)
              }
              className="input"
              placeholder="Auteur"
            />

            <button
              onClick={() => removeRow(row.id)}
              className="bg-red-600 text-white px-3 rounded-lg"
            >
              Suppr.
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
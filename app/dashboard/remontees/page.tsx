"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Row = {
  id: number;
  staff_remonte: string;
  type: string;
  description: string;
  prevenu: string;
  auteur: string;
  date: string;
};

export default function RemonteesPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    const { data, error } = await supabase
      .from("remontees_staff")
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
      .from("remontees_staff")
      .insert({
        staff_remonte: "",
        type: "Erreur",
        description: "",
        prevenu: "Non",
        auteur: "",
        date: "",
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
      .from("remontees_staff")
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
      .from("remontees_staff")
      .delete()
      .eq("id", id);

    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Remontées Staff</h1>

        <button
          onClick={addRow}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg"
        >
          + Ajouter une remontée
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-7 gap-3">

            <input
              value={row.staff_remonte}
              onChange={(e) =>
                updateRow(row.id, "staff_remonte", e.target.value)
              }
              className="input"
              placeholder="Pseudo du staff"
            />

            <select
              value={row.type}
              onChange={(e) =>
                updateRow(row.id, "type", e.target.value)
              }
              className="input"
            >
              <option>Erreur</option>
              <option>Point positif</option>
            </select>

            <input
              value={row.description}
              onChange={(e) =>
                updateRow(row.id, "description", e.target.value)
              }
              className="input"
              placeholder="Description"
            />

            <select
              value={row.prevenu}
              onChange={(e) =>
                updateRow(row.id, "prevenu", e.target.value)
              }
              className="input"
            >
              <option>Non</option>
              <option>Oui</option>
            </select>

            <input
              value={row.auteur}
              onChange={(e) =>
                updateRow(row.id, "auteur", e.target.value)
              }
              className="input"
              placeholder="Staff qui remonte"
            />

            <input
              value={row.date}
              onChange={(e) =>
                updateRow(row.id, "date", e.target.value)
              }
              className="input"
              placeholder="Date"
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
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Row = {
  id: number;
  pseudo: string;
  discord: string;
  commentaire: string;
  date: string;
  ajoute_par: string;
};

export default function BLStaffPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    const { data, error } = await supabase
      .from("bl_staff")
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
      .from("bl_staff")
      .insert({
        pseudo: "",
        discord: "",
        commentaire: "",
        date: "",
        ajoute_par: "",
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
      .from("bl_staff")
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
      .from("bl_staff")
      .delete()
      .eq("id", id);

    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          BL Staff
        </h1>

        <button
          onClick={addRow}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg"
        >
          + Ajouter une entrée
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-6 gap-3">

            <input
              value={row.pseudo}
              onChange={(e) =>
                updateRow(row.id, "pseudo", e.target.value)
              }
              className="input"
              placeholder="Pseudo"
            />

            <input
              value={row.discord}
              onChange={(e) =>
                updateRow(row.id, "discord", e.target.value)
              }
              className="input"
              placeholder="Discord"
            />

            <input
              value={row.commentaire}
              onChange={(e) =>
                updateRow(row.id, "commentaire", e.target.value)
              }
              className="input"
              placeholder="Commentaire"
            />

            <input
              value={row.date}
              onChange={(e) =>
                updateRow(row.id, "date", e.target.value)
              }
              className="input"
              placeholder="Date"
            />

            <input
              value={row.ajoute_par}
              onChange={(e) =>
                updateRow(row.id, "ajoute_par", e.target.value)
              }
              className="input"
              placeholder="Staff qui ajoute"
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
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
    const { data } = await supabase.from("bl_staff").select("*").order("id");
    setRows(data || []);
  }

  async function addRow() {
    const { data } = await supabase
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

    if (data) setRows((prev) => [...prev, data]);
  }

  async function updateRow(id: number, field: string, value: string) {
    await supabase.from("bl_staff").update({ [field]: value }).eq("id", id);

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  async function deleteRow(id: number) {
    await supabase.from("bl_staff").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="p-8 text-white">

      <div className="flex justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold">BL Staff</h1>
          <p className="text-gray-400">
            Liste des staffs blacklistés.
          </p>
        </div>

        <button
          onClick={addRow}
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold"
        >
          + Ajouter une entrée
        </button>

      </div>

      <div className="space-y-4">

        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-6 gap-4">

            <input
              value={row.pseudo}
              onChange={(e) => updateRow(row.id, "pseudo", e.target.value)}
              placeholder="Pseudo"
              className="input"
            />

            <input
              value={row.discord}
              onChange={(e) => updateRow(row.id, "discord", e.target.value)}
              placeholder="Discord"
              className="input"
            />

            <input
              value={row.commentaire}
              onChange={(e) =>
                updateRow(row.id, "commentaire", e.target.value)
              }
              placeholder="Commentaire"
              className="input"
            />

            <input
              value={row.date}
              onChange={(e) => updateRow(row.id, "date", e.target.value)}
              placeholder="Date"
              className="input"
            />

            <input
              value={row.ajoute_par}
              onChange={(e) =>
                updateRow(row.id, "ajoute_par", e.target.value)
              }
              placeholder="Staff qui ajoute"
              className="input"
            />

            <button
              onClick={() => deleteRow(row.id)}
              className="bg-red-600 px-3 rounded"
            >
              Suppr
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}
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
    const { data } = await supabase
      .from("remontees_staff")
      .select("*")
      .order("id");

    setRows(data || []);
  }

  async function addRow() {
    const { data } = await supabase
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

    if (data) setRows((prev) => [...prev, data]);
  }

  async function updateRow(id: number, field: string, value: string) {
    await supabase.from("remontees_staff").update({ [field]: value }).eq("id", id);

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  async function deleteRow(id: number) {
    await supabase.from("remontees_staff").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const total = rows.length;
  const erreurs = rows.filter((r) => r.type === "Erreur").length;
  const positifs = rows.filter((r) => r.type === "Positif").length;
  const prevenus = rows.filter((r) => r.prevenu === "Oui").length;

  return (
    <div className="p-8 text-white">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Remontées Staff</h1>
          <p className="text-gray-400">
            Suivi des erreurs et points positifs remontés sur les staffs.
          </p>
        </div>

        <button
          onClick={addRow}
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold"
        >
          + Ajouter une remontée
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">

        <Stat title="Total remontées" value={total} />
        <Stat title="Erreurs" value={erreurs} />
        <Stat title="Points positifs" value={positifs} />
        <Stat title="Staff prévenus" value={prevenus} />

      </div>

      <div className="space-y-4">

        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-7 gap-4">

            <input
              value={row.staff_remonte}
              onChange={(e) =>
                updateRow(row.id, "staff_remonte", e.target.value)
              }
              placeholder="Pseudo du staff"
              className="input"
            />

            <select
              value={row.type}
              onChange={(e) => updateRow(row.id, "type", e.target.value)}
              className="input"
            >
              <option>Erreur</option>
              <option>Positif</option>
            </select>

            <input
              value={row.description}
              onChange={(e) =>
                updateRow(row.id, "description", e.target.value)
              }
              placeholder="Description détaillée"
              className="input"
            />

            <select
              value={row.prevenu}
              onChange={(e) => updateRow(row.id, "prevenu", e.target.value)}
              className="input"
            >
              <option>Non</option>
              <option>Oui</option>
            </select>

            <input
              value={row.auteur}
              onChange={(e) => updateRow(row.id, "auteur", e.target.value)}
              placeholder="Staff qui remonte"
              className="input"
            />

            <input
              value={row.date}
              onChange={(e) => updateRow(row.id, "date", e.target.value)}
              placeholder="jj/mm/aaaa"
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

function Stat({ title, value }: any) {
  return (
    <div className="bg-black border border-yellow-500 p-4 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
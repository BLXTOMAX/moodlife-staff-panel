"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type BLRow = {
  id: number;
  pseudo: string;
  discord: string;
  commentaire: string;
  date: string;
  ajoute_par: string;
};

export default function BLStaffPage() {
  const [rows, setRows] = useState<BLRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRows();

    const channel = supabase
      .channel("bl-staff-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bl_staff" },
        async () => {
          await loadRows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadRows() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bl_staff")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erreur chargement bl_staff :", error);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  async function addRow() {
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("bl_staff").insert({
      pseudo: "",
      discord: "",
      commentaire: "",
      date: today,
      ajoute_par: "",
    });

    if (error) {
      console.error("Erreur ajout BL staff :", error);
    }
  }

  async function updateRow(id: number, field: keyof BLRow, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );

    const { error } = await supabase
      .from("bl_staff")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      console.error("Erreur update BL staff :", error);
      await loadRows();
    }
  }

  async function deleteRow(id: number) {
    const previous = rows;
    setRows((prev) => prev.filter((row) => row.id !== id));

    const { error } = await supabase.from("bl_staff").delete().eq("id", id);

    if (error) {
      console.error("Erreur suppression BL staff :", error);
      setRows(previous);
    }
  }

  async function clearAll() {
    const ok = window.confirm("Tu veux vraiment vider toute la blacklist staff ?");
    if (!ok) return;

    const { error } = await supabase.from("bl_staff").delete().neq("id", 0);
    if (error) {
      console.error("Erreur clear BL staff :", error);
    }
  }

  const total = rows.length;

  const thisMonth = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    return rows.filter((row) => {
      if (!row.date) return false;
      const d = new Date(row.date);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;
  }, [rows]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-yellow-500/15 bg-gradient-to-r from-black via-[#1a1200] to-black">
        <div className="flex flex-col gap-5 px-6 py-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500/80">
              Gestion staff
            </p>
            <h1 className="text-4xl font-extrabold">BL Staff</h1>
            <p className="mt-3 max-w-3xl text-sm text-gray-400">
              Liste des staffs blacklistés avec leur pseudo, Discord, commentaire,
              date et auteur de l’ajout.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={addRow}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:opacity-90"
            >
              + Ajouter une entrée
            </button>
            <button
              onClick={clearAll}
              className="rounded-2xl border border-red-800 bg-red-950/60 px-5 py-3 font-bold text-red-300 transition hover:bg-red-900/60"
            >
              Tout vider
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
        <StatCard title="Entrées BL" value={String(total)} />
        <StatCard title="Ajouts ce mois-ci" value={String(thisMonth)} />
        <StatCard
          title="Utilisation"
          valueText="Utilise cette page pour garder un historique propre des BL staff."
        />
      </div>

      <div className="px-6 pb-10">
        <div className="overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#050505] shadow-[0_0_40px_rgba(255,200,0,0.06)]">
          <div className="hidden grid-cols-6 gap-4 border-b border-yellow-500/15 bg-gradient-to-r from-[#120d00] to-[#060606] px-4 py-4 text-sm font-bold uppercase text-yellow-400 lg:grid">
            <div>Pseudo</div>
            <div>Discord</div>
            <div>Commentaire</div>
            <div>Date</div>
            <div>Staff qui ajoute</div>
            <div>Action</div>
          </div>

          {loading ? (
            <div className="px-4 py-10 text-sm text-gray-400">Chargement...</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-sm text-gray-500">
              Aucun staff blacklisté pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-yellow-500/10">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-6"
                >
                  <Field label="Pseudo">
                    <input
                      value={row.pseudo || ""}
                      onChange={(e) => updateRow(row.id, "pseudo", e.target.value)}
                      placeholder="Pseudo du staff"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Discord">
                    <input
                      value={row.discord || ""}
                      onChange={(e) => updateRow(row.id, "discord", e.target.value)}
                      placeholder="Discord"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Commentaire">
                    <textarea
                      value={row.commentaire || ""}
                      onChange={(e) =>
                        updateRow(row.id, "commentaire", e.target.value)
                      }
                      placeholder="Raison / commentaire"
                      className={`${inputClass} min-h-[96px] resize-y`}
                    />
                  </Field>

                  <Field label="Date">
                    <input
                      type="date"
                      value={row.date || ""}
                      onChange={(e) => updateRow(row.id, "date", e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Staff qui ajoute">
                    <input
                      value={row.ajoute_par || ""}
                      onChange={(e) =>
                        updateRow(row.id, "ajoute_par", e.target.value)
                      }
                      placeholder="Nom du staff"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Action">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="rounded-xl border border-red-700/60 bg-red-950/50 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-900/60"
                    >
                      Suppr.
                    </button>
                  </Field>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  valueText,
}: {
  title: string;
  value?: string;
  valueText?: string;
}) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-[#080808] via-[#120d00] to-[#080808] p-5">
      <p className="text-sm font-semibold text-gray-300">{title}</p>
      {valueText ? (
        <p className="mt-4 text-sm text-gray-400">{valueText}</p>
      ) : (
        <p className="mt-3 text-4xl font-extrabold text-yellow-400">{value}</p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500/70 lg:hidden">
        {label}
      </p>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-yellow-500/20 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/60";
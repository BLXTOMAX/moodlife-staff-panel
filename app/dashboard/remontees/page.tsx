"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type RemonteeRow = {
  id: number;
  staff_remonte: string;
  discord: string;
  type: string;
  description: string;
  prevenu: string;
  auteur: string;
  date: string;
};

export default function RemonteesPage() {
  const [rows, setRows] = useState<RemonteeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRows();

    const channel = supabase
      .channel("remontees-staff-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "remontees_staff" },
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
      .from("remontees_staff")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erreur chargement remontees_staff :", error);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  async function addRow() {
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("remontees_staff").insert({
      staff_remonte: "",
      discord: "",
      type: "Négative",
      description: "",
      prevenu: "Non",
      auteur: "",
      date: today,
    });

    if (error) {
      console.error("Erreur ajout remontée staff :", error);
    }
  }

  async function updateRow(
    id: number,
    field: keyof RemonteeRow,
    value: string
  ) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );

    const { error } = await supabase
      .from("remontees_staff")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      console.error("Erreur update remontée staff :", error);
      await loadRows();
    }
  }

  async function deleteRow(id: number) {
    const previous = rows;
    setRows((prev) => prev.filter((row) => row.id !== id));

    const { error } = await supabase
      .from("remontees_staff")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur suppression remontée staff :", error);
      setRows(previous);
    }
  }

  async function clearAll() {
    const ok = window.confirm("Tu veux vraiment vider toutes les remontées ?");
    if (!ok) return;

    const { error } = await supabase
      .from("remontees_staff")
      .delete()
      .neq("id", 0);

    if (error) {
      console.error("Erreur clear remontées staff :", error);
    }
  }

  const total = rows.length;
  const negatives = useMemo(
    () => rows.filter((r) => normalizeType(r.type) === "negative").length,
    [rows]
  );
  const positives = useMemo(
    () => rows.filter((r) => normalizeType(r.type) === "positive").length,
    [rows]
  );
  const prevenus = useMemo(
    () => rows.filter((r) => (r.prevenu || "").toLowerCase() === "oui").length,
    [rows]
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-yellow-500/15 bg-gradient-to-r from-black via-[#1a1200] to-black">
        <div className="flex flex-col gap-5 px-6 py-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500/80">
              Gestion staff
            </p>
            <h1 className="text-4xl font-extrabold">Remontées Staff</h1>
            <p className="mt-3 max-w-3xl text-sm text-gray-400">
              Suivi des erreurs et points positifs remontés sur les staffs, avec
              historique propre et visible par tous.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={addRow}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:opacity-90"
            >
              + Ajouter une remontée
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

      <div className="grid gap-4 px-6 py-6 md:grid-cols-4">
        <StatCard title="Total remontées" value={String(total)} />
        <StatCard title="Remontées négatives" value={String(negatives)} />
        <StatCard title="Remontées positives" value={String(positives)} />
        <StatCard title="Staff prévenus" value={String(prevenus)} />
      </div>

      <div className="px-6 pb-10">
        <div className="overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#050505] shadow-[0_0_40px_rgba(255,200,0,0.06)]">
          <div className="hidden grid-cols-7 gap-4 border-b border-yellow-500/15 bg-gradient-to-r from-[#120d00] to-[#060606] px-4 py-4 text-sm font-bold uppercase text-yellow-400 xl:grid">
            <div>Nom</div>
            <div>Discord</div>
            <div>Type</div>
            <div>Raison</div>
            <div>Prévenu ?</div>
            <div>Staff qui remonte</div>
            <div>Date / Action</div>
          </div>

          {loading ? (
            <div className="px-4 py-10 text-sm text-gray-400">Chargement...</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-sm text-gray-500">
              Aucune remontée pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-yellow-500/10">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-4 px-4 py-4 xl:grid-cols-7"
                >
                  <Field label="Nom">
                    <input
                      value={row.staff_remonte || ""}
                      onChange={(e) =>
                        updateRow(row.id, "staff_remonte", e.target.value)
                      }
                      placeholder="Nom du staff"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Discord">
                    <input
                      value={row.discord || ""}
                      onChange={(e) =>
                        updateRow(row.id, "discord", e.target.value)
                      }
                      placeholder="Discord"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Type">
                    <select
                      value={displayType(row.type)}
                      onChange={(e) => updateRow(row.id, "type", e.target.value)}
                      className={`${inputClass} ${
                        normalizeType(row.type) === "positive"
                          ? "border-green-500/40 text-green-300"
                          : "border-red-500/40 text-red-300"
                      }`}
                    >
                      <option value="Négative">Négative</option>
                      <option value="Positive">Positive</option>
                    </select>
                  </Field>

                  <Field label="Raison">
                    <textarea
                      value={row.description || ""}
                      onChange={(e) =>
                        updateRow(row.id, "description", e.target.value)
                      }
                      placeholder="Raison de la remontée"
                      className={`${inputClass} min-h-[96px] resize-y`}
                    />
                  </Field>

                  <Field label="Staff prévenu ?">
                    <select
                      value={row.prevenu || "Non"}
                      onChange={(e) => updateRow(row.id, "prevenu", e.target.value)}
                      className={inputClass}
                    >
                      <option value="Non">Non</option>
                      <option value="Oui">Oui</option>
                    </select>
                  </Field>

                  <Field label="Staff qui remonte">
                    <input
                      value={row.auteur || ""}
                      onChange={(e) => updateRow(row.id, "auteur", e.target.value)}
                      placeholder="Staff qui a mis la remontée"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Date / Action">
                    <div className="flex flex-col gap-3">
                      <input
                        type="date"
                        value={row.date || ""}
                        onChange={(e) => updateRow(row.id, "date", e.target.value)}
                        className={inputClass}
                      />
                      <button
                        onClick={() => deleteRow(row.id)}
                        className="rounded-xl border border-red-700/60 bg-red-950/50 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-900/60"
                      >
                        Suppr.
                      </button>
                    </div>
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

function normalizeType(value: string) {
  const v = (value || "").toLowerCase();
  if (v.includes("posit")) return "positive";
  return "negative";
}

function displayType(value: string) {
  return normalizeType(value) === "positive" ? "Positive" : "Négative";
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-[#080808] via-[#120d00] to-[#080808] p-5">
      <p className="text-sm font-semibold text-gray-300">{title}</p>
      <p className="mt-3 text-4xl font-extrabold text-yellow-400">{value}</p>
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
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500/70 xl:hidden">
        {label}
      </p>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-yellow-500/20 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/60";
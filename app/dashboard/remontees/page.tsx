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
  isNew?: boolean;
};

export default function RemonteesPage() {
  const [rows, setRows] = useState<RemonteeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

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

    const cleanedRows = ((data || []) as RemonteeRow[]).map((row) => ({
      ...row,
      isNew: false,
    }));

    setRows(cleanedRows);
    setDeletedIds([]);
    setLoading(false);
  }

  function addRow() {
    const today = new Date().toISOString().slice(0, 10);

    const newRow: RemonteeRow = {
      id: -Date.now() - Math.floor(Math.random() * 1000),
      staff_remonte: "",
      discord: "",
      type: "Négative",
      description: "",
      prevenu: "Non",
      auteur: "",
      date: today,
      isNew: true,
    };

    setRows((prev) => [...prev, newRow]);
  }

  function updateRow(id: number, field: keyof RemonteeRow, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  function deleteRow(id: number) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    if (!row.isNew && id > 0) {
      setDeletedIds((prev) => [...prev, id]);
    }

    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function clearAll() {
    const ok = window.confirm("Tu veux vraiment vider toutes les remontées ?");
    if (!ok) return;

    const idsToDelete = rows
      .filter((row) => !row.isNew && row.id > 0)
      .map((row) => row.id);

    setDeletedIds((prev) => [...prev, ...idsToDelete]);
    setRows([]);
  }

  async function saveAllRows() {
    setSavingAll(true);

    try {
      for (const id of deletedIds) {
        const { error } = await supabase
          .from("remontees_staff")
          .delete()
          .eq("id", id);

        if (error) {
          console.error(`Erreur suppression remontée ${id} :`, error);
        }
      }

      for (const row of rows) {
        const payload = {
          staff_remonte: row.staff_remonte,
          discord: row.discord,
          type: displayType(row.type),
          description: row.description,
          prevenu: row.prevenu || "Non",
          auteur: row.auteur,
          date: row.date,
        };

        if (row.isNew) {
          const { error } = await supabase.from("remontees_staff").insert(payload);

          if (error) {
            console.error("Erreur insert remontée :", error);
          }
        } else {
          const { error } = await supabase
            .from("remontees_staff")
            .update(payload)
            .eq("id", row.id);

          if (error) {
            console.error(`Erreur update remontée ${row.id} :`, error);
          }
        }
      }

      await loadRows();
    } catch (error) {
      console.error("Erreur sauvegarde remontées staff :", error);
    } finally {
      setSavingAll(false);
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
      <section className="relative overflow-hidden border-b border-yellow-500/15 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_28%),linear-gradient(135deg,rgba(0,0,0,0.98),rgba(24,18,0,0.92),rgba(10,10,10,0.98))]">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 px-6 py-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/15 bg-yellow-400/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.9)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-300">
                Gestion staff
              </p>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold text-white">
              Remontées Staff
            </h1>

            <div className="mt-4 h-px w-44 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              Suivi des erreurs et points positifs remontés sur les staffs, avec
              historique propre et visible par tous.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={addRow}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black shadow-[0_12px_24px_rgba(250,204,21,0.18)] transition hover:brightness-105"
            >
              + Ajouter une remontée
            </button>

            <button
              onClick={saveAllRows}
              disabled={savingAll}
              className="rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-black shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingAll ? "Sauvegarde..." : "💾 Enregistrer"}
            </button>

            <button
              onClick={clearAll}
              className="rounded-2xl border border-red-800 bg-red-950/60 px-5 py-3 font-bold text-red-300 transition hover:bg-red-900/60"
            >
              Tout vider
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-4">
        <StatCard title="Total remontées" value={String(total)} />
        <StatCard title="Remontées négatives" value={String(negatives)} />
        <StatCard title="Remontées positives" value={String(positives)} />
        <StatCard title="Staff prévenus" value={String(prevenus)} />
      </div>

      <div className="px-6 pb-4">
        <div className="rounded-2xl border border-yellow-500/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-3 text-sm text-white/72 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
          Les modifications restent locales jusqu’au clic sur{" "}
          <span className="font-semibold text-yellow-300">Enregistrer</span>.
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="overflow-hidden rounded-[26px] border border-yellow-500/20 bg-[#050505] shadow-[0_0_40px_rgba(255,200,0,0.06)]">
          <div className="hidden grid-cols-7 gap-4 border-b border-yellow-500/15 bg-[linear-gradient(135deg,rgba(26,18,0,0.95),rgba(6,6,6,0.98))] px-4 py-4 text-sm font-bold uppercase text-yellow-400 xl:grid">
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
                  className={`grid grid-cols-1 gap-4 px-4 py-4 xl:grid-cols-7 ${
                    normalizeType(row.type) === "positive"
                      ? "bg-green-950/10"
                      : "bg-red-950/10"
                  } ${row.isNew ? "ring-1 ring-yellow-500/20" : ""}`}
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
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-yellow-400/60 ${
                        normalizeType(row.type) === "positive"
                          ? "border-green-500/40 bg-green-950/20 text-green-300"
                          : "border-red-500/40 bg-red-950/20 text-red-300"
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
                      className={`${inputClass} min-h-[110px] resize-y`}
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
  const color =
    title.includes("négatives")
      ? "from-[#120808] via-[#2a0f0f] to-[#080808] border-red-500/20 text-red-300"
      : title.includes("positives")
      ? "from-[#081208] via-[#102a14] to-[#080808] border-green-500/20 text-green-300"
      : title.includes("prévenus")
      ? "from-[#081018] via-[#102038] to-[#080808] border-blue-500/20 text-blue-300"
      : "from-[#080808] via-[#221600] to-[#080808] border-yellow-500/20 text-yellow-300";

  return (
    <div
      className={`rounded-[24px] border bg-gradient-to-r p-5 shadow-[0_10px_28px_rgba(0,0,0,0.28)] ${color}`}
    >
      <p className="text-sm font-semibold text-gray-300">{title}</p>
      <p className="mt-3 text-4xl font-extrabold">{value}</p>
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
  "w-full rounded-xl border border-yellow-500/20 bg-[#090909] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/60 shadow-[0_0_20px_rgba(255,200,0,0.04)]";
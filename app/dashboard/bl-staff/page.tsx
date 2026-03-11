"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type BLRow = {
  id: number;
  pseudo: string;
  discord: string;
  license: string;
  commentaire: string;
  date: string;
  ajoute_par: string;
  isNew?: boolean;
};

export default function BLStaffPage() {
  const [rows, setRows] = useState<BLRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

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

    const cleanedRows = ((data || []) as BLRow[]).map((row) => ({
      ...row,
      license: row.license || "",
      isNew: false,
    }));

    setRows(cleanedRows);
    setDeletedIds([]);
    setLoading(false);
  }

  function addRow() {
    const today = new Date().toISOString().slice(0, 10);

    const newRow: BLRow = {
      id: -Date.now() - Math.floor(Math.random() * 1000),
      pseudo: "",
      discord: "",
      license: "",
      commentaire: "",
      date: today,
      ajoute_par: "",
      isNew: true,
    };

    setRows((prev) => [...prev, newRow]);
  }

  function updateRow(id: number, field: keyof BLRow, value: string) {
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
    const ok = window.confirm("Tu veux vraiment vider toute la blacklist staff ?");
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
        const { error } = await supabase.from("bl_staff").delete().eq("id", id);

        if (error) {
          console.error(`Erreur suppression BL staff ${id} :`, error);
        }
      }

      for (const row of rows) {
        const payload = {
          pseudo: row.pseudo,
          discord: row.discord,
          license: row.license,
          commentaire: row.commentaire,
          date: row.date,
          ajoute_par: row.ajoute_par,
        };

        if (row.isNew) {
          const { error } = await supabase.from("bl_staff").insert(payload);

          if (error) {
            console.error("Erreur ajout BL staff :", error);
          }
        } else {
          const { error } = await supabase
            .from("bl_staff")
            .update(payload)
            .eq("id", row.id);

          if (error) {
            console.error(`Erreur update BL staff ${row.id} :`, error);
          }
        }
      }

      await loadRows();
    } catch (error) {
      console.error("Erreur sauvegarde BL staff :", error);
    } finally {
      setSavingAll(false);
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
              BL Staff
            </h1>

            <div className="mt-4 h-px w-44 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              Liste des staffs blacklistés avec leur pseudo, Discord, License,
              commentaire, date et auteur de l’ajout.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={addRow}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black shadow-[0_12px_24px_rgba(250,204,21,0.18)] transition hover:brightness-105"
            >
              + Ajouter une entrée
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

      <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
        <StatCard title="Entrées BL" value={String(total)} />
        <StatCard title="Ajouts ce mois-ci" value={String(thisMonth)} />
        <StatCard
          title="Utilisation"
          valueText="Utilise cette page pour garder un historique propre des BL staff."
        />
      </div>

      <div className="px-6 pb-4">
        <div className="rounded-2xl border border-yellow-500/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-3 text-sm text-white/72 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
          Les modifications restent locales jusqu’au clic sur{" "}
          <span className="font-semibold text-yellow-300">Enregistrer</span>.
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="overflow-hidden rounded-[26px] border border-yellow-500/20 bg-[#050505] shadow-[0_0_40px_rgba(255,200,0,0.06)]">
          <div className="hidden grid-cols-7 gap-4 border-b border-yellow-500/15 bg-[linear-gradient(135deg,rgba(26,18,0,0.95),rgba(6,6,6,0.98))] px-4 py-4 text-sm font-bold uppercase text-yellow-400 lg:grid">
            <div>Pseudo</div>
            <div>Discord</div>
            <div>License</div>
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
                  className={`grid grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-7 ${
                    row.isNew
                      ? "ring-1 ring-yellow-500/20 bg-yellow-500/[0.03]"
                      : "bg-gradient-to-r from-yellow-950/10 via-transparent to-yellow-900/5"
                  }`}
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

                  <Field label="License">
                    <input
                      value={row.license || ""}
                      onChange={(e) => updateRow(row.id, "license", e.target.value)}
                      placeholder="License"
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
                      className={`${inputClass} min-h-[110px] resize-y`}
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
                      className="rounded-xl border border-red-700/60 bg-red-950/50 px-4 py-3 font-semibold text-red-300 shadow-[0_0_20px_rgba(255,0,0,0.08)] transition hover:bg-red-900/60"
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
  const color =
    title.includes("mois")
      ? "from-[#081018] via-[#102038] to-[#080808] border-blue-500/20 text-blue-300"
      : title.includes("Utilisation")
      ? "from-[#081208] via-[#102a14] to-[#080808] border-green-500/20 text-green-300"
      : "from-[#080808] via-[#221600] to-[#080808] border-yellow-500/20 text-yellow-300";

  return (
    <div
      className={`rounded-[24px] border bg-gradient-to-r p-5 shadow-[0_10px_28px_rgba(0,0,0,0.28)] ${color}`}
    >
      <p className="text-sm font-semibold text-gray-300">{title}</p>
      {valueText ? (
        <p className="mt-4 text-sm leading-6 text-gray-300">{valueText}</p>
      ) : (
        <p className="mt-3 text-4xl font-extrabold">{value}</p>
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
  "w-full rounded-xl border border-yellow-500/20 bg-[#090909] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/60 shadow-[0_0_20px_rgba(255,200,0,0.04)]";
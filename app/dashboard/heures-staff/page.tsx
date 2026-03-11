"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRows();

    const channel = supabase
      .channel("heures-staff-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "heures_staff" },
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
      .from("heures_staff")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erreur chargement heures_staff :", error);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  async function addRow() {
    const { error } = await supabase.from("heures_staff").insert({
      semaine: "",
      staff: "",
      heures: "",
      reports: "",
      auteur: "",
    });

    if (error) {
      console.error("Erreur ajout ligne :", error);
    }
  }

  async function updateRow(id: number, field: keyof Row, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );

    const { error } = await supabase
      .from("heures_staff")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      console.error("Erreur update ligne :", error);
      await loadRows();
    }
  }

  async function removeRow(id: number) {
    const previous = rows;
    setRows((prev) => prev.filter((row) => row.id !== id));

    const { error } = await supabase.from("heures_staff").delete().eq("id", id);

    if (error) {
      console.error("Erreur suppression ligne :", error);
      setRows(previous);
    }
  }

  const totalStaff = rows.length;

  const totalHeures = useMemo(() => {
    const toHours = (value: string) => {
      if (!value) return 0;
      const clean = value.trim();

      if (clean.includes(":")) {
        const [h, m] = clean.split(":").map(Number);
        return (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
      }

      const n = Number(clean.replace(",", "."));
      return isNaN(n) ? 0 : n;
    };

    return rows.reduce((acc, row) => acc + toHours(row.heures), 0);
  }, [rows]);

  const totalReports = useMemo(() => {
    return rows.reduce((acc, row) => {
      const n = Number(String(row.reports).replace(",", "."));
      return acc + (isNaN(n) ? 0 : n);
    }, 0);
  }, [rows]);

  const semaineAffichee =
    rows.find((r) => r.semaine?.trim())?.semaine || "01/01 au 07/01";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-yellow-500/20 bg-gradient-to-r from-black via-[#1a1200] to-black">
        <div className="flex flex-col gap-4 px-6 py-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500/80">
              Gestion staff
            </p>
            <h1 className="text-4xl font-extrabold">Tableau des heures et reports</h1>
            <p className="mt-3 max-w-3xl text-sm text-gray-400">
              Gère les heures jour par jour, les reports et le grade de chaque staff.
              Les semaines restent séparées pour garder un historique propre.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400">
              Semaine du {semaineAffichee}
            </div>

            <button
              onClick={addRow}
              className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:opacity-90"
            >
              + Ajouter une ligne
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
        <StatCard title="Staff" value={String(totalStaff)} />
        <StatCard title="Heures totales" value={totalHeures.toFixed(2).replace(".00", "")} />
        <StatCard title="Reports totaux" value={String(totalReports)} />
      </div>

      <div className="px-6 pb-10">
        <div className="overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#050505] shadow-[0_0_40px_rgba(255,200,0,0.06)]">
          <div className="grid grid-cols-6 gap-4 border-b border-yellow-500/15 bg-gradient-to-r from-[#120d00] to-[#060606] px-4 py-4 text-sm font-bold uppercase text-yellow-400">
            <div>Staff</div>
            <div>Semaine</div>
            <div>Heures</div>
            <div>Reports</div>
            <div>Auteur</div>
            <div>Action</div>
          </div>

          {loading ? (
            <div className="px-4 py-10 text-sm text-gray-400">Chargement...</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-sm text-gray-500">
              Aucun staff enregistré pour cette page.
            </div>
          ) : (
            <div className="divide-y divide-yellow-500/10">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-6"
                >
                  <input
                    value={row.staff || ""}
                    onChange={(e) => updateRow(row.id, "staff", e.target.value)}
                    placeholder="Nom du staff"
                    className={inputClass}
                  />

                  <input
                    value={row.semaine || ""}
                    onChange={(e) => updateRow(row.id, "semaine", e.target.value)}
                    placeholder="01/01 au 07/01"
                    className={inputClass}
                  />

                  <input
                    value={row.heures || ""}
                    onChange={(e) => updateRow(row.id, "heures", e.target.value)}
                    placeholder="2:30"
                    className={inputClass}
                  />

                  <input
                    value={row.reports || ""}
                    onChange={(e) => updateRow(row.id, "reports", e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />

                  <input
                    value={row.auteur || ""}
                    onChange={(e) => updateRow(row.id, "auteur", e.target.value)}
                    placeholder="Auteur"
                    className={inputClass}
                  />

                  <button
                    onClick={() => removeRow(row.id)}
                    className="rounded-xl border border-red-700/60 bg-red-950/50 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-900/60"
                  >
                    Suppr.
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-[#080808] via-[#120d00] to-[#080808] p-5">
      <p className="text-sm font-semibold text-gray-300">{title}</p>
      <p className="mt-3 text-4xl font-extrabold text-yellow-400">{value}</p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-yellow-500/20 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/60";
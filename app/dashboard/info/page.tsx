"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ChevronRight,
  Copy,
  Server,
  Shield,
  Users,
} from "lucide-react";

type ServerStats = {
  players: number | null;
  maxPlayers: number | null;
};

export default function InfoPage() {
  const [staffCount, setStaffCount] = useState(0);

  const [stats, setStats] = useState<ServerStats>({
    players: null,
    maxPlayers: null,
  });

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const rawAccess = localStorage.getItem("moodlife-user-access");

      if (rawAccess) {
        const accessMap = JSON.parse(rawAccess) as Record<string, string[]>;

        const count = Object.values(accessMap).filter((permissions) =>
          permissions.includes("/dashboard/info")
        ).length;

        setStaffCount(count);
      }
    } catch (error) {
      console.error("Erreur lecture staffCount :", error);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchStats() {
      try {
        const res = await fetch("/api/server-stats", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Impossible de récupérer les stats");
        }

        const data = await res.json();

        setStats({
          players: data.players ?? null,
          maxPlayers: data.maxPlayers ?? null,
        });
      } catch {
        setStats({
          players: null,
          maxPlayers: null,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    interval = setInterval(fetchStats, 15000);

    return () => clearInterval(interval);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText("connect cfx.re/join/5g6lmd");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const isOnline =
    !loading && stats.players !== null && stats.maxPlayers !== null;

  const fillPercentage =
    isOnline && stats.maxPlayers && stats.maxPlayers > 0
      ? Math.min((stats.players! / stats.maxPlayers) * 100, 100)
      : 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-yellow-400/15 bg-gradient-to-r from-black/80 via-black/70 to-black/40 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
            Info serveur
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            MoodLife en temps réel
          </h2>

          <div className="mt-4 h-px w-40 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85">
            Retrouve ici les informations principales du serveur, avec le nombre
            de joueurs connectés, l’état en direct et les accès rapides.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/85 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/90">
                  Joueurs connectés
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  État du serveur
                </h3>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  isOnline
                    ? "border-green-400/25 bg-green-500/10 text-green-300"
                    : "border-white/10 bg-white/5 text-white/60"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isOnline ? "bg-green-400" : "bg-white/40"
                  }`}
                />
                {loading ? "Chargement" : isOnline ? "En ligne" : "Indisponible"}
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-green-500/20 bg-gradient-to-br from-green-500/[0.12] via-green-400/[0.05] to-transparent p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/65">
                    <Server className="h-3.5 w-3.5" />
                    Statistiques live
                  </div>

                  <p className="mt-5 text-sm text-white/70">
                    Nombre actuel de joueurs
                  </p>

                  <div className="mt-3 flex items-end gap-3">
                    <p className="text-6xl font-black leading-none text-white">
                      {loading
                        ? "..."
                        : stats.players !== null
                        ? stats.players
                        : "--"}
                    </p>

                    <span className="pb-2 text-2xl font-bold text-white/40">
                      / {stats.maxPlayers ?? "--"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-white/70">
                    <Users className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm">Capacité</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">
                    {stats.maxPlayers ?? "--"} slots
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-xs text-white/55">
                  <span>Occupation</span>
                  <span>{Math.round(fillPercentage)}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-300 to-yellow-400 transition-all duration-700"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-white/65">
                <Activity className="h-4 w-4 text-green-300" />
                Mise à jour automatique toutes les 15 secondes.
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2 text-yellow-300">
              <Shield className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.24em]">
                Nombre de staff MoodLife
              </p>
            </div>

            <p className="mt-3 text-4xl font-black text-white">{staffCount}</p>

            <p className="mt-2 text-sm text-white/60">
              Staff ayant accès à cette page.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href="https://discord.gg/moodlife"
            target="_blank"
            rel="noreferrer"
            className="group block rounded-[28px] border border-indigo-400/20 bg-gradient-to-r from-indigo-500 to-indigo-400 p-6 text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(79,70,229,0.30)]"
          >
            <p className="text-sm text-white/80">Discord officiel</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-2xl font-black">Rejoindre le Discord</p>
              <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </div>
          </a>

          <a
            href="https://cfx.re/join/5g6lmd"
            className="group block rounded-[28px] border border-yellow-400/20 bg-gradient-to-r from-yellow-400 to-yellow-300 p-6 text-black shadow-[0_10px_30px_rgba(250,204,21,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(250,204,21,0.30)]"
          >
            <p className="text-sm text-black/70">Connexion directe</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-2xl font-black">Se connecter au serveur</p>
              <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </div>
          </a>

          <div className="rounded-[28px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
            <p className="text-sm text-white/60">Commande de connexion</p>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 md:flex-row md:items-center md:justify-between">
              <p className="break-all text-xl font-bold text-yellow-300">
                connect cfx.re/join/5g6lmd
              </p>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import SitePresenceWidget from "@/components/site-presence-widget";
import {
  Activity,
  ChevronRight,
  Copy,
  Server,
  Users,
  Radio,
  Sparkles,
  Wifi,
  ShieldCheck,
} from "lucide-react";

type ServerStats = {
  players: number | null;
  maxPlayers: number | null;
};

function QuickCard({
  href,
  title,
  subtitle,
  external = false,
  variant = "dark",
}: {
  href: string;
  title: string;
  subtitle: string;
  external?: boolean;
  variant?: "dark" | "yellow" | "blue";
}) {
  const styles =
    variant === "yellow"
      ? "border-yellow-400/20 bg-[linear-gradient(135deg,#fde047,#facc15,#f59e0b)] text-black shadow-[0_12px_30px_rgba(250,204,21,0.24)] hover:shadow-[0_18px_40px_rgba(250,204,21,0.30)]"
      : variant === "blue"
      ? "border-blue-400/20 bg-[linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa)] text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.32)]"
      : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] text-white shadow-[0_12px_30px_rgba(0,0,0,0.26)] hover:border-yellow-300/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.34)]";

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`group relative overflow-hidden rounded-[28px] border p-6 transition duration-300 hover:-translate-y-1 ${styles}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.05),transparent)]" />
      <div className="relative">
        <p
          className={`text-sm ${
            variant === "yellow" ? "text-black/70" : "text-white/80"
          }`}
        >
          {subtitle}
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-2xl font-black">{title}</p>
          <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
}

export default function InfoPage() {
  const [stats, setStats] = useState<ServerStats>({
    players: null,
    maxPlayers: null,
  });

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
      <section className="relative overflow-hidden rounded-[34px] border border-yellow-400/15 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.10),transparent_24%),linear-gradient(135deg,rgba(8,8,8,0.98),rgba(17,17,17,0.90),rgba(10,10,10,0.98))] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.46)]">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-yellow-200/5 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
            <Sparkles className="h-3.5 w-3.5" />
            Info serveur
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
            MoodLife en temps réel
          </h1>

          <div className="mt-4 h-px w-48 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 md:text-base">
            Retrouve ici les informations principales du serveur, avec l’état
            actuel, le nombre de joueurs connectés et les accès rapides les plus
            utiles pour le staff.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="relative overflow-hidden rounded-[30px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-emerald-400/5 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/90">
                Joueurs connectés
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                État du serveur
              </h2>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isOnline
                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-white/60"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.25)] ${
                  isOnline ? "bg-emerald-400" : "bg-white/40"
                }`}
              />
              {loading ? "Chargement" : isOnline ? "En ligne" : "Indisponible"}
            </div>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-[28px] border border-emerald-500/20 bg-[linear-gradient(135deg,rgba(34,197,94,0.14),rgba(250,204,21,0.06),rgba(0,0,0,0.04))] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/65">
                  <Radio className="h-3.5 w-3.5" />
                  Statistiques live
                </div>

                <p className="mt-5 text-sm text-white/70">
                  Nombre actuel de joueurs
                </p>

                <div className="mt-3 flex items-end gap-3">
                  <p className="text-6xl font-black leading-none text-white md:text-7xl">
                    {loading
                      ? "..."
                      : stats.players !== null
                      ? stats.players
                      : "--"}
                  </p>

                  <span className="pb-2 text-2xl font-bold text-white/35">
                    / {stats.maxPlayers ?? "--"}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:min-w-[220px]">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-white/70">
                    <Users className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm">Capacité</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">
                    {stats.maxPlayers ?? "--"} slots
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2 text-white/70">
                    <Wifi className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm">Disponibilité</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">
                    {loading ? "..." : isOnline ? "Serveur actif" : "Hors ligne"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between text-xs text-white/55">
                <span>Occupation</span>
                <span>{Math.round(fillPercentage)}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-black/30 ring-1 ring-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-yellow-400 transition-all duration-700"
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/65">
              <div className="inline-flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-300" />
                Mise à jour automatique toutes les 15 secondes.
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">
                <ShieldCheck className="h-3.5 w-3.5 text-yellow-300" />
                Monitoring actif
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <QuickCard
  href="https://discord.gg/moodlife"
  title="Rejoindre le Discord"
  subtitle="Discord officiel"
  external
  variant="blue"
/>

          <QuickCard
            href="https://cfx.re/join/5g6lmd"
            title="Se connecter au serveur"
            subtitle="Connexion directe"
            variant="yellow"
          />

          <div className="rounded-[28px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6 shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2 text-white/80">
              <Server className="h-4 w-4 text-yellow-300" />
              <p className="text-sm">Commande de connexion</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <p className="break-all text-lg font-bold text-yellow-300 md:text-xl">
                connect cfx.re/join/5g6lmd
              </p>

              <button
                type="button"
                onClick={handleCopy}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copié" : "Copier"}
              </button>
              <SitePresenceWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
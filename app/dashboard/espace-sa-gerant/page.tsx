"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarRange,
  FolderKanban,
  Scale,
  Shield,
  Sparkles,
} from "lucide-react";

type DayKey = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

type StaffRole =
  | "Gérant-Staff"
  | "Super-Administrateur"
  | "Administrateur"
  | "Modérateur"
  | "Helpeur";

type StaffRow = {
  id: number;
  name: string;
  role: StaffRole;
  hours: Record<DayKey, string>;
  reports: Record<DayKey, number>;
};

type WeekRecord = {
  id: string;
  label: string;
  rows: StaffRow[];
  nextId: number;
  createdAt: string;
};

type HoursStorage = {
  weeks: WeekRecord[];
  activeWeekId: string | null;
};

const HOURS_STORAGE_KEY = "moodlife-staff-weeks";

const DAY_KEYS: DayKey[] = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

function parseHourToMinutes(value: string) {
  const clean = value.trim().toLowerCase();

  if (!clean || clean === "0" || clean === "imprévu" || clean === "imprevu") {
    return 0;
  }

  const match = clean.match(/^(\d{1,2})[:h](\d{1,2})$/);
  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  }

  const asNumber = Number(clean.replace(",", "."));
  if (!Number.isNaN(asNumber)) {
    return Math.round(asNumber * 60);
  }

  return 0;
}

function formatMinutes(total: number) {
  const safe = Math.max(0, total);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-yellow-400/15 bg-[#090909] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/80">
        {title}
      </p>
      <p className="mt-4 text-4xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{subtitle}</p>
    </div>
  );
}

function ToolCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-yellow-400/15 bg-[#0b0b0b] p-6 transition hover:-translate-y-0.5 hover:border-yellow-400/30 hover:bg-[#101010]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-yellow-300">
          {icon}
        </div>
        <ArrowRight className="h-5 w-5 text-white/30 transition group-hover:translate-x-1 group-hover:text-yellow-300" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
    </Link>
  );
}

export default function EspaceSaGerantPage() {
  const [storage, setStorage] = useState<HoursStorage>({
    weeks: [],
    activeWeekId: null,
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(HOURS_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as HoursStorage;
      setStorage({
        weeks: Array.isArray(parsed.weeks) ? parsed.weeks : [],
        activeWeekId: parsed.activeWeekId ?? null,
      });
    } catch {
      setStorage({ weeks: [], activeWeekId: null });
    }
  }, []);

  const activeWeek = useMemo(
    () => storage.weeks.find((week) => week.id === storage.activeWeekId) ?? null,
    [storage]
  );

  const summary = useMemo(() => {
    if (!activeWeek) {
      return {
        staffCount: 0,
        totalReports: 0,
        totalMinutes: 0,
      };
    }

    const staffCount = activeWeek.rows.length;

    const totalReports = activeWeek.rows.reduce((sum, row) => {
      return (
        sum +
        DAY_KEYS.reduce((daySum, day) => daySum + (Number(row.reports[day]) || 0), 0)
      );
    }, 0);

    const totalMinutes = activeWeek.rows.reduce((sum, row) => {
      return (
        sum +
        DAY_KEYS.reduce((daySum, day) => daySum + parseHourToMinutes(row.hours[day]), 0)
      );
    }, 0);

    return {
      staffCount,
      totalReports,
      totalMinutes,
    };
  }, [activeWeek]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-yellow-400/15 bg-gradient-to-r from-[#080808] via-[#090909] to-[#110f05] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-300">
              <Sparkles className="h-3.5 w-3.5" />
              Espace S-A / Gérant Staff
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Outils de gestion staff
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 md:text-[15px]">
              Accès rapide aux outils principaux de suivi, de contrôle et de gestion.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[430px]">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/75">
                Semaine active
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {activeWeek?.label ?? "Aucune semaine"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/75">
                Accès
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Gestion & supervision
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Staffs suivis"
          value={String(summary.staffCount)}
          subtitle="Nombre de lignes staff sur la semaine active."
        />
        <StatCard
          title="Reports"
          value={String(summary.totalReports)}
          subtitle="Total des reports saisis sur la semaine active."
        />
        <StatCard
          title="Heures totales"
          value={formatMinutes(summary.totalMinutes)}
          subtitle="Temps cumulé de toute l’équipe cette semaine."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ToolCard
          href="/dashboard/heures-staff"
          icon={<CalendarRange className="h-5 w-5" />}
          title="Heures Staff"
          text="Gestion propre des semaines, des heures et des reports."
        />

        <ToolCard
          href="/dashboard/remontees"
          icon={<Bell className="h-5 w-5" />}
          title="Remontées"
          text="Accès direct aux remontées et au suivi des points à traiter."
        />

        <ToolCard
          href="/dashboard/bl-staff"
          icon={<Scale className="h-5 w-5" />}
          title="BL Staff"
          text="Accès rapide au suivi BL staff et aux dossiers concernés."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-3xl border border-yellow-400/15 bg-[#0a0a0a] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/80">
            Organisation
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Espace centralisé
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
            Regroupe uniquement les outils utiles à la gestion. Les accès déjà
            présents dans le menu gauche ne sont pas répétés ici.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Plus propre
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Moins de doublons, outils mieux rangés, lecture plus simple.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Réservé gestion
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Page pensée pour le suivi staff, les semaines et les accès utiles.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-yellow-400/15 bg-[#0a0a0a] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/80">
            Rappel
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            À garder propre
          </h2>

          <div className="mt-5 space-y-3">
            {[
              "Créer une nouvelle semaine au bon moment.",
              "Éviter d’écraser les anciennes semaines.",
              "Renseigner les reports et heures au fur et à mesure.",
              "Utiliser cette page comme point central de gestion.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                <p className="text-sm leading-6 text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
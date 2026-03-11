"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarRange,
  ClipboardList,
  FolderKanban,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

type DayKey = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

type StaffRole =
  | "Gérant-Staff"
  | "Super-Administrateur"
  | "Administrateur"
  | "Modérateur";

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

function QuickCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
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

    return { staffCount, totalReports, totalMinutes };
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
              Centre de gestion staff
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 md:text-[15px]">
              Regroupe les accès importants pour la supervision staff, le suivi
              des heures, les remontées et les outils réservés aux membres
              responsables de la gestion.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/75">
                Semaine active
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {activeWeek?.label ?? "Aucune semaine sélectionnée"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/75">
                Accès
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Supervision & gestion avancée
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Staffs suivis"
          value={String(summary.staffCount)}
          subtitle="Nombre total de lignes staff présentes dans la semaine active."
        />
        <StatCard
          title="Reports"
          value={String(summary.totalReports)}
          subtitle="Total des reports enregistrés sur la semaine sélectionnée."
        />
        <StatCard
          title="Heures totales"
          value={formatMinutes(summary.totalMinutes)}
          subtitle="Temps cumulé de toute l’équipe sur la semaine active."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <QuickCard
          href="/dashboard/heures-staff"
          icon={<CalendarRange className="h-5 w-5" />}
          title="Heures Staff"
          text="Suivi hebdomadaire avec semaines multiples, reports, total d’heures et édition complète."
        />
        <QuickCard
          href="/dashboard/remontees"
          icon={<Bell className="h-5 w-5" />}
          title="Remontées"
          text="Accès rapide au suivi des remontées et aux éléments à traiter par l’encadrement."
        />
        <QuickCard
          href="/dashboard/absence-staff"
          icon={<Users className="h-5 w-5" />}
          title="Absences Staff"
          text="Gère les absences, la disponibilité et l’organisation interne du staff."
        />
        <QuickCard
          href="/dashboard/commandes-staff"
          icon={<ClipboardList className="h-5 w-5" />}
          title="Commandes Staff"
          text="Retrouve les commandes utiles et les accès pratiques pour l’encadrement."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-yellow-400/15 bg-[#0a0a0a] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/80">
            Organisation
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Espace centralisé de gestion
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
            Cette page sert de point d’entrée rapide pour la gestion staff. Le
            but est de limiter le désordre, mieux répartir les outils et donner
            une lecture immédiate de la semaine active.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Gestion simplifiée
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Accès rapides, hiérarchie plus claire et meilleure séparation des
                outils sensibles.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Zone encadrée
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Réservé aux membres responsables de la gestion et de la
                supervision du staff.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-yellow-400/15 bg-[#0a0a0a] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/80">
            Rappel
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Bonnes pratiques
          </h2>

          <div className="mt-5 space-y-3">
            {[
              "Créer une nouvelle semaine manuellement avant de commencer le suivi.",
              "Mettre à jour les heures et reports au fur et à mesure pour éviter les oublis.",
              "Utiliser l’espace de gestion comme point central au lieu de disperser les outils.",
              "Conserver une lecture claire des semaines précédentes sans les écraser.",
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
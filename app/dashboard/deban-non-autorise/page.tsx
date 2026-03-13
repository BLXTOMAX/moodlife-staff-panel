"use client";

import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  Search,
  ShieldAlert,
  TerminalSquare,
} from "lucide-react";

type Tone = "danger" | "warning" | "neutral";

type ReasonCategory = {
  id: string;
  title: string;
  description: string;
  tone: Tone;
  reasons: string[];
};

const verificationCategories: ReasonCategory[] = [
  {
    id: "gameplay",
    title: "Cheats gameplay",
    description: "Godmode, stamina, no clip et autres avantages directs en jeu.",
    tone: "warning",
    reasons: [
      "Attempted to use 'Infinite Stamina'",
      "Attempted to use GodMode",
      "Attempted to use 'No Ragdoll'",
      "Attempted to use 'NoClip'",
      "Attempted to use Invisibility",
      "Attempted to use No Reload",
      "Attempted to use Spoofed Bullets",
      "Attempted to use Explosive Bullets",
      "Attempted to use Super Punch on a player",
      "Attempted to use Super Punch on a vehicle",
      "Attempted to Aim Bot",
      "Attempted to modify players' hitbox dimensions",
      "Attempted to modify player hitboxes",
      "Attempted to override default damages",
      "Attempted to add ammos in his weapon",
      "Attempted to remove a weapon from ...",
      "Anti Shoot Player",
      "Anti Spectate",
    ],
  },
  {
    id: "menus-tools",
    title: "Menus, executors & outils de triche",
    description: "Utilisation de menus, injections, softs externes et natives protégées.",
    tone: "danger",
    reasons: [
      "Attempted to use a Lua Menu",
      "Attempted to use HX Softwares",
      "Attempted to use Red Engine",
      "Attempted to use an executor",
      "Attempted to kill a player silently with Skript",
      "Attempted to kill a player (Eulen)",
      "Attempted to inject a resource",
      "Attempted to stop a resource",
      "Attempted to stop WaveShield",
      "Bad Native Execution",
      "CONSOLE",
      "Use Protected Trigger",
    ],
  },
  {
    id: "spawn-abuse",
    title: "Spawns, explosions & abus massifs",
    description: "Spawns interdits, projectiles, objets, véhicules et actions de masse.",
    tone: "danger",
    reasons: [
      "Attempted to use Weapon Spawn Safe",
      "Attempted to use a blacklisted weapon",
      "Attempted to spawn a blacklisted explosion",
      "Attempted to spawn a blacklisted projectile",
      "Attempted to spawn a blacklisted vehicle",
      "Attempted to spawn a blacklisted object",
      "Attempted to spawn [NOMBRE] explosions in less than 5 seconds",
      "Attempted to spawn [NOMBRE] projectiles in less than 5 seconds",
      "Attempted to spawn [NOMBRE] vehicles in less than 5 seconds",
      "Attempted to spawn [NOMBRE] objects in less than 5 seconds",
      "Attempted to spawn an invisible explosion",
      "Attempted to spawn an invisible projectiles",
      "Attempted to spawn an invisible objects",
      "Attempted to spawn an explosion",
      "Attempted to spawn a particle",
      "Attempted to spawn a weapon",
      "Attempted to spawn a ped",
      "Spawn Mass Vehicles",
      "Spawn Blacklist Vehicle",
      "Attempted to bomb a vehicle",
      "Attempted to throw a vehicle",
      "Attempted to crash players",
    ],
  },
  {
    id: "entity-network",
    title: "Entités, réseau & contrôle",
    description: "Manipulation d'entités, contrôle réseau et modifications anormales.",
    tone: "neutral",
    reasons: [
      "Attempted to change his vehicle handling",
      "Attempted to change his ped model",
      "Attempted to change his vehicle's power",
      "Attempted to request control of a vehicle",
      "Attempted to request control of an entity",
      "Attempted to request control of a ped",
      "Attempted to trigger a server event / Attempted to re-trigger a server event",
      "Attempted to spectate a player",
      "Attempted to add a blip on a player",
      "Clear Ped Tasks Event",
      "Tente de ce setjob",
      "Streamed Blacklist Textures",
    ],
  },
  {
    id: "evasion",
    title: "Évasion & contournement",
    description: "Tentatives de bypass, spoof ou contournement de sanctions.",
    tone: "warning",
    reasons: ["Attempted to ban evade (Spoof)"],
  },
];

const PC_VERIFICATION_STEPS = [
  "Vérifier que le motif du ban correspond bien à un flag AntiCheat listé.",
  "Faire rejoindre le joueur en vocal avant toute décision.",
  "Effectuer la vérification PC complète selon le document de référence.",
  "Rédiger une conclusion claire : déban, maintien du ban ou escalade.",
] as const;

const ALL_REASONS_COUNT = verificationCategories.reduce(
  (total, category) => total + category.reasons.length,
  0
);

const TONE_STYLES: Record<
  Tone,
  { badge: string; icon: string; dot: string }
> = {
  danger: {
    badge: "border-red-400/25 bg-red-500/10 text-red-200",
    icon: "border-red-400/25 bg-red-500/10 text-red-300",
    dot: "bg-red-300",
  },
  warning: {
    badge: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
    icon: "border-yellow-400/25 bg-yellow-400/10 text-yellow-300",
    dot: "bg-yellow-300",
  },
  neutral: {
    badge: "border-sky-400/25 bg-sky-500/10 text-sky-200",
    icon: "border-sky-400/25 bg-sky-500/10 text-sky-300",
    dot: "bg-sky-300",
  },
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function highlightText(text: string, query: string) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return text;

  const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return text.split(regex).map((part, index) => {
    const isMatch = part.toLowerCase() === cleanQuery.toLowerCase();

    return isMatch ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-md bg-yellow-400/20 px-1 py-0.5 text-yellow-200"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    );
  });
}

const baseCardClass =
  "rounded-3xl border border-yellow-400/15 bg-[#111111]/88 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm";

const SectionCard = memo(function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`${baseCardClass} p-6 ${className}`}>{children}</section>;
});

const SectionHeader = memo(function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold text-white">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{description}</p>
      ) : null}
    </div>
  );
});

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs font-semibold text-yellow-200 transition hover:bg-yellow-400/15"
    >
      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}

const CommandCard = memo(function CommandCard({
  title,
  command,
  example,
}: {
  title: string;
  command: string;
  example: string;
}) {
  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">Commande staff</p>
          <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
        </div>
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
          <TerminalSquare className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
        <code className="block break-all text-sm text-yellow-200">{command}</code>
        <p className="mt-3 text-sm text-white/55">Exemple : {example}</p>
      </div>

      <div className="mt-4">
        <CopyButton value={command} />
      </div>
    </SectionCard>
  );
});

const StatCard = memo(function StatCard({
  label,
  value,
  description,
  valueClassName = "text-white",
}: {
  label: string;
  value: string | number;
  description: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">{label}</p>
      <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
});

const ReasonItem = memo(function ReasonItem({
  reason,
  index,
  search,
  tone,
  categoryId,
}: {
  reason: string;
  index: number;
  search: string;
  tone: Tone;
  categoryId: string;
}) {
  const toneStyles = TONE_STYLES[tone];
  const content = (
    <>
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${toneStyles.icon}`}
      >
        {index + 1}
      </div>
      <div className="text-sm leading-7 text-white/88">{highlightText(reason, search)}</div>
    </>
  );

  return (
    <div className="rounded-2xl border border-yellow-400/10 bg-[#141414] p-4">
      <div className="flex items-start gap-3">
        {reason === "Clear Ped Tasks Event" ? (
          <Link href="/enpanne" className="flex items-start gap-3">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
});

function ReasonAccordion({
  category,
  reasons,
  search,
}: {
  category: ReasonCategory;
  reasons: string[];
  search: string;
}) {
  const [open, setOpen] = useState(false);
  const toneStyles = TONE_STYLES[category.tone];

  if (reasons.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 transition-colors">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02]"
        aria-expanded={open}
        aria-controls={`accordion-${category.id}`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneStyles.badge}`}
            >
              <span className={`h-2 w-2 rounded-full ${toneStyles.dot}`} />
              {category.title}
            </span>
            <span className="text-sm font-semibold text-white/80">
              {reasons.length} motif{reasons.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/60">{category.description}</p>
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-white/55 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={`accordion-${category.id}`}
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] border-t border-white/10" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 py-4">
            <div className="grid gap-3 md:grid-cols-2">
              {reasons.map((reason, index) => (
                <ReasonItem
                  key={`${category.id}-${reason}-${index}`}
                  categoryId={category.id}
                  index={index}
                  reason={reason}
                  search={search}
                  tone={category.tone}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DebanNonAutorisePage() {
  const [search, setSearch] = useState("");

  const normalizedSearch = useMemo(() => normalize(search), [search]);

  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) return verificationCategories;

    return verificationCategories
      .map((category) => ({
        ...category,
        reasons: category.reasons.filter((reason) => normalize(reason).includes(normalizedSearch)),
      }))
      .filter((category) => category.reasons.length > 0);
  }, [normalizedSearch]);

  const filteredCount = useMemo(
    () => filteredCategories.reduce((total, category) => total + category.reasons.length, 0),
    [filteredCategories]
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-red-500/20 bg-gradient-to-r from-[#080808] via-[#090909] to-[#120606] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.08),transparent_20%)]" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/15 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              Déban non autorisé
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Vérification PC & gestion AntiCheat
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/78 md:text-[15px]">
              Cette page regroupe les règles de traitement pour les demandes de déban liées à un ban
              AntiCheat. Lorsqu’un motif correspond à un flag listé ci-dessous, une vérification PC
              est obligatoire avant toute décision.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[440px] xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/75">Accès</p>
              <p className="mt-2 text-sm font-semibold text-white">AntiCheat uniquement</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/75">
                Grade minimum
              </p>
              <p className="mt-2 text-sm font-semibold text-white">Administrateur</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/75">Statut</p>
              <p className="mt-2 text-sm font-semibold text-red-300">Déban encadré</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-red-500/20 bg-red-500/[0.08] p-5 shadow-[0_10px_24px_rgba(127,29,29,0.16)]">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-2 text-red-300">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Accès restreint</h2>
            <p className="mt-2 text-sm leading-6 text-white/78">
              Les vérifications PC et les débans AC sont <span className="font-semibold text-red-300">strictement réservés</span> à l’équipe AntiCheat avec un grade minimum <span className="font-semibold text-yellow-300">Administrateur</span>. Aucun autre staff ne doit traiter ce type de dossier seul.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Motifs listés"
          value={ALL_REASONS_COUNT}
          description="Motifs AntiCheat nécessitant une vérification PC."
        />
        <StatCard
          label="Catégories"
          value={verificationCategories.length}
          description="Motifs rangés par type pour une lecture plus rapide."
          valueClassName="text-sky-300"
        />
        <StatCard
          label="Résultats affichés"
          value={normalizedSearch ? filteredCount : ALL_REASONS_COUNT}
          description={
            normalizedSearch
              ? "Motifs correspondant à la recherche."
              : "Nombre total actuellement visibles."
          }
          valueClassName="text-emerald-300"
        />
        <StatCard
          label="Dernière refonte"
          value="UI+"
          description="Présentation simplifiée, triée et mieux hiérarchisée."
          valueClassName="text-yellow-200"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <CommandCard
              title="Déban AC"
              command="F8 → waveshield unban [id ban]"
              example="waveshield unban 21324"
            />
            <CommandCard
              title="Ban AC"
              command="F8 → waveshield ban [id] [raison]"
              example="waveshield ban 54 moddeur"
            />
          </div>

          <SectionCard>
            <SectionHeader
              eyebrow="Motifs AntiCheat"
              title="Motifs nécessitant une vérification PC"
              description="La liste a été réorganisée par catégorie pour éviter l'effet bloc. Utilise la recherche pour filtrer rapidement un flag précis."
            />

            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Rechercher un motif, un mot-clé, une raison..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-yellow-400/15 bg-[#0b0b0b]/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/35 focus:bg-[#111111]"
              />
            </div>

            <div className="mt-5 space-y-4">
              {filteredCategories.map((category) => (
                <ReasonAccordion
                  key={category.id}
                  category={category}
                  reasons={category.reasons}
                  search={search}
                />
              ))}

              {filteredCategories.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/60">
                  Aucun motif trouvé pour <span className="text-yellow-300">“{search}”</span>.
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">Document</p>
                <h2 className="mt-1 text-xl font-bold text-white">Guide de vérification PC</h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/75">
              Document de référence pour conduire une vérification PC complète, suivre la procédure
              correctement et justifier la décision finale.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-yellow-300/80">
                Dernière modification
              </p>
              <p className="mt-2 text-sm text-white/85">Vendredi 16 août 2024 à 00:33</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Ajout de 31 bans, total de 67 bans, remise en page des bans et mise à jour du
                document de vérification PC.
              </p>
            </div>

            <a
              href="https://docs.google.com/document/d/1KLfrinkKH6eBt2LwhEzOI2R9MhRKAl-JvadeOGdlT4k/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15"
            >
              Ouvrir le document
            </a>
          </SectionCard>

          <SectionCard>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-2 text-red-300">
                <Ban className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">Procédure</p>
                <h2 className="mt-1 text-xl font-bold text-white">Traitement recommandé</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {PC_VERIFICATION_STEPS.map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-yellow-400/25 bg-yellow-400/10 text-xs font-bold text-yellow-200">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-white/78">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <section className="rounded-3xl border border-red-500/20 bg-red-500/[0.08] p-5 shadow-[0_10px_24px_rgba(127,29,29,0.16)]">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-2 text-red-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Rappel critique</h3>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Si le motif de ban apparaît dans cette liste, le dossier ne doit pas être traité
                  comme un simple déban classique. Une vérification PC est obligatoire avant
                  validation.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

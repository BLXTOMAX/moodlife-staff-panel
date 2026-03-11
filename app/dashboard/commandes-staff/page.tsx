"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Search,
  Car,
  UserCog,
  Shield,
  AlertTriangle,
  TerminalSquare,
} from "lucide-react";

type CommandItem = {
  command: string;
  description: string;
  note?: string;
};

type CommandSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  intro: string;
  commands: CommandItem[];
};

const sections: CommandSection[] = [
  {
    id: "vehicules",
    title: "Véhicules",
    icon: <Car className="h-5 w-5" />,
    intro:
      "Commandes utiles pour la gestion rapide des véhicules en intervention staff.",
    commands: [
      {
        command: "/car sultan",
        description:
          "Fait apparaître le véhicule souhaité. Remplacez “sultan” par le modèle voulu.",
        note: "Autorisé uniquement : Panto / Sanchez.",
      },
      {
        command: "/dv",
        description: "Supprime le véhicule souhaité.",
      },
    ],
  },
  {
    id: "joueur",
    title: "Actions Joueur",
    icon: <UserCog className="h-5 w-5" />,
    intro:
      "Commandes de gestion et d’assistance pour intervenir rapidement sur un joueur.",
    commands: [
      {
        command: "/revive ID",
        description: "Réanime le joueur ciblé.",
      },
      {
        command: "/heal ID",
        description: "Soigne le joueur ciblé.",
      },
      {
        command: "/goto ID",
        description: "Vous téléporte vers l’ID indiqué.",
      },
      {
        command: "/bring ID",
        description: "Téléporte le joueur ciblé jusqu’à vous.",
      },
      {
        command: "/registeroff licence",
        description: "Permet de register quelqu’un qui est déconnecté.",
      },
      {
        command: "/bringback ID",
        description: "Commande de retour du joueur.",
      },
    ],
  },
  {
    id: "sanctions",
    title: "Sanctions",
    icon: <Shield className="h-5 w-5" />,
    intro:
      "Commandes à utiliser pour sanctionner proprement un joueur, avec raison et durée adaptées.",
    commands: [
      {
        command: "/prison ID Temps Raison",
        description: "Met un joueur en prison.",
        note: "Le temps est exprimé en minutes.",
      },
      {
        command: "/ban ID Temps Raison",
        description: "Bannit un joueur connecté.",
        note: "Le temps est exprimé en heures.",
      },
      {
        command: "/banoffline licence Temps Raison",
        description: "Bannit un joueur déconnecté à partir de sa licence.",
        note: "Le temps est exprimé en heures.",
      },
      {
        command: "/sprison ID",
        description: "Sort un joueur de jail.",
      },
      {
        command: "/waveshield ban ID Raison",
        description: "Ban permanent via Waveshield.",
        note: "Uniquement pour les moddeurs.",
      },
      {
        command: "/unban licence",
        description: "Débannit une licence.",
      },
    ],
  },
  {
    id: "anticheat",
    title: "Anticheat",
    icon: <TerminalSquare className="h-5 w-5" />,
    intro:
      "Commandes liées à l’anticheat, réservées à un usage strictement encadré.",
    commands: [
      {
        command: "F8 : Waveshield unban ID",
        description: "Permet d’unban via Waveshield depuis la console F8.",
        note: "Admin uniquement.",
      },
    ],
  },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "ig");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-md bg-yellow-400/20 px-1 py-0.5 text-yellow-200"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-white/60">{description}</p>
    </div>
  );
}

function CommandCard({
  item,
  index,
  query,
}: {
  item: CommandItem;
  index: number;
  query: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-yellow-400/15 bg-[#151515]/92 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/35 hover:bg-[#1b1b1b]">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/[0.05] via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/15 text-sm font-extrabold text-yellow-200 shadow-[0_0_12px_rgba(255,215,0,0.12)]">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="inline-flex max-w-full rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2">
            <code className="break-all text-sm font-semibold text-yellow-200">
              {highlightText(item.command, query)}
            </code>
          </div>

          <p className="mt-3 text-sm leading-7 text-white/90">
            {highlightText(item.description, query)}
          </p>

          {item.note && (
            <div className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/70">
              {highlightText(item.note, query)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AccordionItem({
  section,
  isOpen,
  onToggle,
  query,
}: {
  section: CommandSection;
  isOpen: boolean;
  onToggle: () => void;
  query: string;
}) {
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return section.commands;

    const q = normalize(query);
    return section.commands.filter((item) =>
      normalize(
        `${item.command} ${item.description} ${item.note ?? ""}`
      ).includes(q)
    );
  }, [query, section.commands]);

  return (
    <div className="overflow-hidden rounded-3xl border border-yellow-400/15 bg-[#111111]/88 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-300 hover:border-yellow-400/25">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
              {section.icon}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Catégorie
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                {section.title}
              </h2>
            </div>
          </div>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/72">
            {section.intro}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/70 md:inline-flex">
            {filteredCommands.length} commande
            {filteredCommands.length > 1 ? "s" : ""}
          </span>

          <ChevronDown
            className={`h-5 w-5 shrink-0 text-yellow-400 transition duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
  className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-white/10 px-6 ${
    isOpen ? "max-h-[1000px] py-5 opacity-100" : "max-h-0 py-0 opacity-0"
  }`}
>
  {filteredCommands.length > 0 ? (
    <div className="grid gap-3">
      {filteredCommands.map((item, index) => (
        <CommandCard
          key={`${section.id}-${item.command}-${index}`}
          item={item}
          index={index}
          query={query}
        />
      ))}
    </div>
  ) : (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/60">
      Aucune commande trouvée dans cette catégorie pour la recherche{" "}
      <span className="text-yellow-300">“{query}”</span>.
    </div>
  )}
</div>
    </div>
  );
}

export default function CommandesStaffPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const totalCommands = useMemo(
    () => sections.reduce((acc, section) => acc + section.commands.length, 0),
    []
  );

  const filteredTotals = useMemo(() => {
    if (!search.trim()) {
      return {
        sectionsWithResults: sections.length,
        commandsWithResults: totalCommands,
      };
    }

    const q = normalize(search);

    const sectionsWithResults = sections.filter((section) =>
      section.commands.some((item) =>
        normalize(
          `${item.command} ${item.description} ${item.note ?? ""}`
        ).includes(q)
      )
    ).length;

    const commandsWithResults = sections.reduce((acc, section) => {
      return (
        acc +
        section.commands.filter((item) =>
          normalize(
            `${item.command} ${item.description} ${item.note ?? ""}`
          ).includes(q)
        ).length
      );
    }, 0);

    return { sectionsWithResults, commandsWithResults };
  }, [search, totalCommands]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-yellow-400/15 bg-gradient-to-r from-black/80 via-black/70 to-black/40 p-7 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
            Commandes Staff
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Commandes utiles IG
          </h1>

          <div className="mt-4 h-px w-40 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/82">
            Voici les principales commandes à connaître pour vous aider dans
            votre expérience en tant que staff. Utilisez-les proprement,
            uniquement dans le cadre de vos permissions et en respectant le
            règlement staff.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Catégories"
          value={sections.length}
          description="Blocs de commandes disponibles."
        />

        <StatCard
          label="Commandes"
          value={totalCommands}
          description="Commandes répertoriées sur cette page."
        />

        <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.06] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-2 text-yellow-300">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.24em]">Rappel</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/80">
            Certaines commandes sont strictement réservées à des situations
            précises ou à un grade particulier. Toute utilisation abusive peut
            entraîner une sanction.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-yellow-400/15 bg-[#111111]/88 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Rechercher une commande, un mot-clé, une action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-yellow-400/15 bg-[#0b0b0b]/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/35 focus:bg-[#111111]"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/55">
          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1">
            {filteredTotals.sectionsWithResults} catégorie
            {filteredTotals.sectionsWithResults > 1 ? "s" : ""} correspondante
            {filteredTotals.sectionsWithResults > 1 ? "s" : ""}
          </span>
          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1">
            {filteredTotals.commandsWithResults} commande
            {filteredTotals.commandsWithResults > 1 ? "s" : ""} trouvée
            {filteredTotals.commandsWithResults > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-red-500/15 bg-red-500/[0.06] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl border border-red-400/20 bg-red-400/10 p-2 text-red-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Anticheat ADMIN uniquement
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/78">
              Les commandes liées à Waveshield et à l’anticheat doivent être
              utilisées uniquement par les personnes autorisées. Le ban
              permanent Waveshield est réservé aux moddeurs uniquement.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <AccordionItem
            key={section.id}
            section={section}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex((prev) => (prev === index ? null : index))
            }
            query={search}
          />
        ))}
      </div>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Search,
  ShieldCheck,
  Gavel,
  Siren,
  AlertTriangle,
} from "lucide-react";

type RuleSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  accent: string;
  intro: string;
  rules: string[];
};

const sections: RuleSection[] = [
  {
    id: "general",
    title: "Règles Générales Staff",
    icon: <ShieldCheck className="h-5 w-5" />,
    accent: "text-yellow-300",
    intro:
      "Ces règles concernent le comportement général du staff sur Discord, en ticket, en salon et dans la gestion globale du serveur.",
    rules: [
      "Une orthographe correcte est requise, que ce soit dans les channels RP/HRP ou dans les tickets.",
      "Aucune embrouille avec les joueurs dans n’importe quel channel n’est tolérée.",
      "Aucune discrimination ou moquerie envers un joueur ou un staff n’est tolérée.",
      "Un sang-froid est requis malgré le comportement de certains joueurs.",
      "Lors des dossiers RI/RL, il est obligatoire de mentionner l’un d’eux afin qu’ils puissent poster le dossier.",
      "Pour toute fédéral à vie, l’accord doit passer par un R-L.",
      "Pour toute descente, l’accord doit passer par un R-L, R-I ou S-A.",
      "Il est interdit de montrer les logs à des joueurs. Cela vaut également pour le mode staff IG.",
      "Ne pas raconter sa vie dans les tickets.",
      "Quand vous bannissez un joueur pour mort RP en attente de wipe, merci de mettre directement la licence dans 💢・deban-ac-wipe.",
      "Ne pas être AFK en support. Si c’est le cas, allez en vocal staff et non dans un support.",
      "Les vocaux staff sont réservés aux staffs et non pour discuter avec vos amis joueurs.",
      "Merci de prendre les BDA en restant impartial.",
      "Il est interdit de stream un autre jeu que MoodLife en support.",
      "Le respect de la hiérarchie est obligatoire. Si un modérateur vous dit d’aller staff, il vous est interdit de lui manquer de respect.",
    ],
  },
  {
    id: "ig",
    title: "Règles IG",
    icon: <Siren className="h-5 w-5" />,
    accent: "text-yellow-300",
    intro:
      "Ces règles encadrent l’utilisation des permissions staff et votre comportement directement en jeu.",
    rules: [
      "Interdiction de retirer son noclip pour régler des reports IG.",
      "Il est interdit de jouer sur un autre serveur RP que MoodLife. Cependant, vous êtes autorisé à jouer sur des serveurs GF, tels que V3 PVP. Toute infraction à cette règle entraînera un démote.",
      "Il est interdit de parler en pleine scène avec des joueurs.",
      "Lors de vos interventions sur les reports, il vous est interdit de mal parler aux joueurs.",
      "Il est interdit de gérer une scène de son groupe même si vous n’êtes pas dedans, sauf si aucun autre staff n’est disponible. Si d’autres staffs sont présents mais gèrent autre chose, le groupe qui se plaint attend que le staff se libère.",
      "Vous devez rester impartial sur tous vos reports.",
      "Vous êtes dans l’obligation de régler un report entièrement.",
      "Au moment d’un ban, vous êtes dans l’obligation de prendre le temps d’écrire toutes les raisons du ban. Ne faites rien à la va-vite sous peine d’avertissement, et n’abusez pas sur les durées de ban.",
      "Interdit de faire du favoritisme.",
      "Aucun abus de pouvoir n’est accepté.",
      "Interdit de se TP à une personne sans noclip.",
      "Interdiction de porter un joueur et de se mettre en noclip avec.",
      "Interdit de jouer avec les noms quand vous êtes en RP.",
      "Interdiction d’utiliser une de vos permissions en RP.",
      "Interdit de régler vos propres scènes.",
      "Interdit de se /car un autre véhicule que la Panto ou la Sanchez sans autorisation d’un SA ou GS.",
      "Interdit de faire des annonces IG sans autorisation d’un SA ou GS.",
      "Interdit de se mettre en tenue staff au milieu de plusieurs joueurs.",
      "Aucun ban permanent sauf pour : moddeur, mort RP, ventes de véhicules boutique.",
      "Aucun give d’argent n’est accepté sans accord d’un GS avec raisons valables.",
      "Aucun SetJob autorisé sauf RI/RL.",
      "Pour tout remboursement, merci de vérifier les preuves au préalable.",
      "Ce n’est pas parce que vous êtes avec vos amis que vous pouvez vous permettre d’abuser de vos permissions en /revive ou autre.",
      "Qu’il y ait 785 joueurs ou 5 sur le serveur, aucune des règles ne doit être enfreinte.",
    ],
  },
  {
    id: "sanctions",
    title: "Sanctions & Rappels Importants",
    icon: <Gavel className="h-5 w-5" />,
    accent: "text-yellow-300",
    intro:
      "Le non-respect du règlement staff peut entraîner des sanctions lourdes selon la gravité des faits.",
    rules: [
      "Toute personne ne respectant pas les règles indiquées s’expose à de lourdes sanctions.",
      "Aucun favoritisme ne sera toléré.",
      "Vous ne pouvez pas reprendre de groupe illégal ou d’entreprise : les joueurs sont prioritaires.",
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

function RuleCard({
  rule,
  index,
  query,
}: {
  rule: string;
  index: number;
  query: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-yellow-400/15 bg-[#161616]/90 p-4 shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/40 hover:bg-[#1d1d1d] hover:shadow-[0_0_20px_rgba(255,215,0,0.10)]">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/[0.03] via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-yellow-400/20 bg-yellow-400/10 text-xs font-bold text-yellow-300">
          {index + 1}
        </div>

        <p className="text-sm leading-7 text-white/95">
          {highlightText(rule, query)}
        </p>
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
  section: RuleSection;
  isOpen: boolean;
  onToggle: () => void;
  query: string;
}) {
  const filteredRules = useMemo(() => {
    if (!query.trim()) return section.rules;

    const q = normalize(query);
    return section.rules.filter((rule) => normalize(rule).includes(q));
  }, [query, section.rules]);

  const hasResults = filteredRules.length > 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-yellow-400/15 bg-[#101010]/88 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-300 hover:border-yellow-400/30">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-yellow-400/15 bg-yellow-400/10 p-2 text-yellow-300">
              {section.icon}
            </div>

            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${section.accent}`}>
                Section
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">{section.title}</h2>
            </div>
          </div>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/60">
            {section.intro}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65 md:inline-flex">
            {filteredRules.length} règle{filteredRules.length > 1 ? "s" : ""}
          </span>

          <ChevronDown
            className={`h-5 w-5 shrink-0 text-yellow-400 transition duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 px-6 py-5">
            {hasResults ? (
              <div className="grid gap-3">
                {filteredRules.map((rule, index) => (
                  <RuleCard
                    key={`${section.id}-${index}-${rule}`}
                    rule={rule}
                    index={index}
                    query={query}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                Aucune règle trouvée dans cette section pour la recherche{" "}
                <span className="text-yellow-300">“{query}”</span>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReglesStaffPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const totalRules = useMemo(
    () => sections.reduce((acc, section) => acc + section.rules.length, 0),
    []
  );

  const filteredTotals = useMemo(() => {
    if (!search.trim()) {
      return {
        sectionsWithResults: sections.length,
        rulesWithResults: totalRules,
      };
    }

    const q = normalize(search);

    const sectionsWithResults = sections.filter((section) =>
      section.rules.some((rule) => normalize(rule).includes(q))
    ).length;

    const rulesWithResults = sections.reduce((acc, section) => {
      return (
        acc +
        section.rules.filter((rule) => normalize(rule).includes(q)).length
      );
    }, 0);

    return { sectionsWithResults, rulesWithResults };
  }, [search, totalRules]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-black/80 via-black/70 to-black/40 p-7 shadow-[0_0_45px_rgba(255,255,255,0.03)]">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-yellow-400/5 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-yellow-300/5 blur-3xl" />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">
            Règlement Staff
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Règles Staff MoodLifeRP
          </h1>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/65">
            Retrouvez ici l’ensemble des règles du staff, organisées par sections,
            avec une recherche rapide et une lecture claire pour garder une gestion
            propre, sérieuse et impartiale du serveur.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-yellow-400/20 bg-[#111111]/80 p-5 shadow-[0_0_25px_rgba(255,215,0,0.08)] backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.24em] text-yellow-400/80">
            Sections
          </p>
          <p className="mt-3 text-3xl font-black text-white">{sections.length}</p>
          <p className="mt-2 text-sm text-white/60">Catégories principales</p>
        </div>

        <div className="rounded-2xl border border-yellow-400/20 bg-[#111111]/80 p-5 shadow-[0_0_25px_rgba(255,215,0,0.08)] backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.24em] text-yellow-400/80">
            Règles
          </p>
          <p className="mt-3 text-3xl font-black text-white">{totalRules}</p>
          <p className="mt-2 text-sm text-white/60">Règles répertoriées</p>
        </div>

        <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.05] p-5">
          <div className="flex items-center gap-2 text-yellow-300">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.24em]">Important</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Toute infraction au règlement staff peut entraîner des sanctions lourdes
            selon la gravité de la situation.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-yellow-400/15 bg-[#101010]/85 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="Rechercher une règle, un mot-clé, une sanction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-yellow-400/15 bg-[#0b0b0b]/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-yellow-400/40 focus:bg-[#111111]"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {filteredTotals.sectionsWithResults} section
            {filteredTotals.sectionsWithResults > 1 ? "s" : ""} correspondante
            {filteredTotals.sectionsWithResults > 1 ? "s" : ""}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {filteredTotals.rulesWithResults} règle
            {filteredTotals.rulesWithResults > 1 ? "s" : ""} trouvée
            {filteredTotals.rulesWithResults > 1 ? "s" : ""}
          </span>
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
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bot,
  MessageCircle,
  Search,
  Sparkles,
  X,
  ArrowRight,
} from "lucide-react";

type HelpItem = {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
  href?: string;
  hrefLabel?: string;
  suggestions?: string[];
  category: string;
};

const helpItems: HelpItem[] = [
  {
    id: "regles-staff",
    title: "Comment voir les règles staff ?",
    keywords: ["règles", "regles", "staff", "règlement", "reglement"],
    answer:
      "Les règles staff sont regroupées dans la page dédiée. Tu y retrouveras les règles générales, les règles IG et les sanctions importantes.",
    href: "/dashboard/regles-staff",
    hrefLabel: "Ouvrir les règles staff",
    suggestions: [
      "Qui peut accéder à Espace S-A / Gérant staff ?",
      "Où voir les commandes staff ?",
    ],
    category: "Règlement",
  },
  {
    id: "commandes-staff",
    title: "Où voir les commandes staff ?",
    keywords: ["commandes", "commande", "staff", "ig", "goto", "bring"],
    answer:
      "Les commandes utiles IG sont classées par catégorie pour aider les staffs à retrouver rapidement les actions joueur, sanctions et commandes anticheat.",
    href: "/dashboard/commandes-staff",
    hrefLabel: "Voir les commandes staff",
    suggestions: [
      "Comment voir les règles staff ?",
      "Qui peut deban AC ?",
    ],
    category: "Utilitaires",
  },
  {
    id: "absence-staff",
    title: "Comment ajouter une absence ?",
    keywords: ["absence", "absent", "congé", "conge", "indisponible"],
    answer:
      "Les absences se déclarent dans la page Absence staff. Elles doivent concerner des journées complètes et non une simple soirée ou un après-midi.",
    href: "/dashboard/absence-staff",
    hrefLabel: "Gérer les absences",
    suggestions: [
      "Où voir les heures staff ?",
      "Où gérer les accès mail ?",
    ],
    category: "Gestion staff",
  },
  {
    id: "heures-staff",
    title: "Où voir les heures staff ?",
    keywords: ["heures", "heures staff", "reports", "coins", "temps staff"],
    answer:
      "La page Heures staff permet de suivre les heures, les reports par jour, et le calcul des coins selon le grade et les bonus éventuels.",
    href: "/dashboard/heures-staff",
    hrefLabel: "Ouvrir les heures staff",
    suggestions: [
      "Comment ajouter une absence ?",
      "Où gérer les accès mail ?",
    ],
    category: "Gestion staff",
  },
  {
    id: "mail-acces",
    title: "Où gérer les accès mail ?",
    keywords: ["mail", "accès", "acces", "permissions", "autorisation"],
    answer:
      "La page Mail accès permet de voir les comptes enregistrés et d’attribuer précisément les catégories visibles pour chaque utilisateur.",
    href: "/dashboard/mail-acces",
    hrefLabel: "Ouvrir Mail accès",
    suggestions: [
      "Qui peut accéder à Espace S-A / Gérant staff ?",
      "Comment ajouter une absence ?",
    ],
    category: "Permissions",
  },
  {
    id: "espace-sa-gerant",
    title: "Qui peut accéder à Espace S-A / Gérant staff ?",
    keywords: ["sa", "gérant", "gerant", "espace sa", "permissions staff"],
    answer:
      "Cette page doit être réservée aux personnes autorisées. L’accès peut être donné depuis Mail accès en attribuant la permission correspondante.",
    href: "/dashboard/espace-sa-gerant",
    hrefLabel: "Ouvrir l’espace S-A / Gérant staff",
    suggestions: [
      "Où gérer les accès mail ?",
      "Qui peut deban AC ?",
    ],
    category: "Permissions",
  },
  {
    id: "deban-anticheat",
    title: "Qui peut deban AC ?",
    keywords: ["deban", "anticheat", "ac", "waveshield", "unban"],
    answer:
      "Les actions liées à l’anticheat doivent être réservées aux personnes autorisées. Réfère-toi à la page Deban anticheat / procédure AC pour appliquer la bonne méthode.",
    href: "/dashboard/deban-anticheat",
    hrefLabel: "Voir la procédure anticheat",
    suggestions: [
      "Où voir les commandes staff ?",
      "Qui peut accéder à Espace S-A / Gérant staff ?",
    ],
    category: "Anticheat",
  },
  {
    id: "info-serveur",
    title: "Où voir les infos serveur ?",
    keywords: ["info", "serveur", "joueurs", "discord", "connexion"],
    answer:
      "La page Info serveur regroupe l’état du serveur, le nombre de joueurs connectés, ainsi que les accès rapides Discord et connexion.",
    href: "/dashboard/info",
    hrefLabel: "Ouvrir Info serveur",
    suggestions: [
      "Où voir les commandes staff ?",
      "Comment voir les règles staff ?",
    ],
    category: "Serveur",
  },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreItem(item: HelpItem, query: string) {
  const q = normalize(query);
  let score = 0;

  if (normalize(item.title).includes(q)) score += 6;
  if (normalize(item.answer).includes(q)) score += 3;

  for (const keyword of item.keywords) {
    if (normalize(keyword).includes(q) || q.includes(normalize(keyword))) {
      score += 4;
    }
  }

  return score;
}

export default function HelpBot() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const featured = helpItems.slice(0, 6);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    return [...helpItems]
      .map((item) => ({
        item,
        score: scoreItem(item, query),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [query]);

  const selectedItem = useMemo(() => {
    if (selectedId) {
      return helpItems.find((item) => item.id === selectedId) ?? null;
    }

    if (results.length > 0) {
      return results[0];
    }

    return null;
  }, [selectedId, results]);

  function openQuestion(id: string) {
    setSelectedId(id);
    setOpen(true);
  }

  const smartSuggestions = selectedItem?.suggestions ?? [
    "Comment voir les règles staff ?",
    "Comment ajouter une absence ?",
    "Où gérer les accès mail ?",
  ];

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-yellow-400/25 bg-yellow-400 text-black shadow-[0_0_28px_rgba(250,204,21,0.45)] transition hover:scale-105 hover:bg-yellow-300"
        aria-label="Ouvrir l’assistant d’aide"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[28px] border border-yellow-400/20 bg-[#0c0f14]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="relative border-b border-white/10 p-5">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/[0.08] via-transparent to-transparent" />
            <div className="relative flex items-start gap-3">
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                <Bot className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-300/85">
                  Assistant MoodLife
                </p>
                <h3 className="mt-1 text-lg font-black text-white">
                  Aide intelligente
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Pose une question ou choisis un sujet fréquent.
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Ex : où gérer les accès mail ?"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedId(null);
                }}
                className="w-full rounded-2xl border border-yellow-400/15 bg-[#090b10] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/35"
              />
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-4">
            {!query.trim() && !selectedItem && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-sm font-semibold">Questions fréquentes</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {featured.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openQuestion(item.id)}
                        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-left text-sm text-white/82 transition hover:border-yellow-400/20 hover:bg-white/[0.03]"
                      >
                        <span>{item.title}</span>
                        <ArrowRight className="h-4 w-4 text-yellow-300" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {query.trim() && results.length > 0 && !selectedId && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                  Résultats
                </p>

                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className="block w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-yellow-400/20 hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {item.category}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-yellow-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query.trim() && results.length === 0 && !selectedId && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">
                  Aucune réponse exacte trouvée
                </p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Essaie avec des mots comme <span className="text-yellow-300">absence</span>,{" "}
                  <span className="text-yellow-300">règles</span>,{" "}
                  <span className="text-yellow-300">mail accès</span> ou{" "}
                  <span className="text-yellow-300">anticheat</span>.
                </p>
              </div>
            )}

            {selectedItem && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/85">
                    {selectedItem.category}
                  </p>
                  <h4 className="mt-2 text-lg font-bold text-white">
                    {selectedItem.title}
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm leading-7 text-white/82">
                    {selectedItem.answer}
                  </p>

                  {selectedItem.href && (
                    <Link
                      href={selectedItem.href}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15"
                    >
                      {selectedItem.hrefLabel ?? "Ouvrir la page"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">
                    Suggestions intelligentes
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {smartSuggestions.map((suggestion) => {
                      const linkedItem = helpItems.find(
                        (item) => item.title === suggestion
                      );

                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            if (linkedItem) setSelectedId(linkedItem.id);
                            setQuery("");
                          }}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75 transition hover:border-yellow-400/20 hover:bg-white/10"
                        >
                          {suggestion}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setQuery("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.03]"
                >
                  Revenir à l’accueil de l’assistant
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
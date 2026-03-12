"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  MessageCircle,
  Send,
  Sparkles,
  X,
  Search,
  ChevronRight,
} from "lucide-react";

type FaqItem = {
  keywords: string[];
  title: string;
  answer: string;
  command?: string;
  category?: string;
};

type Message = {
  role: "user" | "bot";
  text: string;
};

const faqData: FaqItem[] = [
  // COMMANDES STAFF
  {
  keywords: ["tp", "teleport", "téléport", "goto", "aller joueur"],
  title: "Téléportation vers un joueur",
  answer: "Pour vous téléporter vers un joueur, utilisez la commande /goto ID.",
  command: "/goto ID",
  category: "Commandes Staff",
},
  {
    keywords: ["bring", "ramener", "amener joueur", "tp joueur sur moi"],
    title: "Ramener un joueur",
    answer: "Pour ramener un joueur jusqu’à vous, utilisez /bring ID.",
    command: "/bring ID",
  },
  {
    keywords: ["revive", "reanimer", "réanimer", "mort joueur"],
    title: "Réanimation joueur",
    answer: "Pour réanimer un joueur, utilisez /revive ID.",
    command: "/revive ID",
  },
  {
    keywords: ["heal", "soigner", "vie joueur"],
    title: "Soin joueur",
    answer: "Pour soigner un joueur, utilisez /heal ID.",
    command: "/heal ID",
  },
  {
    keywords: ["ban", "bannir", "sanction lourde"],
    title: "Ban joueur connecté",
    answer: "Pour bannir un joueur connecté, utilisez /ban ID Temps Raison.",
    command: "/ban ID Temps Raison",
  },
  {
    keywords: ["ban offline", "banoffline", "joueur deco", "joueur déconnecté"],
    title: "Ban joueur déconnecté",
    answer: "Pour bannir un joueur déconnecté, utilisez /banoffline licence Temps Raison.",
    command: "/banoffline licence Temps Raison",
  },
  {
    keywords: ["prison", "jail", "mettre en prison"],
    title: "Prison staff",
    answer: "Pour mettre un joueur en prison, utilisez /prison ID Temps Raison.",
    command: "/prison ID Temps Raison",
  },
  {
    keywords: ["unjail", "sprison", "sortir prison", "sortir jail"],
    title: "Sortie de prison",
    answer: "Pour sortir un joueur de jail, utilisez /sprison ID.",
    command: "/sprison ID",
  },
  {
    keywords: ["registeroff", "register joueur deco", "inscrire joueur deco"],
    title: "Register hors ligne",
    answer: "Pour register quelqu’un qui est déconnecté, utilisez /registeroff licence.",
    command: "/registeroff licence",
  },
  {
    keywords: ["car", "spawn voiture", "vehicule", "véhicule"],
    title: "Spawn véhicule",
    answer: "Pour faire apparaître un véhicule, utilisez /car nomduvehicule. Autorisé uniquement : Panto / Sanchez.",
    command: "/car sultan",
  },
  {
    keywords: ["dv", "delete vehicle", "supprimer voiture", "supprimer véhicule"],
    title: "Suppression véhicule",
    answer: "Pour supprimer un véhicule, utilisez /dv.",
    command: "/dv",
  },
  {
    keywords: ["waveshield", "anticheat", "anti cheat", "unban waveshield"],
    title: "Commande anticheat",
    answer: "Pour unban via Waveshield depuis F8, utilisez : Waveshield unban ID. Réservé aux admins autorisés.",
    command: "F8 : Waveshield unban ID",
  },

  // RÈGLES STAFF
  {
    keywords: ["regles", "règles", "comportement staff", "attitude staff"],
    title: "Règles Staff",
    answer: "Consulte la catégorie Règles Staff pour les obligations de comportement, d’impartialité, d’activité et de respect du règlement interne.",
  },
  {
    keywords: ["conflit", "abus", "favoritisme", "impartialité"],
    title: "Impartialité staff",
    answer: "Un staff doit rester impartial, éviter tout abus et ne pas favoriser un joueur ou un groupe.",
  },

  // LICENSE
  {
    keywords: ["license", "licence", "identifier", "identifiant joueur"],
    title: "Licence joueur",
    answer: "La catégorie License sert à retrouver ou utiliser la licence d’un joueur pour certaines actions comme banoffline ou unban.",
  },

  // MAIL SUICIDE RP
  {
    keywords: ["mail suicide", "suicide rp", "ticket suicide", "demande suicide"],
    title: "Mail Suicide RP",
    answer: "La catégorie Mail Suicide RP sert à traiter les demandes liées aux suicides RP selon la procédure interne du serveur.",
  },

  // ABSENCE STAFF
  {
    keywords: ["absence", "absence staff", "indisponible", "absence panel"],
    title: "Absence Staff",
    answer: "La catégorie Absence Staff permet d’annoncer une absence ou une indisponibilité selon le format demandé par l’équipe.",
  },

  // ESPACE S-A / GÉRANT-STAFF
  {
    keywords: ["s-a", "gerant staff", "gérant staff", "espace sa", "espace gérant"],
    title: "Espace S-A / Gérant-Staff",
    answer: "Cette catégorie est réservée aux échanges et informations internes pour les S-A et Gérant-Staff.",
  },

  // DEBAN NON AUTORISÉ
  {
    keywords: ["deban", "deban non autorisé", "unban non autorisé", "déban"],
    title: "Deban Non Autorisé",
    answer: "Les demandes ou actions de déban non autorisées doivent suivre la procédure définie dans la catégorie Deban Non Autorisé.",
  },

  // MAIL ACCÈS
  {
    keywords: ["mail acces", "mail accès", "acces", "accès panel", "demande acces"],
    title: "Mail accès",
    answer: "La catégorie Mail accès sert à gérer les accès, autorisations et demandes liées aux outils ou espaces internes.",
  },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreQuestion(question: string, item: FaqItem) {
  const q = normalize(question);
  let score = 0;

  for (const keyword of item.keywords) {
    const k = normalize(keyword);

    if (q.includes(k)) score += k.length > 5 ? 3 : 2;

    const questionWords = q.split(/\s+/);
    const keywordWords = k.split(/\s+/);

    for (const word of keywordWords) {
      if (word.length > 2 && questionWords.includes(word)) {
        score += 1;
      }
    }
  }

  if (item.command && q.includes(normalize(item.command.replace("/", "")))) {
    score += 4;
  }

  return score;
}

function getBestAnswer(question: string) {
  const ranked = faqData
    .map((item) => ({
      item,
      score: scoreQuestion(question, item),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score <= 0) {
    return {
      text: "Je n’ai pas trouvé de réponse précise. Essaie avec des mots comme : tp, bring, revive, heal, ban, prison, véhicule…",
      suggestions: faqData.slice(0, 4).map((item) => item.command || item.title),
    };
  }

  const related = ranked
    .filter((entry) => entry.score > 0 && entry.item.title !== best.item.title)
    .slice(0, 3)
    .map((entry) => entry.item.command || entry.item.title);

  return {
  text: `${best.item.category ? `Catégorie : ${best.item.category}\n\n` : ""}${best.item.answer}${best.item.command ? `\n\nCommande : ${best.item.command}` : ""}`,
  suggestions: related,
};
}

export default function StaffFaqBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Salut, je suis l’assistant staff. Pose-moi une question sur une commande.",
    },
  ]);

  const quickSuggestions = useMemo(
  () => [
    "comment tp un joueur",
    "comment bannir un joueur",
    "à quoi sert absence staff",
    "c'est quoi mail accès",
    "où voir les règles staff",
    "à quoi sert deban non autorisé",
  ],
  []
);

  function sendQuestion(customText?: string) {
    const text = (customText ?? input).trim();
    if (!text) return;

    const result = getBestAnswer(text);

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "bot", text: result.text },
    ]);

    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-yellow-400/30 bg-[linear-gradient(135deg,#fde047,#facc15,#f59e0b)] text-black shadow-[0_12px_30px_rgba(250,204,21,0.30)] transition hover:scale-105"
        >
          <MessageCircle className="h-6 w-6 transition group-hover:scale-110" />
        </button>
      ) : (
        <div className="w-[360px] overflow-hidden rounded-[28px] border border-yellow-400/20 bg-[#0b0b0b]/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(255,255,255,0.03),rgba(0,0,0,0.05))] px-4 py-4">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-yellow-300/10 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                  <Bot className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Assistant Staff</p>
                  <p className="mt-1 text-xs text-white/60">
                    Recherche rapide dans les commandes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[380px] min-h-[300px] space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-[0_6px_20px_rgba(0,0,0,0.18)] ${
                    message.role === "user"
                      ? "bg-yellow-400 text-black"
                      : "border border-white/10 bg-white/[0.04] text-white/85"
                  }`}
                >
                  {message.text.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-1">
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
                Suggestions rapides
              </p>

              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendQuestion(suggestion)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:border-yellow-400/20 hover:bg-yellow-400/10 hover:text-yellow-200"
                  >
                    <Sparkles className="h-3 w-3" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/50">
              <Search className="h-3.5 w-3.5" />
              Exemple : comment faire la commande TP ?
            </div>

            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendQuestion();
                }}
                placeholder="Pose ta question..."
                className="h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/30 focus:bg-black/40"
              />

              <button
                type="button"
                onClick={() => sendQuestion()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fde047,#facc15,#f59e0b)] text-black shadow-[0_10px_24px_rgba(250,204,21,0.24)] transition hover:scale-[1.03]"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => sendQuestion("comment tp un joueur")}
              className="mt-3 inline-flex items-center gap-2 text-xs text-yellow-300/85 transition hover:text-yellow-200"
            >
              Tester une question
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
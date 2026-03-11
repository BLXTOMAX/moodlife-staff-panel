"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const faq = [
  {
    keywords: ["tp", "teleport", "goto"],
    answer: "Pour vous téléporter vers un joueur utilisez : /goto ID",
  },
  {
    keywords: ["bring", "ramener"],
    answer: "Pour ramener un joueur à vous utilisez : /bring ID",
  },
  {
    keywords: ["revive"],
    answer: "Pour réanimer un joueur utilisez : /revive ID",
  },
  {
    keywords: ["heal"],
    answer: "Pour soigner un joueur utilisez : /heal ID",
  },
  {
    keywords: ["ban"],
    answer: "Pour bannir un joueur : /ban ID Temps Raison",
  },
  {
    keywords: ["prison", "jail"],
    answer: "Pour mettre un joueur en prison : /prison ID Temps Raison",
  },
];

function getAnswer(question: string) {
  const q = question.toLowerCase();

  for (const item of faq) {
    if (item.keywords.some((k) => q.includes(k))) {
      return item.answer;
    }
  }

  return "Je n’ai pas trouvé la réponse dans la FAQ staff.";
}

export default function StaffFaqBot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);

  function handleAsk() {
    if (!question.trim()) return;

    const answer = getAnswer(question);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "bot", text: answer },
    ]);

    setQuestion("");
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-black shadow-lg hover:scale-105 transition"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="w-80 rounded-2xl border border-yellow-400/20 bg-[#0f0f0f] shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="font-semibold text-white">Assistant Staff</p>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4 text-white/70" />
            </button>
          </div>

          <div className="h-60 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm ${
                  msg.role === "user"
                    ? "text-right text-yellow-300"
                    : "text-white/80"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Pose ta question..."
              className="flex-1 rounded-lg bg-black/40 px-3 py-2 text-sm text-white outline-none"
            />

            <button
              onClick={handleAsk}
              className="rounded-lg bg-yellow-400 p-2 text-black"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
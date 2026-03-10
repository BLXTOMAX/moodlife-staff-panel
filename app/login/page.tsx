"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      alert("Remplis tous les champs");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const result = await response.json();

console.log("LOGIN STATUS", response.status);
console.log("LOGIN RESULT", result);

if (!response.ok || !result?.success) {
  alert(result?.message || "Identifiants invalides.");
  return;
}

localStorage.setItem("moodlife-session-email", normalizedEmail);
localStorage.removeItem("moodlife-email");

console.log(
  "STORED EMAIL",
  localStorage.getItem("moodlife-session-email")
);

window.location.href = "/dashboard/info";
    } catch (error) {
      console.error("Erreur login :", error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.10),transparent_55%)]" />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-yellow-300/10 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[28px] border border-yellow-400/15 bg-[#0b0b0b]/90 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
            Connexion
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
            Connexion MoodLife
          </h1>
          <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Adresse mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-yellow-400/15 bg-black/50 px-4 py-4 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/35"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-yellow-400/15 bg-black/50 px-4 py-4 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/35"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-yellow-400 px-4 py-4 font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
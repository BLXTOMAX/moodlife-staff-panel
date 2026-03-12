"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

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

      if (!response.ok || !result?.success) {
        alert(result?.message || "Identifiants invalides.");
        return;
      }

      localStorage.setItem("moodlife-session-email", normalizedEmail);
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

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.20),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,200,0,0.10),transparent_50%)]" />

      <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-500/10 blur-[120px]" />
      <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-yellow-300/10 blur-[120px]" />

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md rounded-[32px] border border-yellow-400/20 bg-[#0b0b0b]/85 p-10 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-300">
            Panel Staff
          </p>

          <h1 className="mt-4 text-4xl font-black text-white">
            Connexion MoodLife
          </h1>

          <p className="mt-2 text-sm text-white/60">
            Accès sécurisé au panel staff
          </p>

          <div className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />

            <input
              type="email"
              placeholder="Adresse mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-yellow-400/20 bg-black/60 py-4 pl-11 pr-4 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/40"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-yellow-400/20 bg-black/60 py-4 pl-11 pr-4 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/40"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#fde047,#facc15,#f59e0b)] py-4 font-bold text-black shadow-[0_12px_30px_rgba(250,204,21,0.30)] transition hover:scale-[1.02] disabled:opacity-70"
          >
            <span className="relative z-10">
              {loading ? "Connexion..." : "Se connecter"}
            </span>

            <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[linear-gradient(135deg,#facc15,#fde047,#fbbf24)]" />
          </button>

        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center text-xs text-white/40">
          MoodLife RP • Panel Staff sécurisé
        </div>

      </div>
    </main>
  );
}
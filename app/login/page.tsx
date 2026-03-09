"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_STORAGE_KEY = "moodlife-session-email";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      alert("Merci de remplir tous les champs");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data?.message || "Erreur lors de la connexion.");
        return;
      }

      localStorage.setItem(SESSION_STORAGE_KEY, normalizedEmail);
      router.push("/dashboard/info");
    } catch (error) {
      console.error("Erreur connexion :", error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <form onSubmit={handleLogin} className="flex w-[320px] flex-col gap-4">
        <h1 className="text-center text-2xl font-bold">Connexion MoodLife</h1>

        <input
          type="email"
          placeholder="Adresse mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl bg-black/40 p-3"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl bg-black/40 p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-yellow-400 p-3 font-bold text-black disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
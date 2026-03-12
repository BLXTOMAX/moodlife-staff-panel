"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Lien invalide ou manquant.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Erreur.");
        return;
      }

      setMessage("Mot de passe modifié avec succès. Redirection...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("reset password error:", error);
      setMessage("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 rounded-3xl border border-yellow-400/20 bg-white/5 p-6"
    >
      <h1 className="text-2xl font-black">Nouveau mot de passe</h1>

      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
      />

      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-yellow-400 px-4 py-3 font-bold text-black"
      >
        {loading ? "Validation..." : "Changer le mot de passe"}
      </button>

      {message && <p className="text-sm text-white/80">{message}</p>}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-3xl border border-yellow-400/20 bg-white/5 p-6 text-center text-white/80">
            Chargement...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}